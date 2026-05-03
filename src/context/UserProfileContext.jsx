/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const UserProfileContext = createContext(null);

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile debe usarse dentro de <UserProfileProvider>');
  return ctx;
};

const EMPTY_PROFILE = {
  nombre:    '',
  apellido:  '',
  telefono:  '',
  addresses: [],   // [{ id, alias, calle, numExt, numInt, colonia, cp, referencias, isPrimary }]
  cards:     [],   // [{ id, alias, brand, last4, expiry, isPrimary }]  — nunca el número completo
};

export const UserProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(false);

  /* ── Load profile from Firestore when user changes ── */
  useEffect(() => {
    let cancelled = false;
    const cleanup = () => { cancelled = true; };

    queueMicrotask(async () => {
      if (cancelled) return;

      if (!user) {
        setProfile(EMPTY_PROFILE);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref  = doc(db, 'users', user.uid, 'profile', 'data');
        const snap = await getDoc(ref);
        if (cancelled) return;

        if (snap.exists()) {
          setProfile({ ...EMPTY_PROFILE, ...snap.data() });
        } else {
          const [first = '', ...rest] = (user.displayName || '').split(' ');
          setProfile({
            ...EMPTY_PROFILE,
            nombre:   first,
            apellido: rest.join(' '),
            telefono: user.phoneNumber || '',
          });
        }
      } catch {
        // Firestore sin conexión o sin permisos
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return cleanup;
  }, [user]);

  /* ── Persist to Firestore ── */
  const persist = useCallback(async (updated) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'profile', 'data');
    await setDoc(ref, updated, { merge: true });
  }, [user]);

  /* ── Basic info ── */
  const saveBasicInfo = async (data) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    await persist(updated);
  };

  /* ── Addresses ── */
  const addAddress = async (addr) => {
    const newAddr = {
      ...addr,
      id: crypto.randomUUID(),
      isPrimary: profile.addresses.length === 0,
    };
    const updated = { ...profile, addresses: [...profile.addresses, newAddr] };
    setProfile(updated);
    await persist(updated);
    return newAddr;
  };

  const updateAddress = async (id, data) => {
    const addresses = profile.addresses.map((a) => a.id === id ? { ...a, ...data } : a);
    const updated = { ...profile, addresses };
    setProfile(updated);
    await persist(updated);
  };

  const deleteAddress = async (id) => {
    let addresses = profile.addresses.filter((a) => a.id !== id);
    // If we deleted primary, promote first remaining
    if (addresses.length > 0 && !addresses.some((a) => a.isPrimary)) {
      addresses[0] = { ...addresses[0], isPrimary: true };
    }
    const updated = { ...profile, addresses };
    setProfile(updated);
    await persist(updated);
  };

  const setPrimaryAddress = async (id) => {
    const addresses = profile.addresses.map((a) => ({ ...a, isPrimary: a.id === id }));
    const updated = { ...profile, addresses };
    setProfile(updated);
    await persist(updated);
  };

  /* ── Cards — only metadata stored, never full PAN ── */
  const addCard = async (cardMeta) => {
    const newCard = {
      ...cardMeta,                   // { alias, brand, last4, expiry }
      id: crypto.randomUUID(),
      isPrimary: profile.cards.length === 0,
    };
    const updated = { ...profile, cards: [...profile.cards, newCard] };
    setProfile(updated);
    await persist(updated);
    return newCard;
  };

  const deleteCard = async (id) => {
    let cards = profile.cards.filter((c) => c.id !== id);
    if (cards.length > 0 && !cards.some((c) => c.isPrimary)) {
      cards[0] = { ...cards[0], isPrimary: true };
    }
    const updated = { ...profile, cards };
    setProfile(updated);
    await persist(updated);
  };

  const setPrimaryCard = async (id) => {
    const cards = profile.cards.map((c) => ({ ...c, isPrimary: c.id === id }));
    const updated = { ...profile, cards };
    setProfile(updated);
    await persist(updated);
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile, loading,
        saveBasicInfo,
        addAddress, updateAddress, deleteAddress, setPrimaryAddress,
        addCard, deleteCard, setPrimaryCard,
        primaryAddress: (profile.addresses ?? []).find((a) => a.isPrimary) ?? profile.addresses?.[0] ?? null,
        primaryCard:    (profile.cards ?? []).find((c) => c.isPrimary)    ?? profile.cards?.[0]    ?? null,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};