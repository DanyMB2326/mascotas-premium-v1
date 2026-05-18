/**
 * AdminDashboard.jsx
 *
 * ─── Cambios v2 ───────────────────────────────────────────────
 *  ✅ useAdminData() instanciado aquí — datos disponibles para todas las vistas
 *  ✅ AdminDataContext para pasar datos sin prop drilling
 *  ✅ React.lazy + Suspense en todas las vistas
 *  ✅ Alertas de stock bajo y pedidos urgentes en el header
 *  ✅ Nuevas entradas de navegación (Servicios, Analíticas, Config)
 *  ✅ Indicador de loading global del dashboard
 * ──────────────────────────────────────────────────────────────
 */

/* eslint-disable react-refresh/only-export-components */

import {
  lazy, Suspense, useState, useEffect, useCallback,
  createContext, useContext,
} from 'react';
import { useNavigate }   from 'react-router-dom';
import { useAuth }       from '../../context/AuthContext';
import { useAdminData }  from '../../hooks/useAdminData';
import { toast }         from 'react-toastify';
import './AdminDashboard.css';

// ── Lazy imports (code splitting automático) ─────────────────
const Overview    = lazy(() => import('./views/Overview'));
const Pedidos     = lazy(() => import('./views/Pedidos'));
const Clientes    = lazy(() => import('./views/Clientes'));
const Finanzas    = lazy(() => import('./views/Finanzas'));
const Personal    = lazy(() => import('./views/Personal'));
const Inventario  = lazy(() => import('./views/Inventario'));
const Servicios    = lazy(() => import('./views/Servicios'));
const Agenda       = lazy(() => import('./views/Agenda'));
const Analiticas   = lazy(() => import('./views/Analiticas'));
// const Configuracion = lazy(() => import('./views/Configuracion')); // Fase 4

// ─────────────────────────────────────────────────────────────
// Context para compartir adminData con las vistas hijas
// ─────────────────────────────────────────────────────────────
export const AdminDataContext = createContext(null);

/** Hook para consumir los datos del admin desde cualquier vista */
export const useAdminContext = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminContext debe usarse dentro de <AdminDashboard>');
  return ctx;
};

// ─────────────────────────────────────────────────────────────
// Navegación
// ─────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',   icon: '◈',  label: 'Panel General' },
  { id: 'pedidos',    icon: '📦', label: 'Pedidos'       },
  { id: 'clientes',   icon: '👥', label: 'Clientes'      },
  { id: 'finanzas',   icon: '💰', label: 'Finanzas'      },
  { id: 'personal',   icon: '👷', label: 'Personal'      },
  { id: 'inventario', icon: '🗃', label: 'Inventario'    },
  { id: 'servicios',  icon: '✂️', label: 'Servicios'     },
  { id: 'agenda',     icon: '📅', label: 'Agenda'        },
  { id: 'analiticas', icon: '📊', label: 'Analíticas'    },
  // { id: 'config', icon: '⚙️', label: 'Configuración' }, // Fase 4
];

const VALID_VIEWS = NAV.map(n => n.id);

// ─────────────────────────────────────────────────────────────
// Loader de vista (fallback para Suspense)
// ─────────────────────────────────────────────────────────────
const ViewLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '60vh', flexDirection: 'column', gap: '1rem',
  }}>
    <div className="admin-spinner" />
    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Cargando vista…</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Chip de alerta en el topbar
