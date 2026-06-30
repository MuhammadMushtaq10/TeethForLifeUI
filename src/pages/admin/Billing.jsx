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

const PAGE_SIZE = 20;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

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
  const [page, setPage] = useState(1);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteForce, setDeleteForce] = useState(false);
  const [pdfBusyId, setPdfBusyId] = useState(null);

  const fetchInvoices = useCallback(() => {
    setLoading(true);
    getInvoices({ status, from, to, search, page, limit: PAGE_SIZE })
      .then((data) => {
        setRaw(unwrapList(data, 'invoices', 'data'));
        const t = Number(data?.total);
        setServerTotal(Number.isFinite(t) ? t : null);
        // Backend is assumed to return month-to-date stats independent of filters.
        if (data && typeof data === 'object' && data.stats) setStats(data.stats);
      })
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [status, from, to, search, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => { setPage(1); }, [status, from, to, search]);

  // Server-paginated when the backend reports a total; otherwise paginate client-side.
  const serverPaginated = serverTotal != null;
  const total = serverPaginated ? serverTotal : raw.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = serverPaginated ? raw : raw.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
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
                          <button onClick={() => handlePdf(inv)} disabled={pdfBusyId === inv.id} className="text-text-muted hover:text-text-main disabled:opacity-50">
                            {pdfBusyId === inv.id ? '...' : 'PDF'}
                          </button>
                          {cancellable && (
                            <button onClick={() => setCancelTarget(inv)} className="text-accent hover:text-red-700">Cancel</button>
                          )}
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

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm">
            <span className="text-text-muted">
              Showing {rows.length} of {total} invoice{total !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-text-main disabled:opacity-40 hover:bg-gray-100"
              >
                Prev
              </button>
              <span className="text-text-muted">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-text-main disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} onSuccess={fetchInvoices} />
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
