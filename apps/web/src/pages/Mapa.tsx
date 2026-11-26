import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';
import { EyeOff, WifiOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { configured, supabase, type PublicSector } from '../lib/supabase';

const CACHE = 'retosame.public_sectors';
const SAME: [number, number] = [-79.929, 0.842];

// Intensidad por cantidad de nidos activos. Turquesa de marca → Azul Reto.
const fill = (n: number) => (n === 0 ? '#D2E7F0' : n < 5 ? '#7FC9D1' : n < 15 ? '#1796A6' : '#194171');

function readCache(): PublicSector[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE) ?? '[]');
  } catch {
    return [];
  }
}

export default function Mapa() {
  const el = useRef<HTMLDivElement>(null);
  const [sectors, setSectors] = useState<PublicSector[]>(readCache);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!configured) return setOffline(true);
    supabase.rpc('public_sectors').then(({ data, error }) => {
      if (error || !data) return setOffline(true);
      setSectors(data as PublicSector[]);
      try {
        localStorage.setItem(CACHE, JSON.stringify(data));
      } catch {
        /* sin almacenamiento: solo se pierde la caché */
      }
    });
  }, []);

  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: SAME,
      zoom: 13.2,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      map.addSource('sectors', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: sectors.map((s) => ({
            type: 'Feature',
            geometry: s.geojson,
            properties: { name: s.name, n: s.active_nests, color: fill(s.active_nests) },
          })),
        },
      });
      map.addLayer({ id: 'sec-fill', type: 'fill', source: 'sectors', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.55 } });
      map.addLayer({ id: 'sec-line', type: 'line', source: 'sectors', paint: { 'line-color': '#194171', 'line-width': 1.5 } });
      map.addLayer({
        id: 'sec-label',
        type: 'symbol',
        source: 'sectors',
        layout: { 'text-field': ['concat', ['get', 'name'], '\n', ['to-string', ['get', 'n']], ' nidos'], 'text-size': 13 },
        paint: { 'text-color': '#1E3A52', 'text-halo-color': '#fff', 'text-halo-width': 1.5 },
      });
    });
    return () => map.remove();
  }, [sectors]);

  const total = sectors.reduce((a, s) => a + s.active_nests, 0);

  return (
    <section>
      <div className="wrap stack">
        <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)' }} className="rule">
          Zonas de anidación
        </h1>
        <p className="lead">
          {sectors.length ? `${total} nidos activos en la playa de Same. Pisa por la orilla húmeda en los sectores con más nidos.` : 'Cargando sectores…'}
        </p>
        {offline && (
          <div className="note warn">
            <WifiOff size={20} aria-hidden />
            <p>{sectors.length ? 'Sin conexión: mostramos los últimos datos guardados.' : 'Sin conexión. Vuelve a abrir el mapa cuando tengas señal.'}</p>
          </div>
        )}
        <div ref={el} className="map" role="img" aria-label="Mapa de sectores de la playa de Same con la cantidad de nidos activos" />
        <ul className="sectors">
          {sectors.map((s) => (
            <li key={s.id}>
              <span className="swatch" style={{ background: fill(s.active_nests) }} aria-hidden />
              <div>
                <strong>{s.name}</strong>
                <div className="dim small">
                  {s.hatching_soon ? `${s.hatching_soon} por eclosionar · ` : ''}
                  {s.hatched_this_season} eclosionados esta temporada
                </div>
              </div>
              <span className="count" aria-label={`${s.active_nests} nidos activos`}>
                {s.active_nests}
              </span>
            </li>
          ))}
        </ul>
        <div className="note">
          <EyeOff size={20} aria-hidden />
          <p className="small">
            Por seguridad mostramos sectores, no la ubicación exacta de cada nido activo. Así los protegemos del saqueo. Los sectores son
            provisionales.
          </p>
        </div>
      </div>
    </section>
  );
}
