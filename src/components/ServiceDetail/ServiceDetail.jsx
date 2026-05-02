import { Link, useParams, useNavigate } from 'react-router-dom';
import { findService, SERVICES } from '../../data/services';
import '../ServiceDetail/ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = findService(id);

  if (!service) {
    return (
      <div className="state-container">
        <span className="state-icon">🐾</span>
        <h2>Servicio no encontrado</h2>
        <p>Probablemente cambiamos el catálogo. Volvé al listado para verlos todos.</p>
        <Link to="/servicios" className="btn-primary">Ver servicios</Link>
      </div>
    );
  }

  const others = SERVICES.filter((s) => s.id !== service.id).slice(0, 4);

  return (
    <div className="service-detail">

      <nav className="crumbs">
        <Link to="/">Inicio</Link>
        <span>›</span>
        <Link to="/servicios">Servicios</Link>
        <span>›</span>
        <span className="crumb-current">{service.nombre}</span>
      </nav>

      <header className={`service-hero service-hero--${service.color}`}>
        <span className="service-hero-emoji">{service.emoji}</span>
        <span className="tag tag-gold">{service.duracion}</span>
        <h1>{service.nombre}</h1>
        <p className="service-hero-tagline">{service.hero}</p>
        <p className="service-hero-desc">{service.descripcion}</p>
        <div className="service-hero-actions">
          <button className="btn-primary" onClick={() => navigate(`/reservar/${service.id}`)}>
            Reservar este servicio
          </button>
          <Link to="/servicios" className="btn-outline">Ver otros servicios</Link>
        </div>
      </header>

      <div className="service-body">

        <section className="service-section">
          <h2>¿Qué incluye?</h2>
          <ul className="service-includes">
            {service.incluye.map((item) => (
              <li key={item}><span className="check">✓</span>{item}</li>
            ))}
          </ul>
        </section>

        <section className="service-section">
          <h2>Opciones disponibles</h2>
          <div className="service-options">
            {service.options.map((opt) => (
              <article key={opt.id} className="service-option">
                <div className="service-option-info">
                  <h3>{opt.label}</h3>
                  {opt.bullets && (
                    <ul className="option-bullets">
                      {opt.bullets.map((b) => <li key={b}>· {b}</li>)}
                    </ul>
                  )}
                </div>
                <div className="service-option-cta">
                  <p className="service-option-precio">${opt.precio.toLocaleString('es-MX')} <span>MXN</span></p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/reservar/${service.id}?option=${opt.id}`)}
                  >
                    Reservar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="service-section">
          <h2>Cómo funciona</h2>
          <ol className="service-steps">
            <li><span className="step">1</span><div><strong>Reservás online</strong><p>Elegís servicio, día y horario.</p></div></li>
            <li><span className="step">2</span><div><strong>Cargamos los datos de tu mascota</strong><p>Si tenés cuenta usamos los guardados.</p></div></li>
            <li><span className="step">3</span><div><strong>Confirmamos por WhatsApp</strong><p>Y enviamos recordatorio el día previo.</p></div></li>
            <li><span className="step">4</span><div><strong>Atención y reporte</strong><p>Recibís fotos durante el servicio y diagnóstico al finalizar.</p></div></li>
          </ol>
        </section>
      </div>

      <section className="service-related">
        <h2>Otros servicios</h2>
        <div className="related-grid">
          {others.map((s) => (
            <Link key={s.id} to={`/servicios/${s.id}`} className="related-card">
              <span className="related-emoji">{s.emoji}</span>
              <span className="related-name">{s.nombre}</span>
              <span className="related-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;