import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import iconImg from '../assets/teethForLife_ICON.png';

function ThemeToggle({ isDark, toggleTheme, className = '' }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-text-muted hover:bg-gray-50 hover:text-primary transition-colors ${className}`}
    >
      {isDark ? (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, toggleLang, isUrdu } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const links = [
    { to: '/', label: t('home') },
    { to: '/services', label: t('services') },
    { to: '/about', label: t('about') },
    { to: '/contact', label: t('contact') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={iconImg}
              alt="Teeth For Life"
              className="w-11 h-11 object-contain mix-blend-multiply"
            />
            <span className="text-[22px] font-bold text-text-main tracking-tight">Teeth For Life</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[15px] font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-5">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 text-xs border border-gray-200 rounded-md text-text-muted hover:bg-gray-50 transition-colors"
            >
              {isUrdu ? 'EN' : 'اردو'}
            </button>
            <a href="tel:+923158565662" className="flex items-center gap-2 text-text-main">
              <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm font-semibold">+92 315 8565662</span>
            </a>
            <Link
              to="/book"
              className="bg-accent hover:bg-red-400 text-white font-semibold text-sm py-2.5 px-6 rounded-full transition-colors"
            >
              {t('bookAppointment')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium ${
                  isActive(link.to) ? 'text-primary bg-primary-light' : 'text-text-muted hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
              <button onClick={toggleLang} className="px-3 py-1.5 text-xs border border-gray-200 rounded-md">
                {isUrdu ? 'EN' : 'اردو'}
              </button>
              <Link to="/book" onClick={() => setOpen(false)} className="bg-accent text-white font-semibold text-sm py-2.5 px-6 rounded-full">
                {t('bookAppointment')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
