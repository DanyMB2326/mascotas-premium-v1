import { useState, useEffect } from 'react';
import { Link }              from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db }                from '../../firebase/config';
import { useAuth }           from '../../context/AuthContext';
import { useUserProfile }    from '../../context/UserProfileContext';
import { toast }             from 'react-toastify';
import Loader                from '../Loader/Loader';
import './MiPerfil.css';

/* ─── constants ─── */
const COLONIAS = [
  'Álvaro Obregón',
  'Azcapotzalco',
  'Benito Juárez',
  'Coyoacán',
  'Cuajimalpa de Morelos',
  'Cuauhtémoc',
  'Gustavo A. Madero',
  'Iztacalco',
  'Iztapalapa',
  'La Magdalena Contreras',
  'Miguel Hidalgo',
  'Milpa Alta',
  'Tláhuac',
  'Tlalpan',
  'Venustiano Carranza',
  'Xochimilco',
];
const TABS = [
  { id: 'mascotas',    label: 'Mis mascotas',    icon: '🐾' },
  { id: 'historial',   label: 'Historial',        icon: '📋' },
  { id: 'info',        label: 'Mi información',  icon: '👤' },
  { id: 'direcciones', label: 'Direcciones',     icon: '📍' },
  { id: 'pagos',       label: 'Métodos de pago', icon: '💳' },
];
const EMPTY_PET  = { nombre:'', especie:'perro', raza:'', peso:'', edad:'', color:'', alergias:'', medicacion:'', notas:'' };
const EMPTY_ADDR = { alias:'', calle:'', numExt:'', numInt:'', colonia:'', cp:'', referencias:'' };
const EMPTY_CARD = { number:'', expiry:'', cvv:'', alias:'' };

/* ─── helpers ─── */
const detectBrand = (num) => {
  const n = num.replace(/\s/g,'');
  if (/^4/.test(n))      return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n))  return 'Amex';
  return 'Tarjeta';
};
const maskNum = (raw) => raw.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();

/* ─── shared UI pieces ─── */
const Field = ({ label, required, error, children }) => (
  <div className={`mpf-field${error ? ' mpf-field--err' : ''}`}>
    <label className="mpf-label">{label}{required && <span className="mpf-req">*</span>}</label>
    {children}
    {error && <span className="mpf-err">{error}</span>}
  </div>
);
const Card = ({ children }) => <div className="mpf-section-card">{children}</div>;
const CardHeader = ({ title, action }) => (
  <div className="mpf-card-header">
    <h3 className="mpf-card-title">{title}</h3>
    {action}
  </div>
);

