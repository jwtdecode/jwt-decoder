import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'The JWT Refresh Token Pattern: Implementation and Pitfalls',
  description: 'Short-lived access tokens plus long-lived refresh tokens, the canonical JWT pattern. This guide covers implementation, rotation, revocation, replay detection, and the storage decisions that make it work.',
  url: 'https://jwtdecode.app/jwt-refresh-token-pattern',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-refresh-token-pattern',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-05-27',
  dateModified: '2026-05-27',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function JwtRefreshTokenPatternPage() {
  return (
    <>
      <SEOHead
        title="JWT Refresh Token Pattern: Implementation"
        description="Short-lived access tokens with long-lived refresh tokens. Rotation, replay detection, secure storage, revocation, and the implementation pitfalls."
        path="/jwt-refresh-token-pattern"
        ogType="article"
        article={{ publishedTime: '2026-05-27', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Refresh Token Pattern' }]}
        publishedDate="2026-05-27"
        relatedLinks={[
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'JWT Storage', description: 'Where to keep access tokens and refresh tokens in the browser.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'The broader security checklist refresh tokens fit inside.' },
          { to: '/jwt-vs-session-tokens', label: 'JWT vs Session Tokens', description: 'When refresh tokens are the wrong abstraction.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'How OAuth defines refresh tokens at the protocol level.' },
        ]}
      >
        <ArticleH1>The JWT Refresh Token Pattern: Implementation and Pitfalls</ArticleH1>

        <ArticleIntroBox>
          A JWT cannot be revoked. That's the whole point, verification is self-contained, no server lookup
          needed. But "I logged out, why am I still authenticated for the next hour" is unacceptable in
          practice. The standard solution is to make access tokens short-lived (minutes) and use a
          longer-lived refresh token to mint new ones. This guide explains how the pattern works, why it's
          mostly an answer to JWT's revocation problem, and the implementation details that distinguish a
          working refresh flow from a broken one.
        </ArticleIntroBox>

        <ArticleH2 id="the-problem-it-solves">The Problem Refresh Tokens Solve</ArticleH2>
        <ArticleP>
          A stateless JWT is a <a href="/jwt-vs-bearer-token" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">bearer credential</a>, valid until <ArticleCode>exp</ArticleCode>. Revocation in
          the traditional session sense requires a server-side lookup on every request, which defeats the
          point of self-contained tokens. So most JWT-based systems can't honour an immediate <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">logout</a>. They
          honour expiry.
        </ArticleP>
        <ArticleP>
          The compromise: make the access token expire fast (5-15 minutes is typical). The window of
          unrevokable authority is short. To avoid forcing the user to log in every 15 minutes, the auth
          server issues a separate refresh token, a long-lived credential whose only purpose is to mint new
          access tokens. The refresh token IS server-tracked (in a database row), so it can be revoked. Logout
          deletes the refresh row; existing access tokens age out within 15 minutes.
        </ArticleP>

        <ArticleH2 id="the-flow">The Flow</ArticleH2>
        <ArticlePre lang="text">{`1. Login
   Client → /auth/login (username + password)
   Server → access_token (JWT, 15-min exp)
            refresh_token (opaque or JWT, 30-day exp, stored server-side)

2. API calls
   Client → /api/something (Authorization: Bearer <access_token>)
   Server verifies access_token signature + exp. No DB lookup.

3. Access token expires (after ~15 min)
   Client → /auth/refresh (refresh_token)
   Server: lookup refresh_token in DB, verify not revoked + not expired
   Server → new access_token + new refresh_token (rotated)
   Server: mark old refresh_token as used (rotation log)

4. Logout
   Client → /auth/logout
   Server: delete refresh_token row from DB
   Existing access_token still valid until exp (~15 min max)`}</ArticlePre>

        <ArticleH2 id="storage">Where to Store Each Token</ArticleH2>
        <ArticleH3 id="access-token-storage">Access token: in-memory only</ArticleH3>
        <ArticleP>
          Holding the access token in a JavaScript variable (NOT localStorage, NOT a non-HttpOnly cookie)
          minimises XSS exposure. If an attacker exfiltrates the in-memory token, they get a 15-minute window;
          if they exfiltrate a token from localStorage, they get whatever <ArticleCode>exp</ArticleCode> says
          plus the ability to read it on every page load.
        </ArticleP>
        <ArticleH3 id="refresh-token-storage">Refresh token: HttpOnly cookie</ArticleH3>
        <ArticleP>
          The refresh token must survive page reloads (otherwise the user has to log in every time they
          refresh). It must NOT be accessible to JavaScript (otherwise XSS gets the long-lived credential).
          That points to one option: an HttpOnly cookie with <ArticleCode>Secure</ArticleCode>,
          <ArticleCode>SameSite=Strict</ArticleCode>, and ideally <ArticleCode>Path=/auth/refresh</ArticleCode> so
          the cookie is only transmitted when calling the refresh endpoint, limiting which other endpoints
          could leak it via response logs or misconfiguration.
        </ArticleP>
        <ArticleP>
          See <a href="/jwt-storage-localstorage-vs-cookie" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline">JWT Storage</a> for the full storage tradeoffs.
        </ArticleP>

        <ArticleH2 id="rotation">Refresh Token Rotation (Mandatory, Not Optional)</ArticleH2>
        <ArticleP>
          On every refresh, the server should:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Issue a new refresh token (not just a new access token).</ArticleLi>
          <ArticleLi>Mark the old refresh token as USED in the database.</ArticleLi>
          <ArticleLi>Reject any subsequent attempt to use the old refresh token.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          This catches refresh-token theft: if an attacker steals the refresh cookie and uses it once, the
          legitimate user's next refresh will be rejected (because the legitimate refresh token is now
          marked used). The legitimate user gets logged out, but you've detected the breach and can
          revoke the entire session family server-side.
        </ArticleP>
        <ArticleCallout type="warning">
          The OAuth 2.0 Best Current Practice (RFC 9700, 2024) requires refresh-token rotation for public
          clients. If you're not rotating, an attacker who steals the refresh token can use it indefinitely
          alongside the legitimate user, neither side will notice until the absolute expiry.
        </ArticleCallout>

        <ArticleH2 id="replay-detection">Replay Detection: The Family Pattern</ArticleH2>
        <ArticleP>
          When rotation detects a replay (an already-USED refresh token presented again), the right response
          isn't just to reject the request, it's to invalidate every refresh token in the same session
          family. The original refresh token spawned a chain of rotations; if any earlier link in the chain is
          presented after being marked USED, EVERY descendant token should be revoked.
        </ArticleP>
        <ArticleP>
          Implementation: store a <ArticleCode>family_id</ArticleCode> on each refresh-token row, set on the
          initial login. Every rotation copies the parent's <ArticleCode>family_id</ArticleCode>. On detection
          of a replay, <ArticleCode>UPDATE refresh_tokens SET revoked = true WHERE family_id = ?</ArticleCode>.
          The legitimate user gets logged out (one false positive cost) but the attacker can no longer use the
          stolen token's family.
        </ArticleP>

        <ArticleH2 id="opaque-vs-jwt-refresh">Should the Refresh Token Be a JWT?</ArticleH2>
        <ArticleP>
          The refresh token can be a JWT, but it doesn't gain much from being one, refresh tokens are
          always validated server-side anyway (you need the DB lookup for revocation, family tracking, and
          rotation state), so the JWT's signature self-validation is wasted.
        </ArticleP>
        <ArticleP>
          Most production systems use an <strong>opaque refresh token</strong>: a randomly-generated 256-bit
          string, stored hashed in the database (so a DB leak doesn't expose live credentials). The token the
          client holds is the only "live" copy; the DB stores SHA-256 hashes the same way password hashes are
          stored.
        </ArticleP>

        <ArticleH2 id="lifetimes">Lifetime Recommendations</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Access token (JWT)</strong>: 5-15 minutes. Shorter is safer; longer reduces refresh-endpoint load.</ArticleLi>
          <ArticleLi><strong>Refresh token (sliding window)</strong>: 7-30 days, extended on every use. After 30 days of inactivity, the user has to re-authenticate fully.</ArticleLi>
          <ArticleLi><strong>Refresh token (absolute)</strong>: 60-90 days hard cap, even with active use. Forces periodic re-authentication for long sessions.</ArticleLi>
          <ArticleLi><strong>"Remember me" flow</strong>: longer sliding window (30-90 days) with absolute cap of 12 months. Sensitive operations (password change, payment) still require re-authentication.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="logout">Logout: The Whole Point</ArticleH2>
        <ArticleP>
          A correct logout flow:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Server deletes the current refresh token's row (and ideally the entire family, since the user is leaving).</ArticleLi>
          <ArticleLi>Server clears the refresh cookie via <ArticleCode>Set-Cookie: refresh=; Max-Age=0; …</ArticleCode>.</ArticleLi>
          <ArticleLi>Client drops the in-memory access token.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The in-flight access token (if any) remains valid until its <ArticleCode>exp</ArticleCode>: that's
          the residual revocation gap. If your threat model can't tolerate even a 15-minute gap, you need
          either (a) shorter access tokens (1-2 minutes), or (b) a revocation list checked on every API
          request (which mostly defeats stateless JWT). Most apps accept the gap.
        </ArticleP>

        <ArticleH2 id="implementation-pitfalls">Implementation Pitfalls</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Sliding window without rotation</strong>: extending the refresh token's lifetime without rotating it. An attacker who steals the token keeps it alive indefinitely as long as they keep using it.</ArticleLi>
          <ArticleLi><strong>Race conditions on rotation</strong>: two concurrent API calls both trigger refresh, both submit the old refresh token, one succeeds and one (the legitimate retry) gets a "token already used" error. Mitigate with a brief grace window (5-10 seconds) where both old and new refresh tokens are accepted.</ArticleLi>
          <ArticleLi><strong>Refresh endpoint inside main API</strong>: putting <ArticleCode>POST /api/refresh</ArticleCode> under the same path as authenticated endpoints means the refresh cookie is sent on every API call. Use a dedicated path so <ArticleCode>Path=/auth/refresh</ArticleCode> limits cookie scope.</ArticleLi>
          <ArticleLi><strong>Missing logout endpoint</strong>: clients sometimes "log out" by just dropping the access token client-side, never telling the server. The refresh token stays valid in DB; an attacker who captured the cookie can keep refreshing.</ArticleLi>
          <ArticleLi><strong>Refresh token in localStorage</strong>: defeats the entire purpose. The whole reason for the access/refresh split is so the long-lived credential isn't accessible to JavaScript.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="when-to-skip">When NOT to Use This Pattern</ArticleH2>
        <ArticleP>
          The refresh-token dance is overhead. If your app:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Doesn't need stateless verification (single server, no microservice fan-out), AND</ArticleLi>
          <ArticleLi>Has straightforward revocation requirements</ArticleLi>
        </ArticleUl>
        <ArticleP>
          ...then a traditional server-side session (random ID in a cookie, lookup table in Redis) is simpler
          and has fewer moving parts. See <a href="/jwt-vs-session-tokens" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline">JWT vs Session Tokens</a>. JWTs earn their complexity when verification has to happen on many servers without a shared session store; if that's not your situation, sessions are fine.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Short-lived access tokens (in-memory) plus long-lived refresh tokens (HttpOnly cookie, server-tracked,
          rotated on every use, with family-wide revocation on replay detection) is the canonical JWT pattern.
          It gives you stateless API verification without giving up the ability to log out. The key
          implementation details, rotation, replay detection, family revocation, scoped cookie path, are
          what separate a working refresh flow from a broken one. Skip it entirely if traditional sessions fit
          your needs.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
