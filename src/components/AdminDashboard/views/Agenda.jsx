/**
 * Agenda.jsx
 * Calendario semanal de citas y reservas.
 * Consume allOrders desde AdminDataContext — sin subscriptions propias.
 */

import { useState, useMemo } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast }            from 'react-toastify';
import { db }               from '../../../firebase/config';
import { useAdminContext }  from '../AdminDashboard';
import { formatCurrency } from '../../../utils/formatters';

// ─────────────────────────────────────────────────────────────
// Helpers de fechas
// ─────────────────────────────────────────────────────────────
const DAYS_ES    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DAYS_FULL  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MONTHS_ES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

/** Devuelve el lunes de la semana de una fecha dada */
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Devuelve array con los 7 días de la semana a partir del lunes */
const getWeekDays = (monday) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

// ─────────────────────────────────────────────────────────────
// Configuración visual por tipo
// ─────────────────────────────────────────────────────────────
const TIPO_CONFIG = {
  reserva:  { label: '📅 Reserva',  bg: '#6366F120', border: '#6366F1', color: '#6366F1' },
  cita:     { label: '💉 Cita',     bg: '#10B98120', border: '#10B981', color: '#10B981' },
  estancia: { label: '🏨 Hotel',    bg: '#06B6D420', border: '#06B6D4', color: '#06B6D4' },
  pedido:   { label: '🛒 Tienda',   bg: '#F59E0B20', border: '#F59E0B', color: '#F59E0B' },
};

const STATUS_META = {
  pendiente:  { text: 'Pendiente',  cls: 'badge-info'    },
  en_proceso: { text: 'En proceso', cls: 'badge-warning' },
  completado: { text: 'Completado', cls: 'badge-success' },
  cancelado:  { text: 'Cancelado',  cls: 'badge-danger'  },
  confirmada: { text: 'Confirmada', cls: 'badge-success' },
  enviado:    { text: 'Enviado',    cls: 'badge-info'    },
  entregado:  { text: 'Entregado',  cls: 'badge-success' },
};

