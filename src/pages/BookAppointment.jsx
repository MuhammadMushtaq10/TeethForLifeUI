import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLang } from '../context/LanguageContext';
import client from '../api/client';

export default function BookAppointment() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      service_id: preselectedService || '',
    },
  });

  const selectedDate = watch('appointment_date');
  const selectedTime = watch('appointment_time');

  useEffect(() => {
    client.get('/api/services').then(res => setServices(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      setSlots([]);
      setValue('appointment_time', '');
      client
        .get(`/api/availability?date=${selectedDate}`)
        .then(res => setSlots(res.data))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, setValue]);

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const isSunday = (dateStr) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getDay() === 0;
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await client.post('/api/appointments/book', data);
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">{t('thankYou')}</h2>
          <p className="text-text-muted text-sm mb-6">
            {t('confirmationMsg').replace('[phone]', success.phone)}
          </p>
          <div className="bg-gray-50 rounded-xl p-5 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-text-muted">Service</span>
              <span className="font-medium text-text-main">{success.appointment?.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Date</span>
              <span className="font-medium text-text-main">{success.appointment?.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Time</span>
              <span className="font-medium text-text-main">{success.appointment?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">WhatsApp</span>
              <span className="font-medium text-text-main">{success.phone}</span>
            </div>
          </div>
          <Link to="/" className="text-primary hover:text-primary-dark font-semibold text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Schedule a Visit</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3">{t('bookAppointment')}</h1>
            <p className="text-text-muted">
              Fill in the form below and we'll confirm your appointment via WhatsApp within 1 hour.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Service & Date Row */}
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('selectService')} *</label>
                  <select
                    {...register('service_id', { required: 'Please select a service' })}
                    className="input-field text-sm"
                  >
                    <option value="">Choose a service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.service_id && <p className="text-accent text-xs mt-1">{errors.service_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('selectDate')} *</label>
                  <input
                    {...register('appointment_date', {
                      required: 'Please select a date',
                      validate: (v) => !isSunday(v) || 'Clinic is closed on Sundays',
                    })}
                    type="date"
                    className="input-field text-sm"
                    min={getMinDate()}
                  />
                  {errors.appointment_date && <p className="text-accent text-xs mt-1">{errors.appointment_date.message}</p>}
                  {isSunday(selectedDate) && !errors.appointment_date && (
                    <p className="text-accent text-xs mt-1">Clinic is closed on Sundays.</p>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-main mb-2">{t('selectTime')} *</label>
                {!selectedDate ? (
                  <div className="bg-gray-50 rounded-xl py-6 text-center text-sm text-text-muted">
                    Select a date first to see available time slots
                  </div>
                ) : loadingSlots ? (
                  <div className="bg-gray-50 rounded-xl py-6 text-center text-sm text-text-muted">
                    <svg className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="bg-red-50 rounded-xl py-6 text-center text-sm text-red-600">
                    No available slots for this date. Please choose another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setValue('appointment_time', slot)}
                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedTime === slot
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-gray-200 text-text-main hover:border-primary hover:text-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register('appointment_time', { required: 'Please select a time' })} />
                {errors.appointment_time && <p className="text-accent text-xs mt-1.5">{errors.appointment_time.message}</p>}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-6" />

              {/* Patient Info */}
              <p className="text-sm font-semibold text-text-main mb-4">Your Information</p>
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('fullName')} *</label>
                  <input
                    {...register('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                    className="input-field text-sm"
                    placeholder="Muhammad Ahmad"
                  />
                  {errors.full_name && <p className="text-accent text-xs mt-1">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('phone')} *</label>
                  <input
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^(\+92|0)[0-9]{10}$/,
                        message: 'Enter valid Pakistani number (03xx... or +923xx...)',
                      },
                    })}
                    className="input-field text-sm"
                    placeholder="03XXXXXXXXX"
                  />
                  {errors.phone && <p className="text-accent text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('email')} *</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                    type="email"
                    className="input-field text-sm"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-accent text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('notes')}</label>
                  <input
                    {...register('notes')}
                    className="input-field text-sm"
                    placeholder="Any special concerns..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Booking...
                  </span>
                ) : (
                  t('bookAppointment')
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clinic Hours */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-main">Clinic Hours</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Mon – Sat</span>
                  <span className="font-medium text-text-main">10:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Sunday</span>
                  <span className="font-medium text-accent">Closed</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-main">Clinic Address</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Shop #2, Al Hayat Chamber, Plot #A7,<br />
                KCHS Block 7/8C, near Duty Free Shop,<br />
                off Shahra-e-Faisal, Karachi
              </p>
              <a
                href="https://maps.app.goo.gl/92QNGr4PBq1zpJkH7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold mt-3 hover:text-primary-dark transition-colors"
              >
                View on Google Maps
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>

            {/* Emergency / Phone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-main">Need Help?</h3>
              </div>
              <p className="text-sm text-text-muted mb-3">Call or WhatsApp us for emergency appointments or questions.</p>
              <a href="tel:+923158565662" className="text-primary font-semibold text-sm hover:text-primary-dark transition-colors">
                +92 315 8565662
              </a>
            </div>

            {/* Data Secure Badge */}
            <div className="bg-green-50 rounded-2xl border border-green-100 p-5 flex items-start gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Your Data is Secure</p>
                <p className="text-xs text-green-600 mt-0.5">Your information is encrypted and never shared with third parties.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
