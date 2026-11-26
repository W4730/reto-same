import { Car, Dog, Flame, Lightbulb, Tent, Trash2, Volume2 } from 'lucide-react';

const rules = [
  { icon: Dog, title: 'Perros con correa', text: 'Los perros escarban nidos y persiguen neonatos. En la playa, siempre con correa.' },
  { icon: Flame, title: 'Sin fogatas en la arena', text: 'El calor y la luz del fuego dañan los nidos y desorientan a las tortugas.' },
  { icon: Tent, title: 'Carpas lejos de la zona de anidación', text: 'Arma tu carpa fuera de las zonas marcadas y retírala de noche si estás cerca.' },
  { icon: Car, title: 'Ningún vehículo en la playa', text: 'Las llantas compactan la arena, aplastan nidos y dejan surcos donde los neonatos quedan atrapados.' },
  { icon: Volume2, title: 'Ruido bajo de noche', text: 'Música y gritos espantan a las hembras que llegan a anidar.' },
  { icon: Lightbulb, title: 'Apaga las luces que dan a la playa', text: 'Los neonatos buscan el reflejo del mar. Una luz de hotel o casa los lleva hacia la calle.' },
  { icon: Trash2, title: 'Llévate tu basura', text: 'El plástico termina en el mar, donde las tortugas lo confunden con comida.' },
];

export default function Practicas() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <h1>Buenas prácticas en la playa</h1>
          <p>Lo que hagas en la arena de Same, Tonchigüe y Atacames decide si un nido llega al mar.</p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <ul className="rules">
            {rules.map(({ icon: I, title, text }) => (
              <li key={title}>
                <I size={28} aria-hidden />
                <div>
                  <h3>{title}</h3>
                  <p className="dim">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
