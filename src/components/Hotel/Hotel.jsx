import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';
import Loader from '../Loader/Loader';
import './Hotel.css';

const SUITES = [
  {
    id: 'suite-basica',
    nombre: 'Suite Básica',
    emoji: '🏠',
    descripcion: 'Cama cómoda, paseo diario, alimentación incluida y cámara en vivo.',
    precioPorNoche: 320,
    capacidad: 'Hasta 15 kg',
    incluye: ['Cama ortopédica', 'Paseo 2x día', 'Alimentación', 'Cámara en vivo'],
  },
  {
    id: 'suite-premium',
    nombre: 'Suite Premium',
    emoji: '⭐',
    descripcion: 'Suite amplia con área de juego, baño incluido y reporte fotográfico diario.',
    precioPorNoche: 550,
    capacidad: 'Cualquier tamaño',
    incluye: ['Todo lo básico', 'Área de juego privada', 'Baño & perfume', 'Reporte fotográfico', 'Snacks premium'],
  },
  {
    id: 'suite-gatos',
    nombre: 'Suite Gatuna',
    emoji: '🐱',
    descripcion: 'Espacio exclusivo para gatos con rascador, zona alta y enriquecimiento ambiental.',
    precioPorNoche: 280,
    capacidad: 'Gatos',
    incluye: ['Rascador', 'Zona de altura', 'Juguetes interactivos', 'Arena premium', 'Cámara en vivo'],
  },
];

const INITIAL = {
  nombreDueno: '',
  telefono: '',
  email: '',
  nombreMascota: '',
  especie: 'perro',
  raza: '',
  peso: '',
  suite: '',
  checkIn: '',
  checkOut: '',
  alimentacionPropia: 'no',
  medicacion: '',
  notas: '',
};

