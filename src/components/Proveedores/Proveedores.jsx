import { Link } from 'react-router-dom';
import './Proveedores.css';

const MARCAS = [
  { nombre: 'Royal Canin',    cat: 'Nutrición especializada por raza',    logo: '/img/RoyalCanin.webp', color: 'royalcanin' },
  { nombre: "Hill's",         cat: 'Dietas veterinarias y prescription',  logo: '/img/Hill.webp',       color: 'hills'      },
  { nombre: 'Purina Pro Plan',cat: 'Alimento premium con ciencia',        logo: '/img/ProPlan.png',     color: 'purina'     },
  { nombre: 'Dog Chow',       cat: 'Nutrición completa para el día a día',logo: '/img/DogChow.png',     color: 'dogchow'    },
];

const CATEGORIAS = [
  { emoji: '🍖', label: 'Alimentos premium', desc: 'Croquetas, húmedos y snacks de alta calidad' },
  { emoji: '🎾', label: 'Juguetes',           desc: 'Estimulación mental y física para tu mascota' },
  { emoji: '🛏️', label: 'Camas y descanso',  desc: 'Camas ortopédicas, cobijas y accesorios de confort' },
  { emoji: '🎀', label: 'Accesorios',         desc: 'Correas, arneses, ropa y artículos de paseo' },
];

const Proveedores = () => (
  <section className="proveedores-section">
    <div className="container">

      <div className="proveedores-header">
        <div>
          <span className="tag">🤝 Nuestros aliados</span>
          <h2>Marcas y productos que vendemos</h2>
          <p>
            Distribuimos directamente los productos de las mejores marcas del mercado.
            Compra en línea y recíbelos en tu domicilio en CDMX.
          </p>
        </div>
        <Link to="/tienda" className="btn-primary proveedores-cta">
          Ver tienda completa →
        </Link>
      </div>

      <div className="marcas-grid">
        {MARCAS.map(({ nombre, cat, logo, color }) => (
          <div key={nombre} className={`marca-card marca-card--${color}`}>
            <div className="marca-logo-wrap">
              <img src={logo} alt={`Logo ${nombre}`} className="marca-logo-img" />
            </div>
            <p className="marca-cat">{cat}</p>
            <span className="marca-badge">Aliado oficial</span>
          </div>
        ))}
      </div>

      <div className="cat-grid">
        {CATEGORIAS.map((c) => (
          <div key={c.label} className="cat-card">
            <span className="cat-emoji">{c.emoji}</span>
            <h4 className="cat-label">{c.label}</h4>
            <p className="cat-desc">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="proveedores-actions">
        <p className="proveedores-nota">
          ¿Tienes preferencia de marca para la alimentación de tu mascota durante la pensión o guardería?
          Indícanoslo al reservar. También puedes traer su alimento habitual. 🐾
        </p>
      </div>

    </div>
  </section>
);

export default Proveedores;