import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT vs OAuth: Why One Is a Token Format and the Other Is an Authorisation Framework',
  description: 'JWT and OAuth 2.0 are not alternatives. OAuth defines how a client obtains and uses access tokens; JWT is one format those tokens can take. This guide covers JWT vs opaque access tokens, RFC 9068, introspection, and how SAML and API keys fit in.',
  url: 'https://jwtdecode.app/jwt-vs-oauth',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-vs-oauth',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const LAYERS: [aspect: string, jwt: string, oauth: string][] = [
  ['What it is', 'A token format: signed (or encrypted) JSON claims', 'An authorisation framework: roles, grant types, endpoints'],
  ['Specification', 'RFC 7519, built on JWS (RFC 7515) and JWE (RFC 7516)', 'RFC 6749, with Bearer usage in RFC 6750; OAuth 2.1 is in draft'],
  ['Answers the question', 'How is this set of claims packaged and protected?', 'How does a client get permission to call an API on a user’s behalf?'],
  ['Moving parts', 'Header, payload, signature', 'Resource owner, client, authorisation server, resource server'],
  ['Can exist without the other', 'Yes: session tokens, email links, service-to-service calls', 'Yes: many providers issue opaque access tokens'],
  ['Typical output', 'eyJhbGciOi... (three dot-separated segments)', 'An access token, optional refresh token, expires_in, scope'],
];

const ACCESS_TOKENS: [aspect: string, jwtToken: string, opaque: string][] = [
  ['Validation', 'Locally: signature against the issuer’s JWKS, then iss, aud, exp', 'Remotely: call the introspection endpoint (RFC 7662), or look it up in a shared store'],
  ['Latency per request', 'No network call once keys are cached', 'One round trip per request unless you cache the result'],
  ['Revocation', 'Not visible until exp unless you add a deny-list or introspect', 'Immediate: the server simply stops reporting it as active'],
  ['Who can read the claims', 'Anyone holding the token (payload is Base64url, not encrypted)', 'Nobody except the authorisation server'],
  ['Size', 'Hundreds of bytes to several KB', 'Usually 20–80 characters'],
  ['Best fit', 'Many APIs, microservices, high request volume', 'Public clients, sensitive claims, instant revocation'],
];

