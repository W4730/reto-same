import { Text } from 'react-native';
import type { Nest } from '../lib/supabase';

export type Sector = { id: string; name: string; geojson: { coordinates: number[][][] } };

// La app de campo no corre en web (WebNotice en _layout); esto solo evita que el bundle web importe react-native-maps.
export function NestsMap({ nests }: { nests: Nest[]; sectors: Sector[]; heat: boolean; onSelect: (n: Nest) => void }) {
  return <Text>{nests.length} nidos</Text>;
}
