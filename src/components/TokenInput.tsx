import { useRef, useCallback } from 'react';
import { buildSampleToken } from '../utils/sample';

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
}

const PLACEHOLDER = 'Paste your JWT here…\n\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\neyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRGV2ZWxvcGVyIn0.\nSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export function TokenInput({ value, onChange, onCopy }: TokenInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Let the event fire normally; the onChange will handle decoding
    e.currentTarget.blur();
    setTimeout(() => textareaRef.current?.blur(), 0);
  }, []);

  const handleClear = () => {
    onChange('');
    textareaRef.current?.focus();
  };

  const handleSample = () => {
    onChange(buildSampleToken());
  };

  // Count the 3 segments to show structure indicator
  const parts = value.trim().split('.');
  const partCount = value.trim() ? parts.length : 0;

  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-default)] bg-[var(--surface-bar)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">JWT Input</span>
          {partCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
              partCount === 3 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
            }`}>
              {partCount} / 3
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSample}
            className="text-xs px-3 py-2.5 sm:px-2.5 sm:py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 transition-all font-medium"
          >
            Load sample
          </button>
          {value && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-2.5 sm:px-2.5 sm:py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-100 dark:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 transition-all font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={5}
          className="w-full bg-transparent px-4 py-4 font-mono text-base sm:text-sm text-slate-700 dark:text-slate-300
            placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none focus:outline-none
            leading-relaxed break-all"
          style={{ minHeight: '120px' }}
          aria-label="JWT input"
        />
        {value && (
          <button
            onClick={onCopy}
            className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-100 dark:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 transition-all font-mono"
            title="Copy raw token"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline mr-1" aria-hidden>
              <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-7A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Copy
          </button>
        )}
      </div>

      {/* Character count */}
      {value && (
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-700 font-mono">{value.trim().length} chars</span>
          <span className="text-xs text-slate-600 dark:text-slate-700">Auto-decodes on input</span>
        </div>
      )}
    </div>
  );
}
