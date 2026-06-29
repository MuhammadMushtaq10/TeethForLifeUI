import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { addPayment } from '../../api/admin';
import { PAYMENT_METHODS } from '../../utils/constants';
import { formatPKR, todayISO } from '../../utils/format';

// Record a payment against an invoice. Reused by Billing, Patient profile and the
// Appointments POS flow.
export default function PaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const balance = Number(invoice?.balance ?? invoice?.balance_due ?? 0);

  useEffect(() => {
    if (isOpen) {
      reset({
        amount: balance > 0 ? balance : '',
        method: 'CASH',
        payment_date: todayISO(),
        received_by: '',
        notes: '',
      });
    }
  }, [isOpen, balance, reset]);

  const onSubmit = async (data) => {
    try {
      await addPayment(invoice.id, {
        amount: Number(data.amount),
        payment_method: data.method,
        payment_date: data.payment_date,
        received_by: data.received_by || undefined,
        notes: data.notes || undefined,
      });
      toast.success('Payment recorded');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    }
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment" size="md">
      <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Invoice</span>
          <span className="font-medium text-text-main">{invoice.invoice_number || `#${invoice.id}`}</span>
        </div>
        {invoice.patient_name && (
          <div className="flex justify-between mt-1">
            <span className="text-text-muted">Patient</span>
            <span className="font-medium text-text-main">{invoice.patient_name}</span>
          </div>
        )}
        <div className="flex justify-between mt-1">
          <span className="text-text-muted">Outstanding balance</span>
          <span className="font-semibold text-accent">{formatPKR(balance)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Amount (PKR) *</label>
          <input
            type="number"
            step="1"
            min="1"
            {...register('amount', {
              required: 'Amount is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Amount must be greater than 0' },
              max: balance > 0 ? { value: balance, message: `Cannot exceed balance of ${formatPKR(balance)}` } : undefined,
            })}
            className="input-field"
            placeholder="0"
          />
          {errors.amount && <p className="text-accent text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Payment Method *</label>
          <select {...register('method', { required: true })} className="input-field">
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Date *</label>
          <input type="date" {...register('payment_date', { required: 'Date is required' })} className="input-field" />
          {errors.payment_date && <p className="text-accent text-sm mt-1">{errors.payment_date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Received By</label>
          <input {...register('received_by')} className="input-field" placeholder="Staff name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="input-field" placeholder="Optional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
