# Reto Same · Diseño v1

Fuente: [handout.md](../../../handout.md). Este documento registra solo dónde nos apartamos del handout y qué entra en la v1.

## Intención
Reemplazar el mapa de Google Earth: registro de nidos más rápido y sin errores para voluntarios, datos limpios para el coordinador y una web pública para turistas que no expone nidos activos.

## Alcance v1 (P1 del handout)
- **App de campo (Expo):** login, registro en 3 pasos (GPS con ± m → foto con cámara → confirmar), campos opcionales, cola offline, indicador de sincronización, bandeja de validación del coordinador, cambio de estado.
- **Web pública (Vite PWA):** mapa de sectores con conteos, protocolo SOS offline, llamar/WhatsApp, reporte de avistamiento, buenas prácticas, página QR.
- **Backend (Supabase):** esquema, RLS, triggers, vistas públicas, buckets.
- **Script de importación KML** (corre cuando Alan comparta el archivo).

## Fuera de v1
Push al coordinador, App Check, modo nocturno, mapa offline en campo, estadísticas, fichas de especies, inglés.

## Desviaciones del handout (y por qué)
| Handout | v1 | Razón |
|---|---|---|
| Firebase | Supabase | Firebase exige plan Blaze con tarjeta; Supabase es gratis y RLS + vistas resuelven la regla de precisión pública sin colecciones espejo |
| React Native Firebase, MapLibre RN | supabase-js + cola propia, react-native-maps | Deben correr en Expo Go para desarrollo en vivo |
| Firebase Hosting | Vercel | Pedido del equipo |
| Cloud Functions | Triggers de Postgres | Código corto, sector (PostGIS), ventana de eclosión y bloqueo de ubicación viven en la base |
| Función diaria `por_eclosionar` | Se calcula al leer (`hatch_from <= now()`) | Sin cron que mantener |

## Modelo
- `profiles(id, name, role)`: rol `voluntario | coordinador | admin`.
- `sectors(id, name, geom polygon)`: provisionales hasta la pregunta 7.
- `nests`: según 17.8. `id` uuid generado en el teléfono (upsert idempotente). Triggers: `code` por temporada, `sector_id`, `hatch_from/to`, bloqueo de `location` si `location_locked`.
- `sightings`: insert anónimo, lectura solo coordinador.
- Vistas `public_sectors` (conteo de activos/eclosionados) y `public_nests` (solo eclosionado/perdido), accesibles para `anon`.
- Storage: `nests` (con sesión), `sightings` (anónimo, ≤ 5 MB, solo imágenes).

## Offline (campo)
Al guardar, el registro va a una cola en AsyncStorage y la foto comprimida (≈1600 px, JPEG 0.75) a `expo-file-system`. Cuando NetInfo detecta conexión o el usuario pulsa "Enviar": se sube la foto a `nests/{id}.jpg` con upsert, luego `upsert` de la fila y se borra de la cola. El indicador muestra el tamaño de la cola.

## Decisiones del builder
Sectores provisionales dibujados a mano en Same; tiles web de OpenFreeMap (gratis, sin clave); el turista no inicia sesión.
