import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Item.css';

const Item = ({ id, title, price, image, category, stock }) => {
  const [loaded, setLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(id);

  const categoryEmojis = {
    nutricion: '🥩',
    bienestar: '💊',
    accesorios: '🎀',
    suscripcion: '📦',
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (stock === 0 || inCart || justAdded) return;
    addItem({ id, title, price, image, category, stock }, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <article className="item-card">
      <Link to={`/item/${id}`} className="item-image-wrapper">
        {!loaded && <div className="img-placeholder" />}
        <img
          src={image}
          alt={title}
          className={`item-image ${loaded ? 'img-loaded' : 'img-loading'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        {stock === 0 && <div className="item-sold-out">Sin stock</div>}
        <span className="tag item-category">
          {categoryEmojis[category] || '🐾'} {category}
        </span>

        {/* Quick-add overlay */}
        {stock > 0 && (
          <div className="item-overlay">
            <button
              className={`item-quick-add ${inCart || justAdded ? 'item-quick-add--done' : ''}`}
              onClick={handleQuickAdd}
              aria-label={inCart ? 'Ya en carrito' : 'Agregar al carrito'}
            >
              {inCart || justAdded ? '✓ En carrito' : '+ Agregar al carrito'}
            </button>
          </div>
        )}
      </Link>

      <div className="item-body">
        <h3 className="item-title">{title}</h3>

        {stock > 0 && stock <= 5 && (
          <p className="item-low-stock">⚡ Solo {stock} {stock === 1 ? 'unidad' : 'unidades'}</p>
        )}

        <div className="item-footer">
          <div className="item-price-wrap">
            <span className="item-price">${price.toLocaleString('es-MX')}</span>
            <span className="item-currency">MXN</span>
          </div>
          <Link to={`/item/${id}`} className="btn-outline item-btn">
            Ver más →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Item;