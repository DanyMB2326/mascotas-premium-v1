/**
 * Finanzas.jsx — v2
 * Sin suscripciones propias. Consume finances desde AdminDataContext.
 * addDoc (registrar transacción) permanece aquí — es una escritura del usuario.
 */
import { useState, useMemo }  from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast }           from 'react-toastify';
import { db }              from '../../../firebase/config';
import { useAdminContext } from '../AdminDashboard';
import { BarChart }        from '../charts/Charts';
import {
  COSTOS_OPERATIVOS,
  TOTAL_COSTOS_MENSUAL,
  NOMINA_TOTALES as NOMINA,
  STAFF_NOMINA,
  EGRESO_CHART,
} from '../../../data/planNegocios';

const COLORS = ['#EF4444','#F59E0B','#10B981','#6366F1','#EC4899','#06B6D4','#8B5CF6','#94A3B8'];

const MODAL_INIT = { type: 'ingreso', concept: '', amount: '', category: 'servicios', method: 'efectivo' };
/* ─────────────────────────────────────────────────────────────── */

const Finanzas = () => {
  const { finances, loading } = useAdminContext();  // ← sin subscription propia

  const [filterType, setFilterType] = useState('todos');
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(MODAL_INIT);
  const [saving,     setSaving]     = useState(false);
  const [tab,        setTab]        = useState('resumen');

  // finances.records vienen con Timestamps; los formateamos aquí
  const txns = useMemo(() => finances.records.map((t) => ({
    ...t,
    date: t.date?.toDate
      ? t.date.toDate().toLocaleDateString('es-MX')
      : t.date || '—',
  })), [finances.records]);

  const { totalIncome: ingresos, totalExpense: egresos, balance } = finances;

  const filtered = useMemo(
    () => txns.filter((t) => filterType === 'todos' || t.type === filterType || t.type === (filterType === 'ingreso' ? 'income' : 'expense')),
    [txns, filterType],
  );

  const handleSave = async () => {
    if (!form.concept || !form.amount) { toast.error('Completa todos los campos'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        ...form, amount: Number(form.amount), date: serverTimestamp(), createdAt: serverTimestamp(),
      });
      toast.success('Transacción registrada');
      setShowModal(false);
      setForm(MODAL_INIT);
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Tipo','Concepto','Monto','Categoría','Método','Fecha'],
      ...txns.map((t) => [t.id, t.type, t.concept, t.amount, t.category, t.method, t.date]),
    ];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const a    = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'finanzas-pawloyal.csv' });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('CSV exportado');
  };

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Finanzas & Contabilidad</h1>
          <p className="view-subtitle">Plan de negocios + transacciones reales de Firestore</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={exportCSV}>📥 Exportar CSV</button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrar</button>
        </div>
      </div>

      <div className="status-tabs">
        {[{ id:'resumen', label:'📊 Resumen' },{ id:'costos', label:'💸 Costos fijos' },{ id:'nomina', label:'👷 Nómina' },{ id:'historial', label:'🧾 Historial' }]
          .map((t) => (
          <button key={t.id} className={`status-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.75rem' }}>
            {[
              { icon: '💸', label: 'Costos operativos / mes', value: `$${TOTAL_COSTOS_MENSUAL.toLocaleString('es-MX')}`, sub: 'Estimado del plan', color: '#EF4444' },
              { icon: '👥', label: 'Nómina total / mes',       value: `$${NOMINA.costoMensual.toLocaleString('es-MX')}`,  sub: 'Incl. carga social 35%', color: '#6366F1' },
              { icon: '📅', label: 'Costo total anual',        value: `$${NOMINA.costoAnual.toLocaleString('es-MX')}`,   sub: 'Solo nómina', color: '#F59E0B' },
              { icon: '💰', label: 'Ingresos registrados',     value: `$${ingresos.toLocaleString('es-MX')}`,            sub: 'Desde Firestore', color: '#10B981' },
            ].map((k, i) => (
              <div key={i} className="stat-card" style={{ '--accent': k.color }}>
                <div className="stat-card-icon" style={{ background: `${k.color}20`, color: k.color }}>{k.icon}</div>
                <div className="stat-card-body">
                  <span className="stat-label">{k.label}</span>
                  <span className="stat-value" style={{ fontSize: '1.3rem' }}>{k.value}</span>
                  <span className="stat-sub" style={{ color: '#94A3B8' }}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Distribución de costos operativos</span>
              <span className="card-value amber">${TOTAL_COSTOS_MENSUAL.toLocaleString('es-MX')}</span>
            </div>
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <BarChart data={EGRESO_CHART} color="#EF4444" height={130} />
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {COSTOS_OPERATIVOS.map((c, i) => {
                  const pct = Math.round((c.amount / TOTAL_COSTOS_MENSUAL) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: '#94A3B8' }}>{c.concept}</span>
                        <span style={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>${c.amount.toLocaleString('es-MX')} ({pct}%)</span>
                      </div>
                      <div style={{ height: 5, background: '#1C2333', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* COSTOS */}
      {tab === 'costos' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Costos operativos mensuales estimados</span>
            <span className="card-value amber">${TOTAL_COSTOS_MENSUAL.toLocaleString('es-MX')} / mes</span>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>Concepto</th><th>Categoría</th><th style={{ textAlign: 'right' }}>Costo mensual</th></tr></thead>
              <tbody>
                {COSTOS_OPERATIVOS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{c.concept}</td>
                    <td><span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{c.category}</span></td>
                    <td style={{ textAlign: 'right' }}><strong style={{ color: '#EF4444' }}>${c.amount.toLocaleString('es-MX')} MXN</strong></td>
                  </tr>
                ))}
                <tr style={{ background: '#F59E0B15', borderTop: '2px solid #F59E0B' }}>
                  <td colSpan={2} style={{ fontWeight: 700, color: '#F59E0B' }}>Total estimado</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#F59E0B', fontSize: '1rem' }}>${TOTAL_COSTOS_MENSUAL.toLocaleString('es-MX')} MXN</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NÓMINA */}
      {tab === 'nomina' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Headcount inicial', value: NOMINA.headcount,                                color: '#6366F1', icon: '👷' },
              { label: 'Nómina bruta / mes', value: `$${NOMINA.nominaBruta.toLocaleString('es-MX')}`, color: '#F59E0B', icon: '💵' },
              { label: 'Carga social (35%)', value: `$${NOMINA.cargaSocial.toLocaleString('es-MX')}`, color: '#EF4444', icon: '🏛'  },
              { label: 'Costo total / mes',  value: `$${NOMINA.costoMensual.toLocaleString('es-MX')}`, color: '#10B981', icon: '📊' },
              { label: 'Costo total anual',  value: `$${NOMINA.costoAnual.toLocaleString('es-MX')}`,  color: '#EC4899', icon: '📅' },
            ].map((k, i) => (
              <div key={i} className="stat-card" style={{ '--accent': k.color }}>
                <div className="stat-card-icon" style={{ background: `${k.color}20`, color: k.color }}>{k.icon}</div>
                <div className="stat-card-body">
                  <span className="stat-label">{k.label}</span>
                  <span className="stat-value" style={{ fontSize: '1.15rem' }}>{k.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Desglose de nómina por puesto</span>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Puesto</th><th style={{ textAlign:'center' }}>Cant.</th><th style={{ textAlign:'right' }}>Salario bruto</th><th style={{ textAlign:'right' }}>Carga social</th><th style={{ textAlign:'right' }}>Costo total</th></tr></thead>
                <tbody>
                  {STAFF_NOMINA.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{s.puesto}</td>
                      <td style={{ textAlign: 'center' }}>{s.cantidad}</td>
                      <td style={{ textAlign: 'right', color: '#94A3B8' }}>${s.salario.toLocaleString('es-MX')}</td>
                      <td style={{ textAlign: 'right', color: '#EF4444' }}>${s.cargaSocial.toLocaleString('es-MX')}</td>
                      <td style={{ textAlign: 'right' }}><strong style={{ color: '#10B981' }}>${s.total.toLocaleString('es-MX')}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* HISTORIAL */}
      {tab === 'historial' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
              { icon: '↑', label: 'Ingresos', value: `$${ingresos.toLocaleString('es-MX')}`, color: '#10B981' },
              { icon: '↓', label: 'Egresos',  value: `$${egresos.toLocaleString('es-MX')}`,  color: '#EF4444' },
              { icon: balance >= 0 ? '💰' : '⚠️', label: 'Balance neto', value: `${balance < 0 ? '-' : ''}$${Math.abs(balance).toLocaleString('es-MX')}`, color: balance >= 0 ? '#F59E0B' : '#EF4444' },
            ].map((k, i) => (
              <div key={i} className="stat-card" style={{ '--accent': k.color }}>
                <div className="stat-card-icon" style={{ background: `${k.color}20`, color: k.color }}>{k.icon}</div>
                <div className="stat-card-body">
                  <span className="stat-label">{k.label}</span>
                  <span className="stat-value" style={{ color: k.color }}>{k.value}</span>
                  <span className="stat-sub" style={{ color: '#94A3B8' }}>Desde Firestore</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header" style={{ gap: '1rem' }}>
              <span className="card-title">Historial de transacciones</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                {['todos','ingreso','egreso'].map((f) => (
                  <button key={f} className={`period-tab${filterType === f ? ' active' : ''}`} onClick={() => setFilterType(f)}>
                    {f === 'todos' ? 'Todos' : f === 'ingreso' ? '↑ Ingresos' : '↓ Egresos'}
                  </button>
                ))}
              </div>
            </div>
            {loading
              ? <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Cargando…</div>
              : txns.length === 0
              ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Sin transacciones. Usa <strong style={{ color: '#F59E0B' }}>+ Registrar</strong> para agregar.</div>
              : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Categoría</th><th>Método</th><th>Monto</th></tr></thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id}>
                        <td style={{ color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{t.date}</td>
                        <td><span className={`badge ${t.type === 'ingreso' || t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{t.type === 'ingreso' || t.type === 'income' ? '↑ Ingreso' : '↓ Egreso'}</span></td>
                        <td>{t.concept}</td>
                        <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{t.category}</td>
                        <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{t.method}</td>
                        <td><strong style={{ color: t.type === 'ingreso' || t.type === 'income' ? '#10B981' : '#EF4444' }}>{t.type === 'ingreso' || t.type === 'income' ? '+' : '-'}${Number(t.amount || 0).toLocaleString('es-MX')}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Registrar Transacción</h3><button className="btn-icon" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Tipo</label>
                <select className="form-control" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                  <option value="ingreso">↑ Ingreso</option><option value="egreso">↓ Egreso</option>
                </select>
              </div>
              <div className="form-group"><label>Concepto</label>
                <input className="form-control" placeholder="Descripción…" value={form.concept} onChange={(e) => setForm((p) => ({ ...p, concept: e.target.value }))} />
              </div>
              <div className="form-group"><label>Monto (MXN)</label>
                <input className="form-control" type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-group"><label>Categoría</label>
                <select className="form-control" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {['servicios','tienda','hotel','inventario','nomina','operativos','marketing','otros'].map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Método</label>
                <select className="form-control" value={form.method} onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}>
                  {['efectivo','tarjeta','transferencia','otro'].map((m) => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finanzas;