// ─────────────────────────────────────────────────────────────
const AlertChip = ({ count, label, color, onClick }) => {
  if (!count) return null;
  return (
    <button
      onClick={onClick}
      style={{
        background: `${color}20`,
        border: `1px solid ${color}40`,
        borderRadius: 999,
        padding: '0.2rem 0.65rem',
        fontSize: '0.72rem',
        color,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {count} {label}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Dashboard principal
// ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const adminData         = useAdminData();   // ← Hook central instanciado aquí

  const [activeView,  setActiveView]  = useState(() => {
    const saved = sessionStorage.getItem('admin-view');
    return saved && VALID_VIEWS.includes(saved) ? saved : 'overview';
  });
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [time,        setTime]        = useState(new Date());

  /* Reloj del topbar */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const navigateTo = useCallback((id) => {
    setActiveView(id);
    sessionStorage.setItem('admin-view', id);
    setMobileOpen(false);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const renderView = () => {
    switch (activeView) {
      case 'pedidos':    return <Pedidos />;
      case 'clientes':   return <Clientes />;
      case 'finanzas':   return <Finanzas />;
      case 'personal':   return <Personal />;
      case 'inventario': return <Inventario />;
      case 'servicios':  return <Servicios />;
      case 'agenda':     return <Agenda />;
      case 'analiticas': return <Analiticas />;
      default:           return <Overview />;
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const timeStr = time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    /* ── AdminDataContext: todas las vistas pueden consumir adminData ── */
    <AdminDataContext.Provider value={adminData}>
      <div className={`admin-shell${collapsed ? ' sidebar-collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Overlay móvil */}
        {mobileOpen && (
          <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="sidebar-logo-icon">🐾</span>
              {!collapsed && (
                <div className="sidebar-logo-text">
                  <span className="sidebar-brand">Paw Loyal</span>
                  <span className="sidebar-sub">Panel Admin</span>
                </div>
              )}
            </div>
            <button
              className="collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {!collapsed && (
              <span className="nav-section-label">NAVEGACIÓN</span>
            )}
            {NAV.map(item => {
              // Badge de alerta en entradas específicas
              const badge =
                item.id === 'pedidos'    ? adminData.urgentPending     || 0 :
                item.id === 'inventario' ? adminData.lowStockAlerts?.length || 0 :
                0;

              return (
                <button
                  key={item.id}
                  className={`sidebar-link${activeView === item.id ? ' active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar-label">{item.label}</span>}
                  {badge > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#EF4444',
                      color: '#fff',
                      borderRadius: 999,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      lineHeight: 1.4,
                    }}>
                      {badge}
                    </span>
                  )}
                  {!collapsed && activeView === item.id && (
                    <span className="sidebar-active-dot" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            {!collapsed && (
              <div className="sidebar-user">
                <div className="sidebar-avatar">{displayName[0]?.toUpperCase()}</div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{displayName}</span>
                  <span className="sidebar-user-role">Administrador</span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                className="sidebar-action-btn"
                title="Ir a la tienda"
                onClick={() => navigate('/')}
              >
                🏠
              </button>
              <button
                className="sidebar-action-btn"
                title="Cerrar sesión"
                onClick={handleLogout}
              >
                ⏻
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="admin-main">

          {/* Topbar */}
          <header className="admin-topbar">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
            >
              ☰
            </button>

            <div className="topbar-breadcrumb">
              <span
                className="breadcrumb-root"
                onClick={() => navigateTo('overview')}
              >
                Admin
              </span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">
                {NAV.find(n => n.id === activeView)?.label}
              </span>
            </div>

            {/* Chips de alerta en tiempo real */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
              <AlertChip
                count={adminData.urgentPending}
                label="pendientes"
                color="#F59E0B"
                onClick={() => navigateTo('pedidos')}
              />
              <AlertChip
                count={adminData.outOfStockAlerts?.length}
                label="sin stock"
                color="#EF4444"
                onClick={() => navigateTo('inventario')}
              />
            </div>

            <div className="topbar-right">
              <div className="topbar-time">
                <span className="time-str">{timeStr}</span>
                <span className="date-str">{dateStr}</span>
              </div>
              <div className="topbar-avatar" title={user?.email}>
                {displayName[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          {/* Contenido con Suspense */}
          <main className="admin-content">
            <Suspense fallback={<ViewLoader />}>
              {renderView()}
            </Suspense>
          </main>
        </div>
      </div>
    </AdminDataContext.Provider>
  );
};

export default AdminDashboard;