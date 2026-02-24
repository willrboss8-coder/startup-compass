import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OfflineBadge } from './OfflineBadge';

interface LayoutShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function LayoutShell({ children, hideNav }: LayoutShellProps) {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/results', label: 'Results' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {!hideNav && (
        <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15,11 12,9 9,11" />
                  <polygon points="12,22 9,13 12,15 15,13" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">Compass</span>
            </Link>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors tap-target ${
                    location.pathname === link.to
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {children}
      </main>
      <OfflineBadge />
    </div>
  );
}
