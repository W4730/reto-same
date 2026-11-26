import { Download, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

const target = `${location.origin}/sos`;

export default function Qr() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current) QRCode.toCanvas(canvas.current, target, { width: 720, margin: 1, color: { dark: '#194171', light: '#ffffff' } });
  }, []);

  function download() {
    const a = document.createElement('a');
    a.download = 'reto-same-qr.png';
    a.href = canvas.current!.toDataURL('image/png');
    a.click();
  }

  return (
    <section>
      <div className="wrap stack">
        <div className="no-print stack">
          <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)' }} className="rule">
            QR para playa, hoteles y Airbnb
          </h1>
          <p className="lead">Imprímelo y pégalo donde lo vean tus huéspedes. Abre directo el protocolo “Vi una tortuga”.</p>
        </div>

        <div className="qr-card">
          <img src="/logo.png" alt="Fundación Reto Same" width={88} height={88} />
          <h2 style={{ fontSize: '1.4rem' }}>¿Viste una tortuga?</h2>
          <canvas ref={canvas} aria-label={`Código QR que abre ${target}`} />
          <p style={{ fontSize: '1.05rem' }}>
            Escanea y sigue los pasos.
            <br />
            <strong>Sin flash · sin linterna blanca · a distancia</strong>
          </p>
          <p className="small" style={{ color: '#4b6378' }}>
            Fundación Reto Same · Conectados con el mar
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => print()}>
            <Printer size={20} aria-hidden /> Imprimir
          </button>
          <button className="btn ghost" onClick={download}>
            <Download size={20} aria-hidden /> Descargar PNG
          </button>
        </div>
      </div>
    </section>
  );
}
