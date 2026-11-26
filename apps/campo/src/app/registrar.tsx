import { hatchWindow, fmtDate, SPECIES, type Species } from '@retosame/shared';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip, Field, Icon, s } from '../components/ui';
import { photoDir, useSync } from '../lib/sync';
import { c, font, radius, type } from '../lib/theme';

type Fix = { lat: number; lng: number; acc: number; at: string };

/** Buena precisión: con ≤ 8 m se habilita al instante. Pasados 20 s se permite usar lo que haya. */
const GOOD_M = 8;
const WAIT_S = 20;

export default function Registrar() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [fix, setFix] = useState<Fix | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const id = useRef(randomUUID()).current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['bottom']}>
      <Stepper step={step} />
      {step === 0 && <StepGps onDone={(f) => { setFix(f); setStep(1); }} />}
      {step === 1 && <StepPhoto id={id} onDone={(uri) => { setPhoto(uri); setStep(2); }} onBack={() => setStep(0)} />}
      {step === 2 && fix && photo && <StepConfirm id={id} fix={fix} photo={photo} onRetakePhoto={() => setStep(1)} />}
    </SafeAreaView>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ['Ubicación', 'Foto', 'Confirmar'];
  return (
    <View style={st.stepper} accessibilityLabel={`Paso ${step + 1} de 3: ${labels[step]}`}>
      {labels.map((l, i) => (
        <View key={l} style={{ flex: 1, gap: 6 }}>
          <View style={[st.stepLine, { backgroundColor: i <= step ? c.accent : c.outline }]} />
          <Text style={[type.label, { fontSize: 13, color: i === step ? c.text : c.textDim }]}>{i + 1}. {l}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Paso 1: GPS con precisión visible ─────────────────────────────────────────
function StepGps({ onDone }: { onDone: (f: Fix) => void }) {
  const [perm, setPerm] = useState<'ask' | 'ok' | 'denied'>('ask');
  const [fix, setFix] = useState<Fix | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let sub: Location.LocationSubscription | undefined;
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') return setPerm('denied');
      setPerm('ok');
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
        (l) => setFix({ lat: l.coords.latitude, lng: l.coords.longitude, acc: l.coords.accuracy ?? 99, at: new Date(l.timestamp).toISOString() }),
      );
    })();
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { cancelled = true; sub?.remove(); clearInterval(t); };
  }, []);

  if (perm === 'denied') {
    return (
      <Center>
        <Icon name="map-marker-off-outline" size={56} color={c.amber} />
        <Text style={[type.title, { textAlign: 'center' }]}>Necesitamos tu ubicación</Text>
        <Text style={[type.bodyDim, { textAlign: 'center' }]}>Sin GPS no se puede marcar dónde está el nido. Actívalo en los ajustes del teléfono.</Text>
        <Button label="Abrir ajustes" icon="cog-outline" onPress={() => Linking.openSettings()} />
      </Center>
    );
  }

  const acc = fix ? Math.round(fix.acc) : null;
  const good = acc !== null && acc <= GOOD_M;
  const ok = acc !== null && acc <= 15;
  const canUse = fix && (good || elapsed >= WAIT_S);
  const tone = acc === null ? c.textDim : good ? c.ok : ok ? c.accent : c.amber;

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
      <View style={{ gap: 8 }}>
        <Text style={type.headline}>Párate encima del nido</Text>
        <Text style={type.bodyDim}>Quédate quieto mientras el margen de error baja. La fecha y la hora se guardan solas.</Text>
      </View>

      <View style={{ alignItems: 'center', gap: 10 }} accessibilityLiveRegion="polite"
        accessibilityLabel={acc === null ? 'Buscando señal GPS' : `Margen de error ${acc} metros`}>
        <View style={[st.gpsRing, { borderColor: tone }]}>
          <Text style={[st.gpsNum, { color: tone }]}>{acc === null ? '…' : `±${acc}`}</Text>
          <Text style={[type.label, { color: c.textDim }]}>{acc === null ? 'buscando GPS' : 'metros'}</Text>
        </View>
        <Text style={[type.title, { color: tone }]}>
          {acc === null ? 'Buscando satélites…' : good ? 'Precisión buena' : ok ? 'Aceptable, espera un poco más' : 'Señal débil, sigue esperando'}
        </Text>
        {fix && <Text style={[type.bodyDim, type.num]}>{fix.lat.toFixed(6)}, {fix.lng.toFixed(6)}</Text>}
      </View>

      <Button big icon="crosshairs-gps" disabled={!canUse}
        label={!fix ? 'Esperando GPS' : good ? 'Usar esta ubicación' : canUse ? `Usar igual (±${acc} m)` : `Esperando precisión · ${WAIT_S - elapsed} s`}
        onPress={() => fix && onDone(fix)} />
    </View>
  );
}

