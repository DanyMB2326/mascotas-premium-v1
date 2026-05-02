import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Register.css';

const Register = () => {
  const [nombre,          setNombre]          = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [loading,         setLoading]         = useState(false);
  const navigate = useNavigate();

  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

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
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(db, 'users', user.uid), {
        uid:       user.uid,
        nombre:    nombre.trim(),
        email:     email.trim(),
        mascotas:  [],
        createdAt: serverTimestamp(),
      });

      toast.success('¡Cuenta creada! Bienvenido a la manada 🐾');
      navigate('/');
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'Ese email ya está registrado.',
        'auth/invalid-email':        'El formato del email no es válido.',
        'auth/weak-password':        'La contraseña es muy débil (mínimo 6 caracteres).',
        'auth/network-request-failed': 'Sin conexión. Verificá tu internet.',
      };
      toast.error(msg[err.code] || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <p className="register-brand">🐾 Manada</p>
        <h2 className="register-title">Crear Cuenta</h2>
        <p className="register-subtitle">Unite a la manada y accedé a beneficios exclusivos.</p>

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
            <label className="register-label" htmlFor="reg-pass">Contraseña</label>
            <div className="register-input-wrap">
              <input
                id="reg-pass"
                className="register-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-eye"
                onClick={() => setShowPass(v => !v)}
                aria-label="Mostrar/ocultar contraseña"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="register-group">
            <label className="register-label" htmlFor="reg-confirm">Confirmar contraseña</label>
            <input
              id="reg-confirm"
              className={`register-input ${!passwordsMatch ? 'register-input--error' : ''}`}
              type={showPass ? 'text' : 'password'}
              placeholder="Repetí tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {!passwordsMatch && (
              <span className="register-field-error">Las contraseñas no coinciden</span>
            )}
          </div>

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="register-extra">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="register-link">Iniciá sesión</Link>.
        </p>
      </div>
    </div>
  );
};

export default Register;