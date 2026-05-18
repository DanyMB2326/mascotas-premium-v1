/**
 * Analiticas.jsx
 * Métricas avanzadas de ventas, servicios y clientes.
 * Consume todo desde AdminDataContext — sin subscriptions propias.
 */

import { useState, useMemo } from 'react';
import { useAdminContext }   from '../AdminDashboard';
import { BarChart, LineChart, DonutChart } from '../charts/Charts';
import {
  formatCurrency, formatCurrencyCompact,
  formatNumber, formatPercent, formatDate, downloadCSV,
} from '../../../utils/formatters';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const COLORS    = ['#F59E0B','#10B981','#6366F1','#EC4899','#06B6D4','#EF4444','#8B5CF6'];

const getSegment = (u) => {
  const orders = u.totalPedidos || u.orders || 0;
  const spent  = u.totalGastado || u.totalSpent || 0;
  if (spent >= 10000 || orders >= 20) return 'VIP';
  if (orders >= 5)  return 'Frecuente';
  if (orders >= 1)  return 'Regular';
  return 'Nuevo';
};

// ─────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color = '#F59E0B', trend }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-card-icon" style={{ background: `${color}1A`, color }}>{icon}</div>
    <div className="stat-card-body">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ fontSize: '1.25rem' }}>{value}</span>
      {sub && (
        <span className="stat-sub" style={{ color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#64748B' }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {sub}
        </span>
      )}
    </div>
  </div>
);

const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.5rem 0 0.75rem' }}>
    <h3 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {children}
    </h3>
    {action}
  </div>
);

