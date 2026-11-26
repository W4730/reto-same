import { effectiveStatus } from '@retosame/shared';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import MapView, { Heatmap, Marker, Polygon } from 'react-native-maps';
import type { Nest } from '../lib/supabase';
import { StatusMarker } from './ui';

export type Sector = { id: string; name: string; geojson: { coordinates: number[][][] } };

const SAME = { latitude: 0.842, longitude: -79.929, latitudeDelta: 0.04, longitudeDelta: 0.04 };

/** Mapa de todos los nidos para el coordinador. En web se usa NestsMap.web.tsx. */
export function NestsMap({ nests, sectors, heat, onSelect }: { nests: Nest[]; sectors: Sector[]; heat: boolean; onSelect: (n: Nest) => void }) {
  // Los marcadores personalizados se dibujan una vez y luego se congelan (rendimiento con cientos de nidos).
  // Congelarlos desde el primer render en Android los deja en blanco.
  const [track, setTrack] = useState(true);
  useEffect(() => {
    setTrack(true);
    const t = setTimeout(() => setTrack(false), 1000);
    return () => clearTimeout(t);
  }, [nests, heat]);

  return (
    <MapView style={{ flex: 1 }} mapType="hybrid" initialRegion={SAME} toolbarEnabled={false}>
      {sectors.map((s) => (
        <Polygon key={s.id} coordinates={s.geojson.coordinates[0].map(([lng, lat]) => ({ latitude: lat, longitude: lng }))}
          strokeColor="rgba(231,246,255,0.9)" fillColor="rgba(23,150,166,0.12)" strokeWidth={1.5} lineDashPattern={[6, 6]} />
      ))}
      {heat && nests.length > 0 && (
        <Heatmap points={nests.map((n) => ({ latitude: n.lat, longitude: n.lng, weight: 1 }))} radius={40} opacity={0.85}
          gradient={{ colors: ['#9ED9DF', '#1796A6', '#194171', '#E0A100'], startPoints: [0.1, 0.4, 0.7, 1], colorMapSize: 256 }} />
      )}
      {!heat &&
        nests.map((n) => (
          <Marker key={n.id} coordinate={{ latitude: n.lat, longitude: n.lng }} tracksViewChanges={track} onPress={() => onSelect(n)}
            anchor={{ x: 0.5, y: 0.5 }}>
            {/* Fondo oscuro: el círculo punteado de "pendiente" se pierde sobre la imagen satelital. */}
            <View style={{ padding: 3, borderRadius: 99, backgroundColor: 'rgba(15,23,42,0.85)' }}>
              <StatusMarker status={effectiveStatus(n)} size={22} />
            </View>
          </Marker>
        ))}
    </MapView>
  );
}
