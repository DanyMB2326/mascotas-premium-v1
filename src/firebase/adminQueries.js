/**
 * adminQueries.js
 * Todas las consultas de Firestore para el Dashboard Administrativo.
 *
 * ═══════════════════════════════════════════════════════════════
 *  COLECCIONES CANÓNICAS (v2 — unificadas)
 * ═══════════════════════════════════════════════════════════════
 *  users/{uid}           → perfil + role ('admin' | 'empleado' | 'cliente')
 *  users/{uid}/profile/data → nombre, apellido, teléfono, direcciones, tarjetas
 *  products/{id}         → inventario / tienda
 *  reservas/{id}         → servicios reservados (modalidad: cita | estancia | suscripcion)
 *  pedidos/{id}          → compras de la tienda online
 *  citas/{id}            → citas agendadas via Cita.jsx (flujo alternativo)
 *  estancias/{id}        → estancias de hotel (legado — leer desde Pedidos)
 *  transactions/{id}     → ingresos y egresos manuales (antes: finances)
 *  staff/{id}            → empleados (antes: employees)
 *  auditLog/{id}         → registro de actividad administrativa
 *
 *  ⚠️  ELIMINADAS / OBSOLETAS:
 *    orders    → reemplazada por pedidos + reservas
 *    employees → reemplazada por staff
 *    finances  → reemplazada por transactions
 * ═══════════════════════════════════════════════════════════════
 */

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot,
  serverTimestamp, Timestamp, writeBatch, increment,
} from 'firebase/firestore';
import { db } from './config';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Convierte un Timestamp de Firestore a Date nativo */
const toDate = (ts) => {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
};

/** Registra una acción en el log de auditoría */
export const logActivity = async (action, details, adminUid) => {
  await addDoc(collection(db, 'auditLog'), {
    action,
    details,
    adminUid,
    timestamp: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────────────────────
// STATS EN TIEMPO REAL — onSnapshot
// ─────────────────────────────────────────────────────────────

/**
 * Suscripción en tiempo real a estadísticas combinadas de
 * PEDIDOS (tienda) + RESERVAS (servicios).
 *
 * Antes: leía la colección 'orders' (obsoleta).
 * Ahora: combina 'pedidos' + 'reservas' — fuentes canónicas.
 */
export const subscribeToOrderStats = (callback) => {
  let pedidos  = [];
  let reservas = [];

  const merge = () => {
    const all = [...pedidos, ...reservas];
    const now          = new Date();
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek  = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue  = all.reduce((acc, o) => acc + (o.total || 0), 0);
    const dailySales    = all.filter(o => toDate(o.createdAt) >= startOfDay)
                             .reduce((a, o) => a + (o.total || 0), 0);
    const weeklySales   = all.filter(o => toDate(o.createdAt) >= startOfWeek)
                             .reduce((a, o) => a + (o.total || 0), 0);
    const monthlySales  = all.filter(o => toDate(o.createdAt) >= startOfMonth)
                             .reduce((a, o) => a + (o.total || 0), 0);

    // Normalizar estados entre las dos colecciones
    const getStatus = (o) => o.status || o.estado || 'pendiente';

    callback({
      totalRevenue,
      dailySales,
      weeklySales,
      monthlySales,
      pendingOrders:   all.filter(o => ['pendiente', 'pendiente-activacion'].includes(getStatus(o))).length,
      activeOrders:    all.filter(o => ['en_proceso', 'confirmada', 'confirmado'].includes(getStatus(o))).length,
      completedOrders: all.filter(o => ['completado', 'completada', 'entregado'].includes(getStatus(o))).length,
      canceledOrders:  all.filter(o => ['cancelado', 'cancelada'].includes(getStatus(o))).length,
      recentOrders:    [...all]
        .sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0))
        .slice(0, 10),
    });
  };

  const unsubPedidos = onSnapshot(
    query(collection(db, 'pedidos'), orderBy('createdAt', 'desc')),
    (snap) => {
      pedidos = snap.docs.map(d => ({ id: d.id, _col: 'pedidos', ...d.data() }));
      merge();
    },
    (err) => console.error('[adminQueries] pedidos:', err),
  );

  const unsubReservas = onSnapshot(
    query(collection(db, 'reservas'), orderBy('createdAt', 'desc')),
    (snap) => {
      reservas = snap.docs.map(d => ({ id: d.id, _col: 'reservas', ...d.data() }));
      merge();
    },
    (err) => console.error('[adminQueries] reservas:', err),
  );

  // Devuelve función de limpieza que cancela ambas suscripciones
  return () => {
    unsubPedidos();
    unsubReservas();
  };
};

/** Suscripción en tiempo real al inventario */
export const subscribeToInventory = (callback) => {
  return onSnapshot(
    collection(db, 'products'),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (err) => console.error('[adminQueries] products:', err),
  );
};

/** Suscripción en tiempo real a todos los usuarios */
export const subscribeToClients = (callback) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (err) => console.error('[adminQueries] users:', err),
  );
};

