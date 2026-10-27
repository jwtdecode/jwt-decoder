import type { Tab } from '../types/jwt';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'decoded', label: 'Decoded', icon: '{ }' },
  { id: 'claims', label: 'Claims', icon: '◎' },
  { id: 'verify', label: 'Verify', icon: '🔑' },
  { id: 'raw', label: 'Raw', icon: '≡' },
  { id: 'anatomy', label: 'Anatomy', icon: '?' },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)]" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-150 flex-1 justify-center
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            ${active === tab.id
              ? 'bg-white dark:bg-[var(--surface-bar)] text-slate-900 dark:text-slate-100 shadow-sm shadow-black/10 border border-[var(--border-default)]'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }
          `}
        >
          <span className="font-mono text-xs opacity-70 hidden sm:inline">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden text-xs">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
