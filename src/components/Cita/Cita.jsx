import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';
import Loader from '../Loader/Loader';
import './Cita.css';

const SERVICIOS = [
  { id: 'bano-corte', label: '✂️ Baño & Corte', duracion: '2 horas', precio: 280 },
  { id: 'spa-completo', label: '🛁 Spa Completo', duracion: '3 horas', precio: 480 },
  { id: 'consulta-nutricional', label: '🥗 Consulta Nutricional', duracion: '1 hora', precio: 350 },
  { id: 'entrenamiento', label: '🎓 Sesión de Entrenamiento', duracion: '1 hora', precio: 400 },
  { id: 'masaje-terapeutico', label: '💆 Masaje Terapéutico', duracion: '45 min', precio: 320 },
  { id: 'fotografia', label: '📸 Sesión Fotográfica', duracion: '1 hora', precio: 550 },
];

const HORARIOS = ['9:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];

const INITIAL = {
  nombreDueno: '',
  telefono: '',
  email: '',
  nombreMascota: '',
  especie: 'perro',
  raza: '',
  peso: '',
  servicio: '',
  fecha: '',
  hora: '',
  notas: '',
};

const Citas = () => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [citaId, setCitaId] = useState(null);

  const servicioSeleccionado = SERVICIOS.find((s) => s.id === form.servicio);

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const errs = {};
    if (!form.nombreDueno.trim()) errs.nombreDueno = 'Requerido';
    if (!form.telefono.trim()) errs.telefono = 'Requerido';
    if (!form.email.trim()) errs.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (!form.nombreMascota.trim()) errs.nombreMascota = 'Requerido';
    if (!form.raza.trim()) errs.raza = 'Requerido';
    if (!form.servicio) errs.servicio = 'Seleccioná un servicio';
    if (!form.fecha) errs.fecha = 'Seleccioná una fecha';
    if (!form.hora) errs.hora = 'Seleccioná un horario';
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
      const cita = {
        dueno: { nombre: form.nombreDueno, telefono: form.telefono, email: form.email },
        mascota: { nombre: form.nombreMascota, especie: form.especie, raza: form.raza, peso: form.peso },
        servicio: { id: form.servicio, nombre: servicioSeleccionado.label, precio: servicioSeleccionado.precio },
        fecha: form.fecha,
        hora: form.hora,
        notas: form.notas,
        estado: 'confirmada',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'citas'), cita);
      setCitaId(docRef.id);
      toast.success('¡Cita agendada con éxito!');
    } catch (err) {
      console.error(err);
      toast.error('Error al agendar. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (citaId) {
    return (
      <div className="cita-success">
        <div className="success-icon">✓</div>
        <span className="tag">Cita confirmada</span>
        <h1>¡Tu cita está agendada!</h1>
        <p>Nos vemos el <strong>{form.fecha}</strong> a las <strong>{form.hora}</strong> hs para el servicio de <strong>{servicioSeleccionado?.label}</strong>.</p>
        <div className="cita-id-box">
          <span className="cita-id-label">Número de cita</span>
          <code className="cita-id-code">{citaId}</code>
        </div>
        <p className="success-note">Te enviamos la confirmación a <strong>{form.email}</strong>. Recordá llegar 10 minutos antes.</p>
        <button className="btn-primary" onClick={() => { setForm(INITIAL); setCitaId(null); }}>
          Agendar otra cita
        </button>
      </div>
    );
  }

  return (
    <section className="citas-page">
      <div className="section-header">
        <h1>Agendar cita</h1>
        <p>Reservá el servicio que más le gusta a tu mascota. Confirmación inmediata.</p>
      </div>

      <div className="citas-layout">
        <form onSubmit={handleSubmit} noValidate className="citas-form">

          {/* Datos del dueño */}
          <div className="form-section">
            <h3 className="form-section-title">👤 Tus datos</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input name="nombreDueno" value={form.nombreDueno} onChange={handleChange} placeholder="Juan García" className={errors.nombreDueno ? 'input-error' : ''} />
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

          {/* Datos de la mascota */}
          <div className="form-section">
            <h3 className="form-section-title">🐾 Tu mascota</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la mascota</label>
                <input name="nombreMascota" value={form.nombreMascota} onChange={handleChange} placeholder="Luna" className={errors.nombreMascota ? 'input-error' : ''} />
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
                <input name="raza" value={form.raza} onChange={handleChange} placeholder="Golden Retriever" className={errors.raza ? 'input-error' : ''} />
                {errors.raza && <span className="field-error">{errors.raza}</span>}
              </div>
              <div className="form-group">
                <label>Peso aproximado (kg)</label>
                <input name="peso" type="number" value={form.peso} onChange={handleChange} placeholder="12" min="0" max="80" />
              </div>
            </div>
          </div>

          {/* Selección de servicio */}
          <div className="form-section">
            <h3 className="form-section-title">✨ Servicio</h3>
            {errors.servicio && <span className="field-error">{errors.servicio}</span>}
            <div className="servicios-grid">
              {SERVICIOS.map((s) => (
                <label key={s.id} className={`servicio-card ${form.servicio === s.id ? 'selected' : ''}`}>
                  <input type="radio" name="servicio" value={s.id} checked={form.servicio === s.id} onChange={handleChange} hidden />
                  <span className="servicio-nombre">{s.label}</span>
                  <span className="servicio-duracion">⏱ {s.duracion}</span>
                  <span className="servicio-precio">${s.precio.toLocaleString('es-MX')} MXN</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="form-section">
            <h3 className="form-section-title">📅 Fecha y horario</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha</label>
                <input name="fecha" type="date" value={form.fecha} onChange={handleChange} min={today} className={errors.fecha ? 'input-error' : ''} />
                {errors.fecha && <span className="field-error">{errors.fecha}</span>}
              </div>
            </div>
            {form.fecha && (
              <div className="horarios-grid">
                {HORARIOS.map((h) => (
                  <label key={h} className={`horario-btn ${form.hora === h ? 'selected' : ''}`}>
                    <input type="radio" name="hora" value={h} checked={form.hora === h} onChange={handleChange} hidden />
                    {h}
                  </label>
                ))}
              </div>
            )}
            {errors.hora && <span className="field-error">{errors.hora}</span>}
          </div>

          {/* Notas */}
          <div className="form-section">
            <h3 className="form-section-title">📝 Notas adicionales</h3>
            <div className="form-group">
              <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Alergias, comportamiento especial, indicaciones del veterinario..." rows={3} />
            </div>
          </div>

          <button type="submit" className="btn-primary citas-submit" disabled={loading}>
            {loading ? 'Agendando...' : 'Confirmar cita →'}
          </button>
        </form>

        {/* Sidebar info */}
        <aside className="citas-sidebar">
          <div className="sidebar-card">
            <h4>¿Cómo funciona?</h4>
            <ol className="sidebar-steps">
              <li><span className="step-num">1</span>Completá el formulario con los datos de tu mascota</li>
              <li><span className="step-num">2</span>Elegí el servicio y el horario disponible</li>
              <li><span className="step-num">3</span>Recibís confirmación inmediata por email</li>
              <li><span className="step-num">4</span>Presentate 10 minutos antes de tu cita</li>
            </ol>
          </div>

          {servicioSeleccionado && (
            <div className="sidebar-card resumen">
              <h4>Resumen</h4>
              <div className="resumen-line">
                <span>{servicioSeleccionado.label}</span>
                <span className="resumen-precio">${servicioSeleccionado.precio.toLocaleString('es-MX')} MXN</span>
              </div>
              {form.fecha && <div className="resumen-line"><span>📅 Fecha</span><span>{form.fecha}</span></div>}
              {form.hora && <div className="resumen-line"><span>⏰ Hora</span><span>{form.hora} hs</span></div>}
              {form.nombreMascota && <div className="resumen-line"><span>🐾 Mascota</span><span>{form.nombreMascota}</span></div>}
            </div>
          )}

          <div className="sidebar-card info-card">
            <h4>📍 Dónde encontrarnos</h4>
            <p>Condesa, CDMX<br />Lun–Sáb 9am–7pm</p>
            <p className="sidebar-phone">📞 +52 55 1234 5678</p>
          </div>
        </aside>
      </div>

      {loading && <Loader text="Agendando tu cita..." />}
    </section>
  );
};

export default Citas;