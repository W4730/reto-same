# Reto Same · Registro de nidos

App de campo para voluntarios y coordinador, y web pública para turistas, de la **Fundación Reto Same** (Rescate de Tortugas, Same – Esmeraldas, Ecuador). Reemplaza el mapa de Google Earth.

- Especificación: [handout.md](handout.md) · decisiones de la v1: [docs/superpowers/specs](docs/superpowers/specs/2026-11-25-reto-same-app-design.md)

## Estructura

| Carpeta | Qué es |
|---|---|
| `apps/campo` | App Expo (SDK 58) para voluntarios y coordinador. Corre en **Expo Go**. Registro en 3 pasos, sin señal, validación |
| `apps/web` | Web pública Vite + React (PWA). SOS sin señal, mapa de sectores, reporte de avistamientos, QR. Se publica en Vercel |
| `packages/shared` | Estados del nido, ventana de eclosión (45–60 días), temporada, colores de marca |
| `supabase/migrations` | Esquema, reglas de acceso (RLS), triggers y funciones públicas |
| `scripts/import-kml.mjs` | Importa el KML de Google Earth |

## Empezar

```bash
npm install
npm test                      # dominio, cola offline e importador KML
```

### Variables de entorno

Copiar los `.env.example` y completar con los datos del proyecto Supabase (Project Settings → API):

```
apps/campo/.env   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_KEY
apps/web/.env     VITE_SUPABASE_URL, VITE_SUPABASE_KEY
```

Solo la clave **publishable/anon**. La `service_role` nunca va en las apps.

### App de campo (Expo Go)

```bash
npm start               # desde la raíz (equivale a: cd apps/campo && npx expo start)
```

Escanear el QR con Expo Go, o tecla `a` para el emulador Android. **No correr `npx expo start` en la raíz del repo**: falla con `Unable to resolve "../../App"` porque la app vive en `apps/campo`.

### Web pública

```bash
npm run web             # http://localhost:5173
npm run build -w apps/web
```

**Vercel:** importar el repo, *Root Directory* = `apps/web`, framework Vite, y agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` en Environment Variables. `apps/web/vercel.json` ya redirige las rutas a la SPA.

## Base de datos (Supabase)

Aplicar en orden los archivos de `supabase/migrations/` (0001 → 0004) (SQL Editor del panel, o `supabase db push`).

**Coordinadores:** al crear cuenta en la app, elegir "Coordinador" e ingresar el **código de coordinador** que reparten los coordinadores actuales. La base de datos valida el código (solo guarda su hash bcrypt en el esquema privado `private.settings`, que la API no expone); con un código incorrecto el registro se rechaza. Para cambiar el código, en el SQL Editor:

```sql
insert into private.settings (key, value)
values ('coordinator_code', extensions.crypt('NUEVO-CODIGO', extensions.gen_salt('bf')))
on conflict (key) do update set value = excluded.value;
```

Un coordinador también puede promover voluntarios desde la app (botón **Equipo**). Los reportes de turistas llegan al botón **Reportes**.

**Importar Google Earth:** exportar el mapa como KML y correr

```bash
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-kml.mjs nidos.kml
```

## Reglas que viven en la base (no en las apps)

- Código corto por temporada (`S26-0142`), sector y ventana de eclosión: trigger al insertar.
- Un nido validado no puede moverse: el trigger rechaza el cambio, incluso al coordinador.
- El público nunca lee la tabla `nests` (fotos, notas y quién registró son privados). Ve `public_sectors()` (conteos) y `public_nests()`: coordenadas exactas de todos los nidos validados, para el mapa de calor. Para volver a ocultar los activos, ver `supabase/migrations/0003_public_precision.sql`.
- `por_eclosionar` se calcula al leer (`hatch_from <= ahora`), sin tareas programadas.

## Pendiente de confirmar con Reto Same

Ver handout §16: nombres reales de los sectores (los actuales son provisionales), estado "reubicado", modo nocturno, cifras oficiales.
