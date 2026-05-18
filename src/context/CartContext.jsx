/* eslint-disable react-refresh/only-export-components */
/**
 * CartContext.jsx — v2
 *
 * ─── Cambio principal ─────────────────────────────────────────
 *  ✅ Persistencia en localStorage: el carrito sobrevive recargas
 *     y cierres de pestaña.
 *  ✅ Función `updateQuantity(id, qty)` — ajuste preciso de cantidad
 *  ✅ Lazy initializer en useState para leer localStorage una sola vez
 * ─────────────────────────────────────────────────────────────
 *
 * API pública (sin cambios — retrocompatible):
 *   cartItems      → array de productos con quantity
 *   addItem(item, qty)   → agrega o incrementa
 *   removeItem(id)       → elimina del carrito
 *   updateQuantity(id, qty) → establece cantidad exacta (nueva)
 *   clearCart()          → vacía el carrito
 *   isInCart(id)         → boolean
 *   totalQuantity        → suma de todas las cantidades
 *   totalPrice           → suma de precio × cantidad
 */

import { createContext, useContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Clave de localStorage — cambiar si quieres un carrito por usuario
const STORAGE_KEY = 'pawloyal_cart';

/**
 * Lee el carrito guardado en localStorage.
 * Si no existe o el JSON es inválido, devuelve array vacío.
 * Se usa como lazy initializer de useState (se ejecuta solo una vez).
 */
const readCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Validar que sea un array de objetos con id, price y quantity
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.id !== 'undefined' && typeof item.price === 'number',
    );
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  // Lazy initializer: lee localStorage solo en el primer render
  const [cartItems, setCartItems] = useState(readCart);

  // Sincroniza localStorage cada vez que el carrito cambia.
  // JSON.stringify es síncrono y rápido — no necesita useCallback.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      // localStorage puede fallar en modo privado con cuota llena
      console.warn('[CartContext] No se pudo guardar el carrito:', e.message);
    }
  }, [cartItems]);

  // ── Acciones ──────────────────────────────────────────────

  /** Agrega un producto al carrito. Si ya existe, suma la cantidad. */
  const addItem = (item, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  /** Elimina un producto del carrito por su id. */
  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  /**
   * Establece la cantidad exacta de un producto.
   * Si qty <= 0, elimina el producto.
   */
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  /** Vacía el carrito por completo (y limpia localStorage). */
  const clearCart = () => setCartItems([]);

  /** Devuelve true si el producto ya está en el carrito. */
  const isInCart = (id) => cartItems.some((i) => i.id === id);

  // ── Derivados ─────────────────────────────────────────────
  const totalQuantity = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice    = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        totalQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};