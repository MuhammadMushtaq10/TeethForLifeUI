import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AppointmentModal from '../../components/AppointmentModal';
import PaymentModal from '../../components/admin/PaymentModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { TableSkeleton } from '../../components/admin/Skeleton';
import EmptyState from '../../components/admin/EmptyState';
import client from '../../api/client';
import { getAppointmentInvoice } from '../../api/admin';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDate) params.append('date', filterDate);
    if (filterStatus) params.append('status', filterStatus);
    if (search) params.append('search', search);

    client
      .get(`/api/admin/appointments?${params.toString()}`)
      .then((res) => setAppointments(res.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [filterDate, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const updateStatus = async (id, status) => {
    try {
      await client.patch(`/api/admin/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

      // POS flow: completing an appointment auto-creates an invoice on the backend.
      if (status === 'COMPLETED') {
        let invoice = null;
        try { invoice = await getAppointmentInvoice(id); } catch { /* invoice lookup optional */ }
        if (invoice?.id) {
          setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, invoice_status: invoice.status } : a)));
          toast(
            (t) => (
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-main">Invoice auto-created. Add payment?</span>
                <button
                  onClick={() => { toast.dismiss(t.id); setPaymentInvoice(invoice); }}
                  className="bg-primary hover:bg-primary-dark text-white rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
                >
                  Add Payment
                </button>
              </div>
            ),
            { duration: 8000 }
          );
          return;
        }
      }
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (filterDate) params.append('from', filterDate);
    if (filterDate) params.append('to', filterDate);

    client
      .get(`/api/admin/appointments/export?${params.toString()}`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments-${filterDate || 'all'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Export failed'));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-6">Appointments</h2>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input-field !w-auto" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field !w-auto">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary !py-2 !px-4 text-sm">Search</button>
          </form>
          <button onClick={exportCSV} className="btn-outline !py-2 !px-4 text-sm">Export CSV</button>
          <button onClick={() => setModalOpen(true)} className="btn-primary !py-2 !px-4 text-sm">+ Add</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState icon="📅" title="No appointments found" message="Try adjusting the filters, or add a new appointment." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Service</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-main">{apt.patient_name}</p>
                      <p className="text-text-muted text-xs">{apt.patient_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-text-main">{apt.service_name}</td>
                    <td className="px-4 py-3 text-text-main whitespace-nowrap">{apt.appointment_date}</td>
                    <td className="px-4 py-3 text-text-main">{apt.appointment_time}</td>
                    <td className="px-4 py-3">
                      <select
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                        className={`text-xs font-medium rounded-lg px-2 py-1 border-0 cursor-pointer ${
                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          apt.status === 'NO_SHOW' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {apt.invoice_status ? <StatusBadge status={apt.invoice_status} /> : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.source === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs max-w-[150px] truncate">{apt.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AppointmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchAppointments} />
      <PaymentModal
        isOpen={!!paymentInvoice}
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
