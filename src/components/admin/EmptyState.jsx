import Icon from './Icon';

// Empty state with an optional call-to-action. The icon sits in a soft circle
// for a calm, premium look (emoji props render as line icons via <Icon>).
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', message, action }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-text-muted">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <p className="text-text-main font-semibold mt-4">{title}</p>
      {message && <p className="text-text-muted text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