/* ══════════════════════
   TAB 1 — MASCOTAS
══════════════════════ */
const TabMascotas = ({ user }) => {
  const [mascotas,  setMascotas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form,      setForm]      = useState(EMPTY_PET);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => { if (snap.exists()) setMascotas(snap.data().mascotas || []); })
      .catch(() => toast.error('No se pudieron cargar las mascotas.'))
      .finally(() => setLoading(false));
  }, [user]);

  const persist = async (list) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email || null, mascotas: list }, { merge: true });
      setMascotas(list);
    } catch { toast.error('Error al guardar.'); }
    finally { setSaving(false); }
  };

  const openNew  = () => { setForm(EMPTY_PET); setEditIndex(null); setShowForm(true); };
  const openEdit = (i) => { setForm({ ...mascotas[i] }); setEditIndex(i); setShowForm(true); };
  const ch = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.raza.trim()) { toast.error('Nombre y raza son obligatorios.'); return; }
    const updated = [...mascotas];
    if (editIndex !== null) updated[editIndex] = form;
    else updated.push({ ...form, id: Date.now().toString() });
    await persist(updated);
    toast.success(editIndex !== null ? 'Mascota actualizada ✓' : '¡Mascota agregada! 🐾');
    setShowForm(false);
  };

  const del = async (i) => {
    if (!window.confirm(`¿Eliminás a ${mascotas[i].nombre}?`)) return;
    await persist(mascotas.filter((_, j) => j !== i));
    toast.success('Mascota eliminada.');
  };

  if (loading) return <Loader text="Cargando mascotas..." />;

  return (
    <div className="mpf-tab-content">

      {mascotas.length > 0 && (
        <div className="mpf-pets-grid">
          {mascotas.map((m, i) => (
            <div key={m.id || i} className="mpf-pet-card">
              <div className="mpf-pet-avatar">{m.especie === 'gato' ? '🐱' : '🐶'}</div>
              <div className="mpf-pet-info">
                <h4 className="mpf-pet-name">{m.nombre}</h4>
                <p className="mpf-pet-meta">
                  {m.especie === 'gato' ? 'Gato' : 'Perro'} · {m.raza}
                  {m.peso ? ` · ${m.peso} kg` : ''}
                  {m.edad ? ` · ${m.edad} años` : ''}
                </p>
                {m.alergias   && <span className="mpf-pet-tag mpf-pet-tag--warn">⚠️ {m.alergias}</span>}
                {m.medicacion && <span className="mpf-pet-tag mpf-pet-tag--info">💊 {m.medicacion}</span>}
                {m.notas      && <p className="mpf-pet-notes">📝 {m.notas}</p>}
              </div>
              <div className="mpf-pet-acts">
                <Link to="/reservar" className="btn-primary mpf-pet-btn">📅 Reservar</Link>
                <button className="btn-outline mpf-pet-btn" onClick={() => openEdit(i)}>✏️ Editar</button>
                <button className="mpf-del-btn" onClick={() => del(i)} aria-label="Eliminar">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mascotas.length === 0 && !showForm && (
        <div className="mpf-empty">
          <span>🐾</span>
          <h4>Aún no registras mascotas</h4>
          <p>Guarda sus datos una vez y úsalos en cada reserva.</p>
        </div>
      )}

      {!showForm && (
        <button className="btn-primary mpf-add-btn" onClick={openNew}>
          + Agregar mascota
        </button>
      )}

      {showForm && (
        <Card>
          <CardHeader
            title={editIndex !== null ? `Editando a ${mascotas[editIndex]?.nombre}` : 'Nueva mascota'}
            action={<button className="mpf-close-btn" onClick={() => setShowForm(false)}>✕</button>}
          />
          <form onSubmit={submit} noValidate className="mpf-form">
            <div className="mpf-grid-2">
              <Field label="Nombre" required><input name="nombre" value={form.nombre} onChange={ch} placeholder="Luna" /></Field>
              <Field label="Especie">
                <select name="especie" value={form.especie} onChange={ch}>
                  <option value="perro">🐶 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </Field>
            </div>
            <div className="mpf-grid-2">
              <Field label="Raza" required><input name="raza" value={form.raza} onChange={ch} placeholder="Golden Retriever" /></Field>
              <Field label="Color / pelaje"><input name="color" value={form.color} onChange={ch} placeholder="Dorado" /></Field>
            </div>
            <div className="mpf-grid-2">
              <Field label="Peso (kg)"><input name="peso" type="number" value={form.peso} onChange={ch} placeholder="12" min="0" max="120" /></Field>
              <Field label="Edad (años)"><input name="edad" type="number" value={form.edad} onChange={ch} placeholder="3" min="0" max="30" /></Field>
            </div>
            <Field label="Alergias conocidas"><input name="alergias" value={form.alergias} onChange={ch} placeholder="Pollo, maíz… (vacío si no tiene)" /></Field>
            <Field label="Medicación habitual"><input name="medicacion" value={form.medicacion} onChange={ch} placeholder="Pastilla X, 1 vez al día…" /></Field>
            <Field label="Notas para el equipo"><textarea name="notas" value={form.notas} onChange={ch} placeholder="Comportamiento, miedos, rutinas especiales…" rows={3} /></Field>
            <div className="mpf-form-acts">
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : editIndex !== null ? 'Guardar cambios' : 'Agregar mascota'}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

/* ══════════════════════
   TAB 2 — INFO PERSONAL
══════════════════════ */
const TabInfo = ({ user }) => {
  const { profile, saveBasicInfo } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ nombre:'', apellido:'', telefono:'' });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setForm({ nombre: profile.nombre, apellido: profile.apellido, telefono: profile.telefono });
    });
    return () => { cancelled = true; };
  }, [profile.nombre, profile.apellido, profile.telefono]);

  const save = async () => {
    setSaving(true);
    await saveBasicInfo(form);
    setEditing(false);
    toast.success('Información actualizada ✓');
    setSaving(false);
  };

  const ch = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="mpf-tab-content">
      <Card>
        <CardHeader
          title="Datos de contacto"
          action={!editing && <button className="mpf-edit-btn" onClick={() => setEditing(true)}>✏️ Editar</button>}
        />
        {editing ? (
          <div className="mpf-form">
            <div className="mpf-grid-2">
              <Field label="Nombre"><input value={form.nombre} onChange={ch('nombre')} placeholder="María" /></Field>
              <Field label="Apellidos"><input value={form.apellido} onChange={ch('apellido')} placeholder="García" /></Field>
            </div>
            <Field label="Teléfono (WhatsApp)">
              <input value={form.telefono} onChange={ch('telefono')} placeholder="+52 55 0000 0000" type="tel" />
            </Field>
            <div className="mpf-form-acts">
              <button className="btn-outline" onClick={() => setEditing(false)}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Guardando…' : '✓ Guardar cambios'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mpf-info-grid">
            <div className="mpf-info-item"><span>Nombre</span><strong>{profile.nombre || <em className="mpf-na">Sin configurar</em>}</strong></div>
            <div className="mpf-info-item"><span>Apellidos</span><strong>{profile.apellido || <em className="mpf-na">Sin configurar</em>}</strong></div>
            <div className="mpf-info-item"><span>Correo</span><strong>{user?.email}</strong></div>
            <div className="mpf-info-item"><span>Teléfono</span><strong>{profile.telefono || <em className="mpf-na">Sin configurar</em>}</strong></div>
          </div>
        )}
      </Card>
    </div>
  );
};

