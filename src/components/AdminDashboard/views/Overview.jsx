/**
 * Overview.jsx — v2
 * Sin suscripciones propias. Consume todo desde AdminDataContext.
 */
import { useState, useMemo } from 'react';
import { useAdminContext }   from '../AdminDashboard';
import { BarChart, LineChart, DonutChart } from '../charts/Charts';

const SERVICE_COLORS = ['#F59E0B','#10B981','#6366F1','#EC4899','#06B6D4','#EF4444','#8B5CF6'];

const STATUS_LABELS = {
  completado:{ text:'Completado', cls:'badge-success' },
  completada:{ text:'Completado', cls:'badge-success' },
  en_proceso:{ text:'En proceso', cls:'badge-warning' },
  pendiente: { text:'Pendiente',  cls:'badge-info'    },
  cancelado: { text:'Cancelado',  cls:'badge-danger'  },
  cancelada: { text:'Cancelado',  cls:'badge-danger'  },
  enviado:   { text:'Enviado',    cls:'badge-info'    },
  entregado: { text:'Entregado',  cls:'badge-success' },
};

const TIPO_LABELS = { reserva:'Reservas', cita:'Citas', estancia:'Hotel', pedido:'Tienda' };
const DAYS_ES     = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS_ES   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ── Helpers de gráficas (sin Firestore, trabajan con allOrders) ─
const groupByWeekday = (allOrders) => {
  const now = new Date();
  return DAYS_ES.map((label, i) => {
    const day    = new Date(now);
    day.setDate(now.getDate() - (6 - i));
    const dayStr = day.toDateString();
    const value  = allOrders
      .filter((d) => d.dateObj?.toDateString() === dayStr)
      .reduce((s, d) => s + d.total, 0);
    return { label, value };
  });
};

const groupByMonth = (allOrders) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.getMonth();
    const year  = d.getFullYear();
    const value = allOrders
      .filter((o) => o.dateObj?.getMonth() === month && o.dateObj?.getFullYear() === year)
      .reduce((s, o) => s + o.total, 0);
    return { label: MONTHS_ES[month], value };
  });
};

const groupByService = (allOrders) => {
  const counts = {};
  allOrders
    .filter((o) => ['reserva','cita','estancia'].includes(o.tipo))
    .forEach((o) => {
      const key = TIPO_LABELS[o.tipo] || o.tipo || 'Otro';
      counts[key] = (counts[key] || 0) + 1;
    });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: SERVICE_COLORS[i % SERVICE_COLORS.length] }));
};

