import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { getServices, updateAppointment, unwrapList } from '../../api/admin';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED'];

// Edit an existing appointment. Unlike the "Add Appointment" modal (which is
// constrained to future dates and bookable slots), this lets the admin CORRECT
// an entry — including backdating the date and setting an arbitrary time — so a
// visit that was logged wrong (or forgotten for a couple of days) can be fixed.
export default function AppointmentEditModal({ isOpen, onClose, appointment, onSuccess }) {
  const [services, setServices] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!isOpen || !appointment) return;
    reset({
      service_id: appointment.service_id || '',
      appointment_date: appointment.appointment_date || '',
      appointment_time: (appointment.appointment_time || '').slice(0, 5),
      status: appointment.status || 'PENDING',
      notes: appointment.notes || '',
    });
    getServices()
      .then((data) => {
        const list = unwrapList(data, 'services', 'data');
        setServices(list);
        // The list endpoint may only give service_name — match it to an id so the
        // dropdown shows the current service selected.
        if (!appointment.service_id && appointment.service_name) {
          const match = list.find((s) => s.name === appointment.service_name);
          if (match) setValue('service_id', match.id);
        }
      })
      .catch(() => setServices([]));
  }, [isOpen, appointment, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      await updateAppointment(appointment.id, {
        service_id: data.service_id || undefined,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        status: data.status,
        notes: data.notes ?? '',
      });
      toast.success('Appointment updated');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update appointment');
    }
  };

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Appointment" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Patient</span>
            <span className="font-medium text-text-main">{appointment.patient_name || '—'}</span>
          </div>
          {appointment.patient_phone && (
            <div className="flex justify-between mt-1">
              <span className="text-text-muted">Phone</span>
              <span className="font-medium text-text-main">{appointment.patient_phone}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Service</label>
          <select {...register('service_id')} className="input-field">
            <option value="">Select service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Date *</label>
            <input type="date" {...register('appointment_date', { required: 'Date is required' })} className="input-field" />
            {errors.appointment_date && <p className="text-accent text-sm mt-1">{errors.appointment_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Time *</label>
            <input type="time" {...register('appointment_time', { required: 'Time is required' })} className="input-field" />
            {errors.appointment_time && <p className="text-accent text-sm mt-1">{errors.appointment_time.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Status</label>
          <select {...register('status')} className="input-field">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="input-field" placeholder="Any notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