// ─────────────────────────────────────────────────────────────
// Tarjeta de evento en el calendario
// ─────────────────────────────────────────────────────────────
const EventCard = ({ event, onClick }) => {
  const cfg = TIPO_CONFIG[event.tipo] || TIPO_CONFIG.reserva;
  return (
    <div
      onClick={() => onClick(event)}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}40`,
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: 6,
        padding: '0.35rem 0.5rem',
        marginBottom: '0.3rem',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: cfg.color, lineHeight: 1.3 }}>
        {event.time || ''}
        {event.time ? ' · ' : ''}
        {event.petName !== '—' ? event.petName : event.service?.split('—')[0]?.trim()}
      </p>
      <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.service}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Panel de detalle del evento
// ─────────────────────────────────────────────────────────────
const EventDetail = ({ event, onClose }) => {
  const cfg = TIPO_CONFIG[event.tipo] || TIPO_CONFIG.reserva;
  const sm  = STATUS_META[event.status] || STATUS_META.pendiente;

  const STATUSES = event.tipo === 'pedido'
    ? ['pendiente','enviado','entregado','cancelado']
    : ['pendiente','en_proceso','completado','cancelado'];

  const handleStatusChange = async (next) => {
    try {
      const field = event.coleccion === 'pedidos' ? 'status' : 'estado';
      await updateDoc(doc(db, event.coleccion, event.id), {
        [field]: next, status: next, updatedAt: serverTimestamp(),
      });
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000080', zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: '#0F1729', border: '1px solid #1C2333', borderRadius: 14,
        width: '100%', maxWidth: 480, padding: '1.5rem', position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        <button className="btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={onClose}>✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            {event.tipo === 'reserva' ? '📅' : event.tipo === 'cita' ? '💉' : event.tipo === 'estancia' ? '🏨' : '🛒'}
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#F1F5F9', fontSize: '1rem' }}>{cfg.label}</h3>
            <code style={{ fontSize: '0.7rem', color: '#6366F1' }}>#{event.id.slice(-8)}</code>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Servicio',  value: event.service },
            { label: 'Mascota',   value: event.petName !== '—' ? event.petName : '—' },
            { label: 'Fecha',     value: event.date || event.createdAt },
            { label: 'Hora',      value: event.time || '—' },
            { label: 'Total',     value: formatCurrency(event.total) },
            { label: 'Estado',    value: <span className={`badge ${sm.cls}`}>{sm.text}</span> },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: '0.15rem 0 0', color: '#F1F5F9', fontSize: '0.85rem', fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>

        {event.notes && (
          <div style={{ background: '#1C2333', borderRadius: 8, padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Notas</p>
            <p style={{ margin: '0.15rem 0 0', color: '#94A3B8', fontSize: '0.82rem' }}>{event.notes}</p>
          </div>
        )}

        {/* Cambiar estado */}
        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Cambiar estado</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {STATUSES.map((s) => {
              const m = STATUS_META[s];
              const isActive = event.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  style={{
                    padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', border: '1px solid',
                    background: isActive ? cfg.bg    : 'transparent',
                    borderColor: isActive ? cfg.border : '#2D3748',
                    color:       isActive ? cfg.color  : '#64748B',
                  }}
                >
                  {m?.text || s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Vista principal
// ─────────────────────────────────────────────────────────────
const Agenda = () => {
  const { allOrders, loading } = useAdminContext();

  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterTipo, setFilterTipo]       = useState('todos');
  const [view, setView]                   = useState('semana'); // 'semana' | 'lista'

  const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);

  const prevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  };
  const nextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d);
  };
  const goToday = () => setCurrentMonday(getMonday(new Date()));

  // Filtrar por tipo y solo eventos con fecha válida
  const filteredOrders = useMemo(() => allOrders.filter((o) => {
    if (filterTipo !== 'todos' && o.tipo !== filterTipo) return false;
    if (!o.dateObj) return false;
    return true;
  }), [allOrders, filterTipo]);

  // Eventos de la semana actual
  const weekEvents = useMemo(() =>
    filteredOrders.filter((o) => weekDays.some((d) => o.dateObj && isSameDay(o.dateObj, d))),
  [filteredOrders, weekDays]);

  // Eventos por día
  const eventsByDay = useMemo(() => {
    const map = {};
    weekDays.forEach((d) => { map[d.toDateString()] = []; });
    weekEvents.forEach((o) => {
      const key = o.dateObj?.toDateString();
      if (key && map[key]) map[key].push(o);
    });
    return map;
  }, [weekEvents, weekDays]);

  const today = new Date();
  const weekLabel = `${weekDays[0].getDate()} – ${weekDays[6].getDate()} ${MONTHS_ES[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;

  // Eventos de los próximos 30 días para la vista lista
  const upcomingEvents = useMemo(() => {
    const now   = new Date(); now.setHours(0, 0, 0, 0);
    const limit = new Date(now); limit.setDate(limit.getDate() + 30);
    return filteredOrders
      .filter((o) => o.dateObj >= now && o.dateObj <= limit)
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [filteredOrders]);

  // Stats de la semana
  const weekTotal  = weekEvents.reduce((s, o) => s + o.total, 0);
  const weekPend   = weekEvents.filter((o) => ['pendiente','confirmada'].includes(o.status)).length;

  return (
    <div className="view-content">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Agenda</h1>
          <p className="view-subtitle">{weekLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="period-tabs">
            <button className={`period-tab${view === 'semana' ? ' active' : ''}`} onClick={() => setView('semana')}>📅 Semana</button>
            <button className={`period-tab${view === 'lista' ? ' active' : ''}`} onClick={() => setView('lista')}>☰ Lista</button>
          </div>
        </div>
      </div>

      {/* KPIs semana */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem' }}>
        <div className="mini-stat"><span className="ms-val">{weekEvents.length}</span><span className="ms-lbl">Esta semana</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#F59E0B' }}>{weekPend}</span><span className="ms-lbl">Pendientes</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#10B981', fontSize: '0.9rem' }}>{formatCurrency(weekTotal)}</span><span className="ms-lbl">Ingresos semana</span></div>
        <div className="mini-stat"><span className="ms-val" style={{ color: '#6366F1' }}>{upcomingEvents.length}</span><span className="ms-lbl">Próx. 30 días</span></div>
      </div>

      {/* Filtros por tipo + navegación */}
      <div className="filter-row">
        <div className="status-tabs">
          {['todos','reserva','cita','estancia','pedido'].map((t) => (
            <button key={t} className={`status-tab${filterTipo === t ? ' active' : ''}`} onClick={() => setFilterTipo(t)}>
              {t === 'todos' ? 'Todos' : TIPO_CONFIG[t]?.label || t}
            </button>
          ))}
        </div>
        {view === 'semana' && (
          <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
            <button className="btn-icon" onClick={prevWeek} title="Semana anterior" style={{ fontSize: '1rem' }}>‹</button>
            <button className="btn-secondary" onClick={goToday} style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem' }}>Hoy</button>
            <button className="btn-icon" onClick={nextWeek} title="Semana siguiente" style={{ fontSize: '1rem' }}>›</button>
          </div>
        )}
      </div>

      {/* ── VISTA SEMANA ── */}
      {view === 'semana' && (
        <div className="card" style={{ overflow: 'auto' }}>
          {loading
            ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando…</div>
            : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: 0, minWidth: 700 }}>
              {/* Cabeceras */}
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <div key={i} style={{
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    background: isToday ? '#F59E0B10' : 'transparent',
                    borderBottom: '1px solid #1C2333',
                    borderRight: i < 6 ? '1px solid #1C2333' : 'none',
                  }}>
                    <p style={{
                      margin: 0, fontSize: '0.7rem', fontWeight: 600,
                      color: isToday ? '#F59E0B' : '#64748B',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {DAYS_ES[day.getDay()]}
                    </p>
                    <p style={{
                      margin: '0.1rem 0 0', fontSize: '1.1rem', fontWeight: 700,
                      color: isToday ? '#F59E0B' : '#F1F5F9',
                    }}>
                      {day.getDate()}
                    </p>
                    {eventsByDay[day.toDateString()]?.length > 0 && (
                      <span style={{
                        display: 'inline-block', marginTop: '0.15rem',
                        fontSize: '0.65rem', fontWeight: 700,
                        background: '#6366F120', color: '#6366F1',
                        borderRadius: 999, padding: '0.05rem 0.4rem',
                      }}>
                        {eventsByDay[day.toDateString()].length}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Celdas de eventos */}
              {weekDays.map((day, i) => {
                const events = eventsByDay[day.toDateString()] || [];
                const isToday = isSameDay(day, today);
                return (
                  <div key={`cell-${i}`} style={{
                    padding: '0.5rem',
                    minHeight: 140,
                    background: isToday ? '#F59E0B06' : 'transparent',
                    borderRight: i < 6 ? '1px solid #1C2333' : 'none',
                    borderTop: '1px solid #1C2333',
                    verticalAlign: 'top',
                  }}>
                    {events.length === 0
                      ? <p style={{ color: '#2D3748', fontSize: '0.7rem', textAlign: 'center', marginTop: '1rem' }}>—</p>
                      : events.map((ev) => (
                        <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />
                      ))
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── VISTA LISTA ── */}
      {view === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading
            ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando…</div>
            : upcomingEvents.length === 0
            ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: '#64748B' }}>Sin eventos en los próximos 30 días</p>
            </div>
            )
            : (() => {
              // Agrupar por fecha
              const byDate = {};
              upcomingEvents.forEach((o) => {
                const key = o.dateObj.toDateString();
                if (!byDate[key]) byDate[key] = [];
                byDate[key].push(o);
              });

              return Object.entries(byDate).map(([dateStr, events]) => {
                const date = new Date(dateStr);
                const isToday  = isSameDay(date, today);
                return (
                  <div key={dateStr}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      marginBottom: '0.4rem', paddingLeft: '0.25rem',
                    }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                        color: isToday ? '#F59E0B' : '#64748B', letterSpacing: '0.06em',
                      }}>
                        {isToday ? '● HOY' : DAYS_FULL[date.getDay()]}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                        {date.getDate()} de {MONTHS_ES[date.getMonth()]}
                      </span>
                      <div style={{ flex: 1, height: 1, background: '#1C2333' }} />
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{events.length} evento{events.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      {events.map((ev, idx) => {
                        const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG.reserva;
                        const sm  = STATUS_META[ev.status] || STATUS_META.pendiente;
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '1rem',
                              padding: '0.75rem 1rem', cursor: 'pointer',
                              borderTop: idx > 0 ? '1px solid #1C2333' : 'none',
                              borderLeft: `3px solid ${cfg.border}`,
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#1C2333')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>
                              {ev.tipo === 'reserva' ? '📅' : ev.tipo === 'cita' ? '💉' : ev.tipo === 'estancia' ? '🏨' : '🛒'}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.service}
                              </p>
                              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                                {ev.petName !== '—' ? `🐾 ${ev.petName} · ` : ''}
                                {ev.time ? `⏰ ${ev.time} · ` : ''}
                                <code style={{ color: '#6366F1', fontSize: '0.7rem' }}>#{ev.id.slice(-6)}</code>
                              </p>
                            </div>
                            <span className={`badge ${sm.cls}`}>{sm.text}</span>
                            <strong style={{ color: '#F59E0B', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {formatCurrency(ev.total)}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()
          }
        </div>
      )}

      {/* Panel de detalle */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default Agenda;