// ── Componentes UI ────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, trend, color = '#F59E0B', loading }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-card-icon" style={{ background: `${color}1A`, color }}>{icon}</div>
    <div className="stat-card-body">
      <span className="stat-label">{label}</span>
      {loading ? <div className="stat-skeleton" /> : <span className="stat-value">{value}</span>}
      <span className="stat-sub" style={{ color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#94A3B8' }}>
        {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {sub}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
const Overview = () => {
  const { stats, allOrders, clients, loading } = useAdminContext();
  const [period, setPeriod] = useState('semana');

  // Todos los derivados con useMemo para no recalcular en cada render
  const weeklyData  = useMemo(() => groupByWeekday(allOrders), [allOrders]);
  const monthlyData = useMemo(() => groupByMonth(allOrders),   [allOrders]);
  const serviceData = useMemo(() => groupByService(allOrders), [allOrders]);

  const recent   = useMemo(() => allOrders.slice(0, 8), [allOrders]);
  const activity = useMemo(() => allOrders.slice(0, 5).map((o) => ({
    text:  o.tipo === 'pedido'
      ? `Tienda — $${(o.total || 0).toLocaleString('es-MX')}`
      : `${TIPO_LABELS[o.tipo] || 'Servicio'}: ${o.service}`,
    color: o.tipo === 'reserva' ? '#10B981' : o.tipo === 'cita' ? '#6366F1' : o.tipo === 'estancia' ? '#06B6D4' : '#F59E0B',
    time:  o.createdAt,
  })), [allOrders]);

  const chartData  = period === 'semana' ? weeklyData : monthlyData;
  const chartTotal = chartData.reduce((s, d) => s + d.value, 0);

  const serviciosTotal   = allOrders.filter((o) => ['reserva','cita','estancia'].includes(o.tipo)).length;
  const pedidosTienda    = allOrders.filter((o) => o.tipo === 'pedido').length;

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Panel General</h1>
          <p className="view-subtitle">reservas · citas · estancias · pedidos · usuarios</p>
        </div>
        <div className="period-tabs">
          {['semana', 'mes'].map((p) => (
            <button key={p} className={`period-tab${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              Esta {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid">
        <StatCard icon="💰" label="Ingresos completados"  value={`$${(stats.totalRevenue || 0).toLocaleString('es-MX')}`} sub="Servicios + tienda" trend={1} color="#F59E0B" loading={loading} />
        <StatCard icon="📅" label="Servicios totales"     value={serviciosTotal} sub="reservas + citas + hotel" trend={0} color="#6366F1" loading={loading} />
        <StatCard icon="🛒" label="Pedidos tienda"        value={pedidosTienda}  sub="colección pedidos"        trend={0} color="#10B981" loading={loading} />
        <StatCard icon="👥" label="Usuarios registrados"  value={clients.length} sub="en Firebase Auth"         trend={1} color="#EC4899" loading={loading} />
      </div>

      {/* Gráficas */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <span className="card-title">Ingresos — {period === 'semana' ? 'últimos 7 días' : 'últimos 6 meses'}</span>
            {chartTotal > 0 && <span className="card-value amber">${chartTotal.toLocaleString('es-MX')}</span>}
          </div>
          <div style={{ padding: '0 1rem 1rem' }}>
            {loading
              ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.82rem' }}>Cargando…</div>
              : chartData.every((d) => d.value === 0)
              ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.82rem' }}>Sin ingresos en este período</div>
              : <BarChart data={chartData} color="#F59E0B" height={130} />
            }
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {chartData.map((d, i) => (
                <span key={i} style={{ fontSize: '0.65rem', color: '#64748B', flex: 1, textAlign: 'center' }}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <span className="card-title">Tendencia mensual</span>
            {monthlyData.some((d) => d.value > 0) && <span className="card-badge green">Real</span>}
          </div>
          <div style={{ padding: '0 1rem 1rem' }}>
            {loading
              ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.82rem' }}>Cargando…</div>
              : monthlyData.every((d) => d.value === 0)
              ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.82rem' }}>Sin datos mensuales aún</div>
              : <LineChart data={monthlyData} color="#10B981" height={130} />
            }
          </div>
        </div>

        <div className="card chart-card chart-card--sm">
          <div className="card-header">
            <span className="card-title">Servicios más solicitados</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 1rem 1rem' }}>
            {loading
              ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.82rem' }}>Cargando…</div>
              : serviceData.length === 0
              ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.82rem', textAlign: 'center' }}>Sin servicios aún</div>
              : (
                <>
                  <DonutChart segments={serviceData} size={130} />
                  <div style={{ width: '100%', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {serviceData.map((s, i) => {
                      const total = serviceData.reduce((acc, x) => acc + x.value, 0);
                      const pct   = total > 0 ? Math.round((s.value / total) * 100) : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <span style={{ color: '#94A3B8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                          <span style={{ color: '#F1F5F9', fontWeight: 600, flexShrink: 0 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            }
          </div>
        </div>
      </div>

      {/* Tabla reciente + actividad */}
      <div className="bottom-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Actividad reciente</span>
            <span className="card-badge blue">EN VIVO</span>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Tipo</th><th>Servicio / Producto</th><th>Fecha</th><th>Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Cargando…</td></tr>
                  : recent.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Sin datos todavía</td></tr>
                  : recent.map((o) => {
                    const s = STATUS_LABELS[o.status] || STATUS_LABELS.pendiente;
                    const tipoBadge =
                      o.tipo === 'reserva'  ? { cls: 'badge-info',    txt: '📅 Reserva' } :
                      o.tipo === 'cita'     ? { cls: 'badge-info',    txt: '💉 Cita'    } :
                      o.tipo === 'estancia' ? { cls: 'badge-warning', txt: '🏨 Hotel'   } :
                                             { cls: 'badge-neutral',  txt: '🛒 Tienda'  };
                    return (
                      <tr key={`${o.tipo}-${o.id}`}>
                        <td><code style={{ fontSize: '0.7rem', color: '#6366F1' }}>{o.id.slice(-6)}</code></td>
                        <td><span className={`badge ${tipoBadge.cls}`}>{tipoBadge.txt}</span></td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.service}</td>
                        <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{o.createdAt}</td>
                        <td><strong style={{ color: '#F59E0B' }}>${(o.total || 0).toLocaleString('es-MX')}</strong></td>
                        <td><span className={`badge ${s.cls}`}>{s.text}</span></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Feed de actividad</span>
            <span className="card-badge blue">EN VIVO</span>
          </div>
          <ul className="activity-feed">
            {activity.length === 0
              ? <li style={{ padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>Sin actividad reciente</li>
              : activity.map((a, i) => (
              <li key={i} className="activity-item">
                <span className="activity-dot" style={{ background: a.color }} />
                <div className="activity-body">
                  <span className="activity-text">{a.text}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;