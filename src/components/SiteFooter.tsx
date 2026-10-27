import { Link } from 'react-router-dom';

const guides = [
  { label: 'What is a JWT?', to: '/what-is-a-jwt' },
  { label: 'JWT Claims Explained', to: '/jwt-claims-explained' },
  { label: 'How to Debug a JWT', to: '/how-to-debug-a-jwt' },
  { label: 'Common JWT Errors', to: '/common-jwt-errors-and-fixes' },
  { label: 'Verification Guide', to: '/jwt-verification-guide' },
  { label: 'HS256 vs RS256', to: '/hs256-vs-rs256' },
  { label: 'Decode a JWT Without a Server', to: '/decode-jwt-without-a-server' },
  { label: 'Security Best Practices', to: '/jwt-security-best-practices' },
  { label: 'All JWT guides →', to: '/guides' },
];

const siteLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'jwt.io Alternative', to: '/jwt-io-alternative' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms', to: '/terms' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 py-10">

        {/* Main footer grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-500 dark:text-slate-600">

          {/* Brand column */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">JWT Decode</div>
            <p className="leading-relaxed">
              Free online JWT decoder, inspector, and signature verifier.
              Decode any JSON Web Token instantly — header, payload, and all claims —
              entirely in your browser. No backend. No tracking.
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                <span>✓</span>
                <span>100% local processing</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                <span>✓</span>
                <span>No tokens transmitted</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                <span>✓</span>
                <span>Works offline</span>
              </div>
            </div>
          </div>

          {/* JWT Guides column */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">JWT Guides</div>
            <nav aria-label="JWT guides footer navigation">
              <ul className="space-y-1.5">
                {guides.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors leading-relaxed"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Tool info column */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Supported Algorithms</div>
            <ul className="space-y-1 font-mono leading-relaxed">
              <li>HS256 · HS384 · HS512</li>
              <li>RS256 · RS384 · RS512</li>
              <li>ES256 · ES384 · ES512</li>
              <li>PS256 · PS384 · PS512</li>
            </ul>
            <div className="pt-2 space-y-1">
              <div className="font-semibold text-slate-600 dark:text-slate-400">Privacy &amp; Security</div>
              <ul className="space-y-1 leading-relaxed">
                <li>Decoding runs in your browser</li>
                <li>No tokens stored or transmitted</li>
                <li>Web Crypto API for verification</li>
                <li>Ads served by Google AdSense</li>
              </ul>
            </div>
          </div>

          {/* Site links column */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Site</div>
            <nav aria-label="Site footer navigation">
              <ul className="space-y-1.5">
                {siteLinks.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors leading-relaxed"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[var(--border-faint)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 dark:text-slate-600">jwtdecode.app</span>
            <span>·</span>
            <span>RFC 7519 · RFC 7515 · RFC 7518</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Free online JWT decoder</span>
            <span>·</span>
            <span>No backend</span>
            <span>·</span>
            <a href="https://github.com/jwtdecode/jwt-decoder" rel="noopener" className="hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2">Open source on GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
