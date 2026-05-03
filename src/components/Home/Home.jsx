import { Link } from 'react-router-dom';
import { SERVICES } from '../../data/services';
import Logo from '../Logo/Logo';
import Proveedores from '../Proveedores/Proveedores';
import '../Home/Home.css';

const TESTIMONIOS = [
  {
    nombre: 'María Hernández',
    mascota: 'Luna · Golden Retriever',
    texto: 'Luna sale feliz cada vez. El equipo la trata como en casa y el corte siempre queda hermoso.',
    avatar: '👩‍🦱',
  },
  {
    nombre: 'Carlos Ramírez',
    mascota: 'Mishi · Persa',
    texto: 'La pensión felina fue increíble. Cámara en vivo, reportes y mi gato volvió relajado.',
    avatar: '👨‍💼',
  },
  {
    nombre: 'Sofía Pérez',
    mascota: 'Toby · Poodle',
    texto: 'El plan mensual nos cambió la vida. Toby siempre está limpio y bien cuidado, sin pensarlo.',
    avatar: '👩‍🦰',
  },
];

const VALORES_PREVIEW = [
  { emoji: '🐾', label: 'Bienestar' },
  { emoji: '💚', label: 'Empatía' },
  { emoji: '🛡️', label: 'Responsabilidad' },
  { emoji: '⭐', label: 'Calidad' },
  { emoji: '🤝', label: 'Confianza' },
  { emoji: '💡', label: 'Innovación' },
];

