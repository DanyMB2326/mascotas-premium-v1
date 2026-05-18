/**
 * formatters.js
 * Utilidades de formateo para Mascotas Premium / Paw Loyal.
 *
 * ¿Por qué este archivo?
 * El proyecto tiene lógica de formateo duplicada en al menos 8 componentes:
 *   toLocaleDateString('es-MX') → fechas
 *   toLocaleString('es-MX')     → moneda
 *   toDate()?.toLocaleDateString → Timestamps de Firestore
 *   slice(-6)                   → IDs cortos
 *
 * Centralizar aquí garantiza formato consistente en toda la app
 * y facilita cambiar el locale o la moneda en un solo lugar.
 *
 * Uso:
 *   import { formatCurrency, formatDate, formatId } from '../utils/formatters';
 */

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN GLOBAL
// ─────────────────────────────────────────────────────────────

const LOCALE   = 'es-MX';
const CURRENCY = 'MXN';

// ─────────────────────────────────────────────────────────────
// MONEDA
// ─────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda MXN.
 *
 * @param {number} amount
 * @param {object} options
 * @param {boolean} [options.symbol=true]   — incluir símbolo $
 * @param {boolean} [options.decimals=false]— mostrar centavos
 * @returns {string}  "$1,234" | "$1,234.50" | "1,234"
 *
 * @example
 * formatCurrency(1234.5)             // → "$1,235"
 * formatCurrency(1234.5, { decimals: true })  // → "$1,234.50"
 * formatCurrency(1234.5, { symbol: false })   // → "1,235"
 */
export const formatCurrency = (amount, { symbol = true, decimals = false } = {}) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '—';
  const num = Number(amount);

  if (symbol) {
    return new Intl.NumberFormat(LOCALE, {
      style:                 'currency',
      currency:              CURRENCY,
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    }).format(num);
  }

  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(num);
};

/**
 * Versión abreviada para valores grandes: $1.2k, $34.5k, $1.2M
 *
 * @param {number} amount
 * @returns {string}
 *
 * @example
 * formatCurrencyCompact(34500)   // → "$34.5k"
 * formatCurrencyCompact(1200000) // → "$1.2M"
 */
export const formatCurrencyCompact = (amount) => {
  if (!amount && amount !== 0) return '—';
  const num = Number(amount);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `$${(num / 1_000).toFixed(1)}k`;
  return formatCurrency(num);
};

// ─────────────────────────────────────────────────────────────
// FECHAS
// ─────────────────────────────────────────────────────────────

/**
 * Convierte cualquier valor de fecha a un objeto Date nativo.
 * Soporta: Timestamp de Firestore, Date, string ISO, number (epoch).
 *
 * @param {*} value
 * @returns {Date|null}
 */
export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate(); // Firestore Timestamp
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/**
 * Formatea una fecha en español de México.
 *
 * @param {*} value        — Date, Timestamp, string ISO o número
 * @param {'short'|'medium'|'long'|'full'} [style='medium']
 * @returns {string}
 *
 * Ejemplos:
 *   short  → "18/05/2026"
 *   medium → "18 may 2026"         ← default
 *   long   → "18 de mayo de 2026"
 *   full   → "lunes, 18 de mayo de 2026"
 */
