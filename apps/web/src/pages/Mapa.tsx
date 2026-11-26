import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';
import { STATUS_META, type NestStatus } from '@retosame/shared';
import { Flame, MapPin, WifiOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { configured, supabase, type PublicNest, type PublicSector } from '../lib/supabase';

const SAME: [number, number] = [-79.929, 0.842];
type View = 'calor' | 'nidos';

function cached<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* sin almacenamiento: solo se pierde la caché offline */
  }
}

export default function Mapa() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [sectors, setSectors] = useState<PublicSector[]>(() => cached('retosame.sectors'));
  const [nests, setNests] = useState<PublicNest[]>(() => cached('retosame.nests'));
  const [offline, setOffline] = useState(false);
  const [view, setView] = useState<View>('calor');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!configured) return setOffline(true);
    Promise.all([supabase.rpc('public_sectors'), supabase.rpc('public_nests')]).then(([s, n]) => {
      if (s.error || n.error) return setOffline(true);
      setSectors(s.data as PublicSector[]);
      setNests(n.data as PublicNest[]);
      save('retosame.sectors', s.data);
      save('retosame.nests', n.data);
    });
  }, []);

  // El mapa se crea una sola vez; los datos se actualizan aparte.
  useEffect(() => {
    if (!el.current) return;
    const m = new maplibregl.Map({
      container: el.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: SAME,
      zoom: 13.3,
      attributionControl: { compact: true },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.on('load', () => {
      m.addSource('sectors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('nests', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({ id: 'sec-line', type: 'line', source: 'sectors', paint: { 'line-color': '#194171', 'line-width': 1.5, 'line-dasharray': [2, 2] } });
      m.addLayer({
        id: 'heat',
        type: 'heatmap',
        source: 'nests',
        paint: {
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 12, 14, 17, 40],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 17, 2],
          'heatmap-opacity': 0.85,
          // Turquesa de marca → Azul Reto → ámbar en la mayor concentración.
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(33,168,180,0)', 0.2, '#9ED9DF', 0.45, '#1796A6', 0.7, '#194171', 1, '#E0A100'],
        },
      });
      m.addLayer({
        id: 'pts',
        type: 'circle',
        source: 'nests',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 18, 9],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
        },
      });
      m.addLayer({
        id: 'sec-label',
        type: 'symbol',
        source: 'sectors',
        layout: { 'text-field': ['get', 'label'], 'text-size': 12, 'text-font': ['Noto Sans Bold'] },
        paint: { 'text-color': '#1E3A52', 'text-halo-color': '#fff', 'text-halo-width': 1.5 },
      });
      m.on('click', 'pts', (e) => {
        const p = e.features?.[0]?.properties;
        if (!p) return;
        new maplibregl.Popup({ closeButton: false })
          .setLngLat(e.lngLat)
          .setText(`${p.label} · ${new Date(p.laid_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}`)
          .addTo(m);
      });
      setReady(true);
    });
    map.current = m;
    return () => m.remove();
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    (m.getSource('sectors') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: sectors.map((s) => ({ type: 'Feature', geometry: s.geojson, properties: { label: `${s.name.split(' · ')[0]}\n${s.active_nests} activos` } })),
    });
    (m.getSource('nests') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: nests.map((n) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
        properties: { color: STATUS_META[n.status].color, label: STATUS_META[n.status].label, laid_at: n.laid_at },
      })),
    });
  }, [ready, sectors, nests]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    m.setLayoutProperty('heat', 'visibility', view === 'calor' ? 'visible' : 'none');
    m.setLayoutProperty('pts', 'visibility', view === 'nidos' ? 'visible' : 'none');
  }, [ready, view]);

  const active = nests.filter((n) => n.status === 'activo' || n.status === 'por_eclosionar').length;
  const counts = nests.reduce<Partial<Record<NestStatus, number>>>((a, n) => ({ ...a, [n.status]: (a[n.status] ?? 0) + 1 }), {});

  return (
    <section>
      <div className="wrap stack">
        <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)' }} className="rule">
          Mapa de nidos
        </h1>
        <p className="lead">
          {nests.length
            ? `${nests.length} nidos registrados, ${active} activos ahora. Camina por la orilla húmeda donde la concentración es alta.`
            : offline
              ? 'Sin datos todavía.'
              : 'Todavía no hay nidos validados esta temporada.'}
        </p>
        {offline && (
          <div className="note warn">
            <WifiOff size={20} aria-hidden />
            <p>{nests.length ? 'Sin conexión: mostramos los últimos datos guardados.' : 'Sin conexión. Vuelve a abrir el mapa cuando tengas señal.'}</p>
          </div>
        )}

        <div className="seg" role="tablist" aria-label="Vista del mapa">
          <button role="tab" aria-selected={view === 'calor'} onClick={() => setView('calor')}>
            <Flame size={18} aria-hidden /> Concentración
          </button>
          <button role="tab" aria-selected={view === 'nidos'} onClick={() => setView('nidos')}>
            <MapPin size={18} aria-hidden /> Cada nido
          </button>
        </div>

        <div ref={el} className="map" role="img" aria-label="Mapa de la playa de Same con la ubicación y concentración de nidos de tortuga" />

        {view === 'nidos' && (
          <ul className="legend" aria-label="Estados del nido">
            {(Object.keys(STATUS_META) as NestStatus[])
              .filter((k) => k !== 'pendiente')
              .map((k) => (
                <li key={k}>
                  <span className="dot" style={{ background: STATUS_META[k].color }} aria-hidden />
                  {STATUS_META[k].label} <span className="dim">{counts[k] ?? 0}</span>
                </li>
              ))}
          </ul>
        )}

        <h2 className="rule" style={{ marginTop: 16 }}>
          Por sector
        </h2>
        <ul className="sectors">
          {sectors.map((s) => (
            <li key={s.id}>
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
        <p className="small dim">Los sectores son provisionales mientras definimos con la fundación cómo divide la playa.</p>
      </div>
    </section>
  );
}
