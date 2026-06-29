import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { createInvoice, getPatientAppointments, getServices, unwrapList } from '../../api/admin';
import { formatPKR, formatDate } from '../../utils/format';

// Pakistani phone, matching the backend regex exactly.
const PHONE_RE = /^(\+92|0)[0-9]{10}$/;

// Create an invoice.
//  - Billing page (no `patientId`): identify the patient by NAME + PHONE. The
//    backend upserts the patient by phone (the app's canonical identity), so an
//    appointment is NOT required — walk-ins can be invoiced directly.
//  - Patient profile (`patientId` provided): the patient is already known; we
//    send `patient_id` and offer an optional appointment to link/prefill price.
export default function InvoiceModal({ isOpen, onClose, patientId, onSuccess }) {
  const scoped = !!patientId; // profile context — patient already known
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const subtotal = Number(watch('subtotal')) || 0;
  const discount = Number(watch('discount_amount')) || 0;
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (!isOpen) return;
    reset({
      full_name: '',
      phone: '',
      appointment_id: '',
      service_id: '',
      subtotal: '',
      discount_amount: '',
      discount_reason: '',
      notes: '',
    });
    setLoadingData(true);
    const tasks = [getServices().catch(() => [])];
    if (scoped) tasks.push(getPatientAppointments(patientId, { status: 'COMPLETED' }).catch(() => []));
    Promise.all(tasks)
      .then((res) => {
        setServices(unwrapList(res[0], 'services', 'data'));
        setAppointments(scoped ? unwrapList(res[1], 'appointments', 'data') : []);
      })
      .finally(() => setLoadingData(false));
  }, [isOpen, patientId, scoped, reset]);

  // Prefill subtotal from the matching service price when an appointment is picked.
  const onAppointmentChange = (e) => {
    const appt = appointments.find((a) => String(a.id) === e.target.value);
    if (!appt) return;
    const svc = services.find((s) => s.name === appt.service_name || String(s.id) === String(appt.service_id));
    if (svc?.price_pkr != null) setValue('subtotal', svc.price_pkr);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        subtotal: Number(data.subtotal),
        discount_amount: Number(data.discount_amount) || 0,
        discount_reason: data.discount_reason || undefined,
        notes: data.notes || undefined,
      };
      if (scoped) {
        payload.patient_id = patientId;
        if (data.appointment_id) payload.appointment_id = data.appointment_id;
      } else {
        payload.full_name = data.full_name.trim();
        payload.phone = data.phone.trim();
      }

      const invoice = await createInvoice(payload);
      toast.success('Invoice created');
      onSuccess?.(invoice);
      onClose();
    } catch (err) {
      const apiErr =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to create invoice';
      toast.error(apiErr);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {scoped ? (
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Appointment (optional)</label>
            <select
              {...register('appointment_id')}
              className="input-field"
              onChange={onAppointmentChange}
              disabled={loadingData}
            >
              <option value="">{loadingData ? 'Loading...' : 'No linked appointment'}</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {formatDate(a.appointment_date)} {a.appointment_time || ''} — {a.service_name}
                </option>
              ))}
            </select>
            <p className="text-text-muted text-xs mt-1">Linking an appointment prefills the price; it isn’t required.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Patient Name *</label>
                <input
                  {...register('full_name', {
                    required: 'Patient name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                  className="input-field"
                  placeholder="e.g. Ali Khan"
                />
                {errors.full_name && <p className="text-accent text-sm mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Phone *</label>
                <input
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: PHONE_RE, message: 'Use +92XXXXXXXXXX or 0XXXXXXXXXX' },
                  })}
                  className="input-field"
                  placeholder="03XXXXXXXXX or +92XXXXXXXXXX"
                />
                {errors.phone && <p className="text-accent text-sm mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <p className="text-text-muted text-xs -mt-2">
              The patient is matched by phone — existing patients are reused, new ones are created automatically.
            </p>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Subtotal (PKR) *</label>
            <input
              type="number"
              step="1"
              min="0"
              {...register('subtotal', {
                required: 'Subtotal is required',
                min: { value: 0, message: 'Must be 0 or more' },
              })}
              className="input-field"
              placeholder="0"
            />
            {errors.subtotal && <p className="text-accent text-sm mt-1">{errors.subtotal.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Discount (PKR)</label>
            <input
              type="number"
              step="1"
              min="0"
              {...register('discount_amount', {
                min: { value: 0, message: 'Must be 0 or more' },
                validate: (v) => !v || Number(v) <= subtotal || 'Discount cannot exceed subtotal',
              })}
              className="input-field"
              placeholder="0"
            />
            {errors.discount_amount && <p className="text-accent text-sm mt-1">{errors.discount_amount.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Discount Reason</label>
          <input {...register('discount_reason')} className="input-field" placeholder="e.g. loyal patient discount" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="input-field" placeholder="Optional notes..." />
        </div>

        <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
          <span className="text-text-muted text-sm">Invoice total</span>
          <span className="text-lg font-bold text-text-main">{formatPKR(total)}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
