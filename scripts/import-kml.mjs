// Importa los nidos del mapa de Google Earth (KML) a Supabase.
// Uso:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-kml.mjs nidos.kml
// Es idempotente: el id de cada nido sale de sus coordenadas + nombre, así que correrlo dos veces no duplica.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DAY = 86_400_000;

export function parseKml(xml) {
  const out = [];
  for (const [, body] of xml.matchAll(/<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/g)) {
    const point = body.match(/<Point\b[^>]*>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!point) continue; // líneas, polígonos: no son nidos
    const [lng, lat] = point[1].trim().split(/\s*,\s*/).map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const name = (body.match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const when = body.match(/<when>([\s\S]*?)<\/when>/)?.[1].trim() ?? null;
    out.push({ name, when, lat, lng });
  }
  return out;
}

/** Hoy las etiquetas son fechas completas (dd/mm/aaaa). Si el KML trae <when>, gana ese. */
export function parseDate(name, when) {
  if (when && !Number.isNaN(Date.parse(when))) return new Date(when);
  const m = name.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (!m) return null;
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(Date.UTC(y, Number(m[2]) - 1, Number(m[1]), 5)); // 00:00 en Ecuador
  return Number.isNaN(d.getTime()) ? null : d;
}

function uuidFrom(s) {
  const h = createHash('sha1').update(s).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function toRow(p, now = new Date()) {
  const laid = parseDate(p.name, p.when);
  const past = laid && now.getTime() - laid.getTime() > 60 * DAY;
  return {
    id: uuidFrom(`${p.lat},${p.lng},${p.name}`),
    lat: p.lat,
    lng: p.lng,
    laid_at: (laid ?? now).toISOString(),
    // ponytail: sin fecha no sabemos el estado real; queda pendiente para que el coordinador lo revise.
    status: !laid ? 'pendiente' : past ? 'eclosionado' : 'activo',
    location_locked: Boolean(laid),
    notes: `Importado de Google Earth: ${p.name}`.slice(0, 1000),
  };
}

async function main(file) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!file || !url || !key) {
    console.error('Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-kml.mjs archivo.kml');
    process.exit(1);
  }
  const rows = parseKml(readFileSync(file, 'utf8')).map((p) => toRow(p));
  const noDate = rows.filter((r) => r.status === 'pendiente').length;
  for (let i = 0; i < rows.length; i += 200) {
    const res = await fetch(`${url}/rest/v1/nests?on_conflict=id`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates' },
      body: JSON.stringify(rows.slice(i, i + 200)),
    });
    if (!res.ok) throw new Error(`Supabase respondió ${res.status}: ${await res.text()}`);
  }
  console.log(`${rows.length} nidos importados (${noDate} sin fecha legible quedaron como pendientes).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv[2]).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