export const formatDate = (value, style = 'medium') => {
  const date = toDate(value);
  if (!date) return '—';

  const OPTIONS = {
    short:  { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short',   year: 'numeric' },
    long:   { day: 'numeric', month: 'long',    year: 'numeric' },
    full:   { weekday: 'long', day: 'numeric',  month: 'long', year: 'numeric' },
  };

  return date.toLocaleDateString(LOCALE, OPTIONS[style] ?? OPTIONS.medium);
};

/**
 * Formatea una fecha y hora.
 *
 * @param {*} value
 * @param {boolean} [seconds=false] — incluir segundos
 * @returns {string}  "18 may 2026, 14:30"
 */
export const formatDateTime = (value, seconds = false) => {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleString(LOCALE, {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    ...(seconds && { second: '2-digit' }),
  });
};

/**
 * Tiempo relativo: "hace 5 minutos", "hace 2 días", "hace 3 meses".
 *
 * @param {*} value
 * @returns {string}
 */
export const formatRelativeTime = (value) => {
  const date = toDate(value);
  if (!date) return '—';

  const rtf    = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const diff   = date.getTime() - Date.now();            // negativo = pasado
  const absDiff = Math.abs(diff);

  const MINUTE = 60_000;
  const HOUR   = 3_600_000;
  const DAY    = 86_400_000;
  const WEEK   = 7 * DAY;
  const MONTH  = 30 * DAY;
  const YEAR   = 365 * DAY;

  if (absDiff < MINUTE)  return 'ahora mismo';
  if (absDiff < HOUR)    return rtf.format(Math.round(diff / MINUTE),  'minute');
  if (absDiff < DAY)     return rtf.format(Math.round(diff / HOUR),    'hour');
  if (absDiff < WEEK)    return rtf.format(Math.round(diff / DAY),     'day');
  if (absDiff < MONTH)   return rtf.format(Math.round(diff / WEEK),    'week');
  if (absDiff < YEAR)    return rtf.format(Math.round(diff / MONTH),   'month');
  return rtf.format(Math.round(diff / YEAR), 'year');
};

/**
 * Sólo la hora: "14:30" o "14:30:05"
 *
 * @param {*} value
 * @param {boolean} [seconds=false]
 * @returns {string}
 */
export const formatTime = (value, seconds = false) => {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString(LOCALE, {
    hour:   '2-digit',
    minute: '2-digit',
    ...(seconds && { second: '2-digit' }),
  });
};

// ─────────────────────────────────────────────────────────────
// IDs Y TEXTOS
// ─────────────────────────────────────────────────────────────

/**
 * ID corto para mostrar en tablas: últimos N caracteres en mayúsculas.
 *
 * @param {string} id
 * @param {number} [length=6]
 * @returns {string}  "A3F8C1"
 */
export const formatId = (id, length = 6) => {
  if (!id) return '—';
  return String(id).slice(-length).toUpperCase();
};

/**
 * Trunca un texto largo agregando "…" al final.
 *
 * @param {string} text
 * @param {number} [max=50]
 * @returns {string}
 */
export const truncate = (text, max = 50) => {
  if (!text) return '';
  const s = String(text);
  return s.length > max ? s.slice(0, max) + '…' : s;
};

/**
 * Primera letra en mayúscula.
 *
 * @param {string} text
 * @returns {string}
 */
export const capitalize = (text) => {
  if (!text) return '';
  return String(text).charAt(0).toUpperCase() + String(text).slice(1);
};

/**
 * Inicial(es) para avatares: "María García" → "MG"
 *
 * @param {string} name
 * @param {number} [count=1] — cantidad de iniciales
 * @returns {string}
 */
export const initials = (name, count = 1) => {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, count)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
};

// ─────────────────────────────────────────────────────────────
// TELÉFONO
// ─────────────────────────────────────────────────────────────

/**
 * Formatea un número de teléfono mexicano.
 * Soporta: "5512345678", "+525512345678", "55 1234 5678"
 *
 * @param {string} phone
 * @returns {string}  "+52 55 1234 5678" | número original si no es válido
 */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');

  // Con lada de país: +52 + 10 dígitos
  if (digits.length === 12 && digits.startsWith('52')) {
    const local = digits.slice(2);
    return `+52 ${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`;
  }
  // Solo 10 dígitos (México)
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  // Devolver sin modificar si no reconoce el formato
  return phone;
};

// ─────────────────────────────────────────────────────────────
// NÚMEROS Y PORCENTAJES
// ─────────────────────────────────────────────────────────────

/**
 * Formatea un porcentaje: 0.1234 → "12.3%"
 *
 * @param {number} value  — entre 0 y 1
 * @param {number} [decimals=1]
 * @returns {string}
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${(Number(value) * 100).toFixed(decimals)}%`;
};

/**
 * Formatea un número con separadores de miles.
 *
 * @param {number} value
 * @returns {string}  "1,234,567"
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(LOCALE).format(Number(value));
};

// ─────────────────────────────────────────────────────────────
// STOCK Y ESTADO
// ─────────────────────────────────────────────────────────────

/**
 * Etiqueta de stock para el inventario.
 *
 * @param {number} stock
 * @param {number} [min=5]
 * @returns {{ label: string, color: string }}
 */
export const stockStatus = (stock, min = 5) => {
  if (stock === 0)    return { label: 'Sin stock', color: '#EF4444' };
  if (stock <= min)   return { label: 'Stock bajo', color: '#F59E0B' };
  return               { label: 'OK', color: '#10B981' };
};

// ─────────────────────────────────────────────────────────────
// EXPORTACIÓN DE DATOS
// ─────────────────────────────────────────────────────────────

/**
 * Descarga un array de objetos como archivo CSV.
 *
 * @param {Array<Object>} rows    — datos a exportar
 * @param {string[]} [headers]   — nombres de columna; si omites, usa las keys del primer objeto
 * @param {string} [filename='export.csv']
 *
 * @example
 * downloadCSV(transactions, ['ID','Tipo','Monto','Fecha'], 'finanzas.csv');
 */
export const downloadCSV = (rows, headers, filename = 'export.csv') => {
  if (!rows?.length) return;

  const keys = headers ?? Object.keys(rows[0]);
  const escape = (val) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };

  const lines = [
    keys.join(','),
    ...rows.map((row) =>
      (headers
        ? Object.values(row)
        : Object.values(row)
      ).map(escape).join(',')
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};