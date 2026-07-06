import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { createInvoice, updateInvoice, getInvoice, updatePatient, createTreatment, createAppointment, getPatientAppointments, getServices, unwrapList } from '../../api/admin';
import { formatPKR, formatDate, toDateInput, todayISO } from '../../utils/format';

// Pakistani phone, matching the backend regex exactly.
const PHONE_RE = /^(\+92|0)[0-9]{10}$/;

// Create OR edit an invoice.
//  - Create, Billing page (no `patientId`): identify the patient by NAME + PHONE.
//    The backend upserts the patient by phone, so an appointment is NOT required.
//  - Create, Patient profile (`patientId`): patient known; optional appointment link.
//  - Edit (`invoice` provided): the patient/appointment are fixed; the admin can
//    correct the amounts, discount, notes and the invoice DATE (created_at).
export default function InvoiceModal({ isOpen, onClose, patientId, invoice, onSuccess }) {
  const isEdit = !!invoice;
  const scoped = !!patientId; // profile context — patient already known
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  // In edit mode, the linked patient so we can also fix their name/phone here.
  const [patientInfo, setPatientInfo] = useState(null);

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

    // Edit mode: prefill from the row immediately, then hydrate from the full
    // invoice (list rows omit discount_reason/notes) so nothing is hidden.
    if (isEdit) {
      const prefill = (inv, patient) => reset({
        full_name: '',
        phone: '',
        appointment_id: '',
        service_id: '',
        subtotal: inv.subtotal ?? inv.total ?? '',
        discount_amount: inv.discount_amount ?? '',
        discount_reason: inv.discount_reason || '',
        notes: inv.notes || '',
        invoice_date: toDateInput(inv.created_at || inv.invoice_date),
        patient_name: patient?.full_name ?? inv.patient_name ?? '',
        patient_phone: patient?.phone ?? inv.patient_phone ?? '',
      });
      const initialPatient = invoice.patient_id
        ? { id: invoice.patient_id, full_name: invoice.patient_name, phone: invoice.patient_phone }
        : null;
      setPatientInfo(initialPatient);
      prefill(invoice, initialPatient);
      getInvoice(invoice.id)
        .then((full) => {
          if (!full) return;
          const p = full.patient || initialPatient;
          setPatientInfo(p);
          prefill({ ...invoice, ...full }, p);
        })
        .catch(() => {});
      return;
    }

    reset({
      full_name: '',
      phone: '',
      appointment_id: '',
      service_id: '',
      subtotal: '',
      discount_amount: '',
      discount_reason: '',
      notes: '',
      invoice_date: '',
      // Treatment (optional) — a single free-text detail, recorded to history.
      treatment_notes: '',
      // Next appointment (optional) — books a real CONFIRMED follow-up.
      next_appointment_date: '',
      next_appointment_time: '',
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
  }, [isOpen, patientId, scoped, isEdit, invoice, reset]);

  // Prefill subtotal from the matching service price when an appointment is picked.
  const onAppointmentChange = (e) => {
    const appt = appointments.find((a) => String(a.id) === e.target.value);
    if (!appt) return;
    const svc = services.find((s) => s.name === appt.service_name || String(s.id) === String(appt.service_id));
    if (svc?.price_pkr != null) setValue('subtotal', svc.price_pkr);
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // If the linked patient's name/phone was corrected, save that first — it
        // updates the patient record everywhere they're referenced.
        const pid = patientInfo?.id || invoice.patient_id;
        const newName = (data.patient_name || '').trim();
        const newPhone = (data.patient_phone || '').trim();
        const nameChanged = newName && newName !== (patientInfo?.full_name || '');
        const phoneChanged = newPhone && newPhone !== (patientInfo?.phone || '');
        if (pid && (nameChanged || phoneChanged)) {
          await updatePatient(pid, { full_name: newName, phone: newPhone });
        }

        const payload = {
          subtotal: Number(data.subtotal),
          discount_amount: Number(data.discount_amount) || 0,
          discount_reason: data.discount_reason || undefined,
          notes: data.notes || undefined,
          invoice_date: data.invoice_date || undefined,
        };
        const updated = await updateInvoice(invoice.id, payload);
        toast.success('Invoice updated');
        onSuccess?.(updated);
        onClose();
        return;
      }

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

      const created = await createInvoice(payload);
      const patient = created?.invoice?.patient || null;

      // Optional extras attached to this visit. These are secondary — a failure
      // here must not lose the invoice, so each is caught and surfaced as a warning.
      const extras = [];
      const failures = [];

      const treatmentText = (data.treatment_notes || '').trim();
      if (treatmentText) {
        if (patient?.id) {
          try {
            await createTreatment({
              patient_id: patient.id,
              treatment_date: todayISO(),
              treatment_notes: treatmentText,
            });
            extras.push('treatment');
          } catch {
            failures.push('treatment');
          }
        } else {
          failures.push('treatment');
        }
      }

      if (data.next_appointment_date) {
        if (patient?.phone) {
          try {
            await createAppointment({
              full_name: patient.full_name,
              phone: patient.phone,
              appointment_date: data.next_appointment_date,
              appointment_time: data.next_appointment_time,
            });
            extras.push('next appointment');
          } catch (e) {
            failures.push(e.response?.status === 409 ? 'next appointment (slot already booked)' : 'next appointment');
          }
        } else {
          failures.push('next appointment');
        }
      }

      toast.success(`Invoice created${extras.length ? ` + ${extras.join(' + ')}` : ''}`);
      if (failures.length) toast.error(`Couldn't save: ${failures.join(', ')}`);
      onSuccess?.(created);
      onClose();
    } catch (err) {
      const apiErr =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        (isEdit ? 'Failed to update invoice' : 'Failed to create invoice');
      toast.error(apiErr);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Invoice' : 'Create Invoice'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isEdit ? (
          <>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Invoice</span>
                <span className="font-medium text-text-main">{invoice.invoice_number || `#${invoice.id}`}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Patient Name</label>
                <input
                  {...register('patient_name', {
                    validate: (v) => !v || v.trim().length >= 2 || 'At least 2 characters',
                  })}
                  className="input-field"
                  placeholder="Patient name"
                />
                {errors.patient_name && <p className="text-accent text-sm mt-1">{errors.patient_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Phone</label>
                <input
                  {...register('patient_phone', {
                    validate: (v) => !v || PHONE_RE.test(v) || 'Use +92XXXXXXXXXX or 0XXXXXXXXXX',
                  })}
                  className="input-field"
                  placeholder="03XXXXXXXXX or +92XXXXXXXXXX"
                />
                {errors.patient_phone && <p className="text-accent text-sm mt-1">{errors.patient_phone.message}</p>}
              </div>
            </div>
            <p className="text-text-muted text-xs -mt-2">Fixing the name or phone updates the patient’s record everywhere.</p>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Invoice Date</label>
              <input type="date" {...register('invoice_date')} className="input-field" />
              <p className="text-text-muted text-xs mt-1">The date shown on the invoice — change it to correct a back-dated entry.</p>
            </div>
          </>
        ) : scoped ? (
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

        {!isEdit && (
          <>
            {/* Treatment (optional) — a single free-text detail saved to history. */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-semibold text-text-main mb-1">
                Treatment <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                {...register('treatment_notes')}
                rows={2}
                className="input-field"
                placeholder="What was done at this visit — saved to the patient’s treatment history."
              />
            </div>

            {/* Next appointment (optional) — books a real CONFIRMED follow-up. */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-semibold text-text-main mb-1">
                Next Appointment <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <p className="text-text-muted text-xs mb-2">Pick a date to book a confirmed follow-up (appears in Appointments, WhatsApp reminders included).</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Date</label>
                  <input type="date" {...register('next_appointment_date')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Time</label>
                  <input
                    type="time"
                    {...register('next_appointment_time', {
                      validate: (v, fv) => !fv.next_appointment_date || !!v || 'Pick a time for the next appointment',
                    })}
                    className="input-field"
                  />
                  {errors.next_appointment_time && <p className="text-accent text-sm mt-1">{errors.next_appointment_time.message}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
          <span className="text-text-muted text-sm">Invoice total</span>
          <span className="text-lg font-bold text-text-main">{formatPKR(total)}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-outline !py-2">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary !py-2 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
