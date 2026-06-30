// Centralised admin API layer for the POS + Accounting system.
// Every call goes through the shared axios `client` (baseURL + JWT interceptor).
//
// The backend is already built; the endpoint paths / response shapes below are the
// contract this UI assumes. They follow the existing conventions: everything under
// /api/admin/*, snake_case fields, UPPERCASE enum strings. List endpoints may return
// either a bare array or an object wrapping the array — pages use the `unwrap*`
// helpers below so the UI is resilient to either shape.

import client from './client';
import { downloadBlob } from '../utils/download';

// ---------------------------------------------------------------------------
// Response-shape helpers (defensive against array-vs-wrapped backend payloads)
// ---------------------------------------------------------------------------

/** Pull an array out of a response that may be `[...]`, `{ items: [...] }`, `{ data: [...] }`, etc. */
export function unwrapList(data, ...keys) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const k of keys) {
      if (Array.isArray(data[k])) return data[k];
    }
    // last resort: first array-valued property
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
  }
  return [];
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ===========================================================================
// Invoices
// ===========================================================================

/** POST /api/admin/invoices — body: { appointment_id, subtotal, discount_amount, discount_reason, notes } */
export function createInvoice(data) {
  return client.post('/api/admin/invoices', data).then((res) => res.data);
}

/** GET /api/admin/invoices?status=&from=&to=&search=&page=&limit= -> { invoices, total, stats } | [...] */
export function getInvoices(filters = {}) {
  return client.get(`/api/admin/invoices${buildQuery(filters)}`).then((res) => res.data);
}

/** GET /api/admin/invoices/:id -> full invoice incl. payments[] */
export function getInvoice(id) {
  return client.get(`/api/admin/invoices/${id}`).then((res) => res.data);
}

/** PATCH /api/admin/invoices/:id — body: { subtotal?, discount_amount?, discount_reason?, notes? } */
export function updateInvoice(id, data) {
  return client.patch(`/api/admin/invoices/${id}`, data).then((res) => res.data);
}

/** POST /api/admin/invoices/:id/payments — body: { amount, method, payment_date, received_by, notes } */
export function addPayment(invoiceId, data) {
  return client.post(`/api/admin/invoices/${invoiceId}/payments`, data).then((res) => res.data);
}

/** DELETE /api/admin/invoices/:id/cancel -> updated invoice (status CANCELLED) */
export function cancelInvoice(id) {
  return client.delete(`/api/admin/invoices/${id}/cancel`).then((res) => res.data);
}

/**
 * DELETE /api/admin/invoices/:id — hard-delete an invoice (for erroneous/test records;
 * prefer cancelInvoice for real corrections). The backend replies 409 (`HAS_PAYMENTS`)
 * if the invoice has payments; retry with { force: true } to delete it and its payments.
 */
export function deleteInvoice(id, { force = false } = {}) {
  return client.delete(`/api/admin/invoices/${id}${force ? '?force=true' : ''}`).then((res) => res.data);
}

/** DELETE /api/admin/invoices/:invoiceId/payments/:paymentId — removes one payment; backend re-derives the invoice's paid/unpaid status. */
export function deletePayment(invoiceId, paymentId) {
  return client.delete(`/api/admin/invoices/${invoiceId}/payments/${paymentId}`).then((res) => res.data);
}

/** GET /api/admin/invoices/:id/pdf -> blob; triggers a browser download named invoice-<number>.pdf */
export function downloadInvoicePdf(id, invoiceNumber) {
  return client
    .get(`/api/admin/invoices/${id}/pdf`, { responseType: 'blob' })
    .then((res) => {
      downloadBlob(res.data, `invoice-${invoiceNumber || id}.pdf`);
    });
}

// ===========================================================================
// Treatments
// ===========================================================================

/** POST /api/admin/treatments — body: { patient_id, appointment_id, service_id, tooth_numbers, diagnosis, treatment_notes, next_visit_notes } */
export function createTreatment(data) {
  return client.post('/api/admin/treatments', data).then((res) => res.data);
}

/** PATCH /api/admin/treatments/:id */
export function updateTreatment(id, data) {
  return client.patch(`/api/admin/treatments/${id}`, data).then((res) => res.data);
}

/** DELETE /api/admin/treatments/:id — leaf record, deletes immediately. */
export function deleteTreatment(id) {
  return client.delete(`/api/admin/treatments/${id}`).then((res) => res.data);
}

/** GET /api/admin/patients/:id/treatments -> [{ id, treatment_date, service_name, tooth_numbers, diagnosis, treatment_notes, next_visit_notes }] */
export function getPatientTreatments(patientId) {
  return client.get(`/api/admin/patients/${patientId}/treatments`).then((res) => res.data);
}

/** GET /api/admin/patients/:id/ledger -> { patient, summary: { totalVisits, totalCharged, totalPaid, outstanding }, invoices: [...] } */
export function getPatientLedger(patientId) {
  return client.get(`/api/admin/patients/${patientId}/ledger`).then((res) => res.data);
}

