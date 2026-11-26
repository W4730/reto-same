# Reto Same · Handout de identidad visual

Referencia rápida para el equipo que diseña la app de registro de nidos. Tiene dos partes:

- **Parte I · Marca (secciones 1–10).** Sale del sitio actual de la fundación (retosame.byethost7.com), revisado el 25 de noviembre de 2026. Reto Same no tiene un manual de marca formal, así que esto documenta lo que el sitio usa en la práctica, más notas para pasarlo a la app.
- **Parte II · Funcionalidades (secciones 11–16).** Sale de la entrevista de Tabata con Alan Miranda y de las decisiones del equipo: los cuatro públicos, señal inestable en la playa y una versión lo más funcional posible.
- **Parte III · Arquitectura técnica (sección 17).** Stack recomendado para la app de campo (Expo) y la web pública (Vite).

---

## 1. La organización en breve

**Nombre:** Fundación Reto Same (RETO = **Re**scate de **To**rtugas)
**Lema del sitio:** *"Conectados con el mar"*
**Ubicación:** Same, Tonchigüe y Atacames, provincia de Esmeraldas, Ecuador
**Origen:** en 2017, prestadores de servicios turísticos crearon *Same Seguro* para atender la inseguridad en la playa. En 2020, con la llegada masiva de tortugas a anidar, de ahí nació Reto Same como grupo de voluntarios.

**Misión (resumida):** proteger la vida marina, en especial las tortugas, en la zona de anidación de Same, mediante conservación del hábitat, educación ambiental e investigación.
**Visión (resumida):** que el turismo, la comunidad y las tortugas convivan en un ecosistema marino sano.

**Pilares que comunica el sitio:** compromiso con la biodiversidad, colaboración comunitaria y educación para el cambio (donde mencionan explícitamente "herramientas digitales").

**Especies que reportan:** golfina (la más común), verde, laúd, caguama y carey. Laúd y carey están en peligro crítico.

**Cifras públicas (desde 2020):** 1,474 nidos protegidos · 174,400 neonatos liberados · 50 limpiezas de playa · 180 perros y gatos esterilizados. Ver la sección 9: hay cifras que no cuadran entre páginas.

---

## 2. Logo

