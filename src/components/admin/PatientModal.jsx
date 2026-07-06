import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { updatePatient } from '../../api/admin';

// Pakistani phone, matching the backend regex exactly.
const PHONE_RE = /^(\+92|0)[0-9]{10}$/;

// Edit a patient's details (name / phone / email / date of birth). Patients are
// created implicitly (via booking or an invoice), so this modal is edit-only.
// Correcting the record here fixes the patient everywhere they're referenced.
export default function PatientModal({ isOpen, onClose, patient, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!isOpen || !patient) return;
    reset({
      full_name: patient.full_name || '',
      phone: patient.phone || '',
      email: patient.email || '',
      date_of_birth: patient.date_of_birth ? String(patient.date_of_birth).slice(0, 10) : '',
    });
  }, [isOpen, patient, reset]);

  const onSubmit = async (data) => {
    try {
      await updatePatient(patient.id, {
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        email: data.email || '',
        date_of_birth: data.date_of_birth || '',
      });
      toast.success('Patient updated');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update patient');
    }
  };

  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Full Name *</label>
          <input
            {...register('full_name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
            className="input-field"
            placeholder="Patient name"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Email</label>
            <input type="email" {...register('email')} className="input-field" placeholder="patient@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Date of Birth</label>
            <input type="date" {...register('date_of_birth')} className="input-field" />
          </div>
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
