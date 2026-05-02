import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';
import { SERVICES, findService } from '../../data/services';
import { useAuth } from '../../context/AuthContext';
import useMascotas from '../../hooks/useMascotas';
import Loader from '../Loader/Loader';
import './Reservar.css';

const HORARIOS = ['9:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];

const isSubscriptionService = (svc) => svc?.id === 'paquetes';
const isOvernightService    = (svc) => svc?.id === 'pension';

const buildEmptyForm = () => ({
  // dueño
  nombreDueno: '',
  telefono: '',
  email: '',
  direccion: '',
  // mascota
  mascotaId: 'manual',
  nombreMascota: '',
  especie: 'perro',
  raza: '',
  peso: '',
  edad: '',
  alergias: '',
  medicacion: '',
  // reserva
  fecha: '',
  hora: '',
  fechaFin: '',
  notas: '',
});

const Reservar = () => {
  const { serviceId }  = useParams();
  const [params]       = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const { mascotas }   = useMascotas();

  const [selectedService, setSelectedService] = useState(serviceId || '');
  const [selectedOption,  setSelectedOption]  = useState(params.get('option') || '');
  const [form, setForm]       = useState(buildEmptyForm);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [reservaId, setReservaId] = useState(null);

  const service = useMemo(() => findService(selectedService), [selectedService]);
  const option  = useMemo(
    () => service?.options.find((o) => o.id === selectedOption) || null,
    [service, selectedOption],
  );

  const overnight    = isOvernightService(service);
  const subscription = isSubscriptionService(service);
  const today        = new Date().toISOString().split('T')[0];

  /* ── Prefill from authenticated user ── */
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      nombreDueno: prev.nombreDueno || user.displayName || '',
      email:       prev.email       || user.email || '',
    }));
  }, [user]);

