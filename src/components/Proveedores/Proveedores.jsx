import './Proveedores.css';

const MARCAS = [
  {
    nombre: 'Royal Canin',
    cat: 'Nutrición especializada por raza',
    color: 'navy',
    initial: 'RC',
  },
  {
    nombre: "Hill's",
    cat: 'Dietas veterinarias y prescription',
    color: 'gold',
    initial: "H's",
  },
  {
    nombre: 'Purina Pro Plan',
    cat: 'Alimento premium con ciencia',
    color: 'teal',
    initial: 'PP',
  },
  {
    nombre: 'Dog Chow',
    cat: 'Nutrición completa para el día a día',
    color: 'brown',
    initial: 'DC',
  },
];

const CATEGORIAS = [
  { emoji: '🍖', label: 'Alimentos premium', desc: 'Croquetas, húmedos y snacks de alta calidad' },
  { emoji: '🎾', label: 'Juguetes', desc: 'Estimulación mental y física para tu mascota' },
  { emoji: '🛏️', label: 'Camas y descanso', desc: 'Camas ortopédicas, cobijas y accesorios de confort' },
  { emoji: '🎀', label: 'Accesorios', desc: 'Correas, arneses, ropa y artículos de paseo' },
];

const Proveedores = () => (
  <section className="proveedores-section">
    <div className="container">

      <div className="proveedores-header">
        <div>
          <span className="tag">🤝 Nuestros aliados</span>
          <h2>Marcas y productos que recomendamos</h2>
          <p>
            Trabajamos con las mejores marcas del mercado para garantizar que tu mascota
            reciba nutrición, juego y descanso de primera calidad.
          </p>
        </div>
      </div>

      {/* Marcas partners */}
      <div className="marcas-grid">
        {MARCAS.map((m) => (
          <div key={m.nombre} className={`marca-card marca-card--${m.color}`}>
            <div className={`marca-avatar marca-avatar--${m.color}`}>{m.initial}</div>
            <div className="marca-info">
              <h3 className="marca-nombre">{m.nombre}</h3>
              <p className="marca-cat">{m.cat}</p>
            </div>
            <span className="marca-badge">Aliado oficial</span>
          </div>
        ))}
      </div>

      {/* Categorías de producto */}
      <div className="cat-grid">
        {CATEGORIAS.map((c) => (
          <div key={c.label} className="cat-card">
            <span className="cat-emoji">{c.emoji}</span>
            <h4 className="cat-label">{c.label}</h4>
            <p className="cat-desc">{c.desc}</p>
          </div>
        ))}
      </div>

      <p className="proveedores-nota">
        ¿Tienes preferencia de marca para la alimentación de tu mascota durante la pensión o guardería?
        Indícanoslo al reservar. También puedes traer su alimento habitual. 🐾
      </p>

    </div>
  </section>
);

export default Proveedores;