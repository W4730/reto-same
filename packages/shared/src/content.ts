// Contenido compartido por la web pública y la app de campo: un solo texto que mantener.
// `id` lo usa cada app para elegir su ícono (lucide en web, Material Community en la app).

export type BeachRuleId = 'perros' | 'fogatas' | 'carpas' | 'vehiculos' | 'ruido' | 'luces' | 'basura';

export const BEACH_RULES: { id: BeachRuleId; title: string; text: string }[] = [
  { id: 'perros', title: 'Perros con correa', text: 'Los perros escarban nidos y persiguen neonatos. En la playa, siempre con correa.' },
  { id: 'fogatas', title: 'Sin fogatas en la arena', text: 'El calor y la luz del fuego dañan los nidos y desorientan a las tortugas.' },
  { id: 'carpas', title: 'Carpas lejos de la zona de anidación', text: 'Arma tu carpa fuera de las zonas marcadas y retírala de noche si estás cerca.' },
  { id: 'vehiculos', title: 'Ningún vehículo en la playa', text: 'Las llantas compactan la arena, aplastan nidos y dejan surcos donde los neonatos quedan atrapados.' },
  { id: 'ruido', title: 'Ruido bajo de noche', text: 'Música y gritos espantan a las hembras que llegan a anidar.' },
  { id: 'luces', title: 'Apaga las luces que dan a la playa', text: 'Los neonatos buscan el reflejo del mar. Una luz de hotel o casa los lleva hacia la calle.' },
  { id: 'basura', title: 'Llévate tu basura', text: 'El plástico termina en el mar, donde las tortugas lo confunden con comida.' },
];
