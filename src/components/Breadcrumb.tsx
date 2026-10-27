import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-600 flex-wrap">
        <li>
          <Link to="/" className="hover:text-indigo-400 transition-colors">JWT Decode</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {item.to ? (
              <Link to={item.to} className="hover:text-indigo-400 transition-colors">{item.label}</Link>
            ) : (
              <span className="text-slate-700 dark:text-slate-300" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
