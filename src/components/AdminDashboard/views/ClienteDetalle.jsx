/**
 * ClienteDetalle.jsx
 * Panel de perfil completo de un cliente.
 * Se renderiza dentro de Clientes.jsx cuando el admin selecciona un usuario.
 *
 * Datos: filtra allOrders y clients del AdminDataContext por userId.
 * Sin queries propias — cero suscripciones adicionales a Firestore.
 *
 * Props:
 *   clientId  {string}   — UID del usuario
 *   onClose   {Function} — callback para cerrar el panel
 */

import { useMemo } from 'react';
import { useAdminContext } from '../AdminDashboard';
import { formatCurrency, formatDate, formatRelativeTime, formatPhone, initials } from '../../../utils/formatters';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const SEGMENT_META = {
  vip:       { text: '⭐ VIP',        cls: 'badge-warning' },
  frecuente: { text: '🔄 Frecuente',  cls: 'badge-info'    },
  regular:   { text: '👤 Regular',    cls: 'badge-neutral' },
  nuevo:     { text: '🆕 Nuevo',      cls: 'badge-success' },
};

const getSegment = (u) => {
  const orders = u.totalPedidos || u.orders || 0;
  const spent  = u.totalGastado || u.totalSpent || 0;
  if (spent >= 10000 || orders >= 20) return 'vip';
  if (orders >= 5)  return 'frecuente';
  if (orders >= 1)  return 'regular';
  return 'nuevo';
};

const STATUS_META = {
  completado: { text: 'Completado', cls: 'badge-success' },
  completada: { text: 'Completado', cls: 'badge-success' },
  en_proceso: { text: 'En proceso', cls: 'badge-warning' },
  pendiente:  { text: 'Pendiente',  cls: 'badge-info'    },
  cancelado:  { text: 'Cancelado',  cls: 'badge-danger'  },
  enviado:    { text: 'Enviado',    cls: 'badge-info'    },
  entregado:  { text: 'Entregado',  cls: 'badge-success' },
};

const TIPO_LABELS = { reserva: '📅 Reserva', cita: '💉 Cita', estancia: '🏨 Hotel', pedido: '🛒 Tienda' };

