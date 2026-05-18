/**
 * Pedidos.jsx — v2
 * Sin suscripciones propias. Consume allOrders desde AdminDataContext.
 * Las escrituras (updateDoc) permanecen aquí — son acciones del usuario.
 */
import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast }            from 'react-toastify';
import { db }               from '../../../firebase/config';
import { useAdminContext }  from '../AdminDashboard';

const STATUS_META = {
  completado:{ text:'Completado', cls:'badge-success' },
  completada:{ text:'Completado', cls:'badge-success' },
  en_proceso:{ text:'En proceso', cls:'badge-warning' },
  pendiente: { text:'Pendiente',  cls:'badge-info'    },
  cancelado: { text:'Cancelado',  cls:'badge-danger'  },
  cancelada: { text:'Cancelado',  cls:'badge-danger'  },
  enviado:   { text:'Enviado',    cls:'badge-info'    },
  entregado: { text:'Entregado',  cls:'badge-success' },
  'pendiente-activacion': { text:'Pend. activación', cls:'badge-info' },
};

const STATUSES_RESERVA = ['pendiente','en_proceso','completado','cancelado'];
const STATUSES_PEDIDO  = ['pendiente','enviado','entregado','cancelado'];
const FILTER_TABS      = ['todos','pendiente','en_proceso','completado','cancelado','enviado','entregado'];

const StatusSelect = ({ item }) => {
  const [val, setVal] = useState(item.status);
  const opts = ['reserva','cita','estancia'].includes(item.tipo) ? STATUSES_RESERVA : STATUSES_PEDIDO;

  const handle = async (e) => {
    const next = e.target.value;
    setVal(next);
    try {
      // Actualiza el campo correcto según la colección
      const field = item.coleccion === 'pedidos' ? 'status' : 'estado';
      await updateDoc(doc(db, item.coleccion, item.id), {
        [field]: next, status: next, updatedAt: serverTimestamp(),
      });
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar');
      setVal(item.status);
    }
  };

  return (
    <select
      className={`status-select badge ${STATUS_META[val]?.cls || 'badge-neutral'}`}
      value={val}
      onChange={handle}
    >
      {opts.map((o) => (
        <option key={o} value={o}>{STATUS_META[o]?.text || o}</option>
      ))}
    </select>
  );
};

const Pedidos = () => {
  const { allOrders, loading } = useAdminContext();  // ← contexto, sin subscriptions locales

  const [filter,   setFilter]   = useState('todos');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = allOrders.filter((o) => {
    const matchFilter = filter === 'todos' || o.status === filter;
    const matchSearch = !search ||
      [o.service, o.petName, o.id, o.userId]
        .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const counts = FILTER_TABS.reduce((acc, s) => {
    acc[s] = s === 'todos' ? allOrders.length : allOrders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const activeTabs = FILTER_TABS.filter((s) => s === 'todos' || counts[s] > 0);

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Gestión de Pedidos</h1>
          <p className="view-subtitle">Reservas, citas, estancias y pedidos de tienda · tiempo real</p>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
          📅 {allOrders.filter((i) => ['reserva','cita','estancia'].includes(i.tipo)).length} servicios
          &nbsp;·&nbsp;
          🛒 {allOrders.filter((i) => i.tipo === 'pedido').length} tienda
        </span>
      </div>

      <div className="filter-row">
        <div className="status-tabs">
          {activeTabs.map((s) => (
            <button key={s} className={`status-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'todos' ? 'Todos' : STATUS_META[s]?.text || s}
              <span className="status-count">{counts[s]}</span>
            </button>
          ))}
        </div>
        <input
          className="search-input"
          placeholder="🔍 Buscar servicio, mascota, ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading
          ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando desde Firestore…</div>
          : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Tipo</th><th>Servicio / Producto</th><th>Mascota</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Ver</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '3rem' }}>
                      {allOrders.length === 0
                        ? 'Sin datos aún. Las reservas y compras aparecerán aquí en tiempo real.'
                        : 'Sin resultados para este filtro'
                      }
                    </td>
                  </tr>
                  )
                  : filtered.map((o) => (
                  <tr
                    key={`${o.coleccion}-${o.id}`}
                    className={selected === o.id ? 'row-selected' : ''}
                    onClick={() => setSelected(selected === o.id ? null : o.id)}
                  >
                    <td><code style={{ fontSize: '0.7rem', color: '#6366F1' }}>{o.id.slice(-6)}</code></td>
                    <td>
                      <span className={`badge ${
                        o.tipo === 'reserva'  ? 'badge-info'    :
                        o.tipo === 'cita'     ? 'badge-info'    :
                        o.tipo === 'estancia' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {o.tipo === 'reserva' ? '📅 Reserva' : o.tipo === 'cita' ? '💉 Cita' : o.tipo === 'estancia' ? '🏨 Hotel' : '🛒 Tienda'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.service}</td>
                    <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{o.petName}</td>
                    <td style={{ color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {o.date ? `${o.date}${o.time ? ' ' + o.time : ''}` : o.createdAt}
                    </td>
                    <td><strong style={{ color: '#F59E0B' }}>${(o.total || 0).toLocaleString('es-MX')}</strong></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <StatusSelect item={o} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon" onClick={() => setSelected(selected === o.id ? null : o.id)}>👁</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel de detalle */}
      {selected && (() => {
        const o = filtered.find((x) => x.id === selected);
        if (!o) return null;
        const s = STATUS_META[o.status] || STATUS_META.pendiente;
        return (
          <div className="detail-panel">
            <div className="detail-panel-header">
              <h3>Detalle — {o.tipo}</h3>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-grid">
              <div><span className="detail-label">ID</span><code style={{ color: '#6366F1', fontSize: '0.8rem' }}>{o.id}</code></div>
              <div><span className="detail-label">Colección</span><code style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{o.coleccion}</code></div>
              <div><span className="detail-label">Estado</span><span className={`badge ${s.cls}`}>{s.text}</span></div>
              <div><span className="detail-label">Servicio</span><span>{o.service}</span></div>
              {o.petName !== '—' && <div><span className="detail-label">Mascota</span><span>{o.petName}</span></div>}
              {o.date && <div><span className="detail-label">Fecha</span><span>{o.date} {o.time}</span></div>}
              <div><span className="detail-label">Creado</span><span>{o.createdAt}</span></div>
              <div><span className="detail-label">Total</span><strong style={{ color: '#F59E0B' }}>${(o.total || 0).toLocaleString('es-MX')}</strong></div>
              {o.userId && <div><span className="detail-label">Usuario</span><code style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.userId}</code></div>}
              {o.notes && <div className="detail-full"><span className="detail-label">Notas</span><p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>{o.notes}</p></div>}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Pedidos;