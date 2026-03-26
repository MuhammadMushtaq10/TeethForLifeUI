import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useLang } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = () => {
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Reach Out</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3">{t('getInTouch')}</h1>
            <p className="text-text-muted leading-relaxed">
              Have a question or want to schedule a visit? Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm">Phone / WhatsApp</h3>
              <a href="tel:+923158565662" className="text-primary text-sm mt-1 block font-medium">+92 315 8565662</a>
              <p className="text-xs text-text-muted mt-0.5">Available during clinic hours</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm">Email</h3>
              <a href="mailto:teethforlifee@gmail.com" className="text-primary text-sm mt-1 block font-medium">teethforlifee@gmail.com</a>
              <p className="text-xs text-text-muted mt-0.5">We reply within 24 hours</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm">{t('address')}</h3>
              <p className="text-text-muted text-sm mt-1">Shop #2, Al Hayat Chamber, KCHS Block 7/8C</p>
              <p className="text-xs text-text-muted mt-0.5">off Shahra-e-Faisal, Karachi</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-text-main mb-6">{t('sendMessage')}</h2>

              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Message sent! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">{t('fullName')} *</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="input-field text-sm"
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-accent text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">{t('email')} *</label>
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                      type="email"
                      className="input-field text-sm"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-accent text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">{t('phone')}</label>
                    <input
                      {...register('phone')}
                      className="input-field text-sm"
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">{t('subject')} *</label>
                    <input
                      {...register('subject', { required: 'Subject is required' })}
                      className="input-field text-sm"
                      placeholder="How can we help?"
                    />
                    {errors.subject && <p className="text-accent text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{t('yourMessage')} *</label>
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    rows={5}
                    className="input-field text-sm"
                    placeholder="Tell us more..."
                  />
                  {errors.message && <p className="text-accent text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  className="bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3 px-8 rounded-full transition-colors"
                >
                  {t('sendMessage')}
                </button>
              </form>
            </div>
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
                <h3 className="font-semibold text-text-main">{t('clinicHours')}</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-text-muted">{day}</span>
                    <span className="text-text-main font-medium">9 AM — 7 PM</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
                  <span className="text-text-muted">{t('sunday')}</span>
                  <span className="text-accent font-medium">{t('closed')}</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <iframe
                title="Teeth For Life Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.827!2d67.0765!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUxJzM4LjUiTiA2N8KwMDQnMzUuNCJF!5e0!3m2!1sen!2spk!4v1"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4">
                <p className="text-xs text-text-muted">Shop #2, Al Hayat Chamber, KCHS Block 7/8C, off Shahra-e-Faisal, Karachi</p>
                <a
                  href="https://maps.app.goo.gl/92QNGr4PBq1zpJkH7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-2 hover:text-primary-dark transition-colors"
                >
                  Open in Google Maps
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
