import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Security Best Practices',
  description: 'Essential security best practices for JWT implementation, token lifetime, storage, algorithm choices, key management, validation requirements, and common vulnerabilities to avoid.',
  url: 'https://jwtdecode.app/jwt-security-best-practices',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-security-best-practices',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-05-05',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function SecurityBestPracticesPage() {
  return (
    <>
      <SEOHead
        title="JWT Security Best Practices"
        description="Essential security best practices for JWTs — token lifetime, storage, algorithm choices, key management, claim validation, and common vulnerabilities to avoid."
        path="/jwt-security-best-practices"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Security Best Practices' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-05-05"
        relatedLinks={[
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How to verify JWT signatures correctly.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Choosing a secure signing algorithm.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Diagnosing and fixing JWT security issues.' },
          { to: '/jwt-decoder-vs-jwt-validator', label: 'Decoder vs Validator', description: 'The complete JWT processing pipeline.' },
        ]}
      >
        <ArticleH1>JWT Security Best Practices</ArticleH1>

        <ArticleIntroBox>
          JWTs are secure when implemented correctly, but they introduce specific risks when key practices
          are missed. This guide covers the most important security requirements for production JWT systems —
          from token lifetime and storage to algorithm choice, key management, claim validation, and
          the vulnerabilities that appear most often in real-world JWT deployments.
        </ArticleIntroBox>

        <ArticleH2 id="token-lifetime">1. Use Short Token Lifetimes</ArticleH2>
        <ArticleP>
          The <ArticleCode>exp</ArticleCode> claim is your primary defense against stolen tokens.
          If a token is intercepted or leaked, a <a href="/jwt-expiration-time" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">short expiry</a> limits the attacker's window of use.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Access tokens: 5–15 minutes for high-security APIs; up to 1 hour for general use</ArticleLi>
          <ArticleLi>Refresh tokens: hours to days, stored securely server-side with <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">revocation</a> support</ArticleLi>
          <ArticleLi>One-time tokens: seconds to a few minutes, with jti-based replay prevention</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Never issue access tokens with multi-day or indefinite lifetimes. If users complain about
          re-authentication frequency, implement a refresh token flow rather than extending access token
          expiry. Refresh tokens are long-lived but can be revoked; access tokens are short-lived and stateless.
        </ArticleP>

        <ArticleH2 id="storage">2. Store Tokens Securely</ArticleH2>
        <ArticleCallout type="danger">
          Storing JWTs in <ArticleCode>localStorage</ArticleCode> makes them accessible to any JavaScript
          on the page, including third-party scripts and XSS payloads. This is one of the most common
          JWT security mistakes in web applications.
        </ArticleCallout>
        <ArticleP>
          Storage options and their tradeoffs:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>HttpOnly cookies (recommended):</strong> The browser stores the token and sends it
            automatically. JavaScript cannot access it, so XSS cannot steal it. Use{' '}
            <ArticleCode>SameSite=Strict</ArticleCode> or <ArticleCode>SameSite=Lax</ArticleCode> to
            prevent CSRF. Pair with CSRF tokens for sensitive mutations.
          </ArticleLi>
          <ArticleLi>
            <strong>sessionStorage:</strong> Cleared when the tab closes. More limited XSS exposure than
            localStorage but still accessible to JavaScript on the page. Better than localStorage,
            worse than HttpOnly cookies.
          </ArticleLi>
          <ArticleLi>
            <strong>localStorage:</strong> Persistent, but accessible to all JavaScript on the page.
            Only use for non-sensitive tokens in applications where XSS risk is genuinely low.
          </ArticleLi>
          <ArticleLi>
            <strong>Memory (in-app state):</strong> Safest against XSS, but lost on page refresh.
            Works well with silent refresh: keep a short-lived access token in memory and refresh it
            using a longer-lived HttpOnly refresh token cookie.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="algorithm-restriction">3. Restrict Accepted Algorithms</ArticleH2>
        <ArticleP>
          Always specify the allowed algorithms explicitly when configuring your JWT library.
          Never allow the library to accept any algorithm the token claims to use.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Never accept <ArticleCode>alg=none</ArticleCode>:</strong> This disables signature
            verification entirely. A library that accepts "none" can be exploited by anyone to forge tokens.
          </ArticleLi>
          <ArticleLi>
            <strong>Prevent <a href="/jwt-attacks-and-vulnerabilities" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">algorithm confusion</a>:</strong> If you expect RS256, configure your library to
            only accept RS256. Do not allow HS256 as a fallback. The classic "RS256 to HS256" confusion
            attack lets an attacker sign a token with your public key (treated as an <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">HMAC secret</a>).
          </ArticleLi>
          <ArticleLi>
            <strong>Use modern algorithms:</strong> Prefer RS256/RS384/RS512, ES256/ES384/ES512, or
            PS256/PS384/PS512. Avoid MD5 or SHA-1 based variants if your library offers them.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="claim-validation">4. Validate All Required Claims</ArticleH2>
        <ArticleP>
          Signature verification is necessary but not sufficient. Your application must explicitly
          validate the following claims on every token it processes:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong><ArticleCode>exp</ArticleCode>:</strong> Reject tokens where the current Unix time
            ≥ <ArticleCode>exp</ArticleCode>. Allow a small clock skew tolerance (≤ 60 seconds).
          </ArticleLi>
          <ArticleLi>
            <strong><ArticleCode>nbf</ArticleCode> (if present):</strong> Reject tokens where the
            current Unix time is before <ArticleCode>nbf</ArticleCode>.
          </ArticleLi>
          <ArticleLi>
            <strong><ArticleCode>iss</ArticleCode>:</strong> Reject tokens not issued by the expected
            issuer. Use exact string matching, not prefix matching.
          </ArticleLi>
          <ArticleLi>
            <strong><ArticleCode>aud</ArticleCode>:</strong> Reject tokens not intended for your service.
            Check that your service's identifier appears in the <ArticleCode>aud</ArticleCode> value.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="key-management">5. Manage Keys Properly</ArticleH2>
        <ArticleH3>HMAC Secrets (HS256)</ArticleH3>
        <ArticleUl>
          <ArticleLi>Use at least 32 bytes of cryptographically random data as the secret</ArticleLi>
          <ArticleLi>Store in a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.), not in code or config files</ArticleLi>
          <ArticleLi>Rotate on a schedule and immediately if compromised</ArticleLi>
          <ArticleLi>Never log, transmit in URLs, or commit to source control</ArticleLi>
        </ArticleUl>
        <ArticleH3>Asymmetric Keys (RS256/ES256)</ArticleH3>
        <ArticleUl>
          <ArticleLi>Generate the <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">private key</a> in the auth service and never export it to other services</ArticleLi>
          <ArticleLi>Publish the public key via a <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS endpoint</a> with caching headers</ArticleLi>
          <ArticleLi>Implement key rotation: add a new key, issue tokens with the new <ArticleCode>kid</ArticleCode>,
            support both keys during the overlap period (until old tokens expire), then remove the old key</ArticleLi>
          <ArticleLi>Protect private key storage with HSMs or cloud KMS in high-security environments</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="payload-security">6. Keep Payloads Minimal and Safe</ArticleH2>
        <ArticleUl>
          <ArticleLi>
            <strong>No secrets in claims:</strong> Passwords, API keys, database credentials, and private
            keys must never appear in JWT payloads. The payload is readable by anyone with the token.
          </ArticleLi>
          <ArticleLi>
            <strong>Minimal PII:</strong> Include only the PII claims your service actually needs.
            Tokens often appear in logs; unnecessary PII increases data breach exposure.
          </ArticleLi>
          <ArticleLi>
            <strong>Claims are a snapshot:</strong> JWT claims reflect the state at issuance. A user's
            roles or permissions could change after the token is issued. For privilege-sensitive operations,
            validate current permissions against your database rather than relying solely on token claims.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="revocation">7. Token Revocation Strategies</ArticleH2>
        <ArticleP>
          Stateless JWTs cannot be revoked by default, there is no server-side record to delete.
          Three practical strategies exist, each with different tradeoffs:
        </ArticleP>
        <ArticleH3>Strategy 1: Short Expiry + Refresh Tokens (Recommended)</ArticleH3>
        <ArticleP>
          Issue short-lived access tokens (5–15 minutes) paired with longer-lived refresh tokens
          stored server-side. When you need to revoke a user's access, invalidate their refresh token.
          The next time their access token expires and they attempt a refresh, the request fails.
          The maximum window of continued access is the access token lifetime, typically 5–15 minutes.
        </ArticleP>
        <ArticleP>
          This is the most common production approach. It preserves the stateless benefits of JWTs
          on the hot path (access token verification requires no database lookup) while enabling
          revocation via the refresh token store.
        </ArticleP>
        <ArticleH3>Strategy 2: Token Blocklist (Denylist)</ArticleH3>
        <ArticleP>
          Maintain a server-side store of revoked token identifiers (using the{' '}
          <ArticleCode>jti</ArticleCode> claim). On every request, check whether the token's{' '}
          <ArticleCode>jti</ArticleCode> appears in the blocklist. If it does, reject the token
          regardless of the signature and expiry.
        </ArticleP>
        <ArticleP>
          This provides immediate revocation but reintroduces a database lookup on every API call —
          partially negating the stateless advantage of JWTs. The blocklist must be shared across all
          API instances and pruned periodically (entries can be removed once the token's <ArticleCode>exp</ArticleCode>{' '}
          has passed). Use Redis with TTL-based expiry for efficient implementation.
        </ArticleP>
        <ArticleH3>Strategy 3: Refresh Token Rotation</ArticleH3>
        <ArticleP>
          Each time a refresh token is used to get a new access token, issue a new refresh token and
          invalidate the old one. If a stolen refresh token is used, the legitimate user's next
          refresh will fail (because their token was already rotated), triggering an alert.
          This is rotation with reuse detection.
        </ArticleP>
        <ArticleP>
          Rotation limits the window of exposure even if a refresh token leaks: the attacker and the
          legitimate user are now racing to use it, and whichever uses it first causes the other's
          token to fail. Implement detection logic that flags and revokes all of a user's tokens
          when rotation conflict is detected.
        </ArticleP>
        <ArticlePre>{`// Refresh token rotation, server-side pseudocode
async function refreshAccessToken(refreshToken: string) {
  const stored = await db.findRefreshToken(refreshToken)

  if (!stored) {
    // Token not found, might be a reuse attack
    // Revoke all tokens for this user as a precaution
    await db.revokeAllTokensForUser(stored?.userId)
    throw new Error('Invalid refresh token')
  }

  if (stored.used) {
    // Reuse detected, revoke everything for this user
    await db.revokeAllTokensForUser(stored.userId)
    throw new Error('Refresh token reuse detected')
  }

  // Mark old token as used, issue new pair
  await db.markRefreshTokenUsed(refreshToken)
  const newRefreshToken = await db.createRefreshToken(stored.userId)
  const accessToken = issueAccessToken(stored.userId)

  return { accessToken, refreshToken: newRefreshToken }
}`}</ArticlePre>

        <ArticleH2 id="pkce">8. PKCE for Public Clients</ArticleH2>
        <ArticleP>
          <strong>PKCE</strong> (Proof Key for Code Exchange, RFC 7636) protects OAuth 2.0 authorization
          code flows in public clients, browser-based SPAs and mobile apps, where it is impossible
          to keep a client secret confidential. Without PKCE, an attacker who intercepts the
          authorization code can exchange it for tokens.
        </ArticleP>
        <ArticleP>
          PKCE works by having the client generate a secret before the authorization request and
          prove possession of that secret during the token exchange:
        </ArticleP>
        <ArticlePre>{`// Step 1: Client generates a code verifier (random string, 43–128 chars)
const codeVerifier = generateRandomString(64)

// Step 2: Client computes the code challenge (SHA-256 hash of the verifier)
const codeChallenge = base64url(sha256(codeVerifier))

// Step 3: Client starts the authorization request with the challenge
GET /authorize?
  response_type=code
  &client_id=my-spa
  &redirect_uri=https://myapp.com/callback
  &code_challenge=<codeChallenge>
  &code_challenge_method=S256

// Step 4: After redirect, client exchanges code + original verifier
POST /token
  grant_type=authorization_code
  &code=<authorizationCode>
  &code_verifier=<codeVerifier>    ← server verifies SHA256(verifier) == challenge

// An attacker who intercepts the code cannot exchange it
// because they don't know the code_verifier`}</ArticlePre>
        <ArticleP>
          If an attacker intercepts the authorization code in the redirect, they cannot exchange it
          for tokens because they don't have the <ArticleCode>code_verifier</ArticleCode>: only the
          client that generated it holds that secret. PKCE is now recommended for all OAuth 2.0
          flows, not just public clients (RFC 9700 extends it to confidential clients too).
        </ArticleP>
        <ArticleCallout type="info">
          All major identity providers support PKCE: Auth0, Okta, AWS Cognito, Google, and Azure AD
          all accept PKCE parameters. Your OAuth library should generate the verifier and challenge
          automatically, configure it to use <ArticleCode>code_challenge_method=S256</ArticleCode>{' '}
          (SHA-256), never plain.
        </ArticleCallout>

        <ArticleH2 id="vulnerabilities">9. Common JWT Security Vulnerabilities</ArticleH2>
        <ArticleH3>1. Algorithm Confusion (RS256 → HS256)</ArticleH3>
        <ArticleP>
          Some JWT libraries historically accepted any algorithm specified in the token header.
          An attacker who knows your RS256 public key can create a token with{' '}
          <ArticleCode>"alg": "HS256"</ArticleCode> in the header and sign it using the public key
          as the HMAC secret. A vulnerable verifier fetches the public key, then uses it as an
          HMAC secret (because the header says HS256) and the verification passes.
        </ArticleP>
        <ArticleP>
          <strong>Fix:</strong> Always specify the allowed algorithm list explicitly in your library
          configuration. Never derive the verification algorithm from the token header.
        </ArticleP>

        <ArticleH3>2. alg=none Bypass</ArticleH3>
        <ArticleP>
          RFC 7519 defines <ArticleCode>"alg": "none"</ArticleCode> as a valid value for unsecured JWTs.
          Libraries that blindly trust the header's <ArticleCode>alg</ArticleCode> field will skip
          signature verification when the header claims <ArticleCode>none</ArticleCode>, accepting
          tokens with no signature at all. CVE-2015-9235 (node-jsonwebtoken) and similar CVEs in
          other libraries document this class of vulnerability.
        </ArticleP>
        <ArticleP>
          <strong>Fix:</strong> Never include <ArticleCode>none</ArticleCode> in your allowed
          algorithm list. Any token claiming <ArticleCode>alg=none</ArticleCode> should be rejected
          immediately.
        </ArticleP>

        <ArticleH3>3. kid Header Injection</ArticleH3>
        <ArticleP>
          The <ArticleCode>kid</ArticleCode> (Key ID) header parameter is used to look up the signing
          key. If a library constructs a database query or file path directly from the{' '}
          <ArticleCode>kid</ArticleCode> value without sanitization, an attacker can inject a SQL
          payload or path traversal sequence into <ArticleCode>kid</ArticleCode> to manipulate key
          lookup. In the most severe cases, this allows an attacker to direct verification to use
          a key they control.
        </ArticleP>
        <ArticleP>
          <strong>Fix:</strong> Never use <ArticleCode>kid</ArticleCode> values as raw input to
          database queries or file system lookups. Use a whitelist of known key IDs or look up
          keys from a pre-loaded JWKS only.
        </ArticleP>

        <ArticleH3>4. JWT Header Parameter Injection (jwk, jku, x5u)</ArticleH3>
        <ArticleP>
          The JWT spec allows optional header parameters that specify where to fetch the signing key:
          <ArticleCode>jwk</ArticleCode> (inline public key), <ArticleCode>jku</ArticleCode> (URL to
          JWKS), and <ArticleCode>x5u</ArticleCode> (URL to X.509 certificate). A vulnerable library
          that fetches keys from attacker-controlled URLs allows an attacker to embed their own public
          key in a forged token and have it accepted.
        </ArticleP>
        <ArticleP>
          <strong>Fix:</strong> Ignore <ArticleCode>jwk</ArticleCode>, <ArticleCode>jku</ArticleCode>,
          and <ArticleCode>x5u</ArticleCode> header parameters in incoming tokens. Only use keys from
          your pre-configured JWKS endpoint or secret store. If your library supports it, disable
          these parameters explicitly.
        </ArticleP>

        <ArticleH3>5. Weak HMAC Secrets</ArticleH3>
        <ArticleP>
          HS256 tokens can be offline-brute-forced by an attacker who captures a token. Tools like
          hashcat can test billions of guesses per second against the token's signature. A secret
          derived from a password, UUID, or short string is vulnerable. The OWASP JWT Security
          Cheat Sheet documents this attack vector explicitly.
        </ArticleP>
        <ArticleP>
          <strong>Fix:</strong> Generate HMAC secrets using a cryptographically secure random number
          generator with at least 256 bits (32 bytes) of entropy. Store secrets in a vault, not in
          environment variables committed to source control.
        </ArticleP>

        <ArticleH2 id="other-considerations">10. Additional Considerations</ArticleH2>
        <ArticleUl>
          <ArticleLi>
            <strong>Implement token revocation for refresh tokens:</strong> While access token revocation
            is expensive, refresh token revocation is essential. Maintain a server-side refresh token
            store with invalidation support.
          </ArticleLi>
          <ArticleLi>
            <strong>Use HTTPS everywhere:</strong> JWTs transmitted over plain HTTP can be intercepted.
            Enforce HTTPS with HSTS headers for all endpoints that issue or accept tokens.
          </ArticleLi>
          <ArticleLi>
            <strong>Audit token issuance:</strong> Log when tokens are issued, to which user, for which
            audience, with which claims. Anomaly detection on token issuance patterns can catch credential
            stuffing and account takeover attempts.
          </ArticleLi>
          <ArticleLi>
            <strong>Bind tokens to the client where possible:</strong> Token binding (tying a JWT to a
            specific TLS session or device fingerprint) limits the damage from token theft by making
            stolen tokens unusable from a different client context.
          </ArticleLi>
        </ArticleUl>

        <ArticleCallout type="info">
          Security is a system property, not a single setting. Even a perfectly implemented JWT library
          provides weak security if the overall architecture is flawed. Review your full authentication
          and authorization flow holistically.
        </ArticleCallout>
      </ArticleLayout>
    </>
  );
}
