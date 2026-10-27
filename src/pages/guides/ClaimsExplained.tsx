import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Claims Explained: iss, sub, aud, exp, nbf, iat, jti',
  description: 'Complete reference for all seven standard registered JWT claims, with practical guidance on validation, common values, and implementation requirements.',
  url: 'https://jwtdecode.app/jwt-claims-explained',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-claims-explained',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-05-05',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function ClaimsExplainedPage() {
  return (
    <>
      <SEOHead
        title="JWT Claims Explained: All 7 Standard Claims"
        description="Complete reference for the seven standard JWT claims — iss, sub, aud, exp, nbf, iat, jti — with validation rules and implementation guidance."
        path="/jwt-claims-explained"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Claims Explained' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-05-05"
        relatedLinks={[
          { to: '/jwt-header-payload-signature-explained', label: 'Header, Payload & Signature', description: 'How the payload is structured and encoded.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How to verify signatures and validate claims.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Fixes for exp, iss, aud, and other claim errors.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'How to validate claims correctly in production.' },
        ]}
      >
        <ArticleH1>JWT Claims Explained: iss, sub, aud, exp, nbf, iat, jti</ArticleH1>

        <ArticleIntroBox>
          A JWT claim is a key-value pair in the token payload that conveys a statement about the subject
          or session. RFC 7519 defines seven <em>registered</em> claim names, short, collision-resistant
          identifiers that have a specific, interoperable meaning. Understanding each claim, its validation
          requirements, and its typical values is essential for implementing JWT-based auth correctly.
        </ArticleIntroBox>

        <ArticleH2 id="overview">Claim Categories</ArticleH2>
        <ArticleP>
          RFC 7519 defines three categories of claims:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Registered claims:</strong> Predefined claim names with a specific meaning: iss, sub,
            aud, exp, nbf, iat, jti. None are required by the spec, but most are required by good security
            practice. Their names are short by design, compactness is a JWT goal.
          </ArticleLi>
          <ArticleLi>
            <strong>Public claims:</strong> Names that are registered with IANA to avoid collisions. Examples
            include <ArticleCode>email</ArticleCode>, <ArticleCode>name</ArticleCode>,{' '}
            <ArticleCode>picture</ArticleCode>, and <ArticleCode>phone_number</ArticleCode>{' '}
            (used by <a href="/jwt-in-oauth2-and-openid-connect" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">OpenID Connect</a>).
          </ArticleLi>
          <ArticleLi>
            <strong>Private claims:</strong> Application-specific names agreed between the token issuer and
            consumer. Use URI-style namespacing (e.g.,{' '}
            <ArticleCode>https://myapp.com/roles</ArticleCode>) to avoid collisions with standard names.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="iss">iss, Issuer</ArticleH2>
        <ArticleP>
          The <ArticleCode>iss</ArticleCode> (Issuer) claim identifies the principal that issued the token.
          For OAuth 2.0 and OIDC, this is typically the authorization server's base URL:
        </ArticleP>
        <ArticlePre>{`"iss": "https://auth.example.com/"`}</ArticlePre>
        <ArticleP>
          <strong>Validation:</strong> If your application receives tokens from a specific issuer, you must
          validate that <ArticleCode>iss</ArticleCode> exactly matches the expected value. This prevents
          token substitution attacks where a token issued by a different (possibly malicious) auth server
          is accepted. String comparison must be exact, do not use prefix matching.
        </ArticleP>
        <ArticleP>
          Most JWT libraries accept an <ArticleCode>issuer</ArticleCode> parameter during verification
          and will reject tokens with a mismatched <ArticleCode>iss</ArticleCode> automatically.
        </ArticleP>

        <ArticleH2 id="sub">sub, Subject</ArticleH2>
        <ArticleP>
          The <ArticleCode>sub</ArticleCode> (Subject) claim identifies the principal that is the subject
          of the JWT, in practice, usually a unique user identifier.
        </ArticleP>
        <ArticlePre>{`"sub": "user_a8f3c2d1"`}</ArticlePre>
        <ArticleP>
          The <ArticleCode>sub</ArticleCode> value must be locally unique within the context of the issuer
          and must be a case-sensitive string. It is typically an opaque user ID (not an email address) to
          avoid coupling to mutable identity attributes. The combination of <ArticleCode>iss</ArticleCode> and{' '}
          <ArticleCode>sub</ArticleCode> is globally unique and can serve as a stable identifier across sessions.
        </ArticleP>

        <ArticleH2 id="aud">aud, Audience</ArticleH2>
        <ArticleP>
          The <ArticleCode>aud</ArticleCode> (Audience) claim identifies the recipients that the JWT is
          intended for. This is either a single string or an array of strings:
        </ArticleP>
        <ArticlePre>{`"aud": "https://api.example.com"

// or multiple audiences:
"aud": ["https://api.example.com", "https://reports.example.com"]`}</ArticlePre>
        <ArticleP>
          <strong>Validation:</strong> Each service that receives a JWT must verify that its own identifier
          appears in the <ArticleCode>aud</ArticleCode> claim. A token intended for your reporting API
          should never be accepted by your payments API. This prevents token forwarding attacks.
        </ArticleP>
        <ArticleCallout type="danger">
          Skipping audience validation is a common and dangerous mistake. If your API accepts tokens with
          any audience value, an attacker with a token from one of your other services can use it to
          authenticate against your API.
        </ArticleCallout>

        <ArticleH2 id="exp">exp, Expiration Time</ArticleH2>
        <ArticleP>
          The <ArticleCode>exp</ArticleCode> (Expiration Time) claim is a Unix timestamp (seconds since
          the Unix epoch) after which the JWT must not be accepted:
        </ArticleP>
        <ArticlePre>{`"exp": 1716480961   // 2024-05-23T18:29:21Z`}</ArticlePre>
        <ArticleP>
          <strong>Validation:</strong> Reject any token where the current time is at or after the{' '}
          <ArticleCode>exp</ArticleCode> value. Allow a small clock skew (typically 60 seconds) to
          accommodate minor time differences between distributed servers.
        </ArticleP>
        <ArticleP>
          Short lifetimes are a security feature, not a nuisance. Access tokens typically expire in
          5–60 minutes. If a token is stolen, the attacker's window of use is limited by the <a href="/jwt-expiration-time" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">expiry time</a>.
          Pair short-lived access tokens with longer-lived <a href="/jwt-refresh-token-pattern" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">refresh tokens</a> to maintain user sessions
          without requiring frequent re-authentication.
        </ArticleP>

        <ArticleH2 id="nbf">nbf, Not Before</ArticleH2>
        <ArticleP>
          The <ArticleCode>nbf</ArticleCode> (Not Before) claim is a Unix timestamp before which the
          JWT must not be accepted:
        </ArticleP>
        <ArticlePre>{`"nbf": 1716477361   // valid only after this time`}</ArticlePre>
        <ArticleP>
          This is useful when you want a token to become valid at a specific future time, for example,
          a scheduled batch job authorization that should only activate at midnight. In practice,{' '}
          <ArticleCode>nbf</ArticleCode> is used less frequently than <ArticleCode>exp</ArticleCode>.
          If present, validate it by rejecting tokens where the current time is before the{' '}
          <ArticleCode>nbf</ArticleCode> value (allowing the same clock skew tolerance you apply to{' '}
          <ArticleCode>exp</ArticleCode>).
        </ArticleP>

        <ArticleH2 id="iat">iat, Issued At</ArticleH2>
        <ArticleP>
          The <ArticleCode>iat</ArticleCode> (Issued At) claim records when the token was created:
        </ArticleP>
        <ArticlePre>{`"iat": 1716477361   // 2024-05-23T17:29:21Z`}</ArticlePre>
        <ArticleP>
          <ArticleCode>iat</ArticleCode> is informational, the spec does not require receivers to reject
          tokens based on it. However, it is useful for monitoring token age, detecting anomalously old
          tokens, and auditing. Some implementations use <ArticleCode>iat</ArticleCode> to enforce a
          maximum token age independent of <ArticleCode>exp</ArticleCode> (for example, rejecting any
          token issued more than 24 hours ago regardless of its expiry claim).
        </ArticleP>

        <ArticleH2 id="jti">jti, JWT ID</ArticleH2>
        <ArticleP>
          The <ArticleCode>jti</ArticleCode> (JWT ID) claim provides a unique identifier for the token:
        </ArticleP>
        <ArticlePre>{`"jti": "a8f3c2d1-6e45-4b2a-9f87-12c3d4e5f6a7"`}</ArticlePre>
        <ArticleP>
          <ArticleCode>jti</ArticleCode> is primarily used to prevent replay attacks. If an attacker
          intercepts a token and re-submits it, a server that maintains a log of seen{' '}
          <ArticleCode>jti</ArticleCode> values can detect and reject the duplicate.
        </ArticleP>
        <ArticleP>
          This requires storing seen JTIs server-side for at least the duration of the token's validity
          window, which partially trades away the stateless benefits of JWTs. It is most useful for
          high-security scenarios like one-time authorization codes or webhook signatures.
        </ArticleP>

        <ArticleH2 id="clock-skew">Clock Skew and exp Validation</ArticleH2>
        <ArticleP>
          In distributed systems, the clocks on different servers are never perfectly synchronised. NTP
          (Network Time Protocol) keeps them close, but a 2–5 second drift is common; in some cloud
          environments or containerised workloads, drift can reach 30–60 seconds if NTP is misconfigured.
        </ArticleP>
        <ArticleP>
          This creates a practical problem: a token issued by Server A with <ArticleCode>exp = T + 300</ArticleCode>{' '}
          might arrive at Server B when Server B's clock already reads <ArticleCode>T + 302</ArticleCode>.
          Without a tolerance, the token is rejected as expired even though it was valid at issuance.
        </ArticleP>
        <ArticleP>
          The standard solution is a <em>clock skew tolerance</em>, typically 60 seconds, applied
          symmetrically to both <ArticleCode>exp</ArticleCode> and <ArticleCode>nbf</ArticleCode>:
        </ArticleP>
        <ArticlePre>{`// Validation with clock skew tolerance
const CLOCK_SKEW_SECONDS = 60
const now = Math.floor(Date.now() / 1000)

// exp check: allow up to 60s after expiry
if (payload.exp && now > payload.exp + CLOCK_SKEW_SECONDS) {
  throw new Error('Token expired')
}

// nbf check: allow tokens issued up to 60s in the future
if (payload.nbf && now < payload.nbf - CLOCK_SKEW_SECONDS) {
  throw new Error('Token not yet valid')
}`}</ArticlePre>
        <ArticleP>
          Most JWT libraries expose a <ArticleCode>clockTolerance</ArticleCode> or{' '}
          <ArticleCode>leeway</ArticleCode> option. Set it to 30–60 seconds. Do not set it higher —
          a large tolerance defeats the purpose of short-lived tokens.
        </ArticleP>

        <ArticleH2 id="oidc-claims">OpenID Connect Standard Claims</ArticleH2>
        <ArticleP>
          OpenID Connect extends JWT with a set of standard identity claims for ID tokens. These are
          registered with IANA and have interoperable meanings across all OIDC providers:
        </ArticleP>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Claim</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Type</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ['name', 'string', "User's full display name"],
                ['given_name', 'string', 'First name'],
                ['family_name', 'string', 'Last name'],
                ['email', 'string', "User's email address"],
                ['email_verified', 'boolean', 'Whether the email address has been verified'],
                ['picture', 'string', 'URL of the profile picture'],
                ['phone_number', 'string', 'Phone number in E.164 format'],
                ['locale', 'string', 'BCP 47 locale tag (e.g., en-GB)'],
                ['nonce', 'string', 'Anti-replay value set by the client in the auth request'],
                ['at_hash', 'string', 'Hash of the access token, binds ID token to access token'],
                ['azp', 'string', 'Authorized party, client ID the token was issued to'],
              ].map(([claim, type, desc]) => (
                <tr key={claim as string} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 px-3 font-mono text-indigo-700 dark:text-indigo-400">{claim}</td>
                  <td className="py-2 px-3 text-slate-500">{type}</td>
                  <td className="py-2 px-3">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          OIDC providers like Auth0, Google, Okta, and AWS <a href="/validate-aws-cognito-jwt" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">Cognito</a> include a subset of these claims in
          their ID tokens based on the OAuth <a href="/jwt-scopes-vs-roles" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">scopes</a> requested (e.g., requesting the{' '}
          <ArticleCode>profile</ArticleCode> scope returns <ArticleCode>name</ArticleCode> and{' '}
          <ArticleCode>picture</ArticleCode>).
        </ArticleP>

        <ArticleH2 id="private-claims">Private, Custom Claims and Naming Conventions</ArticleH2>
        <ArticleP>
          Beyond the seven registered claims, applications commonly add their own claims:
        </ArticleP>
        <ArticlePre>{`{
  "sub": "user_123",
  "exp": 1716480961,
  "email": "jane@example.com",
  "name": "Jane Developer",
  "roles": ["admin", "editor"],
  "org_id": "org_456",
  "https://myapp.com/permissions": ["read", "write"]
}`}</ArticlePre>
        <ArticleP>
          Use URI-prefixed names for custom claims to avoid collisions with current or future standard
          claims. Keep custom claim values small, each claim adds to the <a href="/jwt-size-limit" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">token size</a>, which matters
          for HTTP header and cookie size limits.
        </ArticleP>
        <ArticleP>
          Practical sizing constraints: HTTP headers are typically limited to 8 KB by reverse proxies
          (nginx, HAProxy). Browser cookies are limited to 4 KB per cookie. A JWT with many large claims
          can silently fail to transmit if these limits are exceeded. If your tokens are growing large,
          move infrequently-needed claims out of the JWT and into a dedicated user-info API call.
        </ArticleP>
        <ArticleCallout type="warning">
          Never put secrets, passwords, private keys, or sensitive PII in JWT claims. The payload
          is not encrypted and is readable by anyone who holds the token.
        </ArticleCallout>
      </ArticleLayout>
    </>
  );
}
