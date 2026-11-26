import { SOS_PHONE, WHATSAPP_URL } from '@retosame/shared';
import { Camera, Check, LocateFixed, Phone, WifiOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { configured, supabase } from '../lib/supabase';

const kinds = [
  { id: 'anidando', label: 'Tortuga anidando' },
  { id: 'neonatos', label: 'Neonatos' },
  { id: 'varada', label: 'Tortuga herida o varada' },
  { id: 'otro', label: 'Otro' },
] as const;

/** Reduce la foto a ≤1600 px JPEG en el navegador para que suba rápido con mala señal. */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('foto'))), 'image/jpeg', 0.78));
}

type Pos = { lat: number; lng: number; acc: number };

export default function Reportar() {
  const [kind, setKind] = useState<string>('anidando');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  function locate() {
    if (!('geolocation' in navigator)) return setLocErr('Tu navegador no comparte ubicación.');
    setLocating(true);
    setLocErr(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
        setLocating(false);
      },
      () => {
        setLocErr('No pudimos obtener tu ubicación. Revisa el permiso o describe el lugar en las notas.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000 },
    );
  }

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      let photo_path: string | null = null;
      if (file) {
        photo_path = `${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from('sightings').upload(photo_path, await compress(file), { contentType: 'image/jpeg' });
        if (error) throw error;
      }
      const { error } = await supabase.from('sightings').insert({
        kind,
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        accuracy_m: pos?.acc ?? null,
        photo_path,
        notes: notes.trim().slice(0, 500),
        contact: contact.trim().slice(0, 100) || null,
      });
      if (error) throw error;
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <section>
        <div className="wrap stack" style={{ maxWidth: 560 }}>
          <div>
            <span className="done" aria-hidden>
              <Check size={32} />
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>Gracias, reporte enviado</h1>
          <p className="lead">El equipo de Reto Same ya lo recibió. Si es urgente, llama también.</p>
          <a className="btn big" href={`tel:${SOS_PHONE}`}>
            <Phone size={20} aria-hidden /> Llamar al equipo
          </a>
        </div>
      </section>
    );
  }

  const offline = !navigator.onLine;

  return (
    <section>
      <div className="wrap stack">
        <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)' }} className="rule">
          Reportar avistamiento
        </h1>
        <p className="lead">Foto y ubicación en dos toques. No necesitas cuenta.</p>

        {(offline || !configured) && (
          <div className="note warn">
            <WifiOff size={20} aria-hidden />
            <p>
              Sin conexión no se puede enviar el reporte. <a href={`tel:${SOS_PHONE}`}>Llama</a> o escribe por{' '}
              <a href={WHATSAPP_URL}>WhatsApp</a>: se envía apenas tengas señal.
            </p>
          </div>
        )}

        <form className="form" onSubmit={submit}>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="label">¿Qué viste?</legend>
            <div className="choices">
              {kinds.map((k) => (
                <label className="choice" key={k.id}>
                  <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} />
                  <span>{k.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <span className="label">Foto (sin flash)</span>
            <label className="photo-pick">
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files?.[0])} />
              {preview ? <img src={preview} alt="Foto del avistamiento" /> : <Camera size={32} aria-hidden />}
              <span>{preview ? 'Toca para cambiarla' : 'Toca para abrir la cámara'}</span>
            </label>
          </div>

          <div>
            <span className="label">Ubicación</span>
            <button type="button" className="btn ghost block" onClick={locate} disabled={locating}>
              <LocateFixed size={20} aria-hidden />
              {locating ? 'Buscando…' : pos ? `Ubicación lista (± ${Math.round(pos.acc)} m)` : 'Usar mi ubicación'}
            </button>
            {locErr && (
              <p className="small dim" role="alert" style={{ marginTop: 8 }}>
                {locErr}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="notes">
              Detalles <span className="dim">(opcional)</span>
            </label>
            <textarea id="notes" className="input" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. frente al hotel, la tortuga está volviendo al mar" />
          </div>

          <div>
            <label className="label" htmlFor="contact">
              Tu teléfono o nombre <span className="dim">(opcional, por si el equipo necesita llamarte)</span>
            </label>
            <input id="contact" className="input" maxLength={100} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="tel" />
          </div>

          {state === 'error' && (
            <div className="note warn" role="alert">
              <WifiOff size={20} aria-hidden />
              <p>
                No se pudo enviar. Revisa la señal e inténtalo otra vez, o <a href={`tel:${SOS_PHONE}`}>llama al equipo</a>.
              </p>
            </div>
          )}

          <button className="btn big block" disabled={state === 'sending' || !configured || (!file && !pos && !notes.trim())}>
            {state === 'sending' ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </form>
      </div>
    </section>
  );
}
