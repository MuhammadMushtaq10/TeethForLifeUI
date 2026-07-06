import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getPatient,
  getPatientLedger,
  getPatientTreatments,
  getInvoice,
  deleteTreatment,
  deletePayment,
  downloadInvoicePdf,
  downloadPatientLedgerPdf,
  unwrapList,
} from '../../api/admin';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import { BlockSkeleton, CardsSkeleton, TableSkeleton } from '../../components/admin/Skeleton';
import TreatmentModal from '../../components/admin/TreatmentModal';
import PaymentModal from '../../components/admin/PaymentModal';
import InvoiceModal from '../../components/admin/InvoiceModal';
import PatientModal from '../../components/admin/PatientModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Icon from '../../components/admin/Icon';
import { formatPKR, formatDate, formatDateTime } from '../../utils/format';
import { paymentMethodLabel } from '../../utils/constants';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'treatments', label: 'Treatment History' },
  { key: 'billing', label: 'Billing / Ledger' },
];

function computeSummary(invoices, treatments) {
  const active = invoices.filter((i) => i.status !== 'CANCELLED');
  const totalCharged = active.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const totalPaid = active.reduce((s, i) => s + (Number(i.paid) || 0), 0);
  const outstanding = active.reduce((s, i) => s + (Number(i.balance) || 0), 0);
  return {
    totalVisits: treatments.length || active.length,
    totalCharged,
    totalPaid,
    outstanding,
  };
}

function toothList(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value || '';
}

