import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { SERVICES } from '../../data/services';
import { toast } from 'react-toastify';
import Logo from '../Logo/Logo';
import '../NavBar/NavBar.css';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);

  const svcRef  = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (svcRef.current  && !svcRef.current.contains(e.target))  setServicesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    closeAll();
    await logout();
    toast.success('Sesión cerrada. ¡Hasta pronto! 🐾');
    navigate('/');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Mi cuenta';

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar-inner container">

        <Link to="/" className="navbar-logo" onClick={closeAll}>
          <Logo size={36} />
          <span className="logo-text">
            <span className="logo-name">Paw Loyal</span>
            <span className="logo-sub">Clínica Boutique Animal</span>
          </span>
        </Link>

        <nav className="navbar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>
            Inicio
          </NavLink>

          <NavLink to="/nosotros" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>
            Nosotros
          </NavLink>

          {/* SERVICIOS DROPDOWN */}
          <div className="nav-dropdown" ref={svcRef}>
            <button
              type="button"
              className="nav-link nav-link-btn"
              onClick={() => { setServicesOpen((v) => !v); setUserMenuOpen(false); }}
              aria-expanded={servicesOpen}
            >
              Servicios ▾
            </button>
            {servicesOpen && (
              <div className="dropdown-menu dropdown-services">
                {SERVICES.map((s) => (
                  <NavLink key={s.id} to={`/servicios/${s.id}`} className="dropdown-item" onClick={closeAll}>
                    <span className="dropdown-emoji">{s.emoji}</span>
                    <span>{s.nombre}</span>
                  </NavLink>
                ))}
                <hr className="dropdown-divider" />
                <NavLink to="/servicios" className="dropdown-item dropdown-item--all" onClick={closeAll}>
                  Ver todos →
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/tienda" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>
            Tienda
          </NavLink>

          <NavLink to="/reservar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeAll}>
            Reservar
          </NavLink>

          {/* Cart icon */}
          <Link to="/cart" className="nav-cart" onClick={closeAll} aria-label="Carrito">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalQuantity > 0 && <span className="nav-cart-badge">{totalQuantity > 99 ? '99+' : totalQuantity}</span>}
          </Link>

          {user ? (
            <div className="nav-dropdown" ref={userRef}>
              <button
                type="button"
                className="nav-link nav-link-btn nav-user-btn"
                onClick={() => { setUserMenuOpen((v) => !v); setServicesOpen(false); }}
                aria-expanded={userMenuOpen}
              >
                👤 {displayName} ▾
              </button>
              {userMenuOpen && (
                <div className="dropdown-menu">
                  <NavLink to="/mis-mascotas" className="dropdown-item" onClick={closeAll}>🐾 Mis mascotas</NavLink>
                  <NavLink to="/reservar"     className="dropdown-item" onClick={closeAll}>📅 Reservar</NavLink>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login"    className="nav-link" onClick={closeAll}>Iniciar sesión</NavLink>
              <NavLink to="/register" className="nav-cta"  onClick={closeAll}>Crear cuenta</NavLink>
            </>
          )}
        </nav>

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

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/"          className="mobile-link" onClick={closeAll}>Inicio</NavLink>
        <NavLink to="/nosotros"  className="mobile-link" onClick={closeAll}>🐾 Nosotros</NavLink>
        <NavLink to="/tienda"    className="mobile-link" onClick={closeAll}>🛍️ Tienda</NavLink>
        <NavLink to="/servicios" className="mobile-link" onClick={closeAll}>Todos los servicios</NavLink>
        <div className="mobile-section">Servicios</div>
        {SERVICES.map((s) => (
          <NavLink key={s.id} to={`/servicios/${s.id}`} className="mobile-link mobile-link-svc" onClick={closeAll}>
            {s.emoji} {s.nombre}
          </NavLink>
        ))}

        <div className="mobile-divider" />

        <NavLink to="/reservar" className="mobile-link mobile-link-cta" onClick={closeAll}>📅 Reservar</NavLink>

        <div className="mobile-divider" />

        {user ? (
          <>
            <NavLink to="/mis-mascotas" className="mobile-link" onClick={closeAll}>🐾 Mis mascotas</NavLink>
            <button className="mobile-link mobile-link-danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
          </>
        ) : (
          <>
            <NavLink to="/login"    className="mobile-link" onClick={closeAll}>👤 Iniciar sesión</NavLink>
            <NavLink to="/register" className="mobile-link mobile-link-cta" onClick={closeAll}>✍️ Crear cuenta</NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default NavBar;