// Shared enums for the POS + Accounting screens. Values are the UPPERCASE strings
// the backend expects; labels are the human-friendly display text.

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' },
];

export function paymentMethodLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || value || '—';
}

export const EXPENSE_CATEGORIES = [
  { value: 'SUPPLIES', label: 'Supplies', badge: 'bg-blue-100 text-blue-700' },
  { value: 'EQUIPMENT', label: 'Equipment', badge: 'bg-purple-100 text-purple-700' },
  { value: 'SALARY', label: 'Salary', badge: 'bg-green-100 text-green-700' },
  { value: 'RENT', label: 'Rent', badge: 'bg-orange-100 text-orange-700' },
  { value: 'UTILITIES', label: 'Utilities', badge: 'bg-yellow-100 text-yellow-700' },
  { value: 'OTHER', label: 'Other', badge: 'bg-gray-200 text-gray-600' },
];

export function expenseCategory(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value) || { value, label: value, badge: 'bg-gray-100 text-gray-700' };
}

export const INVOICE_STATUSES = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
];
