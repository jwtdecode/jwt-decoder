import { Link } from 'react-router-dom';
import { GUIDES, GUIDE_CLUSTERS } from '../guides';

export function GuidesGrid() {
  const featured = GUIDES.filter(g => g.featured);
  return (
    <section aria-labelledby="guides-heading" className="space-y-5 pt-4">
      <div className="flex items-center gap-3">
        <h2 id="guides-heading" className="text-base font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          JWT Developer Guides
        </h2>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
        In-depth technical guides covering JWT structure, security, algorithms, frameworks, and common debugging scenarios.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {featured.map(guide => (
          <Link
            key={guide.to}
            to={guide.to}
            className="flex gap-3 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]
              hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
          >
            {guide.icon && <span className="text-xl shrink-0 mt-0.5" aria-hidden>{guide.icon}</span>}
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-400 transition-colors mb-1">
                {guide.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-600 leading-relaxed">
                {guide.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 pt-2">
        {GUIDE_CLUSTERS.map(cluster => {
          const items = GUIDES.filter(g => g.cluster === cluster);
          if (items.length === 0) return null;
          return (
            <div key={cluster}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">{cluster}</h3>
              <ul className="space-y-1.5">
                {items.map(g => (
                  <li key={g.to}>
                    <Link to={g.to} className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-400 transition-colors">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Link to="/guides" className="inline-block text-sm font-medium text-indigo-500 hover:text-indigo-400">
        Browse all {GUIDES.length} JWT guides →
      </Link>
    </section>
  );
}
