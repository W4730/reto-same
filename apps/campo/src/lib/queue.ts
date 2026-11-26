// Cola offline de nidos. Sin imports de React Native: se prueba con node --test.
export type NestDraft = {
  id: string;
  lat: number;
  lng: number;
  gps_accuracy_m: number | null;
  laid_at: string;
  species: string | null;
  track_width_cm: number | null;
  notes: string;
  localPhotoUri: string;
};

type KV = { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void> };

export type QueueDeps = {
  storage: KV;
  uploadPhoto(id: string, localUri: string): Promise<string>; // devuelve la ruta en Storage
  insertNest(row: Omit<NestDraft, 'localPhotoUri'> & { photo_path: string }): Promise<void>;
  deleteLocal(localUri: string): Promise<void>;
};

const KEY = 'retosame.queue.v1';

export async function pending(storage: KV): Promise<NestDraft[]> {
  const raw = await storage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function enqueue(storage: KV, draft: NestDraft) {
  const list = (await pending(storage)).filter((d) => d.id !== draft.id);
  await storage.setItem(KEY, JSON.stringify([...list, draft]));
}

async function remove(storage: KV, id: string) {
  await storage.setItem(KEY, JSON.stringify((await pending(storage)).filter((d) => d.id !== id)));
}

/** Envía en orden; lo que falla queda en la cola. Foto primero (upsert por id), luego la fila. */
export async function flush(deps: QueueDeps) {
  let sent = 0, failed = 0;
  for (const d of await pending(deps.storage)) {
    try {
      const photo_path = await deps.uploadPhoto(d.id, d.localPhotoUri);
      const { localPhotoUri, ...row } = d;
      await deps.insertNest({ ...row, photo_path });
      await remove(deps.storage, d.id);
      await deps.deleteLocal(localPhotoUri).catch(() => {});
      sent++;
    } catch {
      failed++;
    }
  }
  return { sent, failed };
}