const calcNoche = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const Hotel = () => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [reservaId, setReservaId] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const suiteSeleccionada = SUITES.find((s) => s.id === form.suite);
  const noches = calcNoche(form.checkIn, form.checkOut);
  const total = suiteSeleccionada ? suiteSeleccionada.precioPorNoche * noches : 0;

  const validate = () => {
    const errs = {};
    if (!form.nombreDueno.trim()) errs.nombreDueno = 'Requerido';
    if (!form.telefono.trim()) errs.telefono = 'Requerido';
    if (!form.email.trim()) errs.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (!form.nombreMascota.trim()) errs.nombreMascota = 'Requerido';
    if (!form.suite) errs.suite = 'Seleccioná una suite';
    if (!form.checkIn) errs.checkIn = 'Seleccioná fecha de ingreso';
    if (!form.checkOut) errs.checkOut = 'Seleccioná fecha de salida';
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) errs.checkOut = 'La salida debe ser posterior al ingreso';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const reserva = {
        dueno: { nombre: form.nombreDueno, telefono: form.telefono, email: form.email },
        mascota: { nombre: form.nombreMascota, especie: form.especie, raza: form.raza, peso: form.peso },
        suite: { id: form.suite, nombre: suiteSeleccionada.nombre, precioPorNoche: suiteSeleccionada.precioPorNoche },
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        noches,
        total,
        alimentacionPropia: form.alimentacionPropia === 'si',
        medicacion: form.medicacion,
        notas: form.notas,
        estado: 'confirmada',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'estancias'), reserva);
      setReservaId(docRef.id);
      toast.success('¡Reserva confirmada!');
    } catch (err) {
      console.error(err);
      toast.error('Error al reservar. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (reservaId) {
    return (
      <div className="cita-success">
        <div className="success-icon">🏨</div>
        <span className="tag">Reserva confirmada</span>
        <h1>¡Reserva realizada!</h1>
        <p><strong>{form.nombreMascota}</strong> tendrá su lugar en la <strong>{suiteSeleccionada?.nombre}</strong> del <strong>{form.checkIn}</strong> al <strong>{form.checkOut}</strong> ({noches} {noches === 1 ? 'noche' : 'noches'}).</p>
        <div className="cita-id-box">
          <span className="cita-id-label">Número de reserva</span>
          <code className="cita-id-code">{reservaId}</code>
        </div>
        <div className="reserva-total-box">
          <span>Total estimado</span>
          <span className="reserva-total">${total.toLocaleString('es-MX')} MXN</span>
        </div>
        <p className="success-note">Confirmación enviada a <strong>{form.email}</strong>. El pago se realiza al momento del check-in.</p>
        <button className="btn-primary" onClick={() => { setForm(INITIAL); setReservaId(null); }}>
          Nueva reserva
        </button>
      </div>
    );
  }

  return (
    <section className="hotel-page">
      <div className="section-header">
        <h1>Hotel Manada</h1>
        <p>Tu mascota merece unas vacaciones de lujo. Cuidado 24/7, cámara en vivo y reportes diarios.</p>
      </div>

      <div className="citas-layout">
        <form onSubmit={handleSubmit} noValidate className="citas-form">

          {/* Datos dueño */}
          <div className="form-section">
            <h3 className="form-section-title">👤 Tus datos</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input name="nombreDueno" value={form.nombreDueno} onChange={handleChange} placeholder="María López" className={errors.nombreDueno ? 'input-error' : ''} />
                {errors.nombreDueno && <span className="field-error">{errors.nombreDueno}</span>}
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} placeholder="+52 55 0000 0000" className={errors.telefono ? 'input-error' : ''} />
                {errors.telefono && <span className="field-error">{errors.telefono}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" className={errors.email ? 'input-error' : ''} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          {/* Mascota */}
          <div className="form-section">
            <h3 className="form-section-title">🐾 Tu mascota</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombreMascota" value={form.nombreMascota} onChange={handleChange} placeholder="Max" className={errors.nombreMascota ? 'input-error' : ''} />
                {errors.nombreMascota && <span className="field-error">{errors.nombreMascota}</span>}
              </div>
              <div className="form-group">
                <label>Especie</label>
                <select name="especie" value={form.especie} onChange={handleChange}>
                  <option value="perro">🐶 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Raza</label>
                <input name="raza" value={form.raza} onChange={handleChange} placeholder="Labrador" />
              </div>
              <div className="form-group">
                <label>Peso (kg)</label>
                <input name="peso" type="number" value={form.peso} onChange={handleChange} placeholder="25" min="0" max="80" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>¿Trae su propia comida?</label>
                <select name="alimentacionPropia" value={form.alimentacionPropia} onChange={handleChange}>
                  <option value="no">No, usar la de Manada</option>
                  <option value="si">Sí, traigo la mía</option>
                </select>
              </div>
              <div className="form-group">
                <label>Medicación (si aplica)</label>
                <input name="medicacion" value={form.medicacion} onChange={handleChange} placeholder="Ej: Pastilla X, 1 vez al día" />
              </div>
            </div>
          </div>

          {/* Suite */}
          <div className="form-section">
            <h3 className="form-section-title">🏨 Elegí tu suite</h3>
            {errors.suite && <span className="field-error">{errors.suite}</span>}
            <div className="suites-grid">
              {SUITES.map((s) => (
                <label key={s.id} className={`suite-card ${form.suite === s.id ? 'selected' : ''}`}>
                  <input type="radio" name="suite" value={s.id} checked={form.suite === s.id} onChange={handleChange} hidden />
                  <div className="suite-header">
                    <span className="suite-emoji">{s.emoji}</span>
                    <div>
                      <p className="suite-nombre">{s.nombre}</p>
                      <p className="suite-capacidad">{s.capacidad}</p>
                    </div>
                    <p className="suite-precio">${s.precioPorNoche.toLocaleString('es-MX')}<span>/noche</span></p>
                  </div>
                  <p className="suite-desc">{s.descripcion}</p>
                  <ul className="suite-incluye">
                    {s.incluye.map((item) => <li key={item}>✓ {item}</li>)}
                  </ul>
                </label>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="form-section">
            <h3 className="form-section-title">📅 Fechas de estancia</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Check-in</label>
                <input name="checkIn" type="date" value={form.checkIn} onChange={handleChange} min={today} className={errors.checkIn ? 'input-error' : ''} />
                {errors.checkIn && <span className="field-error">{errors.checkIn}</span>}
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input name="checkOut" type="date" value={form.checkOut} onChange={handleChange} min={form.checkIn || today} className={errors.checkOut ? 'input-error' : ''} />
                {errors.checkOut && <span className="field-error">{errors.checkOut}</span>}
              </div>
            </div>
            {noches > 0 && suiteSeleccionada && (
              <div className="noches-resumen">
                <span>🌙 {noches} {noches === 1 ? 'noche' : 'noches'} × ${suiteSeleccionada.precioPorNoche.toLocaleString('es-MX')}</span>
                <span className="noches-total">${total.toLocaleString('es-MX')} MXN</span>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="form-section">
            <h3 className="form-section-title">📝 Notas</h3>
            <div className="form-group">
              <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Comportamiento especial, miedos, rutinas importantes..." rows={3} />
            </div>
          </div>

          <button type="submit" className="btn-primary citas-submit" disabled={loading}>
            {loading ? 'Reservando...' : 'Confirmar reserva →'}
          </button>
        </form>

        <aside className="citas-sidebar">
          <div className="sidebar-card">
            <h4>🏨 Incluido en todas las suites</h4>
            <ul className="sidebar-steps">
              <li><span className="step-num">✓</span>Cámara en vivo 24/7</li>
              <li><span className="step-num">✓</span>Personal especializado</li>
              <li><span className="step-num">✓</span>Atención veterinaria de emergencia</li>
              <li><span className="step-num">✓</span>Reporte diario por WhatsApp</li>
              <li><span className="step-num">✓</span>Zona de ejercicio</li>
            </ul>
          </div>

          {suiteSeleccionada && noches > 0 && (
            <div className="sidebar-card resumen">
              <h4>Resumen de reserva</h4>
              <div className="resumen-line"><span>{suiteSeleccionada.nombre}</span><span className="resumen-precio">${suiteSeleccionada.precioPorNoche.toLocaleString('es-MX')}/noche</span></div>
              <div className="resumen-line"><span>Noches</span><span>{noches}</span></div>
              {form.nombreMascota && <div className="resumen-line"><span>🐾 Mascota</span><span>{form.nombreMascota}</span></div>}
              <div className="resumen-line total-line"><span>Total</span><span className="resumen-precio">${total.toLocaleString('es-MX')} MXN</span></div>
              <p className="pago-nota">💳 El pago se realiza al check-in</p>
            </div>
          )}

          <div className="sidebar-card info-card">
            <h4>⏰ Horarios</h4>
            <p>Check-in: 8am – 12pm<br />Check-out: 8am – 11am<br />Visitas: 4pm – 6pm</p>
          </div>
        </aside>
      </div>

      {loading && <Loader text="Confirmando reserva..." />}
    </section>
  );
};

export default Hotel;