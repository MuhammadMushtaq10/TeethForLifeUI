import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const certifications = [
  'Pakistan Medical & Dental Council (PMDC)',
  'College of Physicians & Surgeons Pakistan (CPSP)',
  'American Dental Association (ADA) — Affiliate',
  'ISO 9001:2015 Certified Clinic',
];

const team = [
  { name: 'Dr. Mushtaq Fakhruddin', role: 'Lead Dentist', initials: 'MF' },
  { name: 'Dr. Ayesha Tariq', role: 'Orthodontist', initials: 'AT' },
  { name: 'Nurse Sana', role: 'Dental Hygienist', initials: 'NS' },
  { name: 'Ali Raza', role: 'Front Desk Manager', initials: 'AR' },
];

const teamColors = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600'];

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
              Dedicated to healthy smiles since 2009 — learn about our journey, team, and commitment to your dental health.
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
                  Our founder, Dr. Mushtaq Fakhruddin, built the practice with a passion for
                  patient-centered care. He believed that going to the dentist shouldn't be something
                  people dread — it should be a positive experience that empowers patients to take control
                  of their oral health.
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

      {/* Doctor Profile */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Photo placeholder */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <img
                    src="/images/doctor.jpg"
                    alt="Dr. Mushtaq Fakhruddin"
                    className="w-full h-full object-cover absolute inset-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <svg className="w-28 h-28 text-primary/25" fill="none" stroke="currentColor" strokeWidth={0.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-primary text-white rounded-2xl py-3 px-5 shadow-lg">
                  <p className="text-2xl font-bold">15+</p>
                  <p className="text-xs opacity-90">Years Exp.</p>
                </div>
              </div>
            </div>
            {/* Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-light rounded-full px-4 py-1.5 mb-4">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="text-sm font-medium text-primary">Lead Dentist & Founder</span>
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-2">Dr. Mushtaq Fakhruddin</h2>
              <p className="text-primary font-medium mb-4">BDS, FCPS (Operative Dentistry)</p>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                Dr. Mushtaq Fakhruddin has been serving the community of Karachi with dedication and
                expertise for over 15 years. He has performed over 10,000 procedures and is known for his gentle
                technique and patient-first philosophy. He regularly attends international
                dental conferences to stay at the forefront of modern dentistry.
              </p>
              <div className="flex gap-8 mb-6">
                <div>
                  <p className="text-2xl font-bold text-primary">15+</p>
                  <p className="text-xs text-text-muted">Years Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">10K+</p>
                  <p className="text-xs text-text-muted">Procedures</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">5K+</p>
                  <p className="text-xs text-text-muted">Happy Patients</p>
                </div>
              </div>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3 px-7 rounded-full transition-colors"
              >
                Book with Dr. Mushtaq
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our People</p>
            <h2 className="text-3xl font-bold text-text-main">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${teamColors[i]}`}>
                  <span className="text-xl font-bold">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-text-main text-sm">{member.name}</h3>
                <p className="text-text-muted text-xs mt-1">{member.role}</p>
              </div>
            ))}
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
