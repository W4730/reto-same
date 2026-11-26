import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

export const configured = Boolean(url && key);
// El turista no inicia sesión: solo lee funciones públicas y crea reportes.
export const supabase = createClient(url ?? 'https://placeholder.supabase.co', key ?? 'placeholder', {
  auth: { persistSession: false },
});

export type PublicSector = {
  id: string;
  name: string;
  geojson: { type: 'Polygon'; coordinates: number[][][] };
  active_nests: number;
  hatching_soon: number;
  hatched_this_season: number;
};
