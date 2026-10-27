/** Compact hero: H1 + one line, kept short so the decoder input sits above the fold. */
export function HomeHero() {
  return (
    <section aria-labelledby="tool-intro-heading">
      <h1 id="tool-intro-heading" className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
        JWT Decoder, Inspector &amp; Signature Verifier
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        Paste a JSON Web Token to decode its header and payload, inspect every claim, and verify the
        signature. Everything runs locally in your browser.
      </p>
    </section>
  );
}

/** Longer introduction, shown below the tool. */
export function HomeIntro() {
  return (
    <section aria-labelledby="about-jwt-heading" className="space-y-3">
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
        <h2 id="about-jwt-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
          What This JWT Decoder Does
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          A <strong className="text-slate-700 dark:text-slate-300">JSON Web Token (JWT)</strong> is a compact, self-contained token
          format — defined in <abbr title="Request for Comments 7519">RFC 7519</abbr> — used to securely represent
          identity and session claims between services. When you log in to a modern web application, API, or
          OAuth 2.0 service, the access token you receive is almost always a JWT.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Paste any JWT above to instantly <strong className="text-slate-700 dark:text-slate-300">decode</strong> the header and
          payload, <strong className="text-slate-700 dark:text-slate-300">inspect</strong> all standard and custom claims with
          human-readable timestamps, and optionally <strong className="text-slate-700 dark:text-slate-300">verify</strong> the
          signature using HS256/RS256/ES256 and all standard variants.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          This is a <strong className="text-slate-700 dark:text-slate-300">private JWT decoder</strong> that runs entirely in your
          browser via the Web Crypto API — you can <strong className="text-slate-700 dark:text-slate-300">decode a JWT without sending
          it to any server</strong>. The tool is a fully local JWT decoder: no upload, no account, no telemetry on token contents.
          You can verify there are zero outbound network requests carrying your token in DevTools → Network.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Developers debugging auth flows',
            'QA engineers inspecting test tokens',
            'Security engineers auditing claims',
            'API integrators reading token content',
          ].map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Quick feature grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: '⚡', label: 'Instant decode', sub: 'No button click needed' },
          { icon: '🔒', label: 'Local-only', sub: 'Token stays in browser' },
          { icon: '✔', label: 'Verify signatures', sub: 'HS256, RS256, ES256+' },
          { icon: '🕐', label: 'Timestamp display', sub: 'Human-readable exp/iat' },
        ].map(f => (
          <div key={f.label} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-alt)] px-3 py-2.5 text-center">
            <div className="text-base mb-1" aria-hidden>{f.icon}</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">{f.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-600 mt-0.5 leading-tight">{f.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
