import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

const primaryLinks = [
  { label: 'Decoder', to: '/' },
  { label: 'What is a JWT?', to: '/what-is-a-jwt' },
  { label: 'Guides', to: '/guides' },
  { label: 'Security', to: '/jwt-security-best-practices' },
  { label: 'About', to: '/about' },
];

const mobileAllLinks = [
  { label: 'JWT Decoder', to: '/' },
  { label: 'All JWT Guides', to: '/guides' },
  { label: 'What is a JWT?', to: '/what-is-a-jwt' },
  { label: 'Header, Payload & Signature', to: '/jwt-header-payload-signature-explained' },
  { label: 'JWT Claims Explained', to: '/jwt-claims-explained' },
  { label: 'Verification Guide', to: '/jwt-verification-guide' },
  { label: 'HS256 vs RS256', to: '/hs256-vs-rs256' },
  { label: 'Security Best Practices', to: '/jwt-security-best-practices' },
  { label: 'Common JWT Errors', to: '/common-jwt-errors-and-fixes' },
  { label: 'Decoder vs Validator', to: '/jwt-decoder-vs-jwt-validator' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms', to: '/terms' },
];

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname === to;

  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-sm border-b border-[var(--border-subtle)]">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          aria-label="JWT Decode — home"
        >
          <div className="text-indigo-400" aria-hidden><LockIcon /></div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-none">JWT Decode</span>
            <span className="hidden lg:block text-slate-500 dark:text-slate-600 text-xs mt-0.5">Online JWT Decoder &amp; Inspector</span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Primary navigation">
          {primaryLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                isActive(link.to)
                  ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden />
            <span>Local-Only</span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2.5 sm:p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-4"
          aria-label="Mobile navigation"
        >
          <div className="space-y-0.5 mb-4">
            {mobileAllLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(link.to)
                    ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
