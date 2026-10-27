import { useState } from 'react';
import { formatJson, syntaxHighlightJson } from '../utils/formatting';
import { CopyButton } from './CopyButton';

interface JsonViewerProps {
  data: Record<string, unknown>;
  label: string;
  colorClass?: string;
  defaultCollapsed?: boolean;
  onCopy?: () => void;
}

export function JsonViewer({ data, label, colorClass = 'text-slate-700 dark:text-slate-300', defaultCollapsed = false, onCopy }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [minified, setMinified] = useState(false);

  const formatted = minified ? JSON.stringify(data) : formatJson(data);
  const highlighted = syntaxHighlightJson(formatted);

  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-default)] bg-[var(--surface-bar)]">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center gap-2 group"
          aria-expanded={!collapsed}
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`transition-transform duration-150 text-slate-500 group-hover:text-slate-700 dark:hover:text-slate-700 dark:hover:text-slate-300 ${collapsed ? '' : 'rotate-90'}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass}`}>{label}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinified(v => !v)}
            className="text-xs text-slate-500 dark:text-slate-600 hover:text-slate-400 transition-colors font-mono"
            title={minified ? 'Pretty print' : 'Minify'}
          >
            {minified ? '{ }' : '{ … }'}
          </button>
          <CopyButton text={formatted} label="JSON" onCopy={onCopy} />
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <pre
          className="p-4 text-sm font-mono leading-relaxed overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all"
          // syntaxHighlightJson HTML-escapes before inserting spans — safe
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
    </div>
  );
}
