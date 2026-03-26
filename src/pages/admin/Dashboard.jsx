import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppointmentModal from '../../components/AppointmentModal';
import client from '../../api/client';

export default function Dashboard() {
  const { logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    client
      .get('/api/admin/dashboard')
      .then(res => setDashboard(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  const statCards = dashboard
    ? [
        { label: "Today's Appointments", value: dashboard.todayCount, color: 'bg-blue-500' },
        { label: 'This Week', value: dashboard.weekCount, color: 'bg-green-500' },
        { label: 'Total Patients', value: dashboard.totalPatients, color: 'bg-purple-500' },
        { label: 'No-Show Rate (30d)', value: `${dashboard.noShowRate}%`, color: 'bg-orange-500' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦷</span>
            <h1 className="text-xl font-bold text-text-main">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/appointments" className="text-sm text-text-muted hover:text-primary">
              Appointments
            </Link>
            <Link to="/admin/patients" className="text-sm text-text-muted hover:text-primary">
              Patients
            </Link>
            <button onClick={logout} className="text-sm text-accent hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Appointment Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-text-main">Overview</h2>
          <button onClick={() => setModalOpen(true)} className="btn-primary !py-2 !px-5 text-sm">
            + Add Appointment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted">Loading dashboard...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                    <span className="text-white text-lg font-bold">
                      {['📅', '📆', '👥', '⚠️'][i]}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-text-main mt-1">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-text-main">Upcoming Appointments</h3>
                <Link to="/admin/appointments" className="text-primary text-sm hover:text-primary-dark">
                  View All →
                </Link>
              </div>

              {dashboard?.upcoming?.length === 0 ? (
                <div className="px-6 py-8 text-center text-text-muted">
                  No upcoming appointments.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-text-muted">Patient</th>
                        <th className="px-6 py-3 text-left font-medium text-text-muted">Service</th>
                        <th className="px-6 py-3 text-left font-medium text-text-muted">Date</th>
                        <th className="px-6 py-3 text-left font-medium text-text-muted">Time</th>
                        <th className="px-6 py-3 text-left font-medium text-text-muted">Status</th>
                        <th className="px-6 py-3 text-left font-medium text-text-muted">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dashboard?.upcoming?.map((apt) => (
                        <tr key={apt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-text-main">{apt.patient_name}</p>
                              <p className="text-text-muted text-xs">{apt.patient_phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-main">{apt.service_name}</td>
                          <td className="px-6 py-4 text-text-main">{apt.appointment_date}</td>
                          <td className="px-6 py-4 text-text-main">{apt.appointment_time}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                              apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              apt.source === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {apt.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}
