const sections = [
  {
    id: 'header',
    color: 'text-[#fb923c]',
    border: 'border-orange-500/25',
    bg: 'bg-orange-500/8',
    dotColor: 'bg-[#fb923c]',
    title: 'Header',
    badge: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    example: `{\n  "alg": "HS256",\n  "typ": "JWT"\n}`,
    description: 'The header declares the token type and the signing algorithm used to protect the payload. It is Base64url-encoded — not encrypted.',
    fields: [
      { name: 'alg', desc: 'Signature algorithm (e.g. HS256, RS256, ES256)' },
      { name: 'typ', desc: 'Token type — almost always "JWT"' },
      { name: 'kid', desc: 'Key ID — hints which key was used to sign (optional)' },
    ],
  },
  {
    id: 'payload',
    color: 'text-[#a78bfa]',
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/8',
    dotColor: 'bg-[#a78bfa]',
    title: 'Payload',
    badge: 'eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcxNjQ3NzM2MX0',
    example: `{\n  "sub": "user_123",\n  "iss": "https://auth.example.com",\n  "aud": "https://api.example.com",\n  "exp": 1716480961,\n  "iat": 1716477361,\n  "name": "Jane Developer"\n}`,
    description: 'The payload contains claims — statements about the subject (user) and additional metadata. It is Base64url-encoded but NOT encrypted. Never store sensitive secrets here.',
    fields: [
      { name: 'iss', desc: 'Issuer — who created the token' },
      { name: 'sub', desc: 'Subject — who the token refers to (user ID)' },
      { name: 'aud', desc: 'Audience — intended recipient(s)' },
      { name: 'exp', desc: 'Expiration time (Unix timestamp)' },
      { name: 'nbf', desc: 'Not before — earliest valid time' },
      { name: 'iat', desc: 'Issued at time' },
      { name: 'jti', desc: 'JWT ID — unique token identifier' },
    ],
  },
  {
    id: 'signature',
    color: 'text-[#34d399]',
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/8',
    dotColor: 'bg-[#34d399]',
    title: 'Signature',
    badge: 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    example: `HMACSHA256(\n  base64url(header) + "." +\n  base64url(payload),\n  secret\n)`,
    description: 'The signature proves the token has not been tampered with. For HMAC algorithms it requires the secret; for RSA/EC it requires the private key to sign and the public key to verify.',
    fields: [],
  },
];

const warningItems = [
  'The payload is only encoded (Base64url), not encrypted — anyone can read it.',
  'Decoding a JWT does NOT prove it is authentic or unmodified.',
  'Always verify the signature server-side before trusting any claims.',
  'Never store sensitive secrets, passwords, or PII in JWT claims.',
  'Treat alg=none tokens as unauthenticated and reject them.',
];

export function JwtAnatomy() {
  return (
    <div className="space-y-6">
      {/* Structure overview */}
      <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Token Structure</h3>
        <div className="font-mono text-sm break-all leading-relaxed">
          <span className="text-[#fb923c]">HEADER</span>
          <span className="text-[#3d4460] font-bold">.</span>
          <span className="text-[#a78bfa]">PAYLOAD</span>
          <span className="text-[#3d4460] font-bold">.</span>
          <span className="text-[#34d399]">SIGNATURE</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-600 leading-relaxed">
          A JSON Web Token (JWT, RFC 7519) is a compact, URL-safe token format.
          Three Base64url-encoded segments are joined by dots.
          Only the signature provides authenticity — decoding alone does not.
        </p>
      </div>

      {/* Section cards */}
      {sections.map(s => (
        <div key={s.id} className={`rounded-xl border ${s.border} ${s.bg} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dotColor}`} />
              <span className={`font-semibold ${s.color}`}>{s.title}</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.description}</p>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-600 mb-2 font-mono uppercase tracking-wider">Example</div>
              <pre className={`font-mono text-xs ${s.color} bg-black/30 rounded-lg p-3 overflow-x-auto`}>
                {s.example}
              </pre>
            </div>

            {s.fields.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-600 mb-2 font-mono uppercase tracking-wider">Key Fields</div>
                <div className="space-y-1.5">
                  {s.fields.map(f => (
                    <div key={f.name} className="flex gap-2 text-xs">
                      <code className={`${s.color} bg-black/20 px-1.5 py-0.5 rounded font-mono shrink-0`}>{f.name}</code>
                      <span className="text-slate-500">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Security warnings */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-500">Security Reminders</h3>
        <ul className="space-y-2">
          {warningItems.map(item => (
            <li key={item} className="flex gap-2 text-xs">
              <span className="text-rose-500 shrink-0 mt-0.5">!</span>
              <span className="text-slate-600 dark:text-slate-400">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* References */}
      <div className="text-xs text-slate-600 dark:text-slate-700 space-y-1">
        <div className="font-semibold text-slate-500 dark:text-slate-600">References</div>
        <div>RFC 7519 — JSON Web Token (JWT)</div>
        <div>RFC 7515 — JSON Web Signature (JWS)</div>
        <div>RFC 7518 — JSON Web Algorithms (JWA)</div>
      </div>
    </div>
  );
}