/**
 * Suscripción en tiempo real a empleados.
 * Antes: leía 'employees' (obsoleta).
 * Ahora: lee 'staff' — colección canónica.
 */
export const subscribeToEmployees = (callback) => {
  return onSnapshot(
    collection(db, 'staff'),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (err) => console.error('[adminQueries] staff:', err),
  );
};

/**
 * Suscripción al historial de transacciones financieras.
 * Antes: leía 'finances' (obsoleta).
 * Ahora: lee 'transactions' — colección canónica.
 */
export const subscribeToFinances = (callback) => {
  const q = query(
    collection(db, 'transactions'),
    orderBy('date', 'desc'),
    limit(100),
  );
  return onSnapshot(
    q,
    (snap) => {
      const records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const income  = records
        .filter(r => r.type === 'income' || r.type === 'ingreso')
        .reduce((a, r) => a + Number(r.amount || 0), 0);
      const expense = records
        .filter(r => r.type === 'expense' || r.type === 'egreso')
        .reduce((a, r) => a + Number(r.amount || 0), 0);
      callback({
        records,
        totalIncome:  income,
        totalExpense: expense,
        balance:      income - expense,
      });
    },
    (err) => console.error('[adminQueries] transactions:', err),
  );
};

// ─────────────────────────────────────────────────────────────
// PEDIDOS
// ─────────────────────────────────────────────────────────────

export const updateOrderStatus = async (col, orderId, status, adminUid) => {
  const field = col === 'reservas' ? 'estado' : 'status';
  await updateDoc(doc(db, col, orderId), {
    [field]:   status,
    updatedAt: serverTimestamp(),
  });
  await logActivity('update_order_status', { col, orderId, status }, adminUid);
};

