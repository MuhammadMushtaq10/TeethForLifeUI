import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import {
  createTreatment,
  updateTreatment,
  getPatientAppointments,
  getServices,
  unwrapList,
} from '../../api/admin';
import { formatDate, todayISO } from '../../utils/format';

// Add or edit a treatment-history entry for a patient.
export default function TreatmentModal({ isOpen, onClose, patientId, treatment, onSuccess }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const isEdit = !!treatment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!isOpen) return;
    reset({
      appointment_id: treatment?.appointment_id || '',
      service_id: treatment?.service_id || '',
      treatment_date: treatment?.treatment_date || todayISO(),
      tooth_numbers: treatment?.tooth_numbers || '',
      diagnosis: treatment?.diagnosis || '',
      treatment_notes: treatment?.treatment_notes || '',
      next_visit_notes: treatment?.next_visit_notes || '',
    });
    setLoadingData(true);
    Promise.all([
      getPatientAppointments(patientId, { status: 'COMPLETED' }).catch(() => []),
      getServices().catch(() => []),
    ])
      .then(([appts, svc]) => {
        setAppointments(unwrapList(appts, 'appointments', 'data'));
        setServices(unwrapList(svc, 'services', 'data'));
      })
      .finally(() => setLoadingData(false));
  }, [isOpen, patientId, treatment, reset]);

  const onSubmit = async (data) => {
    const payload = {
      patient_id: patientId,
      appointment_id: data.appointment_id || undefined,
      service_id: data.service_id || undefined,
      treatment_date: data.treatment_date,
      tooth_numbers: data.tooth_numbers || undefined,
      diagnosis: data.diagnosis || undefined,
      treatment_notes: data.treatment_notes || undefined,
      next_visit_notes: data.next_visit_notes || undefined,
    };
    try {
      if (isEdit) {
        await updateTreatment(treatment.id, payload);
        toast.success('Treatment updated');
      } else {
        await createTreatment(payload);
        toast.success('Treatment added');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save treatment');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Treatment' : 'Add Treatment'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Treatment Date *</label>
          <input
            type="date"
            {...register('treatment_date', { required: 'Date is required' })}
            className="input-field"
          />
          {errors.treatment_date && <p className="text-accent text-sm mt-1">{errors.treatment_date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Appointment</label>
          <select {...register('appointment_id')} className="input-field" disabled={loadingData}>
            <option value="">{loadingData ? 'Loading...' : 'No linked appointment'}</option>
            {appointments.map((a) => (
              <option key={a.id} value={a.id}>
                {formatDate(a.appointment_date)} {a.appointment_time || ''} — {a.service_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Service</label>
          <select {...register('service_id')} className="input-field" disabled={loadingData}>
            <option value="">Select service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Tooth Numbers</label>
          <input {...register('tooth_numbers')} className="input-field" placeholder="e.g. 11, 12, 21" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Diagnosis</label>
          <textarea {...register('diagnosis')} rows={2} className="input-field" placeholder="Clinical diagnosis..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Treatment Notes</label>
          <textarea {...register('treatment_notes')} rows={3} className="input-field" placeholder="Procedure performed, materials used..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Next Visit Notes</label>
          <textarea {...register('next_visit_notes')} rows={2} className="input-field" placeholder="Follow-up plan..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Treatment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
