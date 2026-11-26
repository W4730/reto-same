import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hatchWindow, seasonOf, effectiveStatus, nestCodePrefix } from './nest.ts';

const d = (s: string) => new Date(s + 'T12:00:00Z');
const iso = (x: Date) => x.toISOString().slice(0, 10);

test('hatchWindow is 45-60 days with 53 ref', () => {
  const w = hatchWindow(d('2026-11-01'));
  assert.equal(iso(w.from), '2026-12-16');
  assert.equal(iso(w.to), '2026-12-31');
  assert.equal(iso(w.ref), '2026-12-24');
});

test('season starts July 1', () => {
  assert.equal(seasonOf(d('2026-06-30')), '2025-2026');
  assert.equal(seasonOf(d('2026-07-01')), '2026-2027');
  assert.equal(nestCodePrefix('2026-2027'), 'S26');
});

test('effectiveStatus promotes activo inside window', () => {
  const now = d('2026-12-20');
  assert.equal(effectiveStatus({ status: 'activo', hatch_from: '2026-12-16T00:00:00Z' }, now), 'por_eclosionar');
  assert.equal(effectiveStatus({ status: 'activo', hatch_from: '2027-01-16T00:00:00Z' }, now), 'activo');
  assert.equal(effectiveStatus({ status: 'pendiente', hatch_from: '2026-12-16T00:00:00Z' }, now), 'pendiente');
  assert.equal(effectiveStatus({ status: 'eclosionado', hatch_from: '2026-12-16T00:00:00Z' }, now), 'eclosionado');
});
