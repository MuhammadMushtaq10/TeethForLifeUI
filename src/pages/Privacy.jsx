import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3">Privacy Policy</h1>
          <p className="text-text-muted leading-relaxed">
            Last updated: May 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8 text-text-muted leading-relaxed">
          <section>
            <p>
              At Teeth For Life, your privacy matters to us. This policy explains what
              information we collect when you use our website or book an appointment, and
              how we use and protect it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Information We Collect</h2>
            <p className="mb-3">
              When you book an appointment, submit a review, or contact us, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your full name</li>
              <li>Your phone number</li>
              <li>Your email address</li>
              <li>Appointment details (date, time, and selected service)</li>
              <li>Any message or notes you choose to share with us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">How We Use Your Information</h2>
            <p className="mb-3">We use the information you provide only to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Schedule and confirm your dental appointments</li>
              <li>Send you appointment reminders, including via WhatsApp</li>
              <li>Respond to your enquiries and contact requests</li>
              <li>Maintain your patient records for continuity of care</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">We Do Not Sell Your Data</h2>
            <p>
              We do not sell, rent, or trade your personal information to any third party.
              Your data is used solely for the purposes described above and is shared only
              with service providers (such as messaging and email services) strictly as
              needed to operate our booking and reminder system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information against
              unauthorised access, loss, or misuse. Access to patient records is limited to
              authorised clinic staff only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at
              any time. To make such a request, please contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">Contact Us</h2>
            <p>
              For any questions about this Privacy Policy or your data, email us at{' '}
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
