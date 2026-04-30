import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner container">
      <div className="footer-brand">
        <p className="footer-logo">🐾 <span className="footer-logo-name">Manada</span></p>
        <p className="footer-tagline">Tu manada, nuestra misión.</p>
        <p className="footer-desc">
          Productos premium para perros y gatos. Nutrición artesanal, bienestar integral y la caja de suscripción que más espera tu mascota.
        </p>
      </div>

      <div className="footer-links">
        <h4 className="footer-heading">Catálogo</h4>
        <ul>
          <li><Link to="/category/nutricion">🥩 Nutrición Premium</Link></li>
          <li><Link to="/category/bienestar">💊 Bienestar & Salud</Link></li>
          <li><Link to="/category/accesorios">🎀 Accesorios & Moda</Link></li>
          <li><Link to="/category/suscripcion">📦 Caja Manada</Link></li>
          <li><Link to="/citas">📅 Agendar Cita</Link></li>
          <li><Link to="/hotel">🏨 Hotel Manada</Link></li>
        </ul>
      </div>

      <div className="footer-links">
        <h4 className="footer-heading">Contacto</h4>
        <ul>
          <li>📍 Condesa, CDMX</li>
          <li>📞 +52 55 1234 5678</li>
          <li>✉️ hola@manada.mx</li>
          <li>🕐 Lun–Sáb 9am–7pm</li>
        </ul>
      </div>

      <div className="footer-social-wrap">
        <h4 className="footer-heading">Seguinos</h4>
        <div className="footer-social">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>
          </a>
          <a href="https://wa.me/5215512345678" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          </a>
        </div>
        <div className="footer-badge">📦 Envío gratis desde $800 MXN</div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container">
        <p>© {new Date().getFullYear()} Manada · Premium Pet Store · CDMX</p>
        <p>Hecho con 🐾 para las mejores familias de México</p>
      </div>
    </div>
  </footer>
);

export default Footer;