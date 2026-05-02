import { Link } from 'react-router-dom';
import { SERVICES } from '../../data/services';
import Logo from '../Logo/Logo';
import '../Home/Home.css';

const TESTIMONIOS = [
  {
    nombre: 'María Hernández',
    mascota: 'Luna · Golden Retriever',
    texto: 'Luna sale feliz cada vez. El equipo la trata como en casa y el corte siempre queda hermoso.',
  },
  {
    nombre: 'Carlos Ramírez',
    mascota: 'Mishi · Persa',
    texto: 'La pensión felina fue increíble. Cámara en vivo, reportes y mi gato volvió relajado.',
  },
  {
    nombre: 'Sofía Pérez',
    mascota: 'Toby · Poodle',
    texto: 'El plan mensual nos cambió la vida. Toby siempre está limpio y bien cuidado, sin pensarlo.',
  },
];

const Home = () => {
  const featured = SERVICES.find((s) => s.featured);
  const regular  = SERVICES.filter((s) => !s.featured);

  return (
    <div className="home">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero container">
        <div className="hero-content">
          <span className="tag tag-gold">🐾 Clínica Boutique Animal · CDMX</span>
          <h1 className="hero-title">
            Cuidado <em>boutique</em> para<br />
            tu mejor amigo
          </h1>
          <p className="hero-sub">
            Estética, spa, hospedaje y educación: todo lo que tu peludo
            necesita en un solo lugar, con la calidez de una clínica boutique
            y la atención de un equipo certificado.
          </p>
          <div className="hero-actions">
            <Link to="/servicios" className="btn-primary">Ver servicios</Link>
            <Link to="/reservar" className="btn-outline">Reservar ahora</Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">+1.200</span>
              <span className="stat-label">Mascotas atendidas</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">4.9★</span>
              <span className="stat-label">Calificación</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">8</span>
              <span className="stat-label">Servicios premium</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card">
            <Logo size={200} />
          </div>
          <span className="hero-paw paw-1">🐾</span>
          <span className="hero-paw paw-2">🐾</span>
          <span className="hero-paw paw-3">🐾</span>
        </div>
      </section>

      {/* ── Beneficios ───────────────────────────────────────── */}
      <section className="benefits container">
        <div className="benefit">
          <span className="benefit-icon">🩺</span>
          <h3>Equipo certificado</h3>
          <p>Médicos veterinarios, etólogos y estilistas con experiencia.</p>
        </div>
        <div className="benefit">
          <span className="benefit-icon">💚</span>
          <h3>Productos pet-friendly</h3>
          <p>Solo shampoos, perfumes y productos seguros sin alcohol.</p>
        </div>
        <div className="benefit">
          <span className="benefit-icon">📸</span>
          <h3>Reportes en vivo</h3>
          <p>Recibís fotos y video por WhatsApp durante cada servicio.</p>
        </div>
        <div className="benefit">
          <span className="benefit-icon">🛡️</span>
          <h3>Espacios seguros</h3>
          <p>Áreas separadas por tamaño, cámaras y personal 24/7.</p>
        </div>
      </section>

      {/* ── Servicios ────────────────────────────────────────── */}
      <section className="services container" id="servicios">
        <div className="section-header">
          <span className="tag">Nuestros servicios</span>
          <h2>Todo lo que tu mascota necesita</h2>
          <p>Desde estética y spa hasta hospedaje y adiestramiento.</p>
        </div>

        <div className="services-grid">
          {regular.map((s) => (
            <Link key={s.id} to={`/servicios/${s.id}`} className={`service-card service-card--${s.color}`}>
              <span className="service-emoji">{s.emoji}</span>
              <h3 className="service-name">{s.nombre}</h3>
              <p className="service-desc">{s.short}</p>
              <span className="service-link">Ver detalles →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Paquetes destacados ──────────────────────────────── */}
      {featured && (
        <section className="packages container">
          <div className="packages-header">
            <span className="tag tag-gold">📦 Suscripción mensual</span>
            <h2>{featured.nombre}</h2>
            <p>{featured.descripcion}</p>
          </div>
          <div className="packages-grid">
            {featured.options.map((opt, i) => (
              <div key={opt.id} className={`package-card ${i === 1 ? 'package-card--featured' : ''}`}>
                {i === 1 && <span className="package-badge">⭐ Más elegido</span>}
                <h3 className="package-name">{opt.label}</h3>
                <p className="package-price">
                  <span className="package-currency">$</span>
                  {opt.precio.toLocaleString('es-MX')}
                  <span className="package-period">/mes</span>
                </p>
                <ul className="package-bullets">
                  {(opt.bullets || []).map((b) => (
                    <li key={b}>✓ {b}</li>
                  ))}
                </ul>
                <Link to={`/reservar/${featured.id}?option=${opt.id}`} className={i === 1 ? 'btn-gold' : 'btn-outline'}>
                  Suscribirme
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* ── Testimonios ──────────────────────────────────────── */}
      <section className="testimonials container">
        <div className="section-header">
          <span className="tag">Familias que confían</span>
          <h2>Lo que dicen nuestras familias</h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIOS.map((t) => (
            <div key={t.nombre} className="testimonial-card">
              <p className="testimonial-stars">★★★★★</p>
              <p className="testimonial-text">"{t.texto}"</p>
              <p className="testimonial-author">
                <strong>{t.nombre}</strong>
                <span>{t.mascota}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="final-cta container">
        <div className="final-cta-card">
          <h2>¿Listo para consentir a tu peludo?</h2>
          <p>Reservá en menos de un minuto. Si tenés cuenta, usamos los datos de tu mascota guardada.</p>
          <div className="final-cta-actions">
            <Link to="/reservar" className="btn-primary">Reservar servicio</Link>
            <Link to="/register" className="btn-outline">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;