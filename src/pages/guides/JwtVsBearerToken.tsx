import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT vs Bearer Token: Is a JWT a Bearer Token?',
  description: 'A bearer token is any token that grants access to whoever presents it (RFC 6750); a JWT is a token format. Most JWT access tokens are sent as bearer tokens. Covers Bearer authentication, error responses, the JWT bearer grant (RFC 7523) and sender-constrained tokens with DPoP (RFC 9449).',
  url: 'https://jwtdecode.app/jwt-vs-bearer-token',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-vs-bearer-token',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const COMPARISON: [aspect: string, bearer: string, jwt: string][] = [
  ['What the term describes', 'How a token is used: possession alone grants access', 'What a token looks like: signed JSON claims'],
  ['Specification', 'RFC 6750 (OAuth 2.0 Bearer Token Usage)', 'RFC 7519, signed with JWS (RFC 7515)'],
  ['Format', 'Any string: opaque, JWT, or vendor-specific', 'Three Base64url segments: header.payload.signature'],
  ['Sent as', 'Authorization: Bearer <token>', 'Anywhere: Bearer header, DPoP header, cookie, form field'],
  ['Validated by', 'Whatever the format requires: lookup, introspection or signature', 'Signature plus iss, aud, exp checks'],
  ['Opposite concept', 'Sender-constrained tokens (DPoP, mutual TLS)', 'Opaque (reference) tokens'],
];

const ERRORS: [code: string, status: string, meaning: string][] = [
  ['(no error code)', '401', 'No credentials were sent. Respond with a bare WWW-Authenticate: Bearer challenge.'],
  ['invalid_request', '400', 'Malformed request: missing parameter, token sent in more than one place.'],
  ['invalid_token', '401', 'Expired, revoked, malformed or failed signature. The client should get a new token.'],
  ['insufficient_scope', '403', 'Token is valid but lacks the scope for this resource.'],
];