const RankRow = ({ rank, name, value, total, color = '#F59E0B', suffix = '' }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
      <span style={{ fontSize: '0.72rem', color: '#475569', width: 18, textAlign: 'right', flexShrink: 0 }}>{rank}</span>
      <span style={{ flex: 1, fontSize: '0.82rem', color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <div style={{ width: 80, height: 5, background: '#1C2333', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: '0.78rem', color, fontWeight: 700, minWidth: 55, textAlign: 'right', flexShrink: 0 }}>
        {suffix}{typeof value === 'number' && suffix === '$' ? formatCurrency(value) : value}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Vista principal
// ─────────────────────────────────────────────────────────────
const Analiticas = () => {
  const { allOrders, clients, inventory, loading } = useAdminContext();

  const [tab, setTab] = useState('ventas');

  // Fecha de referencia — calculada fuera de los memos para que el linter
  // pueda verificar correctamente las dependencias. Como thisMonth/thisYear
  // solo cambian una vez al mes, los memos son efectivos en la práctica.
  const now           = useMemo(() => new Date(), []);
  const thisMonth     = now.getMonth();
  const thisYear      = now.getFullYear();
  const lastMonth     = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const sixtyDaysAgo  = useMemo(() => {
    const date = new Date(now);
    date.setDate(now.getDate() - 60);
    return date;
  }, [now]);

  // ── VENTAS ───────────────────────────────────────────────────
  const ventasMetrics = useMemo(() => {
    const completedStatuses = ['completado','completada','entregado','completed'];

    const completed = allOrders.filter((o) => completedStatuses.includes(o.status));

    const thisMonthOrders = completed.filter((o) =>
      o.dateObj?.getMonth() === thisMonth && o.dateObj?.getFullYear() === thisYear,
    );
    const lastMonthOrders = completed.filter((o) =>
      o.dateObj?.getMonth() === lastMonth && o.dateObj?.getFullYear() === lastMonthYear,
    );

    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.total, 0);
    const revenueDelta     = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue)
      : 0;

    const totalRevenue    = completed.reduce((s, o) => s + o.total, 0);
    const avgTicket       = completed.length > 0 ? totalRevenue / completed.length : 0;
    const canceledCount   = allOrders.filter((o) => ['cancelado','cancelada'].includes(o.status)).length;
    const cancelRate      = allOrders.length > 0 ? canceledCount / allOrders.length : 0;

    // Ingresos por mes (últimos 6)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(thisYear, thisMonth - (5 - i), 1);
      const m     = d.getMonth();
      const y     = d.getFullYear();
      const value = completed
        .filter((o) => o.dateObj?.getMonth() === m && o.dateObj?.getFullYear() === y)
        .reduce((s, o) => s + o.total, 0);
      return { label: MONTHS_ES[m], value };
    });

    // Ingresos por día (últimos 14 días)
    const daily = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (13 - i));
      d.setHours(0, 0, 0, 0);
      const dayStr = d.toDateString();
      const value  = completed
        .filter((o) => o.dateObj?.toDateString() === dayStr)
        .reduce((s, o) => s + o.total, 0);
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, value };
    });

    return { thisMonthRevenue, lastMonthRevenue, revenueDelta, totalRevenue, avgTicket, cancelRate, canceledCount, monthlyRevenue, daily };
  }, [allOrders, thisMonth, thisYear, lastMonth, lastMonthYear, now]);

  // ── SERVICIOS ─────────────────────────────────────────────────
  const serviciosMetrics = useMemo(() => {
    const services = allOrders.filter((o) => ['reserva','cita','estancia'].includes(o.tipo));
    const totalServ = services.length;

    // Top servicios por cantidad
    const countMap = {};
    services.forEach((o) => {
      const k = o.service?.split('—')[0]?.trim() || 'Otro';
      countMap[k] = (countMap[k] || 0) + 1;
    });
    const topByCount = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([name, count], i) => ({ name, count, color: COLORS[i % COLORS.length] }));

    // Top servicios por ingreso
    const revenueMap = {};
    services.forEach((o) => {
      const k = o.service?.split('—')[0]?.trim() || 'Otro';
      revenueMap[k] = (revenueMap[k] || 0) + (o.total || 0);
    });
    const topByRevenue = Object.entries(revenueMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 7);
    const maxRevenue = topByRevenue[0]?.[1] || 1;

    // Horarios de mayor demanda
    const hourMap = {};
    services.forEach((o) => {
      if (!o.time) return;
      const h = o.time.split(':')[0];
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const busyHours = Object.entries(hourMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([h, count]) => ({ label: `${h}:00`, value: count }));

    // Donut por tipo
    const tipoMap = {};
    services.forEach((o) => { tipoMap[o.tipo] = (tipoMap[o.tipo] || 0) + 1; });
    const donutData = Object.entries(tipoMap).map(([tipo, count], i) => ({
      label: tipo === 'reserva' ? 'Reservas' : tipo === 'cita' ? 'Citas' : 'Hotel',
      value: count,
      color: COLORS[i],
    }));

    return { totalServ, topByCount, topByRevenue, maxRevenue, busyHours, donutData };
  }, [allOrders]);

  // ── CLIENTES ──────────────────────────────────────────────────
  const clientesMetrics = useMemo(() => {
    // Nuevos por mes (últimos 6) — usa thisMonth/thisYear definidos fuera
    const newByMonth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(thisYear, thisMonth - (5 - i), 1);
      const m = d.getMonth(); const y = d.getFullYear();
      const count = clients.filter((c) => {
        const cd = c.createdAt?.toDate?.() ?? new Date(c.createdAt ?? 0);
        return cd.getMonth() === m && cd.getFullYear() === y;
      }).length;
      return { label: MONTHS_ES[m], value: count };
    });

    // Segmentación
    const segments = { VIP: 0, Frecuente: 0, Regular: 0, Nuevo: 0 };
    clients.forEach((c) => { segments[getSegment(c)] = (segments[getSegment(c)] || 0) + 1; });
    const segDonut = Object.entries(segments)
      .filter(([, v]) => v > 0)
      .map(([label, value], i) => ({ label, value, color: COLORS[i] }));

    // Clientes inactivos — usa sixtyDaysAgo definido fuera
    const activeUserIds = new Set(allOrders
      .filter((o) => o.dateObj && o.dateObj >= sixtyDaysAgo)
      .map((o) => o.userId)
      .filter(Boolean),
    );
    const inactivos = clients.filter((c) => {
      const cd = c.createdAt?.toDate?.() ?? new Date(c.createdAt ?? 0);
      return cd < sixtyDaysAgo && !activeUserIds.has(c.id);
    }).length;

    // Top clientes por gasto
    const clientSpend = {};
    allOrders.forEach((o) => {
      if (!o.userId) return;
      clientSpend[o.userId] = (clientSpend[o.userId] || 0) + (o.total || 0);
    });
    const topClients = Object.entries(clientSpend)
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([uid, total]) => {
        const c = clients.find((x) => x.id === uid);
        return { name: c?.displayName || c?.email?.split('@')[0] || uid.slice(-6), total };
      });
    const maxSpend = topClients[0]?.total || 1;

    const newThisMonth = newByMonth[5]?.value || 0;
    const totalClients = clients.length;
    const retentionRate = totalClients > 0 ? activeUserIds.size / totalClients : 0;

    return { newByMonth, segDonut, inactivos, topClients, maxSpend, newThisMonth, totalClients, retentionRate, activeCount: activeUserIds.size };
  }, [clients, allOrders, thisMonth, thisYear, sixtyDaysAgo]);

  // ── INVENTARIO ────────────────────────────────────────────────
  const inventarioMetrics = useMemo(() => {
    const totalValue = inventory.reduce((s, p) => s + (p.stock ?? 0) * (p.price || p.precio || 0), 0);
    const outOfStock = inventory.filter((p) => (p.stock ?? 0) === 0);
    const lowStock   = inventory.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5);
    const okStock    = inventory.filter((p) => (p.stock ?? 0) > 5);

    // Distribución por categoría
    const catMap = {};
    inventory.forEach((p) => {
      const cat = p.category || p.categoria || 'Sin categoría';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const catDonut = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: COLORS[i % COLORS.length] }));

    // Stock por producto (top 10 con más stock)
    const topStock = [...inventory]
      .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0)).slice(0, 10)
      .map((p) => ({ label: (p.title || p.name || '—').slice(0, 20), value: p.stock ?? 0 }));

    return { totalValue, outOfStock, lowStock, okStock, catDonut, topStock };
  }, [inventory]);

  // ─────────────────────────────────────────────────────────────
  // Export handler
  // ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (tab === 'ventas') {
      downloadCSV(
        allOrders.map((o) => ({
          id:        o.id,
          tipo:      o.tipo,
          servicio:  o.service,
          mascota:   o.petName,
          total:     o.total,
          estado:    o.status,
          fecha:     o.createdAt,
        })),
        ['ID','Tipo','Servicio','Mascota','Total','Estado','Fecha'],
        'ventas-pawloyal.csv',
      );
    } else if (tab === 'clientes') {
      downloadCSV(
        clients.map((c) => ({
          uid:       c.id,
          nombre:    c.displayName || '',
          email:     c.email || '',
          telefono:  c.phone || c.telefono || '',
          mascotas:  c.mascotas?.length || 0,
          pedidos:   c.totalPedidos || 0,
          gastado:   c.totalGastado || 0,
          segmento:  getSegment(c),
          registrado: formatDate(c.createdAt),
        })),
        ['UID','Nombre','Email','Teléfono','Mascotas','Pedidos','Total Gastado','Segmento','Registrado'],
        'clientes-pawloyal.csv',
      );
    }
  };

  const TABS = [
    { id: 'ventas',     label: '💰 Ventas'      },
    { id: 'servicios',  label: '📅 Servicios'   },
    { id: 'clientes',   label: '👥 Clientes'    },
    { id: 'inventario', label: '🗃 Inventario'  },
  ];

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <h1 className="view-title">Analíticas</h1>
          <p className="view-subtitle">Métricas en tiempo real — {allOrders.length} transacciones · {clients.length} usuarios</p>
        </div>
        <button className="btn-secondary" onClick={handleExport}>📥 Exportar CSV</button>
      </div>

      {/* Tabs */}
      <div className="status-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`status-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Calculando métricas…</div>
      )}

      {/* ══════════════════════════════════ TAB: VENTAS ══ */}
      {!loading && tab === 'ventas' && (
        <>
          <div className="stats-grid" style={{ gap: '0.75rem' }}>
            <KpiCard icon="💰" label="Ingresos este mes"     value={formatCurrency(ventasMetrics.thisMonthRevenue)}   sub={`${formatPercent(ventasMetrics.revenueDelta)} vs mes anterior`} color="#F59E0B" trend={ventasMetrics.revenueDelta} />
            <KpiCard icon="🧾" label="Ticket promedio"       value={formatCurrency(ventasMetrics.avgTicket)}          sub="por transacción"   color="#6366F1" />
            <KpiCard icon="✅" label="Ingresos totales"      value={formatCurrencyCompact(ventasMetrics.totalRevenue)} sub="histórico"         color="#10B981" trend={1} />
            <KpiCard icon="❌" label="Tasa de cancelación"   value={formatPercent(ventasMetrics.cancelRate)}          sub={`${ventasMetrics.canceledCount} cancelados`} color="#EF4444" trend={-1} />
          </div>

          <SectionTitle>Ingresos últimos 14 días</SectionTitle>
          <div className="card chart-card">
            <div style={{ padding: '1rem' }}>
              {ventasMetrics.daily.every((d) => d.value === 0)
                ? <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>Sin ingresos completados en los últimos 14 días</p>
                : <BarChart data={ventasMetrics.daily} color="#F59E0B" height={140} />
              }
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                {ventasMetrics.daily.map((d, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', color: '#475569', flex: 1, textAlign: 'center', whiteSpace: 'nowrap' }}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          <SectionTitle>Ingresos mensuales (últimos 6 meses)</SectionTitle>
          <div className="card chart-card">
            <div style={{ padding: '1rem' }}>
              <LineChart data={ventasMetrics.monthlyRevenue} color="#10B981" height={130} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {ventasMetrics.monthlyRevenue.map((d, i) => (
                  <span key={i} style={{ fontSize: '0.65rem', color: '#475569', flex: 1, textAlign: 'center' }}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════ TAB: SERVICIOS ══ */}
      {!loading && tab === 'servicios' && (
        <>
          <div className="stats-grid" style={{ gap: '0.75rem' }}>
            <KpiCard icon="📅" label="Servicios totales"    value={formatNumber(serviciosMetrics.totalServ)} sub="reservas + citas + hotel" color="#6366F1" />
            <KpiCard icon="🏆" label="Servicio top"         value={serviciosMetrics.topByCount[0]?.name?.split(' ')[0] || '—'} sub={`${serviciosMetrics.topByCount[0]?.count || 0} veces`} color="#F59E0B" />
            <KpiCard icon="💰" label="Mayor ingreso"        value={serviciosMetrics.topByRevenue[0]?.[0]?.split(' ')[0] || '—'} sub={formatCurrency(serviciosMetrics.topByRevenue[0]?.[1] || 0)} color="#10B981" />
            <KpiCard icon="⏰" label="Hora más solicitada"  value={serviciosMetrics.busyHours[0]?.label || '—'} sub={`${serviciosMetrics.busyHours[0]?.value || 0} citas`} color="#EC4899" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <SectionTitle>Top 7 por cantidad de citas</SectionTitle>
              <div className="card" style={{ padding: '1.25rem' }}>
                {serviciosMetrics.topByCount.map((s, i) => (
                  <RankRow key={s.name} rank={i + 1} name={s.name} value={s.count}
                    total={serviciosMetrics.totalServ} color={s.color} />
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>Top 7 por ingresos generados</SectionTitle>
              <div className="card" style={{ padding: '1.25rem' }}>
                {serviciosMetrics.topByRevenue.map(([name, total], i) => (
                  <RankRow key={name} rank={i + 1} name={name} value={total}
                    total={serviciosMetrics.maxRevenue} color={COLORS[i % COLORS.length]} suffix="$" />
                ))}
              </div>
            </div>
          </div>

          {serviciosMetrics.donutData.length > 0 && (
            <>
              <SectionTitle>Distribución por tipo de servicio</SectionTitle>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <DonutChart segments={serviciosMetrics.donutData} size={140} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  {serviciosMetrics.donutData.map((s) => {
                    const pct = serviciosMetrics.totalServ > 0 ? Math.round((s.value / serviciosMetrics.totalServ) * 100) : 0;
                    return (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ color: '#94A3B8', flex: 1 }}>{s.label}</span>
                        <span style={{ color: '#F1F5F9', fontWeight: 700 }}>{pct}%</span>
                        <span style={{ color: '#64748B', fontSize: '0.75rem' }}>({s.value})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {serviciosMetrics.busyHours.length > 0 && (
            <>
              <SectionTitle>Horarios de mayor demanda</SectionTitle>
              <div className="card" style={{ padding: '1.25rem' }}>
                <BarChart data={serviciosMetrics.busyHours} color="#6366F1" height={100} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {serviciosMetrics.busyHours.map((d, i) => (
                    <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', color: '#64748B' }}>{d.label}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════ TAB: CLIENTES ══ */}
      {!loading && tab === 'clientes' && (
        <>
          <div className="stats-grid" style={{ gap: '0.75rem' }}>
            <KpiCard icon="👥" label="Total clientes"      value={formatNumber(clientesMetrics.totalClients)}  sub="registrados" color="#6366F1" />
            <KpiCard icon="🆕" label="Nuevos este mes"     value={clientesMetrics.newThisMonth}                sub="registros" color="#10B981" trend={1} />
            <KpiCard icon="🔄" label="Tasa de retención"  value={formatPercent(clientesMetrics.retentionRate)} sub="activos últimos 60 días" color="#F59E0B" />
            <KpiCard icon="😴" label="Clientes inactivos" value={clientesMetrics.inactivos}                    sub="+60 días sin actividad" color="#EF4444" trend={-1} />
          </div>

          <SectionTitle>Nuevos clientes por mes</SectionTitle>
          <div className="card chart-card">
            <div style={{ padding: '1rem' }}>
              <BarChart data={clientesMetrics.newByMonth} color="#6366F1" height={120} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {clientesMetrics.newByMonth.map((d, i) => (
                  <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#64748B' }}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {clientesMetrics.segDonut.length > 0 && (
              <div>
                <SectionTitle>Segmentación de clientes</SectionTitle>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <DonutChart segments={clientesMetrics.segDonut} size={120} />
                  <div>
                    {clientesMetrics.segDonut.map((s) => {
                      const pct = clientesMetrics.totalClients > 0 ? Math.round((s.value / clientesMetrics.totalClients) * 100) : 0;
                      return (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>{s.label}</span>
                          <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.78rem' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div>
              <SectionTitle>Top clientes por gasto total</SectionTitle>
              <div className="card" style={{ padding: '1.25rem' }}>
                {clientesMetrics.topClients.length === 0
                  ? <p style={{ color: '#64748B', fontSize: '0.82rem' }}>Sin datos suficientes</p>
                  : clientesMetrics.topClients.map((c, i) => (
                    <RankRow key={c.name} rank={i + 1} name={c.name} value={c.total}
                      total={clientesMetrics.maxSpend} color={COLORS[i % COLORS.length]} suffix="$" />
                  ))
                }
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════ TAB: INVENTARIO ══ */}
      {!loading && tab === 'inventario' && (
        <>
          <div className="stats-grid" style={{ gap: '0.75rem' }}>
            <KpiCard icon="📦" label="Total productos"    value={inventory.length}                                  sub="en catálogo"           color="#6366F1" />
            <KpiCard icon="💰" label="Valor del stock"    value={formatCurrencyCompact(inventarioMetrics.totalValue)} sub="precio × unidades"   color="#F59E0B" />
            <KpiCard icon="⛔" label="Sin stock"          value={inventarioMetrics.outOfStock.length}                sub="requieren restock"     color="#EF4444" trend={-1} />
            <KpiCard icon="⚠️" label="Stock bajo"         value={inventarioMetrics.lowStock.length}                 sub="menos de 5 unidades"   color="#F59E0B" />
          </div>

          {inventarioMetrics.catDonut.length > 0 && (
            <>
              <SectionTitle>Distribución por categoría</SectionTitle>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <DonutChart segments={inventarioMetrics.catDonut} size={130} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  {inventarioMetrics.catDonut.map((s) => {
                    const pct = inventory.length > 0 ? Math.round((s.value / inventory.length) * 100) : 0;
                    return (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ color: '#94A3B8', flex: 1 }}>{s.label}</span>
                        <span style={{ color: '#F1F5F9', fontWeight: 700 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <SectionTitle>Top 10 productos por cantidad en stock</SectionTitle>
          <div className="card" style={{ padding: '1.25rem' }}>
            {inventarioMetrics.topStock.length === 0
              ? <p style={{ color: '#64748B' }}>Sin productos</p>
              : <BarChart data={inventarioMetrics.topStock} color="#6366F1" height={120} />
            }
          </div>

          {inventarioMetrics.outOfStock.length > 0 && (
            <>
              <SectionTitle>⛔ Productos sin stock — acción requerida</SectionTitle>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {inventarioMetrics.outOfStock.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.7rem 1rem', borderTop: i > 0 ? '1px solid #1C2333' : 'none',
                  }}>
                    {(p.image || p.imageURL) && <img src={p.image || p.imageURL} alt={p.title || p.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                    <span style={{ flex: 1, fontSize: '0.85rem', color: '#F1F5F9' }}>{p.title || p.name || '—'}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{p.category || '—'}</span>
                    <strong style={{ color: '#EF4444', fontSize: '0.82rem' }}>0 uds.</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Analiticas;