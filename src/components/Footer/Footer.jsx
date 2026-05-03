import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { SERVICES } from '../../data/services';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner container">

      {/* Brand */}
      <div className="footer-brand">
        <Logo size={52} />
        <p className="footer-name">Paw Loyal</p>
        <p className="footer-sub">Clínica Boutique Animal</p>
        <p className="footer-desc">
          Estética, spa, hospedaje y educación para perros y gatos.
          Cuidado boutique, equipo certificado y productos pet-friendly.
        </p>
        <div className="footer-social">
          <a href="#" className="social-btn" aria-label="Instagram">IG</a>
          <a href="#" className="social-btn" aria-label="Facebook">FB</a>
          <a href="#" className="social-btn" aria-label="TikTok">TK</a>
          <a href="#" className="social-btn" aria-label="WhatsApp">WA</a>
        </div>
      </div>

      {/* Servicios */}
      <div className="footer-col">
        <h4>Servicios</h4>
        <ul>
          {SERVICES.slice(0, 6).map((s) => (
            <li key={s.id}>
              <Link to={`/servicios/${s.id}`}>{s.emoji} {s.nombre}</Link>
            </li>
          ))}
          <li><Link to="/servicios">Ver todos →</Link></li>
        </ul>
      </div>

      {/* Empresa */}
      <div className="footer-col">
        <h4>Empresa</h4>
        <ul>
          <li><Link to="/nosotros">🐶 Nosotros</Link></li>
          <li><Link to="/servicios">🐾 Todos los servicios</Link></li>
          <li><Link to="/reservar">📅 Reservar</Link></li>
          <li><Link to="/login">Iniciar sesión</Link></li>
          <li><Link to="/register">Crear cuenta</Link></li>
          <li><Link to="/mis-mascotas">Mis mascotas</Link></li>
        </ul>
      </div>

      {/* Contacto + Legal */}
      <div className="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li>📍 Av. Ejemplo 123, Condesa, CDMX</li>
          <li>📞 +52 55 1234 5678</li>
          <li>✉️ hola@pawloyal.mx</li>
          <li>🕐 Lun – Sáb · 9:00 – 19:00</li>
        </ul>
        <div className="footer-map-hint">
          <span className="footer-open-badge">🟢 Abierto ahora</span>
        </div>

        <h4 style={{ marginTop: '1.5rem' }}>Legal</h4>
        <ul>
          <li><Link to="/aviso-privacidad">📄 Aviso de privacidad</Link></li>
          <li><Link to="/terminos">📋 Términos y condiciones</Link></li>
        </ul>
      </div>

    </div>

    <div className="footer-bottom">
      <div className="container footer-bottom-inner">
        <p>© {new Date().getFullYear()} Paw Loyal · Clínica Boutique Animal · CDMX</p>
        <div className="footer-legal-links">
          <Link to="/aviso-privacidad">Aviso de privacidad</Link>
          <span>·</span>
          <Link to="/terminos">Términos y condiciones</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;