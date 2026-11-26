import { effectiveStatus, fmtDate, hatchWindow, SPECIES, STATUS_META, type NestStatus, type Species } from '@retosame/shared';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Banner, Button, Icon, StatusMarker } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { sectorName } from '../../lib/nests';
import { photoUrl, supabase, type Nest } from '../../lib/supabase';
import { c, radius, type } from '../../lib/theme';

export default function NestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isCoordinator } = useAuth();
  const [n, setN] = useState<Nest | null>(null);
  const [img, setImg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [moving, setMoving] = useState<{ lat: number; lng: number } | null>(null);

  async function load() {
    const { data, error } = await supabase.from('nests').select('*').eq('id', id).single();
    if (error) return setErr('No se pudo cargar el nido. Revisa la señal.');
    setN(data as Nest);
    setImg(await photoUrl((data as Nest).photo_path));
  }
  useEffect(() => { load(); }, [id]);

  async function update(patch: Partial<Nest>, done?: string) {
    setBusy(true);
    const { data, error } = await supabase.from('nests').update(patch).eq('id', id).select().single();
    setBusy(false);
    if (error) return Alert.alert('No se guardó', error.message.includes('validado') ? 'La ubicación de un nido validado no se puede mover.' : error.message);
    setN(data as Nest);
    setMoving(null);
    if (done) Alert.alert(done);
  }

  function confirmStatus(status: NestStatus, label: string) {
    Alert.alert(label, status === 'activo' ? 'La ubicación quedará bloqueada y no se podrá mover.' : '¿Confirmas el cambio de estado?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => update({ status }) },
    ]);
  }

  if (err) return <View style={st.center}><Text style={type.bodyDim}>{err}</Text><Button label="Reintentar" onPress={() => { setErr(null); load(); }} /></View>;
  if (!n) return <View style={st.center}><Text style={type.bodyDim}>Cargando…</Text></View>;

  const status = effectiveStatus(n);
  const meta = STATUS_META[status];
  const w = hatchWindow(new Date(n.laid_at));
  const pos = moving ?? { lat: n.lat, lng: n.lng };

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: n.code ?? 'NIDO' }} />
      {img ? (
        <Image source={{ uri: img }} style={st.photo} contentFit="cover" transition={200} accessibilityLabel={`Foto del nido ${n.code ?? ''}`} />
      ) : (
        <View style={[st.photo, st.center]}><Icon name="image-off-outline" size={40} color={c.outline} /></View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <StatusMarker status={status} size={28} />
        <View style={{ flex: 1 }}>
          <Text style={[type.title, { fontSize: 20 }]}>{meta.label}</Text>
          <Text style={type.bodyDim}>{sectorName(n.sector_id)} · temporada {n.season}</Text>
        </View>
      </View>

      <View style={st.card}>
        <Info k="Registrado" v={`${fmtDate(n.laid_at)} · ${new Date(n.laid_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`} />
        <Info k="Eclosión estimada" v={`${fmtDate(w.from)} – ${fmtDate(w.to)} (ref. ${fmtDate(w.ref)})`} />
        <Info k="Precisión GPS" v={n.gps_accuracy_m != null ? `± ${Math.round(n.gps_accuracy_m)} m` : '—'} />
        <Info k="Especie" v={n.species ? SPECIES[n.species as Species].name : 'Sin registrar'} />
        <Info k="Huella" v={n.track_width_cm ? `${n.track_width_cm} cm` : 'Sin medir'} />
        {n.notes ? <Info k="Notas" v={n.notes} /> : null}
      </View>

      <View style={st.mapWrap}>
        <MapView style={{ flex: 1 }} mapType="satellite" initialRegion={{ latitude: n.lat, longitude: n.lng, latitudeDelta: 0.002, longitudeDelta: 0.002 }}
          onPress={(e) => moving && setMoving({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}>
          <Marker coordinate={{ latitude: pos.lat, longitude: pos.lng }} pinColor={meta.color} draggable={!!moving}
            onDragEnd={(e) => setMoving({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })} />
        </MapView>
        {n.location_locked && (
          <View style={st.lock}><Icon name="lock" size={16} color={c.text} /><Text style={type.label}>Ubicación bloqueada</Text></View>
        )}
      </View>

      {isCoordinator && moving && (
        <Banner icon="gesture-tap" tone="warn">
          <Text style={type.bodyDim}>Toca el mapa o arrastra el marcador al lugar correcto.</Text>
        </Banner>
      )}

      {isCoordinator && (
        <View style={{ gap: 10 }}>
          {status === 'pendiente' && !moving && (
            <>
              <Button big icon="check-decagram-outline" label="Validar nido" onPress={() => confirmStatus('activo', 'Validar nido')} loading={busy} />
              {!n.location_locked && <Button variant="tonal" icon="map-marker-path" label="Corregir ubicación" onPress={() => setMoving({ lat: n.lat, lng: n.lng })} />}
            </>
          )}
          {moving && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="tonal" label="Cancelar" onPress={() => setMoving(null)} style={{ flex: 1 }} />
              <Button icon="content-save-outline" label="Guardar ubicación" onPress={() => update({ lat: moving.lat, lng: moving.lng }, 'Ubicación corregida')} loading={busy} style={{ flex: 1 }} />
            </View>
          )}
          {(status === 'activo' || status === 'por_eclosionar') && (
            <Button big icon="egg-off-outline" label="Marcar eclosionado" onPress={() => confirmStatus('eclosionado', 'Marcar eclosionado')} loading={busy} />
          )}
          {status !== 'perdido' && status !== 'eclosionado' && !moving && (
            <Button variant="outlined" icon="close-circle-outline" label="Marcar perdido" onPress={() => confirmStatus('perdido', 'Marcar perdido')} />
          )}
        </View>
      )}
      {!isCoordinator && status === 'pendiente' && (
        <Banner icon="account-clock-outline"><Text style={type.bodyDim}>El coordinador revisará la foto y la ubicación.</Text></Banner>
      )}
      <Button variant="text" icon="arrow-left" label="Volver" onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
    </ScrollView>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 6 }}>
      <Text style={type.bodyDim}>{k}</Text>
      <Text style={[type.body, type.num, { flexShrink: 1, textAlign: 'right' }]}>{v}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: c.bg, padding: 24 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: c.surface },
  card: { backgroundColor: c.surface, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10 },
  mapWrap: { height: 240, borderRadius: radius.md, overflow: 'hidden', backgroundColor: c.surface },
  lock: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(15,23,42,0.85)' },
});
