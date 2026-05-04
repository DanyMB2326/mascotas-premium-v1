import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart }        from '../../context/CartContext';
import { useAuth }        from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import '../CheckOut/CheckOut.css';

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

const FORMAS_PAGO = [
  { id: 'tarjeta-guardada', label: 'Tarjeta guardada',         icon: '💳' },
  { id: 'tarjeta-nueva',    label: 'Pagar con tarjeta nueva',  icon: '💳' },
  { id: 'transferencia',    label: 'Transferencia bancaria',   icon: '🏦' },
  { id: 'efectivo',         label: 'Efectivo contra entrega',  icon: '💵' },
];

const detectBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n))      return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n))  return 'Amex';
  return 'Tarjeta';
};

const maskCard = (raw) => raw.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();

const Field = ({ label, required, error, children }) => (
  <div className={`ch-field${error ? ' ch-field--err' : ''}`}>
    <label className="ch-label">{label}{required && <span className="ch-req">*</span>}</label>
    {children}
    {error && <span className="ch-err-msg">{error}</span>}
  </div>
);

/* ─── Inline card simulator ─── */
const CardSimulator = ({ value, onChange, errors }) => {
  const brand = detectBrand(value.number || '');

  const handleNum = (e) => onChange({ ...value, number: maskCard(e.target.value) });
  const handleExp = (e) => {
    let v = e.target.value.replace(/\D/g,'').slice(0,4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    onChange({ ...value, expiry: v });
  };

  return (
    <div className="ch-card-sim">
      {/* Visual card */}
      <div className={`card-preview card-preview--${brand.toLowerCase()}`}>
        <div className="cp-top"><span className="cp-brand">💳 {brand}</span><span className="cp-chip">▬▬</span></div>
        <div className="cp-number">{value.number || '•••• •••• •••• ••••'}</div>
        <div className="cp-bottom">
          <div>
            <span className="cp-lbl">Titular</span>
            <span className="cp-val">{value.titular || 'Tu nombre'}</span>
          </div>
          <div>
            <span className="cp-lbl">Vence</span>
            <span className="cp-val">{value.expiry || 'MM/AA'}</span>
          </div>
        </div>
      </div>

      <Field label="Número de tarjeta" required error={errors?.number}>
        <input value={value.number || ''} onChange={handleNum}
          placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" />
      </Field>
      <Field label="Nombre en la tarjeta" required error={errors?.titular}>
        <input value={value.titular || ''} onChange={(e) => onChange({ ...value, titular: e.target.value })}
          placeholder="Como aparece en la tarjeta" autoComplete="cc-name" />
      </Field>
      <div className="ch-grid-2">
        <Field label="Vencimiento (MM/AA)" required error={errors?.expiry}>
          <input value={value.expiry || ''} onChange={handleExp}
            placeholder="08/27" maxLength={5} inputMode="numeric" autoComplete="cc-exp" />
        </Field>
        <Field label="CVV" required error={errors?.cvv}>
          <input value={value.cvv || ''} onChange={(e) => onChange({ ...value, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })}
            placeholder="123" maxLength={4} type="password" inputMode="numeric" autoComplete="cc-csc" />
        </Field>
      </div>
      <p className="ch-secure-note">🔒 Pago simulado. Ningún dato se procesa ni se almacena.</p>
    </div>
  );
};

/* ─── Checkout main ─── */
const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user }    = useAuth();
  const { profile, primaryAddress } = useUserProfile();

  const [form,    setForm]    = useState({
    nombre:'', apellido:'', telefono:'', email:'',
    calle:'', numExt:'', numInt:'', colonia:'', cp:'', referencias:'',
    formaPago: 'transferencia',
    savedAddressId: '',
  });
  const [cardData,  setCardData]  = useState({ number:'', titular:'', expiry:'', cvv:'' });
  const [errors,    setErrors]    = useState({});
  const [cardErrors,setCardErrors]= useState({});
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [processing,setProcessing]= useState(false); // card animation

  /* ── Autofill from profile when user logs in ── */
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || !user) return;
      setForm((f) => ({
        ...f,
        nombre:   profile.nombre   || user.displayName?.split(' ')[0] || '',
        apellido: profile.apellido || user.displayName?.split(' ').slice(1).join(' ') || '',
        telefono: profile.telefono || '',
        email:    user.email || '',
      }));
    });
    return () => { cancelled = true; };
  }, [user, profile.nombre, profile.apellido, profile.telefono]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || !primaryAddress) return;
      setForm((f) => ({
        ...f,
        savedAddressId: primaryAddress.id,
        calle:          primaryAddress.calle,
        numExt:         primaryAddress.numExt,
        numInt:         primaryAddress.numInt || '',
        colonia:        primaryAddress.colonia,
        cp:             primaryAddress.cp,
        referencias:    primaryAddress.referencias || '',
      }));
    });
    return () => { cancelled = true; };
  }, [primaryAddress]);

  const hasSavedCards = (profile.cards ?? []).length > 0;
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setForm((f) => ({
        ...f,
        formaPago: hasSavedCards ? 'tarjeta-guardada' : 'tarjeta-nueva',
      }));
    });
    return () => { cancelled = true; };
  }, [hasSavedCards]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* Fill address from saved selection */
  const handleAddressSelect = (e) => {
    const id   = e.target.value;
    const addr = profile.addresses.find((a) => a.id === id);
    if (!addr) { setForm((f) => ({ ...f, savedAddressId:'', calle:'', numExt:'', numInt:'', colonia:'', cp:'', referencias:'' })); return; }
    setForm((f) => ({
      ...f, savedAddressId: id,
      calle: addr.calle, numExt: addr.numExt, numInt: addr.numInt || '',
      colonia: addr.colonia, cp: addr.cp, referencias: addr.referencias || '',
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'Requerido';
    if (!form.apellido.trim()) e.apellido = 'Requerido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    if (!form.email.includes('@')) e.email = 'Correo inválido';
    if (!form.calle.trim())    e.calle    = 'Requerido';
    if (!form.numExt.trim())   e.numExt   = 'Requerido';
    if (!form.colonia)         e.colonia  = 'Requerido';
    if (!form.cp.trim() || form.cp.length < 5) e.cp = 'CP inválido';
    return e;
  };

  const validateCard = () => {
    const e = {};
    const digits = (cardData.number || '').replace(/\s/g,'');
    if (digits.length < 15)                         e.number  = 'Número inválido';
    if (!cardData.titular?.trim())                  e.titular = 'Requerido';
    if (!cardData.expiry?.match(/^\d{2}\/\d{2}$/)) e.expiry  = 'Formato MM/AA';
    if ((cardData.cvv || '').length < 3)            e.cvv     = 'CVV inválido';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (form.formaPago === 'tarjeta-nueva') {
      const ce = validateCard();
      setCardErrors(ce);
      if (Object.keys(ce).length) return;
      // Simulate processing animation
      setProcessing(true);
      await new Promise((r) => setTimeout(r, 2200));
      setProcessing(false);
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    clearCart();
    setSuccess(true);
    setLoading(false);
  };

  /* ── Empty cart ── */
  if (cartItems.length === 0 && !success) return (
    <div className="state-container">
      <span className="state-icon">🛒</span>
      <h2>Tu carrito está vacío</h2>
      <p>Agrega productos antes de continuar.</p>
      <Link to="/tienda" className="btn-primary" style={{ marginTop:'1rem' }}>Ir a la tienda</Link>
    </div>
  );

  /* ── Success ── */
  if (success) return (
    <div className="ch-success">
      <div className="ch-success-icon">🎉</div>
      <h2>¡Pedido confirmado!</h2>
      <p>Nos pondremos en contacto contigo en las próximas horas para coordinar la entrega. Revisa tu WhatsApp.</p>
      <div className="ch-success-actions">
        <Link to="/tienda" className="btn-primary">Seguir comprando</Link>
        <Link to="/" className="btn-outline">Ir al inicio</Link>
      </div>
    </div>
  );

  /* ── Card processing overlay ── */
  if (processing) return (
    <div className="ch-processing">
      <div className="ch-proc-card">
        <div className="ch-proc-icon">💳</div>
        <h2>Procesando pago…</h2>
        <div className="ch-proc-bar"><div className="ch-proc-fill" /></div>
        <p>No cierres esta ventana</p>
      </div>
    </div>
  );

  const envio = totalPrice >= 700 ? 0 : 120;
  const total = totalPrice + envio;
  const selectedCard = (profile.cards ?? []).find((c) => c.isPrimary) ?? profile.cards?.[0] ?? null;

  return (
    <div className="checkout-page">

      <div className="ch-header">
        <Link to="/cart" className="ch-back">← Volver al carrito</Link>
        <div>
          <span className="tag tag-gold">📦 Confirmación de pedido</span>
          <h1 className="ch-title">Finalizar compra</h1>
          <p className="ch-sub">Envío a domicilio en CDMX · 24–72 hrs hábiles</p>
        </div>
      </div>

      {/* Profile autofill notice */}
      {user && (profile.nombre || primaryAddress) && (
        <div className="ch-autofill-notice">
          ✨ Autocompletamos tus datos desde tu perfil.{' '}
          <Link to="/perfil">Editar perfil →</Link>
        </div>
      )}

      <div className="ch-layout">
        <div className="ch-form-col">

          {/* ── PASO 1: Contacto ── */}
          <section className="ch-section">
            <h2 className="ch-section-title"><span className="ch-step">1</span> Datos de contacto</h2>
            <div className="ch-grid-2">
              <Field label="Nombre" required error={errors.nombre}>
                <input value={form.nombre} onChange={set('nombre')} placeholder="María" />
              </Field>
              <Field label="Apellidos" required error={errors.apellido}>
                <input value={form.apellido} onChange={set('apellido')} placeholder="García López" />
              </Field>
            </div>
            <div className="ch-grid-2">
              <Field label="Teléfono (WhatsApp)" required error={errors.telefono}>
                <input value={form.telefono} onChange={set('telefono')} placeholder="+52 55 0000 0000" type="tel" />
              </Field>
              <Field label="Correo electrónico" required error={errors.email}>
                <input value={form.email} onChange={set('email')} placeholder="hola@correo.com" type="email" />
              </Field>
            </div>
          </section>

          {/* ── PASO 2: Dirección ── */}
          <section className="ch-section">
            <h2 className="ch-section-title"><span className="ch-step">2</span> Dirección de entrega</h2>

            {/* Saved addresses selector */}
            {profile.addresses.length > 0 && (
              <Field label="Usar dirección guardada">
                <select value={form.savedAddressId} onChange={handleAddressSelect}>
                  <option value="">— Escribir nueva dirección —</option>
                  {profile.addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.alias || 'Dirección'} · {a.calle} {a.numExt}, {a.colonia}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Calle" required error={errors.calle}>
              <input value={form.calle} onChange={set('calle')} placeholder="Av. Insurgentes Sur" />
            </Field>
            <div className="ch-grid-2">
              <Field label="Número exterior" required error={errors.numExt}>
                <input value={form.numExt} onChange={set('numExt')} placeholder="42" />
              </Field>
              <Field label="Número interior" error={errors.numInt}>
                <input value={form.numInt} onChange={set('numInt')} placeholder="3B (opcional)" />
              </Field>
            </div>
            <div className="ch-grid-2">
              <Field label="Colonia / Alcaldía" required error={errors.colonia}>
                <select value={form.colonia} onChange={set('colonia')}>
                  <option value="">Seleccionar…</option>
                  {COLONIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Código postal" required error={errors.cp}>
                <input value={form.cp} onChange={set('cp')} placeholder="06600" maxLength={5} type="number" />
              </Field>
            </div>
            <Field label="Referencias">
              <input value={form.referencias} onChange={set('referencias')} placeholder="Entre calles, color de fachada…" />
            </Field>
            <div className="ch-cdmx-notice">📍 Solo realizamos entregas en CDMX por ahora.</div>
          </section>

          {/* ── PASO 3: Pago ── */}
          <section className="ch-section">
            <h2 className="ch-section-title"><span className="ch-step">3</span> Forma de pago</h2>

            <div className="ch-pago-grid">
              {/* Tarjeta guardada only if has cards */}
              {profile.cards.length > 0 && (
                <label className={`ch-pago-opt${form.formaPago === 'tarjeta-guardada' ? ' ch-pago-opt--active' : ''}`}>
                  <input type="radio" name="fp" value="tarjeta-guardada" checked={form.formaPago === 'tarjeta-guardada'} onChange={set('formaPago')} className="ch-radio" />
                  <span>💳</span>
                  <span className="ch-pago-label">Tarjeta guardada</span>
                </label>
              )}
              {FORMAS_PAGO.filter((fp) => fp.id !== 'tarjeta-guardada').map((fp) => (
                <label key={fp.id} className={`ch-pago-opt${form.formaPago === fp.id ? ' ch-pago-opt--active' : ''}`}>
                  <input type="radio" name="fp" value={fp.id} checked={form.formaPago === fp.id} onChange={set('formaPago')} className="ch-radio" />
                  <span>{fp.icon}</span>
                  <span className="ch-pago-label">{fp.label}</span>
                </label>
              ))}
            </div>

            {/* Saved card preview */}
            {form.formaPago === 'tarjeta-guardada' && selectedCard && (
              <div className="ch-saved-card-preview">
                <div className={`card-preview card-preview--${selectedCard.brand.toLowerCase()}`} style={{ padding:'1.1rem 1.5rem', minHeight:'auto' }}>
                  <div className="cp-top"><span className="cp-brand">💳 {selectedCard.brand}</span><span className="cp-chip">▬▬</span></div>
                  <div className="cp-number">···· ···· ···· {selectedCard.last4}</div>
                  <div className="cp-bottom">
                    <div><span className="cp-lbl">Alias</span><span className="cp-val">{selectedCard.alias}</span></div>
                    <div><span className="cp-lbl">Vence</span><span className="cp-val">{selectedCard.expiry}</span></div>
                  </div>
                </div>
                {profile.cards.length > 1 && (
                  <Field label="Cambiar tarjeta">
                    <select onChange={() => {/* selección manejada por isPrimary */}}>
                      {profile.cards.map((c) => <option key={c.id} value={c.id}>{c.alias} ···· {c.last4}</option>)}
                    </select>
                  </Field>
                )}
              </div>
            )}

            {/* New card form - shown by default when no saved cards */}
            {form.formaPago === 'tarjeta-nueva' && (
              <div className="ch-card-sim-wrap">
                <CardSimulator value={cardData} onChange={setCardData} errors={cardErrors} />
              </div>
            )}

            {form.formaPago === 'transferencia' && (
              <div className="ch-pago-detail">📋 Compartiremos los datos bancarios por WhatsApp una vez confirmado el pedido.</div>
            )}
            {form.formaPago === 'efectivo' && (
              <div className="ch-pago-detail">💵 Ten el monto exacto listo al momento de la entrega.</div>
            )}
          </section>

        </div>

        {/* ── Resumen ── */}
        <aside className="ch-summary">
          <h2 className="ch-sum-title">Resumen del pedido</h2>
          <div className="ch-sum-items">
            {cartItems.map((item) => (
              <div key={item.id} className="ch-sum-item">
                <span className="ch-sum-emoji">{item.emoji || '🐾'}</span>
                <div className="ch-sum-item-info">
                  <p className="ch-sum-item-name">{item.title}</p>
                  <p className="ch-sum-item-qty">× {item.quantity}</p>
                </div>
                <span className="ch-sum-item-price">${(item.price * item.quantity).toLocaleString('es-MX')}</span>
              </div>
            ))}
          </div>
          <div className="ch-sum-divider" />
          <div className="ch-sum-lines">
            <div className="ch-sum-line"><span>Subtotal</span><span>${totalPrice.toLocaleString('es-MX')} MXN</span></div>
            <div className="ch-sum-line">
              <span>Envío</span>
              <span className={envio === 0 ? 'ch-free' : ''}>{envio === 0 ? '¡Gratis! 🎉' : `$${envio} MXN`}</span>
            </div>
            {envio > 0 && <p className="ch-envio-hint">Agrega ${(700 - totalPrice).toLocaleString('es-MX')} MXN más para envío gratis</p>}
          </div>
          <div className="ch-sum-divider" />
          <div className="ch-sum-total"><span>Total</span><span>${total.toLocaleString('es-MX')} MXN</span></div>
          <button className="ch-confirm-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="ch-loading">Procesando<span className="ch-dots">…</span></span> : '✓ Confirmar pedido'}
          </button>
          <p className="ch-legal">
            Al confirmar aceptas nuestros{' '}
            <Link to="/terminos">Términos</Link> y{' '}
            <Link to="/aviso-privacidad">Aviso de privacidad</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;