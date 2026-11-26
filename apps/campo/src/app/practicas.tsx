import { BEACH_RULES, type BeachRuleId } from '@retosame/shared';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../components/ui';
import { c, radius, type } from '../lib/theme';

const ICON: Record<BeachRuleId, IconName> = {
  perros: 'dog-side',
  fogatas: 'campfire',
  carpas: 'tent',
  vehiculos: 'car-off',
  ruido: 'volume-off',
  luces: 'lightbulb-off-outline',
  basura: 'trash-can-outline',
};

/** Mismo contenido que la web pública (packages/shared/src/content.ts). */
export default function Practicas() {
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}>
      <Text style={[type.body, { color: c.textDim, marginBottom: 6 }]}>
        Lo que se hace en la arena de Same, Tonchigüe y Atacames decide si un nido llega al mar. Recuérdaselo a quien veas en la playa.
      </Text>
      {BEACH_RULES.map((r) => (
        <View key={r.id} style={st.row}>
          <View style={st.icon}>
            <Icon name={ICON[r.id]} size={26} color={c.accent} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={type.title}>{r.title}</Text>
            <Text style={type.bodyDim}>{r.text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, padding: 14, borderRadius: radius.md, backgroundColor: c.surface, alignItems: 'flex-start' },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
});
