import { Link } from 'react-router-dom';
import './Herobanner.css';

const HeroBanner = () => (
  <div className="hero-banner">
    <div className="hero-content">
      <span className="tag tag-orange">🐾 Premium Pet Store · CDMX</span>
      <h1 className="hero-title">
        Todo lo que tu<br />
        <em>manada necesita</em>
      </h1>
      <p className="hero-sub">
        Nutrición artesanal, bienestar integral, accesorios de diseño
        y la caja de suscripción mensual que más esperan en tu hogar.
      </p>
      <div className="hero-actions">
        <Link to="/category/suscripcion" className="btn-primary hero-cta">
          📦 Ver Caja Manada
        </Link>
        <Link to="/category/nutricion" className="btn-outline hero-cta-sec">
          Explorar productos
        </Link>
      </div>
    </div>

    <div className="hero-stats">
      <div className="stat">
        <span className="stat-num">500+</span>
        <span className="stat-label">Familias en la manada</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-num">100%</span>
        <span className="stat-label">Ingredientes naturales</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-num">4.9★</span>
        <span className="stat-label">Calificación promedio</span>
      </div>
    </div>

    <div className="hero-deco" aria-hidden="true">
      <div className="deco-circle deco-1" />
      <div className="deco-circle deco-2" />
      <div className="deco-paw">🐾</div>
    </div>
  </div>
);

export default HeroBanner;