export default function JwtVsOauthPage() {
  return (
    <>
      <SEOHead
        title="JWT vs OAuth: Token Format vs Auth Framework"
        description="JWT vs OAuth explained: OAuth 2.0 is an authorisation framework, JWT is a token format. See how they fit together, and when to use JWT or opaque tokens."
        path="/jwt-vs-oauth"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT vs OAuth' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'ID tokens, access tokens and JWKS in real providers.' },
          { to: '/jwt-vs-bearer-token', label: 'JWT vs Bearer Token', description: 'Why a JWT access token is usually also a bearer token.' },
          { to: '/jwt-vs-saml', label: 'JWT vs SAML', description: 'XML assertions versus JSON tokens for single sign-on.' },
          { to: '/jwt-vs-api-key', label: 'JWT vs API Key', description: 'When a static key beats a signed, expiring token.' },
        ]}
      >
        <ArticleH1>JWT vs OAuth: Token Format vs Authorisation Framework</ArticleH1>

        <ArticleIntroBox>
          JWT and OAuth are not competing choices, so &ldquo;JWT vs OAuth&rdquo; is a category error. OAuth 2.0
          (RFC 6749) is an authorisation framework: it defines how a client application obtains permission to call an
          API, which endpoints hand out tokens and which grant types exist. A JSON Web Token (RFC 7519) is a token
          format: a compact, signed set of claims. OAuth says a client gets an access token; it deliberately does not
          say what that token looks like. Many providers make it a JWT, others issue an opaque random string.
          <br /><br />
          So the practical questions are different ones: should your OAuth access tokens be JWTs or opaque, and do
          you need OAuth at all, or just signed tokens issued by your own login endpoint? This guide answers both,
          and places SAML and API keys on the same map.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-vs-oauth2">JWT vs OAuth 2.0: Different Layers of the Stack</ArticleH2>
        <ArticleP>
          The easiest way to see the difference is to ask what each specification would say if you removed the other.
          Remove JWT from OAuth and OAuth still works: the authorisation server issues a random string, stores what it
          means, and the API asks the server about it. Remove OAuth from JWT and JWT still works: your own login route
          signs <ArticleCode>{'{"sub":"42","exp":...}'}</ArticleCode> with a secret and your API verifies it. Neither
          depends on the other.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">JWT</th>
                <th className="px-3 py-2 font-semibold">OAuth 2.0</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {LAYERS.map(([aspect, jwt, oauth]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{jwt}</td>
                  <td className="px-3 py-2">{oauth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          OAuth is about <em>delegation</em>: a user lets a third-party client act on their behalf with a limited
          scope, without handing over a password. JWT is about <em>integrity</em>: whoever receives the token can check
          that the claims were issued by a known key and have not been changed. The structure of a JWT is covered in
          detail in <a href="/what-is-a-jwt" className={LINK}>what is a JWT</a>.
        </ArticleP>

        <ArticleH2 id="is-jwt-oauth">Is JWT OAuth?</ArticleH2>
        <ArticleP>
          No. A JWT is not OAuth, and using JWTs does not mean you are &ldquo;doing OAuth&rdquo;. The confusion comes from
          the fact that the two are so often seen together:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Access tokens</strong>: Auth0, Okta, Microsoft Entra ID, AWS Cognito and Keycloak issue JWT access tokens (in some cases only when you request a specific API audience or resource). RFC 9068 standardises a JWT profile for them.</ArticleLi>
          <ArticleLi><strong>ID tokens</strong>: OpenID Connect, the identity layer on top of OAuth 2.0, requires the ID token to be a JWT. This is the one place in the OAuth family where JWT is mandatory.</ArticleLi>
          <ArticleLi><strong>Client authentication</strong>: RFC 7523 lets a client prove its identity to the token endpoint with a signed JWT instead of a client secret (<ArticleCode>private_key_jwt</ArticleCode> in OIDC terms).</ArticleLi>
          <ArticleLi><strong>Proof of possession</strong>: DPoP (RFC 9449) uses a small signed JWT on each request to bind an access token to a key.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          JWT is the preferred serialisation across the OAuth ecosystem, but the framework itself is format-agnostic.
          For how each of these tokens is used in practice, see <a href="/jwt-in-oauth2-and-openid-connect" className={LINK}>JWTs in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>

        <ArticleH2 id="jwt-oauth-flow">How JWT Fits Into an OAuth Flow</ArticleH2>
        <ArticleP>
          Take the authorisation code flow with PKCE, which is the recommended flow for web, mobile and single-page
          apps. The JWTs appear at specific points:
        </ArticleP>
        <ArticlePre>{`1. Client  → browser redirect to /authorize?response_type=code&client_id=...
             &scope=openid profile orders:read&code_challenge=...&code_challenge_method=S256
2. User logs in and consents at the authorisation server
3. Server  → redirect back to client with ?code=...
4. Client  → POST /token  grant_type=authorization_code&code=...&code_verifier=...
5. Server  → {
     "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIs...",   ← JWT (or opaque)
     "id_token":     "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",              ← always a JWT (OIDC)
     "refresh_token":"8xLOxBtZp8",                                    ← usually opaque
     "token_type":   "Bearer",
     "expires_in":   900
   }
6. Client  → GET /orders   Authorization: Bearer <access_token>
7. API validates the access token and applies scope and audience checks`}</ArticlePre>
        <ArticleP>
          Step 7 is where the format matters. If the access token is a JWT, the API verifies it itself. If it is
          opaque, the API has to ask the authorisation server. The client should treat the access token as opaque
          either way: it is meant for the API, and its format can change without notice. The client reads the ID
          token, not the access token.
        </ArticleP>
        <ArticleCallout type="warning">
          A common bug is sending the ID token to the API. Its <ArticleCode>aud</ArticleCode> is the client ID rather than
          the API identifier, and it carries no scopes. APIs should accept access tokens only. The
          <a href="/common-jwt-errors-and-fixes#wrong-audience" className="underline underline-offset-2"> wrong audience error</a> is the usual symptom.
        </ArticleCallout>

        <ArticleH2 id="jwt-vs-opaque-token">JWT vs Opaque Token for OAuth2 Access Tokens</ArticleH2>
        <ArticleP>
          This is the real decision hiding behind most &ldquo;JWT vs OAuth access token&rdquo; searches. An opaque token is a
          high-entropy random reference, such as <ArticleCode>tGzv3JOkF0XG5Qx2TlKWIA</ArticleCode>, whose meaning lives
          only in the authorisation server&rsquo;s database. A JWT access token carries its meaning inside itself.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">JWT access token</th>
                <th className="px-3 py-2 font-semibold">Opaque access token</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {ACCESS_TOKENS.map(([aspect, jwtToken, opaque]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{jwtToken}</td>
                  <td className="px-3 py-2">{opaque}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH3 id="rfc-9068">JWT access tokens: RFC 9068</ArticleH3>
        <ArticleP>
          RFC 9068 defines a common profile so resource servers can validate JWT access tokens from any compliant
          issuer. The header uses <ArticleCode>typ: at+jwt</ArticleCode> so an access token cannot be confused with an
          ID token, and the payload must include <ArticleCode>iss</ArticleCode>, <ArticleCode>exp</ArticleCode>,
          <ArticleCode> aud</ArticleCode>, <ArticleCode>sub</ArticleCode>, <ArticleCode>client_id</ArticleCode>,
          <ArticleCode> iat</ArticleCode> and <ArticleCode>jti</ArticleCode>, with <ArticleCode>scope</ArticleCode> when
          scopes were granted. Validation with the <ArticleCode>jose</ArticleCode> library looks like this:
        </ArticleP>
        <ArticlePre>{`import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://auth.example.com/.well-known/jwks.json'));

export async function validateAccessToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://auth.example.com/',
    audience: 'https://api.example.com',
    typ: 'at+jwt',                 // rejects ID tokens (typ "JWT")
    algorithms: ['RS256', 'ES256'],
  });
  const scopes = String(payload.scope ?? '').split(' ');
  return { sub: payload.sub, clientId: payload.client_id, scopes };
}`}</ArticlePre>
        <ArticleP>
          Not every provider sets <ArticleCode>typ: at+jwt</ArticleCode> yet; check a real token before enforcing it.
          The full check order is in the <a href="/jwt-verification-guide" className={LINK}>JWT verification guide</a>.
        </ArticleP>

        <ArticleH3 id="token-introspection">Opaque tokens: introspection (RFC 7662)</ArticleH3>
        <ArticleP>
          With an opaque token, the API posts it to the authorisation server&rsquo;s introspection endpoint and receives
          the metadata back. The API authenticates itself on that call, typically with its own client credentials:
        </ArticleP>
        <ArticlePre>{`curl -s https://auth.example.com/oauth2/introspect \\
  -u "orders-api:API_CLIENT_SECRET" \\
  -d "token=tGzv3JOkF0XG5Qx2TlKWIA" \\
  -d "token_type_hint=access_token"

{
  "active": true,
  "scope": "orders:read",
  "client_id": "web-app",
  "sub": "user_123",
  "aud": "https://api.example.com",
  "exp": 1790000900
}`}</ArticlePre>
        <ArticleP>
          <ArticleCode>active</ArticleCode> is the only required field in the response. A revoked, expired or unknown
          token simply returns <ArticleCode>{'{"active": false}'}</ArticleCode>, which is why opaque tokens give instant
          revocation. Revoking a token at the server is standardised separately in RFC 7009.
        </ArticleP>

        <ArticleH3 id="which-access-token-format">Choosing between them</ArticleH3>
        <ArticleUl>
          <ArticleLi>Choose <strong>JWT</strong> when many services validate tokens, request volume is high, and short lifetimes (5 to 15 minutes) are acceptable in place of instant revocation.</ArticleLi>
          <ArticleLi>Choose <strong>opaque</strong> when tokens go to third-party or public clients who should not read the claims, when claims are sensitive, or when revocation must take effect immediately.</ArticleLi>
          <ArticleLi>A common hybrid is the &ldquo;phantom token&rdquo; pattern: the outside world gets an opaque token, and an API gateway introspects it once and forwards a JWT to internal services.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The revocation trade-off is the same one covered in <a href="/jwt-vs-session-tokens" className={LINK}>JWT vs session tokens</a>:
          self-contained tokens trade freshness for scalability.
        </ArticleP>

        <ArticleH2 id="jwt-vs-oauth-which-is-better">JWT vs OAuth: Which Is Better?</ArticleH2>
        <ArticleP>
          Because they solve different problems, the useful question is whether you need OAuth&rsquo;s delegation machinery.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>You need OAuth (usually with OIDC)</strong> when third-party apps call your API on behalf of your users, when you want single sign-on across several applications, when you use an external identity provider, or when you need standard flows for mobile, SPA and machine clients.</ArticleLi>
          <ArticleLi><strong>You probably do not need OAuth</strong> when one first-party web app talks to its own backend. A server-side session cookie, or a short-lived JWT issued by your own login endpoint, is simpler and has fewer moving parts.</ArticleLi>
          <ArticleLi><strong>Do not build your own OAuth server</strong> for the sake of it. If you need OAuth, use a maintained authorisation server (a hosted provider, Keycloak, or a certified library).</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Whichever you choose, the token rules are the same: pin the algorithm, check <ArticleCode>iss</ArticleCode>,
          <ArticleCode> aud</ArticleCode> and <ArticleCode>exp</ArticleCode>, keep lifetimes short. See <a href="/jwt-security-best-practices" className={LINK}>JWT security best practices</a>.
        </ArticleP>

        <ArticleH2 id="jwt-vs-oauth-vs-saml">JWT vs OAuth vs SAML</ArticleH2>
        <ArticleP>
          SAML 2.0 is the third name in this comparison, and it overlaps with both. SAML is a complete federation
          protocol whose tokens (assertions) are XML documents signed with XML Signature. It is built for browser
          single sign-on into enterprise applications, and it is still widely used for that. OAuth handles API
          authorisation; OpenID Connect handles modern sign-on and uses JWTs as its token format. Put simply, SAML
          competes with OpenID Connect, and SAML assertions compete with JWT ID tokens. The full comparison is in
          <a href="/jwt-vs-saml" className={LINK}> JWT vs SAML</a>.
        </ArticleP>

        <ArticleH2 id="jwt-vs-oauth2-vs-api-key">JWT vs OAuth2 vs API Key</ArticleH2>
        <ArticleP>
          An API key is a long-lived static secret that identifies a calling application. It has no expiry, no
          user context and no standard format. The three fit together like this:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>API key</strong>: simplest; good for server-to-server calls by a known customer, usage metering and rate limiting. Revoke by deleting the key.</ArticleLi>
          <ArticleLi><strong>JWT</strong>: short-lived, signed claims about a user or service; validated without a database lookup.</ArticleLi>
          <ArticleLi><strong>OAuth 2.0</strong>: the process for issuing tokens (often JWTs) with scopes and user consent. The client credentials grant is the OAuth replacement for a static API key in machine-to-machine traffic.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          More detail on where static keys still win is in <a href="/jwt-vs-api-key" className={LINK}>JWT vs API key</a>.
        </ArticleP>

        <ArticleH2 id="tell-which-token">How to Tell What Kind of Token You Have</ArticleH2>
        <ArticleP>
          If you are handed an access token and are not sure whether it is a JWT, check its shape. Three
          Base64url segments starting with <ArticleCode>eyJ</ArticleCode> is a signed JWT; five segments is an encrypted
          JWE; no dots at all means an opaque token that only the issuer can interpret. Paste a JWT into the
          <a href="/" className={LINK}> jwtdecode.app decoder</a>, which runs in your browser, to read <ArticleCode>typ</ArticleCode>,
          <ArticleCode> aud</ArticleCode>, <ArticleCode>scope</ArticleCode> and <ArticleCode>client_id</ArticleCode> and see
          whether it is an access token or an ID token.
        </ArticleP>

        <ArticleH2 id="misconceptions">Common Misconceptions</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>&ldquo;OAuth is for authentication.&rdquo;</strong> Plain OAuth 2.0 tells an API what a client may do, not who the user is. Logging users in is what OpenID Connect adds, through the ID token and the <ArticleCode>/userinfo</ArticleCode> endpoint.</ArticleLi>
          <ArticleLi><strong>&ldquo;A JWT access token is encrypted.&rdquo;</strong> A signed JWT is only encoded; anyone holding it can read the payload. Keep personal data out of it, or use an opaque token. See <a href="/is-jwt-encrypted-jws-vs-jwe" className={LINK}>is a JWT encrypted?</a></ArticleLi>
          <ArticleLi><strong>&ldquo;Clients should parse the access token.&rdquo;</strong> The access token belongs to the API. A client that reads claims from it breaks when the provider switches formats; clients should read the ID token or call <ArticleCode>/userinfo</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>&ldquo;JWTs replace refresh tokens.&rdquo;</strong> Short-lived JWT access tokens usually depend on a refresh token to stay usable, and the refresh token is often opaque and stored server-side. See the <a href="/jwt-refresh-token-pattern" className={LINK}>refresh token pattern</a>.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>OAuth 2.0 is an authorisation framework; JWT is a token format. They are complementary, not alternatives.</ArticleLi>
          <ArticleLi>OAuth access tokens can be JWTs (profiled by RFC 9068) or opaque strings validated through introspection (RFC 7662).</ArticleLi>
          <ArticleLi>OpenID Connect ID tokens are always JWTs, but they are for the client, not the API.</ArticleLi>
          <ArticleLi>JWT access tokens scale well and validate locally; opaque tokens revoke instantly and hide their claims.</ArticleLi>
          <ArticleLi>Use OAuth when you need delegation, SSO or third-party access; otherwise a session or a simple signed token is often enough.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
