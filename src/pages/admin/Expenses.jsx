import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getExpenses, deleteExpense, unwrapList } from '../../api/admin';
import StatCard from '../../components/admin/StatCard';
import EmptyState from '../../components/admin/EmptyState';
import { TableSkeleton, CardsSkeleton, ChartSkeleton } from '../../components/admin/Skeleton';
import ExpenseModal from '../../components/admin/ExpenseModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { formatPKR, formatAmount, formatDate } from '../../utils/format';
import { EXPENSE_CATEGORIES, expenseCategory } from '../../utils/constants';
import { useChartTheme, categoryColor } from '../../utils/chartTheme';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [byCategory, setByCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');

  const [modal, setModal] = useState({ open: false, expense: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const chart = useChartTheme();

  const fetchExpenses = useCallback(() => {
    setLoading(true);
    getExpenses({ from, to, category })
      .then((data) => {
        setExpenses(unwrapList(data, 'expenses', 'data'));
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setStats(data.stats || null);
          setByCategory(Array.isArray(data.byCategory) ? data.byCategory : null);
        }
      })
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [from, to, category]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // Chart data: prefer backend byCategory, otherwise aggregate the loaded rows.
  const chartData = useMemo(() => {
    if (byCategory && byCategory.length) {
      return byCategory.map((c) => ({ category: c.category, label: expenseCategory(c.category).label, amount: num(c.amount) }));
    }
    const totals = {};
    expenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + num(e.amount); });
    return EXPENSE_CATEGORIES
      .filter((c) => totals[c.value])
      .map((c) => ({ category: c.value, label: c.label, amount: totals[c.value] }));
  }, [byCategory, expenses]);

  // Fallback stats from loaded rows if backend omits them.
  const totalLoaded = expenses.reduce((s, e) => s + num(e.amount), 0);
  const largestFromChart = chartData.reduce((max, c) => (c.amount > (max?.amount || 0) ? c : max), null);

  const momChange = stats?.momChangePct ?? stats?.changePct;
  const momDefined = momChange !== undefined && momChange !== null && Number.isFinite(Number(momChange));
  const momValue = Number(momChange);

  const doDelete = async () => {
    setDeleteBusy(true);
    try {
      await deleteExpense(deleteTarget.id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete expense');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-text-main">Expenses</h2>
        <button onClick={() => setModal({ open: true, expense: null })} className="btn-primary !py-2 !px-5 text-sm">
          + Add Expense
        </button>
      </div>

      {/* Stat cards */}
      {loading && !stats ? (
        <CardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Total Expenses This Month"
            value={formatPKR(stats?.totalThisMonth ?? totalLoaded)}
            icon="💸" color="bg-accent"
          />
          <StatCard
            label="Largest Category This Month"
            value={
              stats?.largestCategory
                ? expenseCategory(stats.largestCategory).label
                : largestFromChart
                  ? largestFromChart.label
                  : '—'
            }
            sub={largestFromChart ? formatPKR(largestFromChart.amount) : undefined}
            icon="📊" color="bg-purple-500"
          />
          <StatCard
            label="This Month vs Last Month"
            value={momDefined ? `${momValue > 0 ? '+' : ''}${momValue.toFixed(1)}%` : '—'}
            sub={momDefined ? (momValue > 0 ? 'Higher than last month' : 'Lower than last month') : 'No prior data'}
            icon={momDefined && momValue > 0 ? '📈' : '📉'}
            color="bg-blue-500"
            tone={momDefined ? (momValue > 0 ? 'red' : 'green') : 'default'}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mt-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field !w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field !w-auto" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field !w-auto">
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {(from || to || category) && (
            <button onClick={() => { setFrom(''); setTo(''); setCategory(''); }} className="btn-outline !py-2 !px-4 text-sm">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <ChartSkeleton height={280} />
      ) : chartData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-text-main mb-4">Expenses by Category (this month)</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: chart.grid }} />
                <YAxis tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: chart.grid }} tickFormatter={formatAmount} width={70} />
                <Tooltip
                  cursor={{ fill: chart.grid, opacity: 0.3 }}
                  contentStyle={chart.tooltip}
                  formatter={(value) => [formatPKR(value), 'Amount']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={64}>
                  {chartData.map((d) => (
                    <Cell key={d.category} fill={categoryColor(d.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState
            icon="💸"
            title="No expenses recorded"
            message="Track clinic costs like supplies, salaries and rent to see them reflected in your reports."
            action={
              <button onClick={() => setModal({ open: true, expense: null })} className="btn-primary !py-2 !px-5 text-sm">
                + Add Expense
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
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Vendor</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Amount</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((e) => {
                  const cat = expenseCategory(e.category);
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-text-main whitespace-nowrap">{formatDate(e.expense_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cat.badge}`}>{cat.label}</span>
                      </td>
                      <td className="px-4 py-3 text-text-main">{e.description}</td>
                      <td className="px-4 py-3 text-text-muted">{e.vendor || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-text-main whitespace-nowrap">{formatPKR(e.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3 text-xs font-medium whitespace-nowrap">
                          <button onClick={() => setModal({ open: true, expense: e })} className="text-primary hover:text-primary-dark">Edit</button>
                          <button onClick={() => setDeleteTarget(e)} className="text-accent hover:text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-text-muted flex justify-between">
            <span>{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
            <span className="font-medium text-text-main">Total: {formatPKR(totalLoaded)}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseModal
        isOpen={modal.open}
        expense={modal.expense}
        onClose={() => setModal({ open: false, expense: null })}
        onSuccess={fetchExpenses}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        busy={deleteBusy}
        title="Delete Expense?"
        message={`"${deleteTarget?.description || ''}" (${formatPKR(deleteTarget?.amount)}) will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
