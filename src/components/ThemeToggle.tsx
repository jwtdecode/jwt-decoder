import { useEffect, useState } from 'react';

const SunIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  // Avoid hydration mismatch: the inline theme-flash script may have set the html
  // class differently from the SSR-rendered default ('dark'). Render the toggle
  // with the actual theme only after mount, so the SSR'd markup matches the
  // first client render exactly.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted ? theme === 'dark' : true;

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      suppressHydrationWarning
      className={`
        relative flex items-center w-[54px] h-7 rounded-full shrink-0
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
        ${isDark ? 'bg-indigo-600' : 'bg-slate-200'}
      `}
    >
      {/* Inactive icon in the track */}
      <span
        suppressHydrationWarning
        className={`
        absolute flex items-center justify-center pointer-events-none
        transition-opacity duration-200
        ${isDark
          ? 'left-[6px] text-indigo-200/70'
          : 'right-[6px] text-slate-400/80'}
      `}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>

      {/* Thumb — white circle with active mode icon */}
      <span
        suppressHydrationWarning
        className={`
        absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm
        flex items-center justify-center pointer-events-none
        transition-transform duration-200
        ${isDark
          ? 'translate-x-[29px] text-indigo-600'
          : 'translate-x-[3px] text-amber-500'}
      `}>
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
