import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enqueue, pending, flush, type QueueDeps, type NestDraft } from './queue.ts';

function memStorage() {
  const m = new Map<string, string>();
  return { getItem: async (k: string) => m.get(k) ?? null, setItem: async (k: string, v: string) => void m.set(k, v) };
}
const draft = (id: string): NestDraft => ({
  id, lat: 0.84, lng: -79.92, gps_accuracy_m: 4, laid_at: '2026-11-25T03:00:00Z',
  species: null, track_width_cm: null, notes: '', localPhotoUri: `file:///p/${id}.jpg`,
});

test('queue persists across reads', async () => {
  const storage = memStorage();
  await enqueue(storage, draft('a'));
  await enqueue(storage, draft('b'));
  assert.equal((await pending(storage)).length, 2);
  await enqueue(storage, draft('a')); // mismo id no se duplica
  assert.equal((await pending(storage)).length, 2);
});

test('flush keeps failures and retries with the same id', async () => {
  const storage = memStorage();
  await enqueue(storage, draft('a'));
  await enqueue(storage, draft('b'));
  const inserted: string[] = [];
  let failB = true;
  const deps: QueueDeps = {
    storage,
    uploadPhoto: async (id) => `${id}.jpg`,
    insertNest: async (row) => { if (row.id === 'b' && failB) throw new Error('sin señal'); inserted.push(row.id); },
    deleteLocal: async () => {},
  };
  assert.deepEqual(await flush(deps), { sent: 1, failed: 1 });
  assert.deepEqual((await pending(storage)).map((d) => d.id), ['b']);
  failB = false;
  assert.deepEqual(await flush(deps), { sent: 1, failed: 0 });
  assert.deepEqual(inserted, ['a', 'b']);
  assert.equal((await pending(storage)).length, 0);
});

test('concurrent flush calls send each nest once', async () => {
  const storage = memStorage();
  await enqueue(storage, draft('a'));
  let inserts = 0;
  const deps: QueueDeps = {
    storage,
    uploadPhoto: async (id) => { await new Promise((r) => setTimeout(r, 20)); return `${id}.jpg`; },
    insertNest: async () => { inserts++; },
    deleteLocal: async () => {},
  };
  // Guardar dispara un envío y la red vuelve al mismo tiempo: dos llamadas casi simultáneas.
  await Promise.all([flush(deps), flush(deps)]);
  assert.equal(inserts, 1);
});

test('insert row carries photo path and no local uri', async () => {
  const storage = memStorage();
  await enqueue(storage, draft('c'));
  let row: Record<string, unknown> = {};
  await flush({ storage, uploadPhoto: async (id) => `${id}.jpg`, insertNest: async (r) => { row = r; }, deleteLocal: async () => {} });
  assert.equal(row.photo_path, 'c.jpg');
  assert.equal('localPhotoUri' in row, false);
});
