import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Authentication in Node.js and Express: Middleware, jose and JWKS',
  description: 'How to add JWT authentication to a Node.js Express API: sign and verify tokens with jsonwebtoken or jose, write auth middleware with an algorithm allow-list, and validate RS256 tokens from an identity provider via JWKS.',
  url: 'https://jwtdecode.app/jwt-authentication-nodejs-express',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-authentication-nodejs-express',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LIBRARIES: [name: string, bestFor: string, notes: string][] = [
  ['jsonwebtoken 9.x', 'Express APIs that sign and verify their own HS256/RS256 tokens', 'Synchronous API, CommonJS-friendly, Node.js only. No JWKS support; pair with jwks-rsa for that.'],
  ['jose 6.x', 'New code, JWKS/OIDC, Edge and serverless runtimes', 'Promise-based, zero dependencies, runs on Node.js, Deno, Bun, browsers and edge runtimes. Built-in createRemoteJWKSet. Also handles JWE.'],
  ['express-jwt 8.x', 'Drop-in Express middleware', 'Wraps jsonwebtoken. Puts claims on req.auth. Use with jwks-rsa for provider tokens.'],
  ['passport-jwt', 'Apps already built around Passport strategies', 'Adds a layer of indirection; only worth it if Passport is already in the stack.'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtAuthNodeExpressPage() {
  return (
    <>
      <SEOHead
        title="JWT Authentication in Node.js and Express"
        description="JWT authentication in Node.js and Express: sign and verify with jsonwebtoken or jose, write auth middleware, and check RS256 tokens via JWKS. Tested code."
        path="/jwt-authentication-nodejs-express"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in Node.js & Express' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Pair short-lived access tokens with rotating refresh tokens.' },
          { to: '/jwt-authentication-nextjs', label: 'JWT in Next.js', description: 'The same ideas in the App Router with jose, cookies and proxy.ts.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'Every check a verifier must perform, in order.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Map jsonwebtoken and jose error messages to their causes.' },
        ]}
      >
        <ArticleH1>JWT Authentication in Node.js and Express: Middleware, jose and JWKS</ArticleH1>

        <ArticleIntroBox>
          JWT authentication in Node.js comes down to two functions: sign a token when the user logs in, and verify it
          in an Express middleware on every protected request. Use <ArticleCode>jsonwebtoken</ArticleCode> or
          <ArticleCode>jose</ArticleCode>, and always pass an explicit <ArticleCode>algorithms</ArticleCode> list plus the
          expected <ArticleCode>issuer</ArticleCode> and <ArticleCode>audience</ArticleCode> to the verify call. Keep access
          tokens short-lived (5 to 15 minutes), load the secret from the environment, and return 401 for any failure.
          All code below was run against Node.js 22.22, Express 5.2.1, jsonwebtoken 9.0.3, jose 6.2.12, express-jwt 8.5.1 and
          jwks-rsa 4.1.0.
        </ArticleIntroBox>

        <ArticleH2 id="best-jwt-library-node-js">Best JWT Library for Node.js</ArticleH2>
        <ArticleP>
          There is no single right answer, but the choice is narrower than npm search results suggest. Two libraries do the
          cryptography; the rest are wrappers around them.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Library</th>
                <th className="px-3 py-2 font-semibold">Best for</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {LIBRARIES.map(([name, bestFor, notes]) => (
                <tr key={name} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{name}</td>
                  <td className="px-3 py-2">{bestFor}</td>
                  <td className="px-3 py-2">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          For a self-contained Express API that issues its own tokens, <ArticleCode>jsonwebtoken</ArticleCode> is fine and
          has the most tutorials behind it. For anything that consumes tokens from an identity provider, or code that may
          later run on an edge runtime, start with <ArticleCode>jose</ArticleCode>. Whichever you pick, install a current
          major: <ArticleCode>jsonwebtoken</ArticleCode> below 9.0.0 has known security advisories (covered below).
        </ArticleP>

        <ArticleH2 id="jwt-sign-options-and-expiresin">jwt.sign Options and expiresIn</ArticleH2>
        <ArticleP>
          Install the packages and generate a signing secret of at least 256 bits. Never hard-code it; a secret in the
          repository is a secret on every laptop and CI runner that has cloned it.
        </ArticleP>
        <ArticlePre lang="bash">{`npm install express jsonwebtoken
export JWT_SECRET="$(openssl rand -base64 48)"`}</ArticlePre>
        <ArticleP>
          <ArticleCode>jwt.sign(payload, secret, options)</ArticleCode> sets registered claims from options rather than
          from the payload. The options you should always set are <ArticleCode>algorithm</ArticleCode>,
          <ArticleCode>expiresIn</ArticleCode>, <ArticleCode>issuer</ArticleCode>, <ArticleCode>audience</ArticleCode> and
          <ArticleCode>subject</ArticleCode>. <ArticleCode>iat</ArticleCode> is added automatically. The claims themselves
          are described in <a href="/jwt-claims-explained" className={link}>JWT claims explained</a>.
        </ArticleP>
        <ArticleCallout type="warning">
          <ArticleCode>expiresIn</ArticleCode> takes a number of <strong>seconds</strong> or a
          <ArticleCode>vercel/ms</ArticleCode> string such as <ArticleCode>'15m'</ArticleCode> or <ArticleCode>'1h'</ArticleCode>.
          A numeric <em>string</em> without a unit is read as milliseconds: <ArticleCode>expiresIn: '120'</ArticleCode>
          produces a token that expires 0.12 seconds after issue. Also, setting <ArticleCode>exp</ArticleCode> in the payload
          and <ArticleCode>expiresIn</ArticleCode> in options throws <ArticleCode>Bad "options.expiresIn" option the payload
          already has an "exp" property.</ArticleCode>
        </ArticleCallout>

        <ArticleH2 id="jwt-express-middleware">JWT Express Middleware with jsonwebtoken</ArticleH2>
        <ArticleP>
          Here is a complete, runnable server: a login route that issues a 15-minute access token and a
          <ArticleCode>requireAuth</ArticleCode> middleware that protects <ArticleCode>/me</ArticleCode>. It uses ES modules
          (<ArticleCode>"type": "module"</ArticleCode> in <ArticleCode>package.json</ArticleCode>).
        </ArticleP>
        <ArticlePre lang="javascript">{`// server.js
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 random characters');
}

const ISSUER = 'https://api.example.com';
const AUDIENCE = 'https://api.example.com';

function issueAccessToken(user) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: ISSUER,
    audience: AUDIENCE,
    subject: String(user.id),
  });
}

function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).set('WWW-Authenticate', 'Bearer').json({ error: 'missing_token' });
  }
  try {
    req.auth = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],      // never let the token choose
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: 30,         // seconds of clock skew
    });
    return next();
  } catch (err) {
    const error = err.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token';
    return res.status(401)
      .set('WWW-Authenticate', 'Bearer error="invalid_token"')
      .json({ error });
  }
}

const app = express();
app.use(express.json());

// Replace with a real user lookup and an argon2 or bcrypt password check.
async function checkCredentials(email, password) {
  return email === 'ada@example.com' && password === 'correct horse'
    ? { id: 42, role: 'admin' }
    : null;
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await checkCredentials(email, password);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  res.json({ access_token: issueAccessToken(user), token_type: 'Bearer', expires_in: 900 });
});

app.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.auth.sub, role: req.auth.role });
});

app.listen(3000);`}</ArticlePre>
        <ArticlePre lang="bash">{`TOKEN=$(curl -s localhost:3000/login -H 'content-type: application/json' \\
  -d '{"email":"ada@example.com","password":"correct horse"}' | jq -r .access_token)
curl -s localhost:3000/me -H "Authorization: Bearer $TOKEN"
# {"userId":"42","role":"admin"}`}</ArticlePre>
        <ArticleP>
          In testing, a missing header, a tampered signature, a wrong <ArticleCode>aud</ArticleCode>, an expired token and an
          <ArticleCode>alg: none</ArticleCode> token all returned 401. The error names and messages you will see from
          <ArticleCode>jwt.verify</ArticleCode> are: <ArticleCode>TokenExpiredError: jwt expired</ArticleCode>,
          <ArticleCode>JsonWebTokenError: invalid signature</ArticleCode>, <ArticleCode>JsonWebTokenError: jwt malformed</ArticleCode>,
          <ArticleCode>jwt audience invalid. expected: ...</ArticleCode> and <ArticleCode>jwt issuer invalid. expected: ...</ArticleCode>.
          Log the specific error server-side, but keep the client response generic. If one of those messages is unfamiliar,
          the <a href="/common-jwt-errors-and-fixes#error-lookup" className={link}>error lookup table</a> maps each to its cause.
        </ArticleP>
        <ArticleH3 id="checking-roles">Checking roles after authentication</ArticleH3>
        <ArticleP>
          Keep authentication and authorisation as separate middleware. <ArticleCode>requireAuth</ArticleCode> answers "who is
          this?" and returns 401 when it cannot tell; a second middleware answers "may they do this?" and returns 403. Mixing the
          two makes clients retry a login that will never help.
        </ArticleP>
        <ArticlePre lang="javascript">{`const requireRole = (role) => (req, res, next) =>
  req.auth?.role === role ? next() : res.status(403).json({ error: 'forbidden' });

app.delete('/admin/cache', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ clearedBy: req.auth.sub });
});`}</ArticlePre>
        <ArticleP>
          A role claim is only as fresh as the token. If you demote a user, their existing access token still says
          <ArticleCode>admin</ArticleCode> until it expires, which is one more reason to keep lifetimes short. How roles and OAuth
          scopes differ is covered in <a href="/jwt-scopes-vs-roles" className={link}>JWT scopes vs roles</a>.
        </ArticleP>

        <ArticleH2 id="jwt-express-typescript">JWT Express Middleware in TypeScript</ArticleH2>
        <ArticleP>
          In TypeScript, augment Express's <ArticleCode>Request</ArticleCode> interface once so <ArticleCode>req.auth</ArticleCode>
          is typed everywhere. Install <ArticleCode>@types/express</ArticleCode> and <ArticleCode>@types/jsonwebtoken</ArticleCode>.
          <ArticleCode>jwt.verify</ArticleCode> is typed as returning <ArticleCode>string | JwtPayload</ArticleCode>, so
          narrow it before use. This compiled under <ArticleCode>strict</ArticleCode> with TypeScript 7.0 and
          <ArticleCode>@types/express</ArticleCode> 5.0.6.
        </ArticleP>
        <ArticlePre lang="typescript">{`// auth.ts
import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload & { role?: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) {
    res.status(401).json({ error: 'missing_token' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'https://api.example.com',
      audience: 'https://api.example.com',
    });
    if (typeof payload === 'string') throw new Error('unexpected string payload');
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}`}</ArticlePre>

        <ArticleH2 id="jwt-verify-vs-decode">jwt.verify vs jwt.decode</ArticleH2>
        <ArticleP>
          <ArticleCode>jwt.decode(token)</ArticleCode> base64url-decodes the payload and returns it. It does not check the
          signature, the expiry or anything else, so anyone can hand you a token with <ArticleCode>"role":"admin"</ArticleCode>
          and <ArticleCode>decode</ArticleCode> will return it faithfully. <ArticleCode>jwt.verify(token, key, options)</ArticleCode>
          checks the signature against your key and the algorithm list, then validates <ArticleCode>exp</ArticleCode>,
          <ArticleCode>nbf</ArticleCode>, <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode>. The rule is simple:
          authorisation decisions only ever use the output of <ArticleCode>verify</ArticleCode>.
        </ArticleP>
        <ArticleP>
          <ArticleCode>decode</ArticleCode> has legitimate uses: reading the <ArticleCode>kid</ArticleCode> header to pick a
          key, logging, or showing a UI when a token expires. <ArticleCode>jose</ArticleCode> has the same split with
          <ArticleCode>decodeJwt</ArticleCode> and <ArticleCode>decodeProtectedHeader</ArticleCode>. The distinction is covered
          in depth in <a href="/jwt-decoder-vs-jwt-validator" className={link}>JWT decoder vs validator</a>. When debugging, you
          can paste a token into the <a href="/" className={link}>jwtdecode.app decoder</a>, which decodes and optionally verifies
          it locally in the browser.
        </ArticleP>

        <ArticleH2 id="jose-alternative">The jose Alternative</ArticleH2>
        <ArticleP>
          <ArticleCode>jose</ArticleCode> uses Web Crypto-style keys and a builder for signing. HMAC secrets are passed as
          <ArticleCode>Uint8Array</ArticleCode>. <ArticleCode>jose</ArticleCode> 6 is published as an ES module; on Node.js 22,
          <ArticleCode>require('jose')</ArticleCode> also works because Node.js can load ES modules synchronously.
        </ArticleP>
        <ArticlePre lang="javascript">{`import { SignJWT, jwtVerify, errors } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const token = await new SignJWT({ role: 'admin' })
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setSubject('42')
  .setIssuer('https://api.example.com')
  .setAudience('https://api.example.com')
  .setIssuedAt()
  .setExpirationTime('15m')
  .sign(secret);

try {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
    issuer: 'https://api.example.com',
    audience: 'https://api.example.com',
  });
  console.log(payload.sub, payload.role);
} catch (err) {
  // err.code e.g. ERR_JWT_EXPIRED, ERR_JWS_SIGNATURE_VERIFICATION_FAILED,
  // ERR_JWT_CLAIM_VALIDATION_FAILED
  if (err instanceof errors.JWTExpired) { /* 401 token_expired */ }
}`}</ArticlePre>

        <ArticleH2 id="rs256-jwks-third-party-tokens">Verifying RS256 Tokens from an Identity Provider (JWKS)</ArticleH2>
        <ArticleP>
          If Auth0, Okta, Entra ID, Cognito, Keycloak or any other OpenID Connect provider issues the tokens, your API never
          sees a secret. It fetches the provider's public keys from a JWKS endpoint and picks the one matching the token's
          <ArticleCode>kid</ArticleCode> header. See <a href="/what-is-jwks" className={link}>what is JWKS</a> and
          <a href="/hs256-vs-rs256" className={link}> HS256 vs RS256</a> for the background. With <ArticleCode>jose</ArticleCode>,
          <ArticleCode>createRemoteJWKSet</ArticleCode> handles fetching, caching and re-fetching when an unknown
          <ArticleCode>kid</ArticleCode> appears after key rotation:
        </ArticleP>
        <ArticlePre lang="javascript">{`import { jwtVerify, createRemoteJWKSet, errors } from 'jose';

const ISSUER = process.env.OIDC_ISSUER;      // e.g. https://login.example.com/
const AUDIENCE = process.env.API_AUDIENCE;   // the API identifier registered with the IdP
const JWKS = createRemoteJWKSet(new URL(process.env.JWKS_URI));

export async function requireAuth(req, res, next) {
  const match = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  if (!match) return res.status(401).json({ error: 'missing_token' });
  try {
    const { payload } = await jwtVerify(match[1], JWKS, {
      algorithms: ['RS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: '30s',
    });
    req.auth = payload;
    next();
  } catch (err) {
    const error = err instanceof errors.JWTExpired ? 'token_expired' : 'invalid_token';
    res.status(401).json({ error });
  }
}`}</ArticlePre>
        <ArticleP>
          Create the JWKS object once at module level, not per request, or you lose the cache. Match
          <ArticleCode>issuer</ArticleCode> exactly, including any trailing slash, and set <ArticleCode>audience</ArticleCode>
          to your API's identifier: without it, an access token minted for a different API at the same provider would be
          accepted. Also make sure the client is sending an access token rather than an ID token; the difference is explained in
          <a href="/jwt-in-oauth2-and-openid-connect" className={link}> JWT in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>

        <ArticleH2 id="express-jwt-package">Using the express-jwt Package</ArticleH2>
        <ArticleP>
          <ArticleCode>express-jwt</ArticleCode> 8 exports a named <ArticleCode>expressjwt</ArticleCode> function (older
          tutorials use a default export and <ArticleCode>req.user</ArticleCode>, both of which were removed in version 7).
          Verified claims land on <ArticleCode>req.auth</ArticleCode>, and failures are passed to Express's error handler as an
          <ArticleCode>UnauthorizedError</ArticleCode>, with codes such as <ArticleCode>credentials_required</ArticleCode> or
          <ArticleCode>invalid_token</ArticleCode>.
        </ArticleP>
        <ArticlePre lang="javascript">{`import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

app.use('/api', expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: process.env.JWKS_URI,
    cache: true,
    rateLimit: true,
  }),
  algorithms: ['RS256'],
  issuer: process.env.OIDC_ISSUER,
  audience: process.env.API_AUDIENCE,
}));

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.code });
  }
  next(err);
});`}</ArticlePre>
        <ArticleP>
          For your own HS256 tokens, pass <ArticleCode>secret: process.env.JWT_SECRET</ArticleCode> and
          <ArticleCode>algorithms: ['HS256']</ArticleCode> instead. The <ArticleCode>algorithms</ArticleCode> option is
          mandatory; that requirement exists because of the vulnerability described next.
        </ArticleP>

        <ArticleH2 id="express-jwt-vulnerability">Express JWT Vulnerabilities to Know About</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>express-jwt before 6.0.0 (CVE-2020-15084)</strong>: the <ArticleCode>algorithms</ArticleCode> option was optional. Combined with <ArticleCode>jwks-rsa</ArticleCode> and no allow-list, this allowed an authorisation bypass. Versions 6.0.0 and later require the option.</ArticleLi>
          <ArticleLi><strong>jsonwebtoken before 9.0.0 (CVE-2022-23539, CVE-2022-23540, CVE-2022-23541)</strong>: insecure key types were accepted, <ArticleCode>verify</ArticleCode> could fall back to the <ArticleCode>none</ArticleCode> algorithm when no algorithms were given and the key was falsy, and a flawed key-retrieval path allowed RSA-to-HMAC confusion. Version 9 also rejects RSA keys under 2048 bits unless <ArticleCode>allowInsecureKeySizes</ArticleCode> is set.</ArticleLi>
          <ArticleLi><strong>Algorithm confusion in your own code</strong>: if a verifier accepts both RS256 and HS256 with the same key material, an attacker can sign an HS256 token using the public key as the HMAC secret. One key, one algorithm. See <a href="/none-algorithm-vulnerability" className={link}>the none algorithm vulnerability</a> and <a href="/jwt-attacks-and-vulnerabilities" className={link}>JWT attacks and vulnerabilities</a>.</ArticleLi>
          <ArticleLi><strong>Weak HMAC secrets</strong>: a short or guessable secret can be brute-forced offline from a single captured token. Use 32 or more random bytes.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Run <ArticleCode>npm audit</ArticleCode> and check that no transitive dependency pins an old
          <ArticleCode>jsonwebtoken</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="refresh-tokens-and-logout">Refresh Tokens and Logout</ArticleH2>
        <ArticleP>
          A 15-minute access token needs a way to renew without asking for the password again. The standard answer is a
          long-lived, opaque refresh token stored server-side (hashed) and sent to the browser in an
          <ArticleCode>HttpOnly</ArticleCode>, <ArticleCode>Secure</ArticleCode>, <ArticleCode>SameSite</ArticleCode> cookie scoped
          to the refresh path. A <ArticleCode>POST /refresh</ArticleCode> route checks it, rotates it, and returns a new access
          token. Because the refresh token lives in your database, deleting it is how logout and "sign out everywhere" work.
          The full design, including reuse detection, is in the
          <a href="/jwt-refresh-token-pattern" className={link}> refresh token pattern</a> guide, and the storage trade-offs are in
          <a href="/jwt-storage-localstorage-vs-cookie" className={link}> localStorage vs cookie</a>.
        </ArticleP>

        <ArticleH2 id="production-checklist">Production Checklist</ArticleH2>
        <ArticleUl>
          <ArticleLi>Explicit <ArticleCode>algorithms</ArticleCode> allow-list on every verify call.</ArticleLi>
          <ArticleLi><ArticleCode>issuer</ArticleCode> and <ArticleCode>audience</ArticleCode> set on both sign and verify.</ArticleLi>
          <ArticleLi>Access token lifetime of 15 minutes or less; small <ArticleCode>clockTolerance</ArticleCode> (30 to 60 seconds).</ArticleLi>
          <ArticleLi>Secret or private key loaded from the environment or a secrets manager, checked at startup.</ArticleLi>
          <ArticleLi>Every verification failure returns 401 with a <ArticleCode>WWW-Authenticate: Bearer</ArticleCode> header (RFC 6750); authenticated-but-not-allowed returns 403.</ArticleLi>
          <ArticleLi>No personal data in the payload: it is only base64url-encoded, not encrypted.</ArticleLi>
          <ArticleLi>HTTPS everywhere. More in <a href="/jwt-security-best-practices" className={link}>JWT security best practices</a>.</ArticleLi>
        </ArticleUl>

        <ArticleH3 id="summary-table">Where each check lives</ArticleH3>
        <ArticleP>
          Signature and <ArticleCode>alg</ArticleCode>: the <ArticleCode>algorithms</ArticleCode> option. Expiry and not-before:
          automatic in both libraries. Issuer and audience: the <ArticleCode>issuer</ArticleCode> and
          <ArticleCode>audience</ArticleCode> options, which are skipped entirely if you leave them out. Roles and scopes: your own
          code, after verification.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          JWT authentication in Node.js and Express is a login route that calls <ArticleCode>jwt.sign</ArticleCode> with a short
          <ArticleCode>expiresIn</ArticleCode>, and a middleware that calls <ArticleCode>jwt.verify</ArticleCode> with a fixed
          algorithm list, issuer and audience, returning 401 on any error. Use <ArticleCode>jsonwebtoken</ArticleCode> 9 for
          self-issued tokens, <ArticleCode>jose</ArticleCode> with <ArticleCode>createRemoteJWKSet</ArticleCode> for tokens from an
          identity provider, and <ArticleCode>express-jwt</ArticleCode> 8 if you want the middleware pre-built. Never use
          <ArticleCode>decode</ArticleCode> for authorisation, and keep renewal and logout in a server-side refresh token.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