![Logo Reto Same](https://retosame.byethost7.com/wp-content/uploads/2025/01/0.png)

Archivo original: `https://retosame.byethost7.com/wp-content/uploads/2025/01/0.png` (PNG, 478 × 478 px, fondo transparente)

**Cómo es:** un sello circular. Tiene un anillo exterior azul marino con el texto blanco *"FUNDACIÓN RETO SAME"* en el arco superior y *"RESCATE DE TORTUGAS"* en el inferior, y al centro un círculo turquesa con una tortuga marina vista desde arriba.

**Colores medidos en el archivo:** cerca del 55 % del logo es azul marino (aprox. `#194171`), alrededor del 9 % es turquesa (aprox. `#10A0B0`) y el resto es blanco o azul muy claro.

**Cómo lo usa el sitio:** arriba a la izquierda en el header, encima de la foto del hero.

**Decisión actual:** por ahora la app usa este PNG. Cuando exista la versión vectorial se reemplaza.

**Notas para la app:**
- No existe versión horizontal ni versión solo-símbolo. Hay que pedírsela a Alan o proponer una.
- A tamaño de ícono de app (48–192 px) el texto del anillo no se lee. Para el ícono conviene usar solo la tortuga sobre el círculo turquesa, o la tortuga en blanco sobre el azul marino.
- No hay versión monocromática. Para pantallas oscuras o modo nocturno probablemente haga falta una en blanco.
- Pedir el archivo vectorial (SVG/AI). El PNG de 478 px no alcanza para splash screens grandes ni para impresión.

---

## 3. Paleta de color

### Colores de marca

| Muestra | Nombre propuesto | HEX | RGB | Dónde aparece en el sitio |
|---|---|---|---|---|
| 🟦 | **Azul Reto** | `#194171` | 25, 65, 113 | Color dominante del logo, botones (*Contáctanos*, *Conócenos*), fondo de la sección "Únete al Reto Same", popup del newsletter |
| 🟦 | **Azul Profundo** | `#1E3A52` | 30, 58, 82 | Color base del texto en todo el sitio |
| 🟩 | **Turquesa** | `#1796A6` | 23, 150, 166 | Títulos de tarjetas (*Conviértete en voluntario*, *Apadrina un nido*), cifras de logros, subtítulos |
| 🟩 | **Turquesa Claro** | `#21A8B4` | 33, 168, 180 | Botón *Enviar* del newsletter, líneas divisorias bajo los títulos |

### Neutros y apoyo

| Nombre propuesto | HEX | Uso en el sitio |
|---|---|---|
| Noche | `#0F172A` | Fondo del footer |
| Blanco | `#FFFFFF` | Fondo principal, texto sobre fotos y sobre azul |
| Espuma | `#E7F6FF` | Texto del menú de navegación |
| Bruma | `#D2E7F0` | Títulos y párrafos sobre el fondo Azul Reto |
| Azul Grisáceo | `#7C9BBD` | Fondo del bloque del feed de Instagram |
| Azul Cielo | `#408BD1` | Botón "Seguir en Instagram" |

### Colores que **no** son de la marca

- `#25D366`: el botón flotante de WhatsApp. Es el color de WhatsApp y llega con el plugin, no con Reto Same.
- `#0067FF`, `#005EE9` y el resto de variables `--ast-global-color-*`: valores por defecto de la plantilla Astra. Están en el CSS pero el sitio no los muestra. No hay que usarlos.

### Contraste (WCAG 2.1)

| Combinación | Ratio | Resultado |
|---|---|---|
| Azul Reto sobre blanco | 10.3 : 1 | ✅ AA y AAA |
| Azul Profundo sobre blanco | 11.8 : 1 | ✅ AA y AAA |
| Bruma sobre Azul Reto | 8.1 : 1 | ✅ AA y AAA |
| Blanco sobre Noche | 17.9 : 1 | ✅ AAA |
| Turquesa sobre blanco | 3.5 : 1 | ⚠️ Solo texto grande (≥ 24 px o ≥ 19 px en negrita) |
| Turquesa Claro sobre blanco | 2.9 : 1 | ❌ No apto para texto |
| Blanco sobre Turquesa Claro (botón *Enviar*) | 2.9 : 1 | ❌ No apto para texto |
| Turquesa sobre Azul Reto | 2.9 : 1 | ❌ No apto para texto |

**Propuesta para la app (no está en el sitio):** agregar un **Turquesa Oscuro `#0F7480`** (5.5 : 1 sobre blanco, pasa AA) para links, texto en turquesa y botones con texto blanco. El turquesa original queda para títulos grandes, íconos y acentos.

---

## 4. Tipografía

Las fuentes vienen de Google Fonts, así que se pueden usar libremente en la app.

| Fuente | Peso | Rol en el sitio |
|---|---|---|
| **Roboto** | 100 (Thin) | H1 del hero, en mayúsculas: *"CONECTADOS CON EL MAR"* (77 px) |
| **Roboto** | 300 / 400 | Texto de cuerpo, menú, etiquetas de cifras |
| **Roboto** | 500 | Títulos de tarjetas en turquesa (29 px) |
| **Roboto** | 700 | Énfasis dentro de párrafos (*Same, Tonchigüe y Atacames*) |
| **Montserrat** | 700 | Titulares de sección en mayúsculas: *"ÚNETE AL RETO SAME"* (34 px) |
| Oswald | 300 | Solo el título del popup del newsletter |
| Poppins | 700 | Solo el botón *Enviar* del newsletter |

**Recomendación para la app:** quedarse con dos familias, **Montserrat 700** para títulos y **Roboto** para todo lo demás. Oswald y Poppins aparecen una sola vez cada una y parecen restos del plugin del popup, no una decisión de marca. Roboto Thin (100) se ve bien a 77 px en el hero web, pero en móvil y a la luz del sol no se lee. En la app conviene no bajar de 400 en texto funcional.

---

## 5. Componentes y estilo visual del sitio

- **Botones:** rectangulares y planos, Azul Reto con texto blanco. Los CTA secundarios son texto en mayúsculas con flecha: *REGÍSTRATE →*. El único botón redondeado (50 px de radio) es el de WhatsApp.
- **Íconos:** de línea, en Azul Reto, dentro de círculos blancos con sombra suave (escudo, huevo, tacho de basura, huella de mascota). Librería: Font Awesome 5.
- **Divisores:** una línea fina turquesa debajo de los titulares de sección.
- **Secciones:** se alternan bloques blancos con bloques Azul Reto de ancho completo, y fotos con capa oscura y texto blanco encima.
- **Cifras:** números grandes en turquesa con etiqueta gris clara debajo, animados al hacer scroll.

---

## 6. Fotografía

Fotos reales y propias, sin stock: arena oscura con huellas de tortuga, neonatos golfina, manos de voluntarios con guantes azules, familias y niños en la playa, tomas de dron de la costa. Alan dijo en la entrevista que tiene material nuevo de dron y cámara que se puede pedir.

En el sitio, las fotos de fondo llevan una capa oscura para que el texto blanco se lea encima. En la app sirve el mismo recurso en el onboarding y en las pantallas educativas.

---

## 7. Voz y tono

- **Cercana y en tuteo:** *"Súmate"*, *"Únete"*, *"Regístrate"*, *"Ayúdanos"*.
- **Educativa sin ser técnica:** explican por qué importan las tortugas antes de pedir algo.
- **Arraigada en el lugar:** se nombra siempre a Same, Tonchigüe, Atacames y Esmeraldas, y aparece la comunidad local.
- **Con llamados a la acción concretos:** voluntariado, apadrinar un nido, donar, compartir.
- **Hashtags recurrentes:** `#RetoSame` (el oficial), `#tortugagolfina`, `#educacionambiental`, `#turismosostenible`, `#turismocientifico`, `#vidamarina`, `#conservation`.

---

## 8. Canales y contacto

| Canal | Dato |
|---|---|
| Sitio web | retosame.byethost7.com (hosting y dominio gratuitos; Alan perdió el acceso de administración) |
| Instagram | @reto.same, su canal más activo |
| Facebook, YouTube | Enlazados desde la página de contacto |
| WhatsApp / teléfono | +593 98 428 1540 |
| Email | reto.same2020@gmail.com (footer) · reto.same@gmail.com (página de contacto). Hay que confirmar cuál es el vigente |

**Secciones del sitio:** Home · ¿Quiénes somos? (Problemática, ¿Qué hacemos?) · ¿Cómo ayudarnos? (Apadrina un nido, Voluntarios) · Transparencia · Contáctanos

**Programas que la app podría conectar:** *Apadrina / Adopta un nido*, que promete fotos y actualizaciones del nido hasta la eclosión, voluntariado, donaciones únicas o recurrentes y alianzas con empresas.

---

## 9. Inconsistencias en el sitio (no copiarlas)

1. **Neonatos liberados:** el Home dice **174,400**; *Quiénes somos* y *Transparencia* dicen **147,400**.
2. **Nidos protegidos:** *Transparencia* desglosa 319 + 352 + 305 + 358 por temporada, que suma **1,334**, pero el total publicado es **1,474**. Probablemente falta la temporada 2024–2025 (unos 140 nidos). Confirmar con Alan.
3. **Dos correos distintos** (ver sección 8).
4. **Errata en el menú:** dice *"TRANPARENCIA"*.
5. **Contraste:** el turquesa claro con texto blanco no pasa WCAG (ver sección 3).

Antes de poner cifras en la app o en la presentación del proyecto, hay que validarlas con la fundación.

---

## 10. Tokens sugeridos para la app

Los nombres son propuesta nuestra; los valores salen del sitio, salvo `turquoise-700`, que es el agregado de accesibilidad.

```css
:root {
  /* Marca */
  --rs-navy-700:      #194171; /* Azul Reto: primario */
  --rs-navy-800:      #1E3A52; /* Azul Profundo: texto */
  --rs-turquoise-500: #1796A6; /* Turquesa: acento, títulos grandes */
  --rs-turquoise-400: #21A8B4; /* Turquesa Claro: decoración, nunca con texto */
  --rs-turquoise-700: #0F7480; /* Turquesa Oscuro: links y botones (agregado) */

  /* Neutros */
  --rs-night:   #0F172A;
  --rs-white:   #FFFFFF;
  --rs-foam:    #E7F6FF;
  --rs-mist:    #D2E7F0;
  --rs-slate:   #7C9BBD;

  /* Tipografía */
  --rs-font-display: "Montserrat", sans-serif; /* 700, mayúsculas en titulares */
  --rs-font-body:    "Roboto", sans-serif;     /* 400 / 500 / 700 */
}
```

---
---

# Parte II · Funcionalidades de la app

## 11. Punto de partida

Hoy Reto Same registra los nidos en un mapa de Google Earth. Funciona como solución temporal, pero Alan señaló tres límites concretos:

1. **El mapa no aguanta el volumen.** Con cientos de nidos y etiquetas que son fechas completas, al alejar o acercar se ve un amontonamiento de puntos.
2. **Los puntos se mueven por error.** Al editar, a veces se arrastra otra ubicación sin querer, y ya no hay forma de saber dónde estaba el nido original sin volver a la playa.
3. **Si cargar datos es lento, los voluntarios no lo hacen bien.** Cuando registran todo solos se equivocan de fechas y los datos quedan segmentados.

Lo que Google Earth sí hace bien, y hay que conservar: es gratis, se puede compartir públicamente y permite subir fotos.

**Objetivo:** que cualquier persona que haya usado el mapa anterior note la mejora desde el primer registro. Registrar tiene que ser más rápido, el mapa tiene que leerse mejor y los datos tienen que llegar más limpios.

---

## 12. Plataforma

**Dos frentes y un solo backend.** Cada público usa la herramienta que mejor se adapta a su situación:

| Frente | Para quién | Tecnología | Por qué |
|---|---|---|---|
| **App de campo** | Voluntarios y coordinador | Expo (React Native) | Trabajan de noche en la playa, donde la señal se cae sin aviso. Una app nativa guarda datos y fotos de forma confiable sin conexión, y puede sincronizar en segundo plano |
| **Web pública (PWA)** | Turistas, estudiantes y hoteleros | Vite + React | El turista escanea el QR y se abre al instante, sin descargar nada. Se puede instalar en la pantalla de inicio |

Los dos usan **la misma base de datos**. Así se cumple el pedido de Alan de que *"la aplicación y el sitio web estén todo conectado"*: lo que el coordinador valida en la app aparece solo en la web. La web pública también puede reemplazar al sitio actual, al que perdieron el acceso.

El detalle técnico está en la sección 17.

---

## 13. Funcionalidades por público

Prioridad: **P1** = imprescindible para la primera versión · **P2** = si da el tiempo · **P3** = a futuro.

### 13.1 Voluntario: registro en campo

La regla de diseño sale de la entrevista: **pocos clics y nada que el voluntario pueda equivocar**. Todo lo que el teléfono sepa lo llena solo.

| Funcionalidad | Detalle | Prioridad |
|---|---|---|
| Registro en 3 pasos | 1) Ubicación, 2) foto, 3) confirmar. Fecha y hora se toman automáticamente del teléfono | P1 |
| Ubicación GPS con precisión visible | Muestra el margen de error (± m) y pide esperar a que se estabilice, porque Alan se para encima del nido justamente por la imprecisión del móvil | P1 |
| Foto obligatoria en el momento | Requisito explícito de Alan. Se toma desde la cámara, no desde la galería, para que fecha y lugar sean reales | P1 |
| Código corto automático por nido | Ej. `S26-0142`. Reemplaza la fecha completa como etiqueta en el mapa | P1 |
| Campos opcionales | Especie, medida de huellas, notas. Opcionales porque hoy no siempre se miden y toma tiempo | P1 |
| Funciona sin señal | Todo el registro, foto incluida, se guarda en el teléfono y se sube solo al volver la conexión. En la costa la señal se cae sin aviso, así que esto es la base de la app, no un extra | P1 |
| Indicador de sincronización | El voluntario ve cuántos registros faltan por subir y puede forzar el envío. Evita que cierre la app creyendo que ya se enviaron | P1 |
| Mis registros | Lista de lo que el voluntario subió y su estado (pendiente / validado) | P2 |
| Modo nocturno | Interfaz oscura con acentos rojos y brillo bajo, coherente con el protocolo de luz roja. *Por confirmar con Alan* | P2 |

