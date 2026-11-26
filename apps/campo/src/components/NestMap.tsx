import MapView, { Marker } from 'react-native-maps';

export type LatLng = { lat: number; lng: number };

/** Mapa satelital del nido. En web se usa NestMap.web.tsx (react-native-maps no existe allí). */
export function NestMap({ center, pos, color, editable, onMove }: { center: LatLng; pos: LatLng; color: string; editable: boolean; onMove: (p: LatLng) => void }) {
  return (
    <MapView style={{ flex: 1 }} mapType="satellite" initialRegion={{ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.002, longitudeDelta: 0.002 }}
      onPress={(e) => editable && onMove({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}>
      <Marker coordinate={{ latitude: pos.lat, longitude: pos.lng }} pinColor={color} draggable={editable}
        onDragEnd={(e) => onMove({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })} />
    </MapView>
  );
}
