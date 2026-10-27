import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Next.js JWT Authentication with the App Router: jose, Cookies and proxy.ts',
  description: 'How to implement JWT authentication in Next.js App Router: sign and verify with jose, store the token in an HttpOnly cookie, protect routes in proxy.ts (formerly middleware.ts), and check auth in route handlers and server actions.',
  url: 'https://jwtdecode.app/jwt-authentication-nextjs',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-authentication-nextjs',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const CHECKS: [where: string, role: string, note: string][] = [
  ['proxy.ts (middleware.ts before v16)', 'Optimistic redirect for pages', 'Fast and central, but not a security boundary on its own. Only reads the cookie.'],
  ['Server Components / DAL', 'Authoritative check before reading data', 'Call getSession() next to the data access. Redirect or return null.'],
  ['Route Handlers (app/api/.../route.ts)', 'Authoritative check for API calls', 'Return 401 for no or bad token, 403 for insufficient role.'],
  ['Server Actions', 'Authoritative check for mutations', 'Each action is a public POST endpoint. Verify inside every action.'],
  ['Client Components', 'UI only', 'Cannot read an HttpOnly cookie. Ask the server who the user is.'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtAuthNextjsPage() {
  return (
    <>
      <SEOHead
        title="Next.js JWT Authentication with jose"
        description="Next.js JWT authentication for the App Router: sign and verify with jose, set an HttpOnly cookie, protect routes in proxy.ts, and secure server actions."
        path="/jwt-authentication-nextjs"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in Next.js' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-authentication-nodejs-express', label: 'JWT in Node.js & Express', description: 'jsonwebtoken, jose and express-jwt for a standalone API.' },
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'localStorage vs Cookie', description: 'Why the HttpOnly cookie is the default for browser apps.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Keep access tokens short without logging users out.' },
          { to: '/is-jwt-encrypted-jws-vs-jwe', label: 'Is a JWT Encrypted?', description: 'JWS vs JWE, and why Auth.js cookies do not decode.' },
        ]}
      >
        <ArticleH1>Next.js JWT Authentication with the App Router: jose, Cookies and proxy.ts</ArticleH1>

        <ArticleIntroBox>
          For Next.js JWT authentication, sign and verify tokens with <ArticleCode>jose</ArticleCode>, store the token in an
          <ArticleCode>HttpOnly</ArticleCode> cookie set on the server with <ArticleCode>cookies()</ArticleCode> from
          <ArticleCode>next/headers</ArticleCode>, and verify it wherever data is read or changed: Server Components, Route
          Handlers and Server Actions. Next.js 16 renamed <ArticleCode>middleware.ts</ArticleCode> to
          <ArticleCode>proxy.ts</ArticleCode>; use it for quick redirects, not as your only check. Everything below was built and
          run with Next.js 16.3.6, React 19.3.0 and jose 6.2.12 on Node.js 22.
        </ArticleIntroBox>

        <ArticleH2 id="how-jwt-auth-works-in-nextjs">How JWT Auth Works in the Next.js App Router</ArticleH2>
        <ArticleP>
          A Next.js app is several servers in one: pages rendered on the server, API routes, Server Actions that the browser calls
          as POST requests, and the proxy layer that runs before all of them. A JWT gives each of those places a way to identify the
          user without a database lookup. The login step signs a token; every later request presents it, usually in a cookie; and
          each entry point verifies the signature, expiry, issuer and audience before trusting any claim.
        </ArticleP>
        <ArticleP>
          The mistake that causes most Next.js auth bugs is checking in one place only. The official Next.js authentication guide
          describes proxy checks as <em>optimistic</em> and recommends putting the secure checks in a data access layer close to the
          data. The table below is the model this guide follows.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Where</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {CHECKS.map(([where, role, note]) => (
                <tr key={where} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{where}</td>
                  <td className="px-3 py-2">{role}</td>
                  <td className="px-3 py-2">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="why-jose-not-jsonwebtoken">Why jose and Not jsonwebtoken</ArticleH2>
        <ArticleP>
          Until Next.js 15.5, middleware ran on the Edge runtime (Node.js support was experimental from 15.2), which has Web APIs but not Node.js's
          <ArticleCode>crypto</ArticleCode> module. <ArticleCode>jsonwebtoken</ArticleCode> depends on Node.js crypto, so importing
          it into <ArticleCode>middleware.ts</ArticleCode> failed. <ArticleCode>jose</ArticleCode> is built on Web Crypto and runs
          on Node.js, Edge, Deno, Bun and in browsers. Node.js-runtime middleware became stable in 15.5, and in Next.js 16 the
          proxy defaults to Node.js. Even so, <ArticleCode>jose</ArticleCode> is the sensible single choice: one library works in
          every runtime your code might end up in, and it is the library the Next.js docs use. If you are coming from Express, the
          <a href="/jwt-authentication-nodejs-express" className={link}> Node.js and Express guide</a> shows the same
          <ArticleCode>jose</ArticleCode> calls outside Next.js.
        </ArticleP>
        <ArticlePre lang="bash">{`npm install jose server-only
# 32 random bytes, stored in .env.local (never committed) and in your host's secret store
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local`}</ArticlePre>

        <ArticleH2 id="sign-and-verify">Signing and Verifying the Token</ArticleH2>
        <ArticleP>
          Keep the token logic in a plain module with no Next.js imports, so both the proxy and server code can use it. The verify
          function pins the algorithm, checks issuer and audience, allows 30 seconds of clock skew and returns
          <ArticleCode>null</ArticleCode> on any failure.
        </ArticleP>
        <ArticlePre lang="typescript">{`// lib/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error('AUTH_SECRET must be set to at least 32 random characters');
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const ISSUER = 'https://app.example.com';
const AUDIENCE = 'https://app.example.com';

export const ACCESS_COOKIE = 'access_token';

export type AccessClaims = JWTPayload & { sub: string; role: 'user' | 'admin' };

export async function signAccessToken(userId: string, role: AccessClaims['role']) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyAccessToken(token: string | undefined): Promise<AccessClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<AccessClaims>(token, secret, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: 30,
    });
    return payload;
  } catch {
    return null; // expired, bad signature, wrong iss/aud, malformed
  }
}`}</ArticlePre>
        <ArticleP>
          If your tokens come from an external identity provider instead, swap the secret for
          <ArticleCode>createRemoteJWKSet(new URL(jwksUri))</ArticleCode> and <ArticleCode>algorithms: ['RS256']</ArticleCode>;
          the rest is unchanged. See <a href="/what-is-jwks" className={link}>what is JWKS</a> for how key sets work.
        </ArticleP>

        <ArticleH2 id="httponly-cookie">Storing the JWT in an HttpOnly Cookie with cookies()</ArticleH2>
        <ArticleP>
          In the App Router, <ArticleCode>cookies()</ArticleCode> is asynchronous (since Next.js 15), so always
          <ArticleCode>await</ArticleCode> it. Cookies can only be set from Server Actions and Route Handlers, not while a Server
          Component is rendering. The <ArticleCode>server-only</ArticleCode> import makes the build fail if a Client Component
          ever imports this file.
        </ArticleP>
        <ArticlePre lang="typescript">{`// lib/session.ts
import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, signAccessToken, verifyAccessToken, type AccessClaims } from './jwt';

export async function createSession(userId: string, role: AccessClaims['role']) {
  const token = await signAccessToken(userId, role);
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // match the token's exp
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifyAccessToken(cookieStore.get(ACCESS_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
}`}</ArticlePre>
        <ArticleP>
          <ArticleCode>HttpOnly</ArticleCode> keeps the token away from any script injected into the page, and
          <ArticleCode>SameSite=Lax</ArticleCode> stops the cookie being sent on cross-site POSTs. The trade-offs against
          <ArticleCode>localStorage</ArticleCode> are laid out in <a href="/jwt-storage-localstorage-vs-cookie" className={link}>JWT
          storage: localStorage vs cookie</a>.
        </ArticleP>

        <ArticleH3 id="login-route-handler">A login Route Handler</ArticleH3>
        <ArticlePre lang="typescript">{`// app/api/login/route.ts
import { createSession } from '@/lib/session';

// Replace with a real lookup and an argon2/bcrypt password check.
async function checkCredentials(email: string, password: string) {
  return email === 'ada@example.com' && password === 'correct horse'
    ? { id: '42', role: 'admin' as const }
    : null;
}

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const user = await checkCredentials(String(email ?? ''), String(password ?? ''));
  if (!user) {
    return Response.json({ error: 'invalid_credentials' }, { status: 401 });
  }
  await createSession(user.id, user.role);
  return Response.json({ ok: true });
}`}</ArticlePre>
        <ArticleP>
          The response carries <ArticleCode>Set-Cookie: access_token=...; Path=/; Max-Age=900; Secure; HttpOnly; SameSite=lax</ArticleCode>.
          A Server Action works equally well for a form-based login; call <ArticleCode>createSession</ArticleCode> and then
          <ArticleCode>redirect()</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="nextjs-jwt-middleware">Next.js JWT Middleware: proxy.ts in Next.js 16</ArticleH2>
        <ArticleP>
          Next.js 16 deprecated the <ArticleCode>middleware</ArticleCode> file convention and renamed it to
          <ArticleCode>proxy</ArticleCode>. The file is <ArticleCode>proxy.ts</ArticleCode> in the project root (or
          <ArticleCode>src/</ArticleCode>), and it exports a function named <ArticleCode>proxy</ArticleCode> (or a default export)
          plus an optional <ArticleCode>config.matcher</ArticleCode>. It runs on the Node.js runtime, and the
          <ArticleCode>runtime</ArticleCode> option is not available in it. The official codemod,
          <ArticleCode>npx @next/codemod@canary middleware-to-proxy .</ArticleCode>, renames both the file and the function.
        </ArticleP>
        <ArticlePre lang="typescript">{`// proxy.ts  (Next.js 16+; in Next.js 15 name it middleware.ts and export \`middleware\`)
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAccessToken, ACCESS_COOKIE } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  const claims = await verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  if (!claims) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};`}</ArticlePre>
        <ArticleP>
          With this in place, an unauthenticated request to <ArticleCode>/dashboard</ArticleCode> received a 307 redirect to
          <ArticleCode>/login?next=%2Fdashboard</ArticleCode> in testing. The build output lists it as
          <ArticleCode>Proxy (Middleware)</ArticleCode>.
        </ArticleP>
        <ArticleCallout type="warning">
          Do not treat the proxy as your only check. Matchers are easy to get wrong, Server Actions on excluded paths skip it, and
          CVE-2025-29927 showed that middleware itself can be bypassed: a crafted <ArticleCode>x-middleware-subrequest</ArticleCode>
          header skipped middleware entirely in unpatched versions (fixed in 15.2.3, 14.2.25, 13.5.9 and 12.3.5). Verify again
          wherever data is read or written.
        </ArticleCallout>

        <ArticleH2 id="route-handlers">Protecting Route Handlers</ArticleH2>
        <ArticleP>
          Route Handlers are ordinary HTTP endpoints, so they should return 401 rather than redirect. This one accepts either a
          <ArticleCode>Bearer</ArticleCode> header, for mobile apps and scripts, or the cookie, for the browser.
        </ArticleP>
        <ArticlePre lang="typescript">{`// app/api/me/route.ts
import { type NextRequest } from 'next/server';
import { verifyAccessToken, ACCESS_COOKIE } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  const token = bearer ?? request.cookies.get(ACCESS_COOKIE)?.value;

  const claims = await verifyAccessToken(token);
  if (!claims) {
    return Response.json(
      { error: 'invalid_token' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } },
    );
  }
  return Response.json({ userId: claims.sub, role: claims.role });
}`}</ArticlePre>

        <ArticleH2 id="server-actions">Checking the JWT in Server Actions</ArticleH2>
        <ArticleP>
          Every Server Action is reachable by a direct POST, whatever the UI shows. Verify the session and the role inside each
          action.
        </ArticleP>
        <ArticlePre lang="typescript">{`// app/actions.ts
'use server';
import { getSession } from '@/lib/session';

export async function deleteProject(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorised');
  if (session.role !== 'admin') throw new Error('Forbidden');

  const projectId = String(formData.get('projectId'));
  // await db.project.delete({ where: { id: projectId, ownerId: session.sub } });
  return { deleted: projectId };
}`}</ArticlePre>
        <ArticleP>
          Server Components use the same <ArticleCode>getSession()</ArticleCode> and call <ArticleCode>redirect('/login')</ArticleCode>
          from <ArticleCode>next/navigation</ArticleCode> when it returns <ArticleCode>null</ArticleCode>. Avoid doing the check
          only in a layout: layouts do not re-render on client navigation.
        </ArticleP>

        <ArticleH2 id="nextjs-jwt-decode">Next.js JWT Decode: Reading Claims on the Client</ArticleH2>
        <ArticleP>
          A Client Component cannot read an <ArticleCode>HttpOnly</ArticleCode> cookie, which is the point. To show the user's name
          or role, fetch it from a route such as <ArticleCode>/api/me</ArticleCode> above, or pass it down as props from a Server
          Component. If you hold a token in JavaScript for another reason (for example, one returned by a third-party API),
          <ArticleCode>decodeJwt(token)</ArticleCode> from <ArticleCode>jose</ArticleCode> reads the payload without verifying it.
          That is fine for display and never acceptable for access decisions; see
          <a href="/jwt-decoder-vs-jwt-validator" className={link}> decoder vs validator</a>. For a quick look while debugging, the
          <a href="/" className={link}> jwtdecode.app decoder</a> decodes a pasted token locally in the browser.
        </ArticleP>
        <ArticleH3 id="nextauth-jwe">Why an Auth.js (NextAuth) session token will not decode</ArticleH3>
        <ArticleP>
          If you use Auth.js (NextAuth.js), its default <ArticleCode>jwt</ArticleCode> session strategy stores an
          <strong> encrypted</strong> token, a JWE (RFC 7516), not a signed JWS. In the current <ArticleCode>@auth/core</ArticleCode>
          code the header is <ArticleCode>alg: "dir"</ArticleCode>, <ArticleCode>enc: "A256CBC-HS512"</ArticleCode>, with the key
          derived from <ArticleCode>AUTH_SECRET</ArticleCode>. The cookie is named <ArticleCode>authjs.session-token</ArticleCode>
          (<ArticleCode>__Secure-authjs.session-token</ArticleCode> over HTTPS; NextAuth v4 used
          <ArticleCode>next-auth.session-token</ArticleCode>). It has five dot-separated parts and cannot be read by a JWS decoder,
          including jwtdecode.app, which rejects five-part tokens. On the server, read it with <ArticleCode>auth()</ArticleCode> or
          <ArticleCode>getToken()</ArticleCode>. <a href="/is-jwt-encrypted-jws-vs-jwe" className={link}>JWS vs JWE</a> explains the
          format difference.
        </ArticleP>

        <ArticleH2 id="nextjs-jwt-refresh-token">Next.js JWT Refresh Tokens</ArticleH2>
        <ArticleP>
          With a 15-minute access cookie, users need silent renewal. Issue a second, opaque refresh token at login, store its hash
          in your database, and set it in its own cookie with <ArticleCode>httpOnly</ArticleCode>, <ArticleCode>secure</ArticleCode>,
          <ArticleCode>sameSite: 'strict'</ArticleCode> and <ArticleCode>path: '/api/auth/refresh'</ArticleCode> so it is only sent
          to the refresh endpoint. That Route Handler looks up the hash, rotates the refresh token, and calls
          <ArticleCode>createSession()</ArticleCode> again. The client retries once on a 401 after calling refresh.
        </ArticleP>
        <ArticleP>
          Do not refresh from inside the proxy by rewriting cookies on every request: it runs on prefetches and static asset
          requests too, and the Next.js docs advise against database calls there. Logout deletes both cookies and the stored refresh
          token. The full rotation and reuse-detection design is in the <a href="/jwt-refresh-token-pattern" className={link}>refresh
          token pattern</a> guide, and revocation options are in <a href="/jwt-logout-and-revocation" className={link}>JWT logout and
          revocation</a>.
        </ArticleP>

        <ArticleH2 id="jwt-nextjs-15-vs-16">JWT in Next.js 15 vs Next.js 16</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>File name</strong>: <ArticleCode>middleware.ts</ArticleCode> exporting <ArticleCode>middleware</ArticleCode> in 15; <ArticleCode>proxy.ts</ArticleCode> exporting <ArticleCode>proxy</ArticleCode> in 16. The old name is deprecated.</ArticleLi>
          <ArticleLi><strong>Runtime</strong>: Edge by default in 15 (Node.js opt-in, stable from 15.5); Node.js in 16's proxy.</ArticleLi>
          <ArticleLi><strong>Request APIs</strong>: <ArticleCode>cookies()</ArticleCode> and <ArticleCode>headers()</ArticleCode> are async in both. Code written for Next.js 14 that calls <ArticleCode>cookies().get()</ArticleCode> synchronously needs an <ArticleCode>await</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Token code</strong>: the <ArticleCode>jose</ArticleCode> sign and verify code above is identical in both.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="common-problems">Common Problems</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Everyone is logged out after deploying</strong>: <ArticleCode>AUTH_SECRET</ArticleCode> differs between build machines or instances, or is missing. The startup check in <ArticleCode>lib/jwt.ts</ArticleCode> turns a missing secret into a clear error instead of a silent 401 on every request.</ArticleLi>
          <ArticleLi><strong>Cookie never appears</strong>: it was set during Server Component rendering (not allowed), or <ArticleCode>secure: true</ArticleCode> was used over plain HTTP on a non-localhost address.</ArticleLi>
          <ArticleLi><strong>Login works, API calls from another origin fail</strong>: <ArticleCode>SameSite=Lax</ArticleCode> cookies are not sent on cross-site fetches. Send a <ArticleCode>Bearer</ArticleCode> header for those clients instead.</ArticleLi>
          <ArticleLi><strong>Token rejected with a valid signature</strong>: check <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode> and the server clock. The <a href="/how-to-debug-a-jwt" className={link}>JWT debugging routine</a> walks through each check in order.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Next.js JWT authentication in the App Router is a small <ArticleCode>jose</ArticleCode> module that signs 15-minute
          HS256 (or verifies provider RS256) tokens with a pinned algorithm, issuer and audience; a session module that stores the
          token in an <ArticleCode>HttpOnly</ArticleCode> cookie via <ArticleCode>await cookies()</ArticleCode>; a
          <ArticleCode>proxy.ts</ArticleCode> (formerly <ArticleCode>middleware.ts</ArticleCode>) for optimistic redirects; and a
          real verification in every Route Handler, Server Action and data access function. Add an opaque, rotating refresh token for
          renewal, and remember that Auth.js session cookies are encrypted JWEs rather than readable JWTs. For broader hardening,
          see <a href="/jwt-security-best-practices" className={link}>JWT security best practices</a>.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
