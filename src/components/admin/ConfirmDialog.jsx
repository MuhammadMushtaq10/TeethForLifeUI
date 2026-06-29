import Modal from './Modal';

// Confirmation dialog shown before destructive actions (delete expense, cancel invoice).
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  danger = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-text-muted text-sm">{message}</p>
      <div className="flex gap-3 pt-6">
        <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2" disabled={busy}>
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`flex-1 !py-2 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-50 ${
            danger ? 'bg-accent hover:bg-red-400' : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
