import { useState } from 'react';
import { useAuth }        from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { toast }          from 'react-toastify';
import { Link }           from 'react-router-dom';
import '../Perfil/Perfil.css';

const COLONIAS = [
  'Condesa','Roma Norte','Roma Sur','Polanco','Narvarte',
  'Del Valle','Coyoacán','Benito Juárez','Cuauhtémoc',
  'Tlalpan','Álvaro Obregón','Azcapotzalco','Iztapalapa',
  'Gustavo A. Madero','Xochimilco','Otra',
];

const detectBrand = (num) => {
  const n = num.replace(/\s/g,'');
  if (/^4/.test(n))      return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n))  return 'Amex';
  return 'Tarjeta';
};

const maskCard = (raw) => raw.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();

const EMPTY_ADDR = { alias:'',calle:'',numExt:'',numInt:'',colonia:'',cp:'',referencias:'' };
const EMPTY_CARD = { number:'',expiry:'',cvv:'',alias:'' };

const Field = ({ label, error, children }) => (
  <div className={`pf-field${error ? ' pf-field--err' : ''}`}>
    <label className="pf-label">{label}</label>
    {children}
    {error && <span className="pf-err">{error}</span>}
  </div>
);

/* ---- Address form ---- */
const AddressForm = ({ onSave, onCancel, saving }) => {
  const [f, setF] = useState(EMPTY_ADDR);
  const [e, setE] = useState({});
  const set = (k) => (ev) => setF((p) => ({ ...p, [k]: ev.target.value }));

  const submit = () => {
    const err = {};
    if (!f.calle.trim())  err.calle  = 'Requerido';
    if (!f.numExt.trim()) err.numExt = 'Requerido';
    if (!f.colonia)       err.colonia= 'Requerido';
    if (!f.cp.trim() || f.cp.length < 5) err.cp = 'CP inválido';
    setE(err);
    if (!Object.keys(err).length) onSave(f);
  };

  return (
    <div className="pf-form-card">
      <Field label="Alias (ej: Casa, Trabajo)"><input value={f.alias} onChange={set('alias')} placeholder="Mi casa" /></Field>
      <div className="pf-grid-2">
        <Field label="Calle" error={e.calle}><input value={f.calle} onChange={set('calle')} placeholder="Av. Insurgentes" /></Field>
        <Field label="Núm. exterior" error={e.numExt}><input value={f.numExt} onChange={set('numExt')} placeholder="42" /></Field>
      </div>
      <div className="pf-grid-2">
        <Field label="Núm. interior"><input value={f.numInt} onChange={set('numInt')} placeholder="3B (opcional)" /></Field>
        <Field label="CP" error={e.cp}><input value={f.cp} onChange={set('cp')} placeholder="06600" maxLength={5} type="number" /></Field>
      </div>
      <Field label="Colonia" error={e.colonia}>
        <select value={f.colonia} onChange={set('colonia')}>
          <option value="">Seleccionar…</option>
          {COLONIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Referencias"><input value={f.referencias} onChange={set('referencias')} placeholder="Entre calles, color de fachada…" /></Field>
      <div className="pf-form-actions">
        <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? 'Guardando…' : '✓ Guardar dirección'}</button>
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

/* ---- Card form ---- */
const CardForm = ({ onSave, onCancel, saving }) => {
  const [f, setF] = useState(EMPTY_CARD);
  const [e, setE] = useState({});
  const brand = detectBrand(f.number);

  const handleNum = (ev) => setF((p) => ({ ...p, number: maskCard(ev.target.value) }));
  const handleExp = (ev) => {
    let v = ev.target.value.replace(/\D/g,'').slice(0,4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    setF((p) => ({ ...p, expiry: v }));
  };

  const submit = () => {
    const digits = f.number.replace(/\s/g,'');
    const err = {};
    if (digits.length < 15) err.number = 'Número inválido';
    if (!f.expiry.match(/^\d{2}\/\d{2}$/)) err.expiry = 'Formato MM/AA';
    if (f.cvv.length < 3)  err.cvv = 'CVV inválido';
    setE(err);
    if (Object.keys(err).length) return;
    onSave({
      alias:  f.alias || `${brand} ****${digits.slice(-4)}`,
      brand, last4: digits.slice(-4), expiry: f.expiry,
    });
  };

  return (
    <div className="pf-form-card">
      {/* Visual preview */}
      <div className={`card-preview card-preview--${brand.toLowerCase()}`}>
        <div className="cp-top"><span className="cp-brand">💳 {brand}</span><span className="cp-chip">▬▬</span></div>
        <div className="cp-number">{f.number || '•••• •••• •••• ••••'}</div>
        <div className="cp-bottom">
          <div><span className="cp-lbl">Titular</span><span className="cp-val">Tu nombre</span></div>
          <div><span className="cp-lbl">Vence</span><span className="cp-val">{f.expiry || 'MM/AA'}</span></div>
        </div>
      </div>

      <Field label="Número de tarjeta" error={e.number}>
        <input value={f.number} onChange={handleNum} placeholder="1234 5678 9012 3456" inputMode="numeric" />
      </Field>
      <div className="pf-grid-2">
        <Field label="Vencimiento (MM/AA)" error={e.expiry}>
          <input value={f.expiry} onChange={handleExp} placeholder="08/27" maxLength={5} inputMode="numeric" />
        </Field>
        <Field label="CVV" error={e.cvv}>
          <input value={f.cvv} onChange={(ev) => setF((p) => ({ ...p, cvv: ev.target.value.replace(/\D/g,'').slice(0,4) }))}
            placeholder="123" maxLength={4} type="password" inputMode="numeric" />
        </Field>
      </div>
      <Field label="Alias (opcional)">
        <input value={f.alias} onChange={(ev) => setF((p) => ({ ...p, alias: ev.target.value }))} placeholder={`${brand} personal`} />
      </Field>
      <p className="pf-secure-note">🔒 Solo guardamos los últimos 4 dígitos. El número completo nunca se almacena.</p>
      <div className="pf-form-actions">
        <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? 'Guardando…' : '✓ Guardar tarjeta'}</button>
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

/* ---- Main ---- */
const Perfil = () => {
  const { user } = useAuth();
  const { profile, saveBasicInfo, addAddress, deleteAddress, setPrimaryAddress, addCard, deleteCard, setPrimaryCard } = useUserProfile();

  const [basicForm,    setBasicForm]    = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [saving,       setSaving]       = useState(false);

  const handleBasicSave = async () => {
    setSaving(true);
    await saveBasicInfo(basicForm);
    setBasicForm(null);
    toast.success('Perfil actualizado ✓');
    setSaving(false);
  };

  const handleAddAddr = async (data) => {
    setSaving(true);
    await addAddress(data);
    setShowAddrForm(false);
    toast.success('Dirección guardada ✓');
    setSaving(false);
  };

  const handleAddCard = async (meta) => {
    setSaving(true);
    await addCard(meta);
    setShowCardForm(false);
    toast.success('Tarjeta guardada ✓');
    setSaving(false);
  };

  const avatar = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="perfil-page">

      <div className="pf-hero">
        <div className="pf-avatar">{avatar}</div>
        <div>
          <h1 className="pf-name">{profile.nombre ? `${profile.nombre} ${profile.apellido}`.trim() : user?.displayName || 'Mi perfil'}</h1>
          <p className="pf-email">{user?.email}</p>
        </div>
        <Link to="/mis-mascotas" className="btn-outline pf-pets-link">🐾 Mis mascotas</Link>
      </div>

      <div className="pf-layout">

        {/* INFO BÁSICA */}
        <section className="pf-section">
          <div className="pf-section-header">
            <h2>Información de contacto</h2>
            {!basicForm && <button className="pf-edit-btn" onClick={() => setBasicForm({ nombre: profile.nombre, apellido: profile.apellido, telefono: profile.telefono })}>✏️ Editar</button>}
          </div>
          {basicForm ? (
            <div className="pf-form-card">
              <div className="pf-grid-2">
                <Field label="Nombre"><input value={basicForm.nombre} onChange={(e) => setBasicForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="María" /></Field>
                <Field label="Apellidos"><input value={basicForm.apellido} onChange={(e) => setBasicForm((p) => ({ ...p, apellido: e.target.value }))} placeholder="García" /></Field>
              </div>
              <Field label="Teléfono (WhatsApp)">
                <input value={basicForm.telefono} onChange={(e) => setBasicForm((p) => ({ ...p, telefono: e.target.value }))} placeholder="+52 55 0000 0000" />
              </Field>
              <div className="pf-form-actions">
                <button className="btn-primary" onClick={handleBasicSave} disabled={saving}>{saving ? 'Guardando…' : '✓ Guardar cambios'}</button>
                <button className="btn-ghost" onClick={() => setBasicForm(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="pf-info-grid">
              <div className="pf-info-item"><span className="pf-info-lbl">Nombre</span><span className="pf-info-val">{profile.nombre || <em className="pf-empty">Sin configurar</em>}</span></div>
              <div className="pf-info-item"><span className="pf-info-lbl">Apellidos</span><span className="pf-info-val">{profile.apellido || <em className="pf-empty">Sin configurar</em>}</span></div>
              <div className="pf-info-item"><span className="pf-info-lbl">Correo</span><span className="pf-info-val">{user?.email}</span></div>
              <div className="pf-info-item"><span className="pf-info-lbl">Teléfono</span><span className="pf-info-val">{profile.telefono || <em className="pf-empty">Sin configurar</em>}</span></div>
            </div>
          )}
        </section>

        {/* DIRECCIONES */}
        <section className="pf-section">
          <div className="pf-section-header">
            <h2>Mis direcciones</h2>
            {!showAddrForm && <button className="pf-edit-btn" onClick={() => setShowAddrForm(true)}>+ Agregar</button>}
          </div>
          {showAddrForm && <AddressForm onSave={handleAddAddr} onCancel={() => setShowAddrForm(false)} saving={saving} />}
          {profile.addresses.length === 0 && !showAddrForm ? (
            <div className="pf-empty-state"><span>📍</span><p>Sin direcciones guardadas.</p><button className="btn-outline" onClick={() => setShowAddrForm(true)}>Agregar dirección</button></div>
          ) : (
            <div className="pf-addr-list">
              {profile.addresses.map((a) => (
                <div key={a.id} className={`pf-addr-card${a.isPrimary ? ' pf-addr-card--primary' : ''}`}>
                  <div className="pf-addr-top">
                    <span className="pf-addr-alias">📍 {a.alias || 'Dirección'}{a.isPrimary && <span className="pf-primary-badge">Principal</span>}</span>
                    <div className="pf-addr-actions">
                      {!a.isPrimary && <button className="pf-text-btn" onClick={() => setPrimaryAddress(a.id)}>Hacer principal</button>}
                      <button className="pf-text-btn pf-text-btn--danger" onClick={() => { deleteAddress(a.id); toast.info('Dirección eliminada'); }}>Eliminar</button>
                    </div>
                  </div>
                  <p className="pf-addr-text">{a.calle} {a.numExt}{a.numInt ? ` int. ${a.numInt}` : ''}, {a.colonia}, CP {a.cp}</p>
                  {a.referencias && <p className="pf-addr-ref">📌 {a.referencias}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TARJETAS */}
        <section className="pf-section">
          <div className="pf-section-header">
            <h2>Mis tarjetas</h2>
            {!showCardForm && <button className="pf-edit-btn" onClick={() => setShowCardForm(true)}>+ Agregar</button>}
          </div>
          {showCardForm && <CardForm onSave={handleAddCard} onCancel={() => setShowCardForm(false)} saving={saving} />}
          {profile.cards.length === 0 && !showCardForm ? (
            <div className="pf-empty-state"><span>💳</span><p>Sin tarjetas guardadas.</p><button className="btn-outline" onClick={() => setShowCardForm(true)}>Agregar tarjeta</button></div>
          ) : (
            <div className="pf-card-list">
              {profile.cards.map((c) => (
                <div key={c.id} className={`pf-card-chip${c.isPrimary ? ' pf-card-chip--primary' : ''}`}>
                  <span className="pf-card-icon">💳</span>
                  <div className="pf-card-info">
                    <span className="pf-card-alias">{c.alias}</span>
                    <span className="pf-card-last4">···· {c.last4} · Vence {c.expiry}</span>
                  </div>
                  <div className="pf-card-actions">
                    {!c.isPrimary && <button className="pf-text-btn" onClick={() => setPrimaryCard(c.id)}>Principal</button>}
                    {c.isPrimary && <span className="pf-primary-badge">Principal</span>}
                    <button className="pf-text-btn pf-text-btn--danger" onClick={() => { deleteCard(c.id); toast.info('Tarjeta eliminada'); }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="pf-secure-note" style={{ marginTop:'1rem' }}>🔒 Solo guardamos marca y últimos 4 dígitos.</p>
        </section>

      </div>
    </div>
  );
};

export default Perfil;