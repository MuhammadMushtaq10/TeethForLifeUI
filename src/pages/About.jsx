import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const certifications = [
  'Pakistan Medical & Dental Council (PMDC)',
  'College of Physicians & Surgeons Pakistan (CPSP)',
  'American Dental Association (ADA) — Affiliate',
  'ISO 9001:2015 Certified Clinic',
];

const values = [
  {
    title: 'Patient-First Philosophy',
    desc: 'Every decision we make starts with your comfort, your goals, and your peace of mind.',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  },
  {
    title: 'Modern Technology',
    desc: 'Digital X-rays, laser treatments and advanced sterilization for safer, more precise care.',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
  },
  {
    title: 'Transparent Pricing',
    desc: 'Clear, upfront pricing with flexible payment options — no surprises, ever.',
    icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Family-Friendly Care',
    desc: 'A warm, welcoming environment for patients of every age — from toddlers to grandparents.',
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  },
];

const achievements = [
  { value: '15+', label: 'Years of Service' },
  { value: '10K+', label: 'Procedures Performed' },
  { value: '5K+', label: 'Happy Patients' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function About() {
  const { t } = useLang();

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">About Us</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3">{t('about')}</h1>
            <p className="text-text-muted leading-relaxed">
              Dedicated to healthy smiles since 2009 — learn about our journey, our values, and our commitment to your dental health.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our Journey</p>
              <h2 className="text-3xl font-bold text-text-main mb-6">{t('ourStory')}</h2>
              <div className="space-y-4 text-text-muted text-sm leading-relaxed">
                <p>
                  Teeth For Life was founded in 2009 with a simple vision: to make quality dental care
                  accessible to every family in Karachi. What started as a small single-chair practice
                  has grown into a modern, fully-equipped clinic serving thousands of patients each year.
                </p>
                <p>
                  Our practice was built on a passion for patient-centered care — on the belief that
                  going to the dentist shouldn't be something people dread. It should be a positive
                  experience that empowers patients to take control of their oral health.
                </p>
                <p>
                  Over the past 15+ years, we've invested in cutting-edge technology, continuous education,
                  and a compassionate team — all while keeping our services affordable.
                </p>
              </div>
            </div>
            {/* Image */}
            <div className="hidden lg:block">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src="/images/clinic-interior.png"
                  alt="Teeth For Life clinic interior"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our Values</p>
            <h2 className="text-3xl font-bold text-text-main">What Sets Us Apart</h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">
              The principles that guide every appointment, every treatment, and every smile we care for.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={value.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-main mb-2">{value.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl py-12 px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {achievements.map((item, i) => (
                <div key={i}>
                  <p className="text-4xl font-bold text-white">{item.value}</p>
                  <p className="text-sm text-white/80 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Credentials</p>
            <h2 className="text-3xl font-bold text-text-main">{t('certifications')}</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {certifications.map((cert, i) => (
              <div key={i} className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm text-sm font-medium text-text-main flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Banner */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('ourMission')}</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            "To provide world-class dental care with compassion, integrity, and innovation —
            making healthy smiles accessible to every family in Karachi, one patient at a time."
          </p>
          <Link
            to="/book"
            className="mt-8 inline-flex items-center gap-2 bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3.5 px-8 rounded-full transition-colors"
          >
            {t('bookAppointment')}
          </Link>
        </div>
      </section>
    </div>
  );
}
