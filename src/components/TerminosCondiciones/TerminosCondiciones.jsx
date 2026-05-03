import { Link } from 'react-router-dom';
import '../AvisoPrivacidad/AvisoPrivacidad.css';
import '../TerminosCondiciones/TerminosCondiciones.css';

const CANCELACIONES = [
  {
    plazo: '48 h o más de anticipación',
    cargo: 'Sin cargo · Reembolso total',
    color: 'green',
  },
  {
    plazo: '24 – 48 h de anticipación',
    cargo: '50% del servicio como cargo por cancelación tardía',
    color: 'gold',
  },
  {
    plazo: 'Menos de 24 h o no presentación',
    cargo: '100% del monto reservado',
    color: 'red',
  },
];

const RECHAZOS = [
  { icon: '🩺', texto: 'Mascota con signos de enfermedad contagiosa' },
  { icon: '⚠️', texto: 'Historial de agresividad extrema no informada' },
  { icon: '💉', texto: 'Vacunación incompleta o no vigente' },
  { icon: '📋', texto: 'Negativa a firmar la carta responsiva' },
  { icon: '🐾', texto: 'Especie o tamaño que supere nuestra capacidad' },
  { icon: '🚫', texto: 'Incumplimiento previo de términos de pago' },
];

const TerminosCondiciones = () => (
  <div className="legal-page">

    {/* Header */}
    <div className="legal-hero">
      <span className="tag">Marco legal del servicio</span>
      <h1>Términos y Condiciones</h1>
      <p>
        Al contratar cualquier servicio de <strong>Paw Loyal · Clínica Boutique Animal</strong>,
        el cliente acepta los presentes Términos y Condiciones. Estos funcionan como el marco
        legal general que rige todas las relaciones de servicio entre Paw Loyal y sus clientes.
      </p>
      <span className="legal-date">Última actualización: enero 2025 · Aplica en CDMX y zona metropolitana</span>
    </div>

    <div className="legal-body">

      {/* I. Aceptación */}
      <section className="legal-section">
        <h2><span className="legal-num">I.</span> Aceptación de los términos</h2>
        <div className="legal-notice legal-notice--info">
          Al agendar una cita, firmar un contrato o hacer uso de los servicios de Paw Loyal —ya sea de forma presencial, telefónica o a través de nuestra plataforma digital— el cliente declara haber leído, comprendido y aceptado en su totalidad estos Términos y Condiciones.
        </div>
      </section>

      {/* II. Servicios */}
      <section className="legal-section">
        <h2><span className="legal-num">II.</span> Descripción de los servicios</h2>
        <p>Paw Loyal ofrece servicios especializados de cuidado y bienestar animal que incluyen estética canina y felina, baño premium, spa, guardería, pensión, adiestramiento, transporte de mascotas y paquetes de suscripción mensual. Cada servicio se rige también por su contrato específico.</p>
        <div className="legal-notice legal-notice--info">
          Los servicios se prestan exclusivamente para perros y gatos. Para otras especies, consultar disponibilidad con anticipación.
        </div>
      </section>

      {/* III. Reservaciones */}
      <section className="legal-section">
        <h2><span className="legal-num">III.</span> Reservaciones y confirmación</h2>
        <ul className="legal-list">
          <li>Toda reservación requiere confirmar nombre del cliente, datos de la mascota y servicio solicitado.</li>
          <li>La cita se considera confirmada únicamente cuando Paw Loyal envíe confirmación por WhatsApp o correo electrónico.</li>
          <li>Para servicios de pensión o guardería de más de 3 días, se puede solicitar un depósito del 30% del total.</li>
          <li>Los horarios de recepción son de lunes a sábado de 9:00 a 19:00 hrs. No se reciben mascotas fuera de ese horario salvo acuerdo previo.</li>
        </ul>
      </section>

      {/* IV. Cancelaciones */}
      <section className="legal-section">
        <h2><span className="legal-num">IV.</span> Política de cancelación y reembolso</h2>
        <div className="tc-cancel-table">
          {CANCELACIONES.map((c) => (
            <div key={c.plazo} className={`tc-cancel-row tc-cancel-row--${c.color}`}>
              <div className="tc-cancel-plazo">{c.plazo}</div>
              <div className="tc-cancel-cargo">{c.cargo}</div>
            </div>
          ))}
        </div>
        <div className="legal-notice legal-notice--warn" style={{ marginTop: '0.5rem' }}>
          <strong>Fuerza mayor:</strong> En caso de emergencia médica del cliente o la mascota debidamente documentada, se evaluará la situación de manera individual sin cargo de penalización.
        </div>
      </section>

      {/* V. Retrasos en recogida */}
      <section className="legal-section">
        <h2><span className="legal-num">V.</span> Retrasos en la recogida de mascotas</h2>
        <div className="terms-policy-grid">
          <div className="policy-card">
            <span className="policy-card-icon">⏰</span>
            <h5>Aviso de retraso</h5>
            <p>El cliente debe notificar con al menos 2 horas de anticipación si no puede recoger a su mascota a la hora acordada.</p>
          </div>
          <div className="policy-card">
            <span className="policy-card-icon">💳</span>
            <h5>Cargo por hora extra</h5>
            <p>Pasados 30 minutos de la hora pactada sin aviso, se aplicará un cargo de <strong>$50 MXN por hora</strong> adicional de estancia.</p>
          </div>
          <div className="policy-card">
            <span className="policy-card-icon">🌙</span>
            <h5>Pernocta no programada</h5>
            <p>Si la mascota permanece más de 12 horas adicionales, se cobrará una pensión completa según la tarifa vigente.</p>
          </div>
          <div className="policy-card">
            <span className="policy-card-icon">📞</span>
            <h5>Protocolo de abandono</h5>
            <p>Después de <strong>72 horas</strong> sin respuesta del cliente, se activará el protocolo de abandono conforme a la normativa aplicable.</p>
          </div>
        </div>
      </section>

      {/* VI. Precios */}
      <section className="legal-section">
        <h2><span className="legal-num">VI.</span> Precios, pagos y cargos adicionales</h2>
        <ul className="legal-list">
          <li>Los precios publicados son en pesos mexicanos (MXN) e incluyen IVA cuando aplica.</li>
          <li>El pago debe realizarse a la entrega del servicio salvo acuerdo escrito previo. Se aceptan efectivo, transferencia y tarjeta.</li>
          <li>Pueden aplicarse cargos adicionales por: tamaño o pelaje de la mascota mayor al estimado, servicios de emergencia veterinaria, materiales especiales solicitados, o cuidado de mascota con comportamiento que requiera personal extra.</li>
          <li>Paw Loyal se reserva el derecho de ajustar precios con al menos 15 días de aviso previo a los clientes con suscripción activa.</li>
        </ul>
      </section>

      {/* VII. Causales de rechazo */}
      <section className="legal-section">
        <h2><span className="legal-num">VII.</span> Causales de rechazo del servicio</h2>
        <p>Paw Loyal podrá rechazar o cancelar un servicio sin responsabilidad cuando:</p>
        <div className="rejection-grid">
          {RECHAZOS.map((r) => (
            <div key={r.texto} className="rejection-item">
              <span>{r.icon}</span> {r.texto}
            </div>
          ))}
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          En caso de rechazo justificado, se reembolsará el importe pagado en su totalidad.
        </p>
      </section>

      {/* VIII. Responsabilidad */}
      <section className="legal-section">
        <h2><span className="legal-num">VIII.</span> Responsabilidad y limitaciones</h2>
        <ul className="legal-list">
          <li>Paw Loyal actuará con el máximo cuidado y profesionalismo, pero no puede garantizar resultados específicos en servicios como adiestramiento o tratamientos de piel.</li>
          <li>El cliente es responsable de informar verazmente el estado de salud, alergias, conducta y vacunas de su mascota. La omisión libera a Paw Loyal de responsabilidad por consecuencias derivadas.</li>
          <li>Paw Loyal no es responsable por el estrés natural que puede generar cualquier entorno desconocido para la mascota.</li>
          <li>En caso de accidente o emergencia, se actuará de inmediato y se notificará al cliente; los gastos veterinarios correrán por cuenta del cliente, salvo negligencia comprobada de Paw Loyal.</li>
        </ul>
      </section>

      {/* IX. Documentos complementarios */}
      <section className="legal-section">
        <h2><span className="legal-num">IX.</span> Documentos complementarios</h2>
        <p>El presente documento funciona como marco general. Para cada servicio existen contratos específicos y documentos complementarios que el cliente deberá firmar:</p>
        <div className="terms-policy-grid">
          <div className="terms-highlight-box">
            <h5>📋 Carta responsiva del dueño</h5>
            <p>Declaración de salud, vacunación y conducta de la mascota. Requerida en todos los servicios.</p>
          </div>
          <div className="terms-highlight-box">
            <h5>📝 Contratos por servicio</h5>
            <p>Estética, guardería/pensión, adiestramiento, transporte, membresía y paquete premium tienen su propio contrato.</p>
          </div>
          <div className="terms-highlight-box">
            <h5>📷 Consentimiento de imagen</h5>
            <p>Autorización para uso de fotografías y videos de la mascota en redes sociales y material publicitario.</p>
          </div>
          <div className="terms-highlight-box">
            <h5>💊 Autorización de medicamentos</h5>
            <p>Requerida cuando la mascota necesita recibir medicación durante su estancia.</p>
          </div>
        </div>
      </section>

      {/* X. Modificaciones */}
      <section className="legal-section">
        <h2><span className="legal-num">X.</span> Modificaciones a los términos</h2>
        <p>
          Paw Loyal se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.
          Los cambios serán publicados en nuestra plataforma y notificados a clientes activos con al menos
          <strong> 10 días de anticipación</strong>. El uso continuado de los servicios implica la aceptación
          de los términos actualizados.
        </p>
      </section>

      {/* XI. Jurisdicción */}
      <section className="legal-section">
        <h2><span className="legal-num">XI.</span> Jurisdicción y legislación aplicable</h2>
        <p>
          En caso de controversia, las partes se someten a los tribunales competentes de la
          Ciudad de México, aplicando la legislación vigente en los Estados Unidos Mexicanos,
          incluyendo la Ley Federal de Protección al Consumidor (PROFECO).
        </p>
        <div className="legal-notice legal-notice--info">
          Consulta también nuestro <Link to="/aviso-privacidad" style={{ color: 'var(--accent)', fontWeight: 700 }}>Aviso de Privacidad</Link> para conocer cómo tratamos tus datos personales.
        </div>
      </section>

      {/* Contacto */}
      <div className="legal-contact-bar">
        <div>
          <h4>¿Tienes preguntas sobre nuestros términos?</h4>
          <p>Escríbenos o visítanos en la clínica, con gusto te atendemos.</p>
        </div>
        <a href="mailto:hola@pawloyal.mx" className="btn-primary">hola@pawloyal.mx</a>
      </div>

    </div>
  </div>
);

export default TerminosCondiciones;