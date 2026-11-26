-- Decisión de Reto Same (25 nov 2026): el mapa público es abierto.
-- Ocultar coordenadas no les preocupa y un objetivo de la investigación es ver la concentración de nidos,
-- así que public_nests devuelve la ubicación exacta de todos los nidos ya validados (no los pendientes).
-- Para volver a la regla restrictiva: cambiar el WHERE a status in ('eclosionado','perdido').
create or replace function public.public_nests()
returns table (id uuid, lat double precision, lng double precision, sector_id text, species public.species,
               status public.nest_status, laid_at timestamptz, hatched_at timestamptz, season text)
language sql stable security definer set search_path = '' as $$
  select id, lat, lng, sector_id, species,
    case when status = 'activo' and hatch_from <= now() then 'por_eclosionar'::public.nest_status else status end,
    laid_at, hatched_at, season
  from public.nests
  where status <> 'pendiente'
$$;
