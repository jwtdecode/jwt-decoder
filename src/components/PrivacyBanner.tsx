import { useState } from 'react';

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M10 2L3 5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V5l-7-3z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const guarantees = [
  [
    'JWT processing is 100% local',
    'All decoding and signature verification runs on your device. Your JWT, payload claims, and any keys you enter never leave your browser.',
  ],
  [
    'No network requests for token data',
    'Disconnect from the internet — this tool still works. The only outbound requests are for page-view analytics and advertising (neither receives token content).',
  ],
  [
    'Memory-only by default',
    'Nothing is persisted to localStorage, sessionStorage, or cookies. Tokens exist only in JavaScript memory while the tab is open.',
  ],
  [
    'Third-party ads are present',
    'This site uses Google AdSense and Google Analytics. Their scripts run in the page, as on any site that uses them, but the decoder never passes token content to them. For zero third-party code, load the page, then disconnect from the network: the tool keeps working.',
  ],
] as const;

export function PrivacyBanner() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-500/20 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="text-indigo-500 dark:text-indigo-400 shrink-0"><ShieldIcon /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">JWT processing is 100% local</span>
            <span className="text-xs text-indigo-500/70 dark:text-indigo-400/70">·</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400/80">No tokens transmitted · Ads by Google AdSense</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs py-3 sm:py-0 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? 'Less ↑' : 'Details ↓'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-3 -m-3 sm:p-0 sm:m-0 text-indigo-600 hover:text-indigo-400 transition-colors"
            aria-label="Dismiss privacy banner"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-indigo-200 dark:border-indigo-500/10">
          <ul className="mt-3 grid sm:grid-cols-2 gap-2">
            {guarantees.map(([title, desc]) => (
              <li key={title} className="flex gap-2 text-xs">
                <span className={`shrink-0 mt-0.5 ${title === 'Third-party ads are present' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {title === 'Third-party ads are present' ? '⚠' : '✓'}
                </span>
                <span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{title}</span>
                  <span className="text-slate-500 dark:text-slate-500"> — {desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