export default function JwtVsBearerTokenPage() {
  return (
    <>
      <SEOHead
        title="JWT vs Bearer Token: Are They the Same?"
        description="JWT vs bearer token: bearer describes how a token is used, JWT describes its format. Learn Bearer authentication, RFC 6750 errors, JWT bearer grants and DPoP."
        path="/jwt-vs-bearer-token"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT vs Bearer Token' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-vs-oauth', label: 'JWT vs OAuth', description: 'How JWT and opaque access tokens fit into OAuth 2.0.' },
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'JWT Storage', description: 'Where to keep a bearer token in the browser.' },
          { to: '/jwt-curl-postman', label: 'JWT With curl & Postman', description: 'Sending Bearer tokens when testing APIs.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Fixes for the 401s a Bearer API returns.' },
        ]}
      >
        <ArticleH1>JWT vs Bearer Token: Is a JWT a Bearer Token?</ArticleH1>

        <ArticleIntroBox>
          &ldquo;Bearer token&rdquo; and &ldquo;JWT&rdquo; answer different questions. A bearer token is any token that grants
          access to whoever presents it, with no further proof of identity; the term comes from OAuth 2.0 (RFC 6750),
          and the token is usually sent as <ArticleCode>Authorization: Bearer &lt;token&gt;</ArticleCode>. A JWT is a
          token <em>format</em>: signed JSON claims (RFC 7519). Bearer describes the usage, JWT describes the contents.
          <br /><br />
          They overlap heavily because most JWT access tokens are used as bearer tokens. But a bearer token does not
          have to be a JWT (it can be an opaque random string), and a JWT does not have to be a bearer token (with
          DPoP it is bound to a key the client must prove it holds).
        </ArticleIntroBox>

        <ArticleH2 id="is-jwt-a-bearer-token">Is a JWT a Bearer Token?</ArticleH2>
        <ArticleP>
          Usually, yes. When an OAuth server returns <ArticleCode>"token_type": "Bearer"</ArticleCode> alongside a JWT access
          token, that JWT is a bearer token: the API accepts it from anyone who sends it, as long as the signature and
          claims check out. The signature proves the token came from the issuer. It says nothing about whether the
          party presenting it is the one it was issued to.
        </ArticleP>
        <ArticleP>
          RFC 6750 puts it plainly: any party in possession of a bearer token can use it to access the associated
          resources, without demonstrating possession of a cryptographic key. That is why a stolen JWT works exactly
          as well for the thief as for the legitimate client until its <ArticleCode>exp</ArticleCode> passes.
        </ArticleP>

        <ArticleH2 id="is-jwt-and-bearer-token-same">Are JWT and Bearer Token the Same?</ArticleH2>
        <ArticleP>
          No. They sit on different axes, and each can exist without the other:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">Bearer token</th>
                <th className="px-3 py-2 font-semibold">JWT</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {COMPARISON.map(([aspect, bearer, jwt]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{bearer}</td>
                  <td className="px-3 py-2">{jwt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleUl>
          <ArticleLi><strong>Bearer, not JWT</strong>: an opaque access token like <ArticleCode>tGzv3JOkF0XG5Qx2TlKWIA</ArticleCode>, validated by introspection. Also API keys sent in a Bearer header.</ArticleLi>
          <ArticleLi><strong>JWT, not bearer</strong>: a DPoP-bound access token, an OpenID Connect ID token (consumed by the client, never presented to an API), or a JWT used as a client assertion.</ArticleLi>
          <ArticleLi><strong>Both</strong>: the typical JWT access token from Auth0, Okta, Entra ID or Cognito.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The format question, JWT versus opaque, is covered in <a href="/jwt-vs-oauth#jwt-vs-opaque-token" className={LINK}>JWT vs opaque tokens</a>.
          To see whether the token you are sending is a JWT at all, paste it into the <a href="/" className={LINK}>jwtdecode.app decoder</a>; it
          decodes locally, and an opaque token simply will not parse.
        </ArticleP>

        <ArticleH2 id="jwt-bearer-authentication">JWT Bearer Authentication: How It Works</ArticleH2>
        <ArticleP>
          &ldquo;JWT bearer authentication&rdquo; means an API that reads a JWT from the Bearer scheme of the
          <ArticleCode> Authorization</ArticleCode> header and validates it. The request looks like this:
        </ArticleP>
        <ArticlePre>{`GET /orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6IjIwMjYtMDkifQ.eyJpc3Mi...`}</ArticlePre>
        <ArticleP>
          RFC 6750 also allows the token in a form-encoded body field or an <ArticleCode>access_token</ArticleCode> query
          parameter, but the query form ends up in logs and browser history and should not be used. Clients must send
          the token in exactly one place per request.
        </ArticleP>

        <ArticleH3 id="bearer-middleware">A Bearer middleware for Express</ArticleH3>
        <ArticleP>
          A minimal Express 5 middleware using <ArticleCode>jose</ArticleCode> that validates a JWT bearer token and returns the
          RFC 6750 challenges:
        </ArticleP>
        <ArticlePre>{`import { createRemoteJWKSet, jwtVerify, errors } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://auth.example.com/.well-known/jwks.json'));

export function requireBearer(requiredScope) {
  return async (req, res, next) => {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      res.set('WWW-Authenticate', 'Bearer realm="api"');
      return res.status(401).end();
    }
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: 'https://auth.example.com/',
        audience: 'https://api.example.com',
        algorithms: ['RS256'],
      });
      const scopes = String(payload.scope ?? '').split(' ');
      if (requiredScope && !scopes.includes(requiredScope)) {
        res.set('WWW-Authenticate', \`Bearer error="insufficient_scope", scope="\${requiredScope}"\`);
        return res.status(403).end();
      }
      req.auth = payload;
      next();
    } catch (err) {
      const description = err instanceof errors.JWTExpired ? 'The access token expired' : 'The access token is invalid';
      res.set('WWW-Authenticate', \`Bearer error="invalid_token", error_description="\${description}"\`);
      res.status(401).end();
    }
  };
}

// app.get('/orders', requireBearer('orders:read'), handler);`}</ArticlePre>
        <ArticleP>
          The authentication scheme name is case-insensitive, hence the <ArticleCode>toLowerCase()</ArticleCode>. Frameworks ship
          this as a package: ASP.NET Core&rsquo;s <ArticleCode>Microsoft.AspNetCore.Authentication.JwtBearer</ArticleCode> with
          <ArticleCode> AddJwtBearer()</ArticleCode>, Spring Security&rsquo;s OAuth 2.0 resource server, and similar. The checks in
          the middleware are explained step by step in the <a href="/jwt-verification-guide" className={LINK}>JWT verification guide</a>.
        </ArticleP>

        <ArticleH3 id="bearer-errors">Bearer error responses</ArticleH3>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">error</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {ERRORS.map(([code, status, meaning]) => (
                <tr key={code} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{code}</td>
                  <td className="px-3 py-2">{status}</td>
                  <td className="px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Keep <ArticleCode>error_description</ArticleCode> generic. It is for developers, and it should not reveal
          which check failed in detail to an unauthenticated caller. When you are on the receiving end of these errors,
          <a href="/how-to-debug-a-jwt" className={LINK}> how to debug a JWT</a> walks through the causes in order.
        </ArticleP>

        <ArticleH2 id="jwt-bearer-token">Sending a JWT Bearer Token From a Client</ArticleH2>
        <ArticleP>
          On the client side, a bearer token is just a header. With curl:
        </ArticleP>
        <ArticlePre>{`TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCJ9..."
curl -i https://api.example.com/orders -H "Authorization: Bearer $TOKEN"`}</ArticlePre>
        <ArticleP>
          And with <ArticleCode>fetch</ArticleCode> in the browser or Node.js:
        </ArticleP>
        <ArticlePre>{`const res = await fetch('https://api.example.com/orders', {
  headers: { Authorization: \`Bearer \${accessToken}\` },
});
if (res.status === 401) {
  // Read res.headers.get('WWW-Authenticate'): invalid_token means refresh and retry once.
}`}</ArticlePre>
        <ArticleP>
          The most common client-side mistakes are small: a missing space after <ArticleCode>Bearer</ArticleCode>, quotes
          copied around the token, the word <ArticleCode>Bearer</ArticleCode> included twice, or the ID token sent instead of
          the access token. Testing tools add their own twists, such as Postman&rsquo;s Bearer Token auth type adding the
          prefix for you; see <a href="/jwt-curl-postman" className={LINK}>JWTs with curl and Postman</a>. Browsers never attach a
          bearer token automatically, unlike a cookie, which is why header-based bearer tokens are not exposed to CSRF
          in the way cookie sessions are, and also why your client code is responsible for attaching and refreshing
          them on every call.
        </ArticleP>

        <ArticleH2 id="jwt-bearer-token-risks">JWT Bearer Token Risks and Mitigations</ArticleH2>
        <ArticleP>
          Because possession equals access, the defences for bearer JWTs are about limiting exposure and lifetime:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Short lifetimes</strong>: 5 to 15 minutes for access tokens, renewed with a refresh token. See the <a href="/jwt-refresh-token-pattern" className={LINK}>refresh token pattern</a>.</ArticleLi>
          <ArticleLi><strong>Narrow audience and scope</strong>: a token for one API should be rejected by every other API.</ArticleLi>
          <ArticleLi><strong>Careful storage</strong>: in browsers, keep tokens out of places injected scripts can read where possible. The options are compared in <a href="/jwt-storage-localstorage-vs-cookie" className={LINK}>localStorage vs cookies</a>.</ArticleLi>
          <ArticleLi><strong>No logging</strong>: strip the <ArticleCode>Authorization</ArticleCode> header from access logs, error trackers and proxies.</ArticleLi>
          <ArticleLi><strong>HTTPS only</strong>: RFC 6750 requires TLS for every request that carries a bearer token.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwt-bearer-grant-type">The JWT Bearer Grant Type (RFC 7523)</ArticleH2>
        <ArticleP>
          A related but different use of the word: RFC 7523 defines how a JWT can be used <em>to obtain</em> an access
          token, rather than being the access token. The client signs a short-lived JWT assertion with its private key
          and posts it to the token endpoint:
        </ArticleP>
        <ArticlePre>{`POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=eyJhbGciOiJSUzI1NiIsImtpZCI6InNhLTEifQ.eyJpc3MiOiJzdmMtYWNjdEBleGFtcGxlIi...`}</ArticlePre>
        <ArticleP>
          The assertion must contain <ArticleCode>iss</ArticleCode>, <ArticleCode>sub</ArticleCode>, <ArticleCode>aud</ArticleCode> (the
          token endpoint) and <ArticleCode>exp</ArticleCode>. Google service accounts use this grant, and several platforms use
          it for server-to-server integrations. RFC 7523 also defines JWT client authentication, where the assertion is
          sent as <ArticleCode>client_assertion</ArticleCode> with
          <ArticleCode> client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer</ArticleCode> in place of a client
          secret. In both cases &ldquo;bearer&rdquo; refers to the assertion, and the access token that comes back may or may
          not be a JWT.
        </ArticleP>

        <ArticleH2 id="jwt-with-dpop">JWT With DPoP: Sender-Constrained Instead of Bearer</ArticleH2>
        <ArticleP>
          DPoP (Demonstrating Proof of Possession, RFC 9449) removes the bearer property. The client generates a key
          pair and, on every request, sends a small signed JWT called a DPoP proof. The authorisation server binds the
          access token to the client&rsquo;s public key, so a stolen token is useless without the private key.
        </ArticleP>
        <ArticlePre>{`GET /orders HTTP/1.1
Host: api.example.com
Authorization: DPoP eyJhbGciOiJFUzI1NiIsInR5cCI6ImF0K2p3dCJ9...
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2IiwiandrIjp7...

# DPoP proof header          # DPoP proof payload
{                            {
  "typ": "dpop+jwt",           "jti": "e1j3V_bKic8-LAEB",
  "alg": "ES256",              "htm": "GET",
  "jwk": { "kty": "EC",        "htu": "https://api.example.com/orders",
    "crv": "P-256",            "iat": 1790240400,
    "x": "...", "y": "..." }   "ath": "..."
}                            }`}</ArticlePre>
        <ArticleUl>
          <ArticleLi>The token endpoint returns <ArticleCode>"token_type": "DPoP"</ArticleCode>, and the access token carries a <ArticleCode>cnf</ArticleCode> claim with <ArticleCode>jkt</ArticleCode>, the SHA-256 thumbprint of the client&rsquo;s public key.</ArticleLi>
          <ArticleLi>The API checks the proof signature against the embedded <ArticleCode>jwk</ArticleCode>, confirms the thumbprint matches <ArticleCode>cnf.jkt</ArticleCode>, and checks <ArticleCode>htm</ArticleCode> and <ArticleCode>htu</ArticleCode> against the actual request.</ArticleLi>
          <ArticleLi><ArticleCode>ath</ArticleCode> is the Base64url SHA-256 hash of the access token, tying the proof to that token; <ArticleCode>jti</ArticleCode> and <ArticleCode>iat</ArticleCode> limit replay, and servers can add a <ArticleCode>DPoP-Nonce</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Mutual-TLS certificate-bound tokens (RFC 8705) reach the same goal at the transport layer. Either way, the
          token is still a JWT; it has simply stopped being a bearer token.
        </ArticleP>
        <ArticleCallout type="info">
          DPoP does not protect against an attacker who can run code in the client and use the private key directly.
          It stops tokens copied from logs, proxies or storage from being replayed elsewhere.
        </ArticleCallout>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>A bearer token grants access to whoever holds it (RFC 6750); a JWT is a signed token format (RFC 7519).</ArticleLi>
          <ArticleLi>Most JWT access tokens are bearer tokens, but opaque bearer tokens and non-bearer JWTs both exist.</ArticleLi>
          <ArticleLi>JWT bearer authentication reads the token from <ArticleCode>Authorization: Bearer</ArticleCode> and returns <ArticleCode>invalid_token</ArticleCode> or <ArticleCode>insufficient_scope</ArticleCode> challenges on failure.</ArticleLi>
          <ArticleLi>The JWT bearer grant (RFC 7523) uses a signed JWT to obtain an access token or to authenticate a client.</ArticleLi>
          <ArticleLi>DPoP (RFC 9449) binds a JWT to a client key, so possession of the token alone is no longer enough.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
