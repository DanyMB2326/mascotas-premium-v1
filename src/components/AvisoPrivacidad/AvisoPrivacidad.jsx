import '../AvisoPrivacidad/AvisoPrivacidad.css';

const ARCO = [
  {
    letra: 'A',
    nombre: 'Acceso',
    desc: 'Conocer qué datos personales tenemos de ti y cómo los usamos.',
  },
  {
    letra: 'R',
    nombre: 'Rectificación',
    desc: 'Corregir tus datos cuando sean inexactos o incompletos.',
  },
  {
    letra: 'C',
    nombre: 'Cancelación',
    desc: 'Solicitar que eliminemos tus datos de nuestras bases.',
  },
  {
    letra: 'O',
    nombre: 'Oposición',
    desc: 'Oponerte al tratamiento de tus datos para finalidades específicas.',
  },
];

const AvisoPrivacidad = () => (
  <div className="legal-page">

    {/* Header */}
    <div className="legal-hero">
      <span className="tag">Transparencia y privacidad</span>
      <h1>Aviso de Privacidad</h1>
      <p>
        En cumplimiento de la <strong>Ley Federal de Protección de Datos Personales
        en Posesión de los Particulares (LFPDPPP)</strong> y su Reglamento, Paw Loyal
        pone a tu disposición el presente Aviso de Privacidad.
      </p>
      <span className="legal-date">Última actualización: enero 2025</span>
    </div>

    <div className="legal-body">

      {/* I. Identidad del responsable */}
      <section className="legal-section">
        <h2><span className="legal-num">I.</span> Identidad del responsable</h2>
        <div className="legal-card">
          <div className="legal-data-grid">
            <div><span>Nombre comercial</span><strong>Paw Loyal · Clínica Boutique Animal</strong></div>
            <div><span>Domicilio</span><strong>Av. Ejemplo 123, Col. Condesa, CDMX, C.P. 06140</strong></div>
            <div><span>Correo de contacto</span><strong>privacidad@pawloyal.mx</strong></div>
            <div><span>Teléfono</span><strong>+52 55 1234 5678</strong></div>
          </div>
        </div>
      </section>

      {/* II. Datos que recopilamos */}
      <section className="legal-section">
        <h2><span className="legal-num">II.</span> Datos personales que recolectamos</h2>
        <p>Recopilamos datos personales directamente del titular al momento de contratar nuestros servicios, crear una cuenta o comunicarse con nosotros. Los datos recabados son:</p>

        <div className="legal-two-cols">
          <div className="legal-data-block">
            <h3>🧑 Del cliente (pet parent)</h3>
            <ul>
              <li>Nombre completo</li>
              <li>Número de teléfono</li>
              <li>Correo electrónico</li>
              <li>Domicilio (para servicios de transporte)</li>
              <li>Identificación oficial</li>
              <li>Forma de pago (solo referencia, no datos bancarios completos)</li>
            </ul>
          </div>
          <div className="legal-data-block">
            <h3>🐶 De la mascota</h3>
            <ul>
              <li>Nombre, especie y raza</li>
              <li>Edad, peso y sexo</li>
              <li>Estado de salud y vacunas</li>
              <li>Alergias y medicamentos</li>
              <li>Conducta y temperamento</li>
              <li>Fotografías y videos (con consentimiento expreso)</li>
            </ul>
          </div>
        </div>

        <div className="legal-notice legal-notice--info">
          <strong>Datos sensibles:</strong> Las fotografías y videos de tu mascota se tratan como datos con protección especial. Su uso requiere consentimiento explícito mediante el <em>Consentimiento para Uso de Imagen</em> que se firma por separado.
        </div>
      </section>

      {/* III. Finalidades */}
      <section className="legal-section">
        <h2><span className="legal-num">III.</span> Finalidades del tratamiento</h2>
        <p>Tus datos se utilizan para las siguientes finalidades:</p>

        <div className="legal-purpose-grid">
          <div className="purpose-card purpose-card--primary">
            <h4>Finalidades primarias</h4>
            <p className="purpose-sub">Necesarias para la prestación del servicio</p>
            <ul>
              <li>Identificar al cliente y su mascota</li>
              <li>Brindar los servicios contratados (estética, guardería, pensión, spa, adiestramiento, transporte)</li>
              <li>Gestionar reservaciones y citas</li>
              <li>Enviar reportes del servicio (fotos y actualizaciones por WhatsApp)</li>
              <li>Atender emergencias veterinarias</li>
              <li>Emitir comprobantes de pago</li>
              <li>Administrar la cuenta del cliente en la plataforma</li>
            </ul>
          </div>
          <div className="purpose-card purpose-card--secondary">
            <h4>Finalidades secundarias</h4>
            <p className="purpose-sub">Puedes oponerte a estas sin afectar el servicio</p>
            <ul>
              <li>Envío de promociones, descuentos y novedades</li>
              <li>Encuestas de satisfacción</li>
              <li>Uso de imágenes de tu mascota en redes sociales y material promocional</li>
              <li>Análisis estadístico interno para mejorar el servicio</li>
            </ul>
          </div>
        </div>
      </section>

      {/* IV. Transferencias */}
      <section className="legal-section">
        <h2><span className="legal-num">IV.</span> Transferencias de datos</h2>
        <p>
          Paw Loyal <strong>no vende ni comercializa</strong> tus datos personales a terceros.
          Podremos compartir tu información únicamente en los siguientes casos:
        </p>
        <ul className="legal-list">
          <li>Con veterinarios externos en caso de emergencia médica de tu mascota, con tu autorización previa.</li>
          <li>Con proveedores de servicios tecnológicos (hosting, plataforma de pagos) que actúen como encargados del tratamiento bajo acuerdos de confidencialidad.</li>
          <li>Con autoridades competentes cuando así lo exija la ley.</li>
        </ul>
      </section>

      {/* V. Almacenamiento */}
      <section className="legal-section">
        <h2><span className="legal-num">V.</span> Almacenamiento y seguridad</h2>
        <div className="legal-card">
          <p>
            Los datos personales se almacenan en sistemas digitales con acceso restringido, protegidos mediante contraseñas y cifrado. Las fotografías y videos se alojan en servidores seguros con acceso controlado. Solo el personal autorizado de Paw Loyal tiene acceso a la información.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Conservamos tus datos mientras mantengas una relación activa con nosotros o mientras sea necesario para cumplir con obligaciones legales. Puedes solicitar su eliminación en cualquier momento ejerciendo tu derecho de Cancelación.
          </p>
        </div>
      </section>

      {/* VI. Derechos ARCO */}
      <section className="legal-section">
        <h2><span className="legal-num">VI.</span> Tus derechos ARCO</h2>
        <p>Como titular de los datos, tienes derecho a:</p>
        <div className="arco-grid">
          {ARCO.map((d) => (
            <div key={d.letra} className="arco-card">
              <div className="arco-letra">{d.letra}</div>
              <h4>{d.nombre}</h4>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>
        <div className="legal-card" style={{ marginTop: '1.5rem' }}>
          <h4>¿Cómo ejercer tus derechos?</h4>
          <p>Envía una solicitud a <strong>privacidad@pawloyal.mx</strong> con los siguientes datos:</p>
          <ol className="legal-ol">
            <li>Nombre completo e identificación oficial</li>
            <li>Derecho que deseas ejercer (A, R, C u O)</li>
            <li>Descripción clara del dato o tratamiento al que se refiere</li>
          </ol>
          <p>Responderemos en un plazo máximo de <strong>20 días hábiles</strong> conforme a lo establecido por la LFPDPPP.</p>
        </div>
      </section>

      {/* VII. Cookies */}
      <section className="legal-section">
        <h2><span className="legal-num">VII.</span> Uso de cookies y tecnologías similares</h2>
        <p>
          Nuestra plataforma web puede utilizar cookies para mejorar la experiencia de navegación, recordar preferencias y analizar el tráfico. No se utilizan cookies para compartir información con terceros con fines publicitarios. Puedes configurar tu navegador para rechazar las cookies, aunque esto puede afectar la funcionalidad del sitio.
        </p>
      </section>

      {/* VIII. Cambios */}
      <section className="legal-section">
        <h2><span className="legal-num">VIII.</span> Cambios al aviso de privacidad</h2>
        <p>
          Paw Loyal se reserva el derecho de actualizar este aviso en cualquier momento. Las modificaciones serán notificadas a través de nuestra plataforma web en <strong>pawloyal.mx/aviso-privacidad</strong> y, cuando aplique, por correo electrónico. Se indica la fecha de última actualización al inicio del documento.
        </p>
      </section>

      {/* Contacto */}
      <div className="legal-contact-bar">
        <div>
          <h4>¿Tienes dudas sobre tu privacidad?</h4>
          <p>Escríbenos y te respondemos en máximo 48 horas hábiles.</p>
        </div>
        <a href="mailto:privacidad@pawloyal.mx" className="btn-primary">
          privacidad@pawloyal.mx
        </a>
      </div>

    </div>
  </div>
);

export default AvisoPrivacidad;