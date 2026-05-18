/**
 * Clientes.jsx — v2
 * Sin suscripciones propias. Consume clients desde AdminDataContext.
 */
import { useState, useMemo } from 'react';
import { useAdminContext }   from '../AdminDashboard';
import ClienteDetalle       from './ClienteDetalle';

const getSegment = (u) => {
  if (u.type) return u.type;
  const orders = u.orders || u.totalPedidos || 0;
  const spent  = u.totalSpent || u.totalGastado || 0;
  if (spent >= 10000 || orders >= 20) return 'vip';
  if (orders >= 5)                    return 'frecuente';
  if (orders >= 1)                    return 'regular';
  return 'nuevo';
};

const TYPE_META = {
  vip:       { text: '⭐ VIP',       cls: 'badge-warning' },
  frecuente: { text: '🔄 Frecuente', cls: 'badge-info'    },
  regular:   { text: '👤 Regular',   cls: 'badge-neutral' },
  nuevo:     { text: '🆕 Nuevo',     cls: 'badge-success' },
};

const SEGMENT_FILTERS = ['todos','vip','frecuente','regular','nuevo'];

const ClientCard = ({ c, onSelect }) => (
  <div className="client-card">
    <div className="client-card-header">
      <div className="avatar-lg">{(c.displayName || c.email || 'U')[0].toUpperCase()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="client-name">{c.displayName || '—'}</p>
        <p className="client-email">{c.email || '—'}</p>
        {c.phone && <p className="client-phone">📱 {c.phone}</p>}
      </div>
      <span className={`badge ${TYPE_META[c.segment]?.cls || 'badge-neutral'}`}>
        {TYPE_META[c.segment]?.text || c.segment}
      </span>
    </div>
    <div className="client-stats">
      <div className="client-stat"><span className="cs-val">{c.mascotas?.length || 0}</span><span className="cs-lbl">Mascotas</span></div>
      <div className="client-stat"><span className="cs-val">{c.totalPedidos || 0}</span><span className="cs-lbl">Pedidos</span></div>
      <div className="client-stat">
        <span className="cs-val" style={{ color: '#F59E0B' }}>${(c.totalGastado || 0).toLocaleString('es-MX')}</span>
        <span className="cs-lbl">Gastado</span>
      </div>
    </div>
    {c.mascotas?.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.5rem 0' }}>
        {c.mascotas.map((p, i) => (
          <span key={i} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: '#6366F120', color: '#6366F1', borderRadius: 999 }}>
            🐾 {p.nombre || `Mascota ${i + 1}`}{p.especie ? ` (${p.especie})` : ''}
          </span>
        ))}
      </div>
    )}
    <div className="client-footer">
      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
        Rol: <strong style={{ color: c.role === 'admin' ? '#F59E0B' : '#94A3B8' }}>{c.role || 'cliente'}</strong>
      </span>
      {c.createdAt && (
        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
          Desde: {c.createdAt?.toDate
            ? c.createdAt.toDate().toLocaleDateString('es-MX')
            : c.createdAt}
        </span>
      )}
    </div>
    <button
      className="btn-secondary"
      style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0' }}
      onClick={() => onSelect(c.id)}
    >
      Ver perfil completo →
    </button>
  </div>
);

const Clientes = () => {
  const { clients, loading } = useAdminContext();  // ← sin subscription propia

  const [segment, setSegment] = useState('todos');
  const [search,  setSearch]  = useState('');
  const [view,    setView]    = useState('cards');
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Agregar segmento a cada cliente
  const enriched = useMemo(
    () => clients.map((u) => ({ ...u, segment: getSegment(u) })),
    [clients],
  );

  const filtered = useMemo(() => enriched.filter((c) => {
    const matchSeg    = segment === 'todos' || c.segment === segment;
    const matchSearch = !search ||
      [c.displayName, c.email, c.phone]
        .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
    return matchSeg && matchSearch;
  }), [enriched, segment, search]);

  const counts = useMemo(() => SEGMENT_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'todos' ? enriched.length : enriched.filter((c) => c.segment === s).length;
    return acc;
  }, {}), [enriched]);

  const totalRevenue = useMemo(() => enriched.reduce((s, c) => s + (c.totalGastado || 0), 0), [enriched]);
  const vipCount     = counts.vip   || 0;
  const newCount     = counts.nuevo || 0;
  const withPets     = enriched.filter((c) => c.mascotas?.length > 0).length;

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Gestión de Clientes</h1>
          <p className="view-subtitle">Usuarios registrados · tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`view-toggle${view === 'cards' ? ' active' : ''}`} onClick={() => setView('cards')}>⊞</button>
          <button className={`view-toggle${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}>☰</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '0.75rem' }}>
        <div className="mini-stat"><span className="ms-val">{enriched.length}</span><span className="ms-lbl">Total usuarios</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#F59E0B' }}>{vipCount}</span><span className="ms-lbl">VIP</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#10B981' }}>{newCount}</span><span className="ms-lbl">Nuevos</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#6366F1' }}>{withPets}</span><span className="ms-lbl">Con mascotas</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#EC4899' }}>${totalRevenue.toLocaleString('es-MX')}</span><span className="ms-lbl">Ingreso total</span></div>
      </div>

      <div className="filter-row">
        <div className="status-tabs">
          {SEGMENT_FILTERS.map((s) => (
            <button key={s} className={`status-tab${segment === s ? ' active' : ''}`} onClick={() => setSegment(s)}>
              {s === 'todos' ? 'Todos' : TYPE_META[s]?.text || s}
              <span className="status-count">{counts[s]}</span>
            </button>
          ))}
        </div>
        <input className="search-input" placeholder="🔍 Buscar nombre, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading
        ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando usuarios…</div>
        : enriched.length === 0
        ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Sin usuarios registrados todavía.</div>
        : view === 'cards'
          ? (
          <div className="clients-grid">
            {filtered.length === 0
              ? <p style={{ color: '#64748B', gridColumn: '1/-1' }}>Sin resultados</p>
              : filtered.map((c) => <ClientCard key={c.id} c={c} onSelect={setSelectedClientId} />)
            }
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Usuario</th><th>Email</th><th>Mascotas</th><th>Pedidos</th><th>Total gastado</th><th>Segmento</th><th>Rol</th><th>Detalle</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>Sin resultados</td></tr>
                    : filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="avatar-sm">{(c.displayName || c.email || 'U')[0].toUpperCase()}</span>
                          {c.displayName || '—'}
                        </div>
                      </td>
                      <td style={{ color: '#94A3B8', fontSize: '0.82rem' }}>{c.email}</td>
                      <td style={{ textAlign: 'center' }}>{c.mascotas?.length || 0}</td>
                      <td style={{ textAlign: 'center' }}>{c.totalPedidos || 0}</td>
                      <td><strong style={{ color: '#F59E0B' }}>${(c.totalGastado || 0).toLocaleString('es-MX')}</strong></td>
                      <td><span className={`badge ${TYPE_META[c.segment]?.cls || 'badge-neutral'}`}>{TYPE_META[c.segment]?.text || c.segment}</span></td>
                      <td><span className={`badge ${c.role === 'admin' ? 'badge-warning' : c.role === 'empleado' ? 'badge-info' : 'badge-neutral'}`}>{c.role || 'cliente'}</span></td>
                      <td>
                        <button className="btn-icon" onClick={() => setSelectedClientId(c.id)} title="Ver perfil">👁</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
      {/* Panel de detalle */}
      {selectedClientId && (
        <ClienteDetalle
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  );
};

export default Clientes;