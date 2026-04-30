import { useState } from 'react';
import './Register.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Completá todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nombre,
        email,
        createdAt: new Date().toISOString(),
      });

      toast.success('¡Cuenta creada! Bienvenido a la manada 🐾');
      navigate('/');
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': 'Ese email ya está registrado.',
        'auth/invalid-email':        'El formato del email no es válido.',
        'auth/weak-password':        'La contraseña es muy débil. Usá al menos 6 caracteres.',
      };
      toast.error(messages[error.code] || 'Error al registrarse. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <p className="register-brand">🐾 Manada</p>
        <h2 className="register-title">Crear Cuenta</h2>
        <p className="register-subtitle">
          Unite a la manada y accedé a beneficios exclusivos.
        </p>

        <form className="register-form" onSubmit={handleRegister} noValidate>
          <div className="register-group">
            <label className="register-label" htmlFor="reg-nombre">Nombre completo</label>
            <input
              id="reg-nombre"
              className="register-input"
              type="text"
              placeholder="María García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="register-group">
            <label className="register-label" htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              className="register-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="register-group">
            <label className="register-label" htmlFor="reg-password">Contraseña</label>
            <div className="register-input-wrap">
              <input
                id="reg-password"
                className="register-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="register-group">
            <label className="register-label" htmlFor="reg-confirm">Confirmar contraseña</label>
            <input
              id="reg-confirm"
              className={`register-input ${
                confirmPassword && confirmPassword !== password
                  ? 'register-input--error'
                  : ''
              }`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Repetí tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {confirmPassword && confirmPassword !== password && (
              <span className="register-field-error">Las contraseñas no coinciden</span>
            )}
          </div>

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="register-extra">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="register-link">
            Iniciá sesión
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;