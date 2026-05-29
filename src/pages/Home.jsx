import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import client from '../api/client';
import ReviewForm from '../components/ReviewForm';

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

const whyFeatures = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: '15+ Years Experience',
    desc: 'Our senior dentists bring over 15 years of clinical experience.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Modern Equipment',
    desc: 'State-of-the-art digital X-rays, laser treatments & sterilization.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: 'Affordable Care',
    desc: 'Transparent pricing with flexible payment plans for every family.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Family Friendly',
    desc: 'A warm, welcoming environment for patients of all ages.',
  },
];

const testimonials = [
  { name: 'Ahmed Khan', rating: 5, text: 'Best dental experience I\'ve ever had. The doctor was incredibly gentle and professional. Highly recommended!' },
  { name: 'Fatima Ali', rating: 5, text: 'My kids were actually happy to visit the dentist! The staff is so friendly and the clinic is spotless.' },
  { name: 'Usman Malik', rating: 4, text: 'Got my teeth whitened here — amazing results. The whole process was painless and the price was fair.' },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchReviews = () => {
    client
      .get('/api/reviews')
      .then(res => setReviews(res.data.filter(r => r.comment)))
      .catch(() => {});
  };

  useEffect(() => {
    client.get('/api/services').then(res => setServices(res.data.slice(0, 6))).catch(() => {});
    fetchReviews();
  }, []);

  // Show real reviews when available; otherwise fall back to sample testimonials.
  const displayedReviews = reviews.length
    ? reviews.slice(0, 6).map(r => ({ name: r.patient_name, rating: r.rating, text: r.comment }))
    : testimonials;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-primary">Top Rated Dental Clinic in Karachi</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-tight mb-6">
                <span className="text-text-main">Your Smile,</span>
                <br />
                <span className="text-primary">Our Priority.</span>
              </h1>
              <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
                {t('heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/book"
                  className="bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3.5 px-8 rounded-full transition-colors text-center"
                >
                  {t('bookAppointment')}
                </Link>
                <Link
                  to="/services"
                  className="border-2 border-gray-200 text-text-main hover:border-primary hover:text-primary font-semibold text-sm py-3.5 px-8 rounded-full transition-colors text-center"
                >
                  Explore Services
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-xs font-bold text-primary">A</div>
                    <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-white flex items-center justify-center text-xs font-bold text-accent">F</div>
                    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-bold text-green-600">U</div>
                  </div>
                  <span className="text-sm text-text-muted">1000+ Happy Patients</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-text-main">4.9</span>
                  <span className="text-sm text-text-muted">Rating</span>
                </div>
              </div>
            </div>
            {/* Hero image */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <img
                    src="/images/hero-dental.jpg"
                    alt="Teeth For Life dental clinic"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">Online Booking</p>
                    <p className="text-xs text-text-muted">24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Care - Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main">Comprehensive Dental Care</h2>
            <p className="text-text-muted mt-3 max-w-2xl mx-auto">
              From routine checkups to advanced procedures, we provide complete dental care for the whole family.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/book?service=${service.id}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="h-40 overflow-hidden bg-primary-light">
                  <img
                    src={serviceImages[service.name]}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-text-main mb-1.5 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-2 mb-3">{service.description}</p>
                  <span className="text-text-muted text-xs bg-gray-50 px-2.5 py-1 rounded-full">{service.duration_minutes} min</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm transition-colors"
            >
              View All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Patients Love Us */}
      <section className="py-20 bg-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
                Why Patients Love<br />Teeth For Life
              </h2>
              <p className="text-text-muted mb-10 max-w-lg leading-relaxed">
                We combine expertise, technology and genuine care to deliver dental experiences that keep families coming back.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {whyFeatures.map((feature, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary mb-3">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-text-main mb-1 text-sm">{feature.title}</h3>
                    <p className="text-text-muted text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Image */}
            <div className="hidden lg:block">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src="/images/clinic-interior.png"
                  alt="Teeth For Life clinic interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Simple & Stress-Free</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main">How It Works</h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">Getting the care you need takes just three easy steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Book Online',
                desc: 'Choose your service, pick a date and time slot that suits you, and confirm in under a minute.',
                icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
              },
              {
                step: '02',
                title: 'Get Confirmation',
                desc: "We'll confirm your appointment by email and WhatsApp, with friendly reminders before your visit.",
                icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
              },
              {
                step: '03',
                title: 'Visit & Smile',
                desc: 'Walk into our modern, comfortable clinic and leave with a healthier, brighter smile.',
                icon: 'M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z',
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <span className="absolute top-6 right-6 text-4xl font-bold text-primary/10">{item.step}</span>
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3.5 px-8 rounded-full transition-colors"
            >
              {t('bookAppointment')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main">What Our Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedReviews.map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <StarRating count={review.rating} />
                <p className="text-text-muted mt-4 text-sm leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{review.name?.[0] || '?'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-main text-sm">{review.name}</p>
                    <p className="text-xs text-text-muted">Patient</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leave a review */}
          <div className="mt-14">
            <ReviewForm onSubmitted={fetchReviews} />
          </div>
        </div>
      </section>

      {/* Visit Our Clinic */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Location</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main">Visit Our Clinic</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Google Maps embed */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden">
              <iframe
                title="Teeth For Life Location"
                src="https://maps.google.com/maps?q=24.8673448,67.080464&z=18&output=embed"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl"
              />
            </div>
            {/* Info card */}
            <div className="bg-primary rounded-2xl p-8 text-white flex flex-col justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Teeth For Life</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <p className="opacity-90">Shop #2, Al Hayat Chamber, Plot #A7, KCHS Block 7/8C, near Duty Free Shop, off Shahra-e-Faisal, Karachi</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="opacity-90">
                    <p>Mon – Sat: 10:00 AM – 7:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <p className="opacity-90">+92 315 8565662</p>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/92QNGr4PBq1zpJkH7"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 bg-[#ffffff] text-primary font-semibold text-sm py-3 px-6 rounded-full text-center hover:bg-[#eaf6ff] transition-colors"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready for a Healthier Smile?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the difference at Teeth For Life dental clinic.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3.5 px-8 rounded-full transition-colors"
            >
              {t('bookAppointment')}
            </Link>
            <a
              href="tel:+923158565662"
              className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-sm py-3.5 px-8 rounded-full transition-colors"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
