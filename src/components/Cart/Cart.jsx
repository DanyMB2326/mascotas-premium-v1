import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../CartItem/CartItem';
import './Cart.css';

const Cart = () => {
  const { cartItems, clearCart, totalQuantity, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="state-container">
        <span className="state-icon">🛒</span>
        <h2>🛒 Tu carrito está vacío</h2>
        <p>¡El reino tiene mucho para ofrecerte! Explorá el menú y elegí tus favoritos.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '0.5rem' }}>
          ✨ Explorar el reino
        </Link>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <div className="section-header">
        <h1>Tu carrito</h1>
        <p>{totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'} seleccionados</p>
      </div>

      <div className="cart-layout">
        {/* Items list */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <CartItem key={item.id} {...item} />
          ))}

          <button className="btn-ghost clear-btn" onClick={clearCart}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            Vaciar carrito
          </button>
        </div>

        {/* Order summary */}
        <aside className="cart-summary">
          <h2 className="summary-title">Resumen</h2>

          <div className="summary-lines">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-line">
                <span className="summary-line-label">
                  {item.title} <em>×{item.quantity}</em>
                </span>
                <span className="summary-line-value">
                  ${(item.price * item.quantity).toLocaleString('es-MX')}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <span className="summary-total-value">
              ${totalPrice.toLocaleString('es-MX')}
            </span>
          </div>

          <Link to="/checkout" className="btn-primary summary-cta">
            Finalizar compra →
          </Link>

          <Link to="/" className="btn-outline summary-back">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default Cart;