/**
 * Inventario.jsx — v2
 * Sin suscripciones propias. Consume inventory desde AdminDataContext.
 * Las escrituras (updateDoc stock) permanecen aquí.
 */
import { useState, useMemo } from 'react';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { toast }           from 'react-toastify';
import { db }              from '../../../firebase/config';
import { useAdminContext } from '../AdminDashboard';

const PRODUCTS_COLLECTION = 'products';

const getName  = (p) => p.title    || p.name      || p.nombre   || '—';
const getPrice = (p) => p.price    || p.precio     || 0;
const getStock = (p) => p.stock    ?? p.quantity   ?? 0;
const getCat   = (p) => p.category || p.categoria  || '—';
const getImg   = (p) => p.image    || p.imageURL   || null;
const getSku   = (p, fallback) => p.sku || p.code || fallback?.slice(-6) || '—';

const StockBar = ({ stock }) => {
  const max   = Math.max(stock, 10, 1);
  const pct   = Math.min((stock / max) * 100, 100);
  const color = stock === 0 ? '#EF4444' : stock <= 5 ? '#F59E0B' : '#10B981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: 6, background: '#1C2333', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color, minWidth: 20 }}>{stock}</span>
    </div>
  );
};

const StockBadge = ({ stock }) => {
  if (stock === 0)    return <span className="badge badge-danger">Sin stock</span>;
  if (stock <= 5)     return <span className="badge badge-warning">⚠ Bajo</span>;
  return                     <span className="badge badge-success">OK</span>;
};

const Inventario = () => {
  const { inventory, loading, lowStockAlerts, outOfStockAlerts } = useAdminContext(); // ← sin subscription propia

  const [catFilter, setCatFilter] = useState('todos');
  const [search,    setSearch]    = useState('');
  const [editing,   setEditing]   = useState(null);
  const [stockVal,  setStockVal]  = useState('');
  const [alertDismissed, setAlertDismissed] = useState(false);

  const cats = useMemo(
    () => ['todos', ...new Set(inventory.map((p) => getCat(p)).filter((c) => c !== '—'))],
    [inventory],
  );

  const filtered = useMemo(() => inventory.filter((p) => {
    const matchCat    = catFilter === 'todos' || getCat(p) === catFilter;
    const matchSearch = !search || [getName(p), getSku(p, p.id), getCat(p)].some((f) => f?.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  }), [inventory, catFilter, search]);

  const totalVal = useMemo(() => inventory.reduce((s, p) => s + getStock(p) * getPrice(p), 0), [inventory]);

  const adjustStock = async (product, delta) => {
    const field = product.stock !== undefined ? 'stock' : product.quantity !== undefined ? 'quantity' : 'stock';
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, product.id), {
        [field]: increment(delta), updatedAt: serverTimestamp(),
      });
      toast.success(`Stock: ${getStock(product)} → ${Math.max(0, getStock(product) + delta)}`);
    } catch (e) {
      toast.error('Error al ajustar stock');
      console.error(e);
    }
  };

  const saveStock = async (product) => {
    const val = parseInt(stockVal, 10);
    if (isNaN(val) || val < 0) { toast.error('Número inválido'); return; }
    const field = product.stock !== undefined ? 'stock' : product.quantity !== undefined ? 'quantity' : 'stock';
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, product.id), { [field]: val, updatedAt: serverTimestamp() });
      toast.success(`Stock actualizado a ${val}`);
      setEditing(null);
    } catch (e) {
      toast.error('Error al guardar');
      console.error(e);
    }
  };

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Control de Inventario</h1>
          <p className="view-subtitle">Productos de la tienda · tiempo real</p>
        </div>
      </div>

      {!alertDismissed && (lowStockAlerts.length > 0 || outOfStockAlerts.length > 0) && (
        <div className="alert-banner">
          <span>
            {outOfStockAlerts.length > 0 && `⛔ ${outOfStockAlerts.length} sin stock — `}
            {lowStockAlerts.length > 0   && `⚠️ ${lowStockAlerts.length} con stock bajo`}
          </span>
          <button className="btn-icon" onClick={() => setAlertDismissed(true)}>✕</button>
        </div>
      )}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '0.75rem' }}>
        <div className="mini-stat"><span className="ms-val">{inventory.length}</span><span className="ms-lbl">Productos</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#EF4444' }}>{outOfStockAlerts.length}</span><span className="ms-lbl">Sin stock</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#F59E0B' }}>{lowStockAlerts.length}</span><span className="ms-lbl">Stock bajo</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#6366F1' }}>${totalVal.toLocaleString('es-MX')}</span><span className="ms-lbl">Valor total</span></div>
      </div>

      <div className="filter-row">
        <div className="status-tabs" style={{ flexWrap: 'wrap' }}>
          {cats.map((c) => (
            <button key={c} className={`status-tab${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>
              {c === 'todos' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <input className="search-input" placeholder="🔍 Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading
          ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando productos…</div>
          : inventory.length === 0
          ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Sin productos. Usa el seeder para agregar datos de prueba.</div>
          : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Ajustar</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>Sin resultados</td></tr>
                  : filtered.map((p) => {
                    const stock = getStock(p);
                    return (
                      <tr key={p.id} style={{ background: stock === 0 ? '#EF444408' : stock <= 5 ? '#F59E0B08' : undefined }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {getImg(p) && <img src={getImg(p)} alt={getName(p)} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />}
                            <div>
                              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.85rem' }}>{getName(p)}</p>
                              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>{getSku(p, p.id)}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{getCat(p)}</span></td>
                        <td><strong style={{ color: '#F59E0B' }}>${Number(getPrice(p)).toLocaleString('es-MX')}</strong></td>
                        <td style={{ minWidth: 130 }}>
                          {editing === p.id
                            ? (
                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              <input
                                type="number" value={stockVal}
                                onChange={(e) => setStockVal(e.target.value)}
                                style={{ width: 60, padding: '0.2rem 0.4rem', background: '#0F1729', border: '1px solid #F59E0B', borderRadius: 4, color: '#F1F5F9', fontSize: '0.8rem' }}
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') saveStock(p); if (e.key === 'Escape') setEditing(null); }}
                              />
                              <button className="btn-icon" style={{ color: '#10B981' }} onClick={() => saveStock(p)}>✓</button>
                              <button className="btn-icon" onClick={() => setEditing(null)}>✕</button>
                            </div>
                            )
                            : <StockBar stock={stock} />
                          }
                        </td>
                        <td><StockBadge stock={stock} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon" style={{ color: '#EF4444' }} onClick={() => adjustStock(p, -1)} disabled={stock === 0}>−</button>
                            <button className="btn-icon" style={{ color: '#10B981' }} onClick={() => adjustStock(p, +1)}>+</button>
                            <button className="btn-icon" onClick={() => { setEditing(p.id); setStockVal(String(stock)); }}>✏️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;