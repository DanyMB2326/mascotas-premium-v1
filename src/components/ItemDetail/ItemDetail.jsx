import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import ItemCount from '../ItemCount/ItemCount';
import './ItemDetail.css';

const ItemDetail = ({ id, title, description, price, image, category, stock }) => {
  const { addItem, isInCart } = useCart();
  const alreadyInCart = isInCart(id);

  const handleAdd = (quantity) => {
    addItem({ id, title, price, image, category, stock }, quantity);
  };

  return (
    <article className="item-detail">
      {/* Image */}
      <div className="detail-image-wrapper">
        <img src={image} alt={title} className="detail-image" loading="lazy" />
        {stock === 0 && (
          <div className="detail-sold-out">Sin stock</div>
        )}
      </div>

      {/* Info */}
      <div className="detail-info">
        <span className="tag">{category}</span>

        <h1 className="detail-title">{title}</h1>

        <p className="detail-price">${price.toLocaleString('es-MX')}</p>

        <p className="detail-description">{description}</p>

        <div className="detail-stock-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {stock > 0
            ? `${stock} unidades disponibles`
            : 'Producto sin stock'}
        </div>

        {/* CTA area */}
        {stock === 0 ? (
          <div className="state-container" style={{ padding: '1.5rem 0', alignItems: 'flex-start' }}>
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>
              ⚠️ Este producto no tiene stock disponible.
            </p>
          </div>
        ) : alreadyInCart ? (
          <div className="detail-in-cart">
            <p className="in-cart-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ¡Producto agregado al carrito!
            </p>
            <Link to="/cart" className="btn-primary">
              🛒 Ver mi carrito
            </Link>
          </div>
        ) : (
          <ItemCount stock={stock} onAdd={handleAdd} />
        )}

        {/* Back link */}
        <Link to="/" className="btn-outline detail-back">
          ← Volver al reino
        </Link>
      </div>
    </article>
  );
};

export default ItemDetail;