### 13.2 Coordinador: validación y gestión

Alan propuso que *"alguien encargado ordene la información"*. Este rol es el que mantiene los datos limpios.

| Funcionalidad | Detalle | Prioridad |
|---|---|---|
| Bandeja de validación | Registros nuevos en espera. El coordinador revisa la foto y la ubicación, y corrige o aprueba | P1 |
| Ubicación bloqueada tras validar | Un nido validado no se puede mover al editar. Corrige el problema principal de Google Earth | P1 |
| Estado del nido | Activo → Próximo a eclosionar → Eclosionado / Perdido. *Por confirmar si existe "Reubicado" (las publicaciones mencionan reubicación de nidos)* | P1 |
| Fecha estimada de eclosión | Calculada sola: ventana de 45 a 60 días desde la llegada, con 53 días como referencia en Same. Se muestra como rango, no como día exacto, porque con El Niño nacen antes | P1 |
| Importar datos de Google Earth | Cargar el KML actual para que todos los nidos registrados aparezcan desde el primer día. Sin esto, la app empieza vacía y nadie va a querer cambiarse | P1 |
| Roles y accesos | Invitar voluntarios y definir quién puede validar | P1 |
| Alertas de nidos por eclosionar | Aviso al coordinador cuando un nido entra en su ventana de eclosión | P2 |
| Exportar datos | CSV y KML. Los datos son públicos y los estudiantes de las universidades los usan | P2 |
| Historial de cambios | Quién cambió qué y cuándo, para auditar correcciones | P3 |

