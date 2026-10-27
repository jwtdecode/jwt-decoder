import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Logout and Revocation: How to Invalidate a Token Before It Expires',
  description: 'How JWT logout really works: short-lived access tokens, revocable refresh tokens, a Redis jti denylist, per-user token versions, RFC 7009 revocation and OIDC logout, with honest trade-offs.',
  url: 'https://jwtdecode.app/jwt-logout-and-revocation',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-logout-and-revocation',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const STRATEGIES: [strategy: string, revokes: string, cost: string, bestFor: string][] = [
  ['Delete token on the client', 'Nothing server-side; a copied token still works', 'None', 'Always do it, never rely on it alone'],
  ['Short access token + revocable refresh token', 'Future refreshes immediately; access token within minutes', 'A refresh-token store', 'The default for most apps'],
  ['jti denylist (Redis)', 'One specific token, immediately', 'One cache lookup per request', 'Logout of a single session, stolen token'],
  ['Token version per user', 'Every token for a user, immediately', 'One lookup per request (cacheable)', 'Password change, "log out everywhere", account lock'],
  ['Rotate the signing key', 'Every token for every user', 'Everyone logs in again', 'Key compromise only'],
  ['Opaque tokens + introspection (RFC 7662)', 'Any token, immediately', 'A call to the auth server per request (cacheable)', 'High-assurance APIs'],
];

