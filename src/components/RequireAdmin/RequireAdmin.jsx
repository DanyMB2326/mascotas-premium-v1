import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

/**
 * RequireAdmin – protege rutas /admin/*
 * Verifica que el usuario tenga role === 'admin' en Firestore.
 * 
 * Estructura Firestore esperada:
 *   users/{uid} → { role: 'admin' | 'empleado' | 'cliente', ... }
 */
const RequireAdmin = ({ children }) => {
  const { user, authReady } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin,  setIsAdmin]  = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!user) { setChecking(false); return; }

    const checkRole = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error verificando rol:', err);
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, [user, authReady]);

  if (!authReady || checking) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0A0F1E',
        color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" />
          <p style={{ marginTop: '1rem' }}>Verificando permisos…</p>
        </div>
      </div>
    );
  }

  if (!user)    return <Navigate to="/login"    replace />;
  if (!isAdmin) return <Navigate to="/"         replace />;

  return children;
};

export default RequireAdmin;