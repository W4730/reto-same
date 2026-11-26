export const colors = {
  navy: '#194171',        // Azul Reto: primario
  ink: '#1E3A52',         // Azul Profundo: texto
  turquoise: '#1796A6',   // acento, títulos grandes (≥24px)
  turquoiseLight: '#21A8B4', // decoración, nunca con texto
  turquoiseDark: '#0F7480',  // links y botones con texto blanco
  night: '#0F172A',
  white: '#FFFFFF',
  foam: '#E7F6FF',
  mist: '#D2E7F0',
  slate: '#7C9BBD',
  amber: '#E0A100',
  danger: '#B42318',
} as const;

export const SOS_PHONE = '+593984281540';
export const SOS_PHONE_LABEL = '+593 98 428 1540';
export const WHATSAPP_URL = `https://wa.me/${SOS_PHONE.slice(1)}`;
