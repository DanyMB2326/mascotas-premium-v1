import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, writeBatch, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';
import { useCart } from '../../context/CartContext';
import Loader from '../Loader/Loader';
import './CheckOutForm.css';

const METODOS_PAGO = [
  { id: 'tarjeta', label: '💳 Tarjeta de crédito / débito', desc: 'Visa, Mastercard, American Express' },
  { id: 'transferencia', label: '🏦 Transferencia bancaria', desc: 'SPEI / CoDi — datos al confirmar' },
  { id: 'oxxo', label: '🏪 Pago en OXXO', desc: 'Referencia generada al confirmar' },
  { id: 'efectivo', label: '💵 Efectivo al recibir', desc: 'Solo para envíos en CDMX' },
];

const INITIAL_FORM = { name: '', lastName: '', email: '', emailConfirm: '', phone: '', calle: '', colonia: '', ciudad: 'CDMX', cp: '', metodoPago: '' };
const INITIAL_CARD = { numero: '', nombre: '', vencimiento: '', cvv: '' };

const CheckoutForm = () => {
  const { cartItems, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState(INITIAL_FORM);
  const [card, setCard] = useState(INITIAL_CARD);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState(1); // 1: datos, 2: pago, 3: confirmado

  const envio = totalPrice >= 800 ? 0 : 99;
  const totalFinal = totalPrice + envio;

  if (cartItems.length === 0 && !orderId) {
    return (
      <div className="state-container">
        <span className="state-icon">🛒</span>
        <h2>Tu carrito está vacío</h2>
        <p>Agregá productos antes de continuar con la compra.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '0.5rem' }}>Explorar productos</Link>
      </div>
    );
  }

  if (orderId) {
    const metodo = METODOS_PAGO.find((m) => m.id === form.metodoPago);
    return (
      <div className="order-success">
        <div className="success-icon">🎉</div>
        <span className="tag">Pedido confirmado</span>
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido fue registrado. Te contactaremos a <strong>{form.email}</strong> con los detalles.</p>

        <div className="order-detail-grid">
          <div className="order-detail-card">
            <h4>🆔 Número de orden</h4>
            <code className="order-code">{orderId}</code>
          </div>
          <div className="order-detail-card">
            <h4>💳 Método de pago</h4>
            <p>{metodo?.label}</p>
            {form.metodoPago === 'transferencia' && (
              <div className="pago-instrucciones">
                <p><strong>CLABE:</strong> 012 345 678 901 234 567</p>
                <p><strong>Banco:</strong> Manada SAPI de CV</p>
                <p><strong>Concepto:</strong> {orderId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}
            {form.metodoPago === 'oxxo' && (
              <div className="pago-instrucciones">
                <p><strong>Referencia OXXO:</strong></p>
                <code className="oxxo-ref">{Math.random().toString().slice(2, 20)}</code>
                <p className="pago-nota">Válida por 48 horas</p>
              </div>
            )}
          </div>
        </div>

        <div className="order-total-box">
          <span>Total pagado</span>
          <span className="order-total-value">${totalFinal.toLocaleString('es-MX')} MXN</span>
        </div>
        <Link to="/" className="btn-primary">Seguir comprando</Link>
      </div>
    );
  }

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Requerido';
    if (!form.lastName.trim()) errs.lastName = 'Requerido';
    if (!form.email.trim()) errs.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (form.email !== form.emailConfirm) errs.emailConfirm = 'Los emails no coinciden';
    if (!form.phone.trim()) errs.phone = 'Requerido';
    if (!form.calle.trim()) errs.calle = 'Requerido';
    if (!form.colonia.trim()) errs.colonia = 'Requerido';
    if (!form.cp.trim()) errs.cp = 'Requerido';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.metodoPago) errs.metodoPago = 'Seleccioná un método de pago';
    if (form.metodoPago === 'tarjeta') {
      if (!card.numero.trim() || card.numero.replace(/\s/g,'').length < 16) errs.cardNumero = 'Número inválido';
      if (!card.nombre.trim()) errs.cardNombre = 'Requerido';
      if (!card.vencimiento.trim()) errs.cardVencimiento = 'Requerido';
      if (!card.cvv.trim() || card.cvv.length < 3) errs.cardCvv = 'CVV inválido';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'numero') v = value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
    if (name === 'cvv') v = value.replace(/\D/g,'').slice(0,4);
    if (name === 'vencimiento') {
      v = value.replace(/\D/g,'').slice(0,4);
      if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    }
    setCard((prev) => ({ ...prev, [name]: v }));
    if (errors[`card${name.charAt(0).toUpperCase()+name.slice(1)}`]) setErrors((prev) => ({ ...prev, [`card${name.charAt(0).toUpperCase()+name.slice(1)}`]: '' }));
  };

  const goToStep2 = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const outOfStock = [];

      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) { outOfStock.push(item.title); continue; }
        const currentStock = productSnap.data().stock;
        if (currentStock < item.quantity) {
          outOfStock.push(`${item.title} (stock: ${currentStock})`);
        } else {
          batch.update(productRef, { stock: currentStock - item.quantity });
        }
      }

      if (outOfStock.length > 0) {
        toast.error(`Stock insuficiente: ${outOfStock.join(', ')}`);
        setLoading(false);
        return;
      }

      const order = {
        buyer: { name: `${form.name} ${form.lastName}`, email: form.email, phone: form.phone },
        direccion: { calle: form.calle, colonia: form.colonia, ciudad: form.ciudad, cp: form.cp },
        items: cartItems.map(({ id, title, price, quantity }) => ({ id, title, price, quantity })),
        subtotal: totalPrice,
        envio,
        total: totalFinal,
        metodoPago: form.metodoPago,
        estado: form.metodoPago === 'tarjeta' ? 'pagado' : 'pendiente_pago',
        date: serverTimestamp(),
      };

      const orderDoc = await addDoc(collection(db, 'orders'), order);
      await batch.commit();
      setOrderId(orderDoc.id);
      clearCart();
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la orden. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="checkout-page">
      {/* Progress steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
          <span className="step-circle">{step > 1 ? '✓' : '1'}</span>
          <span>Datos y envío</span>
        </div>
        <div className="step-line" />
        <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-circle">2</span>
          <span>Pago</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form-wrap">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="citas-form">
              <div className="form-section">
                <h3 className="form-section-title">👤 Datos personales</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="María" className={errors.name ? 'input-error' : ''} />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="García" className={errors.lastName ? 'input-error' : ''} />
                    {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+52 55 0000 0000" className={errors.phone ? 'input-error' : ''} />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" className={errors.email ? 'input-error' : ''} />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Confirmar email</label>
                  <input name="emailConfirm" type="email" value={form.emailConfirm} onChange={handleChange} placeholder="tu@email.com" className={errors.emailConfirm ? 'input-error' : ''} />
                  {errors.emailConfirm && <span className="field-error">{errors.emailConfirm}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">📍 Dirección de envío</h3>
                <div className="form-group">
                  <label>Calle y número</label>
                  <input name="calle" value={form.calle} onChange={handleChange} placeholder="Av. Amsterdam 123, Depto 4" className={errors.calle ? 'input-error' : ''} />
                  {errors.calle && <span className="field-error">{errors.calle}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Colonia</label>
                    <input name="colonia" value={form.colonia} onChange={handleChange} placeholder="Condesa" className={errors.colonia ? 'input-error' : ''} />
                    {errors.colonia && <span className="field-error">{errors.colonia}</span>}
                  </div>
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input name="ciudad" value={form.ciudad} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group" style={{ maxWidth: '160px' }}>
                  <label>Código postal</label>
                  <input name="cp" value={form.cp} onChange={handleChange} placeholder="06600" maxLength={5} className={errors.cp ? 'input-error' : ''} />
                  {errors.cp && <span className="field-error">{errors.cp}</span>}
                </div>
              </div>

              <button type="button" className="btn-primary citas-submit" onClick={goToStep2}>
                Continuar al pago →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className="citas-form">
              <div className="form-section">
                <h3 className="form-section-title">💳 Método de pago</h3>
                {errors.metodoPago && <span className="field-error">{errors.metodoPago}</span>}
                <div className="metodos-grid">
                  {METODOS_PAGO.map((m) => (
                    <label key={m.id} className={`metodo-card ${form.metodoPago === m.id ? 'selected' : ''}`}>
                      <input type="radio" name="metodoPago" value={m.id} checked={form.metodoPago === m.id} onChange={handleChange} hidden />
                      <div>
                        <p className="metodo-label">{m.label}</p>
                        <p className="metodo-desc">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {form.metodoPago === 'tarjeta' && (
                <div className="form-section">
                  <h3 className="form-section-title">💳 Datos de la tarjeta</h3>
                  <div className="card-visual">
                    <div className="card-chip">▪▪▪</div>
                    <p className="card-number-display">{card.numero || '•••• •••• •••• ••••'}</p>
                    <div className="card-bottom">
                      <span>{card.nombre || 'NOMBRE APELLIDO'}</span>
                      <span>{card.vencimiento || 'MM/AA'}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Número de tarjeta</label>
                    <input name="numero" value={card.numero} onChange={handleCardChange} placeholder="1234 5678 9012 3456" maxLength={19} className={errors.cardNumero ? 'input-error' : ''} />
                    {errors.cardNumero && <span className="field-error">{errors.cardNumero}</span>}
                  </div>
                  <div className="form-group">
                    <label>Nombre en la tarjeta</label>
                    <input name="nombre" value={card.nombre} onChange={handleCardChange} placeholder="MARÍA GARCÍA" className={errors.cardNombre ? 'input-error' : ''} style={{ textTransform: 'uppercase' }} />
                    {errors.cardNombre && <span className="field-error">{errors.cardNombre}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Vencimiento</label>
                      <input name="vencimiento" value={card.vencimiento} onChange={handleCardChange} placeholder="MM/AA" maxLength={5} className={errors.cardVencimiento ? 'input-error' : ''} />
                      {errors.cardVencimiento && <span className="field-error">{errors.cardVencimiento}</span>}
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input name="cvv" value={card.cvv} onChange={handleCardChange} placeholder="123" maxLength={4} type="password" className={errors.cardCvv ? 'input-error' : ''} />
                      {errors.cardCvv && <span className="field-error">{errors.cardCvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="checkout-actions">
                <button type="button" className="btn-outline" onClick={() => setStep(1)}>← Volver</button>
                <button type="submit" className="btn-primary citas-submit" disabled={loading}>
                  {loading ? 'Procesando...' : `Pagar $${totalFinal.toLocaleString('es-MX')} MXN →`}
                </button>
              </div>
            </form>
          )}

          {loading && <Loader text="Procesando tu orden..." />}
        </div>

        {/* Order summary */}
        <aside className="checkout-summary-panel">
          <h3 className="summary-panel-title">Tu pedido</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.title} className="summary-item-img" />
                <div className="summary-item-info">
                  <p className="summary-item-name">{item.title}</p>
                  <p className="summary-item-qty">× {item.quantity}</p>
                </div>
                <span className="summary-item-price">${(item.price * item.quantity).toLocaleString('es-MX')}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-calc">
            <div className="summary-line-row"><span>Subtotal</span><span>${totalPrice.toLocaleString('es-MX')}</span></div>
            <div className="summary-line-row">
              <span>Envío</span>
              <span className={envio === 0 ? 'envio-gratis' : ''}>{envio === 0 ? '¡Gratis!' : `$${envio}`}</span>
            </div>
            {envio > 0 && <p className="envio-hint">Envío gratis en compras +$800 MXN</p>}
          </div>
          <div className="summary-divider" />
          <div className="summary-total-row">
            <span>Total</span>
            <span className="summary-total-value">${totalFinal.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="summary-seguridad">
            🔒 Compra 100% segura · Datos encriptados
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CheckoutForm;