/* ══════════════════════
   TAB 3 — DIRECCIONES
══════════════════════ */
const TabDirecciones = () => {
  const { profile, addAddress, deleteAddress, setPrimaryAddress } = useUserProfile();
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_ADDR);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const ch = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.calle.trim())  e.calle  = 'Requerido';
    if (!form.numExt.trim()) e.numExt = 'Requerido';
    if (!form.colonia)       e.colonia= 'Requerido';
    if (!form.cp.trim() || form.cp.length < 5) e.cp = 'CP inválido';
    return e;
  };

  const submit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    await addAddress(form);
    setForm(EMPTY_ADDR); setShowForm(false);
    toast.success('Dirección guardada ✓');
    setSaving(false);
  };

  return (
    <div className="mpf-tab-content">
      <Card>
        <CardHeader
          title="Mis direcciones"
          action={!showForm && (
            <button className="mpf-edit-btn" onClick={() => setShowForm(true)}>+ Agregar</button>
          )}
        />

        {showForm && (
          <div className="mpf-form mpf-form--inner">
            <Field label="Alias"><input value={form.alias} onChange={ch('alias')} placeholder="Mi casa, Trabajo…" /></Field>
            <div className="mpf-grid-2">
              <Field label="Calle" error={errors.calle}><input value={form.calle} onChange={ch('calle')} placeholder="Av. Insurgentes" /></Field>
              <Field label="Núm. exterior" error={errors.numExt}><input value={form.numExt} onChange={ch('numExt')} placeholder="42" /></Field>
            </div>
            <div className="mpf-grid-2">
              <Field label="Núm. interior"><input value={form.numInt} onChange={ch('numInt')} placeholder="3B (opcional)" /></Field>
              <Field label="CP" error={errors.cp}><input value={form.cp} onChange={ch('cp')} placeholder="06600" maxLength={5} type="number" /></Field>
            </div>
            <Field label="Colonia / Alcaldía" error={errors.colonia}>
              <select value={form.colonia} onChange={ch('colonia')}>
                <option value="">Seleccionar…</option>
                {COLONIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Referencias"><input value={form.referencias} onChange={ch('referencias')} placeholder="Entre calles, color de fachada…" /></Field>
            <div className="mpf-form-acts">
              <button className="btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_ADDR); setErrors({}); }}>Cancelar</button>
              <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? 'Guardando…' : '✓ Guardar'}</button>
            </div>
          </div>
        )}

        {profile.addresses.length === 0 && !showForm ? (
          <div className="mpf-empty mpf-empty--sm">
            <span>📍</span><p>Sin direcciones guardadas.</p>
            <button className="btn-outline" onClick={() => setShowForm(true)}>Agregar primera dirección</button>
          </div>
        ) : (
          <div className="mpf-addr-list">
            {profile.addresses.map((a) => (
              <div key={a.id} className={`mpf-addr-card${a.isPrimary ? ' mpf-addr-card--primary' : ''}`}>
                <div className="mpf-addr-top">
                  <span className="mpf-addr-alias">
                    📍 {a.alias || 'Dirección'}
                    {a.isPrimary && <span className="mpf-badge">Principal</span>}
                  </span>
                  <div className="mpf-row-acts">
                    {!a.isPrimary && (
                      <button className="mpf-text-btn" onClick={() => { setPrimaryAddress(a.id); toast.success('Dirección principal actualizada ✓'); }}>
                        Hacer principal
                      </button>
                    )}
                    <button className="mpf-text-btn mpf-text-btn--del" onClick={() => { deleteAddress(a.id); toast.info('Dirección eliminada'); }}>
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="mpf-addr-line">{a.calle} {a.numExt}{a.numInt ? ` int. ${a.numInt}` : ''}, {a.colonia}, CP {a.cp}</p>
                {a.referencias && <p className="mpf-addr-ref">📌 {a.referencias}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ══════════════════════
   TAB 4 — MÉTODOS PAGO
══════════════════════ */
const TabPagos = () => {
  const { profile, addCard, deleteCard, setPrimaryCard } = useUserProfile();
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_CARD);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const brand = detectBrand(form.number);

  const handleNum = (e) => setForm((p) => ({ ...p, number: maskNum(e.target.value) }));
  const handleExp = (e) => {
    let v = e.target.value.replace(/\D/g,'').slice(0,4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    setForm((p) => ({ ...p, expiry: v }));
  };

  const validate = () => {
    const e = {};
    const d = form.number.replace(/\s/g,'');
    if (d.length < 15)                         e.number = 'Número inválido';
    if (!form.expiry.match(/^\d{2}\/\d{2}$/))  e.expiry = 'Formato MM/AA';
    if (form.cvv.length < 3)                   e.cvv    = 'CVV inválido';
    return e;
  };

  const submit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    const d = form.number.replace(/\s/g,'');
    setSaving(true);
    await addCard({ alias: form.alias || `${brand} ****${d.slice(-4)}`, brand, last4: d.slice(-4), expiry: form.expiry });
    setForm(EMPTY_CARD); setShowForm(false);
    toast.success('Tarjeta guardada ✓');
    setSaving(false);
  };

  return (
    <div className="mpf-tab-content">
      <Card>
        <CardHeader
          title="Mis tarjetas"
          action={!showForm && <button className="mpf-edit-btn" onClick={() => setShowForm(true)}>+ Agregar</button>}
        />

        {showForm && (
          <div className="mpf-form mpf-form--inner">
            {/* Visual card preview */}
            <div className={`mpf-card-preview mpf-card-preview--${brand.toLowerCase()}`}>
              <div className="mpf-cp-top"><span>💳 {brand}</span><span className="mpf-cp-chip">▬▬</span></div>
              <div className="mpf-cp-number">{form.number || '•••• •••• •••• ••••'}</div>
              <div className="mpf-cp-bottom">
                <div><span className="mpf-cp-lbl">Titular</span><span>Tu nombre</span></div>
                <div><span className="mpf-cp-lbl">Vence</span><span>{form.expiry || 'MM/AA'}</span></div>
              </div>
            </div>

            <Field label="Número de tarjeta" error={errors.number}>
              <input value={form.number} onChange={handleNum} placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" />
            </Field>
            <div className="mpf-grid-2">
              <Field label="Vencimiento (MM/AA)" error={errors.expiry}>
                <input value={form.expiry} onChange={handleExp} placeholder="08/27" maxLength={5} inputMode="numeric" autoComplete="cc-exp" />
              </Field>
              <Field label="CVV" error={errors.cvv}>
                <input value={form.cvv} onChange={(e) => setForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                  placeholder="123" maxLength={4} type="password" inputMode="numeric" autoComplete="cc-csc" />
              </Field>
            </div>
            <Field label="Alias (opcional)">
              <input value={form.alias} onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))} placeholder={`${brand} personal`} />
            </Field>
            <p className="mpf-secure-note">🔒 Solo guardamos los últimos 4 dígitos. El número completo nunca se almacena.</p>
            <div className="mpf-form-acts">
              <button className="btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_CARD); setErrors({}); }}>Cancelar</button>
              <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? 'Guardando…' : '✓ Guardar tarjeta'}</button>
            </div>
          </div>
        )}

        {profile.cards.length === 0 && !showForm ? (
          <div className="mpf-empty mpf-empty--sm">
            <span>💳</span><p>Sin métodos de pago guardados.</p>
            <button className="btn-outline" onClick={() => setShowForm(true)}>Agregar tarjeta</button>
          </div>
        ) : (
          <div className="mpf-card-list">
            {profile.cards.map((c) => (
              <div key={c.id} className={`mpf-card-chip${c.isPrimary ? ' mpf-card-chip--primary' : ''}`}>
                <span className="mpf-card-icon">💳</span>
                <div className="mpf-card-info">
                  <span className="mpf-card-alias">{c.alias}</span>
                  <span className="mpf-card-meta">···· {c.last4} · Vence {c.expiry}</span>
                </div>
                <div className="mpf-row-acts">
                  {c.isPrimary
                    ? <span className="mpf-badge">Principal</span>
                    : <button className="mpf-text-btn" onClick={() => { setPrimaryCard(c.id); toast.success('Tarjeta principal actualizada ✓'); }}>Hacer principal</button>
                  }
                  <button className="mpf-text-btn mpf-text-btn--del" onClick={() => { deleteCard(c.id); toast.info('Tarjeta eliminada'); }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mpf-secure-note" style={{ marginTop:'1rem' }}>🔒 Solo almacenamos marca y últimos 4 dígitos.</p>
      </Card>
    </div>
  );
};

/* ══════════════════════
   TAB HISTORIAL
══════════════════════ */
const ESTADO_BADGE = {
  confirmado:            { label: 'Confirmado',   color: '#16a34a' },
  confirmada:            { label: 'Confirmada',   color: '#16a34a' },
  'pendiente-activacion':{ label: 'Pendiente',    color: '#B45309' },
  cancelado:             { label: 'Cancelado',    color: 'var(--danger)' },
  entregado:             { label: 'Entregado',    color: 'var(--accent)' },
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADO_BADGE[estado] || { label: estado, color: 'var(--text-muted)' };
  return (
    <span className="hist-estado" style={{ '--badge-color': cfg.color }}>
      {cfg.label}
    </span>
  );
};

const TabHistorial = ({ user }) => {
  const [reservas,  setReservas]  = useState([]);
  const [pedidos,   setPedidos]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('reservas');

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [rSnap, pSnap] = await Promise.all([
          getDocs(query(
            collection(db, 'reservas'),
            where('userId', '==', user.uid)
          )),
          getDocs(query(
            collection(db, 'pedidos'),
            where('userId', '==', user.uid)
          )),
        ]);

        const sortByDate = (docs) =>
          docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const ta = a.createdAt?.toMillis?.() ?? 0;
              const tb = b.createdAt?.toMillis?.() ?? 0;
              return tb - ta;
            });

        setReservas(sortByDate(rSnap.docs));
        setPedidos(sortByDate(pSnap.docs));
      } catch (e) {
        console.error('Historial error:', e);
        toast.error('No se pudo cargar el historial.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const fmt = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <Loader text="Cargando historial…" />;

  return (
    <div className="mpf-tab-content">

      {/* Sub-tabs */}
      <div className="hist-subtabs">
        <button
          className={`hist-subtab ${activeTab === 'reservas' ? 'hist-subtab--active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          📅 Reservas <span className="hist-count">{reservas.length}</span>
        </button>
        <button
          className={`hist-subtab ${activeTab === 'pedidos' ? 'hist-subtab--active' : ''}`}
          onClick={() => setActiveTab('pedidos')}
        >
          🛒 Compras <span className="hist-count">{pedidos.length}</span>
        </button>
      </div>

      {/* RESERVAS */}
      {activeTab === 'reservas' && (
        reservas.length === 0 ? (
          <div className="mpf-empty mpf-empty--sm">
            <span>📅</span>
            <p>Aún no tienes reservas registradas.</p>
            <Link to="/reservar" className="btn-outline">Reservar un servicio</Link>
          </div>
        ) : (
          <div className="hist-list">
            {reservas.map((r) => (
              <div key={r.id} className="hist-card">
                <div className="hist-card-top">
                  <div className="hist-card-info">
                    <span className="hist-emoji">
                      {r.servicio?.id === 'estetica' ? '✂️' :
                       r.servicio?.id === 'bano'     ? '🛁' :
                       r.servicio?.id === 'spa'       ? '🌿' :
                       r.servicio?.id === 'guarderia' ? '☀️' :
                       r.servicio?.id === 'pension'   ? '🏨' :
                       r.servicio?.id === 'adiestramiento' ? '🎓' :
                       r.servicio?.id === 'transporte'? '🚐' : '📦'}
                    </span>
                    <div>
                      <p className="hist-title">{r.servicio?.nombre || 'Servicio'}</p>
                      <p className="hist-sub">{r.opcion?.label} · {r.mascota?.nombre}</p>
                    </div>
                  </div>
                  <EstadoBadge estado={r.estado} />
                </div>
                <div className="hist-card-meta">
                  <span>📅 {r.fecha || fmt(r.createdAt)}</span>
                  {r.hora && <span>🕐 {r.hora}</span>}
                  <span>💰 ${r.total?.toLocaleString('es-MX')} MXN</span>
                  <span className="hist-id">#{r.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* PEDIDOS / COMPRAS */}
      {activeTab === 'pedidos' && (
        pedidos.length === 0 ? (
          <div className="mpf-empty mpf-empty--sm">
            <span>🛒</span>
            <p>Aún no tienes compras registradas.</p>
            <Link to="/tienda" className="btn-outline">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="hist-list">
            {pedidos.map((p) => (
              <div key={p.id} className="hist-card">
                <div className="hist-card-top">
                  <div className="hist-card-info">
                    <span className="hist-emoji">🛍️</span>
                    <div>
                      <p className="hist-title">
                        {p.items?.length === 1
                          ? p.items[0].title
                          : `${p.items?.length} productos`}
                      </p>
                      <p className="hist-sub">
                        {p.items?.map((i) => `${i.emoji || ''}${i.title}`).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <div className="hist-card-meta">
                  <span>📅 {fmt(p.createdAt)}</span>
                  <span>📍 {p.direccion?.colonia}</span>
                  <span>💰 ${p.total?.toLocaleString('es-MX')} MXN</span>
                  <span className="hist-id">#{p.id.slice(0, 8).toUpperCase()}</span>
                </div>
                {/* Items detalle */}
                <div className="hist-items">
                  {p.items?.map((item) => (
                    <div key={item.id} className="hist-item">
                      <span>{item.emoji} {item.title}</span>
                      <span>×{item.quantity} · ${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
};

/* ══════════════════════
   MAIN
══════════════════════ */
const MiPerfil = () => {
  const { user }    = useAuth();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('mascotas');

  const avatar      = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const displayName = profile.nombre
    ? `${profile.nombre} ${profile.apellido}`.trim()
    : user?.displayName || 'Mi perfil';

  return (
    <div className="mi-perfil-page">

      {/* Hero */}
      <div className="mpf-hero">
        <div className="mpf-avatar">{avatar}</div>
        <div className="mpf-hero-text">
          <h1 className="mpf-hero-name">{displayName}</h1>
          <p className="mpf-hero-email">{user?.email}</p>
          <div className="mpf-hero-chips">
            <span>📍 {(profile.addresses ?? []).length} {(profile.addresses ?? []).length === 1 ? 'dirección' : 'direcciones'}</span>
            <span>💳 {(profile.cards ?? []).length} {(profile.cards ?? []).length === 1 ? 'tarjeta' : 'tarjetas'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="mpf-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`mpf-tab${activeTab === t.id ? ' mpf-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="mpf-tab-icon">{t.icon}</span>
            <span className="mpf-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      {activeTab === 'mascotas'    && <TabMascotas    user={user} />}
      {activeTab === 'historial'   && <TabHistorial   user={user} />}
      {activeTab === 'info'        && <TabInfo        user={user} />}
      {activeTab === 'direcciones' && <TabDirecciones />}
      {activeTab === 'pagos'       && <TabPagos />}
    </div>
  );
};

export default MiPerfil;