export const getOrderById = async (col, orderId) => {
  const snap = await getDoc(doc(db, col, orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─────────────────────────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────────────────────────

export const addProduct = async (product, adminUid) => {
  const ref = await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity('add_product', { productId: ref.id, name: product.name }, adminUid);
  return ref.id;
};

export const updateProduct = async (productId, data, adminUid) => {
  await updateDoc(doc(db, 'products', productId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await logActivity('update_product', { productId, ...data }, adminUid);
};

export const deleteProduct = async (productId, adminUid) => {
  await deleteDoc(doc(db, 'products', productId));
  await logActivity('delete_product', { productId }, adminUid);
};

/** Ajuste atómico de stock con increment */
export const adjustStock = async (productId, delta, adminUid) => {
  await updateDoc(doc(db, 'products', productId), {
    stock:     increment(delta),
    updatedAt: serverTimestamp(),
  });
  await logActivity('adjust_stock', { productId, delta }, adminUid);
};

// ─────────────────────────────────────────────────────────────
// TRANSACCIONES FINANCIERAS (antes: finances)
// ─────────────────────────────────────────────────────────────

export const addTransaction = async (record, adminUid) => {
  await addDoc(collection(db, 'transactions'), {
    ...record,
    date:      serverTimestamp(),
    createdAt: serverTimestamp(),
    createdBy: adminUid,
  });
  await logActivity('add_transaction', { type: record.type, amount: record.amount }, adminUid);
};

/** @deprecated usa addTransaction */
export const addFinanceRecord = addTransaction;

// ─────────────────────────────────────────────────────────────
// EMPLEADOS (antes: employees — ahora: staff)
// ─────────────────────────────────────────────────────────────

export const addEmployee = async (employee, adminUid) => {
  const ref = await addDoc(collection(db, 'staff'), {
    ...employee,
    createdAt: serverTimestamp(),
  });
  await logActivity('add_employee', { employeeId: ref.id, name: employee.name }, adminUid);
  return ref.id;
};

export const updateEmployee = async (employeeId, data, adminUid) => {
  await updateDoc(doc(db, 'staff', employeeId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await logActivity('update_employee', { employeeId, ...data }, adminUid);
};

export const deleteEmployee = async (employeeId, adminUid) => {
  await deleteDoc(doc(db, 'staff', employeeId));
  await logActivity('delete_employee', { employeeId }, adminUid);
};

// ─────────────────────────────────────────────────────────────
// USUARIOS Y ROLES
// ─────────────────────────────────────────────────────────────

export const setUserRole = async (uid, role, adminUid) => {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
  await batch.commit();
  await logActivity('set_user_role', { targetUid: uid, role }, adminUid);
};

// ─────────────────────────────────────────────────────────────
// DATOS PARA GRÁFICAS
// ─────────────────────────────────────────────────────────────

/**
 * Ingresos agrupados por día para los últimos N días.
 * Combina pedidos completados + reservas completadas.
 */
export const fetchRevenueTrend = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceTs = Timestamp.fromDate(since);

  const COMPLETED = ['completado', 'completada', 'entregado', 'completed'];

  const [pedSnap, resSnap] = await Promise.all([
    getDocs(query(
      collection(db, 'pedidos'),
      where('createdAt', '>=', sinceTs),
      orderBy('createdAt', 'asc'),
    )),
    getDocs(query(
      collection(db, 'reservas'),
      where('createdAt', '>=', sinceTs),
      orderBy('createdAt', 'asc'),
    )),
  ]);

  const map = {};
  const allDocs = [
    ...pedSnap.docs.filter(d => COMPLETED.includes(d.data().status || d.data().estado)),
    ...resSnap.docs.filter(d => COMPLETED.includes(d.data().estado || d.data().status)),
  ];

  allDocs.forEach(d => {
    const date = toDate(d.data().createdAt)
      ?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    if (date) map[date] = (map[date] || 0) + (d.data().total || 0);
  });

  return Object.entries(map).map(([date, total]) => ({ date, total }));
};

/**
 * Top N servicios más solicitados.
 * Combina reservas y citas.
 */
export const fetchTopServices = async (topN = 5) => {
  const [resSnap, citSnap] = await Promise.all([
    getDocs(collection(db, 'reservas')),
    getDocs(collection(db, 'citas')),
  ]);

  const map = {};

  resSnap.docs.forEach(d => {
    const s = d.data().servicio?.nombre || d.data().serviceName || 'Sin categoría';
    map[s] = (map[s] || 0) + 1;
  });

  citSnap.docs.forEach(d => {
    const s = d.data().servicio?.nombre || d.data().service || d.data().tipo || 'Cita';
    map[s] = (map[s] || 0) + 1;
  });

  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }));
};

/**
 * Top N productos más vendidos (por cantidad).
 */
export const fetchTopProducts = async (topN = 10) => {
  const snap = await getDocs(collection(db, 'pedidos'));
  const counter = {};

  snap.docs.forEach(d => {
    const items = d.data().items || [];
    items.forEach(item => {
      const key = item.title || item.name || item.id;
      counter[key] = (counter[key] || 0) + (item.quantity || 1);
    });
  });

  return Object.entries(counter)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }));
};

/**
 * Clientes nuevos en el último mes.
 */
export const fetchNewClientsCount = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const snap = await getDocs(query(
    collection(db, 'users'),
    where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
  ));
  return snap.size;
};

/**
 * Auditlog: últimas N acciones del admin.
 */
