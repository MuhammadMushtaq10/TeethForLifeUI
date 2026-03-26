import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import client from '../../api/client';

export default function Patients() {
  const { logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = (query = '') => {
    setLoading(true);
    const params = query ? `?search=${encodeURIComponent(query)}` : '';
    client
      .get(`/api/admin/patients${params}`)
      .then(res => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦷</span>
            <h1 className="text-xl font-bold text-text-main">Patients</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm text-text-muted hover:text-primary">Dashboard</Link>
            <Link to="/admin/appointments" className="text-sm text-text-muted hover:text-primary">Appointments</Link>
            <button onClick={logout} className="text-sm text-accent hover:text-red-700">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary !py-2 !px-6 text-sm">Search</button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchPatients(); }}
                className="btn-outline !py-2 !px-4 text-sm"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-text-muted">No patients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-text-muted">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-text-muted">Phone</th>
                    <th className="px-6 py-3 text-left font-medium text-text-muted">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-text-muted">Date of Birth</th>
                    <th className="px-6 py-3 text-left font-medium text-text-muted">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-text-main">{patient.full_name}</td>
                      <td className="px-6 py-4 text-text-main">{patient.phone}</td>
                      <td className="px-6 py-4 text-text-muted">{patient.email || '—'}</td>
                      <td className="px-6 py-4 text-text-muted">{patient.date_of_birth || '—'}</td>
                      <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-6 py-3 border-t bg-gray-50 text-sm text-text-muted">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </div>
    </div>
  );
}
