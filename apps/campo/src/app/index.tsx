import { effectiveStatus, fmtDate, STATUS_META } from '@retosame/shared';
import { Image } from 'expo-image';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Button, Icon, StatusMarker } from '../components/ui';
import { useAuth } from '../lib/auth';
import { sectorName, useNests } from '../lib/nests';
import type { NestDraft } from '../lib/queue';
import { supabase, type Nest } from '../lib/supabase';
import { useSync } from '../lib/sync';
import { c, radius, type } from '../lib/theme';

const time = (iso: string) => new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

export default function Home() {
  const { session, loading, isCoordinator, name } = useAuth();
  const sync = useSync();
  const [tab, setTab] = useState<'mine' | 'pending'>('mine');
  const mine = useNests('mine', session?.user.id);
  const inbox = useNests('pending', session?.user.id);
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  const [toast, setToast] = useState<string | null>(null);
  const [openReports, setOpenReports] = useState(0);
  const loadReports = useCallback(async () => {
    if (!isCoordinator) return;
    const { count } = await supabase.from('sightings').select('id', { count: 'exact', head: true }).is('handled_at', null);
    setOpenReports(count ?? 0);
  }, [isCoordinator]);

  useFocusEffect(useCallback(() => { mine.reload(); if (isCoordinator) { inbox.reload(); loadReports(); } }, [isCoordinator, mine.reload, inbox.reload, loadReports]));
  // Al terminar un envío, refrescar la lista para que aparezcan los códigos asignados.
  useEffect(() => {
    if (sync.flushing) return;
    mine.reload();
    if (isCoordinator) inbox.reload();
  }, [sync.flushing]);
  useEffect(() => {
    if (!saved) return;
    setToast(sync.online ? 'Nido guardado. Enviando…' : 'Nido guardado en el teléfono. Se enviará cuando haya señal.');
    router.setParams({ saved: undefined });
  }, [saved]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  const list = tab === 'pending' ? inbox : mine;
  const queued = tab === 'mine' ? sync.queue : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <View style={st.bar}>
        <Image source={require('../../assets/tortuga.png')} style={{ width: 40, height: 40, borderRadius: 20 }} accessibilityLabel="Reto Same" />
        <View style={{ flex: 1 }}>
          <Text style={type.headline}>Reto Same</Text>
          <Text style={type.bodyDim} numberOfLines={1}>Hola{name ? `, ${name}` : ''}</Text>
        </View>
        <Pressable accessibilityLabel="Cerrar sesión" hitSlop={8} style={st.iconBtn} onPress={() => supabase.auth.signOut()}>
          <Icon name="logout" size={22} color={c.textDim} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <SyncBanner />
        {isCoordinator && (
          <View style={st.segment} accessibilityRole="tablist">
            {(['mine', 'pending'] as const).map((k) => (
              <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} onPress={() => setTab(k)}
                style={[st.segBtn, tab === k && { backgroundColor: c.surfaceHigh }]}>
                <Text style={[type.label, { color: tab === k ? c.text : c.textDim }]}>
                  {k === 'mine' ? 'Mis registros' : `Por validar${inbox.nests.length ? ` · ${inbox.nests.length}` : ''}`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={st.grid}>
          {isCoordinator && (
            <>
              <Button variant="tonal" icon="map-outline" label="Mapa" onPress={() => router.push('/mapa')} style={st.cell} />
              <Button variant="tonal" icon={openReports ? 'bell-ring-outline' : 'bell-outline'}
                label={`Reportes${openReports ? ` · ${openReports}` : ''}`} onPress={() => router.push('/reportes')} style={st.cell} />
              <Button variant="tonal" icon="account-group-outline" label="Equipo" onPress={() => router.push('/equipo')} style={st.cell} />
            </>
          )}
          <Button variant="tonal" icon="book-open-variant" label="Buenas prácticas" onPress={() => router.push('/practicas')} style={st.cell} />
        </View>
      </View>

      <FlatList<NestDraft | Nest>
        data={[...queued, ...list.nests]}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 8 }}
        refreshControl={<RefreshControl refreshing={list.loading} onRefresh={list.reload} tintColor={c.accent} colors={[c.accent]} />}
        ListHeaderComponent={list.stale && list.nests.length ? <Text style={[type.bodyDim, { marginBottom: 4 }]}>Sin conexión: mostrando la última lista descargada.</Text> : undefined}
        ListEmptyComponent={!list.loading ? <Empty pendingTab={tab === 'pending'} /> : undefined}
        renderItem={({ item }) => ('localPhotoUri' in item ? <QueuedRow d={item} /> : <NestRow n={item} />)}
      />

      {toast && (
        <View style={st.toast} accessibilityLiveRegion="polite">
          <Icon name="check-circle" size={20} color={c.ok} />
          <Text style={[type.body, { flex: 1 }]}>{toast}</Text>
        </View>
      )}

      <View style={st.fabWrap} pointerEvents="box-none">
        <Button big icon="turtle" label="Registrar nido" onPress={() => router.push('/registrar')} style={st.fab} />
      </View>
    </SafeAreaView>
  );
}

function SyncBanner() {
  const { queue, online, flushing, lastError, flushNow } = useSync();
  if (!queue.length && online) return null;
  const n = queue.length;
  const what = n === 1 ? '1 nido por enviar' : `${n} nidos por enviar`;
  return (
    <Banner
      icon={online ? 'cloud-upload-outline' : 'cloud-off-outline'}
      tone={online ? 'info' : 'warn'}
      action={n > 0 ? <Button variant="tonal" label="Enviar" icon="send" onPress={flushNow} loading={flushing} disabled={!online} /> : undefined}
    >
      <Text style={type.label}>{online ? (n ? what : 'Con señal') : 'Sin señal'}</Text>
      <Text style={type.bodyDim}>
        {lastError ?? (online ? 'No cierres la app hasta que termine.' : n ? `${what}. Están guardados en este teléfono.` : 'Puedes registrar igual: se guarda en el teléfono.')}
      </Text>
    </Banner>
  );
}

function QueuedRow({ d }: { d: NestDraft }) {
  return (
    <View style={st.row}>
      <Icon name="cloud-clock-outline" size={22} color={c.amber} />
      <View style={{ flex: 1 }}>
        <Text style={type.title}>Por enviar</Text>
        <Text style={type.bodyDim}>
          {fmtDate(d.laid_at)} · {time(d.laid_at)} · ± {Math.round(d.gps_accuracy_m ?? 0)} m
        </Text>
      </View>
    </View>
  );
}

function NestRow({ n }: { n: Nest }) {
  const st2 = effectiveStatus(n);
  const hatch = n.hatch_from && n.hatch_to && st2 !== 'eclosionado' && st2 !== 'perdido' ? ` · eclosión ${fmtDate(n.hatch_from)}–${fmtDate(n.hatch_to)}` : '';
  return (
    <Pressable style={st.row} android_ripple={{ color: 'rgba(255,255,255,0.08)' }} onPress={() => router.push(`/nido/${n.id}`)}
      accessibilityLabel={`Nido ${n.code ?? ''}, ${STATUS_META[st2].label}`}>
      <StatusMarker status={st2} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <Text style={[type.title, type.num]}>{n.code ?? '—'}</Text>
          <Text style={type.bodyDim}>{sectorName(n.sector_id)}</Text>
        </View>
        <Text style={type.bodyDim} numberOfLines={1}>{STATUS_META[st2].label}{hatch}</Text>
      </View>
      <Text style={type.bodyDim}>{fmtDate(n.laid_at)}</Text>
    </Pressable>
  );
}

function Empty({ pendingTab }: { pendingTab: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
      <Icon name={pendingTab ? 'inbox-outline' : 'turtle'} size={48} color={c.outline} />
      <Text style={[type.title, { textAlign: 'center' }]}>{pendingTab ? 'Nada por validar' : 'Aún no registras nidos'}</Text>
      <Text style={[type.bodyDim, { textAlign: 'center', maxWidth: 280 }]}>
        {pendingTab ? 'Los registros nuevos de los voluntarios aparecen aquí.' : 'Párate junto al nido y toca “Registrar nido”. Funciona sin señal.'}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { flexGrow: 1, flexBasis: '45%', paddingHorizontal: 12 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  segment: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: radius.pill, padding: 4 },
  segBtn: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 68, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: c.surface, borderRadius: radius.md, overflow: 'hidden' },
  fabWrap: { position: 'absolute', left: 0, right: 0, bottom: 28, alignItems: 'center' },
  fab: { elevation: 6, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 104, flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: radius.sm, backgroundColor: c.surfaceHigh },
});
