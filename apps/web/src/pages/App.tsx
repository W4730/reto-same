import { Download, MapPin, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';

// Enlace fijo: siempre baja el APK del último release de GitHub.
const APK_URL = 'https://github.com/W4730/reto-same/releases/latest/download/reto-same-campo.apk';

const steps = [
  'Toca "Descargar APK" desde el teléfono Android.',
  'Abre el archivo descargado. Si Android lo pide, permite instalar apps de esta fuente (Ajustes → Instalar apps desconocidas).',
  'Abre "Reto Same Campo" y crea tu cuenta. Si eres coordinador, pide el código a un coordinador actual.',
];

export default function App() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <h1>App de campo</h1>
          <p>Para voluntarios y coordinadores de Reto Same: registra nidos en la playa en tres pasos, aunque no haya señal.</p>
          <div className="actions">
            <a className="btn white big" href={APK_URL}>
              <Download size={22} aria-hidden /> Descargar APK (Android)
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap stack">
          <h2 className="rule">Cómo instalarla</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s}>
                <span className="n" aria-hidden>
                  {i + 1}
                </span>
                <p style={{ alignSelf: 'center' }}>{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="soft">
        <div className="wrap stack">
          <ul className="rules">
            <li>
              <WifiOff size={28} aria-hidden />
              <div>
                <h3>Funciona sin señal</h3>
                <p className="dim">El nido y la foto se guardan en el teléfono y se envían solos cuando vuelve la conexión.</p>
              </div>
            </li>
            <li>
              <MapPin size={28} aria-hidden />
              <div>
                <h3>GPS con precisión visible</h3>
                <p className="dim">Te muestra el margen de error en metros para que esperes a que se estabilice.</p>
              </div>
            </li>
            <li>
              <ShieldCheck size={28} aria-hidden />
              <div>
                <h3>Datos validados</h3>
                <p className="dim">El coordinador revisa cada registro; una vez validado, la ubicación no se puede mover.</p>
              </div>
            </li>
            <li>
              <Smartphone size={28} aria-hidden />
              <div>
                <h3>Solo Android por ahora</h3>
                <p className="dim">La versión para iPhone requiere una cuenta de Apple Developer y llegará después.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
