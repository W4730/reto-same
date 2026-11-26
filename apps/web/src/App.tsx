import { Camera, Home as HomeIcon, Map, Siren } from 'lucide-react';
import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Link, usePath } from './lib/nav';
import Home from './pages/Home';
const Mapa = lazy(() => import('./pages/Mapa'));
import Practicas from './pages/Practicas';
import Qr from './pages/Qr';
import Reportar from './pages/Reportar';
import Sos from './pages/Sos';

const pages: Record<string, { el: ComponentType; title: string }> = {
  '/': { el: Home, title: 'Reto Same · Conectados con el mar' },
  '/sos': { el: Sos, title: 'Vi una tortuga · Reto Same' },
  '/mapa': { el: Mapa, title: 'Mapa de nidos · Reto Same' },
  '/reportar': { el: Reportar, title: 'Reportar avistamiento · Reto Same' },
  '/playa': { el: Practicas, title: 'Buenas prácticas en la playa · Reto Same' },
  '/qr': { el: Qr, title: 'Código QR · Reto Same' },
};

export default function App() {
  const path = usePath();
  const page = pages[path] ?? pages['/'];
  useEffect(() => {
    document.title = page.title;
  }, [page]);
  const Page = page.el;

  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <Link to="/" className="brandmark">
            <img src="/logo.png" alt="" width={40} height={40} />
            Reto Same
          </Link>
          <nav className="topnav" aria-label="Principal">
            <Link to="/sos">Vi una tortuga</Link>
            <Link to="/mapa">Mapa</Link>
            <Link to="/playa">Buenas prácticas</Link>
            <Link to="/reportar">Reportar</Link>
          </nav>
        </div>
      </header>

      <main>
        <Suspense fallback={<p className="wrap dim" style={{ padding: 40 }}>Cargando…</p>}>
          <Page />
        </Suspense>
      </main>

      <footer className="footer">
        <div className="wrap stack">
          <p>
            <strong>Fundación Reto Same</strong> · Rescate de tortugas en Same, Tonchigüe y Atacames, Esmeraldas, Ecuador.
          </p>
          <p>
            <a href="https://instagram.com/reto.same">@reto.same</a> · <a href="tel:+593984281540">+593 98 428 1540</a> ·{' '}
            <Link to="/qr">QR para hoteles</Link>
          </p>
        </div>
      </footer>

      <nav className="tabbar" aria-label="Principal">
        <Link to="/">
          <HomeIcon size={22} aria-hidden />
          Inicio
        </Link>
        <Link to="/sos" className="sos">
          <Siren size={22} aria-hidden />
          Vi una tortuga
        </Link>
        <Link to="/mapa">
          <Map size={22} aria-hidden />
          Mapa
        </Link>
        <Link to="/reportar">
          <Camera size={22} aria-hidden />
          Reportar
        </Link>
      </nav>
    </>
  );
}
