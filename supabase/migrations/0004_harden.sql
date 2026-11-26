-- Avisos del linter de seguridad de Supabase.
-- Las funciones de trigger no deben poder llamarse por /rpc (los triggers no necesitan EXECUTE del usuario).
revoke execute on function public.handle_new_user(), public.nests_before_insert(), public.nests_before_update()
  from public, anon, authenticated;
-- is_coordinator la usan las políticas RLS de usuarios con sesión: se mantiene para authenticated.
revoke execute on function public.is_coordinator() from public, anon;
grant execute on function public.is_coordinator() to authenticated;
alter function public.season_of(timestamptz) set search_path = '';
-- season_counters solo la escribe el trigger (security definer): sin políticas = nadie más la toca. Intencional.
comment on table public.season_counters is 'Contador de códigos por temporada. Solo el trigger nests_before_insert escribe aquí.';
-- public_sectors/public_nests/public_stats son públicas a propósito (mapa abierto, ver 0003).
