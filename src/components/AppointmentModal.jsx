import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../api/client';

export default function AppointmentModal({ isOpen, onClose, onSuccess }) {
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const selectedDate = watch('appointment_date');

  useEffect(() => {
    if (isOpen) {
      client.get('/api/services').then(res => setServices(res.data)).catch(() => {});
      reset();
      setSlots([]);
      setIsNewPatient(false);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      client
        .get(`/api/availability?date=${selectedDate}`)
        .then(res => setSlots(res.data))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await client.post('/api/admin/appointments', {
        ...data,
        date_of_birth: isNewPatient ? data.date_of_birth : undefined,
      });
      toast.success('Appointment added successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-text-main">Add Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Full Name *</label>
            <input
              {...register('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              className="input-field"
              placeholder="Patient name"
            />
            {errors.full_name && <p className="text-accent text-sm mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">WhatsApp Phone *</label>
            <input
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^(\+92|0)[0-9]{10}$/, message: 'Use format 03xx or +923xx' },
              })}
              className="input-field"
              placeholder="03XXXXXXXXX"
            />
            {errors.phone && <p className="text-accent text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="patient@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Service *</label>
            <select {...register('service_id', { required: 'Select a service' })} className="input-field">
              <option value="">Select service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — Rs. {s.price_pkr?.toLocaleString()}</option>
              ))}
            </select>
            {errors.service_id && <p className="text-accent text-sm mt-1">{errors.service_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Date *</label>
            <input
              {...register('appointment_date', { required: 'Date is required' })}
              type="date"
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.appointment_date && <p className="text-accent text-sm mt-1">{errors.appointment_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Time Slot *</label>
            {loadingSlots ? (
              <p className="text-text-muted text-sm">Loading slots...</p>
            ) : slots.length > 0 ? (
              <select {...register('appointment_time', { required: 'Select a time' })} className="input-field">
                <option value="">Select time...</option>
                {slots.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : selectedDate ? (
              <p className="text-accent text-sm">No slots available for this date.</p>
            ) : (
              <p className="text-text-muted text-sm">Select a date first</p>
            )}
            {errors.appointment_time && <p className="text-accent text-sm mt-1">{errors.appointment_time.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Notes</label>
            <textarea {...register('notes')} rows={2} className="input-field" placeholder="Any notes..." />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newPatient"
              checked={isNewPatient}
              onChange={(e) => setIsNewPatient(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="newPatient" className="text-sm text-text-main">New Patient</label>
          </div>

          {isNewPatient && (
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Date of Birth</label>
              <input {...register('date_of_birth')} type="date" className="input-field" />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
