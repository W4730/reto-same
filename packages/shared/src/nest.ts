export type NestStatus = 'pendiente' | 'activo' | 'por_eclosionar' | 'eclosionado' | 'perdido';
export type Species = 'golfina' | 'verde' | 'laud' | 'caguama' | 'carey';

export const HATCH_MIN_DAYS = 45;
export const HATCH_REF_DAYS = 53; // referencia en Same
export const HATCH_MAX_DAYS = 60;

const DAY = 86_400_000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

export function hatchWindow(laidAt: Date) {
  return { from: addDays(laidAt, HATCH_MIN_DAYS), ref: addDays(laidAt, HATCH_REF_DAYS), to: addDays(laidAt, HATCH_MAX_DAYS) };
}

/** Temporada de anidación: 1 de julio a 30 de junio. */
export function seasonOf(d: Date): string {
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() >= 6 ? y : y - 1;
  return `${start}-${start + 1}`;
}

export const nestCodePrefix = (season: string) => `S${season.slice(2, 4)}`;

/** `por_eclosionar` se deriva al leer: no hace falta un cron. */
export function effectiveStatus(n: { status: NestStatus; hatch_from: string | null }, now = new Date()): NestStatus {
  if (n.status === 'activo' && n.hatch_from && new Date(n.hatch_from) <= now) return 'por_eclosionar';
  return n.status;
}

export const STATUS_META: Record<NestStatus, { label: string; color: string; shape: 'dashed' | 'filled' | 'ring' | 'check' | 'cross' }> = {
  pendiente:      { label: 'Pendiente de validar', color: '#7C9BBD', shape: 'dashed' },
  activo:         { label: 'Activo',               color: '#1796A6', shape: 'filled' },
  por_eclosionar: { label: 'Próximo a eclosionar', color: '#E0A100', shape: 'ring' },
  eclosionado:    { label: 'Eclosionado',          color: '#194171', shape: 'check' },
  perdido:        { label: 'Perdido',              color: '#4A5A6A', shape: 'cross' },
};

export const SPECIES: Record<Species, { name: string; note: string }> = {
  golfina: { name: 'Golfina',  note: 'La más común en Same' },
  verde:   { name: 'Verde',    note: '' },
  laud:    { name: 'Laúd',     note: 'En peligro crítico' },
  caguama: { name: 'Caguama',  note: '' },
  carey:   { name: 'Carey',    note: 'En peligro crítico' },
};

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
