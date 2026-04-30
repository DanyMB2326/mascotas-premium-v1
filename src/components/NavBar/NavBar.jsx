import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import CartWidget from '../CartWidget/CartWidget';
import './NavBar.css';

const CATEGORIES = [
  { id: 'nutricion', label: '🥩 Nutrición' },
  { id: 'bienestar', label: '💊 Bienestar' },
  { id: 'accesorios', label: '🎀 Accesorios' },
  { id: 'suscripcion', label: '📦 Caja Manada' },
];

const SERVICIOS = [
  { path: '/citas', label: '📅 Agendar Cita' },
  { path: '/hotel', label: '🏨 Hotel Manada' },
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner container">

        {/* LOGO */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-paw">🐾</span>
          <span className="logo-name">Manada</span>
        </Link>

        {/* NAV */}
        <nav className="navbar-nav">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Inicio
          </NavLink>

          {/* CATEGORÍAS */}
          <div
            className="services-dropdown"
            onMouseEnter={() => setCategoriesOpen(true)}
            /*onMouseLeave={() => setCategoriesOpen(false)}*/
          >
            <button
              className="nav-link dropdown-btn"
              onClick={() => {
                setCategoriesOpen(!categoriesOpen);
                setServicesOpen(false);
              }}
            >
              Categorías ▾
            </button>

            {categoriesOpen && (
              <div className="dropdown-menu">
                {CATEGORIES.map((cat) => (
                  <NavLink
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="dropdown-item"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {cat.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* SERVICIOS */}
          <div
            className="services-dropdown"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="nav-link dropdown-btn"
              onClick={() => {
                setServicesOpen(!servicesOpen);
                setCategoriesOpen(false);
              }}
            >
              Servicios ▾
            </button>

            {servicesOpen && (
              <div className="dropdown-menu">
                {SERVICIOS.map((s) => (
                  <NavLink
                    key={s.path}
                    to={s.path}
                    className="dropdown-item"
                    onClick={() => setServicesOpen(false)}
                  >
                    {s.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-login active' : 'nav-link nav-login'
            }
          >
            Iniciar Sesión
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-register active' : 'nav-link nav-register'
            }
          >
            Registrarse
          </NavLink>

        </nav>

        {/* DERECHA (SOLO UNA) */}
        <div className="navbar-right">

          <CartWidget />

          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>

      </div>

      {/* MOBILE */}
<div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>

  <NavLink
    to="/"
    className="mobile-link"
    onClick={() => setMenuOpen(false)}
  >
    Inicio
  </NavLink>

  {CATEGORIES.map((cat) => (
    <NavLink
      key={cat.id}
      to={`/category/${cat.id}`}
      className="mobile-link"
      onClick={() => setMenuOpen(false)}
    >
      {cat.label}
    </NavLink>
  ))}

  <div className="mobile-divider" />

  {SERVICIOS.map((s) => (
    <NavLink
      key={s.path}
      to={s.path}
      className="mobile-link mobile-link-service"
      onClick={() => setMenuOpen(false)}
    >
      {s.label}
    </NavLink>
  ))}

  <div className="mobile-divider" />

  {/* LOGIN / REGISTER (CORREGIDO) */}
  <NavLink
    to="/login"
    className="mobile-link"
    onClick={() => setMenuOpen(false)}
  >
    👤 Iniciar Sesión
  </NavLink>

  <NavLink
    to="/register"
    className="mobile-link"
    onClick={() => setMenuOpen(false)}
  >
    ✍️ Registrarse
  </NavLink>

</div>

    
    </header>
  );
};

export default NavBar;