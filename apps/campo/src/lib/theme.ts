import { colors as brand } from '@retosame/shared';

// Tema nocturno: el voluntario trabaja de noche en la playa. Fondo Noche, poco brillo.
export const c = {
  bg: brand.night, // #0F172A
  surface: '#16213A',
  surfaceHigh: '#1E2C4A',
  outline: '#2E3F60',
  text: brand.foam, // #E7F6FF
  textDim: '#A9C3D6', // bruma atenuada, ~9:1 sobre bg
  primary: brand.turquoiseDark, // #0F7480, texto blanco 5.5:1
  primaryPressed: '#0B5F69',
  accent: brand.turquoise, // íconos y acentos grandes
  navy: brand.navy,
  amber: brand.amber,
  danger: '#F97066',
  ok: '#5FD3B0',
  white: '#FFFFFF',
} as const;

export const font = {
  display: 'Montserrat_700Bold',
  body: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
} as const;

// Escala tipo Material (sp). Titulares en Montserrat mayúsculas, como el sitio.
export const type = {
  display: { fontFamily: font.display, fontSize: 44, lineHeight: 50, color: c.text },
  headline: { fontFamily: font.display, fontSize: 20, lineHeight: 26, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: c.text },
  title: { fontFamily: font.medium, fontSize: 18, lineHeight: 24, color: c.text },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 22, color: c.text },
  bodyDim: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: c.textDim },
  label: { fontFamily: font.medium, fontSize: 14, lineHeight: 18, letterSpacing: 0.3, color: c.text },
  num: { fontFamily: font.medium, fontVariant: ['tabular-nums' as const], color: c.text },
};

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };
