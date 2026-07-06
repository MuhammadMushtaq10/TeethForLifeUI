import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getInvoices, cancelInvoice, deleteInvoice, downloadInvoicePdf, unwrapList } from '../../api/admin';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import { TableSkeleton, CardsSkeleton } from '../../components/admin/Skeleton';
import InvoiceModal from '../../components/admin/InvoiceModal';
import PaymentModal from '../../components/admin/PaymentModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Icon from '../../components/admin/Icon';
import { formatPKR, formatDate } from '../../utils/format';
import { INVOICE_STATUSES } from '../../utils/constants';

// Invoices are shown all-at-once in a scrollable list (newest first) rather than
// paged. We still page the *fetch* under the hood in chunks so a backend that
// caps `limit` can't silently truncate the history.
const FETCH_CHUNK = 200;
const MAX_PAGES = 100; // safety cap: up to 20k invoices

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Newest first: by created_at / invoice_date desc, tie-broken by id desc.
const byNewest = (a, b) => {
  const da = new Date(a.created_at || a.invoice_date || 0).getTime();
  const db = new Date(b.created_at || b.invoice_date || 0).getTime();
  if (db !== da) return db - da;
  return num(b.id) - num(a.id);
};

export default function Billing() {
  const [raw, setRaw] = useState([]);
  const [serverTotal, setServerTotal] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteForce, setDeleteForce] = useState(false);
  const [pdfBusyId, setPdfBusyId] = useState(null);

  // Load every invoice matching the current filters, paging through the backend
  // in chunks and accumulating so nothing is lost to a server-side limit cap.
  const fetchInvoices = useCallback(() => {
    setLoading(true);
    (async () => {
      const all = [];
      const seen = new Set();
      let capturedStats = null;
      let reportedTotal = null;

      for (let page = 1; page <= MAX_PAGES; page++) {
        const data = await getInvoices({ status, from, to, search, page, limit: FETCH_CHUNK });
        const list = unwrapList(data, 'invoices', 'data');

        // Backend is assumed to return month-to-date stats independent of filters.
        if (!capturedStats && data && typeof data === 'object' && data.stats) capturedStats = data.stats;
        const t = Number(data?.total);
        if (Number.isFinite(t)) reportedTotal = t;

        let added = 0;
        for (const inv of list) {
          const key = inv.id ?? inv.invoice_number ?? JSON.stringify(inv);
          if (!seen.has(key)) { seen.add(key); all.push(inv); added += 1; }
        }

        // Stop when the page wasn't full (no more rows), nothing new came back
        // (backend ignores paging), or we've reached the reported total.
        if (list.length < FETCH_CHUNK || added === 0) break;
        if (reportedTotal != null && all.length >= reportedTotal) break;
      }

      return { all, reportedTotal, stats: capturedStats };
    })()
      .then(({ all, reportedTotal, stats }) => {
        setRaw(all);
        setServerTotal(reportedTotal);
        if (stats) setStats(stats);
      })
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [status, from, to, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Every matching invoice, newest first — rendered in one scrollable list.
  const rows = [...raw].sort(byNewest);
  const total = serverTotal != null ? serverTotal : raw.length;

  // Derived fallback stats from whatever invoices we have (used only if backend omits stats).
  const fallbackOutstanding = raw
    .filter((i) => i.status !== 'CANCELLED')
    .reduce((s, i) => s + num(i.balance), 0);

  const statCards = [
    {
      label: 'Total Revenue (this month)',
      value: formatPKR(stats?.totalRevenue ?? stats?.revenue ?? 0),
      icon: '💰', color: 'bg-green-500',
    },
    {
      label: 'Outstanding Balance',
      value: formatPKR(stats?.outstanding ?? fallbackOutstanding),
      icon: '⚠️', color: 'bg-accent', tone: 'red',
    },
    {
      label: 'Invoices This Month',
      value: stats?.invoicesThisMonth ?? stats?.invoiceCount ?? '—',
      icon: '🧾', color: 'bg-blue-500',
    },
    {
      label: 'Fully Paid This Month',
      value: stats?.fullyPaidThisMonth ?? stats?.paidCount ?? '—',
      icon: '✅', color: 'bg-purple-500', tone: 'green',
    },
  ];

  const doCancel = async () => {
    setCancelBusy(true);
    try {
      await cancelInvoice(cancelTarget.id);
      toast.success('Invoice cancelled');
      setCancelTarget(null);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel invoice');
    } finally {
      setCancelBusy(false);
    }
  };

  const openDelete = (inv) => {
    setDeleteForce(false); // start non-forced; escalate only if the API reports payments
    setDeleteTarget(inv);
  };

  const doDelete = async () => {
    setDeleteBusy(true);
    try {
      await deleteInvoice(deleteTarget.id, { force: deleteForce });
      toast.success('Invoice deleted');
      setDeleteTarget(null);
      setDeleteForce(false);
      fetchInvoices();
    } catch (err) {
      // 409 HAS_PAYMENTS on the first (non-forced) attempt — keep the dialog open and
      // escalate to a force-delete confirmation rather than failing outright.
      if (err.response?.status === 409 && !deleteForce) {
        setDeleteForce(true);
      } else {
        toast.error(err.response?.data?.error || 'Failed to delete invoice');
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  const handlePdf = async (inv) => {
    setPdfBusyId(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.invoice_number);
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setPdfBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-text-main">Billing</h2>
        <button onClick={() => setInvoiceModalOpen(true)} className="btn-primary !py-2 !px-5 text-sm">
          + New Invoice
        </button>
      </div>

      {/* Stat cards */}
      {loading && !stats ? (
        <CardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((c, i) => (
            <StatCard key={i} label={c.label} value={c.value} icon={c.icon} color={c.color} tone={c.tone} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mt-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field !w-auto">
            <option value="">All Statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field !w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field !w-auto" />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
            className="flex gap-2 flex-1 min-w-[200px]"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search patient name or invoice #..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary !py-2 !px-4 text-sm">Search</button>
          </form>
          {(status || from || to || search) && (
            <button
              onClick={() => { setStatus(''); setFrom(''); setTo(''); setSearch(''); setSearchInput(''); }}
              className="btn-outline !py-2 !px-4 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={8} />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState
            icon="🧾"
            title="No invoices found"
            message="No invoices match the current filters. Create a new invoice from a completed appointment."
            action={
              <button onClick={() => setInvoiceModalOpen(true)} className="btn-primary !py-2 !px-5 text-sm">
                + New Invoice
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 text-sm">
            <span className="font-medium text-text-main">All Invoices</span>
            <span className="text-text-muted">
              {total} invoice{total !== 1 ? 's' : ''}, newest first
            </span>
          </div>
          <div className="overflow-auto max-h-[65vh]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 [&>tr>th]:border-b [&>tr>th]:border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Invoice #</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Paid</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Balance</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((inv) => {
                  const cancellable = inv.status !== 'CANCELLED' && inv.status !== 'PAID';
                  const payable = inv.status !== 'CANCELLED' && num(inv.balance) > 0;
                  const editable = inv.status !== 'CANCELLED';
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-text-main whitespace-nowrap">
                        {inv.invoice_number || `#${inv.id}`}
                      </td>
                      <td className="px-4 py-3 text-text-main">
                        {inv.patient_id ? (
                          <Link to={`/admin/patients/${inv.patient_id}`} className="hover:text-primary">
                            {inv.patient_name || '—'}
                          </Link>
                        ) : (
                          inv.patient_name || '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-main whitespace-nowrap">{formatDate(inv.created_at || inv.invoice_date)}</td>
                      <td className="px-4 py-3 text-right text-text-main">{formatPKR(inv.total)}</td>
                      <td className="px-4 py-3 text-right text-text-main">{formatPKR(inv.paid)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${num(inv.balance) > 0 ? 'text-accent' : 'text-text-main'}`}>
                        {formatPKR(inv.balance)}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3 whitespace-nowrap text-xs font-medium">
                          {inv.patient_id && (
                            <Link to={`/admin/patients/${inv.patient_id}`} className="text-text-muted hover:text-text-main">View</Link>
                          )}
                          {payable && (
                            <button onClick={() => setPaymentInvoice(inv)} className="text-primary hover:text-primary-dark">Payment</button>
                          )}
                          {cancellable && (
                            <button onClick={() => setCancelTarget(inv)} className="text-accent hover:text-red-700">Cancel</button>
                          )}
                          {editable && (
                            <button
                              onClick={() => setEditInvoice(inv)}
                              title="Edit invoice"
                              aria-label="Edit invoice"
                              className="text-text-muted hover:text-primary"
                            >
                              <Icon name="✏" className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePdf(inv)}
                            disabled={pdfBusyId === inv.id}
                            title="Download PDF"
                            aria-label="Download PDF"
                            className="text-text-muted hover:text-text-main disabled:opacity-50"
                          >
                            {pdfBusyId === inv.id ? '...' : <Icon name="⬇" className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openDelete(inv)}
                            title="Delete invoice"
                            aria-label="Delete invoice"
                            className="text-text-muted hover:text-accent"
                          >
                            <Icon name="🗑" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} onSuccess={fetchInvoices} />
      <InvoiceModal
        isOpen={!!editInvoice}
        invoice={editInvoice}
        onClose={() => setEditInvoice(null)}
        onSuccess={fetchInvoices}
      />
      <PaymentModal
        isOpen={!!paymentInvoice}
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onSuccess={fetchInvoices}
      />
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={doCancel}
        busy={cancelBusy}
        title="Cancel Invoice?"
        message={`Invoice ${cancelTarget?.invoice_number || ''} will be marked as cancelled. This cannot be undone.`}
        confirmLabel="Cancel Invoice"
        cancelLabel="Keep Invoice"
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteForce(false); }}
        onConfirm={doDelete}
        busy={deleteBusy}
        title={deleteForce ? 'Delete invoice and its payments?' : 'Delete Invoice?'}
        message={
          deleteForce
            ? `Invoice ${deleteTarget?.invoice_number || ''} has recorded payments. Deleting it will also permanently remove those payment records. This cannot be undone. Consider cancelling the invoice instead.`
            : `Invoice ${deleteTarget?.invoice_number || ''} will be permanently deleted. This cannot be undone — to keep a record, use Cancel instead.`
        }
        confirmLabel={deleteForce ? 'Delete + Payments' : 'Delete'}
        cancelLabel="Keep Invoice"
      />
    </div>
  );
}
