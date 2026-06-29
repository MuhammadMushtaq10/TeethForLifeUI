import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

// Inline SVG icons (Heroicons-style) — no icon library, matching the existing convention.
const icons = {
  dashboard: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  appointments: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  patients: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65" />
  ),
  billing: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  ),
  expenses: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  ),
  reports: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  ),
};

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/appointments', label: 'Appointments', icon: 'appointments' },
  { to: '/admin/patients', label: 'Patients', icon: 'patients' },
  { to: '/admin/billing', label: 'Billing', icon: 'billing' },
  { to: '/admin/expenses', label: 'Expenses', icon: 'expenses' },
  { to: '/admin/reports', label: 'Reports', icon: 'reports' },
];

// Derive the topbar title from the current path (longest matching nav prefix).
function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin/patients/')) return 'Patient Profile';
  const match = [...NAV].reverse().find((n) => pathname.startsWith(n.to));
  return match ? match.label : 'Admin';
}

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-light text-primary'
                : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
            }`
          }
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            {icons[item.icon]}
          </svg>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate, isDark, toggleTheme, logout }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-sm">TF</span>
        </div>
        <span className="text-base font-bold text-text-main tracking-tight">Teeth For Life</span>
      </div>

      <NavItems onNavigate={onNavigate} />

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-gray-50 hover:text-text-main transition-colors"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = usePageTitle();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar (fixed) */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-30">
        <SidebarBody isDark={isDark} toggleTheme={toggleTheme} logout={logout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="relative flex flex-col w-64 max-w-[80%] bg-white border-r border-gray-100">
            <SidebarBody
              onNavigate={() => setDrawerOpen(false)}
              isDark={isDark}
              toggleTheme={toggleTheme}
              logout={logout}
            />
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden p-2 -ml-2 text-text-main"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-text-main">{title}</h1>
        </header>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