### 13.3 Turista: mapa y protocolo SOS

Alan insistió en no abrumar: el turista no necesita datos técnicos, necesita saber **dónde no pisar y qué hacer si ve una tortuga**.

| Funcionalidad | Detalle | Prioridad |
|---|---|---|
| Mapa de zonas de anidación | El público ve **sectores de playa** con cuántos nidos activos tiene cada uno, no la ubicación exacta de cada nido (ver la nota debajo) | P1 |
| Protocolo SOS de tortugas | Pasos cortos y visuales: mantener distancia, nada de flash ni linterna blanca, usar luz roja, esperar a que termine de anidar. Si hay neonatos perdidos, juntarlos en un recipiente | P1 |
| Llamar a los encargados | Botón directo a llamada o WhatsApp (+593 98 428 1540) desde el protocolo | P1 |
| Reportar avistamiento | Foto + ubicación en dos toques. Llega como notificación al coordinador y queda registrado (propuesta de Tabata) | P1 |
| Buenas prácticas en la playa | Perros, fogatas, carpas, vehículos, ruido y luces artificiales | P1 |
| Acceso por QR | QR imprimible para playa, hoteles y Airbnb que abre la sección del turista | P1 |
| Temporada | Indicar que de agosto a octubre es casi seguro ver tortugas, y que en otros meses es más probable ver neonatos | P2 |
| Protocolo disponible sin señal | La web guarda el protocolo SOS y las buenas prácticas en el teléfono la primera vez que se abre, así funciona en la playa aunque no haya señal | P1 |
| Idioma inglés | Para turistas extranjeros | P3 |

