import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findProduct, PRODUCTS } from '../../data/products';
import { useCart } from '../../context/CartContext';
import '../ProductDetail/ProductDetail.css';

const COLOR_BG = {
  navy:  'linear-gradient(135deg, rgba(31,58,95,.1) 0%, var(--cream-warm) 100%)',
  gold:  'linear-gradient(135deg, rgba(244,196,48,.12) 0%, var(--cream-warm) 100%)',
  teal:  'linear-gradient(135deg, rgba(44,138,138,.1) 0%, var(--cream-warm) 100%)',
  brown: 'linear-gradient(135deg, rgba(107,85,68,.1) 0%, var(--cream-warm) 100%)',
};

const ProductDetail = () => {
  const { id }        = useParams();
  const product       = findProduct(id);
  const { addItem, isInCart } = useCart();
  const [qty, setQty]         = useState(1);
  const [added, setAdded]     = useState(false);

  if (!product) {
    return (
      <div className="state-container">
        <span className="state-icon">🐾</span>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o fue removido del catálogo.</p>
        <Link to="/tienda" className="btn-primary" style={{ marginTop: '1rem' }}>
          Ver todos los productos
        </Link>
      </div>
    );
  }

  const inCart    = isInCart(product.id);
  const canAdd    = product.stock > 0 && !inCart && !added;
  const related   = PRODUCTS
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({ ...product }, qty);
    setAdded(true);
  };

  return (
    <div className="pd-page">

      {/* Breadcrumb */}
      <nav className="pd-breadcrumb">
        <Link to="/tienda">Tienda</Link>
        <span>›</span>
        <span className="pd-bc-cat">{product.category}</span>
        <span>›</span>
        <span className="pd-bc-current">{product.title}</span>
      </nav>

      {/* Main */}
      <div className="pd-main">

        {/* Imagen / visual */}
        <div className="pd-visual" style={{ background: COLOR_BG[product.color] }}>
          {product.tag && <span className="pd-tag">{product.tag}</span>}
          <div className="pd-emoji-wrap">
            <span className="pd-emoji">{product.emoji}</span>
          </div>
          <div className="pd-brand-badge">{product.brand}</div>
        </div>

        {/* Info */}
        <div className="pd-info">
          <div className="pd-info-top">
            <span className="pd-brand-label">{product.brand}</span>
            {product.especie && <span className="pd-especie-tag">{product.especie}</span>}
          </div>

          <h1 className="pd-title">{product.title}</h1>

          {product.peso && <p className="pd-peso">📦 {product.peso}</p>}

          <p className="pd-desc">{product.descripcion}</p>

          {product.bullets && (
            <ul className="pd-bullets">
              {product.bullets.map((b) => (
                <li key={b}>
                  <span className="pd-bullet-dot">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Precio */}
          <div className="pd-price-row">
            <span className="pd-price">${product.price.toLocaleString('es-MX')}</span>
            <span className="pd-currency">MXN</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="pd-low-stock">⚡ Solo {product.stock} disponibles</span>
            )}
          </div>

          {/* Qty + Add */}
          {product.stock > 0 ? (
            <div className="pd-actions">
              {!inCart && !added && (
                <div className="pd-qty-ctrl">
                  <button
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >−</button>
                  <span className="qty-val">{qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                  >+</button>
                </div>
              )}

              <button
                className={`pd-add-btn ${added || inCart ? 'pd-add-btn--done' : ''}`}
                onClick={handleAdd}
                disabled={!canAdd}
              >
                {added || inCart
                  ? '✓ Agregado al carrito'
                  : `🛒 Agregar ${qty > 1 ? `(×${qty})` : ''} al carrito`}
              </button>

              {(added || inCart) && (
                <Link to="/cart" className="btn-outline pd-view-cart">
                  Ver carrito →
                </Link>
              )}
            </div>
          ) : (
            <div className="pd-no-stock">
              <span>😔</span>
              <p>Este producto está temporalmente sin stock. <Link to="/tienda">Ver otros productos →</Link></p>
            </div>
          )}

          {/* Envío */}
          <div className="pd-shipping">
            <div className="pd-ship-item">
              <span>🚚</span>
              <div>
                <strong>Envío a domicilio en CDMX</strong>
                <p>Entrega en 24–72 hrs hábiles</p>
              </div>
            </div>
            <div className="pd-ship-item">
              <span>💚</span>
              <div>
                <strong>Productos originales</strong>
                <p>Distribuidores oficiales de cada marca</p>
              </div>
            </div>
            <div className="pd-ship-item">
              <span>🔄</span>
              <div>
                <strong>Devoluciones fáciles</strong>
                <p>Hasta 15 días si el producto no es lo que esperabas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {related.length > 0 && (
        <section className="pd-related">
          <h2>También te puede interesar</h2>
          <div className="pd-related-grid">
            {related.map((p) => (
              <Link key={p.id} to={`/tienda/${p.id}`} className="pd-related-card">
                <div className="pd-related-img" style={{ background: COLOR_BG[p.color] }}>
                  <span>{p.emoji}</span>
                </div>
                <div className="pd-related-body">
                  <span className="pd-brand-label">{p.brand}</span>
                  <p className="pd-related-title">{p.title}</p>
                  <strong className="pd-related-price">${p.price.toLocaleString('es-MX')} MXN</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;