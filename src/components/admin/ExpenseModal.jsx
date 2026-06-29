import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { createExpense, updateExpense } from '../../api/admin';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { todayISO } from '../../utils/format';

// Add or edit a clinic expense.
export default function ExpenseModal({ isOpen, onClose, expense, onSuccess }) {
  const isEdit = !!expense;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!isOpen) return;
    reset({
      expense_date: expense?.expense_date || todayISO(),
      category: expense?.category || 'SUPPLIES',
      description: expense?.description || '',
      vendor: expense?.vendor || '',
      receipt_number: expense?.receipt_number || '',
      amount: expense?.amount ?? '',
    });
  }, [isOpen, expense, reset]);

  const onSubmit = async (data) => {
    const payload = {
      expense_date: data.expense_date,
      category: data.category,
      description: data.description,
      vendor: data.vendor || undefined,
      receipt_number: data.receipt_number || undefined,
      amount: Number(data.amount),
    };
    try {
      if (isEdit) {
        await updateExpense(expense.id, payload);
        toast.success('Expense updated');
      } else {
        await createExpense(payload);
        toast.success('Expense added');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save expense');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Expense' : 'Add Expense'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Date *</label>
            <input type="date" {...register('expense_date', { required: 'Date is required' })} className="input-field" />
            {errors.expense_date && <p className="text-accent text-sm mt-1">{errors.expense_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Category *</label>
            <select {...register('category', { required: true })} className="input-field">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Description *</label>
          <input
            {...register('description', { required: 'Description is required' })}
            className="input-field"
            placeholder="What was this expense for?"
          />
          {errors.description && <p className="text-accent text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Vendor</label>
            <input {...register('vendor')} className="input-field" placeholder="Supplier / payee" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Receipt Number</label>
            <input {...register('receipt_number')} className="input-field" placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Amount (PKR) *</label>
          <input
            type="number"
            step="1"
            min="1"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 1, message: 'Amount must be greater than 0' },
            })}
            className="input-field"
            placeholder="0"
          />
          {errors.amount && <p className="text-accent text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
