import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { TableSkeleton } from '../../components/admin/Skeleton';
import EmptyState from '../../components/admin/EmptyState';
import { formatDate } from '../../utils/format';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = (query = '') => {
    setLoading(true);
    const params = query ? `?search=${encodeURIComponent(query)}` : '';
    client
      .get(`/api/admin/patients${params}`)
      .then((res) => setPatients(res.data))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-6">Patients</h2>

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
      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState icon="👥" title="No patients found" message="Patients will appear here once they book an appointment or are added manually." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <tr
                    key={patient.id}
                    onClick={() => navigate(`/admin/patients/${patient.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-primary">{patient.full_name}</td>
                    <td className="px-6 py-4 text-text-main">{patient.phone}</td>
                    <td className="px-6 py-4 text-text-muted">{patient.email || '—'}</td>
                    <td className="px-6 py-4 text-text-muted">{patient.date_of_birth ? formatDate(patient.date_of_birth) : '—'}</td>
                    <td className="px-6 py-4 text-text-muted whitespace-nowrap">{formatDate(patient.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-sm text-text-muted">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}
    </div>
  );
}
