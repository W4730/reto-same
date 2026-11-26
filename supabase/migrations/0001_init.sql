-- Reto Same · esquema inicial
-- Reglas clave: nidos privados, ubicación bloqueada tras validar,
-- código corto por temporada, sector y ventana de eclosión calculados en la base.

create extension if not exists postgis with schema extensions;

create type public.nest_status as enum ('pendiente','activo','por_eclosionar','eclosionado','perdido');
create type public.species as enum ('golfina','verde','laud','caguama','carey');
create type public.user_role as enum ('voluntario','coordinador','admin');

-- ── Perfiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  role public.user_role not null default 'voluntario',
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_coordinator() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('coordinador','admin'))
$$;

-- ── Sectores ───────────────────────────────────────────────────────────────
create table public.sectors (
  id text primary key,
  name text not null,
  sort int not null default 0,
  geom extensions.geometry(Polygon, 4326) not null
);

-- ── Nidos (privada) ────────────────────────────────────────────────────────
create table public.season_counters (season text primary key, last int not null default 0);

create table public.nests (
  id uuid primary key,                       -- generado en el teléfono: reintentos no duplican
  code text unique,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  gps_accuracy_m real,
  laid_at timestamptz not null,
  hatch_from timestamptz,
  hatch_to timestamptz,
  species public.species,
  track_width_cm real check (track_width_cm is null or track_width_cm between 10 and 250),
  notes text not null default '' check (length(notes) <= 1000),
  photo_path text,
  status public.nest_status not null default 'pendiente',
  location_locked boolean not null default false,
  sector_id text references public.sectors on delete set null,
  season text,
  hatched_at timestamptz,
  created_by uuid references auth.users default auth.uid(),
  validated_by uuid references auth.users,
  created_at timestamptz not null default now(),
  validated_at timestamptz
);
create index nests_status_idx on public.nests (status);
create index nests_season_idx on public.nests (season);

create function public.season_of(t timestamptz) returns text
language sql immutable as $$
  select (y - (m < 7)::int)::text || '-' || (y - (m < 7)::int + 1)::text
  from (select extract(year from t at time zone 'America/Guayaquil')::int as y,
               extract(month from t at time zone 'America/Guayaquil')::int as m) s
$$;

create function public.sector_at(p_lat double precision, p_lng double precision) returns text
language sql stable set search_path = '' as $$
  select id from public.sectors
  where extensions.st_contains(geom, extensions.st_setsrid(extensions.st_point(p_lng, p_lat), 4326))
  order by sort limit 1
$$;

create function public.nests_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  -- Un reintento del teléfono choca con la PK: no consumir número de código.
  if exists (select 1 from public.nests where id = new.id) then return new; end if;

  new.season := public.season_of(new.laid_at);
  insert into public.season_counters as c (season, last) values (new.season, 1)
    on conflict (season) do update set last = c.last + 1
    returning last into n;
  new.code := 'S' || substr(new.season, 3, 2) || '-' || lpad(n::text, 4, '0');
  new.hatch_from := new.laid_at + interval '45 days';
  new.hatch_to   := new.laid_at + interval '60 days';
  new.sector_id  := public.sector_at(new.lat, new.lng);

  -- Un voluntario siempre crea en "pendiente". Coordinador e importación (service role) pueden fijar estado.
  if auth.uid() is not null and not public.is_coordinator() then
    new.status := 'pendiente';
    new.location_locked := false;
    new.validated_by := null;
    new.validated_at := null;
    new.created_by := auth.uid();
  end if;
  return new;
end $$;

create trigger nests_before_insert before insert on public.nests
  for each row execute function public.nests_before_insert();

create function public.nests_before_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.location_locked and (new.lat is distinct from old.lat or new.lng is distinct from old.lng) then
    raise exception 'La ubicación de un nido validado no se puede mover' using errcode = 'P0001';
  end if;
  if old.location_locked then new.location_locked := true; end if;   -- no se puede desbloquear

  if new.lat is distinct from old.lat or new.lng is distinct from old.lng then
    new.sector_id := public.sector_at(new.lat, new.lng);
  end if;
  if new.laid_at is distinct from old.laid_at then
    new.hatch_from := new.laid_at + interval '45 days';
    new.hatch_to   := new.laid_at + interval '60 days';
  end if;

  -- Validar = salir de "pendiente": queda bloqueado y firmado.
  if old.status = 'pendiente' and new.status <> 'pendiente' then
    new.location_locked := true;
    new.validated_by := coalesce(auth.uid(), new.validated_by);
    new.validated_at := now();
  end if;
  if new.status = 'eclosionado' and old.status <> 'eclosionado' and new.hatched_at is null then
    new.hatched_at := now();
  end if;

  new.code := old.code; new.season := old.season; new.created_by := old.created_by;
  return new;
