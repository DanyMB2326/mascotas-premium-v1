/**
 * planNegocios.js
 * Fuente única de verdad para los datos del plan de negocios Paw Loyal.
 *
 * ¿Por qué este archivo?
 * Antes, COSTOS_OPERATIVOS, STAFF_NOMINA y NOMINA_TOTALES estaban
 * duplicados en Finanzas.jsx y Personal.jsx. Cualquier ajuste de
 * salario o costo requería editar dos archivos. Ahora hay uno solo.
 *
 * Uso:
 *   import { PLAN_STAFF, NOMINA_TOTALES, COSTOS_OPERATIVOS } from '../data/planNegocios';
 */

// ─────────────────────────────────────────────────────────────
// EQUIPO INICIAL
// ─────────────────────────────────────────────────────────────

/**
 * Plantilla de empleados del plan de negocios.
 * Se usa como fallback en Personal.jsx cuando la colección
 * `staff` de Firestore está vacía.
 */
export const PLAN_STAFF = [
  {
    name:        'Médico / Coordinador de servicios',
    role:        'Veterinario',
    salary:      18000,
    cargaSocial:  6300,
    costoTotal:  24300,
    schedule:    'Lun-Vie 9:00-18:00',
    status:      'activo',
    performance:  95,
  },
  {
    name:        'Estilista canina/felina (senior)',
    role:        'Groomer Senior',
    salary:      14000,
    cargaSocial:  4900,
    costoTotal:  18900,
    schedule:    'Mar-Sáb 8:00-17:00',
    status:      'activo',
    performance:  90,
  },
  {
    name:        'Estilista / Cuidador (junior)',
    role:        'Groomer',
    salary:      11000,
    cargaSocial:  3850,
    costoTotal:  14850,
    schedule:    'Lun-Vie 10:00-19:00',
    status:      'activo',
    performance:  82,
  },
  {
    name:        'Adiestrador certificado (part-time)',
    role:        'Adiestrador',
    salary:       8000,
    cargaSocial:  2800,
    costoTotal:  10800,
    schedule:    'Sáb-Dom 9:00-16:00',
    status:      'activo',
    performance:  88,
  },
  {
    name:        'Conductor / Asistente de transporte',
    role:        'Asistente',
    salary:       7000,
    cargaSocial:  2450,
    costoTotal:   9450,
    schedule:    'Lun-Sáb 7:00-15:00',
    status:      'activo',
    performance:  85,
  },
];

/** Alias para Finanzas.jsx (mismo dato, nombre que ya usaba) */
export const STAFF_NOMINA = PLAN_STAFF;

// ─────────────────────────────────────────────────────────────
// TOTALES DE NÓMINA
// Calculados automáticamente desde PLAN_STAFF — nunca hardcoded.
// ─────────────────────────────────────────────────────────────
const _bruta   = PLAN_STAFF.reduce((s, e) => s + e.salary,      0);
const _carga   = PLAN_STAFF.reduce((s, e) => s + e.cargaSocial, 0);
const _mensual = PLAN_STAFF.reduce((s, e) => s + e.costoTotal,  0);

export const NOMINA_TOTALES = {
  headcount:    PLAN_STAFF.length,
  bruta:        _bruta,
  carga:        _carga,
  mensual:      _mensual,
  anual:        _mensual * 12,
  // Aliases legacy (usados en la versión anterior de Finanzas.jsx)
  nominaBruta:  _bruta,
  cargaSocial:  _carga,
  costoMensual: _mensual,
  costoAnual:   _mensual * 12,
};

/** @deprecated usa NOMINA_TOTALES */
export const NOMINA = NOMINA_TOTALES;

// ─────────────────────────────────────────────────────────────
// COSTOS OPERATIVOS MENSUALES
// ─────────────────────────────────────────────────────────────

export const COSTOS_OPERATIVOS = [
  { concept: 'Insumos de estética, limpieza y baño', amount: 12000, category: 'operativos' },
  { concept: 'Productos para tienda en línea',        amount: 18000, category: 'inventario' },
  { concept: 'Transporte y combustible',              amount:  8000, category: 'operativos' },
  { concept: 'Publicidad digital',                    amount:  5000, category: 'marketing'  },
  { concept: 'Mantenimiento de equipo',               amount:  4000, category: 'operativos' },
  { concept: 'Hospedaje web y servicios digitales',   amount:  1500, category: 'operativos' },
  { concept: 'Sueldos o apoyo operativo',             amount: 35000, category: 'nomina'     },
  { concept: 'Otros gastos administrativos',          amount:  6000, category: 'operativos' },
];

/** Suma automática — nunca escribas 89500 a mano */
export const TOTAL_COSTOS_MENSUAL = COSTOS_OPERATIVOS.reduce((s, c) => s + c.amount, 0);

// ─────────────────────────────────────────────────────────────
// DATOS PARA GRÁFICA DE DISTRIBUCIÓN (BarChart de Finanzas)
// ─────────────────────────────────────────────────────────────

export const EGRESO_CHART = [
  { label: 'Nómina',    value: 35000 },
  { label: 'Tienda',    value: 18000 },
  { label: 'Insumos',  value: 12000 },
  { label: 'Transport',value:  8000 },
  { label: 'Admin',    value:  6000 },
  { label: 'Marketing',value:  5000 },
  { label: 'Equipo',   value:  4000 },
  { label: 'Web',      value:  1500 },
];

// ─────────────────────────────────────────────────────────────
// PROYECCIÓN DE INGRESOS (escenarios del plan)
// ─────────────────────────────────────────────────────────────

export const PROYECCION = {
  conservador: {
    mensual: 120000,
    get margen() { return (this.mensual - TOTAL_COSTOS_MENSUAL) / this.mensual; },
  },
  moderado: {
    mensual: 180000,
    get margen() { return (this.mensual - TOTAL_COSTOS_MENSUAL) / this.mensual; },
  },
  optimista: {
    mensual: 250000,
    get margen() { return (this.mensual - TOTAL_COSTOS_MENSUAL) / this.mensual; },
  },
};

// ─────────────────────────────────────────────────────────────
// HELPER — nómina desde empleados reales de Firestore
// ─────────────────────────────────────────────────────────────

/**
 * Calcula los totales de nómina para empleados reales de Firestore.
 * Cuando la colección `staff` tiene datos, Personal.jsx y Finanzas.jsx
 * deben usar esto en lugar de los valores del plan.
 *
 * @param {Array} employees — docs de Firestore (colección staff)
 * @returns {Object} — misma forma que NOMINA_TOTALES
 */
export const calcNominaFromEmployees = (employees) => {
  if (!employees?.length) return NOMINA_TOTALES;

  const bruta   = employees.reduce((s, e) => s + Number(e.salary || 0), 0);
  const carga   = employees.reduce((s, e) => {
    const cs = Number(e.cargaSocial || 0);
    return s + (cs > 0 ? cs : Math.round(Number(e.salary || 0) * 0.35));
  }, 0);
  const mensual = employees.reduce((s, e) => {
    const ct = Number(e.costoTotal || 0);
    return s + (ct > 0 ? ct : Number(e.salary || 0) + Math.round(Number(e.salary || 0) * 0.35));
  }, 0);

  return {
    headcount:    employees.length,
    bruta,
    carga,
    mensual,
    anual:        mensual * 12,
    nominaBruta:  bruta,
    cargaSocial:  carga,
    costoMensual: mensual,
    costoAnual:   mensual * 12,
  };
};