**Nota sobre la precisión pública.** La práctica habitual en conservación es no publicar la ubicación exacta de nidos activos. Por ejemplo, en la costa de KwaZulu-Natal (Sudáfrica) los nidos de tortuga boba no se marcan y su ubicación exacta se mantiene en secreto por el riesgo de saqueo, y piden al público no difundirla. La regla de la app:

- **Nidos activos:** el público ve solo el sector y el conteo. Las coordenadas exactas las ven voluntarios y coordinador con sesión iniciada.
- **Nidos eclosionados o de temporadas pasadas:** las coordenadas exactas pueden ser públicas, porque ya no hay riesgo. Así el mapa de calor y los datos abiertos para estudiantes siguen siendo útiles.

Alan hoy publica el mapa abierto en Instagram, así que esta regla es más restrictiva que lo que hace ahora. Es una decisión provisional: si él prefiere el mapa abierto, se cambia en un solo lugar del código.

### 13.4 Estudiantes y hoteleros: educación y comunidad

| Funcionalidad | Detalle | Prioridad |
|---|---|---|
| Estadísticas públicas | Nidos por temporada, neonatos liberados, mapa de calor de concentración de nidos (Alan destacó que se nota dónde anidan más) | P2 |
| Fichas de especies | Golfina, verde, laúd, caguama y carey: cómo reconocerlas y dónde anidan | P2 |
| Kit para hoteleros | QR descargable y material para integrar la historia de las tortugas en sus servicios, como un "Airbnb más ecológico" | P2 |
| Súmate | Enlaces a voluntariado, Apadrina un nido y donaciones (ya existen en la web) | P2 |
| Apadrina un nido conectado | Con el código de cada nido, el padrino sigue su estado real hasta la eclosión | P3 |
| Descarga de datos abiertos | CSV para investigación universitaria | P3 |

---

## 14. Antes y después

La comparación que el equipo debería poder demostrar en la presentación:

| Hoy con Google Earth | Con la app |
|---|---|
| Etiquetas con fechas completas que se amontonan | Códigos cortos y puntos agrupados en clusters |
| Puntos que se mueven por error al editar | Ubicación bloqueada después de validar |
| El voluntario escribe la fecha a mano y se equivoca | Fecha y hora automáticas |
| Fecha de eclosión calculada a mano | Ventana de eclosión automática con alertas |
| Un solo mapa para todos | Una vista para cada público |
| El turista tiene que llamar para saber qué hacer | Protocolo SOS y reporte desde el QR |
| Alan actualiza el mapa público cuando puede | El mapa público se actualiza solo al validar |

---

## 15. Estados del nido en el mapa (propuesta)

Cada estado se distingue por **forma y color** a la vez, para que funcione bajo sol fuerte y para personas con daltonismo.

| Estado | Marcador | Color |
|---|---|---|
| Pendiente de validar | Círculo con borde punteado | Gris `#7C9BBD` |
| Activo | Círculo relleno | Turquesa `#1796A6` |
| Próximo a eclosionar | Círculo con anillo exterior | Ámbar `#E0A100` (fuera de la paleta de marca, a propósito, para que resalte) |
| Eclosionado | Círculo con check | Azul Reto `#194171` |
| Perdido | Círculo con × | Gris oscuro `#4A5A6A` |

---

## 16. Decisiones y preguntas abiertas

