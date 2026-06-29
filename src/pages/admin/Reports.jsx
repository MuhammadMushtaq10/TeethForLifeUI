import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  getDailyReport, getMonthlyReport, getYearlyReport, getOutstandingBalances,
  downloadMonthlyReportPdf, downloadYearlyReportPdf, unwrapList,
} from '../../api/admin';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import { CardsSkeleton, ChartSkeleton, BlockSkeleton } from '../../components/admin/Skeleton';
import { formatPKR, formatAmount, formatDate, todayISO, MONTHS, MONTHS_SHORT } from '../../utils/format';
import { paymentMethodLabel } from '../../utils/constants';
import { useChartTheme, SERIES } from '../../utils/chartTheme';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const PIE_COLORS = ['#00A6FF', '#22c55e', '#f97316', '#8b5cf6', '#eab308', '#FF6B6B'];

const [CUR_YEAR, CUR_MONTH] = todayISO().split('-').map(Number);
const YEARS = Array.from({ length: 6 }, (_, i) => CUR_YEAR - i);

const TABS = [
  { key: 'daily', label: 'Daily' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function Reports() {
  const [tab, setTab] = useState('daily');
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-6">Reports</h2>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily' && <DailyTab />}
      {tab === 'monthly' && <MonthlyTab />}
      {tab === 'yearly' && <YearlyTab />}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-text-main mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DAILY
// ---------------------------------------------------------------------------
function DailyTab() {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chart = useChartTheme();

  const load = useCallback(() => {
    setLoading(true);
    getDailyReport(date)
      .then(setData)
      .catch(() => { setData(null); toast.error('Failed to load daily report'); })
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const breakdown = unwrapList(data?.paymentBreakdown || data?.payment_breakdown || [], 'breakdown')
    .map((b) => ({ name: paymentMethodLabel(b.method), value: num(b.amount) }))
    .filter((b) => b.value > 0);
  const appts = unwrapList(data?.appointmentsList || data?.appointments_list || data?.appointments || [], 'appointments');
  const apptCount = Array.isArray(data?.appointments) ? data.appointments.length : num(data?.appointments ?? data?.appointmentCount);
  const revenue = num(data?.revenue);
  const expenses = num(data?.expenses);
  const net = data?.netProfit != null ? num(data.netProfit) : revenue - expenses;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
        <label className="text-sm text-text-muted">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !w-auto" max={todayISO()} />
      </div>

      {loading ? (
        <CardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Revenue" value={formatPKR(revenue)} icon="💰" color="bg-green-500" />
          <StatCard label="Expenses" value={formatPKR(expenses)} icon="💸" color="bg-accent" />
          <StatCard label="Net Profit" value={formatPKR(net)} icon="📈" color="bg-blue-500" tone={net >= 0 ? 'green' : 'red'} />
          <StatCard label="Appointments" value={apptCount || 0} icon="📅" color="bg-purple-500" />
        </div>
      )}

      {loading ? (
        <ChartSkeleton height={260} />
      ) : (
        <ChartCard title="Payment Method Breakdown">
          {breakdown.length === 0 ? (
            <EmptyState icon="💳" title="No payments on this day" message="Payments received on the selected date will appear here." />
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>
                    {breakdown.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chart.tooltip} formatter={(value) => formatPKR(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      )}

      {loading ? (
        <BlockSkeleton lines={5} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-text-main">Appointments — {formatDate(date)}</h3>
          </div>
          {appts.length === 0 ? (
            <EmptyState icon="📅" title="No appointments" message="There were no appointments scheduled on this day." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Service</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appts.map((a, i) => (
                    <tr key={a.id ?? i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-text-main whitespace-nowrap">{a.appointment_time || '—'}</td>
                      <td className="px-4 py-3 text-text-main">{a.patient_name || '—'}</td>
                      <td className="px-4 py-3 text-text-main">{a.service_name || '—'}</td>
                      <td className="px-4 py-3 text-text-muted">{a.status || '—'}</td>
                      <td className="px-4 py-3">
                        {a.invoice_status ? <StatusBadge status={a.invoice_status} /> : <span className="text-text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MONTHLY
// ---------------------------------------------------------------------------
function MonthlyTab() {
  const [year, setYear] = useState(CUR_YEAR);
  const [month, setMonth] = useState(CUR_MONTH);
  const [data, setData] = useState(null);
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const chart = useChartTheme();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getMonthlyReport(year, month).catch(() => null),
      getOutstandingBalances().catch(() => []),
    ])
      .then(([report, out]) => {
        setData(report);
        const fromReport = unwrapList(report?.outstanding || [], 'outstanding');
        setOutstanding(fromReport.length ? fromReport : unwrapList(out, 'outstanding', 'data'));
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const revenue = num(data?.totalRevenue);
  const expenses = num(data?.totalExpenses);
  const net = data?.netProfit != null ? num(data.netProfit) : revenue - expenses;

  const byService = unwrapList(data?.revenueByService || [], 'revenueByService')
    .map((s) => ({ service: s.service || s.service_name || s.name, amount: num(s.amount) }))
    .sort((a, b) => b.amount - a.amount);
  const daily = unwrapList(data?.dailyRevenueExpenses || data?.daily || [], 'daily')
    .map((d) => ({ day: d.day ?? d.date, revenue: num(d.revenue), expenses: num(d.expenses) }));
  const topPatients = unwrapList(data?.topPatients || [], 'topPatients')
    .map((p) => ({ name: p.patient_name || p.name, amount: num(p.amount ?? p.total) }))
    .slice(0, 5);

  const sortedOutstanding = [...outstanding].sort((a, b) => num(b.days_overdue) - num(a.days_overdue));
  const maxSpend = topPatients.reduce((m, p) => Math.max(m, p.amount), 0);

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadMonthlyReportPdf(year, month);
    } catch {
      toast.error('Failed to download report PDF');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-field !w-auto">
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field !w-auto">
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={downloadPdf} disabled={pdfBusy} className="btn-outline !py-2 !px-4 text-sm ml-auto disabled:opacity-50">
          {pdfBusy ? 'Preparing...' : 'Download PDF'}
        </button>
      </div>

      {loading ? (
        <CardsSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard label="Total Revenue" value={formatPKR(revenue)} icon="💰" color="bg-green-500" />
          <StatCard label="Total Expenses" value={formatPKR(expenses)} icon="💸" color="bg-accent" />
          <StatCard label="Net Profit" value={formatPKR(net)} icon="📈" color="bg-blue-500" tone={net >= 0 ? 'green' : 'red'} />
          <StatCard label="New Patients" value={num(data?.newPatients)} icon="🧑" color="bg-purple-500" />
          <StatCard label="Appointments Completed" value={num(data?.appointmentsCompleted)} icon="✅" color="bg-primary" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <ChartSkeleton /> : (
          <ChartCard title="Revenue by Service">
            {byService.length === 0 ? (
              <EmptyState icon="📊" title="No revenue" message="No service revenue recorded this month." />
            ) : (
              <div style={{ width: '100%', height: Math.max(260, byService.length * 40) }}>
                <ResponsiveContainer>
                  <BarChart data={byService} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fill: chart.axis, fontSize: 12 }} tickFormatter={formatAmount} axisLine={{ stroke: chart.grid }} tickLine={false} />
                    <YAxis type="category" dataKey="service" width={120} tick={{ fill: chart.axis, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={false} />
                    <Tooltip cursor={{ fill: chart.grid, opacity: 0.3 }} contentStyle={chart.tooltip} formatter={(value) => [formatPKR(value), 'Revenue']} />
                    <Bar dataKey="amount" fill={SERIES.primary} radius={[0, 6, 6, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        )}

        {loading ? <ChartSkeleton /> : (
          <ChartCard title="Daily Revenue vs Expenses">
            {daily.length === 0 ? (
              <EmptyState icon="📈" title="No daily data" message="Daily revenue and expenses will appear here." />
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={daily} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="day" tick={{ fill: chart.axis, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={false} />
                    <YAxis tick={{ fill: chart.axis, fontSize: 12 }} tickFormatter={formatAmount} width={64} axisLine={{ stroke: chart.grid }} tickLine={false} />
                    <Tooltip contentStyle={chart.tooltip} formatter={(value) => formatPKR(value)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={SERIES.revenue} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke={SERIES.expenses} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <BlockSkeleton lines={5} /> : (
          <ChartCard title="Top 5 Patients by Spend">
            {topPatients.length === 0 ? (
              <EmptyState icon="🏆" title="No data" message="Top spending patients will appear here." />
            ) : (
              <ol className="space-y-3">
                {topPatients.map((p, i) => (
                  <li key={`${p.name}-${i}`}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-text-main font-medium">{i + 1}. {p.name}</span>
                      <span className="text-text-main font-semibold">{formatPKR(p.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${maxSpend ? (p.amount / maxSpend) * 100 : 0}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </ChartCard>
        )}

        {loading ? <BlockSkeleton lines={5} /> : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-text-main">Outstanding Balances</h3>
            </div>
            {sortedOutstanding.length === 0 ? (
              <EmptyState icon="✅" title="All settled" message="No outstanding balances. Every invoice is paid up." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-text-muted">Patient</th>
                      <th className="px-4 py-3 text-left font-medium text-text-muted">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-text-muted">Invoice #</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted">Amount Due</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedOutstanding.map((o, i) => {
                      const overdue = num(o.days_overdue);
                      return (
                        <tr key={i} className={`hover:bg-gray-50 ${overdue > 30 ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3 text-text-main">{o.patient_name || '—'}</td>
                          <td className="px-4 py-3 text-text-muted whitespace-nowrap">{o.phone || '—'}</td>
                          <td className="px-4 py-3 text-text-main whitespace-nowrap">{o.invoice_number || '—'}</td>
                          <td className="px-4 py-3 text-right font-medium text-accent whitespace-nowrap">{formatPKR(o.balance ?? o.amount_due)}</td>
                          <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${overdue > 30 ? 'text-red-600' : 'text-text-main'}`}>
                            {overdue}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// YEARLY
// ---------------------------------------------------------------------------
function YearlyTab() {
  const [year, setYear] = useState(CUR_YEAR);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const chart = useChartTheme();

  const load = useCallback(() => {
    setLoading(true);
    getYearlyReport(year)
      .then(setData)
      .catch(() => { setData(null); toast.error('Failed to load yearly report'); })
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const monthly = useMemo(() => {
    const rows = unwrapList(data?.monthly || data?.months || [], 'monthly');
    return rows.map((r) => {
      const idx = (Number(r.month) || 0) - 1;
      return {
        month: r.label || MONTHS_SHORT[idx] || r.month,
        revenue: num(r.revenue),
        expenses: num(r.expenses),
      };
    });
  }, [data]);

  // Best month = highest revenue (use backend value if given).
  const bestMonth = useMemo(() => {
    if (data?.bestMonth) return data.bestMonth;
    if (!monthly.length) return null;
    return monthly.reduce((best, m) => (m.revenue > (best?.revenue ?? -Infinity) ? m : best), null);
  }, [data, monthly]);
  const bestLabel = typeof bestMonth === 'string' ? bestMonth : bestMonth?.month;

  const revenue = num(data?.annualRevenue);
  const expenses = num(data?.annualExpenses);
  const profit = data?.annualProfit != null ? num(data.annualProfit) : revenue - expenses;

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadYearlyReportPdf(year);
    } catch {
      toast.error('Failed to download report PDF');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field !w-auto">
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={downloadPdf} disabled={pdfBusy} className="btn-outline !py-2 !px-4 text-sm ml-auto disabled:opacity-50">
          {pdfBusy ? 'Preparing...' : 'Download PDF'}
        </button>
      </div>

      {loading ? (
        <CardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Annual Revenue" value={formatPKR(revenue)} icon="💰" color="bg-green-500" />
          <StatCard label="Annual Expenses" value={formatPKR(expenses)} icon="💸" color="bg-accent" />
          <StatCard label="Annual Profit" value={formatPKR(profit)} icon="📈" color="bg-blue-500" tone={profit >= 0 ? 'green' : 'red'} />
          <StatCard label="Total Patients" value={num(data?.totalPatients)} icon="👥" color="bg-purple-500" />
        </div>
      )}

      {loading ? (
        <ChartSkeleton height={320} />
      ) : (
        <ChartCard title="Monthly Breakdown">
          {bestLabel && (
            <p className="text-sm text-text-muted mb-3">
              Best month: <span className="font-semibold text-green-600">{bestLabel}</span>
            </p>
          )}
          {monthly.length === 0 ? (
            <EmptyState icon="📊" title="No data" message="Monthly revenue and expenses will appear here." />
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={monthly} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: chart.axis, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={false} />
                  <YAxis tick={{ fill: chart.axis, fontSize: 12 }} tickFormatter={formatAmount} width={64} axisLine={{ stroke: chart.grid }} tickLine={false} />
                  <Tooltip cursor={{ fill: chart.grid, opacity: 0.3 }} contentStyle={chart.tooltip} formatter={(value) => formatPKR(value)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {monthly.map((m) => (
                      <Cell key={m.month} fill={m.month === bestLabel ? '#15803d' : SERIES.revenue} />
                    ))}
                  </Bar>
                  <Bar dataKey="expenses" name="Expenses" fill={SERIES.expenses} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}
