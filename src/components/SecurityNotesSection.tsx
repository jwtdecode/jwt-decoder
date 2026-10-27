import { Link } from 'react-router-dom';

const notes = [
  {
    icon: '🔐',
    title: 'Always verify signatures server-side',
    body: 'Decoding a JWT reveals its claims but proves nothing about authenticity. Server-side signature verification — using a trusted JWT library with your issuer\'s public key or shared secret — is the only way to confirm a token is genuine and unmodified. Client-side verification (as this tool provides) is for debugging and inspection only.',
  },
  {
    icon: '⚠',
    title: 'Decoded payloads can be tampered with',
    body: 'If your application reads JWT claims without verifying the signature, an attacker can modify the payload and re-encode it. A common example: changing "role": "user" to "role": "admin". The signature will then be invalid — but only if you check it. Applications that skip verification are vulnerable to privilege escalation.',
  },
  {
    icon: '🕐',
    title: 'Validate exp, nbf, iss, and aud explicitly',
    body: 'Signature verification proves the token was signed with a known key. It does not automatically enforce claim constraints. Your server must still explicitly: reject tokens where exp is in the past, reject tokens where nbf is in the future, verify iss matches the expected issuer URL, and verify aud matches your service identifier. Many real-world vulnerabilities come from skipping these checks.',
  },
  {
    icon: '🚫',
    title: 'Never store sensitive data in JWT payloads',
    body: 'The JWT payload is encoded, not encrypted — it is readable by anyone who has the token, including users, proxies, and logging systems. Never include passwords, API secrets, private keys, credit card numbers, social security numbers, or unredacted PII in JWT claims. For sensitive data that must travel in a token, use JSON Web Encryption (JWE) instead.',
  },
  {
    icon: '🔑',
    title: 'Protect your signing keys',
    body: 'For HS256, your shared secret must be long (at least 32 bytes of high-entropy random data), kept out of source control, and rotated immediately if compromised. For RS256/ES256, never expose your private key in client-side code. Publish your public keys via a JWKS endpoint and implement key rotation with overlap periods so existing tokens remain verifiable during rotation.',
  },
  {
    icon: '🛡',
    title: 'Use this tool safely with production tokens',
    body: 'Although this tool processes tokens entirely in your browser (nothing is transmitted), good security hygiene still applies: avoid pasting live production tokens from critical systems into browser-based tools when possible. Use staging tokens or development tokens for debugging. If you must inspect a production token, disconnect from the network first to confirm no requests are made, then clear the input field when done.',
  },
];

export function SecurityNotesSection() {
  return (
    <section aria-labelledby="security-heading" className="space-y-5 pt-4">
      <div className="flex items-center gap-3">
        <h2 id="security-heading" className="text-base font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          JWT Security Notes
        </h2>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
        Essential security considerations every developer working with JWTs should understand.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {notes.map(note => (
          <div key={note.title} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden>{note.icon}</span>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">{note.title}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-600 leading-relaxed">{note.body}</p>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-600 pt-1">
        For a complete security reference, see the{' '}
        <Link to="/jwt-security-best-practices" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
          JWT Security Best Practices guide
        </Link>.
      </div>
    </section>
  );
}