**Decidido por el equipo (provisional, se puede revisar):**

- **Señal:** se asume mala e intermitente. El modo sin conexión es P1.
- **Logo:** se usa el PNG del sitio hasta tener el vector.
- **Precisión pública:** sectores y conteos para nidos activos; coordenadas exactas solo para nidos eclosionados (ver 13.3).
- **Plataforma:** app de campo en Expo y web pública en Vite, con Firebase como backend (ver 12 y 17).

**Por confirmar con Reto Same:**

1. ¿Quién valida los registros: solo Alan o varias personas? Define los roles.
2. ¿Qué estados reales tiene un nido? En particular, si se reubican nidos y si se registra la depredación (perros).
3. ¿Escriben un código en la estaca del nido? Define si el código corto tiene que generarse sin señal (ver 17.4).
4. ¿Una pantalla brillante molesta a las tortugas al anidar? Define si el modo nocturno es obligatorio.
5. ¿Nos puede compartir el KML de Google Earth y, cuando lo tenga, el logo en vector?
6. ¿Qué cifras son las correctas para la app? (ver sección 9)
7. ¿Cómo divide él la playa? Si ya usa sectores o referencias (frente a tal hotel, la desembocadura del río), conviene usar esos mismos nombres en el mapa público.
8. ¿Qué teléfonos usan los voluntarios? Define si hace falta la versión de iPhone desde el inicio (ver 17.6).

---
---

# Parte III · Arquitectura técnica

## 17. Stack recomendado

### 17.1 Visión general

```
┌─────────────────────────┐        ┌──────────────────────────┐
│  App de campo (Expo)    │        │  Web pública (Vite+React)│
│  Voluntario · Coord.    │        │  Turista · Estudiante ·  │
│  Offline-first          │        │  Hotelero · PWA          │
└───────────┬─────────────┘        └────────────┬─────────────┘
            │  Firestore offline                │  lectura pública
            │  + cola de fotos                  │  + reportes
            └──────────────┬────────────────────┘
                           ▼
              ┌───────────────────────────┐
              │  Firebase                 │
              │  Firestore · Auth         │
              │  Storage · Cloud Functions│
              │  Cloud Messaging · Hosting│
              └───────────────────────────┘
```

**Repositorio:** un monorepo con `apps/campo` (Expo), `apps/web` (Vite), `functions/` (Cloud Functions) y `packages/shared` (tipos TypeScript, estados del nido, cálculo de la ventana de eclosión, tokens de color). En la raíz van `firebase.json`, `firestore.rules`, `firestore.indexes.json` y `storage.rules`, versionados y desplegados con Firebase CLI. Así la regla de los 45 a 60 días y los estados viven en un solo lugar y las dos apps no se desincronizan.

### 17.2 Backend: Firebase

| Servicio | Uso |
|---|---|
| Firestore | Nidos, sectores, reportes de turistas y vistas públicas |
| Auth | Inicio de sesión de voluntarios y coordinadores. El turista no necesita cuenta |
| Storage | Fotos de nidos y de reportes |
| Cloud Functions | Asignar el código corto, calcular el sector de cada nido, mantener los conteos públicos y avisar al coordinador |
| Cloud Messaging (FCM) | Notificaciones push al coordinador |
| Hosting | La web pública |

**Dos condiciones de Firebase que hay que resolver antes de empezar:**

1. **Plan Blaze obligatorio.** Cloud Storage for Firebase ahora exige el plan Blaze, de pago por uso, aunque mantiene un uso gratuito dentro de ese plan. Cloud Functions también lo exige. En la práctica, alguien del equipo tiene que asociar una tarjeta al proyecto. Con el volumen de Reto Same (unos cientos de nidos por temporada) el uso debería quedar dentro de la capa gratuita, pero conviene **configurar una alerta de presupuesto** en Google Cloud el primer día.
2. **Región del bucket.** El nivel "Always Free" de Storage aplica a buckets en `us-central1`, `us-east1` y `us-west1`. Usen `us-east1`, que es la más cercana a Ecuador, y creen Firestore en la misma región.

**Las reglas de seguridad no filtran campos.** Firestore entrega el documento completo o nada, así que la regla de precisión pública (13.3) no se puede resolver ocultando la coordenada dentro del documento del nido. Por eso los datos públicos viven en colecciones separadas que una Cloud Function mantiene al día (ver 17.8).

### 17.3 App de campo: Expo

