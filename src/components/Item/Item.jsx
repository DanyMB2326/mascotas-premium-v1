import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Item.css';

const Item = ({ id, title, price, image, category, stock }) => {
  const [loaded, setLoaded] = useState(false);

  const categoryEmojis = {
    nutricion: '🥩',
    bienestar: '💊',
    accesorios: '🎀',
    suscripcion: '📦',
  };

  return (
    <article className="item-card">
      <Link to={`/item/${id}`} className="item-image-wrapper">
        {!loaded && <div className="img-placeholder" />}
        <img
          src={image} alt={title} className={`item-image ${loaded ? 'img-loaded' : 'img-loading'}`}
          loading="lazy" onLoad={() => setLoaded(true)}
        />
        {stock === 0 && <div className="item-sold-out">Sin stock</div>}
        <span className="tag item-category">{categoryEmojis[category] || '🐾'} {category}</span>
      </Link>
      <div className="item-body">
        <h3 className="item-title">{title}</h3>
        <div className="item-footer">
          <span className="item-price">${price.toLocaleString('es-MX')} MXN</span>
          <Link to={`/item/${id}`} className="btn-primary item-btn">Ver más</Link>
        </div>
      </div>
    </article>
  );
};

export default Item;