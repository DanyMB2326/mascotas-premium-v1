/**
 * Personal.jsx — v2
 * Sin suscripciones propias. Consume employees desde AdminDataContext.
 * addDoc (agregar empleado) permanece aquí — escritura del usuario.
 */
import { useState, useMemo }  from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast }           from 'react-toastify';
import { db }              from '../../../firebase/config';
import { useAdminContext } from '../AdminDashboard';
import {
  PLAN_STAFF,
  NOMINA_TOTALES,
} from '../../../data/planNegocios';

const STATUS_META = {
  activo:     { text: 'Activo',     cls: 'badge-success' },
  vacaciones: { text: 'Vacaciones', cls: 'badge-info'    },
  permiso:    { text: 'Permiso',    cls: 'badge-warning' },
  inactivo:   { text: 'Inactivo',  cls: 'badge-danger'  },
};

const ROLES = ['Veterinario','Groomer Senior','Groomer','Adiestrador','Recepcionista','Asistente','Administrador'];
const MODAL_INIT = { name: '', role: 'Groomer', email: '', phone: '', salary: '', schedule: 'Lun-Vie 9:00-18:00', status: 'activo' };

const PerformanceBar = ({ value = 80 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{ flex: 1, height: 6, background: '#1C2333', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: value >= 90 ? '#10B981' : value >= 75 ? '#F59E0B' : '#EF4444', borderRadius: 3, transition: 'width 0.6s' }} />
    </div>
    <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: 28 }}>{value}%</span>
  </div>
);

