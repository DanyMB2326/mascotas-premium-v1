import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, CATEGORIAS_TIENDA, MARCAS_TIENDA } from '../../data/products';
import { useCart } from '../../context/CartContext';
import CartWidget from '../CartWidget/CartWidget';
import '../Tienda/Tienda.css';

const COLOR_ACCENT = {
  navy:  'var(--navy)',
  gold:  'var(--gold)',
  teal:  'var(--teal)',
  brown: 'var(--brown)',
};

const ProductCard = ({ product }) => {
  const { addItem, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stock === 0 || inCart || justAdded) return;
    addItem({ ...product, price: product.price }, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <Link to={`/tienda/${product.id}`} className="prod-card">
      {/* Imagen emoji */}
      <div className="prod-img" style={{ '--accent-color': COLOR_ACCENT[product.color] }}>
        <span className="prod-emoji">{product.emoji}</span>
        {product.tag && <span className="prod-tag">{product.tag}</span>}
        {product.stock === 0 && <div className="prod-sold-out">Sin stock</div>}
        {product.stock > 0 && (
          <div className="prod-overlay">
            <button
              className={`prod-quick-add ${inCart || justAdded ? 'done' : ''}`}
              onClick={handleAdd}
            >
              {inCart || justAdded ? '✓ En carrito' : '+ Agregar al carrito'}
            </button>
          </div>
        )}
      </div>

      <div className="prod-body">
        <span className="prod-brand">{product.brand}</span>
        <h3 className="prod-title">{product.title}</h3>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="prod-low-stock">⚡ Solo {product.stock} disponibles</p>
        )}

        <div className="prod-footer">
          <div className="prod-price-wrap">
            <span className="prod-price">${product.price.toLocaleString('es-MX')}</span>
            <span className="prod-currency">MXN</span>
          </div>
          <span className="prod-especie">{product.especie}</span>
        </div>
      </div>
    </Link>
  );
};

const Tienda = () => {
  const [cat,    setCat]    = useState('todos');
  const [marca,  setMarca]  = useState('todas');
  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState('default');
  const { totalQuantity }   = useCart();

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (cat   !== 'todos')  list = list.filter((p) => p.category === cat);
    if (marca !== 'todas')  list = list.filter((p) => p.brand === marca);
    if (search.trim())      list = list.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name')       list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [cat, marca, search, sort]);

  return (
    <div className="tienda-page">

      {/* ── Header ── */}
      <div className="tienda-hero">
        <div className="tienda-hero-text">
          <span className="tag">🛒 Tienda Paw Loyal</span>
          <h1>Productos para tu mascota</h1>
          <p>Alimentos premium, juguetes, camas y accesorios de las mejores marcas. Envío a domicilio en CDMX.</p>
        </div>
        <Link to="/cart" className="tienda-cart-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Carrito
          {totalQuantity > 0 && <span className="tienda-cart-count">{totalQuantity}</span>}
        </Link>
      </div>

      {/* ── Filtros + grid ── */}
      <div className="tienda-layout">

        {/* Sidebar filtros */}
        <aside className="tienda-sidebar">
          {/* Búsqueda */}
          <div className="filter-group">
            <label className="filter-label">Buscar</label>
            <input
              type="search"
              placeholder="Royal Canin, arnés…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-search"
            />
          </div>

          {/* Categoría */}
          <div className="filter-group">
            <label className="filter-label">Categoría</label>
            {CATEGORIAS_TIENDA.map((c) => (
              <button
                key={c.id}
                className={`filter-btn ${cat === c.id ? 'filter-btn--active' : ''}`}
                onClick={() => setCat(c.id)}
              >
                {c.emoji} {c.label}
                <span className="filter-count">
                  {c.id === 'todos'
                    ? PRODUCTS.length
                    : PRODUCTS.filter((p) => p.category === c.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Marca */}
          <div className="filter-group">
            <label className="filter-label">Marca</label>
            <button
              className={`filter-btn ${marca === 'todas' ? 'filter-btn--active' : ''}`}
              onClick={() => setMarca('todas')}
            >
              Todas las marcas
              <span className="filter-count">{PRODUCTS.length}</span>
            </button>
            {MARCAS_TIENDA.map((m) => (
              <button
                key={m}
                className={`filter-btn ${marca === m ? 'filter-btn--active' : ''}`}
                onClick={() => setMarca(m)}
              >
                {m}
                <span className="filter-count">{PRODUCTS.filter((p) => p.brand === m).length}</span>
              </button>
            ))}
          </div>

          {/* Ordenar */}
          <div className="filter-group">
            <label className="filter-label">Ordenar por</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
              <option value="default">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre A–Z</option>
            </select>
          </div>

          {/* Reset */}
          {(cat !== 'todos' || marca !== 'todas' || search) && (
            <button className="filter-reset" onClick={() => { setCat('todos'); setMarca('todas'); setSearch(''); setSort('default'); }}>
              ✕ Limpiar filtros
            </button>
          )}
        </aside>

        {/* Grid de productos */}
        <main className="tienda-main">
          <div className="tienda-toolbar">
            <p className="tienda-count">
              {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
              {cat !== 'todos' && <> en <strong>{CATEGORIAS_TIENDA.find((c) => c.id === cat)?.label}</strong></>}
              {marca !== 'todas' && <> · <strong>{marca}</strong></>}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="tienda-empty">
              <span>🔍</span>
              <h3>Sin resultados</h3>
              <p>Intenta con otros filtros o términos de búsqueda.</p>
              <button className="btn-outline" onClick={() => { setCat('todos'); setMarca('todas'); setSearch(''); }}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="tienda-grid">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Tienda;