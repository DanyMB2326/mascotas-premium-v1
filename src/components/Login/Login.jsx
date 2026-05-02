import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Completá todos los campos.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('¡Bienvenido de vuelta! 🐾');
      navigate('/');
    } catch (err) {
      const msg = {
        'auth/user-not-found':     'No existe una cuenta con ese email.',
        'auth/wrong-password':     'Contraseña incorrecta.',
        'auth/invalid-email':      'El email no tiene un formato válido.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/too-many-requests':  'Demasiados intentos. Esperá unos minutos.',
        'auth/network-request-failed': 'Sin conexión. Verificá tu internet.',
      };
      toast.error(msg[err.code] || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="login-brand">🐾 Manada</p>
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">Accedé para gestionar tus compras y mascotas.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-group">
            <label className="login-label" htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-group">
            <label className="login-label" htmlFor="login-password">Contraseña</label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                className="login-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPass(v => !v)}
                aria-label="Mostrar/ocultar contraseña"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-extra">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="login-link">Registrate</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;