const Personal = () => {
  const { employees, loading } = useAdminContext();  // ← sin subscription propia

  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(MODAL_INIT);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState('equipo');

  // Si no hay empleados en Firestore, usar el plan como demo
  const isDemo = !loading && employees.length === 0;
  const staff  = isDemo
    ? PLAN_STAFF.map((e, i) => ({ id: `plan-${i}`, ...e }))
    : employees;

  const totalNomina = useMemo(() => staff.reduce((s, e) => s + Number(e.salary || 0), 0), [staff]);
  const activos     = useMemo(() => staff.filter((e) => e.status === 'activo').length, [staff]);

  // Para KPIs de nómina: si hay empleados reales, calcular desde ellos; si no, usar plan
  const nominaKpis = isDemo ? NOMINA_TOTALES : {
    headcount: staff.length,
    bruta:     totalNomina,
    carga:     Math.round(totalNomina * 0.35),
    mensual:   Math.round(totalNomina * 1.35),
    anual:     Math.round(totalNomina * 1.35 * 12),
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Nombre y email son requeridos'); return; }
    if (isDemo) { toast.info('Guarda el primer empleado real en Firestore para dejar el modo demo.'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'staff'), {
        ...form, salary: Number(form.salary || 0), performance: 80, createdAt: serverTimestamp(),
      });
      toast.success('Empleado registrado');
      setShowModal(false);
      setForm(MODAL_INIT);
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Gestión de Personal</h1>
          <p className="view-subtitle">Equipo Paw Loyal · tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isDemo && <span className="demo-pill">📋 Plan de negocios</span>}
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Agregar empleado</button>
        </div>
      </div>

      <div className="status-tabs">
        <button className={`status-tab${tab === 'equipo' ? ' active' : ''}`} onClick={() => setTab('equipo')}>👷 Equipo</button>
        <button className={`status-tab${tab === 'nomina' ? ' active' : ''}`} onClick={() => setTab('nomina')}>💵 Nómina</button>
      </div>

      {/* EQUIPO */}
      {tab === 'equipo' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '0.75rem' }}>
            <div className="mini-stat"><span className="ms-val">{staff.length}</span><span className="ms-lbl">Total empleados</span></div>
            <div className="mini-stat"><span className="ms-val" style={{ color: '#10B981' }}>{activos}</span><span className="ms-lbl">Activos hoy</span></div>
            <div className="mini-stat"><span className="ms-val" style={{ color: '#F59E0B' }}>{staff.filter((e) => e.status === 'vacaciones').length}</span><span className="ms-lbl">Vacaciones</span></div>
            <div className="mini-stat"><span className="ms-val" style={{ color: '#6366F1' }}>${totalNomina.toLocaleString('es-MX')}</span><span className="ms-lbl">Nómina bruta</span></div>
          </div>
          <div className="card">
            {loading
              ? <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Cargando…</div>
              : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Empleado</th><th>Puesto</th><th>Horario</th><th>Salario bruto</th><th>Costo total</th><th>Desempeño</th><th>Estado</th></tr></thead>
                  <tbody>
                    {staff.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div className="avatar-sm" style={{ background: '#6366F120', color: '#6366F1' }}>{(e.name || 'E')[0]}</div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.85rem' }}>{e.name}</p>
                              {e.email && <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>{e.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#94A3B8', fontSize: '0.82rem' }}>{e.role}</td>
                        <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{e.schedule}</td>
                        <td><strong style={{ color: '#F59E0B' }}>${Number(e.salary || 0).toLocaleString('es-MX')}</strong></td>
                        <td>{e.costoTotal ? <strong style={{ color: '#10B981' }}>${Number(e.costoTotal).toLocaleString('es-MX')}</strong> : <span style={{ color: '#64748B' }}>—</span>}</td>
                        <td style={{ minWidth: 140 }}><PerformanceBar value={e.performance || 80} /></td>
                        <td><span className={`badge ${STATUS_META[e.status]?.cls || 'badge-neutral'}`}>{STATUS_META[e.status]?.text || e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* NÓMINA */}
      {tab === 'nomina' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Headcount',          value: nominaKpis.headcount,                                 color: '#6366F1', icon: '👥' },
              { label: 'Nómina bruta / mes', value: `$${nominaKpis.bruta.toLocaleString('es-MX')}`,       color: '#F59E0B', icon: '💵' },
              { label: 'Carga social (35%)', value: `$${nominaKpis.carga.toLocaleString('es-MX')}`,       color: '#EF4444', icon: '🏛'  },
              { label: 'Costo total / mes',  value: `$${nominaKpis.mensual.toLocaleString('es-MX')}`,     color: '#10B981', icon: '📊' },
              { label: 'Costo total anual',  value: `$${nominaKpis.anual.toLocaleString('es-MX')}`,       color: '#EC4899', icon: '📅' },
            ].map((k, i) => (
              <div key={i} className="stat-card" style={{ '--accent': k.color }}>
                <div className="stat-card-icon" style={{ background: `${k.color}20`, color: k.color }}>{k.icon}</div>
                <div className="stat-card-body">
                  <span className="stat-label">{k.label}</span>
                  <span className="stat-value" style={{ fontSize: '1.1rem' }}>{k.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Desglose de nómina</span>
              {isDemo && <span className="card-badge amber">Plan inicial</span>}
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Puesto / Empleado</th><th style={{ textAlign:'center' }}>Cant.</th><th style={{ textAlign:'right' }}>Salario bruto</th><th style={{ textAlign:'right' }}>Carga social</th><th style={{ textAlign:'right' }}>Costo total</th></tr></thead>
                <tbody>
                  {staff.map((e, i) => {
                    const carga = e.cargaSocial || Math.round(Number(e.salary || 0) * 0.35);
                    const total = e.costoTotal  || Number(e.salary || 0) + carga;
                    return (
                      <tr key={e.id || i}>
                        <td style={{ fontWeight: 500 }}>{e.name}</td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right', color: '#94A3B8' }}>${Number(e.salary || 0).toLocaleString('es-MX')}</td>
                        <td style={{ textAlign: 'right', color: '#EF4444' }}>${carga.toLocaleString('es-MX')}</td>
                        <td style={{ textAlign: 'right' }}><strong style={{ color: '#10B981' }}>${total.toLocaleString('es-MX')}</strong></td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#10B98115', borderTop: '2px solid #10B981' }}>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>TOTAL</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{staff.length}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>${nominaKpis.bruta.toLocaleString('es-MX')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#EF4444' }}>${nominaKpis.carga.toLocaleString('es-MX')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10B981', fontSize: '1rem' }}>${nominaKpis.mensual.toLocaleString('es-MX')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <span className="card-title">Pago quincenal por empleado</span>
              <span className="card-badge green">Cada 15 días</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.75rem' }}>
              {staff.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', background: '#161B27', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{e.name?.split(' ').slice(0, 3).join(' ')}</span>
                  <strong style={{ color: '#F1F5F9', fontSize: '0.85rem' }}>${(Number(e.salary || 0) / 2).toLocaleString('es-MX')}</strong>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #2D3748', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Total quincenal (bruto):</span>
              <strong style={{ color: '#F59E0B', fontSize: '1rem' }}>${(nominaKpis.bruta / 2).toLocaleString('es-MX')} MXN</strong>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Agregar Empleado</h3><button className="btn-icon" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              {[
                { label: 'Nombre completo', field: 'name',     type: 'text',   placeholder: 'Nombre Apellido'    },
                { label: 'Email',           field: 'email',    type: 'email',  placeholder: 'correo@pawloyal.mx' },
                { label: 'Teléfono',        field: 'phone',    type: 'tel',    placeholder: '55-0000-0000'       },
                { label: 'Salario mensual', field: 'salary',   type: 'number', placeholder: '0.00'               },
                { label: 'Horario',         field: 'schedule', type: 'text',   placeholder: 'Lun-Vie 9:00-18:00' },
              ].map(({ label, field, type, placeholder }) => (
                <div className="form-group" key={field}>
                  <label>{label}</label>
                  <input className="form-control" type={type} placeholder={placeholder} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group"><label>Puesto</label>
                <select className="form-control" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Registrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;