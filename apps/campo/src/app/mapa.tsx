import { effectiveStatus, fmtDate, STATUS_META, type NestStatus } from '@retosame/shared';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NestsMap, type Sector } from '../components/NestsMap';
import { Button, Chip, Icon, StatusMarker } from '../components/ui';
import { useAuth } from '../lib/auth';
import { sectorName, useNests } from '../lib/nests';
import { supabase, type Nest } from '../lib/supabase';
import { c, radius, type } from '../lib/theme';

const ALL = Object.keys(STATUS_META) as NestStatus[];

/** Mapa del coordinador: todos los nidos (incluye pendientes, con ubicación exacta) y la concentración. */
export default function Mapa() {
  const { session } = useAuth();
  const { nests, stale } = useNests('all', session?.user.id);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [heat, setHeat] = useState(false);
  const [show, setShow] = useState<Set<NestStatus>>(new Set(ALL));
  const [sel, setSel] = useState<Nest | null>(null);

  useEffect(() => {
    supabase.rpc('public_sectors').then(({ data }) => data && setSectors(data as Sector[]));
  }, []);

  const visible = useMemo(() => nests.filter((n) => show.has(effectiveStatus(n))), [nests, show]);
  const counts = useMemo(() => nests.reduce<Partial<Record<NestStatus, number>>>((a, n) => {
    const s = effectiveStatus(n);
    return { ...a, [s]: (a[s] ?? 0) + 1 };
  }, {}), [nests]);

  function toggle(s: NestStatus) {
    setShow((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next.size ? next : new Set(ALL); // nunca dejar el mapa vacío por error
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['bottom']}>
      <View style={st.mapWrap}>
        <NestsMap nests={visible} sectors={sectors} heat={heat} onSelect={setSel} />
        <View style={st.seg}>
          {([['Cada nido', false], ['Concentración', true]] as const).map(([label, h]) => (
            <Pressable key={label} onPress={() => { setHeat(h); setSel(null); }} accessibilityRole="tab" accessibilityState={{ selected: heat === h }}
              style={[st.segBtn, heat === h && { backgroundColor: c.primary }]}>
              <Icon name={h ? 'fire' : 'map-marker-radius-outline'} size={18} color={c.white} />
              <Text style={[type.label, { color: c.white }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {stale && (
          <View style={st.stale}><Icon name="cloud-off-outline" size={16} color={c.amber} /><Text style={type.label}>Sin conexión: últimos datos</Text></View>
        )}
      </View>

      {sel ? (
        <View style={st.card}>
          <StatusMarker status={effectiveStatus(sel)} size={28} />
          <View style={{ flex: 1 }}>
            <Text style={[type.title, type.num]}>{sel.code ?? 'Sin código'}</Text>
            <Text style={type.bodyDim}>{STATUS_META[effectiveStatus(sel)].label} · {sectorName(sel.sector_id)} · {fmtDate(sel.laid_at)}</Text>
          </View>
          <Button label="Ver" icon="chevron-right" onPress={() => router.push(`/nido/${sel.id}`)} />
          <Pressable onPress={() => setSel(null)} accessibilityLabel="Cerrar" hitSlop={8} style={{ padding: 6 }}>
            <Icon name="close" size={20} color={c.textDim} />
          </Pressable>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={st.legend}>
          {ALL.map((s) => (
            <Chip key={s} label={`${STATUS_META[s].label} · ${counts[s] ?? 0}`} selected={show.has(s)} onPress={() => toggle(s)} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  mapWrap: { flex: 1, backgroundColor: c.surface },
  seg: { position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', padding: 4, gap: 4, borderRadius: radius.pill, backgroundColor: 'rgba(15,23,42,0.88)' },
  segBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill },
  stale: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 6, alignItems: 'center', padding: 8, borderRadius: radius.sm, backgroundColor: 'rgba(15,23,42,0.88)' },
  legend: { gap: 8, padding: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, margin: 12, borderRadius: radius.md, backgroundColor: c.surface },
});
