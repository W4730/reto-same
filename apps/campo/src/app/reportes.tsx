import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Icon, type IconName } from '../components/ui';
import { supabase } from '../lib/supabase';
import { c, radius, type } from '../lib/theme';

type Sighting = {
  id: string;
  kind: 'anidando' | 'neonatos' | 'varada' | 'otro';
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  photo_path: string | null;
  notes: string;
  contact: string | null;
  created_at: string;
  handled_at: string | null;
  photoUrl?: string | null;
};

const KIND: Record<Sighting['kind'], { label: string; icon: IconName; color: string }> = {
  anidando: { label: 'Tortuga anidando', icon: 'turtle', color: c.accent },
  neonatos: { label: 'Neonatos', icon: 'egg-outline', color: c.ok },
  varada: { label: 'Herida o varada', icon: 'alert-outline', color: c.danger },
  otro: { label: 'Otro', icon: 'help-circle-outline', color: c.textDim },
};

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `hace ${Math.max(m, 1)} min`;
  if (m < 60 * 24) return `hace ${Math.round(m / 60)} h`;
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
};

/** Reportes de turistas enviados desde la web pública. Solo el coordinador los ve (RLS). */
export default function Reportes() {
  const [items, setItems] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sightings').select('*').order('handled_at', { nullsFirst: true }).order('created_at', { ascending: false }).limit(100);
    setLoading(false);
    if (error) return setErr('No se pudieron cargar los reportes. Revisa la señal.');
    setErr(null);
    const rows = data as Sighting[];
    const paths = rows.map((r) => r.photo_path).filter((p): p is string => !!p);
    const signed = paths.length ? (await supabase.storage.from('sightings').createSignedUrls(paths, 3600)).data ?? [] : [];
    const url = new Map(signed.map((s) => [s.path, s.signedUrl]));
    setItems(rows.map((r) => ({ ...r, photoUrl: r.photo_path ? url.get(r.photo_path) : null })));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handle(s: Sighting) {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('sightings').update({ handled_at: new Date().toISOString(), handled_by: u.user?.id }).eq('id', s.id);
    if (error) return Alert.alert('No se guardó', error.message);
    load();
  }

  return (
    <FlatList
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
      data={items}
      keyExtractor={(s) => s.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.accent} colors={[c.accent]} />}
      ListHeaderComponent={<Text style={[type.bodyDim, { marginBottom: 4 }]}>{err ?? 'Lo que reportan turistas y vecinos desde la web. Los pendientes salen primero.'}</Text>}
      ListEmptyComponent={!loading ? (
        <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
          <Icon name="bell-check-outline" size={48} color={c.outline} />
          <Text style={type.title}>Sin reportes</Text>
        </View>
      ) : undefined}
      renderItem={({ item: s }) => {
        const k = KIND[s.kind];
        const phone = s.contact?.replace(/[^\d+]/g, '') ?? '';
        return (
          <View style={[st.card, s.handled_at && { opacity: 0.55 }]}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              {s.photoUrl ? (
                <Image source={{ uri: s.photoUrl }} style={st.thumb} accessibilityLabel="Foto del reporte" />
              ) : (
                <View style={[st.thumb, st.center]}><Icon name={k.icon} size={28} color={k.color} /></View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={type.title}>{k.label}</Text>
                <Text style={type.bodyDim}>{ago(s.created_at)}{s.handled_at ? ' · atendido' : ''}</Text>
                {s.notes ? <Text style={type.body}>{s.notes}</Text> : null}
                {s.contact ? <Text style={type.bodyDim}>Contacto: {s.contact}</Text> : null}
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {s.lat != null && s.lng != null && (
                <Button variant="tonal" icon="map-marker-outline" label={`Ubicación${s.accuracy_m ? ` ±${Math.round(s.accuracy_m)} m` : ''}`}
                  onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`)} />
              )}
              {phone.length >= 7 && <Button variant="tonal" icon="phone-outline" label="Llamar" onPress={() => Linking.openURL(`tel:${phone}`)} />}
              {!s.handled_at && <Button icon="check" label="Atendido" onPress={() => handle(s)} />}
            </View>
          </View>
        );
      }}
    />
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: radius.md, padding: 14, gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: c.surfaceHigh },
  center: { alignItems: 'center', justifyContent: 'center' },
});