| Necesidad | Librería |
|---|---|
| Datos sin conexión | `@react-native-firebase/firestore` (SDK nativo, con caché persistente en disco) |
| Auth, Storage y push | `@react-native-firebase/auth`, `/storage`, `/messaging` |
| Fotos sin conexión | `expo-camera` + `expo-file-system` + cola propia (ver 17.4) |
| GPS con precisión | `expo-location` (usar alta precisión y mostrar el `accuracy` en metros) |
| Detectar conexión | `@react-native-community/netinfo` |
| Reintentar en segundo plano | `expo-background-task` |
| Mapa | `@maplibre/maplibre-react-native` (soporta mapas descargados para usar sin conexión) |

**Usen React Native Firebase, no el SDK web de Firebase.** El SDK web (`firebase` en npm) no tiene persistencia offline en React Native: hay reportes abiertos de que activarla falla en Expo. React Native Firebase usa los SDK nativos de Android e iOS, que guardan los datos en disco.

**Development build desde el día uno.** Ni React Native Firebase ni MapLibre funcionan en Expo Go. Configuren EAS Build la primera semana para no descubrirlo al final.

### 17.4 Cómo funciona el modo sin conexión

Con Firebase, el modo sin conexión tiene dos partes:

**Datos del nido: los resuelve Firestore.** Con el SDK nativo, cuando el voluntario guarda un nido sin señal, Firestore lo escribe en la caché local y lo envía solo cuando vuelve la conexión, incluso si la app se cerró entre medio. No hace falta programar una cola para los datos.

- El ID del documento se genera en el teléfono, así un reintento nunca duplica el nido.
- La app muestra "pendiente de subir" leyendo `metadata.hasPendingWrites` del documento.

**Fotos: hay que hacer una cola propia.** Firestore no guarda archivos, y la subida a Storage necesita conexión. El flujo:

1. La foto se comprime (≈ 1600 px, JPEG 70–80 %) y se guarda en `expo-file-system`. El documento del nido guarda la ruta local y `photoStatus: "local"`.
2. Cuando NetInfo detecta conexión, o se ejecuta la tarea en segundo plano, la app sube las fotos pendientes a Storage con una ruta fija por nido (`nests/{nestId}/foto.jpg`), así un reintento sobrescribe en vez de duplicar.
3. Al terminar, actualiza el documento con `photoStatus: "subida"` y la ruta de Storage, y borra la copia local.

**Código corto:** una Cloud Function lo asigna al llegar el nido al servidor (`S26-0142`), usando un contador por temporada dentro de una transacción. Si Alan confirma que escriben el código en la estaca en el momento (pregunta 3 de la sección 16), tiene que generarse sin señal. En ese caso se puede dar a cada voluntario un prefijo propio (`S26-MA-07`) para que dos teléfonos nunca generen el mismo.

### 17.5 Web pública: Vite + React

| Necesidad | Herramienta |
|---|---|
| Proyecto | Vite + React + TypeScript |
| PWA instalable y caché sin conexión | `vite-plugin-pwa` (Workbox). Guardar en caché el protocolo SOS, las buenas prácticas y las fichas de especies |
| Datos | SDK web de Firebase (`firebase`), leyendo solo las colecciones públicas. En navegador sí funciona la caché persistente (`persistentLocalCache`) |
| Mapa | `maplibre-gl` (MapLibre GL JS), el mismo motor que la app de campo |
| Reporte de avistamiento | `navigator.geolocation` + `<input type="file" accept="image/*" capture="environment">` para abrir la cámara directamente |
| Antispam en reportes | Firebase App Check, porque el formulario es público y sin cuenta |
| Hosting | Firebase Hosting |

**Limitaciones de iPhone que hay que conocer:** en iOS, una web app no puede sincronizar en segundo plano, y las notificaciones push solo funcionan si el usuario la agregó a la pantalla de inicio. Para la web pública no es un problema (el turista lee y reporta con conexión), pero es la razón por la que la app de campo es nativa y no PWA.

### 17.6 Mapas: de dónde salen las teselas

**No usar `tile.openstreetmap.org`** para el modo sin conexión. La política de OpenStreetMap prohíbe expresamente descargar zonas para usarlas offline y recomienda teselas propias o un proveedor que lo permita.

Opciones:

- **Teselas propias en formato PMTiles:** se recorta un archivo solo con la zona de Same–Tonchigüe–Atacames a partir de datos de OpenStreetMap (licencia abierta, con atribución) y se aloja en Firebase Hosting o Storage. Es gratis y el archivo es pequeño porque la zona es pequeña. Verificar que la versión de MapLibre que usen lea PMTiles.
- **Proveedor con plan gratuito** (MapTiler, Stadia Maps). Revisar en sus términos si permiten descarga offline en el plan gratuito.

Para la primera versión, el registro **no depende del mapa**: el voluntario captura GPS, foto y fecha aunque las teselas no carguen. El mapa offline en la app de campo puede ser P2.

