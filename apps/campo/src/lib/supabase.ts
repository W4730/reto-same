import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { NestStatus } from '@retosame/shared';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const configured = Boolean(url && key);

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', key ?? 'placeholder', {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

export type Nest = {
  id: string;
  code: string | null;
  lat: number;
  lng: number;
  gps_accuracy_m: number | null;
  laid_at: string;
  hatch_from: string | null;
  hatch_to: string | null;
  species: string | null;
  track_width_cm: number | null;
  notes: string;
  photo_path: string | null;
  status: NestStatus;
  location_locked: boolean;
  sector_id: string | null;
  season: string | null;
  created_by: string | null;
  created_at: string;
};

export async function photoUrl(path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from('nests').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
