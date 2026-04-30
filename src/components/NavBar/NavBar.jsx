import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import CartWidget from '../CartWidget/CartWidget';
import './NavBar.css';

const CATEGORIES = [
  { id: 'nutricion',   label: '🥩 Nutrición' },
  { id: 'bienestar',   label: '💊 Bienestar' },
  { id: 'accesorios',  label: '🎀 Accesorios' },
  { id: 'suscripcion', label: '📦 Caja Manada' },
];

const SERVICIOS = [
  { path: '/citas', label: '📅 Agendar Cita' },
  { path: '/hotel', label: '🏨 Hotel Manada' },
];

const NavBar = () => {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [servicesOpen,   setServicesOpen]   = useState(false);

  const catRef = useRef(null);
  const svcRef = useRef(null);

  /* Close dropdowns when clicking outside */
  useEffect(() => {
    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (svcRef.current && !svcRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Close mobile menu on route change */
  const closeAll = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">

        {/* LOGO */}
        <Link to="/" className="navbar-logo" onClick={closeAll}>
          <span className="logo-paw">🐾</span>
          <span className="logo-name">Manada</span>
        </Link>

        {/* NAV */}
        <nav className="navbar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeAll}
          >
            Inicio
          </NavLink>

          {/* CATEGORÍAS */}
          <div className="services-dropdown" ref={catRef}>
            <button
              className="nav-link dropdown-btn"
              onClick={() => {
                setCategoriesOpen((v) => !v);
                setServicesOpen(false);
              }}
              aria-expanded={categoriesOpen}
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
                    onClick={closeAll}
                  >
                    {cat.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* SERVICIOS */}
          <div className="services-dropdown" ref={svcRef}>
            <button
              className="nav-link dropdown-btn"
              onClick={() => {
                setServicesOpen((v) => !v);
                setCategoriesOpen(false);
              }}
              aria-expanded={servicesOpen}
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
                    onClick={closeAll}
                  >
                    {s.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/login"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeAll}
          >
            Iniciar Sesión
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeAll}
          >
            Registrarse
          </NavLink>
        </nav>

        {/* DERECHA */}
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
        <NavLink to="/" className="mobile-link" onClick={closeAll}>Inicio</NavLink>

        {CATEGORIES.map((cat) => (
          <NavLink
            key={cat.id}
            to={`/category/${cat.id}`}
            className="mobile-link"
            onClick={closeAll}
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
            onClick={closeAll}
          >
            {s.label}
          </NavLink>
        ))}

        <div className="mobile-divider" />

        <NavLink to="/login"    className="mobile-link" onClick={closeAll}>👤 Iniciar Sesión</NavLink>
        <NavLink to="/register" className="mobile-link" onClick={closeAll}>✍️ Registrarse</NavLink>
      </div>
    </header>
  );
};

export default NavBar;