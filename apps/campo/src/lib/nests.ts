import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { supabase, type Nest } from './supabase';

/** Lista de nidos con caché: sin señal se muestra lo último que se descargó. */
export function useNests(scope: 'mine' | 'pending' | 'all', uid?: string) {
  const key = `retosame.nests.${scope}`;
  const [nests, setNests] = useState<Nest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  const reload = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    let q = supabase.from('nests').select('*').order('laid_at', { ascending: false }).limit(300);
    if (scope === 'mine') q = q.eq('created_by', uid);
    if (scope === 'pending') q = q.eq('status', 'pendiente');
    const { data, error } = await q;
    if (!error && data) {
      setNests(data as Nest[]);
      setStale(false);
      AsyncStorage.setItem(key, JSON.stringify(data));
    } else setStale(true);
    setLoading(false);
  }, [key, scope, uid]);

  useEffect(() => {
    AsyncStorage.getItem(key).then((raw) => raw && setNests(JSON.parse(raw)));
    reload();
  }, [key, reload]);

  return { nests, loading, stale, reload };
}

export const SECTOR_NAMES: Record<string, string> = {
  'same-sur': 'Same Sur',
  'same-centro': 'Same Centro',
  'same-norte': 'Same Norte',
};
export const sectorName = (id: string | null) => (id ? SECTOR_NAMES[id] ?? id : 'Fuera de sector');
