// Shared formatting helpers for the admin POS + Accounting screens.
// All money is PKR, all dates render in Asia/Karachi time.

const TZ = 'Asia/Karachi';

/**
 * Format a number as Pakistani rupees, e.g. 12500 -> "PKR 12,500".
 * Decimals are dropped (clinic bills in whole rupees). Null/NaN render as "PKR 0".
 */
export function formatPKR(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? Math.round(n) : 0;
  return `PKR ${safe.toLocaleString('en-PK')}`;
}

/** Like formatPKR but without the "PKR " prefix (for tight table cells / chart axes). */
export function formatAmount(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? Math.round(n) : 0;
  return safe.toLocaleString('en-PK');
}

/**
 * Format a date as "15 Jun 2026" in Asia/Karachi.
 * Accepts a Date, an ISO string, or a "YYYY-MM-DD" string.
 */
export function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(d);
}

/** Format a date + time as "15 Jun 2026, 02:30 PM" in Asia/Karachi. */
export function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TZ,
  }).format(d);
}

/** "Jun 2026" — used in report month/year headings. */
export function formatMonthYear(year, month /* 1-12 */) {
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/** Today's date in Asia/Karachi as "YYYY-MM-DD" (for date-input defaults). */
export function todayISO() {
  // en-CA yields ISO-ordered YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

/**
 * Convert any date value (ISO timestamp, Date, or "YYYY-MM-DD") to the
 * "YYYY-MM-DD" string an <input type="date"> expects, evaluated in
 * Asia/Karachi. Returns "" for empty/invalid input. Used to prefill the
 * editable date fields when opening an edit modal (e.g. an invoice's
 * created_at timestamp -> its calendar date).
 */
export function toDateInput(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
