export function JwtStructureSection() {
  return (
    <section aria-labelledby="structure-heading" className="space-y-5 pt-4">
      <div className="flex items-center gap-3">
        <h2 id="structure-heading" className="text-base font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          JWT Structure Explained
        </h2>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
        A JSON Web Token has three Base64url-encoded segments separated by dots. Understanding each part
        helps you decode and verify tokens correctly — and avoid common security mistakes.
      </p>

      {/* Visual structure */}
      <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)] p-4">
        <div className="font-mono text-sm mb-3 break-all leading-relaxed">
          <span className="text-[#fb923c]">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>
          <span className="text-slate-600 dark:text-slate-700 font-bold">.</span>
          <span className="text-[#a78bfa]">eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcxNjQ3NzM2MSwiZXhwIjoxNzE2NDgwOTYxfQ</span>
          <span className="text-slate-600 dark:text-slate-700 font-bold">.</span>
          <span className="text-[#34d399]">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
        </div>
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#fb923c]" />Header</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a78bfa]" />Payload</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#34d399]" />Signature</span>
        </div>
      </div>

      <div className="space-y-4">

        {/* Header */}
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-orange-500/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]" />
            <h3 className="text-sm font-semibold text-[#fb923c]">Header</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The header is a JSON object that declares the token type and the signing algorithm.
              It is Base64url-encoded — not encrypted — so anyone can read it without a key.
            </p>
            <pre className="font-mono text-xs text-[#fb923c] bg-black/20 rounded-lg p-3 overflow-x-auto">
{`{
  "alg": "HS256",   // signing algorithm
  "typ": "JWT",     // token type
  "kid": "key-01"  // key ID (optional hint for verification)
}`}
            </pre>
            <p className="text-xs text-slate-500 dark:text-slate-600 leading-relaxed">
              The <code className="font-mono text-[#fb923c]">alg</code> field controls how the signature is computed
              and must be validated by the receiver. Never accept a token where{' '}
              <code className="font-mono text-[#fb923c]">alg</code> has been substituted with{' '}
              <code className="font-mono">"none"</code> — this is a known algorithm confusion attack.
            </p>
          </div>
        </div>

        {/* Payload */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-violet-500/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a78bfa]" />
            <h3 className="text-sm font-semibold text-[#a78bfa]">Payload</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The payload contains the token's <em>claims</em> — key-value statements about the subject and
              session. It is Base64url-encoded but <strong className="text-rose-400">NOT encrypted</strong>.
              Anyone holding the token can read every claim without a key. Never store passwords,
              secrets, or sensitive PII in a JWT payload.
            </p>
            <pre className="font-mono text-xs text-[#a78bfa] bg-black/20 rounded-lg p-3 overflow-x-auto">
{`{
  "sub": "user_123",              // Subject (user ID)
  "iss": "https://auth.acme.com", // Issuer
  "aud": "https://api.acme.com",  // Audience
  "exp": 1716480961,              // Expiry (Unix timestamp)
  "iat": 1716477361,              // Issued At
  "name": "Jane Developer",       // Custom claim
  "roles": ["editor", "viewer"]   // Custom claim
}`}
            </pre>
          </div>
        </div>

        {/* Signature */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-500/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <h3 className="text-sm font-semibold text-[#34d399]">Signature</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The signature is computed over <code className="font-mono text-xs">base64url(header) + "." + base64url(payload)</code> using
              the signing key. It makes the token <em>tamper-evident</em>: if a single byte of the header or
              payload changes, the signature no longer matches. However, the signature only proves
              authenticity when you actually verify it — decoding alone tells you nothing about whether
              the token is authentic.
            </p>
            <pre className="font-mono text-xs text-[#34d399] bg-black/20 rounded-lg p-3 overflow-x-auto">
{`// For HS256:
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  shared_secret
)

// For RS256:
RSA_SHA256_Sign(
  base64url(header) + "." + base64url(payload),
  private_key
)`}
            </pre>
          </div>
        </div>

        {/* Base64url box */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-600 mb-3">
            What is Base64url encoding?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Base64url is a variant of standard Base64 that replaces <code className="font-mono text-xs">+</code> with{' '}
            <code className="font-mono text-xs">-</code> and <code className="font-mono text-xs">/</code> with{' '}
            <code className="font-mono text-xs">_</code>, and omits padding characters (<code className="font-mono text-xs">=</code>).
            This makes JWTs safe to use in URLs, HTTP headers, and cookies without additional encoding.
            Crucially, Base64url is a reversible <em>encoding</em> — not encryption. Any Base64url string
            can be decoded by anyone, with no key required. The JSON payload inside a JWT is therefore
            readable by anyone who has the token.
          </p>
        </div>

      </div>
    </section>
  );
}
