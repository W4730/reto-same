import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../components/ui';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { c, radius, type } from '../lib/theme';

type P = { id: string; name: string; role: 'voluntario' | 'coordinador' | 'admin' };

/** Roles y accesos: el coordinador decide quién puede validar. Los voluntarios se registran desde el login. */
export default function Equipo() {
  const { session } = useAuth();
  const [people, setPeople] = useState<P[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('id,name,role').order('name').then(({ data, error }) => {
      if (error) setErr('Sin conexión. Intenta de nuevo con señal.');
      else setPeople(data as P[]);
    });
  }, []);

  async function setRole(p: P, role: P['role']) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', p.id);
    if (error) return setErr(error.message);
    setPeople((xs) => xs.map((x) => (x.id === p.id ? { ...x, role } : x)));
  }

  return (
    <FlatList
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      data={people}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={
        <Text style={[type.bodyDim, { marginBottom: 8 }]}>
          {err ?? 'Los voluntarios crean su cuenta desde la app. Aquí decides quién puede validar registros.'}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={st.row}>
          <Text style={[type.title, { flex: 1 }]} numberOfLines={1}>{item.name || 'Sin nombre'}{item.id === session?.user.id ? ' (tú)' : ''}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Chip label="Voluntario" selected={item.role === 'voluntario'} onPress={() => item.id !== session?.user.id && setRole(item, 'voluntario')} />
            <Chip label="Coordinador" selected={item.role !== 'voluntario'} onPress={() => setRole(item, 'coordinador')} />
          </View>
        </View>
      )}
    />
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: c.surface, borderRadius: radius.md },
});