export default function JwtLogoutRevocationPage() {
  return (
    <>
      <SEOHead
        title="JWT Logout and Revocation: Invalidate Tokens"
        description="JWT logout best practices: short-lived access tokens, revocable refresh tokens, a Redis jti denylist, token versioning and RFC 7009, with honest trade-offs."
        path="/jwt-logout-and-revocation"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Logout & Revocation' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Short-lived access tokens, rotation and reuse detection.' },
          { to: '/jwt-vs-session-tokens', label: 'JWT vs Session Tokens', description: 'Why stateless tokens make revocation hard in the first place.' },
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'Where to Store a JWT', description: 'Cookies vs localStorage, and what logout has to clear.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Lifetimes, algorithms, keys and claim validation.' },
        ]}
      >
        <ArticleH1>JWT Logout and Revocation: How to Invalidate a Token Before It Expires</ArticleH1>

        <ArticleIntroBox>
          A signed JWT cannot be "logged out". Any server holding the key will accept it until its
          <ArticleCode> exp</ArticleCode> passes, because verification checks only the signature and the claims,
          not a database. So JWT logout is really two jobs: delete the tokens on the client, and make the server
          refuse any copy that is still around. The standard answer is to keep access tokens short-lived (5 to 15
          minutes), revoke the refresh token on logout, and, where you need a token dead immediately, add a small
          server-side check: a denylist keyed by <ArticleCode>jti</ArticleCode>, or a per-user token version. Each
          option adds some state back, which is the honest cost of revocation.
        </ArticleIntroBox>

        <ArticleH2 id="why-jwt-logout-is-hard">Why You Can't Simply Invalidate a JWT</ArticleH2>
        <ArticleP>
          A session ID is a pointer: delete the row and the ID means nothing. A JWT is a self-contained claim
          set signed by the issuer (RFC 7519). The verifier recomputes the signature, checks
          <ArticleCode> exp</ArticleCode>, <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode>, and
          never asks anyone whether the token is still wanted. That is the point of JWTs, and it is also why
          "how do I invalidate a JWT" has no answer that keeps them fully stateless. The{' '}
          <a href="/jwt-vs-session-tokens" className={LINK}>JWT vs session tokens</a> comparison covers the
          design trade-off in more depth.
        </ArticleP>
        <ArticleP>
          In practice the question is how long a leaked or logged-out token may stay usable, and what you are
          willing to pay to shorten that window. The table below sets out the options.
        </ArticleP>

        <ArticleH2 id="jwt-revocation-strategies">JWT Revocation Strategies Compared</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Strategy</th>
                <th className="px-3 py-2 font-semibold">What it revokes</th>
                <th className="px-3 py-2 font-semibold">Cost</th>
                <th className="px-3 py-2 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {STRATEGIES.map(([strategy, revokes, cost, bestFor]) => (
                <tr key={strategy} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{strategy}</td>
                  <td className="px-3 py-2">{revokes}</td>
                  <td className="px-3 py-2">{cost}</td>
                  <td className="px-3 py-2">{bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Most applications combine the first three: client deletion always, short access tokens with revocable
          refresh tokens as the baseline, and a denylist or token version for the cases where minutes matter.
        </ArticleP>

        <ArticleH2 id="jwt-logout-best-practices">JWT Logout Best Practices: Short Access Tokens, Revocable Refresh Tokens</ArticleH2>
        <ArticleP>
          The cheapest form of revocation is a short lifetime. If access tokens live for ten minutes, the worst
          case after logout is ten minutes of use by someone who copied the token. The user stays signed in
          through a refresh token, which is long-lived but is <em>stored server-side</em> and checked every time
          it is used, so it can be revoked like a session. The{' '}
          <a href="/jwt-refresh-token-pattern" className={LINK}>refresh token pattern</a> guide covers rotation and
          reuse detection; for logout, the rules are:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Store refresh tokens (or a hash of them) with the user, device and expiry. An opaque random string is fine; it does not need to be a JWT.</ArticleLi>
          <ArticleLi>On logout, delete or mark revoked the refresh token for that session. The next refresh attempt fails and the user is signed out once the access token expires.</ArticleLi>
          <ArticleLi>For "log out of all devices", revoke every refresh token belonging to the user.</ArticleLi>
          <ArticleLi>Keep access-token lifetimes short enough that the remaining window is acceptable. Choosing the value is covered in <a href="/jwt-expiration-time" className={LINK}>JWT expiration time</a>.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="info">
          If a window of a few minutes after logout is acceptable for your threat model, you do not need anything
          else in this article. Add a denylist only when you have a concrete requirement for immediate
          revocation.
        </ArticleCallout>

        <ArticleH2 id="jwt-revocation-list">JWT Revocation List: a jti Denylist in Redis</ArticleH2>
        <ArticleP>
          To kill one specific access token immediately, give every token a unique <ArticleCode>jti</ArticleCode>
          (JWT ID, RFC 7519 §4.1.7) and, on logout, write that ID to a fast shared store. Every request verifies
          the token as usual and then checks the store. The trick that keeps the list small: set the entry's TTL
          to the token's <em>remaining lifetime</em>. Once the token would have expired anyway, the entry is no
          longer needed and Redis deletes it.
        </ArticleP>
        <ArticlePre lang="javascript">{`// npm install jose redis   (Node 18+; run as an ES module)
import { createClient } from 'redis';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'node:crypto';

const redis = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
await redis.connect();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Issue a short-lived access token with a unique jti
async function issue(userId) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

// Logout: deny this jti only for as long as the token could still be used
async function revoke(token) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  const ttl = payload.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.set(\`deny:\${payload.jti}\`, '1', { EX: ttl });
}

// Every request: verify signature and claims first, then check the denylist
async function authenticate(token) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  if (await redis.exists(\`deny:\${payload.jti}\`)) throw new Error('token revoked');
  return payload;
}

const t = await issue('user-42');
console.log('before logout:', (await authenticate(t)).sub);  // user-42
await revoke(t);
await authenticate(t).catch((e) => console.log('after logout:', e.message)); // token revoked
await redis.quit();`}</ArticlePre>
        <ArticleP>
          Two details matter. Verify <em>before</em> checking the denylist, so unauthenticated requests cannot be
          used to probe or fill the store. And decide what happens when Redis is unavailable: failing closed
          (reject every request) is safer, failing open keeps the service up but briefly honours revoked
          tokens. Pick deliberately and document it.
        </ArticleP>
        <ArticleH3 id="denylist-trade-offs">The honest trade-off</ArticleH3>
        <ArticleP>
          A denylist reintroduces a lookup on every request, which is exactly what JWTs were meant to avoid. It
          is still much cheaper than a full session store: the list only contains tokens revoked in the last
          access-token lifetime, which is usually a few hundred entries, not one per active user. If every service
          in a large system would need the lookup, consider whether opaque tokens with introspection (RFC 7662)
          at the gateway are simpler; see <a href="/jwt-in-microservices" className={LINK}>JWT in microservices</a>.
        </ArticleP>

        <ArticleH2 id="jwt-invalidate-token-per-user">How to Invalidate All of a User's Tokens: Token Versioning</ArticleH2>
        <ArticleP>
          A <ArticleCode>jti</ArticleCode> denylist revokes one token. After a password reset or a "log out
          everywhere" click you want every token the user holds to die, including ones you never saw. The
          pattern: keep an integer <ArticleCode>tokenVersion</ArticleCode> on the user record, copy it into each
          token as a private claim (for example <ArticleCode>tv</ArticleCode>), and reject tokens whose
          <ArticleCode> tv</ArticleCode> is lower than the current value. Incrementing the counter revokes them
          all at once.
        </ArticleP>
        <ArticlePre lang="javascript">{`// At sign-in
const token = await new SignJWT({ tv: user.tokenVersion })
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(user.id)
  .setExpirationTime('15m')
  .sign(secret);

// On each request, after jwtVerify()
const current = await getTokenVersion(payload.sub);   // cache this for a few seconds
if (payload.tv !== current) throw new Error('token revoked');

// On password change or "log out everywhere"
await db.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } });`}</ArticlePre>
        <ArticleP>
          A variant uses a timestamp instead of a counter: store <ArticleCode>tokensValidAfter</ArticleCode> on
          the user and reject any token whose <ArticleCode>iat</ArticleCode> is earlier. Both are one lookup per
          user rather than per token, and both cache well because the value changes rarely.
        </ArticleP>

        <ArticleH2 id="rfc-7009-token-revocation">RFC 7009: the OAuth Token Revocation Endpoint</ArticleH2>
        <ArticleP>
          If you use an OAuth 2.0 or OpenID Connect provider, logout should call its revocation endpoint,
          defined in RFC 7009. The client POSTs the refresh token (and authenticates itself if it is a
          confidential client); the authorisation server invalidates it and, depending on the server, the
          access tokens issued from it.
        </ArticleP>
        <ArticlePre lang="bash">{`curl -X POST https://auth.example.com/oauth/revoke \\
  -u "$CLIENT_ID:$CLIENT_SECRET" \\
  -d "token=$REFRESH_TOKEN" \\
  -d "token_type_hint=refresh_token"`}</ArticlePre>
        <ArticleP>
          The server returns HTTP 200 even if the token was already invalid, so the client cannot use the
          endpoint to test tokens. Note the limit: revoking a refresh token at the provider does nothing to a
          JWT access token that your API verifies locally. That token remains valid until it expires unless
          your API also checks a denylist or introspects. The endpoint URL is published as
          <ArticleCode> revocation_endpoint</ArticleCode> in the provider's discovery or metadata document; see{' '}
          <a href="/jwt-in-oauth2-and-openid-connect" className={LINK}>JWTs in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>

        <ArticleH2 id="jwt-logout-flow">JWT Logout Flow, Step by Step</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>1. Client calls your logout endpoint</strong> with the refresh token (usually in an HttpOnly cookie) and, if you use a denylist, the current access token.</ArticleLi>
          <ArticleLi><strong>2. Server revokes the refresh token</strong> in its own store, or via the provider's RFC 7009 endpoint.</ArticleLi>
          <ArticleLi><strong>3. Server optionally denylists the access token's <ArticleCode>jti</ArticleCode></strong> with a TTL equal to its remaining lifetime.</ArticleLi>
          <ArticleLi><strong>4. Server clears cookies</strong> by sending <ArticleCode>Set-Cookie</ArticleCode> with the same name, path and domain and <ArticleCode>Max-Age=0</ArticleCode>. A mismatched path or domain leaves the original cookie in place.</ArticleLi>
          <ArticleLi><strong>5. Client drops in-memory tokens</strong> and removes anything it put in <ArticleCode>localStorage</ArticleCode> or <ArticleCode>sessionStorage</ArticleCode>; see <a href="/jwt-storage-localstorage-vs-cookie" className={LINK}>where to store a JWT</a>.</ArticleLi>
          <ArticleLi><strong>6. With an OIDC provider, end the provider session too</strong>, otherwise the next login redirect silently signs the user straight back in.</ArticleLi>
        </ArticleUl>

        <ArticleH3 id="oidc-logout">OpenID Connect logout</ArticleH3>
        <ArticleP>
          OpenID Connect defines three logout specifications. <strong>RP-Initiated Logout 1.0</strong> redirects
          the browser to the provider's <ArticleCode>end_session_endpoint</ArticleCode>, usually with
          <ArticleCode> id_token_hint</ArticleCode> and <ArticleCode>post_logout_redirect_uri</ArticleCode>, to
          end the provider's session. <strong>Back-Channel Logout 1.0</strong> has the provider POST a signed
          logout token (a JWT with an <ArticleCode>events</ArticleCode> claim and a <ArticleCode>sid</ArticleCode>
          or <ArticleCode>sub</ArticleCode>) directly to each application's server, so apps can end their own
          sessions when the user logs out elsewhere. <strong>Front-Channel Logout 1.0</strong> does the same via
          hidden iframes in the browser, which third-party cookie restrictions have made unreliable. For
          server-side apps, back-channel logout is the robust option.
        </ArticleP>

        <ArticleH2 id="jwt-logout-by-framework">JWT Logout in Spring Boot, Node.js, Django and C#</ArticleH2>
        <ArticleP>
          The strategy is the same everywhere; only the hook where you add the revocation check differs.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Node.js (Express)</strong>: a middleware after token verification that checks the denylist, as in the example above. Full setup in <a href="/jwt-authentication-nodejs-express" className={LINK}>JWT authentication in Node.js and Express</a>.</ArticleLi>
          <ArticleLi><strong>Spring Boot</strong>: with the OAuth2 resource server, add a custom <ArticleCode>OAuth2TokenValidator&lt;Jwt&gt;</ArticleCode> to your <ArticleCode>JwtDecoder</ArticleCode> that checks the <ArticleCode>jti</ArticleCode> or token version. See <a href="/jwt-authentication-spring-boot" className={LINK}>JWT in Spring Boot</a>.</ArticleLi>
          <ArticleLi><strong>Django</strong>: djangorestframework-simplejwt ships a <ArticleCode>token_blacklist</ArticleCode> app for refresh tokens: add <ArticleCode>rest_framework_simplejwt.token_blacklist</ArticleCode> to <ArticleCode>INSTALLED_APPS</ArticleCode>, run migrations, and call <ArticleCode>RefreshToken(token).blacklist()</ArticleCode> on logout. Access tokens still live until expiry. See <a href="/jwt-authentication-django" className={LINK}>JWT in Django</a>.</ArticleLi>
          <ArticleLi><strong>C# / ASP.NET Core</strong>: in <ArticleCode>JwtBearerOptions.Events.OnTokenValidated</ArticleCode>, look up the <ArticleCode>jti</ArticleCode> and call <ArticleCode>context.Fail(...)</ArticleCode> if it is revoked. See <a href="/jwt-authentication-aspnet-core" className={LINK}>JWT in ASP.NET Core</a>.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="testing-logout">Testing That Logout Actually Works</ArticleH2>
        <ArticleP>
          Copy the access token from DevTools before logging out, log out, then replay it with curl. If the API
          still answers 200, your logout only cleared the client. Check <ArticleCode>exp</ArticleCode> in{' '}
          <a href="/" className={LINK}>the jwtdecode.app decoder</a> (it runs locally in the browser) to see
          exactly how long that copy stays usable without server-side revocation. Repeat with the refresh token
          against your refresh endpoint; that one must fail immediately.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          You cannot revoke a stateless JWT; you can only shorten how long it matters or add state. Keep access
          tokens short, store and revoke refresh tokens on logout, clear cookies with matching attributes, and
          end the identity provider's session when you use OIDC. When a token must die immediately, deny its
          <ArticleCode> jti</ArticleCode> in Redis for its remaining lifetime, or bump a per-user token version to
          revoke everything the user holds. Each step adds a lookup, so add only the ones your threat model
          needs.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
