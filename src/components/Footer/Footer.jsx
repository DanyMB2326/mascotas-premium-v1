import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { SERVICES } from '../../data/services';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner container">

      <div className="footer-brand">
        <Logo size={56} />
        <p className="footer-name">Paw Loyal</p>
        <p className="footer-sub">Clínica Boutique Animal</p>
        <p className="footer-desc"></p>
        <p className="footer-desc">
          Estética, spa, hospedaje y educación para perros y gatos.
          Cuidado boutique, equipo certificado y productos pet-friendly.
        </p>
      </div>

      <div className="footer-col">
        <h4>Servicios</h4>
        <ul>
          {SERVICES.map((s) => (
            <li key={s.id}>
              <Link to={`/servicios/${s.id}`}>{s.emoji} {s.nombre}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer-col">
        <h4>Cuenta</h4>
        <ul>
          <li><Link to="/login">Iniciar sesión</Link></li>
          <li><Link to="/register">Crear cuenta</Link></li>
          <li><Link to="/mis-mascotas">Mis mascotas</Link></li>
          <li><Link to="/reservar">Reservar servicio</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li>📍 Av. Ejemplo 123, Condesa, CDMX</li>
          <li>📞 +52 55 1234 5678</li>
          <li>✉️ hola@pawloyal.mx</li>
          <li>🕐 Lun – Sáb · 9:00 – 19:00</li>
        </ul>
      </div>
      
      <div className="footer-social">
          <div className="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li>📍 Av. Ejemplo 123, Condesa, CDMX</li>
          <li>📞 +52 55 1234 5678</li>
          <li>✉️ hola@pawloyal.mx</li>
          <li>🕐 Lun – Sáb · 9:00 – 19:00</li>
        </ul>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container">
        <p>© {new Date().getFullYear()} Paw Loyal · Clínica Boutique Animal · CDMX</p>
        <p>Hecho con 🐾 para las familias que aman a sus mascotas</p>
      </div>
    </div>
  </footer>
);

export default Footer;