export const fetchAuditLog = async (limitN = 20) => {
  const snap = await getDocs(query(
    collection(db, 'auditLog'),
    orderBy('timestamp', 'desc'),
    limit(limitN),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─────────────────────────────────────────────────────────────
// SUSCRIPCIÓN UNIFICADA — todas las órdenes/servicios
// Para Pedidos.jsx y Overview.jsx (elimina sus suscripciones locales)
// ─────────────────────────────────────────────────────────────

const extractPetName = (val) => {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.nombre || val.name || val.especie || '—';
  return String(val);
};

const normalizeOrder = (id, data, coleccion) => {
  const createdAtDate = toDate(data.createdAt) || toDate(data.checkIn) || null;

  const base = {
    id,
    coleccion,
    dateObj:   createdAtDate,
    createdAt: createdAtDate?.toLocaleDateString('es-MX') ?? '—',
    total:     data.price || data.total || 0,
    status:    data.status || data.estado || 'pendiente',
    userId:    data.userId || data.uid || null,
    notes:     data.notes || data.notas || '',
  };

  switch (coleccion) {
    case 'reservas':
      return {
        ...base,
        tipo:    'reserva',
        service: data.servicio?.nombre || data.serviceName || data.serviceId || 'Servicio',
        petName: extractPetName(data.mascota?.nombre || data.petName),
        date:    data.fecha  || data.date || '',
        time:    data.hora   || data.time || '',
      };
    case 'citas':
      return {
        ...base,
        tipo:    'cita',
        service: data.servicio?.nombre || data.service || data.tipo || 'Cita',
        petName: extractPetName(data.mascota?.nombre || data.petName),
        date:    data.fecha  || data.date || '',
        time:    data.hora   || data.time || '',
      };
    case 'estancias':
      return {
        ...base,
        tipo:    'estancia',
        service: `Hotel — ${data.noches || data.nights || 1} noche(s)`,
        petName: extractPetName(data.petName || data.pet),
        date:    data.checkIn || data.fecha || '',
        time:    '',
      };
    case 'pedidos':
    default:
      return {
        ...base,
        tipo:    'pedido',
        service: data.items?.map((i) => i.title || i.name).join(', ') || 'Tienda Online',
        petName: '—',
        date:    '',
        time:    '',
      };
  }
};

/**
 * Suscripción en tiempo real a las 4 colecciones de transacciones.
 * Devuelve array normalizado y ordenado por fecha descendente.
 * Usado por: Overview.jsx, Pedidos.jsx (elimina sus subscriptions locales).
 */
export const subscribeToAllOrders = (callback) => {
  let reservas  = [];
  let pedidos   = [];
  let citas     = [];
  let estancias = [];

  const merge = () => {
    const all = [...reservas, ...pedidos, ...citas, ...estancias].sort(
      (a, b) => (b.dateObj || 0) - (a.dateObj || 0),
    );
    callback(all);
  };

  // Sin orderBy — el ordenamiento lo hace merge() por dateObj.
  // Evita errores FAILED_PRECONDITION cuando un documento no tiene
  // el campo createdAt o el índice aún está construyéndose.
  const unsubRes = onSnapshot(
    collection(db, 'reservas'),
    (snap) => { reservas  = snap.docs.map((d) => normalizeOrder(d.id, d.data(), 'reservas'));  merge(); },
    (err)  => console.error('[subscribeToAllOrders] reservas:', err),
  );
  const unsubPed = onSnapshot(
    collection(db, 'pedidos'),
    (snap) => { pedidos   = snap.docs.map((d) => normalizeOrder(d.id, d.data(), 'pedidos'));   merge(); },
    (err)  => console.error('[subscribeToAllOrders] pedidos:', err),
  );
  const unsubCit = onSnapshot(
    collection(db, 'citas'),
    (snap) => { citas     = snap.docs.map((d) => normalizeOrder(d.id, d.data(), 'citas'));     merge(); },
    (err)  => console.error('[subscribeToAllOrders] citas:', err),
  );
  const unsubEst = onSnapshot(
    collection(db, 'estancias'),
    (snap) => { estancias = snap.docs.map((d) => normalizeOrder(d.id, d.data(), 'estancias')); merge(); },
    (err)  => console.error('[subscribeToAllOrders] estancias:', err),
  );

  return () => { unsubRes(); unsubPed(); unsubCit(); unsubEst(); };
};