// ── Paso 2: foto con cámara (no galería) ──────────────────────────────────────
function StepPhoto({ id, onDone, onBack }: { id: string; onDone: (uri: string) => void; onBack: () => void }) {
  const [perm, request] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!perm) return null;
  if (!perm.granted) {
    return (
      <Center>
        <Icon name="camera-off-outline" size={56} color={c.amber} />
        <Text style={[type.title, { textAlign: 'center' }]}>La foto es obligatoria</Text>
        <Text style={[type.bodyDim, { textAlign: 'center' }]}>Se toma en el momento para que la fecha y el lugar sean reales.</Text>
        <Button label={perm.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'} icon="camera-outline"
          onPress={() => (perm.canAskAgain ? request() : Linking.openSettings())} />
      </Center>
    );
  }

  async function take() {
    if (!cam.current) return;
    setBusy(true);
    setErr(null);
    try {
      const pic = await cam.current.takePictureAsync({ quality: 0.9, shutterSound: false });
      setShot(pic.uri);
    } catch {
      setErr('No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    if (!shot) return;
    setBusy(true);
    try {
      // ≈1600 px, JPEG 75 %: liviana para subir con mala señal.
      const ref = await ImageManipulator.manipulate(shot).resize({ width: 1600, height: null }).renderAsync();
      const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.75 });
      if (!photoDir.exists) photoDir.create({ intermediates: true, idempotent: true });
      const dest = new File(photoDir, `${id}.jpg`);
      if (dest.exists) dest.delete();
      await new File(out.uri).copy(dest);
      onDone(dest.uri);
    } catch {
      setErr('No se pudo guardar la foto. Intenta de nuevo.');
      setBusy(false);
    }
  }

  if (shot) {
    return (
      <View style={{ flex: 1 }}>
        <Image source={{ uri: shot }} style={{ flex: 1 }} contentFit="cover" accessibilityLabel="Foto del nido" />
        <View style={st.camBar}>
          {err && <Text style={[type.bodyDim, { color: c.amber }]}>{err}</Text>}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button variant="tonal" icon="camera-retake-outline" label="Repetir" onPress={() => setShot(null)} style={{ flex: 1 }} disabled={busy} />
            <Button icon="check" label="Usar foto" onPress={accept} loading={busy} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cam} style={{ flex: 1 }} facing="back" mode="picture" onCameraReady={() => setReady(true)}
        onMountError={() => setErr('La cámara no está disponible.')} />
      <View style={st.camBar}>
        <Text style={[type.bodyDim, { textAlign: 'center' }]}>{err ?? 'Encuadra el nido y las huellas.'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button variant="text" icon="arrow-left" label="GPS" onPress={onBack} />
          <Pressable accessibilityRole="button" accessibilityLabel="Tomar foto" disabled={!ready || busy} onPress={take}
            style={({ pressed }) => [st.shutter, (!ready || busy) && { opacity: 0.5 }, pressed && { transform: [{ scale: 0.94 }] }]}>
            <View style={st.shutterInner} />
          </Pressable>
          <View style={{ width: 88 }} />
        </View>
      </View>
    </View>
  );
}

// ── Paso 3: confirmar (campos opcionales) ─────────────────────────────────────
function StepConfirm({ id, fix, photo, onRetakePhoto }: { id: string; fix: Fix; photo: string; onRetakePhoto: () => void }) {
  const { add } = useSync();
  const [species, setSpecies] = useState<Species | null>(null);
  const [track, setTrack] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const w = hatchWindow(new Date(fix.at));
  const trackNum = track ? Number(track.replace(',', '.')) : null;
  const trackBad = trackNum !== null && (!Number.isFinite(trackNum) || trackNum < 10 || trackNum > 250);

  async function save() {
    setSaving(true);
    await add({
      id, lat: fix.lat, lng: fix.lng, gps_accuracy_m: fix.acc, laid_at: fix.at,
      species, track_width_cm: trackBad ? null : trackNum, notes: notes.trim(), localPhotoUri: photo,
    });
    router.dismissTo({ pathname: '/', params: { saved: '1' } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 22 }} keyboardShouldPersistTaps="handled">
        <View style={st.summary}>
          <Image source={{ uri: photo }} style={st.thumb} accessibilityLabel="Foto del nido" />
          <View style={{ flex: 1, gap: 6 }}>
            <Row icon="clock-outline" text={`${fmtDate(fix.at)} · ${new Date(fix.at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`} />
            <Row icon="crosshairs-gps" text={`± ${Math.round(fix.acc)} m`} />
            <Row icon="egg-outline" text={`Eclosión ${fmtDate(w.from)} – ${fmtDate(w.to)}`} />
          </View>
        </View>
        <Button variant="text" icon="camera-retake-outline" label="Cambiar foto" onPress={onRetakePhoto} style={{ alignSelf: 'flex-start', marginTop: -12 }} />

        <Text style={[type.label, { color: c.textDim, marginBottom: -8 }]}>Opcional: completa solo si lo sabes</Text>

        <Field label="Especie">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(SPECIES) as Species[]).map((k) => (
              <Chip key={k} label={SPECIES[k].name} selected={species === k} onPress={() => setSpecies(species === k ? null : k)} />
            ))}
          </View>
        </Field>

        <Field label="Ancho de la huella (cm)">
          <TextInput style={[s.input, trackBad && { borderColor: c.amber }]} value={track} onChangeText={setTrack}
            keyboardType="decimal-pad" placeholder="Ej. 72" placeholderTextColor={c.textDim} maxLength={5} />
          {trackBad && <Text style={[type.bodyDim, { color: c.amber }]}>Debe estar entre 10 y 250 cm. Si no lo mediste, déjalo vacío.</Text>}
        </Field>

        <Field label="Notas">
          <TextInput style={[s.input, { minHeight: 88, paddingTop: 14, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes}
            multiline maxLength={1000} placeholder="Ej. frente al hotel, cerca de la desembocadura" placeholderTextColor={c.textDim} />
        </Field>

        <Button big icon="content-save-outline" label="Guardar nido" onPress={save} loading={saving} disabled={trackBad} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Row({ icon, text }: { icon: 'clock-outline' | 'crosshairs-gps' | 'egg-outline'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <Icon name={icon} size={18} color={c.accent} />
      <Text style={[type.body, type.num]}>{text}</Text>
    </View>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 }}>{children}</View>;
}

const st = StyleSheet.create({
  stepper: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  stepLine: { height: 4, borderRadius: 2 },
  gpsRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface },
  gpsNum: { fontFamily: font.display, fontSize: 64, lineHeight: 72, fontVariant: ['tabular-nums'] },
  camBar: { padding: 20, gap: 14, backgroundColor: c.bg },
  shutter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: c.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: c.white },
  summary: { flexDirection: 'row', gap: 16, padding: 12, borderRadius: radius.md, backgroundColor: c.surface, alignItems: 'center' },
  thumb: { width: 96, height: 96, borderRadius: radius.sm },
});