const Home = () => {
  const featured = SERVICES.find((s) => s.featured);
  const regular  = SERVICES.filter((s) => !s.featured);

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-shape" aria-hidden="true" />
        <div className="container hero-inner">

          <div className="hero-content">
            <span className="tag tag-gold">🐾 Clínica Boutique Animal · CDMX</span>
            <h1 className="hero-title">
              Cuidado <em>boutique</em> para<br />
              tu mejor amigo
            </h1>
            <p className="hero-sub">
              Estética, spa, hospedaje y educación: todo lo que tu peludo
              necesita en un solo lugar, con la calidez de una clínica boutique
              y el respaldo de un equipo certificado.
            </p>
            <div className="hero-actions">
              <Link to="/servicios" className="btn-primary">Ver todos los servicios</Link>
              <Link to="/reservar" className="btn-outline">Reservar ahora</Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-num">+1,200</span>
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
            <div className="hero-visual-bg" />
            <div className="hero-card">
              <Logo size={180} />
              <p className="hero-card-label">Clínica Boutique Animal</p>
            </div>
            <div className="hero-badge hero-badge--1">
              <span className="hero-badge-icon">✂️</span>
              <span>Estética profesional</span>
            </div>
            <div className="hero-badge hero-badge--2">
              <span className="hero-badge-icon">🏨</span>
              <span>Pensión 24/7</span>
            </div>
            <div className="hero-badge hero-badge--3">
              <span className="hero-badge-icon">🌿</span>
              <span>Spa & bienestar</span>
            </div>
            <span className="hero-paw paw-1">🐾</span>
            <span className="hero-paw paw-2">🐾</span>
            <span className="hero-paw paw-3">🐾</span>
          </div>

        </div>
      </section>

      {/* ── Beneficios — band full bleed ── */}
      <section className="benefits-band">
        <div className="container benefits-inner">
          <div className="benefit">
            <span className="benefit-icon">🩺</span>
            <div>
              <h3>Equipo certificado</h3>
              <p>Veterinarios, etólogos y estilistas con experiencia comprobada.</p>
            </div>
          </div>
          <div className="benefit-sep" />
          <div className="benefit">
            <span className="benefit-icon">💚</span>
            <div>
              <h3>Productos pet-friendly</h3>
              <p>Solo shampoos y perfumes seguros, sin alcohol ni químicos agresivos.</p>
            </div>
          </div>
          <div className="benefit-sep" />
          <div className="benefit">
            <span className="benefit-icon">📸</span>
            <div>
              <h3>Reportes en vivo</h3>
              <p>Fotos y video por WhatsApp durante cada servicio.</p>
            </div>
          </div>
          <div className="benefit-sep" />
          <div className="benefit">
            <span className="benefit-icon">🛡️</span>
            <div>
              <h3>Espacios seguros</h3>
              <p>Áreas separadas por talla, cámaras y personal 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Servicios — 4 columnas fijas ── */}
      <section className="services container" id="servicios">
        <div className="services-header">
          <div>
            <span className="tag">Nuestros servicios</span>
            <h2>Todo lo que tu mascota necesita</h2>
            <p>Desde estética y spa hasta hospedaje y adiestramiento.</p>
          </div>
          <Link to="/servicios" className="btn-outline services-see-all">Ver todos →</Link>
        </div>
        <div className="services-grid">
          {regular.map((s) => (
            <Link key={s.id} to={`/servicios/${s.id}`} className={`service-card service-card--${s.color}`}>
              <span className="service-emoji">{s.emoji}</span>
              <h3 className="service-name">{s.nombre}</h3>
              <p className="service-desc">{s.short}</p>
              <div className="service-footer">
                <span className="service-price">
                  Desde ${Math.min(...s.options.map((o) => o.precio)).toLocaleString('es-MX')}
                </span>
                <span className="service-link">Ver →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Sobre Paw Loyal — band full bleed ── */}
      <section className="nosotros-band">
        <div className="container nosotros-band-inner">
          <div className="nosotros-band-text">
            <span className="tag">🐶 Sobre Paw Loyal</span>
            <h2>Tratamos a tu mascota<br />como parte de la familia</h2>
            <p>
              Nacimos con una convicción: las mascotas merecen el mismo amor
              y cuidado profesional que cualquier miembro de la familia.
              Nuestro equipo certificado combina veterinaria, calidez humana
              y productos pet-friendly en cada servicio.
            </p>
            <div className="nosotros-valores-chips">
              {VALORES_PREVIEW.map((v) => (
                <span key={v.label} className="valor-chip">
                  <span>{v.emoji}</span> {v.label}
                </span>
              ))}
            </div>
            <Link to="/nosotros" className="btn-primary">Conocer nuestra historia →</Link>
          </div>
          <div className="nosotros-band-stats">
            <div className="nos-stat-item">
              <span className="nos-stat-num">+1,200</span>
              <span className="nos-stat-lbl">Mascotas<br/>atendidas</span>
            </div>
            <div className="nos-stat-item">
              <span className="nos-stat-num">4.9★</span>
              <span className="nos-stat-lbl">Calificación<br/>promedio</span>
            </div>
            <div className="nos-stat-item">
              <span className="nos-stat-num">100%</span>
              <span className="nos-stat-lbl">Equipo<br/>certificado</span>
            </div>
            <div className="nos-stat-item">
              <span className="nos-stat-num">8</span>
              <span className="nos-stat-lbl">Servicios<br/>especializados</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Paquetes ── */}
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
                  {(opt.bullets || []).map((b) => (<li key={b}>✓ {b}</li>))}
                </ul>
                <Link to={`/reservar/${featured.id}?option=${opt.id}`} className={i === 1 ? 'btn-gold' : 'btn-outline'}>
                  Suscribirme
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Aliados y proveedores ── */}
      <Proveedores />

      {/* ── Testimonios ── */}
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
              <div className="testimonial-author-row">
                <span className="testimonial-avatar">{t.avatar}</span>
                <p className="testimonial-author">
                  <strong>{t.nombre}</strong>
                  <span>{t.mascota}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final — split layout ── */}
      <section className="final-cta container">
        <div className="final-cta-card">
          <div className="final-cta-left">
            <h2>¿Listo para consentir<br />a tu peludo?</h2>
            <p>Reservá en menos de un minuto. Si tenés cuenta, usamos los datos de tu mascota guardada.</p>
            <div className="final-cta-actions">
              <Link to="/reservar" className="btn-primary">Reservar servicio</Link>
              <Link to="/register" className="btn-outline final-cta-outline">Crear cuenta</Link>
            </div>
          </div>
          <div className="final-cta-right" aria-hidden="true">
            <div className="final-cta-paw-stack">
              <span>🐾</span><span>🐾</span><span>🐾</span>
            </div>
            <div className="final-cta-mini-stats">
              <div><strong>+500</strong><span>familias este mes</span></div>
              <div><strong>CDMX</strong><span>Condesa · Polanco · Roma</span></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;