// ─────────────────────────────────────────────────────────────
// Componentes internos
// ─────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, mono = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #1C2333' }}>
    <span style={{ fontSize: '0.75rem', color: '#64748B', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '0.82rem', color: mono ? '#6366F1' : '#F1F5F9', fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', wordBreak: 'break-all' }}>
      {value || '—'}
    </span>
  </div>
);

const StatBox = ({ icon, value, label, color = '#F59E0B' }) => (
  <div style={{
    background: '#0F1729', borderRadius: 10, padding: '0.9rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
    border: '1px solid #1C2333',
  }}>
    <span style={{ fontSize: '1.3rem' }}>{icon}</span>
    <span style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</span>
    <span style={{ fontSize: '0.68rem', color: '#64748B', textAlign: 'center' }}>{label}</span>
  </div>
);

const PetCard = ({ pet }) => (
  <div style={{
    background: '#0F1729', borderRadius: 10, padding: '0.75rem 1rem',
    border: '1px solid #1C2333', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
  }}>
    <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{pet.especie === 'gato' ? '🐱' : '🐶'}</span>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#F1F5F9', fontSize: '0.9rem' }}>{pet.nombre}</p>
      <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
        {[pet.raza, pet.edad && `${pet.edad} años`, pet.peso && `${pet.peso} kg`]
          .filter(Boolean).join(' · ')}
      </p>
      {pet.alergias && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#F59E0B' }}>
          ⚠️ {pet.alergias}
        </p>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
const ClienteDetalle = ({ clientId, onClose }) => {
  const { clients, allOrders } = useAdminContext();

  const client = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId],
  );

  // Todas las órdenes del cliente (filtra por userId)
  const clientOrders = useMemo(
    () => allOrders.filter((o) => o.userId === clientId),
    [allOrders, clientId],
  );

  if (!client) return null;

  const segment    = getSegment(client);
  const segMeta    = SEGMENT_META[segment];
  const displayName = client.displayName || client.email?.split('@')[0] || 'Usuario';
  const avatar     = initials(displayName, 2);

  // Estadísticas derivadas
  const totalGastado  = clientOrders.reduce((s, o) => s + (o.total || 0), 0);
  const completados   = clientOrders.filter((o) => ['completado','completada','entregado'].includes(o.status)).length;
  const cancelados    = clientOrders.filter((o) => ['cancelado','cancelada'].includes(o.status)).length;
  const servicios     = clientOrders.filter((o) => ['reserva','cita','estancia'].includes(o.tipo)).length;
  const compras       = clientOrders.filter((o) => o.tipo === 'pedido').length;
  const mascotas      = client.mascotas || [];
  const lastActivity  = clientOrders.length > 0 ? clientOrders[0].dateObj : null;

  // Servicio más pedido
  const serviceCounts = {};
  clientOrders.forEach((o) => {
    const s = o.service?.split('—')[0]?.trim() || o.service;
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });
  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000090',
      zIndex: 999, display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{
          width: '100%', maxWidth: 560, background: '#0A0F1E',
          borderLeft: '1px solid #1C2333', overflowY: 'auto',
          animation: 'slideIn 0.22s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1C2333', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#6366F120', color: '#6366F1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, flexShrink: 0,
          }}>
            {avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', color: '#F1F5F9' }}>{displayName}</h2>
              <span className={`badge ${segMeta.cls}`}>{segMeta.text}</span>
              {client.role === 'admin' && <span className="badge badge-warning">Admin</span>}
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748B' }}>{client.email}</p>
            {lastActivity && (
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#475569' }}>
                Última actividad {formatRelativeTime(lastActivity)}
              </p>
            )}
          </div>
          <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
        </div>

        {/* ── STATS ── */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1C2333' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem' }}>
            <StatBox icon="💰" value={formatCurrency(totalGastado)} label="Total gastado" color="#F59E0B" />
            <StatBox icon="📦" value={clientOrders.length} label="Transacciones" color="#6366F1" />
            <StatBox icon="✅" value={completados} label="Completados" color="#10B981" />
            <StatBox icon="🐾" value={mascotas.length} label="Mascotas" color="#EC4899" />
          </div>
          {topService && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: '#0F1729', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Servicio más frecuente</span>
              <span style={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 600 }}>
                {topService[0]} <span style={{ color: '#6366F1' }}>({topService[1]}×)</span>
              </span>
            </div>
          )}
        </div>

        {/* ── INFORMACIÓN PERSONAL ── */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1C2333' }}>
          <h4 style={{ margin: '0 0 0.75rem', color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Información personal
          </h4>
          <InfoRow label="Email"        value={client.email} />
          <InfoRow label="Teléfono"     value={formatPhone(client.phone || client.telefono)} />
          <InfoRow label="UID Firebase" value={client.id} mono />
          <InfoRow label="Rol"          value={client.role || 'cliente'} />
          <InfoRow label="Registrado"   value={formatDate(client.createdAt, 'long')} />
          <InfoRow label="Servicios agendados" value={servicios} />
          <InfoRow label="Compras en tienda"   value={compras} />
          <InfoRow label="Cancelados"   value={cancelados} />
        </div>

        {/* ── MASCOTAS ── */}
        {mascotas.length > 0 && (
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #1C2333' }}>
            <h4 style={{ margin: '0 0 0.75rem', color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Mascotas registradas ({mascotas.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mascotas.map((pet, i) => <PetCard key={pet.id || i} pet={pet} />)}
            </div>
          </div>
        )}

        {/* ── HISTORIAL DE TRANSACCIONES ── */}
        <div style={{ padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Historial ({clientOrders.length})
          </h4>

          {clientOrders.length === 0
            ? <p style={{ color: '#64748B', fontSize: '0.82rem' }}>Sin transacciones registradas todavía.</p>
            : clientOrders.map((o) => {
              const sm  = STATUS_META[o.status] || STATUS_META.pendiente;
              return (
                <div key={o.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.75rem 0', borderBottom: '1px solid #1C2333',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '0.1rem' }}>
                    {o.tipo === 'reserva' ? '📅' : o.tipo === 'cita' ? '💉' : o.tipo === 'estancia' ? '🏨' : '🛒'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#F1F5F9', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.service}
                      </p>
                      <strong style={{ color: '#F59E0B', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.85rem' }}>
                        {formatCurrency(o.total)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        {TIPO_LABELS[o.tipo] || o.tipo}
                      </span>
                      <span className={`badge ${sm.cls}`} style={{ fontSize: '0.65rem' }}>{sm.text}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {o.date || o.createdAt}
                        {o.petName !== '—' ? ` · 🐾 ${o.petName}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ClienteDetalle;