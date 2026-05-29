import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    brand: 'Teeth For Life',
    home: 'Home',
    services: 'Services',
    book: 'Book Appointment',
    about: 'About',
    contact: 'Contact',
    bookNow: 'Book Now',
    heroTitle: 'Teeth For Life',
    heroSubtitle: 'Healthy Smiles, Lasting Care',
    heroDesc: 'Your trusted dental partner in Karachi. Expert care for the whole family with modern technology and a gentle touch.',
    bookAppointment: 'Book Appointment',
    whatsappUs: 'WhatsApp Us',
    ourServices: 'Our Services',
    whyChooseUs: 'Why Choose Us',
    testimonials: 'What Our Patients Say',
    meetDoctor: 'Meet the Doctor',
    findUs: 'Find Us',
    fullName: 'Full Name',
    phone: 'Phone (WhatsApp)',
    email: 'Email',
    selectService: 'Select Service',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    notes: 'Notes (optional)',
    submit: 'Submit',
    next: 'Next',
    previous: 'Previous',
    step: 'Step',
    of: 'of',
    clinicHours: 'Clinic Hours',
    monSat: 'Mon – Sat',
    sunday: 'Sunday',
    closed: 'Closed',
    address: 'Address',
    getInTouch: 'Get In Touch',
    sendMessage: 'Send Message',
    yourMessage: 'Your Message',
    subject: 'Subject',
    thankYou: 'Thank you!',
    confirmationMsg: "We'll confirm your appointment via WhatsApp within 1 hour.",
    readMore: 'Read More',
    bookThisService: 'Book This Service',
    experienceYears: '15+ Years Experience',
    modernEquipment: 'Modern Equipment',
    affordableCare: 'Affordable Care',
    familyFriendly: 'Family Friendly',
    ourStory: 'Our Story',
    ourMission: 'Our Mission',
    certifications: 'Certifications & Affiliations',
  },
  ur: {
    brand: 'ٹیتھ فار لائف',
    home: 'ہوم',
    services: 'خدمات',
    book: 'اپائنٹمنٹ بک کریں',
    about: 'ہمارے بارے میں',
    contact: 'رابطہ',
    bookNow: 'ابھی بک کریں',
    heroTitle: 'ٹیتھ فار لائف',
    heroSubtitle: 'صحت مند مسکراہٹ، دیرپا نگہداشت',
    heroDesc: 'کراچی میں آپ کا قابل اعتماد ڈینٹل پارٹنر۔ جدید ٹیکنالوجی اور نرم ہاتھوں سے پورے خاندان کی دیکھ بھال۔',
    bookAppointment: 'اپائنٹمنٹ بک کریں',
    whatsappUs: 'واٹس ایپ کریں',
    ourServices: 'ہماری خدمات',
    whyChooseUs: 'ہمیں کیوں چنیں',
    testimonials: 'ہمارے مریض کیا کہتے ہیں',
    meetDoctor: 'ڈاکٹر سے ملیں',
    findUs: 'ہمیں تلاش کریں',
    fullName: 'پورا نام',
    phone: 'فون (واٹس ایپ)',
    email: 'ای میل',
    selectService: 'سروس منتخب کریں',
    selectDate: 'تاریخ منتخب کریں',
    selectTime: 'وقت منتخب کریں',
    notes: 'نوٹس (اختیاری)',
    submit: 'جمع کرائیں',
    next: 'اگلا',
    previous: 'پچھلا',
    step: 'مرحلہ',
    of: 'از',
    clinicHours: 'کلینک اوقات',
    monSat: 'پیر – ہفتہ',
    sunday: 'اتوار',
    closed: 'بند',
    address: 'پتہ',
    getInTouch: 'رابطہ کریں',
    sendMessage: 'پیغام بھیجیں',
    yourMessage: 'آپ کا پیغام',
    subject: 'موضوع',
    thankYou: 'شکریہ!',
    confirmationMsg: 'ہم 1 گھنٹے میں واٹس ایپ پر آپ کی اپائنٹمنٹ کی تصدیق کریں گے۔',
    readMore: 'مزید پڑھیں',
    bookThisService: 'یہ سروس بک کریں',
    experienceYears: '15+ سال کا تجربہ',
    modernEquipment: 'جدید آلات',
    affordableCare: 'سستی نگہداشت',
    familyFriendly: 'فیملی فرینڈلی',
    ourStory: 'ہماری کہانی',
    ourMission: 'ہمارا مشن',
    certifications: 'سرٹیفکیشنز اور وابستگی',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  const isUrdu = lang === 'ur';

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, isUrdu }}>
      <div dir={isUrdu ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
}
