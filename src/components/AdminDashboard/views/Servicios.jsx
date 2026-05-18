/**
 * Servicios.jsx
 * CRUD del catálogo de servicios desde el dashboard.
 *
 * Flujo:
 *  1. Si Firestore `servicios` está vacío → botón "Migrar catálogo"
 *     importa los datos de data/services.js a Firestore en un solo clic.
 *  2. Una vez migrado, el admin puede editar precios, opciones, nombre,
 *     descripción y estado (activo/inactivo) sin redeploy.
 *  3. La app del cliente (Reservar.jsx) debe leer de Firestore `servicios`
 *     en lugar de data/services.js para que los cambios sean en tiempo real.
 *
 * Colección Firestore: `servicios/{id}`
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, doc,
  setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { toast }  from 'react-toastify';
import { db }     from '../../../firebase/config';
import { SERVICES } from '../../../data/services';
import { formatCurrency } from '../../../utils/formatters';

const COL = 'servicios';

// ── Paleta de colores por servicio ────────────────────────────
const EMOJI_OPTIONS = ['✂️','🛁','🌿','☀️','🏨','🎓','🚐','📦','🐾','💊','🦷','🛡️'];

// ─────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────

const Badge = ({ active }) => (
  <span className={`badge ${active ? 'badge-success' : 'badge-danger'}`}>
    {active ? '● Activo' : '○ Inactivo'}
  </span>
);

const OptionRow = ({ opt, onEdit, onDelete }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.5rem 0.75rem', background: '#0F1729',
    borderRadius: 8, marginBottom: '0.4rem',
  }}>
    <span style={{ flex: 1, fontSize: '0.85rem', color: '#CBD5E1' }}>{opt.label}</span>
    <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
      {formatCurrency(opt.precio)}
    </span>
    <span className={`badge ${opt.activo !== false ? 'badge-success' : 'badge-danger'}`}
      style={{ fontSize: '0.65rem' }}>
      {opt.activo !== false ? 'Activa' : 'Off'}
    </span>
    <button className="btn-icon" onClick={() => onEdit(opt)} title="Editar opción">✏️</button>
    <button className="btn-icon" style={{ color: '#EF4444' }} onClick={() => onDelete(opt.id)} title="Eliminar opción">🗑</button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Modal de edición de servicio
// ─────────────────────────────────────────────────────────────
const ServiceModal = ({ service, onClose, onSave }) => {
  const isNew = !service?.id;

  const [form, setForm] = useState(() => service || {
    id: '', nombre: '', short: '', descripcion: '',
    emoji: '🐾', duracion: '', activo: true, options: [],
  });

  // Estado para editar/agregar una opción
  const [optForm, setOptForm]     = useState(null);  // null = cerrado
  const [editOptId, setEditOptId] = useState(null);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => setForm((p) => ({ ...p, [k]: !p[k] }));

  const openNewOpt = () => {
    setEditOptId(null);
    setOptForm({ id: `${form.id}-${Date.now()}`, label: '', precio: '', activo: true });
  };

  const openEditOpt = (opt) => {
    setEditOptId(opt.id);
    setOptForm({ ...opt });
  };

  const saveOpt = () => {
    if (!optForm.label || !optForm.precio) { toast.error('Label y precio son obligatorios'); return; }
    const updated = { ...optForm, precio: Number(optForm.precio) };
    setForm((p) => ({
      ...p,
      options: editOptId
        ? p.options.map((o) => (o.id === editOptId ? updated : o))
        : [...p.options, updated],
    }));
    setOptForm(null);
    setEditOptId(null);
  };

  const deleteOpt = (optId) => {
    setForm((p) => ({ ...p, options: p.options.filter((o) => o.id !== optId) }));
  };

  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!form.id.trim())     { toast.error('El ID (slug) es obligatorio'); return; }
    if (!form.options.length){ toast.error('Agrega al menos una opción/precio'); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{isNew ? 'Nuevo servicio' : `Editar — ${service.nombre}`}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Emoji */}
          <div className="form-group">
            <label>Emoji / ícono</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                  style={{
                    fontSize: '1.4rem', padding: '0.25rem 0.4rem', borderRadius: 8,
                    border: form.emoji === e ? '2px solid #F59E0B' : '2px solid transparent',
                    background: form.emoji === e ? '#F59E0B20' : '#1C2333',
                    cursor: 'pointer',
                  }}
                >{e}</button>
              ))}
            </div>
          </div>

          {/* ID slug — solo para servicios nuevos */}
          {isNew && (
            <div className="form-group">
              <label>ID (slug único, sin espacios) <span style={{ color: '#EF4444' }}>*</span></label>
              <input className="form-control" placeholder="ej: veterinaria-general"
                value={form.id}
                onChange={(e) => setForm((p) => ({ ...p, id: e.target.value.toLowerCase().replace(/\s/g, '-') }))} />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                Una vez creado no se puede cambiar.
              </span>
            </div>
          )}

          {/* Nombre */}
          <div className="form-group">
            <label>Nombre <span style={{ color: '#EF4444' }}>*</span></label>
            <input className="form-control" placeholder="Estética canina y felina"
              value={form.nombre} onChange={set('nombre')} />
          </div>

          {/* Descripción corta */}
          <div className="form-group">
            <label>Descripción corta</label>
            <input className="form-control" placeholder="Tagline del servicio (max 80 chars)"
              value={form.short} onChange={set('short')} maxLength={80} />
          </div>

          {/* Descripción larga */}
          <div className="form-group">
            <label>Descripción completa</label>
            <textarea className="form-control" rows={3}
              placeholder="Descripción detallada del servicio…"
              value={form.descripcion} onChange={set('descripcion')} />
          </div>

          {/* Duración */}
          <div className="form-group">
            <label>Duración estimada</label>
            <input className="form-control" placeholder="1.5 – 2.5 h"
              value={form.duracion} onChange={set('duracion')} />
          </div>

          {/* Estado activo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ margin: 0 }}>Visible en la app del cliente</label>
            <button
              onClick={() => toggle('activo')}
              style={{
                padding: '0.3rem 0.9rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
                background: form.activo ? '#10B98120' : '#EF444420',
                color: form.activo ? '#10B981' : '#EF4444',
                border: `1px solid ${form.activo ? '#10B981' : '#EF4444'}`,
                cursor: 'pointer',
              }}
            >
              {form.activo ? '● Activo' : '○ Inactivo'}
            </button>
          </div>

          {/* Opciones / Precios */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Opciones y precios <span style={{ color: '#EF4444' }}>*</span></label>
              <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem' }}
                onClick={openNewOpt}>
                + Agregar opción
              </button>
            </div>

            {form.options.length === 0 && (
              <p style={{ color: '#64748B', fontSize: '0.82rem', padding: '0.75rem 0' }}>
                Sin opciones todavía. Agrega al menos una para poder publicar el servicio.
              </p>
            )}

            {form.options.map((opt) => (
              <OptionRow key={opt.id} opt={opt} onEdit={openEditOpt} onDelete={deleteOpt} />
            ))}

            {/* Mini-form de opción */}
            {optForm && (
              <div style={{
                background: '#0A0F1E', border: '1px solid #F59E0B40', borderRadius: 10,
                padding: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="form-group" style={{ flex: 2, margin: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Label</label>
                    <input className="form-control" style={{ padding: '0.3rem 0.5rem' }}
                      placeholder="Talla pequeña (hasta 10 kg)"
                      value={optForm.label}
                      onChange={(e) => setOptForm((p) => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Precio (MXN)</label>
                    <input className="form-control" style={{ padding: '0.3rem 0.5rem' }}
                      type="number" placeholder="380"
                      value={optForm.precio}
                      onChange={(e) => setOptForm((p) => ({ ...p, precio: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" style={{ fontSize: '0.78rem' }}
                    onClick={() => { setOptForm(null); setEditOptId(null); }}>
                    Cancelar
                  </button>
                  <button className="btn-primary" style={{ fontSize: '0.78rem' }} onClick={saveOpt}>
                    {editOptId ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>
            {isNew ? '+ Crear servicio' : '✓ Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Vista principal
// ─────────────────────────────────────────────────────────────
const Servicios = () => {
  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [migrating,   setMigrating]   = useState(false);
  const [modal,       setModal]       = useState(null);   // null | 'new' | serviceObj
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search,      setSearch]      = useState('');

  // ── Suscripción en tiempo real ──────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COL),
      (snap) => {
        setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => { console.error('[Servicios]', err); setLoading(false); },
    );
    return unsub;
  }, []);

  // ── Migración one-shot desde data/services.js ───────────────
  const migrate = async () => {
    if (!window.confirm(
      `¿Migrar los ${SERVICES.length} servicios de services.js a Firestore?\n\nEsto sobreescribirá documentos con el mismo ID.`
    )) return;

    setMigrating(true);
    try {
      const batch = writeBatch(db);
      SERVICES.forEach((svc) => {
        batch.set(doc(db, COL, svc.id), {
          ...svc,
          activo:    true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      toast.success(`${SERVICES.length} servicios migrados a Firestore ✓`);
    } catch (e) {
      toast.error('Error en la migración');
      console.error(e);
    }
    setMigrating(false);
  };

  // ── CRUD ────────────────────────────────────────────────────
  const handleSave = useCallback(async (form) => {
    try {
      await setDoc(doc(db, COL, form.id), {
        ...form,
        updatedAt: serverTimestamp(),
        ...(!form.createdAt && { createdAt: serverTimestamp() }),
      }, { merge: true });
      toast.success(modal?.id ? 'Servicio actualizado' : 'Servicio creado');
      setModal(null);
    } catch (e) {
      toast.error('Error al guardar');
      console.error(e);
    }
  }, [modal]);

  const toggleActive = async (svc) => {
    try {
      await updateDoc(doc(db, COL, svc.id), {
        activo: !svc.activo, updatedAt: serverTimestamp(),
      });
      toast.success(svc.activo ? 'Servicio desactivado' : 'Servicio activado');
    } catch (e) {
      toast.error('Error al actualizar');
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, COL, id));
      toast.success('Servicio eliminado');
      setDeleteConfirm(null);
    } catch (e) {
      toast.error('Error al eliminar');
      console.error(e);
    }
  };

  const filtered = services.filter((s) =>
    !search || s.nombre?.toLowerCase().includes(search.toLowerCase()),
  );

  const activos   = services.filter((s) => s.activo !== false).length;
  const inactivos = services.length - activos;
  const minPrice  = Math.min(...services.flatMap((s) => s.options?.map((o) => o.precio) ?? []));
  const maxPrice  = Math.max(...services.flatMap((s) => s.options?.map((o) => o.precio) ?? []));

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Catálogo de Servicios</h1>
          <p className="view-subtitle">
            {services.length === 0
              ? 'Sin servicios en Firestore — migra el catálogo para empezar'
              : `${services.length} servicios en Firestore · edita precios sin redeploy`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {services.length === 0 && (
            <button className="btn-secondary" onClick={migrate} disabled={migrating}>
              {migrating ? 'Migrando…' : '⬆️ Migrar desde services.js'}
            </button>
          )}
          <button className="btn-primary" onClick={() => setModal('new')}>+ Nuevo servicio</button>
        </div>
      </div>

      {/* Banner de migración si hay datos en Firestore */}
      {services.length > 0 && services.length < SERVICES.length && (
        <div className="alert-banner" style={{ borderColor: '#F59E0B40' }}>
          <span>⚠️ Hay {SERVICES.length - services.length} servicios en services.js que aún no están en Firestore.</span>
          <button className="btn-secondary" style={{ fontSize: '0.78rem' }} onClick={migrate} disabled={migrating}>
            {migrating ? 'Migrando…' : 'Completar migración'}
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.75rem' }}>
        <div className="mini-stat"><span className="ms-val">{services.length}</span><span className="ms-lbl">Servicios</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#10B981' }}>{activos}</span><span className="ms-lbl">Activos</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#EF4444' }}>{inactivos}</span><span className="ms-lbl">Inactivos</span></div>
        <div className="mini-stat">
          <span className="ms-val" style={{ color: '#F59E0B', fontSize: '0.9rem' }}>
            {services.length ? `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}` : '—'}
          </span>
          <span className="ms-lbl">Rango de precios</span>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="filter-row">
        <input className="search-input" placeholder="🔍 Buscar servicio…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Tabla de servicios */}
      {loading
        ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando…</div>
        : services.length === 0
        ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</p>
          <h3 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>Catálogo vacío en Firestore</h3>
          <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
            Usa el botón <strong style={{ color: '#F59E0B' }}>Migrar desde services.js</strong> para
            importar los {SERVICES.length} servicios actuales en un solo clic.
            Después podrás editarlos desde aquí sin tocar código.
          </p>
          <button className="btn-primary" onClick={migrate} disabled={migrating}>
            {migrating ? 'Migrando…' : '⬆️ Migrar catálogo ahora'}
          </button>
        </div>
        )
        : (
        <div className="card">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th style={{ textAlign: 'center' }}>Opciones</th>
                  <th>Precio desde</th>
                  <th>Duración</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((svc) => {
                  const minOpt = svc.options?.reduce(
                    (min, o) => (o.precio < min ? o.precio : min),
                    Infinity,
                  );
                  return (
                    <tr key={svc.id} style={{ opacity: svc.activo === false ? 0.5 : 1 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{svc.emoji || '🐾'}</span>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{svc.nombre}</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>
                              ID: <code style={{ color: '#6366F1' }}>{svc.id}</code>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-neutral">{svc.options?.length ?? 0} opciones</span>
                      </td>
                      <td>
                        <strong style={{ color: '#F59E0B' }}>
                          {minOpt === Infinity ? '—' : formatCurrency(minOpt)}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{svc.duracion || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge active={svc.activo !== false} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn-icon" title="Editar" onClick={() => setModal(svc)}>✏️</button>
                          <button
                            className="btn-icon"
                            title={svc.activo !== false ? 'Desactivar' : 'Activar'}
                            onClick={() => toggleActive(svc)}
                            style={{ color: svc.activo !== false ? '#F59E0B' : '#10B981' }}
                          >
                            {svc.activo !== false ? '⏸' : '▶'}
                          </button>
                          <button
                            className="btn-icon" title="Eliminar"
                            style={{ color: '#EF4444' }}
                            onClick={() => setDeleteConfirm(svc)}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards expandidas de opciones por servicio */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {filtered.map((svc) => (
            <div key={`detail-${svc.id}`} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.6rem' }}>{svc.emoji}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#F1F5F9' }}>{svc.nombre}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>{svc.short}</p>
                </div>
                <Badge active={svc.activo !== false} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {svc.options?.map((opt) => (
                  <div key={opt.id} style={{
                    padding: '0.6rem 0.9rem', background: '#0F1729', borderRadius: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid #1C2333',
                  }}>
                    <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{opt.label}</span>
                    <strong style={{ color: '#F59E0B', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                      {formatCurrency(opt.precio)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal edición / creación */}
      {modal && (
        <ServiceModal
          service={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Confirmación de borrado */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿Eliminar servicio?</h3>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#94A3B8' }}>
                Vas a eliminar <strong style={{ color: '#F1F5F9' }}>{deleteConfirm.nombre}</strong>.
                Esta acción no se puede deshacer. Las reservas existentes no se verán afectadas.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button
                style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;