export default function PatientProfile() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerPdfBusy, setLedgerPdfBusy] = useState(false);

  // modals + row state
  const [treatmentModal, setTreatmentModal] = useState({ open: false, treatment: null });
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [editPayment, setEditPayment] = useState(null); // { payment, invoice }
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [paymentsCache, setPaymentsCache] = useState({});
  const [pdfBusyId, setPdfBusyId] = useState(null);
  const [treatmentDeleteTarget, setTreatmentDeleteTarget] = useState(null);
  const [paymentDeleteTarget, setPaymentDeleteTarget] = useState(null); // { payment, invoiceId }
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getPatient(id).catch(() => null),
      getPatientLedger(id).catch(() => null),
      getPatientTreatments(id).catch(() => []),
    ])
      .then(([pat, ledger, treats]) => {
        const invList = ledger ? unwrapList(ledger, 'invoices', 'data') : [];
        const treatList = unwrapList(treats, 'treatments', 'data');
        setPatient(ledger?.patient || pat || null);
        setInvoices(invList);
        setTreatments(treatList);
        setSummary(ledger?.summary || computeSummary(invList, treatList));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (invoice) => {
    if (expanded === invoice.id) {
      setExpanded(null);
      return;
    }
    setExpanded(invoice.id);
    if (!paymentsCache[invoice.id]) {
      const inline = unwrapList(invoice, 'payments');
      if (inline.length || Array.isArray(invoice.payments)) {
        setPaymentsCache((c) => ({ ...c, [invoice.id]: inline }));
      } else {
        try {
          const full = await getInvoice(invoice.id);
          setPaymentsCache((c) => ({ ...c, [invoice.id]: unwrapList(full, 'payments') }));
        } catch {
          setPaymentsCache((c) => ({ ...c, [invoice.id]: [] }));
        }
      }
    }
  };

  const handleInvoicePdf = async (invoice) => {
    setPdfBusyId(invoice.id);
    try {
      await downloadInvoicePdf(invoice.id, invoice.invoice_number);
    } catch {
      toast.error('Failed to download invoice PDF');
    } finally {
      setPdfBusyId(null);
    }
  };

  const doDeleteTreatment = async () => {
    setDeleteBusy(true);
    try {
      await deleteTreatment(treatmentDeleteTarget.id);
      toast.success('Treatment deleted');
      setTreatmentDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete treatment');
    } finally {
      setDeleteBusy(false);
    }
  };

  const doDeletePayment = async () => {
    const { payment, invoiceId } = paymentDeleteTarget;
    setDeleteBusy(true);
    try {
      await deletePayment(invoiceId, payment.id);
      toast.success('Payment deleted');
      // Drop it from the expanded list immediately, then reload ledger totals/status.
      setPaymentsCache((c) => ({
        ...c,
        [invoiceId]: (c[invoiceId] || []).filter((x) => x.id !== payment.id),
      }));
      setPaymentDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete payment');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleLedgerPdf = async () => {
    setLedgerPdfBusy(true);
    try {
      await downloadPatientLedgerPdf(id, patient?.full_name);
    } catch {
      toast.error('Failed to download ledger PDF');
    } finally {
      setLedgerPdfBusy(false);
    }
  };

  const patientName = patient?.full_name || 'Patient';

  return (
    <div>
      {/* Breadcrumb + name */}
      <div className="mb-6">
        <Link to="/admin/patients" className="text-sm text-text-muted hover:text-primary inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patients
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-text-main">{patientName}</h2>
            {patient?.phone && <p className="text-text-muted text-sm">{patient.phone}</p>}
          </div>
          {patient && (
            <button
              onClick={() => setEditPatientOpen(true)}
              className="btn-outline !py-2 !px-4 text-sm inline-flex items-center gap-2"
            >
              <Icon name="✏" className="w-4 h-4" />
              Edit Patient
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <>
              <BlockSkeleton lines={4} />
              <CardsSkeleton count={4} />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-text-main mb-4">Patient Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-text-muted">Full Name</dt>
                    <dd className="text-text-main font-medium mt-0.5">{patient?.full_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Phone</dt>
                    <dd className="text-text-main font-medium mt-0.5">{patient?.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Email</dt>
                    <dd className="text-text-main font-medium mt-0.5">{patient?.email || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Registered</dt>
                    <dd className="text-text-main font-medium mt-0.5">{formatDate(patient?.created_at)}</dd>
                  </div>
                </dl>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Visits" value={summary?.totalVisits ?? 0} icon="🦷" color="bg-blue-500" />
                <StatCard label="Total Charged" value={formatPKR(summary?.totalCharged)} icon="🧾" color="bg-purple-500" />
                <StatCard label="Total Paid" value={formatPKR(summary?.totalPaid)} icon="✅" color="bg-green-500" />
                <StatCard
                  label="Outstanding Balance"
                  value={formatPKR(summary?.outstanding)}
                  icon="⚠️"
                  color="bg-accent"
                  tone={Number(summary?.outstanding) > 0 ? 'red' : 'default'}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* TREATMENT HISTORY */}
      {tab === 'treatments' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-text-main">Treatment History</h3>
            <button onClick={() => setTreatmentModal({ open: true, treatment: null })} className="btn-primary !py-2 !px-4 text-sm">
              + Add Treatment
            </button>
          </div>

          {loading ? (
            <BlockSkeleton lines={6} />
          ) : treatments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm">
              <EmptyState
                icon="🦷"
                title="No treatments recorded"
                message="Add the first treatment entry to start building this patient's clinical history."
                action={
                  <button onClick={() => setTreatmentModal({ open: true, treatment: null })} className="btn-primary !py-2 !px-5 text-sm">
                    + Add Treatment
                  </button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {treatments.map((t) => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-semibold text-text-main">{t.service_name || 'Treatment'}</p>
                      <p className="text-xs text-text-muted">{formatDate(t.treatment_date || t.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setTreatmentModal({ open: true, treatment: t })}
                        title="Edit treatment"
                        aria-label="Edit treatment"
                        className="text-text-muted hover:text-primary"
                      >
                        <Icon name="✏" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTreatmentDeleteTarget(t)}
                        title="Delete treatment"
                        aria-label="Delete treatment"
                        className="text-text-muted hover:text-accent"
                      >
                        <Icon name="🗑" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {toothList(t.tooth_numbers) && (
                      <div>
                        <dt className="text-text-muted text-xs">Tooth Numbers</dt>
                        <dd className="text-text-main">{toothList(t.tooth_numbers)}</dd>
                      </div>
                    )}
                    {t.diagnosis && (
                      <div>
                        <dt className="text-text-muted text-xs">Diagnosis</dt>
                        <dd className="text-text-main">{t.diagnosis}</dd>
                      </div>
                    )}
                    {t.treatment_notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-text-muted text-xs">Treatment Notes</dt>
                        <dd className="text-text-main">{t.treatment_notes}</dd>
                      </div>
                    )}
                    {t.next_visit_notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-text-muted text-xs">Next Visit</dt>
                        <dd className="text-text-main">{t.next_visit_notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BILLING / LEDGER */}
      {tab === 'billing' && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h3 className="font-semibold text-text-main">Invoices &amp; Ledger</h3>
            <div className="flex gap-2">
              <button onClick={handleLedgerPdf} disabled={ledgerPdfBusy} className="btn-outline !py-2 !px-4 text-sm disabled:opacity-50">
                {ledgerPdfBusy ? 'Preparing...' : 'Download Ledger PDF'}
              </button>
              <button onClick={() => setInvoiceModalOpen(true)} className="btn-primary !py-2 !px-4 text-sm">
                + Create Invoice
              </button>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : invoices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm">
              <EmptyState
                icon="🧾"
                title="No invoices yet"
                message="Create an invoice from a completed appointment to start billing this patient."
                action={
                  <button onClick={() => setInvoiceModalOpen(true)} className="btn-primary !py-2 !px-5 text-sm">
                    + Create Invoice
                  </button>
                }
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-text-muted">Invoice #</th>
                      <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted">Total</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted">Paid</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted">Balance</th>
                      <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <FragmentRow
                        key={inv.id}
                        inv={inv}
                        expanded={expanded === inv.id}
                        payments={paymentsCache[inv.id]}
                        onToggle={() => toggleExpand(inv)}
                        onAddPayment={() => setPaymentInvoice(inv)}
                        onEditInvoice={() => setEditInvoice(inv)}
                        onEditPayment={(p) => setEditPayment({ payment: p, invoice: inv })}
                        onDeletePayment={(p) => setPaymentDeleteTarget({ payment: p, invoiceId: inv.id })}
                        onPdf={() => handleInvoicePdf(inv)}
                        pdfBusy={pdfBusyId === inv.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TreatmentModal
        isOpen={treatmentModal.open}
        treatment={treatmentModal.treatment}
        patientId={id}
        onClose={() => setTreatmentModal({ open: false, treatment: null })}
        onSuccess={load}
      />
      <InvoiceModal
        isOpen={invoiceModalOpen}
        patientId={id}
        onClose={() => setInvoiceModalOpen(false)}
        onSuccess={load}
      />
      <InvoiceModal
        isOpen={!!editInvoice}
        invoice={editInvoice}
        onClose={() => setEditInvoice(null)}
        onSuccess={load}
      />
      <PaymentModal
        isOpen={!!paymentInvoice}
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onSuccess={load}
      />
      <PaymentModal
        isOpen={!!editPayment}
        invoice={editPayment?.invoice}
        payment={editPayment?.payment}
        onClose={() => setEditPayment(null)}
        onSuccess={load}
      />
      <PatientModal
        isOpen={editPatientOpen}
        patient={patient}
        onClose={() => setEditPatientOpen(false)}
        onSuccess={load}
      />
      <ConfirmDialog
        isOpen={!!treatmentDeleteTarget}
        onClose={() => setTreatmentDeleteTarget(null)}
        onConfirm={doDeleteTreatment}
        busy={deleteBusy}
        title="Delete Treatment?"
        message={`This treatment record (${treatmentDeleteTarget?.service_name || 'Treatment'}, ${formatDate(treatmentDeleteTarget?.treatment_date || treatmentDeleteTarget?.created_at)}) will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
      <ConfirmDialog
        isOpen={!!paymentDeleteTarget}
        onClose={() => setPaymentDeleteTarget(null)}
        onConfirm={doDeletePayment}
        busy={deleteBusy}
        title="Delete Payment?"
        message={`This payment of ${formatPKR(paymentDeleteTarget?.payment?.amount)} will be permanently deleted and the invoice's paid balance recalculated. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
    </div>
  );
}

// Invoice row + expandable payment history.
function FragmentRow({ inv, expanded, payments, onToggle, onAddPayment, onEditInvoice, onEditPayment, onDeletePayment, onPdf, pdfBusy }) {
  const cancelled = inv.status === 'CANCELLED';
  // The ledger endpoint may send total_amount/total_paid/balance_due while the
  // billing list sends the short total/paid/balance aliases — accept either.
  const total = Number(inv.total ?? inv.total_amount) || 0;
  const paid = Number(inv.paid ?? inv.total_paid) || 0;
  const balance = Number(inv.balance ?? inv.balance_due) || 0;
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <button onClick={onToggle} className="font-medium text-primary hover:underline inline-flex items-center gap-1">
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {inv.invoice_number || `#${inv.id}`}
          </button>
        </td>
        <td className="px-4 py-3 text-text-main whitespace-nowrap">{formatDate(inv.created_at || inv.invoice_date)}</td>
        <td className="px-4 py-3 text-right text-text-main">{formatPKR(total)}</td>
        <td className="px-4 py-3 text-right text-text-main">{formatPKR(paid)}</td>
        <td className={`px-4 py-3 text-right font-medium ${balance > 0 ? 'text-accent' : 'text-text-main'}`}>
          {formatPKR(balance)}
        </td>
        <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-3 whitespace-nowrap text-xs font-medium">
            {!cancelled && balance > 0 && (
              <button onClick={onAddPayment} className="text-primary hover:text-primary-dark font-medium">+ Payment</button>
            )}
            {!cancelled && (
              <button onClick={onEditInvoice} title="Edit invoice" aria-label="Edit invoice" className="text-text-muted hover:text-primary">
                <Icon name="✏" className="w-4 h-4" />
              </button>
            )}
            <button onClick={onPdf} disabled={pdfBusy} title="Download PDF" aria-label="Download PDF" className="text-text-muted hover:text-text-main disabled:opacity-50">
              {pdfBusy ? '...' : <Icon name="⬇" className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={7} className="px-4 py-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Payment History</p>
            {payments == null ? (
              <p className="text-sm text-text-muted">Loading...</p>
            ) : payments.length === 0 ? (
              <p className="text-sm text-text-muted">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm bg-white rounded-lg px-3 py-2">
                    <span className="text-text-main font-medium">{formatPKR(p.amount)}</span>
                    <span className="text-text-muted">{paymentMethodLabel(p.method || p.payment_method)}</span>
                    <span className="text-text-muted">{formatDateTime(p.payment_date || p.created_at)}</span>
                    <span className="text-text-muted">{p.received_by ? `by ${p.received_by}` : ''}</span>
                    <span className="flex items-center gap-2">
                      {!cancelled && onEditPayment && (
                        <button
                          onClick={() => onEditPayment(p)}
                          title="Edit payment"
                          aria-label="Edit payment"
                          className="text-text-muted hover:text-primary"
                        >
                          <Icon name="✏" className="w-4 h-4" />
                        </button>
                      )}
                      {!cancelled && onDeletePayment && (
                        <button
                          onClick={() => onDeletePayment(p)}
                          title="Delete payment"
                          aria-label="Delete payment"
                          className="text-text-muted hover:text-accent"
                        >
                          <Icon name="🗑" className="w-4 h-4" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