/* ── Apply selected pet from saved list ── */
  useEffect(() => {
    if (form.mascotaId === 'manual' || !mascotas.length) return;
    const pet = mascotas.find((m) => (m.id || '') === form.mascotaId);
    if (!pet) return;
    setForm((prev) => ({
      ...prev,
      nombreMascota: pet.nombre || '',
      especie:       pet.especie || 'perro',
      raza:          pet.raza || '',
      peso:          pet.peso || '',
      edad:          pet.edad || '',
      alergias:      pet.alergias || '',
      medicacion:    pet.medicacion || '',
    }));
  }, [form.mascotaId, mascotas]);

  /* ── Reset option when service changes ── */
  useEffect(() => {
    if (!service) { setSelectedOption(''); return; }
    if (!service.options.find((o) => o.id === selectedOption)) {
      setSelectedOption('');
    }
  }, [service, selectedOption]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!selectedService) errs.servicio = 'Elegí un servicio';
    if (!selectedOption)  errs.opcion   = 'Elegí una opción';

    if (!form.nombreDueno.trim()) errs.nombreDueno = 'Requerido';
    if (!form.telefono.trim())    errs.telefono    = 'Requerido';
    if (!form.email.trim())       errs.email       = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';

    if (!form.nombreMascota.trim()) errs.nombreMascota = 'Requerido';
    if (!form.raza.trim())          errs.raza          = 'Requerido';

    if (!subscription) {
      if (!form.fecha) errs.fecha = 'Seleccioná la fecha';
    }
    if (overnight) {
      if (!form.fechaFin) errs.fechaFin = 'Seleccioná la fecha de salida';
      if (form.fecha && form.fechaFin && form.fechaFin <= form.fecha) {
        errs.fechaFin = 'Debe ser posterior al ingreso';
      }
    } else if (!subscription) {
      if (!form.hora) errs.hora = 'Seleccioná un horario';
    }

    return errs;
  };

  /* ── Total ── */
  const noches = (() => {
    if (!overnight || !form.fecha || !form.fechaFin) return 0;
    const diff = new Date(form.fechaFin) - new Date(form.fecha);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  })();
  const total = option ? (overnight ? option.precio * noches : option.precio) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Revisá los campos marcados.');
      return;
    }

    setLoading(true);
    try {
      const reserva = {
        userId: user?.uid || null,
        dueno: {
          nombre:    form.nombreDueno,
          telefono:  form.telefono,
          email:     form.email,
          direccion: form.direccion || null,
        },
        mascota: {
          id:         form.mascotaId === 'manual' ? null : form.mascotaId,
          nombre:     form.nombreMascota,
          especie:    form.especie,
          raza:       form.raza,
          peso:       form.peso,
          edad:       form.edad,
          alergias:   form.alergias,
          medicacion: form.medicacion,
        },
        servicio: {
          id:     service.id,
          nombre: service.nombre,
        },
        opcion: {
          id:     option.id,
          label:  option.label,
          precio: option.precio,
        },
        fecha:    form.fecha || null,
        fechaFin: form.fechaFin || null,
        hora:     form.hora || null,
        noches:   noches || null,
        total,
        notas:    form.notas || null,
        modalidad: subscription ? 'suscripcion' : (overnight ? 'estancia' : 'cita'),
        estado:   subscription ? 'pendiente-activacion' : 'confirmada',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'reservas'), reserva);
      setReservaId(docRef.id);
      toast.success('¡Reserva confirmada! 🐾');
    } catch (err) {
      console.error(err);
      toast.error('No pudimos registrar la reserva. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

/* ── SUCCESS VIEW ── */
  if (reservaId) {
    return (
      <div className="reservar-success">
        <div className="success-icon">✓</div>
        <span className="tag">{subscription ? 'Suscripción registrada' : 'Reserva confirmada'}</span>
        <h1>¡Listo!</h1>
        <p>
          {subscription ? (
            <>Tu plan <strong>{option?.label}</strong> queda registrado. Te contactamos por WhatsApp para activarlo.</>
          ) : overnight ? (
            <><strong>{form.nombreMascota}</strong> tendrá su lugar en <strong>{option?.label}</strong> del <strong>{form.fecha}</strong> al <strong>{form.fechaFin}</strong> ({noches} {noches === 1 ? 'noche' : 'noches'}).</>
          ) : (
            <>Reservamos <strong>{option?.label}</strong> para <strong>{form.nombreMascota}</strong> el <strong>{form.fecha}</strong> a las <strong>{form.hora}</strong>.</>
          )}
        </p>
        <div className="reservar-id-box">
          <span className="reservar-id-label">Número de reserva</span>
          <code className="reservar-id-code">{reservaId}</code>
        </div>
        <div className="reservar-total">
          <span>Total estimado</span>
          <strong>${total.toLocaleString('es-MX')} MXN</strong>
        </div>
        <p className="reservar-note">Te enviamos confirmación a <strong>{form.email}</strong>.</p>
        <div className="reservar-success-actions">
          <button className="btn-primary" onClick={() => { setReservaId(null); setForm(buildEmptyForm()); navigate('/'); }}>
            Volver al inicio
          </button>
          <button className="btn-outline" onClick={() => { setReservaId(null); setForm(buildEmptyForm()); }}>
            Otra reserva
          </button>
        </div>
      </div>
    );
  }

/* ── FORM VIEW ── */
  return (
    <section className="reservar-page">
      <div className="section-header">
        <span className="tag">Reservar</span>
        <h1>{service ? service.nombre : 'Reservá un servicio'}</h1>
        <p>{service ? service.short : 'Elegí el servicio, día y hora. Confirmamos al instante.'}</p>
      </div>

      {!user && (
        <div className="reservar-banner">
          <div>
            <strong>💡 Tip</strong>
            <p>Si <Link to="/login">iniciás sesión</Link> podés reutilizar los datos de tus mascotas guardadas.</p>
          </div>
          <Link to="/register" className="btn-outline">Crear cuenta</Link>
        </div>
      )}

      <div className="reservar-layout">
        <form onSubmit={handleSubmit} noValidate className="reservar-form">

          {/* SERVICIO */}
          <div className="form-section">
            <h3 className="form-section-title">✨ Servicio</h3>
            <div className="form-group">
              <label htmlFor="rs-servicio">Servicio</label>
              <select
                id="rs-servicio"
                value={selectedService}
                onChange={(e) => { setSelectedService(e.target.value); setErrors((p) => ({ ...p, servicio: '' })); }}
                className={errors.servicio ? 'input-error' : ''}
              >
                <option value="">— Elegí un servicio —</option>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>{s.emoji} {s.nombre}</option>
                ))}
              </select>
              {errors.servicio && <span className="field-error">{errors.servicio}</span>}
            </div>

            {service && (
              <>
                {errors.opcion && <span className="field-error">{errors.opcion}</span>}
                <div className="opciones-grid">
                  {service.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`opcion-card ${selectedOption === opt.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="opcion"
                        value={opt.id}
                        checked={selectedOption === opt.id}
                        onChange={() => setSelectedOption(opt.id)}
                        hidden
                      />
                      <span className="opcion-label">{opt.label}</span>
                      {opt.bullets && (
                        <ul className="opcion-bullets">
                          {opt.bullets.map((b) => <li key={b}>· {b}</li>)}
                        </ul>
                      )}
                      <span className="opcion-precio">
                        ${opt.precio.toLocaleString('es-MX')}
                        <em>{subscription ? ' /mes' : (overnight ? ' /noche' : ' MXN')}</em>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

 {/* MASCOTA */}
          <div className="form-section">
            <h3 className="form-section-title">🐾 Tu mascota</h3>

            {user && mascotas.length > 0 && (
              <div className="form-group">
                <label htmlFor="rs-pet">Usar mascota guardada</label>
                <select
                  id="rs-pet"
                  name="mascotaId"
                  value={form.mascotaId}
                  onChange={handleField}
                >
                  <option value="manual">— Cargar manualmente —</option>
                  {mascotas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.especie === 'gato' ? '🐱' : '🐶'} {m.nombre} · {m.raza}
                    </option>
                  ))}
                </select>
                <p className="form-hint">
                  ¿Falta alguna? <Link to="/mis-mascotas">Gestioná tus mascotas</Link>
                </p>
              </div>
            )}

              <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombreMascota"
                  value={form.nombreMascota}
                  onChange={handleField}
                  placeholder="Luna"
                  className={errors.nombreMascota ? 'input-error' : ''}
                />
                {errors.nombreMascota && <span className="field-error">{errors.nombreMascota}</span>}
              </div>
              <div className="form-group">
                <label>Especie</label>
                <select name="especie" value={form.especie} onChange={handleField}>
                  <option value="perro">🐶 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Raza</label>
                <input
                  name="raza"
                  value={form.raza}
                  onChange={handleField}
                  placeholder="Golden Retriever"
                  className={errors.raza ? 'input-error' : ''}
                />
                {errors.raza && <span className="field-error">{errors.raza}</span>}
              </div>
              <div className="form-group">
                <label>Peso (kg)</label>
                <input
                  name="peso"
                  type="number"
                  value={form.peso}
                  onChange={handleField}
                  placeholder="12"
                  min="0"
                  max="120"
                />
              </div>
            </div>       

            <div className="form-row">
              <div className="form-group">
                <label>Edad (años)</label>
                <input
                  name="edad"
                  type="number"
                  value={form.edad}
                  onChange={handleField}
                  placeholder="3"
                  min="0"
                  max="30"
                />
              </div>
              <div className="form-group">
                <label>Alergias / medicación</label>
                <input
                  name="alergias"
                  value={form.alergias}
                  onChange={handleField}
                  placeholder="Pollo, antibiótico X..."
                />
              </div>
            </div>
          </div>

          {/* DUEÑO */}
          <div className="form-section">
            <h3 className="form-section-title">👤 Tus datos</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  name="nombreDueno"
                  value={form.nombreDueno}
                  onChange={handleField}
                  placeholder="María García"
                  className={errors.nombreDueno ? 'input-error' : ''}
                />
                {errors.nombreDueno && <span className="field-error">{errors.nombreDueno}</span>}
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleField}
                  placeholder="+52 55 0000 0000"
                  className={errors.telefono ? 'input-error' : ''}
                />
                {errors.telefono && <span className="field-error">{errors.telefono}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleField}
                placeholder="tu@email.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            {service?.id === 'transporte' && (
              <div className="form-group">
                <label>Dirección de recolección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleField}
                  placeholder="Calle, número, colonia, alcaldía"
                />
              </div>
            )}
          </div>

          {/* FECHA */}
          {!subscription && (
            <div className="form-section">
              <h3 className="form-section-title">📅 {overnight ? 'Fechas de estancia' : 'Día y hora'}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{overnight ? 'Check-in' : 'Fecha'}</label>
                  <input
                    name="fecha"
                    type="date"
                    value={form.fecha}
                    onChange={handleField}
                    min={today}
                    className={errors.fecha ? 'input-error' : ''}
                  />
                  {errors.fecha && <span className="field-error">{errors.fecha}</span>}
                </div>
                {overnight ? (
                  <div className="form-group">
                    <label>Check-out</label>
                    <input
                      name="fechaFin"
                      type="date"
                      value={form.fechaFin}
                      onChange={handleField}
                      min={form.fecha || today}
                      className={errors.fechaFin ? 'input-error' : ''}
                    />
                    {errors.fechaFin && <span className="field-error">{errors.fechaFin}</span>}
                  </div>
                ) : (
                  form.fecha && (
                    <div className="form-group">
                      <label>Horario</label>
                      <div className="horarios-grid">
                        {HORARIOS.map((h) => (
                          <label key={h} className={`horario-btn ${form.hora === h ? 'selected' : ''}`}>
                            <input type="radio" name="hora" value={h} checked={form.hora === h} onChange={handleField} hidden />
                            {h}
                          </label>
                        ))}
                      </div>
                      {errors.hora && <span className="field-error">{errors.hora}</span>}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* NOTAS */}
          <div className="form-section">
            <h3 className="form-section-title">📝 Notas adicionales</h3>
            <div className="form-group">
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleField}
                placeholder="Comportamiento especial, miedos, indicaciones del veterinario..."
                rows={3}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary reservar-submit" disabled={loading}>
            {loading ? 'Procesando...' : (subscription ? 'Activar suscripción →' : 'Confirmar reserva →')}
          </button>
        </form>

        {/* SIDEBAR */}
        <aside className="reservar-sidebar">
          <div className="sidebar-card">
            <h4>Resumen</h4>
            {service ? (
              <>
                <div className="resumen-line"><span>Servicio</span><strong>{service.nombre}</strong></div>
                {option && (
                  <div className="resumen-line">
                    <span>Opción</span>
                    <strong>{option.label}</strong>
                  </div>
                )}
                {form.nombreMascota && <div className="resumen-line"><span>Mascota</span><strong>{form.nombreMascota}</strong></div>}
                {form.fecha && <div className="resumen-line"><span>{overnight ? 'Check-in' : 'Fecha'}</span><strong>{form.fecha}</strong></div>}
                {overnight && form.fechaFin && <div className="resumen-line"><span>Check-out</span><strong>{form.fechaFin}</strong></div>}
                {!overnight && form.hora && <div className="resumen-line"><span>Hora</span><strong>{form.hora} hs</strong></div>}
                {overnight && noches > 0 && <div className="resumen-line"><span>Noches</span><strong>{noches}</strong></div>}
                {option && (
                  <div className="resumen-total">
                    <span>Total</span>
                    <strong>${total.toLocaleString('es-MX')} MXN</strong>
                  </div>
                )}
              </>
            ) : (
              <p className="resumen-empty">Elegí un servicio para ver el detalle.</p>
            )}
          </div>

          <div className="sidebar-card sidebar-info">
            <h4>📍 Visitanos</h4>
            <p>Av. Ejemplo 123, Condesa, CDMX<br/>Lun – Sáb · 9:00 – 19:00</p>
            <p className="sidebar-phone">📞 +52 55 1234 5678</p>
          </div>
        </aside>
      </div>

      {loading && <Loader text="Procesando tu reserva..." />}
    </section>
  );
};

export default Reservar;