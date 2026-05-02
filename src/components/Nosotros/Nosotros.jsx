import { Link } from 'react-router-dom';
import './Nosotros.css';

const VALORES = [
  { emoji: '🐾', titulo: 'Bienestar', desc: 'El bienestar de cada mascota es nuestra prioridad en todo lo que hacemos.' },
  { emoji: '💚', titulo: 'Empatía y Respeto', desc: 'Tratamos a cada mascota con el amor y respeto que merecen como parte de la familia.' },
  { emoji: '🛡️', titulo: 'Responsabilidad', desc: 'Asumimos el compromiso de cuidar a tus mascotas con la misma dedicación que tú.' },
  { emoji: '⭐', titulo: 'Calidad', desc: 'Cada servicio y producto que ofrecemos cumple con los más altos estándares profesionales.' },
  { emoji: '🤝', titulo: 'Confianza', desc: 'Construimos relaciones duraderas basadas en la transparencia y la honestidad.' },
  { emoji: '💡', titulo: 'Innovación', desc: 'Buscamos constantemente nuevas formas de mejorar el cuidado y experiencia de tu manada.' },
];

const STATS = [
  { num: '500+', label: 'Familias en la manada' },
  { num: '8', label: 'Servicios especializados' },
  { num: '100%', label: 'Profesionales certificados' },
  { num: '4.9★', label: 'Calificación promedio' },
];

const Nosotros = () => (
  <div className="nosotros-page">

    {/* ── Hero ── */}
    <section className="nosotros-hero">
      <div className="nosotros-hero-content">
        <span className="tag tag-gold">🐾 Nuestra historia</span>
        <h1 className="nosotros-hero-title">
          Somos <em>Paw Loyal</em>,<br />tu clínica boutique animal
        </h1>
        <p className="nosotros-hero-sub">
          Nacimos con una convicción: las mascotas son familia. Por eso creamos un espacio donde
          el cuidado profesional se combina con el amor genuino que cada integrante de tu manada merece.
        </p>
        <div className="nosotros-hero-actions">
          <Link to="/citas" className="btn-primary">Agendar cita</Link>
          <Link to="/" className="btn-outline nosotros-btn-outline">Ver servicios →</Link>
        </div>
      </div>
      <div className="nosotros-hero-visual" aria-hidden="true">
        <div className="hero-visual-ring ring-1" />
        <div className="hero-visual-ring ring-2" />
        <div className="hero-visual-icon">🐾</div>
      </div>
    </section>

    {/* ── Stats ── */}
    <section className="nosotros-stats">
      {STATS.map((s) => (
        <div key={s.label} className="nosotros-stat">
          <span className="nosotros-stat-num">{s.num}</span>
          <span className="nosotros-stat-label">{s.label}</span>
        </div>
      ))}
    </section>

    {/* ── Misión y Visión ── */}
    <section className="mv-section">
      <div className="mv-card mv-mision">
        <div className="mv-icon">🎯</div>
        <div className="mv-body">
          <span className="tag">Misión</span>
          <h2>Lo que nos mueve cada día</h2>
          <p>
            Brindar servicios de cuidado y bienestar para mascotas, tratándolas como parte de la familia
            y apoyando a sus <em>pet parents</em>, con calidad, seguridad y atención profesional en cada
            momento de contacto.
          </p>
        </div>
      </div>

      <div className="mv-card mv-vision">
        <div className="mv-icon">🔭</div>
        <div className="mv-body">
          <span className="tag tag-gold">Visión</span>
          <h2>Hacia dónde vamos</h2>
          <p>
            Ser parte de las familias en México, acompañándolas en el cuidado y bienestar de sus mascotas,
            brindando amor, confianza y tranquilidad en cada momento de su vida juntos.
          </p>
        </div>
      </div>
    </section>

    {/* ── Valores ── */}
    <section className="valores-section">
      <div className="section-header">
        <span className="tag">Lo que nos define</span>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 700, marginTop: '0.5rem' }}>
          Nuestros valores
        </h2>
        <p>Principios que guían cada decisión, cada cuidado y cada interacción con tu familia.</p>
      </div>

      <div className="valores-grid">
        {VALORES.map((v) => (
          <div key={v.titulo} className="valor-card">
            <span className="valor-emoji">{v.emoji}</span>
            <h3 className="valor-titulo">{v.titulo}</h3>
            <p className="valor-desc">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA strip ── */}
    <section className="nosotros-cta-strip">
      <div className="nosotros-cta-content">
        <div>
          <h2>¿Listo para unirte a la manada?</h2>
          <p>Más de 500 familias ya confían en Paw Loyal. Tu mascota merece lo mejor.</p>
        </div>
        <div className="nosotros-cta-btns">
          <Link to="/register" className="btn-primary">Crear cuenta gratis</Link>
          <Link to="/citas" className="btn-outline nosotros-btn-outline-dark">Agendar cita</Link>
        </div>
      </div>
    </section>

  </div>
);

export default Nosotros;