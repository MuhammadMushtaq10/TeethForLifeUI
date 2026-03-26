import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import AppointmentModal from '../../components/AppointmentModal';
import client from '../../api/client';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED'];

export default function Appointments() {
  const { logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
      .then(res => setAppointments(res.data))
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
      toast.success(`Status updated to ${status}`);
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      );
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
      .then(res => {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦷</span>
            <h1 className="text-xl font-bold text-text-main">Appointments</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm text-text-muted hover:text-primary">Dashboard</Link>
            <Link to="/admin/patients" className="text-sm text-text-muted hover:text-primary">Patients</Link>
            <button onClick={logout} className="text-sm text-accent hover:text-red-700">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field !w-auto"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field !w-auto"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
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
            <button onClick={exportCSV} className="btn-outline !py-2 !px-4 text-sm">
              Export CSV
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary !py-2 !px-4 text-sm">
              + Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-text-muted">No appointments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Service</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
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
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.source === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {apt.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs max-w-[150px] truncate">
                        {apt.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
