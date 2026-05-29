import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3">Terms of Service</h1>
          <p className="text-text-muted leading-relaxed">
            Last updated: May 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8 text-text-muted leading-relaxed">
          <section>
            <p>
              By using the Teeth For Life website to book an appointment or contact our
              clinic, you agree to the following terms. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Appointment Booking</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Appointments can be booked online for available slots during our clinic hours: Mon – Sat, 10:00 AM – 7:00 PM. We are closed on Sundays.</li>
              <li>You must provide accurate contact details so we can confirm and remind you of your appointment.</li>
              <li>A booking is only confirmed once you receive a confirmation from us via email or WhatsApp.</li>
              <li>Please arrive a few minutes before your scheduled time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Cancellation &amp; Rescheduling</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>If you are unable to attend, please notify us at least 24 hours in advance so we can offer the slot to another patient.</li>
              <li>To cancel or reschedule, contact us by phone, WhatsApp, or email using the details on our contact page.</li>
              <li>Repeated missed appointments without notice may affect your ability to book online in future.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Clinic's Right to Reschedule</h2>
            <p>
              The clinic reserves the right to reschedule or cancel an appointment in
              exceptional circumstances (such as a dentist's unavailability or emergencies).
              In such cases, we will contact you as early as possible to arrange a new time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Medical Disclaimer</h2>
            <p>
              The information provided on this website is for general informational purposes
              only and is not a substitute for professional dental or medical advice,
              diagnosis, or treatment. Always consult a qualified dentist regarding any
              dental condition. Do not disregard or delay seeking professional advice based
              on content found on this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Contact Us</h2>
            <p>
              If you have any questions about these Terms, email us at{' '}
              <a href="mailto:teethforlifee@gmail.com" className="text-primary font-medium">
                teethforlifee@gmail.com
              </a>{' '}
              or visit our{' '}
              <Link to="/contact" className="text-primary font-medium">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
