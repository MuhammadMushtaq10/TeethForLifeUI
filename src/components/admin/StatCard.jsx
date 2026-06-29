import Icon from './Icon';

// Summary stat card used across Dashboard, Billing, Expenses and Reports.
// `tone` colours only the value text; the icon sits in a soft, theme-aware
// tinted chip (works in both light and dark mode). The legacy solid `color`
// prop (e.g. "bg-green-500") is mapped to a muted accent so existing call
// sites keep working without changes.
const TONES = {
  default: 'text-text-main',
  green: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-rose-600 dark:text-rose-400',
  amber: 'text-amber-600 dark:text-amber-400',
};

const ACCENTS = {
  'bg-green-500': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-blue-500': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'bg-purple-500': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'bg-orange-500': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'bg-accent': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'bg-primary': 'bg-primary/10 text-primary',
};
const DEFAULT_ACCENT = 'bg-slate-500/10 text-slate-600 dark:text-slate-300';

export default function StatCard({ label, value, sub, icon, color = 'bg-primary', tone = 'default', loading }) {
  const accent = ACCENTS[color] || DEFAULT_ACCENT;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="h-8 mt-3 w-24 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className={`text-[1.7rem] leading-none font-semibold mt-3 tracking-tight ${TONES[tone] || TONES.default}`}>
              {value}
            </p>
          )}
          {sub && !loading && <p className="text-xs text-text-muted mt-2">{sub}</p>}
        </div>
        {icon && (
          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-inset ring-black/5 ${accent}`}>
            <Icon name={icon} className="w-[22px] h-[22px]" />
          </div>
        )}
      </div>
    </div>
  );
}
