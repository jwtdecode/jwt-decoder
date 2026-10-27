import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  onCopy?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M13.5 4L6 11.5 2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-7A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function CopyButton({ text, label, onCopy, className = '', size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, onCopy]);

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs gap-1'
    : 'px-3 py-1.5 text-sm gap-1.5';

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center font-mono rounded transition-all duration-150 select-none
        ${copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-100 dark:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
        } ${sizeClasses} ${className}`}
      title={`Copy ${label ?? 'to clipboard'}`}
      aria-label={copied ? 'Copied!' : `Copy ${label ?? 'to clipboard'}`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {label && <span>{copied ? 'Copied!' : label}</span>}
      {!label && <span>{copied ? 'Copied!' : 'Copy'}</span>}
    </button>
  );
}
