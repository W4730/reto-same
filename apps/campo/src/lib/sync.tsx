import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Directory, File, Paths } from 'expo-file-system';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { enqueue, flush, pending, type NestDraft, type QueueDeps } from './queue';
import { configured, supabase } from './supabase';

/** Fotos esperando subir. Viven en documentos (no en caché) para sobrevivir al cierre de la app. */
export const photoDir = new Directory(Paths.document, 'pendientes');

const deps: QueueDeps = {
  storage: AsyncStorage,
  async uploadPhoto(id, localUri) {
    const path = `${id}.jpg`; // ruta fija por nido: un reintento sobrescribe
    const body = await new File(localUri).arrayBuffer();
    const { error } = await supabase.storage.from('nests').upload(path, body, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    return path;
  },
  async insertNest(row) {
    // ignoreDuplicates: si la fila ya llegó en un intento anterior, no falla ni duplica.
    const { error } = await supabase.from('nests').upsert(row, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
  },
  async deleteLocal(uri) {
    const f = new File(uri);
    if (f.exists) f.delete();
  },
};

type Sync = {
  queue: NestDraft[];
  online: boolean;
  flushing: boolean;
  lastError: string | null;
  flushNow(): Promise<void>;
  add(d: NestDraft): Promise<void>;
};
const Ctx = createContext<Sync>(null as never);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<NestDraft[]>([]);
  const [online, setOnline] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const busy = useRef(false);

  const refresh = useCallback(async () => setQueue(await pending(AsyncStorage)), []);

  const flushNow = useCallback(async () => {
    if (busy.current || !configured) return;
    busy.current = true;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      busy.current = false;
      return;
    }
    setFlushing(true);
    try {
      const r = await flush(deps);
      setLastError(r.failed ? `${r.failed} sin enviar. Se reintenta solo cuando vuelva la señal.` : null);
    } finally {
      busy.current = false;
      setFlushing(false);
      await refresh();
    }
  }, [refresh]);

  const add = useCallback(
    async (d: NestDraft) => {
      await enqueue(AsyncStorage, d);
      await refresh();
      flushNow();
    },
    [refresh, flushNow],
  );

  useEffect(() => {
    refresh();
    const unNet = NetInfo.addEventListener((s) => {
      const on = Boolean(s.isConnected && s.isInternetReachable !== false);
      setOnline(on);
      if (on) flushNow();
    });
    const app = AppState.addEventListener('change', (s) => s === 'active' && flushNow());
    return () => {
      unNet();
      app.remove();
    };
  }, [flushNow, refresh]);

  return <Ctx.Provider value={{ queue, online, flushing, lastError, flushNow, add }}>{children}</Ctx.Provider>;
}

export const useSync = () => useContext(Ctx);
