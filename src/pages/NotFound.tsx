import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export default function NotFoundPage() {
  return (
    <>
      <SEOHead
        title="Page Not Found — Return to the JWT Decoder"
        description="The page you requested could not be found on jwtdecode.app. Return to the JWT decoder or browse the available guides."
        path="/404"
        noSuffix
        noindex
      />
      <div
        className="min-h-screen bg-[var(--surface)] text-slate-900 dark:text-slate-100 flex flex-col"
        style={{ fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif" }}
      >
        <SiteHeader />

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
            404
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            The URL you requested doesn't match any page on jwtdecode.app. It may have been moved,
            renamed, or never existed. The JWT decoder and every guide remain available below.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
            >
              Open JWT Decoder
            </Link>
            <Link
              to="/what-is-a-jwt"
              className="px-5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] hover:border-indigo-500/40 hover:bg-indigo-500/5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Read the guides
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border-subtle)] text-left">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-600 mb-4">
              Popular Guides
            </h2>
            <ul className="space-y-2 text-sm">
              <li><Link to="/what-is-a-jwt" className="text-indigo-400 hover:text-indigo-300">What is a JWT?</Link></li>
              <li><Link to="/jwt-verification-guide" className="text-indigo-400 hover:text-indigo-300">JWT Signature Verification Guide</Link></li>
              <li><Link to="/hs256-vs-rs256" className="text-indigo-400 hover:text-indigo-300">HS256 vs RS256</Link></li>
              <li><Link to="/jwt-security-best-practices" className="text-indigo-400 hover:text-indigo-300">JWT Security Best Practices</Link></li>
              <li><Link to="/decode-jwt-without-a-server" className="text-indigo-400 hover:text-indigo-300">Decode a JWT Without a Server</Link></li>
            </ul>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
