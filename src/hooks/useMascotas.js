import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

/**
 * Returns the saved pets for the current user.
 * Use this in Citas / Hotel to prefill the pet fields.
 *
 * @returns {{ mascotas: Array, loading: boolean }}
 */
const useMascotas = () => {
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!user) { setMascotas([]); return; }

    const fetch = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setMascotas(snap.exists() ? (snap.data().mascotas || []) : []);
      } catch {
        setMascotas([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  return { mascotas, loading };
};

export default useMascotas;