import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { SERVICES } from '../../data/services';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="container footer-grid">

      {/* Brand */}
      <div className="footer-brand">
        <Logo size={52} />
        <p className="footer-name">Paw Loyal</p>
        <p className="footer-sub">Clínica Boutique Animal</p>
        <p className="footer-desc">
          Estética, spa, hospedaje y educación para perros y gatos.
          Cuidado boutique, equipo certificado y productos pet-friendly.
        </p>
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
          <li><Link to="/tienda">🛍️ Tienda</Link></li>
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

      </div>   {/* .container footer-grid */}
    </div>   {/* .footer-inner */}

    <div className="footer-bottom">
      <div className="container footer-bottom-inner">

        {/* Izquierda: copyright */}
        <p className="footer-copy">© {new Date().getFullYear()} Paw Loyal · Clínica Boutique Animal · CDMX</p>

        {/* Derecha: redes sociales con logos SVG */}
        <div className="footer-social-bottom">
          <a href="#" className="social-btn" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="#" className="social-btn" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </a>
          <a href="#" className="social-btn" aria-label="TikTok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.27 8.27 0 004.84 1.55V6.85a4.85 4.85 0 01-1.07-.16z"/>
            </svg>
          </a>
          <a href="#" className="social-btn" aria-label="WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
            </svg>
          </a>
        </div>

      </div>
    </div>
  </footer>
);

export default Footer;