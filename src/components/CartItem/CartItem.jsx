import { useCart } from '../../context/CartContext';
import '../CartItem/CartItem.css';

const CartItem = ({ id, title, price, image, emoji, quantity }) => {
  const { removeItem } = useCart();

  return (
    <div className="cart-item">
      <div className="ci-image-wrap">
        {image
          ? <img src={image} alt={title} className="ci-image" />
          : <span className="ci-emoji">{emoji || '🐾'}</span>
        }
      </div>

      <div className="ci-info">
        <p className="ci-title">{title}</p>
        <p className="ci-unit-price">${price.toLocaleString('es-MX')} MXN c/u</p>
      </div>

      <div className="ci-right">
        <span className="ci-qty">× {quantity}</span>
        <span className="ci-subtotal">${(price * quantity).toLocaleString('es-MX')} MXN</span>
        <button
          className="btn-ghost ci-remove"
          onClick={() => removeItem(id)}
          aria-label={`Eliminar ${title}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;