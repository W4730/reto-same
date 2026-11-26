import { MaterialCommunityIcons } from '@expo/vector-icons';
import { STATUS_META, type NestStatus } from '@retosame/shared';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { c, font, radius, type } from '../lib/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export const Icon = MaterialCommunityIcons;

type BtnProps = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  big?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, icon, variant = 'filled', disabled, loading, big, style }: BtnProps) {
  const fg = variant === 'filled' || variant === 'danger' ? c.white : variant === 'tonal' ? c.text : c.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
      style={({ pressed }) => [
        s.btn,
        big && s.btnBig,
        variant === 'filled' && { backgroundColor: pressed ? c.primaryPressed : c.primary },
        variant === 'danger' && { backgroundColor: '#9B2C24' },
        variant === 'tonal' && { backgroundColor: c.surfaceHigh },
        variant === 'outlined' && { borderWidth: 1, borderColor: c.outline },
        (disabled || loading) && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={big ? 24 : 20} color={fg} /> : null}
      <Text style={[s.btnLabel, big && { fontSize: 17 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Marcador de estado: forma + color (sección 15 del handout), legible con daltonismo y bajo sol. */
export function StatusMarker({ status, size = 22 }: { status: NestStatus; size?: number }) {
  const m = STATUS_META[status];
  const base = { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' } as const;
  switch (m.shape) {
    case 'dashed':
      return <View style={[base, { borderWidth: 2, borderStyle: 'dashed', borderColor: m.color }]} />;
    case 'filled':
      return <View style={[base, { backgroundColor: m.color }]} />;
    case 'ring':
      return (
        <View style={[base, { borderWidth: 2, borderColor: m.color }]}>
          <View style={{ width: size * 0.55, height: size * 0.55, borderRadius: size, backgroundColor: m.color }} />
        </View>
      );
    case 'check':
      return (
        <View style={[base, { backgroundColor: m.color, borderWidth: 1.5, borderColor: '#8FB4DA' }]}>
          <Icon name="check-bold" size={size * 0.62} color={c.white} />
        </View>
      );
    case 'cross':
      return (
        <View style={[base, { backgroundColor: m.color, borderWidth: 1.5, borderColor: c.textDim }]}>
          <Icon name="close-thick" size={size * 0.62} color={c.white} />
        </View>
      );
  }
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.chip, selected && { backgroundColor: c.primary, borderColor: c.primary }]}
    >
      {selected && <Icon name="check" size={16} color={c.white} />}
      <Text style={[type.label, { color: selected ? c.white : c.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Banner({ icon, tone = 'info', children, action }: { icon: IconName; tone?: 'info' | 'warn' | 'ok'; children: ReactNode; action?: ReactNode }) {
  const col = tone === 'warn' ? c.amber : tone === 'ok' ? c.ok : c.accent;
  return (
    <View style={[s.banner, { borderColor: col + '55' }]}>
      <Icon name={icon} size={22} color={col} />
      <View style={{ flex: 1 }}>{children}</View>
      {action}
    </View>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[type.label, { color: c.textDim }]}>{label}</Text>
      {children}
    </View>
  );
}

export const s = StyleSheet.create({
  btn: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  btnBig: { minHeight: 60, paddingHorizontal: 28 },
  btnLabel: { fontFamily: font.medium, fontSize: 15, letterSpacing: 0.4 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.outline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    borderWidth: 1,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.outline,
    backgroundColor: c.surface,
    paddingHorizontal: 14,
    color: c.text,
    fontFamily: font.body,
    fontSize: 16,
  },
});
