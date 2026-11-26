import { ArrowRight, Footprints, HandHeart, MapPin, Siren } from 'lucide-react';
import { WHATSAPP_URL } from '@retosame/shared';
import { Link } from '../lib/nav';

/** Rastro de tortuga en la arena: marcas de aletas alternadas a ambos lados de la línea del plastrón. */
function Tracks() {
  return (
    <svg className="tracks" aria-hidden viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="flip" width="60" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <path d="M6 8 q10 -6 20 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M34 26 q10 -6 20 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M30 0 v34" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 6" />
        </pattern>
      </defs>
      <rect x="180" y="-200" width="70" height="900" fill="url(#flip)" transform="rotate(28 200 200)" />
      <rect x="300" y="-200" width="70" height="900" fill="url(#flip)" transform="rotate(28 200 200)" opacity="0.6" />
    </svg>
  );
}

export default function Home() {
  const month = new Date().getMonth(); // 0 = enero
  const peak = month >= 7 && month <= 9;

  return (
    <>
      <section className="hero">
        <Tracks />
        <div className="wrap">
          <h1>Conectados con el mar</h1>
          <p>
            En la playa de Same anidan tortugas golfina, verde, laúd, caguama y carey. Aquí sabes dónde no pisar y qué hacer si ves una.
          </p>
          <div className="actions">
            <Link to="/sos" className="btn white big">
              <Siren size={22} aria-hidden /> Vi una tortuga
            </Link>
            <Link to="/mapa" className="btn ghost big">
              <MapPin size={22} aria-hidden /> Zonas de anidación
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap stack">
          <h2 className="rule">{peak ? 'Es temporada de anidación' : 'Temporada de tortugas'}</h2>
          <p className="lead">
            De agosto a octubre es casi seguro ver tortugas llegando a anidar. En los otros meses es más probable ver neonatos caminando
            hacia el mar.
          </p>
          <p>
            Si ves una, no la ilumines ni la rodees. Mantente lejos y en silencio, y avisa al equipo de Reto Same.
          </p>
          <div>
            <Link to="/sos">
              Ver el protocolo paso a paso <ArrowRight size={16} style={{ verticalAlign: '-3px' }} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="wrap stack">
          <h2 className="rule">Cuida la playa</h2>
          <ul className="rules">
            <li>
              <Footprints size={28} aria-hidden />
              <div>
                <h3>Respeta las zonas marcadas</h3>
                <p className="dim">Los nidos están bajo la arena. Camina por la orilla húmeda y no muevas las estacas.</p>
              </div>
            </li>
            <li>
              <MapPin size={28} aria-hidden />
              <div>
                <h3>Reporta lo que veas</h3>
                <p className="dim">
                  Una foto y tu ubicación ayudan al equipo a llegar a tiempo. <Link to="/reportar">Reportar ahora</Link>
                </p>
              </div>
            </li>
          </ul>
          <div>
            <Link to="/playa">
              Todas las buenas prácticas <ArrowRight size={16} style={{ verticalAlign: '-3px' }} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap stack">
          <h2 className="rule">Súmate al Reto</h2>
          <p className="lead">
            Desde 2020, voluntarios de Same protegen cada nido hasta que los neonatos llegan al mar. Puedes ser voluntario, apadrinar un nido o
            donar.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a className="btn" href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hola, quiero sumarme al Reto Same')}`}>
              <HandHeart size={20} aria-hidden /> Quiero ayudar
            </a>
            <a className="btn ghost" href="https://instagram.com/reto.same">
              Síguenos en Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