end $$;

create trigger nests_before_update before update on public.nests
  for each row execute function public.nests_before_update();

-- ── Avistamientos de turistas ──────────────────────────────────────────────
create table public.sightings (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('anidando','neonatos','varada','otro')),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  accuracy_m real,
  photo_path text check (photo_path is null or photo_path ~ '^[0-9a-f-]{36}\.jpg$'),
  notes text not null default '' check (length(notes) <= 500),
  contact text check (contact is null or length(contact) <= 100),
  created_at timestamptz not null default now(),
  handled_by uuid references auth.users,
  handled_at timestamptz
);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.sectors enable row level security;
alter table public.season_counters enable row level security;
alter table public.nests enable row level security;
alter table public.sightings enable row level security;

create policy "perfiles visibles con sesión" on public.profiles for select to authenticated using (true);
create policy "coordinador asigna roles" on public.profiles for update to authenticated
  using (public.is_coordinator()) with check (public.is_coordinator());

create policy "sectores públicos" on public.sectors for select to anon, authenticated using (true);

create policy "nidos visibles con sesión" on public.nests for select to authenticated using (true);
create policy "voluntario registra nidos" on public.nests for insert to authenticated
  with check (created_by = auth.uid() or public.is_coordinator());
create policy "coordinador edita nidos" on public.nests for update to authenticated
  using (public.is_coordinator()) with check (public.is_coordinator());

create policy "cualquiera reporta" on public.sightings for insert to anon, authenticated
  with check (handled_by is null and handled_at is null);
create policy "coordinador lee reportes" on public.sightings for select to authenticated using (public.is_coordinator());
create policy "coordinador atiende reportes" on public.sightings for update to authenticated
  using (public.is_coordinator()) with check (public.is_coordinator());

-- ── Datos públicos (sin coordenadas de nidos activos) ──────────────────────
create function public.public_sectors()
returns table (id text, name text, geojson json, active_nests int, hatching_soon int, hatched_this_season int)
language sql stable security definer set search_path = '' as $$
  select s.id, s.name, extensions.st_asgeojson(s.geom)::json,
    count(n.id) filter (where n.status = 'activo')::int,
    count(n.id) filter (where n.status in ('activo','por_eclosionar') and n.hatch_from <= now())::int,
    count(n.id) filter (where n.status = 'eclosionado' and n.season = public.season_of(now()))::int
  from public.sectors s
  left join public.nests n on n.sector_id = s.id
  group by s.id order by s.sort
$$;

create function public.public_nests()
returns table (id uuid, lat double precision, lng double precision, sector_id text, species public.species,
               status public.nest_status, laid_at timestamptz, hatched_at timestamptz, season text)
language sql stable security definer set search_path = '' as $$
  select id, lat, lng, sector_id, species, status, laid_at, hatched_at, season
  from public.nests where status in ('eclosionado','perdido')
$$;

create function public.public_stats()
returns table (season text, nests int, hatched int)
language sql stable security definer set search_path = '' as $$
  select season, count(*)::int, count(*) filter (where status = 'eclosionado')::int
  from public.nests where status <> 'pendiente' group by season order by season
$$;

revoke execute on function public.public_sectors(), public.public_nests(), public.public_stats() from public;
grant execute on function public.public_sectors(), public.public_nests(), public.public_stats() to anon, authenticated;

-- ── Storage ────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('nests', 'nests', false, 8388608, array['image/jpeg']),
  ('sightings', 'sightings', false, 5242880, array['image/jpeg','image/png','image/webp','image/heic']);

create policy "fotos de nidos: subir" on storage.objects for insert to authenticated with check (bucket_id = 'nests');
create policy "fotos de nidos: sobrescribir" on storage.objects for update to authenticated using (bucket_id = 'nests');
create policy "fotos de nidos: ver" on storage.objects for select to authenticated using (bucket_id = 'nests');
create policy "fotos de reportes: subir" on storage.objects for insert to anon, authenticated with check (bucket_id = 'sightings');
create policy "fotos de reportes: ver" on storage.objects for select to authenticated
  using (bucket_id = 'sightings' and public.is_coordinator());
