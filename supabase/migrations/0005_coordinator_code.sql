-- Registro de coordinadores con código predefinido (lo reparten los coordinadores actuales).
-- El código nunca vive en la app ni en git: aquí solo se guarda su hash bcrypt, en un esquema
-- que la API (PostgREST) no expone. Para fijar o cambiar el código, en el SQL Editor:
--   insert into private.settings (key, value)
--   values ('coordinator_code', extensions.crypt('EL-CODIGO', extensions.gen_salt('bf')))
--   on conflict (key) do update set value = excluded.value;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.settings (
  key text primary key,
  value text not null
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  code text := new.raw_user_meta_data->>'admin_code';
  hash text;
  r public.user_role := 'voluntario';
begin
  if code is not null then
    select value into hash from private.settings where key = 'coordinator_code';
    if hash is null or extensions.crypt(code, hash) <> hash then
      -- Rechaza el registro completo: la app muestra "código incorrecto".
      raise exception 'codigo_coordinador_invalido' using errcode = 'P0001';
    end if;
    r := 'coordinador';
    -- No dejar el código en texto plano en los metadatos del usuario.
    update auth.users set raw_user_meta_data = raw_user_meta_data - 'admin_code' where id = new.id;
  end if;

  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), r);
  return new;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
