// Invoice status badge — refined pill with a status dot and a soft, theme-aware
// tint (subtle in both light and dark mode):
//   UNPAID -> rose, PARTIALLY_PAID -> amber, PAID -> emerald, CANCELLED -> slate.
const STYLES = {
  UNPAID: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20',
  PARTIALLY_PAID: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-500 dark:text-slate-300 ring-slate-500/20',
};

const LABELS = {
  UNPAID: 'Unpaid',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-text-muted">—</span>;
  const style = STYLES[status] || 'bg-slate-500/10 text-slate-500 ring-slate-500/20';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {LABELS[status] || status}
    </span>
  );
}