// ===========================================================================
// Expenses
// ===========================================================================

/** POST /api/admin/expenses — body: { expense_date, category, description, vendor, receipt_number, amount } */
export function createExpense(data) {
  return client.post('/api/admin/expenses', data).then((res) => res.data);
}

/** PATCH /api/admin/expenses/:id */
export function updateExpense(id, data) {
  return client.patch(`/api/admin/expenses/${id}`, data).then((res) => res.data);
}

/** DELETE /api/admin/expenses/:id */
export function deleteExpense(id) {
  return client.delete(`/api/admin/expenses/${id}`).then((res) => res.data);
}

/** GET /api/admin/expenses?from=&to=&category= -> { expenses, stats, byCategory } | [...] */
export function getExpenses(filters = {}) {
  return client.get(`/api/admin/expenses${buildQuery(filters)}`).then((res) => res.data);
}

// ===========================================================================
// Reports
// ===========================================================================

/** GET /api/admin/reports/daily?date=YYYY-MM-DD */
export function getDailyReport(date) {
  return client.get(`/api/admin/reports/daily${buildQuery({ date })}`).then((res) => res.data);
}

/** GET /api/admin/reports/monthly?year=&month= */
export function getMonthlyReport(year, month) {
  return client.get(`/api/admin/reports/monthly${buildQuery({ year, month })}`).then((res) => res.data);
}

/** GET /api/admin/reports/yearly?year= */
export function getYearlyReport(year) {
  return client.get(`/api/admin/reports/yearly${buildQuery({ year })}`).then((res) => res.data);
}

/** GET /api/admin/reports/outstanding -> [{ patient_id, patient_name, phone, invoice_number, balance, days_overdue }] */
export function getOutstandingBalances() {
  return client.get('/api/admin/reports/outstanding').then((res) => res.data);
}

/** GET /api/admin/reports/monthly/pdf?year=&month= -> blob; downloads monthly-report-YYYY-MM.pdf */
export function downloadMonthlyReportPdf(year, month) {
  return client
    .get(`/api/admin/reports/monthly/pdf${buildQuery({ year, month })}`, { responseType: 'blob' })
    .then((res) => {
      const mm = String(month).padStart(2, '0');
      downloadBlob(res.data, `monthly-report-${year}-${mm}.pdf`);
    });
}

/** GET /api/admin/reports/yearly/pdf?year= -> blob; downloads yearly-report-YYYY.pdf */
export function downloadYearlyReportPdf(year) {
  return client
    .get(`/api/admin/reports/yearly/pdf${buildQuery({ year })}`, { responseType: 'blob' })
    .then((res) => {
      downloadBlob(res.data, `yearly-report-${year}.pdf`);
    });
}

/** GET /api/admin/patients/:id/ledger/pdf -> blob; downloads patient-ledger-<name>.pdf */
export function downloadPatientLedgerPdf(patientId, patientName) {
  const safeName = (patientName || patientId).toString().trim().replace(/\s+/g, '-').toLowerCase();
  return client
    .get(`/api/admin/patients/${patientId}/ledger/pdf`, { responseType: 'blob' })
    .then((res) => {
      downloadBlob(res.data, `patient-ledger-${safeName}.pdf`);
    });
}

// ===========================================================================
// Supporting reads (needed by the POS/profile UI; not in the STEP 8 list but
// follow the same conventions). Kept here so the API surface stays in one place.
// ===========================================================================

/** GET /api/admin/patients/:id -> { id, full_name, phone, email, date_of_birth, created_at } */
export function getPatient(id) {
  return client.get(`/api/admin/patients/${id}`).then((res) => res.data);
}

/** GET /api/admin/appointments?patient_id=&status= -> appointments for a patient (used in dropdowns) */
export function getPatientAppointments(patientId, filters = {}) {
  return client
    .get(`/api/admin/appointments${buildQuery({ patient_id: patientId, ...filters })}`)
    .then((res) => res.data);
}

/** GET /api/admin/appointments/:id/invoice -> invoice for an appointment (or null). Used by the POS toast. */
export function getAppointmentInvoice(appointmentId) {
  return client.get(`/api/admin/appointments/${appointmentId}/invoice`).then((res) => res.data);
}

/**
 * DELETE /api/admin/appointments/:id — delete an appointment (prefer status CANCELLED for
 * real cancellations). The backend replies 409 (`HAS_INVOICE`) if a non-cancelled invoice is
 * linked; retry with { force: true } to delete the appointment (the invoice is kept but unlinked).
 */
export function deleteAppointment(id, { force = false } = {}) {
  return client.delete(`/api/admin/appointments/${id}${force ? '?force=true' : ''}`).then((res) => res.data);
}

/** GET /api/services -> service catalogue (shared with public site). */
export function getServices() {
  return client.get('/api/services').then((res) => res.data);
}
