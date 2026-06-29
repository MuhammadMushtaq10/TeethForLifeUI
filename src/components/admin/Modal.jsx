// Reusable modal shell for the admin screens. Mirrors the look of the existing
// AppointmentModal (centered card, dark overlay, scrollable body, dark-mode aware).
export default function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${widths[size] || widths.lg} max-h-[90vh] overflow-y-auto`}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100 z-10">
          <h2 className="text-xl font-bold text-text-main">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
