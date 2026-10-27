import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { isGuidePath } from '../guides';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

interface RelatedLink {
  label: string;
  to: string;
  description: string;
}

interface ArticleLayoutProps {
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
  publishedDate?: string;
  updatedDate?: string;
}

function formatPublishedDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function ArticleLayout({ children, breadcrumbs, relatedLinks, publishedDate, updatedDate }: ArticleLayoutProps) {
  const { pathname } = useLocation();
  // Guide pages sit under the /guides hub in the breadcrumb trail.
  const trail: BreadcrumbItem[] = isGuidePath(pathname)
    ? [{ label: 'Guides', to: '/guides' }, ...breadcrumbs]
    : breadcrumbs;
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'JWT Decode', item: 'https://jwtdecode.app/' },
      ...trail.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: b.label,
        item: `https://jwtdecode.app${b.to ?? pathname}`,
      })),
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-slate-900 dark:text-slate-100 flex flex-col"
      style={{ fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif" }}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <SiteHeader />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Breadcrumb items={trail} />
        <article className="prose-article">
          {publishedDate && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
              By <Link to="/about#andy" rel="author" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2">Andy</Link>
              <span aria-hidden="true"> · </span>
              Published{' '}
              <time dateTime={publishedDate}>{formatPublishedDate(publishedDate)}</time>
              {updatedDate && (
                <>
                  <span aria-hidden="true"> · </span>
                  Updated{' '}
                  <time dateTime={updatedDate}>{formatPublishedDate(updatedDate)}</time>
                </>
              )}
            </p>
          )}
          {children}
        </article>

        {relatedLinks && relatedLinks.length > 0 && (
          <aside className="mt-12 pt-8 border-t border-[var(--border-subtle)]" aria-label="Related guides">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-4">
              Related Guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]
                    hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                >
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                    {link.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                    {link.description}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Back to tool CTA */}
        <div className="mt-10 p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ready to decode a token?</div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Use the free JWT decoder — paste any token for instant results, entirely in your browser.
              </div>
            </div>
            <Link
              to="/"
              className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
            >
              Open JWT Decoder
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

/* ─── Shared prose styling helpers ─────────────────────────────────────────── */

export function ArticleH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
      {children}
    </h1>
  );
}

export function ArticleH2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-10 mb-4 leading-snug">
      {children}
    </h2>
  );
}

export function ArticleH3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-7 mb-3 leading-snug">
      {children}
    </h3>
  );
}

export function ArticleP({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] text-slate-700 dark:text-slate-400 leading-7 mb-4">
      {children}
    </p>
  );
}

export function ArticleUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 mb-4 ml-4">
      {children}
    </ul>
  );
}

export function ArticleLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-[15px] text-slate-700 dark:text-slate-400 leading-7 flex gap-2">
      <span className="text-indigo-500 dark:text-indigo-400 shrink-0">·</span>
      <span>{children}</span>
    </li>
  );
}

export function ArticleCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
      {children}
    </code>
  );
}

export function ArticlePre({ children, lang }: { children: string; lang?: string }) {
  return (
    <pre className={`font-mono text-xs leading-relaxed rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4 overflow-x-auto mb-6 ${lang === 'jwt' ? 'text-violet-700 dark:text-[#a78bfa]' : 'text-slate-800 dark:text-slate-300'}`}>
      {children}
    </pre>
  );
}

export function ArticleCallout({ type, children }: { type: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
  const styles = {
    info: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-800 dark:text-indigo-400',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-400',
    danger: 'border-rose-500/20 bg-rose-500/5 text-rose-800 dark:text-rose-400',
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400',
  };
  const icons = { info: 'ℹ', warning: '⚠', danger: '!', success: '✓' };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border mb-6 ${styles[type]}`}>
      <span className="shrink-0 font-bold mt-0.5">{icons[type]}</span>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function ArticleIntroBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 p-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]">
      <div className="text-[15px] text-slate-700 dark:text-slate-400 leading-7">{children}</div>
    </div>
  );
}
