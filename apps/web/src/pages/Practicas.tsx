import { BEACH_RULES, type BeachRuleId } from '@retosame/shared';
import { Car, Dog, Flame, Lightbulb, Tent, Trash2, Volume2, type LucideIcon } from 'lucide-react';

const ICON: Record<BeachRuleId, LucideIcon> = { perros: Dog, fogatas: Flame, carpas: Tent, vehiculos: Car, ruido: Volume2, luces: Lightbulb, basura: Trash2 };
const rules = BEACH_RULES.map((r) => ({ ...r, icon: ICON[r.id] }));

export default function Practicas() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <h1>Buenas prácticas en la playa</h1>
          <p>Lo que hagas en la arena de Same, Tonchigüe y Atacames decide si un nido llega al mar.</p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <ul className="rules">
            {rules.map(({ icon: I, title, text }) => (
              <li key={title}>
                <I size={28} aria-hidden />
                <div>
                  <h3>{title}</h3>
                  <p className="dim">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
