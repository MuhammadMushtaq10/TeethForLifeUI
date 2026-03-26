import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import client from '../api/client';

const serviceImages = {
  'General Checkup': '/images/general-checkup.jfif',
  'Teeth Cleaning': '/images/scaling.jfif',
  'Teeth Whitening': '/images/teeth-whitening.jfif',
  'Root Canal': '/images/root-canal.jfif',
  'Dental Implant': '/images/implant.jfif',
  'Braces Consultation': '/images/braces.jfif',
  'Kids Dentistry': '/images/kids-dentistry.jfif',
  'Tooth Extraction': '/images/extraction.jfif',
};

const serviceDetails = {
  'General Checkup': {
    steps: ['Comprehensive oral examination', 'Digital X-rays if needed', 'Gum health assessment', 'Oral cancer screening', 'Personalized treatment plan'],
  },
  'Teeth Cleaning': {
    steps: ['Ultrasonic scaling to remove tartar', 'Hand scaling for precision cleaning', 'Professional polishing', 'Fluoride treatment application', 'Oral hygiene guidance'],
  },
  'Teeth Whitening': {
    steps: ['Initial shade assessment', 'Gum protection application', 'Professional whitening gel applied', 'LED light activation', 'Final shade comparison & aftercare tips'],
  },
  'Root Canal': {
    steps: ['Digital X-ray & diagnosis', 'Local anesthesia for comfort', 'Infected pulp removal', 'Canal shaping & disinfection', 'Permanent filling & crown recommendation'],
  },
  'Dental Implant': {
    steps: ['CT scan & treatment planning', 'Titanium implant placement', 'Healing period (3-6 months)', 'Abutment attachment', 'Custom crown placement'],
  },
  'Braces Consultation': {
    steps: ['Digital impressions & photos', 'Bite analysis', 'Treatment options discussion', 'Timeline & cost estimation', 'Custom braces or aligner fitting'],
  },
  'Kids Dentistry': {
    steps: ['Child-friendly environment tour', 'Gentle dental examination', 'Preventive fluoride treatment', 'Dental sealants if needed', 'Fun oral hygiene education'],
  },
  'Tooth Extraction': {
    steps: ['X-ray & assessment', 'Local anesthesia administration', 'Careful tooth extraction', 'Socket preservation if needed', 'Aftercare instructions & follow-up'],
  },
};

export default function Services() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    client.get('/api/services').then(res => setServices(res.data)).catch(() => {});
  }, []);

  const toggle = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3">{t('ourServices')}</h1>
            <p className="text-text-muted leading-relaxed">
              We offer a full range of dental services using modern techniques and equipment.
              Click on any service to learn more about the procedure.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const details = serviceDetails[service.name];
            const isExpanded = expandedId === service.id;
            const image = serviceImages[service.name];

            return (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                {/* Image + Info Header */}
                <button
                  onClick={() => toggle(service.id)}
                  className="w-full text-left hover:bg-gray-50/30 transition-colors"
                >
                  <div className="flex">
                    {/* Service Image */}
                    <div className="w-32 sm:w-40 flex-shrink-0 bg-primary-light">
                      <img
                        src={image}
                        alt={service.name}
                        className="w-full h-full object-cover min-h-[140px]"
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-text-main">{service.name}</h3>
                        <svg
                          className={`w-5 h-5 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                      <p className="text-text-muted text-sm mt-1.5 line-clamp-2">{service.description}</p>
                      <div className="mt-3">
                        <span className="text-text-muted text-xs bg-gray-50 px-2.5 py-1 rounded-full">{service.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && details && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <h4 className="font-semibold text-text-main text-sm mt-5 mb-3">Procedure Steps</h4>
                    <ol className="space-y-2.5">
                      {details.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <Link
                      to={`/book?service=${service.id}`}
                      className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-red-400 text-white font-semibold text-xs py-2.5 px-5 rounded-full transition-colors"
                    >
                      {t('bookThisService')}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Not Sure Which Service You Need?</h2>
          <p className="text-white/80 text-sm mb-6 max-w-lg mx-auto">
            Book a general checkup and our dentist will recommend the best treatment plan for you.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3 px-7 rounded-full transition-colors"
          >
            {t('bookAppointment')}
          </Link>
        </div>
      </div>
    </div>
  );
}
