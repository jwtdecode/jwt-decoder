import { Link } from 'react-router-dom';

interface Step {
  number: string;
  title: string;
  body: React.ReactNode;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Paste your JWT token',
    body: (
      <>
        Copy any JWT from your application, API response, browser DevTools, or HTTP header
        and paste it into the input field above. The decoder processes the token in real time
        as you type — no button click required. You can also click <strong>Load sample</strong> to
        see a complete token with all standard claims pre-populated.
        <br /><br />
        A valid JWT contains exactly three Base64url-encoded segments separated by dots
        (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">header.payload.signature</code>).
        The segment counter shows how many parts were detected. If it reads less than 3/3,
        the token may be truncated or malformed.
      </>
    ),
  },
  {
    number: '02',
    title: 'Read the Decoded tab',
    body: (
      <>
        The <strong>Decoded</strong> tab displays syntax-highlighted JSON for both the
        header and payload. The header shows the signing algorithm
        (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">alg</code>) and
        token type (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">typ</code>).
        Common algorithms include <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">HS256</code> (HMAC-SHA256,
        shared secret), <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">RS256</code> (RSA-SHA256,
        asymmetric key pair), and <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">ES256</code> (ECDSA-SHA256).
        <br /><br />
        An amber warning reminds you that <strong>decoding is not verification</strong>: anyone
        can decode a JWT without a key. The payload is Base64url-encoded, not encrypted,
        so its contents are fully readable by anyone holding the token.
      </>
    ),
  },
  {
    number: '03',
    title: 'Inspect claims in the Claims tab',
    body: (
      <>
        The <strong>Claims</strong> tab gives you a structured view of every claim.
        Standard registered claims receive labelled cards with explanations:
        <br /><br />
        <ul className="space-y-1 ml-2">
          {[
            ['exp', 'Expiration — shows Active or Expired with a status badge'],
            ['nbf', 'Not Before — shows Not Yet Valid if still in the future'],
            ['iat', 'Issued At — formatted as a human-readable date and relative time'],
            ['iss', 'Issuer — the auth server that created the token'],
            ['sub', 'Subject — typically a user ID or service account'],
            ['aud', 'Audience — the intended recipient of the token'],
            ['jti', 'JWT ID — unique identifier to prevent replay attacks'],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-2 text-xs text-slate-500 dark:text-slate-500">
              <code className="font-mono text-indigo-400 shrink-0">{k}</code>
              <span>{v}</span>
            </li>
          ))}
        </ul>
        <br />
        Custom claims defined by your application appear in a separate section below.
      </>
    ),
  },
  {
    number: '04',
    title: 'Verify the signature (optional)',
    body: (
      <>
        Go to the <strong>Verify</strong> tab and enter the appropriate key to
        cryptographically confirm whether the token&apos;s signature is valid:
        <br /><br />
        <ul className="space-y-1 ml-2">
          {[
            'HMAC tokens (HS256/384/512): paste or type the shared secret string',
            'RSA tokens (RS256/384/512, PS256/384/512): paste the public key in PEM format',
            'ECDSA tokens (ES256/384/512): paste the EC public key in PEM format',
          ].map(item => (
            <li key={item} className="flex gap-2 text-xs text-slate-500 dark:text-slate-500">
              <span className="text-indigo-400 shrink-0 mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <br />
        All cryptographic operations use the browser&apos;s built-in Web Crypto API. Your
        key is never transmitted. A green result means the signature is valid; red means
        the key is wrong, the algorithm mismatched, or the token was tampered with.
      </>
    ),
  },
  {
    number: '05',
    title: 'Troubleshoot common issues',
    body: (
      <>
        <ul className="space-y-2">
          {[
            ['"Expired" badge', 'The exp claim is in the past. Check your server clock and token issuance logic. Never extend expiry to work around bugs — fix the root cause.'],
            ['"Invalid signature"', 'Caused by: wrong secret or key, wrong key format (raw vs. base64), token modified after signing, or alg mismatch. Double-check the key and algorithm.'],
            ['"Malformed JWT"', 'The token must have exactly three dot-separated segments. Whitespace, line breaks, or extra characters will cause parse failures. Copy the token fresh from the source.'],
            ['Missing exp claim', 'The token shows "No Expiry." Technically valid, but poor security practice — tokens without an expiration remain valid indefinitely unless actively revoked.'],
          ].map(([label, explanation]) => (
            <li key={label as string} className="flex gap-2 text-xs">
              <span className="text-indigo-400 shrink-0">▸</span>
              <span className="text-slate-500 dark:text-slate-500">
                <strong className="text-slate-700 dark:text-slate-300">{label}</strong>
                {' — '}
                {explanation}
              </span>
            </li>
          ))}
        </ul>
        <br />
        <span className="text-xs text-slate-500 dark:text-slate-500">
          For a comprehensive reference, see the{' '}
          <Link to="/common-jwt-errors-and-fixes" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            Common JWT Errors and Fixes guide
          </Link>.
        </span>
      </>
    ),
  },
];

export function HowToSection() {
  return (
    <section aria-labelledby="howto-heading" className="space-y-6 pt-4">
      <div className="flex items-center gap-3">
        <h2 id="howto-heading" className="text-base font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          How to Use This JWT Decoder
        </h2>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
        A step-by-step guide to decoding, inspecting, and verifying JSON Web Tokens with this tool.
      </p>

      <div className="space-y-4">
        {steps.map(step => (
          <div key={step.number} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-card-alt)]">
              <span className="font-mono text-xs text-slate-600 dark:text-slate-700 tabular-nums">{step.number}</span>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{step.title}</h3>
            </div>
            <div className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {step.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
