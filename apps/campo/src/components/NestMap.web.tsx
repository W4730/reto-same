import { Text } from 'react-native';
import type { LatLng } from './NestMap';

// La app de campo no corre en web (ver WebNotice en _layout); esto solo evita que el bundle web se rompa.
export function NestMap({ pos }: { center: LatLng; pos: LatLng; color: string; editable: boolean; onMove: (p: LatLng) => void }) {
  return <Text>{pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}</Text>;
}