**Imagen satelital:** Google Earth les daba vista satelital, que ayuda a ubicarse en la playa. Si la quieren, revisen las condiciones de uso del proveedor antes de usarla sin conexión.

### 17.7 Distribución de la app de campo

- **Android:** con EAS Build se genera un APK que se instala desde un enlace, sin pasar por Play Store. Es la vía más rápida para que los voluntarios la prueben.
- **iPhone:** instalar un build de prueba en un iPhone requiere una cuenta del Apple Developer Program (pagada). Si ninguno del equipo la tiene, empiecen con Android y dejen iOS para después. Confirmar qué teléfonos usan los voluntarios (pregunta 8 de la sección 16).

### 17.8 Modelo de datos en Firestore

```
users/{uid}
  name, role: "voluntario" | "coordinador" | "admin"

sectors/{sectorId}
  name: "Same Norte"
  polygon: [ {lat, lng}, … ]          // dibujado una vez

nests/{nestId}                         // PRIVADA: solo usuarios con sesión
  code: "S26-0142"                     // lo asigna una Function
  location: GeoPoint
  geohash: "d27…"                      // con geofire-common, para consultas por zona
  gpsAccuracyM: 4.2
  laidAt: Timestamp                    // automático
  hatchFrom: Timestamp                 // laidAt + 45 días
  hatchTo: Timestamp                   // laidAt + 60 días
  species: "golfina" | "verde" | "laud" | "caguama" | "carey" | null
  trackWidthCm: number | null
  notes: string
  photoStatus: "local" | "subida"
  photoPath: "nests/{nestId}/foto.jpg"
  status: "pendiente" | "activo" | "por_eclosionar" | "eclosionado" | "perdido"
  locationLocked: false                // true al validar
  sectorId: string                     // lo calcula una Function
  season: "2026-2027"
  createdBy, validatedBy: uid
  createdAt, validatedAt: Timestamp

sightings/{id}                         // reportes de turistas
  location: GeoPoint, photoPath, kind, contact?, createdAt, handledBy?

public_sectors/{sectorId}              // PÚBLICA: la mantiene una Function
  name, polygon, activeNests, hatchedThisSeason, updatedAt

public_nests/{nestId}                  // PÚBLICA: solo nidos eclosionados o perdidos
  location, sectorId, species, laidAt, hatchedAt, season
```

**Reglas de seguridad (resumen):**

- `nests`: leer y crear con sesión iniciada. Editar solo el coordinador. Ni siquiera el coordinador puede cambiar `location` si `locationLocked` es `true`.
- `sightings`: cualquiera puede crear (con App Check y validación de campos). Solo el coordinador puede leer.
- `public_*`: lectura abierta, escritura solo desde Cloud Functions.
- Storage: subir a `nests/` solo con sesión iniciada; `sightings/` abierto con límite de tamaño y tipo de imagen.

**Cloud Functions:**

| Disparador | Qué hace |
|---|---|
| `nests` creado | Asigna el código corto, calcula el sector (punto dentro de polígono con `@turf/boolean-point-in-polygon`) y la ventana de eclosión |
| `nests` actualizado | Recalcula `public_sectors`. Si el nido pasa a eclosionado o perdido, lo copia a `public_nests` |
| `sightings` creado | Envía una notificación FCM a los coordinadores |
| Programada (diaria) | Marca como `por_eclosionar` los nidos que entraron en su ventana y avisa al coordinador |

### 17.9 Orden de construcción sugerido

1. Firebase: plan Blaze con alerta de presupuesto, región `us-east1`, reglas, índices y la colección `sectors`. Importar el KML de Google Earth con un script local en Node (`firebase-admin`).
2. App de campo: registro offline (GPS + foto + Firestore + cola de fotos). Es lo que más valor demuestra frente a Google Earth.
3. Cloud Functions: código corto, sector y colecciones públicas.
4. App de campo: bandeja de validación del coordinador.
5. Web pública: mapa de sectores, protocolo SOS con caché offline y reporte de avistamiento.
6. Notificación al coordinador cuando llega un reporte.
7. Todo lo P2: estadísticas, fichas de especies, mapa offline en campo, modo nocturno.

Con Firebase CLI y el conector en VS Code, este documento sirve como especificación para generar `firestore.rules`, `storage.rules`, índices y Functions. Conviene pedirle a Claude Code que empiece por las reglas y las pruebe con el Emulator Suite antes de desplegar.

> **Actualización 25 nov 2026:** la fundación decidió el mapa abierto (§13.3). La web pública muestra la ubicación exacta de los nidos validados y un mapa de calor de concentración.
