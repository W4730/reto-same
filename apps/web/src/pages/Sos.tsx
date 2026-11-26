import { SOS_PHONE, SOS_PHONE_LABEL, WHATSAPP_URL } from '@retosame/shared';
import { Camera, Flashlight, Hand, MessageCircle, Phone, Ruler, Timer } from 'lucide-react';
import { Link } from '../lib/nav';

const steps = [
  { icon: Ruler, title: 'Mantén la distancia', text: 'Quédate lejos y detrás de la tortuga, fuera de su vista. No la rodees ni bloquees su camino al mar.' },
  { icon: Flashlight, title: 'Nada de flash ni linterna blanca', text: 'La luz blanca la desorienta y puede hacer que vuelva al mar sin anidar. Si necesitas luz, usa luz roja y apúntala al suelo.' },
  { icon: Timer, title: 'Espera a que termine', text: 'Anidar le toma tiempo. No la toques, no te subas encima ni le pongas objetos. Guarda silencio.' },
  { icon: Hand, title: 'Si ves neonatos perdidos', text: 'Si caminan hacia luces o calles, júntalos con cuidado en un recipiente con un poco de arena húmeda y llama al equipo. No los metas al agua tú mismo.' },
  { icon: Phone, title: 'Avisa al equipo de Reto Same', text: 'Llama o escribe por WhatsApp. Si puedes, manda una foto sin flash y tu ubicación.' },
];

export default function Sos() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <h1>Vi una tortuga</h1>
          <p>Cinco pasos. Esta página funciona sin señal una vez que la abriste.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <ol className="steps">
            {steps.map(({ icon: I, title, text }, i) => (
              <li key={title}>
                <span className="n" aria-hidden>
                  <I size={24} />
                </span>
                <div>
                  <h3>
                    <span className="sr">{i + 1}. </span>
                    {title}
                  </h3>
                  <p className="dim">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="soft">
        <div className="wrap stack">
          <div className="note">
            <Camera size={20} aria-hidden />
            <p>
              ¿Tienes señal? <Link to="/reportar">Reporta el avistamiento con foto</Link> y el equipo lo recibe al instante.
            </p>
          </div>
        </div>
      </section>

      <div className="callbar no-print">
        <div className="wrap">
          <a className="btn big" href={`tel:${SOS_PHONE}`} aria-label={`Llamar al ${SOS_PHONE_LABEL}`}>
            <Phone size={20} aria-hidden /> Llamar
          </a>
          <a className="btn whatsapp big" href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hola Reto Same, vi una tortuga en la playa')}`}>
            <MessageCircle size={20} aria-hidden /> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
