/**
 * useAdminData.js — v5
 * Hook central del Dashboard Administrativo.
 *
 * Provee a todas las vistas sus datos via AdminDataContext,
 * eliminando suscripciones duplicadas en cada componente.
 *
 * Datos disponibles:
 *   stats       → KPIs combinados (pedidos + reservas)
 *   allOrders   → Array normalizado de las 4 colecciones (para Pedidos + Overview)
 *   clients     → Usuarios (para Clientes)
 *   inventory   → Productos (para Inventario)
 *   employees   → Staff (para Personal)
 *   finances    → { records, totalIncome, totalExpense, balance } (para Finanzas)
 *   trend       → Tendencia de ingresos 30 días (para Overview charts)
 *   topServices → Top 5 servicios (para Overview donut)
 *   topProducts → Top 10 productos (para Analíticas)
 *   loading     → true hasta que las 5 suscripciones principales dispararon
 *   refresh     → recarga datos de gráficas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToOrderStats,
  subscribeToAllOrders,
  subscribeToInventory,
  subscribeToClients,
  subscribeToEmployees,
  subscribeToFinances,
  fetchRevenueTrend,
  fetchTopServices,
  fetchTopProducts,
} from '../firebase/adminQueries';

const INITIAL_STATS = {
  totalRevenue: 0, dailySales: 0, weeklySales: 0, monthlySales: 0,
  pendingOrders: 0, activeOrders: 0, completedOrders: 0, canceledOrders: 0,
  recentOrders: [],
};

const INITIAL_FINANCES = {
  records: [], totalIncome: 0, totalExpense: 0, balance: 0,
};

export const useAdminData = () => {
  const [stats,      setStats]      = useState(INITIAL_STATS);
  const [allOrders,  setAllOrders]  = useState([]);
  const [clients,    setClients]    = useState([]);
  const [inventory,  setInventory]  = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [finances,   setFinances]   = useState(INITIAL_FINANCES);
  const [trend,      setTrend]      = useState([]);
  const [topServices,setTopServices]= useState([]);
  const [topProducts,setTopProducts]= useState([]);
  const [loading,    setLoading]    = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Suscripciones que cuentan para loading inicial
  // allOrders cuenta 1 (aunque internamente escucha 4 colecciones)
  const readyCount = useRef(0);
  const TOTAL_SUBS = 5; // stats, allOrders, inventory, clients, employees

  const markReady = useCallback(() => {
    readyCount.current += 1;
    if (readyCount.current >= TOTAL_SUBS) setLoading(false);
  }, []);

  // ── Efecto 1: suscripciones Firestore ────────────────────────
  useEffect(() => {
    readyCount.current = 0;

    const unsubs = [
      subscribeToOrderStats((data) => { setStats(data);     markReady(); }),
      subscribeToAllOrders( (data) => { setAllOrders(data); markReady(); }),
      subscribeToInventory( (data) => { setInventory(data); markReady(); }),
      subscribeToClients(   (data) => { setClients(data);   markReady(); }),
      subscribeToEmployees( (data) => { setEmployees(data); markReady(); }),
      subscribeToFinances(  (data) =>   setFinances(data)),
    ];

    return () => unsubs.forEach((u) => u?.());
  }, [markReady]);

  // ── Efecto 2: datos de gráficas ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadChartData() {
      const [trendData, servicesData, productsData] = await Promise.all([
        fetchRevenueTrend(30),
        fetchTopServices(5),
        fetchTopProducts(10),
      ]).catch((e) => {
        console.error('[useAdminData] gráficas:', e);
        return [[], [], []];
      });

      if (cancelled) return;
      setTrend(trendData);
      setTopServices(servicesData);
      setTopProducts(productsData);
    }

    loadChartData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // ── Derivados ─────────────────────────────────────────────────
  const lowStockAlerts   = inventory.filter((p) => (p.stock ?? 0) < 5);
  const outOfStockAlerts = inventory.filter((p) => (p.stock ?? 0) === 0);

  const startOfMonth    = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const newClientsCount = clients.filter((c) => {
    const d = c.createdAt?.toDate?.() ?? new Date(c.createdAt ?? 0);
    return d >= startOfMonth;
  }).length;

  return {
    stats, allOrders, clients, inventory, employees, finances,
    trend, topServices, topProducts,
    lowStockAlerts, outOfStockAlerts, newClientsCount,
    urgentPending:   stats.pendingOrders,
    activeEmployees: employees.filter((e) => e.status === 'activo').length,
    loading,
    refresh,
  };
};