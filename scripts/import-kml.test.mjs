import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseKml, parseDate, toRow } from './import-kml.mjs';

const kml = `<?xml version="1.0"?><kml><Document>
<Placemark><name>12/09/2025</name><Point><coordinates>-79.9301,0.8421,0</coordinates></Point></Placemark>
<Placemark><name>Nido 3</name><TimeStamp><when>2025-10-01T22:10:00Z</when></TimeStamp>
  <Point><coordinates> -79.9250, 0.8460 </coordinates></Point></Placemark>
<Placemark><name>Ruta</name><LineString><coordinates>-79.9,0.8 -79.8,0.9</coordinates></LineString></Placemark>
</Document></kml>`;

test('parses point placemarks, skips lines', () => {
  const p = parseKml(kml);
  assert.equal(p.length, 2);
  assert.deepEqual(p[0], { name: '12/09/2025', when: null, lat: 0.8421, lng: -79.9301 });
  assert.equal(p[1].when, '2025-10-01T22:10:00Z');
});

test('parseDate reads dd/mm/yyyy names and ISO timestamps', () => {
  assert.equal(parseDate('12/09/2025', null)?.toISOString().slice(0, 10), '2025-09-12');
  assert.equal(parseDate('Nido 3', '2025-10-01T22:10:00Z')?.toISOString(), '2025-10-01T22:10:00.000Z');
  assert.equal(parseDate('sin fecha', null), null);
});

test('toRow is deterministic and locks location', () => {
  const now = new Date('2026-11-25T00:00:00Z');
  const a = toRow(parseKml(kml)[0], now);
  const b = toRow(parseKml(kml)[0], now);
  assert.equal(a.id, b.id);
  assert.match(a.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.equal(a.location_locked, true);
  assert.equal(a.status, 'eclosionado'); // más de 60 días
});
