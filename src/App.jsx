/**
 * App.jsx — VERSIÓN ACTUALIZADA con rutas del Dashboard Admin
 *
 * Cambios respecto al original:
 *  1. Importa AdminDashboard y RequireAdmin.
 *  2. Agrega la ruta /admin (protegida por rol admin).
 *  3. Todo lo demás es idéntico al original.
 *
 * ════════════════════════════════════════════════════════════
 *  FLUJO DE ACCESO AL PANEL:
 *
 *  Opción A — URL directa:
 *    El administrador navega a /admin manualmente o via
 *    un enlace discreto en el footer.
 *
 *  Opción B — Keyboard shortcut (recomendado):
 *    Ctrl + Shift + A desde cualquier página.
 *    (Implementado en useAdminShortcut, llamado en NavBar)
 *
 *  Opción C — Menú de usuario:
 *    Si el usuario autenticado tiene role === 'admin',
 *    el NavBar muestra el enlace "Panel Admin" en su dropdown.
 * ════════════════════════════════════════════════════════════
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer }          from 'react-toastify';
import NavBar                      from './components/NavBar/NavBar';
import Footer                      from './components/Footer/Footer';
import ScrollToTop                 from './components/ScrollToTop/ScrollToTop';
import Home                        from './components/Home/Home';
import Nosotros                    from './components/Nosotros/Nosotros';
import Servicios                   from './components/Servicios/Servicios';
import ServiceDetail               from './components/ServiceDetail/ServiceDetail';
import Reservar                    from './components/Reservar/Reservar';
import Login                       from './components/Login/Login';
import Register                    from './components/Register/Register';
import MiPerfil                    from './components/MiPerfil/MiPerfil';
import Tienda                      from './components/Tienda/Tienda';
import ProductDetail               from './components/ProductDetail/ProductDetail';
import Cart                        from './components/Cart/Cart';
import Checkout                    from './components/CheckOut/CheckOut';
import AvisoPrivacidad             from './components/AvisoPrivacidad/AvisoPrivacidad';
import TerminosCondiciones         from './components/TerminosCondiciones/TerminosCondiciones';
import NotFound                    from './components/NotFound/NotFound';
import RequireAuth                 from './components/RequireAuth/RequireAuth';

// ── NUEVO: Dashboard administrativo ──────────────────────
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import RequireAdmin   from './components/RequireAdmin/RequireAdmin';

const Protected = ({ children }) => (
  <RequireAuth><div className="container">{children}</div></RequireAuth>
);

const App = () => (
  <>
    <ScrollToTop />

    {/*
      El NavBar no se renderiza en la ruta /admin.
      El dashboard tiene su propio sidebar y header.
    */}
    <Routes>
      <Route path="/admin/*" element={
        <RequireAdmin>
          <AdminDashboard />
        </RequireAdmin>
      } />

      {/* ── Rutas públicas con NavBar + Footer ── */}
      <Route path="*" element={
        <>
          <NavBar />
          <main>
            <Routes>
              <Route path="/"                    element={<Home />} />
              <Route path="/nosotros"            element={<div className="container"><Nosotros /></div>} />
              <Route path="/servicios"           element={<div className="container"><Servicios /></div>} />
              <Route path="/servicios/:id"       element={<div className="container"><ServiceDetail /></div>} />
              <Route path="/reservar"            element={<div className="container"><Reservar /></div>} />
              <Route path="/reservar/:serviceId" element={<div className="container"><Reservar /></div>} />
              <Route path="/tienda"              element={<div className="container"><Tienda /></div>} />
              <Route path="/tienda/:id"          element={<div className="container"><ProductDetail /></div>} />
              <Route path="/cart"                element={<div className="container"><Cart /></div>} />
              <Route path="/checkout"            element={<div className="container"><Checkout /></div>} />
              <Route path="/login"               element={<div className="container"><Login /></div>} />
              <Route path="/register"            element={<div className="container"><Register /></div>} />
              <Route path="/aviso-privacidad"    element={<div className="container"><AvisoPrivacidad /></div>} />
              <Route path="/terminos"            element={<div className="container"><TerminosCondiciones /></div>} />
              <Route path="/perfil"              element={<Protected><MiPerfil /></Protected>} />
              <Route path="/mis-mascotas"        element={<Navigate to="/perfil" replace />} />
              <Route path="*"                    element={<div className="container"><NotFound /></div>} />
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>

    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      pauseOnHover
      theme="light"
    />
  </>
);

export default App;