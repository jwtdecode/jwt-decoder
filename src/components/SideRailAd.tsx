import { useEffect, useRef } from 'react';

const PUBLISHER_ID = 'ca-pub-4118883919421728';

interface SideRailAdProps {
  /** AdSense ad-slot ID for this specific unit. */
  slot: string;
  /** Which side this rail is on — used for aria-label only. */
  side: 'left' | 'right';
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

/**
 * Sticky side-rail ad unit using Google AdSense.
 * Renders at 160px (xl) or 300px (2xl) depending on screen width.
 * Stickiness is controlled by the parent aside element (sticky top-14).
 */
export function SideRailAd({ slot, side }: SideRailAdProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Avoid double-pushing in React StrictMode
    if (pushed.current) return;
    pushed.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense script not loaded or blocked — placeholder remains visible
    }
  }, []);

  // Both publisher ID and a real slot ID must be set before rendering live units
  const isConfigured = slot !== 'XXXXXXXXXX';

  return (
    <div
      className="flex flex-col items-center w-full"
      aria-label={`${side} advertisement`}
      role="complementary"
    >
      {/* Label required by most ad networks and good practice */}
      <span className="text-[10px] text-slate-500 dark:text-slate-800 uppercase tracking-widest mb-1.5 select-none">
        Advertisement
      </span>

      {isConfigured ? (
        /* ── Live AdSense unit ──────────────────────────────────────── */
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="false"
        />
      ) : (
        /* ── Placeholder — replace PUBLISHER_ID to go live ──────────── */
        <AdPlaceholder />
      )}
    </div>
  );
}

/** Shown in development or before the publisher ID is configured. */
function AdPlaceholder() {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* 160×600 skyscraper slot (visible at xl) */}
      <div
        className="xl:block 2xl:hidden w-full rounded-lg border border-dashed border-[var(--border-default)]
          bg-[var(--surface-subtle)]/50 flex flex-col items-center justify-center text-center px-2"
        style={{ height: '600px' }}
      >
        <div className="text-slate-500 dark:text-slate-800 text-xs font-mono leading-relaxed">
          <div className="mb-2 text-slate-600 dark:text-slate-700 font-semibold">160 × 600</div>
          <div>Skyscraper</div>
          <div className="mt-3 text-[10px] text-slate-900 leading-snug">
            Set PUBLISHER_ID in<br />SideRailAd.tsx to<br />activate AdSense
          </div>
        </div>
      </div>

      {/* 300×600 half-page slot (visible at 2xl) */}
      <div
        className="hidden 2xl:flex w-full rounded-lg border border-dashed border-[var(--border-default)]
          bg-[var(--surface-subtle)]/50 flex-col items-center justify-center text-center px-2"
        style={{ height: '600px' }}
      >
        <div className="text-slate-500 dark:text-slate-800 text-xs font-mono leading-relaxed">
          <div className="mb-2 text-slate-600 dark:text-slate-700 font-semibold">300 × 600</div>
          <div>Half Page</div>
          <div className="mt-3 text-[10px] text-slate-900 leading-snug">
            Set PUBLISHER_ID in<br />SideRailAd.tsx to<br />activate AdSense
          </div>
        </div>
      </div>
    </div>
  );
}
