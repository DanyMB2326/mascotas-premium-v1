import { Link } from 'react-router-dom';
import { SERVICES } from '../../data/services';
import '../Servicios/Servicios.css';

const Servicios = () => (
  <section className="servicios-page">
    <div className="section-header">
      <span className="tag">Catálogo</span>
      <h1>Nuestros servicios</h1>
      <p>Cada servicio es ejecutado por un equipo certificado y con productos seguros para tu mascota.</p>
    </div>

    <div className="servicios-list">
      {SERVICES.map((s) => (
        <article key={s.id} className={`servicio-row servicio-row--${s.color}`}>
          <div className="servicio-row-icon">
            <span className="emoji">{s.emoji}</span>
          </div>
          <div className="servicio-row-body">
            <h2>{s.nombre}</h2>
            <p>{s.descripcion}</p>
            <ul className="servicio-row-bullets">
              {s.incluye.slice(0, 3).map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
            <div className="servicio-row-meta">
              <span className="meta-pill">⏱ {s.duracion}</span>
              <span className="meta-pill">
                Desde ${Math.min(...s.options.map((o) => o.precio)).toLocaleString('es-MX')} MXN
              </span>
            </div>
          </div>
          <div className="servicio-row-actions">
            <Link to={`/servicios/${s.id}`}    className="btn-outline">Ver detalle</Link>
            <Link to={`/reservar/${s.id}`}     className="btn-primary">Reservar</Link>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Servicios;