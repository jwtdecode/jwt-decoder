import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ data is the single source of truth for both the visible accordion
 * and the FAQPage JSON-LD schema injected into the document.
 * Keep answers in plain text only — no JSX — so JSON.stringify works cleanly.
 */
export const FAQ_DATA: FaqItem[] = [
  {
    question: 'What is JWT decode and why do developers use it?',
    answer:
      'JWT decode is the process of Base64url-decoding a JSON Web Token to reveal its header and payload. A JSON Web Token (JWT) is a compact, URL-safe token defined in RFC 7519 that consists of three dot-separated segments: a header declaring the algorithm, a payload containing claims (key-value data), and a cryptographic signature. Developers decode JWTs to inspect the claims a token carries — such as user ID, roles, expiry time, and issuer — without needing access to the signing key. Common use cases include debugging authentication issues, inspecting third-party tokens, validating claim values during development, and understanding what data a token exposes.',
  },
  {
    question: 'Is it safe to decode a JWT online?',
    answer:
      'It depends entirely on the tool. Many online JWT decoders send your token to a remote server for decoding, which is a serious security risk: a JWT may contain user identities, session scopes, role assignments, and other sensitive claims. JWT Decode processes everything locally in your browser using JavaScript — your token is decoded by your own device and is never transmitted to any server. You can verify this by opening your browser\'s DevTools Network tab and confirming there are zero outbound requests when you paste a token. For absolute certainty, disconnect from the internet and use the tool — it will continue to work perfectly because no network access is required.',
  },
  {
    question: 'What is the difference between decoding and verifying a JWT?',
    answer:
      'Decoding a JWT simply Base64url-decodes the header and payload segments to reveal the original JSON — anyone with the token can do this without any key. Verification is the separate cryptographic step that proves the token is authentic and has not been modified. To verify, you need either the HMAC shared secret (for HS256/384/512) or the issuer\'s public key (for RS256/384/512 or ES256/384/512). Only a correctly verified token should be trusted. Never make authorization decisions based on decoded claims alone — a decoded but unverified JWT can be fabricated or tampered with. Always verify signatures server-side using a trusted JWT library; client-side verification shown here is for inspection and debugging only.',
  },
  {
    question: 'What are the standard JWT claims?',
    answer:
      'RFC 7519 defines seven registered (standard) claim names. iss (Issuer) identifies who issued the token — typically an authentication server URL. sub (Subject) is the principal the token refers to, usually a user ID. aud (Audience) identifies the intended recipient — the service that should accept the token. exp (Expiration Time) is a Unix timestamp after which the token must not be accepted. nbf (Not Before) is a Unix timestamp before which the token must not be accepted. iat (Issued At) records when the token was created. jti (JWT ID) is a unique identifier used to prevent replay attacks. Applications commonly add private claims beyond these — for example, name, email, roles, or org — for application-specific data.',
  },
  {
    question: 'What JWT signing algorithms does this decoder support?',
    answer:
      'JWT Decode supports decoding tokens signed with any algorithm, since Base64url-decoding the header and payload is algorithm-agnostic. For signature verification, the tool uses the browser\'s Web Crypto API to support: HMAC algorithms HS256, HS384, and HS512 (using a shared secret string); RSA algorithms RS256, RS384, and RS512 (using an RSA public key in PEM SPKI format); ECDSA algorithms ES256, ES384, and ES512 (using an EC public key in PEM SPKI format); and RSA-PSS algorithms PS256, PS384, and PS512. Tokens with alg=none are flagged as unsecured. All cryptographic operations run locally via window.crypto.subtle — no keys or tokens are sent to any external service.',
  },
  {
    question: 'Why is my JWT expired, and how do I fix it?',
    answer:
      'A JWT shows as expired when the current time is past the value of the exp (expiration) claim, which is a Unix timestamp in seconds. This is intentional — short-lived tokens limit the blast radius if a token is stolen. To fix expired tokens in development: first confirm your server clock is correct (clock skew between client and server is a common cause); next, check that your JWT library is setting the exp value correctly when issuing tokens; ensure your client is requesting a fresh token rather than caching an old one; if using a refresh-token flow, verify the refresh endpoint is being called. In production, never extend expiry to work around bugs — instead fix the root cause in your token issuance or refresh logic.',
  },
  {
    question: 'Can I decode a JWT without the secret key?',
    answer:
      'Yes — the header and payload of a JWT are simply Base64url-encoded JSON, not encrypted. Any JWT can be fully decoded without any key whatsoever. The signature (the third segment) is what requires a secret or key — it is used only to verify authenticity, not to protect confidentiality. This is a critical security property to understand: JWT payloads are readable by anyone who has the token. Never store passwords, credit card numbers, private keys, or any sensitive secret inside JWT claims. If confidentiality is required, use JSON Web Encryption (JWE) rather than a plain JWT.',
  },
  {
    question: 'What does a decoded JWT look like?',
    answer:
      'A compact JWT looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKYW5lIERldmVsb3BlciIsImlhdCI6MTcxNjQ3NzM2MSwiZXhwIjoxNzE2NDgwOTYxfQ.SIGNATURE. When decoded, the header becomes {"alg":"HS256","typ":"JWT"} and the payload becomes {"sub":"user_123","name":"Jane Developer","iat":1716477361,"exp":1716480961}. The signature is raw binary data encoded as Base64url — it is not human-readable JSON. On this tool, paste any JWT to instantly see syntax-highlighted header and payload JSON, human-readable timestamps, expiry status, and all standard and custom claims.',
  },
  {
    question: 'How is JWT Decode different from jwt.io?',
    answer:
      'Both tools decode tokens in your browser. JWT Decode is an independent, vendor-neutral decoder and verifier: no account, no sign-up prompts, and no telemetry on token contents (Google Analytics records page views only). It focuses on reading and verifying tokens: per-claim descriptions, absolute and relative timestamps with an active/expired status badge, HS/RS/PS/ES signature verification via the Web Crypto API, raw Base64url inspection, and in-depth debugging guides. jwt.io, maintained by Okta (Auth0), also generates and signs tokens, accepts JWK and X.509 keys for verification, and has a JWT library directory. See the full comparison at jwtdecode.app/jwt-io-alternative.',
  },
  {
    question: 'How do I verify a JWT signature locally?',
    answer:
      'In the Verify tab, enter your signing key and click Verify Signature. For HMAC tokens (HS256/384/512), paste or type the shared secret string. For RSA tokens (RS256/384/512) or RSA-PSS tokens (PS256/384/512), paste the RSA public key in PEM format (beginning with -----BEGIN PUBLIC KEY-----). For ECDSA tokens (ES256/384/512), paste the EC public key in PEM format. The tool detects the algorithm from the JWT header automatically. Verification uses window.crypto.subtle — the browser\'s native cryptography engine — so your key is processed entirely on your device and never sent anywhere.',
  },
  {
    question: 'What is the difference between HS256 and RS256?',
    answer:
      'HS256 (HMAC-SHA256) is a symmetric algorithm: the same shared secret is used to both sign and verify a token. Any service holding the secret can issue tokens as well as verify them. RS256 (RSA-SHA256) is an asymmetric algorithm: the auth server signs with a private key, and verifying services only need the public key. With RS256, verifiers cannot forge new tokens because they never have access to the private key. RS256 is preferred when multiple independent services need to verify tokens, because distributing a public key is safe — distributing a shared HS256 secret is not. For new systems, also consider ES256 (ECDSA) which provides equivalent security to RS256 with much smaller keys and signatures.',
  },
  {
    question: 'Can this tool decode encrypted JWTs (JWE)?',
    answer:
      'No. This tool decodes standard signed JWTs (JSON Web Signatures, or JWS), which use Base64url-encoded JSON payloads. JSON Web Encryption (JWE) tokens have a completely different structure with five segments, and the payload is encrypted ciphertext that cannot be decoded without the decryption key. If you paste a JWE token into this decoder, it will show a parse error because the structure does not match a signed JWT. To work with JWE tokens, you need a tool or library that supports decryption with the appropriate key.',
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`shrink-0 transition-transform duration-200 text-slate-500 ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const id = `faq-${index}`;

  return (
    <div className="border border-[var(--border-default)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left
          bg-[var(--surface-card-alt)] hover:bg-slate-100 dark:hover:bg-[#13161f] transition-colors"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{item.question}</span>
        <ChevronIcon open={open} />
      </button>
      {/* Always rendered (hidden when collapsed) so every answer is in the
          prerendered HTML and matches the FAQPage JSON-LD. */}
      <div
        id={id}
        hidden={!open}
        className="px-5 py-4 bg-[var(--surface-subtle)] border-t border-[var(--border-subtle)]"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="space-y-4">

      <div className="flex items-center gap-3">
        <h2 id="faq-heading" className="text-base font-semibold text-slate-700 dark:text-slate-300">
          Frequently Asked Questions
        </h2>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
        Common questions about JWT decoding, verification, and security.
      </p>

      <div className="space-y-2">
        {FAQ_DATA.map((item, i) => (
          <FaqItem key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
