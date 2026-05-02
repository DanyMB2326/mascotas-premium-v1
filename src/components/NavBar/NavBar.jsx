import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import CartWidget from '../CartWidget/CartWidget';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
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
  const { user, logout }             = useAuth();
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [servicesOpen,   setServicesOpen]   = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);

  const catRef  = useRef(null);
  const svcRef  = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current  && !catRef.current.contains(e.target))  setCategoriesOpen(false);
      if (svcRef.current  && !svcRef.current.contains(e.target))  setServicesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setServicesOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    closeAll();
    await logout();
    toast.success('Sesión cerrada. ¡Hasta pronto! 🐾');
    navigate('/');
  };

  /* Short display name */
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Mi cuenta';

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
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>
            Inicio
          </NavLink>

          {/* CATEGORÍAS */}
          <div className="services-dropdown" ref={catRef}>
            <button
              className="nav-link dropdown-btn"
              onClick={() => { setCategoriesOpen(v => !v); setServicesOpen(false); setUserMenuOpen(false); }}
              aria-expanded={categoriesOpen}
            >
              Categorías ▾
            </button>
            {categoriesOpen && (
              <div className="dropdown-menu">
                {CATEGORIES.map(cat => (
                  <NavLink key={cat.id} to={`/category/${cat.id}`} className="dropdown-item" onClick={closeAll}>
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
              onClick={() => { setServicesOpen(v => !v); setCategoriesOpen(false); setUserMenuOpen(false); }}
              aria-expanded={servicesOpen}
            >
              Servicios ▾
            </button>
            {servicesOpen && (
              <div className="dropdown-menu">
                {SERVICIOS.map(s => (
                  <NavLink key={s.path} to={s.path} className="dropdown-item" onClick={closeAll}>
                    {s.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* USER: logged in */}
          {user ? (
            <div className="services-dropdown" ref={userRef}>
              <button
                className="nav-link dropdown-btn nav-user-btn"
                onClick={() => { setUserMenuOpen(v => !v); setCategoriesOpen(false); setServicesOpen(false); }}
                aria-expanded={userMenuOpen}
              >
                👤 {displayName} ▾
              </button>
              {userMenuOpen && (
                <div className="dropdown-menu">
                  <NavLink to="/mis-mascotas" className="dropdown-item" onClick={closeAll}>🐾 Mis Mascotas</NavLink>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* USER: not logged in */
            <>
              <NavLink to="/login"    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>Iniciar Sesión</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>Registrarse</NavLink>
            </>
          )}
        </nav>

        {/* RIGHT */}
        <div className="navbar-right">
          <CartWidget />
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú" aria-expanded={menuOpen}>
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* MOBILE */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" className="mobile-link" onClick={closeAll}>Inicio</NavLink>

        {CATEGORIES.map(cat => (
          <NavLink key={cat.id} to={`/category/${cat.id}`} className="mobile-link" onClick={closeAll}>
            {cat.label}
          </NavLink>
        ))}

        <div className="mobile-divider" />

        {SERVICIOS.map(s => (
          <NavLink key={s.path} to={s.path} className="mobile-link mobile-link-service" onClick={closeAll}>
            {s.label}
          </NavLink>
        ))}

        <div className="mobile-divider" />

        {user ? (
          <>
            <NavLink to="/mis-mascotas" className="mobile-link" onClick={closeAll}>🐾 Mis Mascotas</NavLink>
            <button className="mobile-link mobile-link-danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
          </>
        ) : (
          <>
            <NavLink to="/login"    className="mobile-link" onClick={closeAll}>👤 Iniciar Sesión</NavLink>
            <NavLink to="/register" className="mobile-link" onClick={closeAll}>✍️ Registrarse</NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default NavBar;