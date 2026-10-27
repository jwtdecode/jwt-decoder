import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Size Limit: How Big Can a JWT Be?',
  description: 'RFC 7519 sets no JWT size limit, but HTTP header limits in nginx, Apache, Node.js, AWS and browsers do. How to calculate a token size, where it breaks, and how to shrink it.',
  url: 'https://jwtdecode.app/jwt-size-limit',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-size-limit',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const LIMITS: [component: string, limit: string, scope: string, failure: string][] = [
  ['nginx', '8 KB per header line (large_client_header_buffers 4 8k)', 'One header field', '400 Bad Request'],
  ['Apache httpd', '8190 bytes (LimitRequestFieldSize)', 'One header field, name included', '400 Bad Request'],
  ['Node.js http', '16 KiB (--max-http-header-size)', 'All headers together', '431 Request Header Fields Too Large'],
  ['Apache Tomcat', '8192 bytes (maxHttpHeaderSize)', 'Request line plus all headers', '400, "Request header is too large"'],
  ['ASP.NET Core Kestrel', '32,768 bytes (MaxRequestHeadersTotalSize)', 'All headers together', '431'],
  ['AWS Application Load Balancer', '16 K single header, 64 K all request headers', 'Per header and total', 'Rejected at the load balancer'],
  ['Amazon API Gateway REST API', '20,480 bytes (8,000 for private APIs)', 'All header names and values', 'Rejected at the gateway'],
  ['Amazon API Gateway HTTP API', '10,240 bytes', 'Request line plus header values', 'Rejected at the gateway'],
  ['Amazon CloudFront', '32,768 bytes', 'Request line, headers and query string', 'Rejected at the edge'],
];

const SIGNATURES: [alg: string, bytes: string, chars: string][] = [
  ['HS256', '32', '43'],
  ['HS384', '48', '64'],
  ['HS512', '64', '86'],
  ['ES256', '64', '86'],
  ['ES384', '96', '128'],
  ['ES512 (P-521)', '132', '176'],
  ['EdDSA / Ed25519', '64', '86'],
  ['RS256 / PS256, 2048-bit key', '256', '342'],
  ['RS256 / PS256, 3072-bit key', '384', '512'],
  ['RS256 / PS256, 4096-bit key', '512', '683'],
];

export default function JwtSizeLimitPage() {
  return (
    <>
      <SEOHead
        title="JWT Size Limit: How Big Can a JWT Be?"
        description="There is no JWT size limit in RFC 7519, but servers, proxies and cookies impose one. See the real limits, how to calculate token size, and how to shrink it."
        path="/jwt-size-limit"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Size Limit' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Which claims are registered, and which ones you can leave out.' },
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'localStorage vs Cookie', description: 'Where to keep tokens, and what cookie limits mean for large ones.' },
          { to: '/jwt-scopes-vs-roles', label: 'JWT Scopes vs Roles', description: 'Modelling permissions without bloating the token.' },
          { to: '/es256-explained', label: 'ES256 Explained', description: 'Smaller keys and signatures than RSA at equivalent security.' },
        ]}
      >
        <ArticleH1>JWT Size Limit: How Big Can a JWT Be Before Something Breaks?</ArticleH1>

        <ArticleIntroBox>
          RFC 7519 does not set a maximum size for a JWT. The practical limit comes from the HTTP infrastructure
          the token travels through: nginx and Apache reject a single header over about 8 KB by default, Node.js
          rejects requests whose headers total more than 16 KiB, and browsers are only required to store cookies of
          about 4 KB. Keep access tokens under roughly 4 KB and they will fit everywhere; past 8 KB, expect
          failures somewhere.
          <br /><br />
          The rest of this page lists the defaults for common servers, proxies and AWS services, shows how to
          calculate a token's size before you issue it, and covers the techniques that keep tokens small, from
          dropping claims to Entra ID's groups overage and opaque reference tokens.
        </ArticleIntroBox>

        <ArticleH2 id="is-there-a-jwt-size-limit">Is There a JWT Size Limit in the Specification?</ArticleH2>
        <ArticleP>
          No. RFC 7519 (JWT) and RFC 7515 (JWS) define the structure and encoding but say nothing about maximum
          length. A JWT with a megabyte of claims is perfectly valid. The standards also give you no compression
          for signed tokens: the <ArticleCode>zip</ArticleCode> header parameter exists only for encrypted tokens
          (JWE, RFC 7516), and RFC 8725 advises against compressing data before encryption anyway.
        </ArticleP>
        <ArticleP>
          The limits you hit are imposed by every system between the client and your code: the browser's cookie
          jar, CDNs, load balancers, API gateways, reverse proxies and the application server. The smallest of
          those is your real JWT token size limit.
        </ArticleP>

        <ArticleH2 id="jwt-token-size-limit-by-server">JWT Token Size Limits by Server and Proxy</ArticleH2>
        <ArticleP>
          These are the defaults as documented by each project or service. Most self-hosted servers can be raised;
          the AWS limits listed are fixed quotas. Remember that the header carrying the token includes{' '}
          <ArticleCode>Authorization: Bearer </ArticleCode> (22 bytes), and total-header limits also count cookies,
          user agent and everything else in the request.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Component</th>
                <th className="px-3 py-2 font-semibold">Default limit</th>
                <th className="px-3 py-2 font-semibold">Applies to</th>
                <th className="px-3 py-2 font-semibold">Typical failure</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {LIMITS.map(([component, limit, scope, failure]) => (
                <tr key={component} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{component}</td>
                  <td className="px-3 py-2">{limit}</td>
                  <td className="px-3 py-2">{scope}</td>
                  <td className="px-3 py-2">{failure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          The nginx and Apache numbers are the ones most teams meet first, because they sit in front of everything
          else. nginx returns 400 when a single header field does not fit in one{' '}
          <ArticleCode>large_client_header_buffers</ArticleCode> buffer; the fix is{' '}
          <ArticleCode>large_client_header_buffers 4 16k;</ArticleCode> in the <ArticleCode>http</ArticleCode> or{' '}
          <ArticleCode>server</ArticleCode> block. Apache's equivalent is <ArticleCode>LimitRequestFieldSize</ArticleCode>.
          In Node.js, start the process with <ArticleCode>--max-http-header-size=32768</ArticleCode> or pass{' '}
          <ArticleCode>maxHeaderSize</ArticleCode> to <ArticleCode>http.createServer</ArticleCode>. A quick test against a
          default Node.js 22 server returned 200 for an 8,000-byte Authorization header and 431 for a 17,000-byte one.
        </ArticleP>
        <ArticleCallout type="warning">
          Raising one limit only moves the failure. A token that passes your nginx may still be rejected by a
          corporate proxy, a WAF, a CDN or a partner's gateway you do not control. Treat large tokens as a design
          problem, not a configuration problem.
        </ArticleCallout>

        <ArticleH2 id="jwt-cookie-size-limit">JWT in a Cookie: the 4 KB Limit</ArticleH2>
        <ArticleP>
          RFC 6265 §6.1 asks browsers to support "at least 4096 bytes per cookie (as measured by the sum of the
          length of the cookie's name, value, and attributes)", at least 50 cookies per domain and at least 3000
          cookies in total. Browsers treat roughly 4 KB per cookie as the working ceiling, and the name,{' '}
          <ArticleCode>Path</ArticleCode>, <ArticleCode>Domain</ArticleCode>, <ArticleCode>Expires</ArticleCode> and{' '}
          <ArticleCode>SameSite</ArticleCode> attributes all count against it. A cookie over the limit is typically
          dropped silently, so the symptom is a login that appears to succeed and then behaves as if no one signed in.
        </ArticleP>
        <ArticleP>
          Some frameworks work around this by splitting a large value across numbered cookies, and ASP.NET Core's
          cookie authentication and Auth.js both do so. That keeps each cookie under 4 KB but not the request: every
          chunk is sent on every request to that domain and still counts towards the server's header limits. The{' '}
          <a href="/jwt-storage-localstorage-vs-cookie" className={link}>storage guide</a> covers the wider trade-offs
          of cookies versus other storage.
        </ArticleP>

        <ArticleH2 id="jwt-size-calculator">JWT Size Calculator: Working Out the Length</ArticleH2>
        <ArticleP>
          A compact JWS is <ArticleCode>BASE64URL(header) . BASE64URL(payload) . BASE64URL(signature)</ArticleCode>.
          Base64url produces 4 characters for every 3 bytes and JWT drops the padding, so each part is{' '}
          <ArticleCode>ceil(bytes × 4 / 3)</ArticleCode> characters:
        </ArticleP>
        <ArticlePre>{`token length = ceil(4/3 × header JSON bytes)
             + ceil(4/3 × payload JSON bytes)
             + ceil(4/3 × signature bytes)
             + 2 (the dots)`}</ArticlePre>
        <ArticleP>
          The JSON is measured as UTF-8 bytes after serialisation, so whitespace and non-ASCII characters matter. The
          signature part depends only on the algorithm and key size:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Algorithm</th>
                <th className="px-3 py-2 font-semibold">Signature bytes</th>
                <th className="px-3 py-2 font-semibold">Base64url characters</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {SIGNATURES.map(([alg, bytes, chars]) => (
                <tr key={alg} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{alg}</td>
                  <td className="px-3 py-2">{bytes}</td>
                  <td className="px-3 py-2">{chars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          An RSA signature is as long as the key's modulus, so a 2048-bit RS256 signature is 256 bytes and costs
          342 characters, against 86 for ES256. In a test with the same header and a realistic set of ten claims
          (issuer URL, GUID subject, audience, scope, email, name, <ArticleCode>iat</ArticleCode>,{' '}
          <ArticleCode>nbf</ArticleCode>, <ArticleCode>exp</ArticleCode>, <ArticleCode>jti</ArticleCode>), the token was
          560 characters with HS256, 603 with ES256 and 859 with RS256. See{' '}
          <a href="/es256-explained" className={link}>ES256 explained</a> if signature size is a factor in your choice.
        </ArticleP>

        <ArticleH2 id="jwt-payload-size">JWT Payload Size: What Actually Makes Tokens Big</ArticleH2>
        <ArticleP>
          The signature is fixed; the payload is where tokens grow. Adding a <ArticleCode>groups</ArticleCode> claim
          of GUIDs to the RS256 token above made it 3,474 characters with 50 groups and 11,274 characters with 200,
          well past the 8 KB default of nginx and Apache. The usual causes:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Group and role lists</strong> that grow with the user's tenure in an organisation.</ArticleLi>
          <ArticleLi><strong>Fine-grained permissions</strong> enumerated as strings (<ArticleCode>orders:read:region:eu</ArticleCode>) instead of a small set of scopes.</ArticleLi>
          <ArticleLi><strong>Profile data</strong> such as addresses, preferences or pictures encoded into claims.</ArticleLi>
          <ArticleLi><strong>Nested tokens or certificates</strong>, for example an <ArticleCode>x5c</ArticleCode> chain in the header, which can add several kilobytes on its own.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="measure-jwt-size">How to Measure a JWT's Size</ArticleH2>
        <ArticleP>
          A JWT is plain ASCII, so characters and bytes are the same thing:
        </ArticleP>
        <ArticlePre lang="bash">{`echo -n "$TOKEN" | wc -c           # bytes in the token
printf '%s' "$TOKEN" | wc -c       # same, portable

# Size of each part
printf '%s' "$TOKEN" | awk -F. '{print length($1), length($2), length($3)}'`}</ArticlePre>
        <ArticlePre lang="javascript">{`// Node.js: total size and the decoded payload size
const [h, p, s] = token.split('.');
console.log({
  total: token.length,
  headerJson: Buffer.from(h, 'base64url').length,
  payloadJson: Buffer.from(p, 'base64url').length,
  signature: Buffer.from(s, 'base64url').length,
});`}</ArticlePre>
        <ArticleP>
          Add a check to your issuer's test suite that fails if a token for your most privileged test user exceeds
          a budget, for example 4,096 bytes. That catches growth when someone adds a claim, long before a user with
          unusually many groups finds it in production. To see which claims are responsible, paste a token into{' '}
          <a href="/" className={link}>the jwtdecode.app decoder</a>, which decodes locally in the browser and lists
          every claim with a description.
        </ArticleP>

        <ArticleH2 id="how-to-reduce-jwt-size">How to Reduce JWT Size</ArticleH2>
        <ArticleH3 id="fewer-claims">Carry fewer, shorter claims</ArticleH3>
        <ArticleP>
          An access token needs what the API uses to authorise the request: typically <ArticleCode>iss</ArticleCode>,{' '}
          <ArticleCode>sub</ArticleCode>, <ArticleCode>aud</ArticleCode>, <ArticleCode>exp</ArticleCode>,{' '}
          <ArticleCode>iat</ArticleCode>, <ArticleCode>jti</ArticleCode> and a scope or role claim, close to the set RFC
          9068 requires for JWT access tokens (which adds <ArticleCode>client_id</ArticleCode>). Profile details belong in the ID token or a userinfo call. Prefer coarse
          scopes and roles over enumerated permissions; the{' '}
          <a href="/jwt-scopes-vs-roles" className={link}>scopes vs roles guide</a> shows how to model them, and{' '}
          <a href="/jwt-claims-explained" className={link}>JWT claims explained</a> lists what each registered claim
          is for.
        </ArticleP>
        <ArticleH3 id="groups-overage">Use a groups overage pattern</ArticleH3>
        <ArticleP>
          Microsoft Entra ID caps the <ArticleCode>groups</ArticleCode> claim at 200 entries in a JWT (150 in SAML).
          Above that, it omits the list and instead emits <ArticleCode>_claim_names</ArticleCode> and{' '}
          <ArticleCode>_claim_sources</ArticleCode>, an overage claim telling the application to fetch group membership
          from Microsoft Graph. You can apply the same idea to your own issuer: include memberships up to a limit,
          and past it include a flag that makes the API look them up and cache them. Emitting only application roles
          or groups assigned to the application, rather than every group the user belongs to, often removes the
          problem entirely.
        </ArticleP>
        <ArticleH3 id="reference-tokens">Switch to reference tokens</ArticleH3>
        <ArticleP>
          A reference (opaque) token is a random identifier, a few dozen bytes long, that the API exchanges for the
          token's data through token introspection (RFC 7662) or a shared cache. Size stops being a concern and
          revocation becomes immediate, at the cost of a lookup per request or per cache miss. A common hybrid is the
          phantom token pattern: clients hold an opaque token and the API gateway swaps it for a JWT on the internal
          network, where header limits are under your control.
        </ArticleP>
        <ArticleH3 id="smaller-signatures">Choose a smaller signature</ArticleH3>
        <ArticleP>
          Moving from RS256 with a 2048-bit key to ES256 saves 256 characters per token. It will not rescue a token
          with 200 groups, but it matters on tokens that sit close to a cookie limit. If you are generating new keys
          anyway, <a href="/generate-jwt-signing-keys-openssl" className={link}>the OpenSSL key guide</a> has the
          commands.
        </ArticleP>

        <ArticleH2 id="jwt-secret-size">What About JWT Secret Size?</ArticleH2>
        <ArticleP>
          The secret or key does not travel in the token, so its length has no effect on token size, except that an
          RSA key's modulus sets the RSA signature length. For HMAC, the secret should be at least as long as the hash
          output (32 bytes for HS256, per RFC 7518 §3.2), and the HS256 signature is 32 bytes regardless. See the{' '}
          <a href="/jwt-secret-key-generator" className={link}>JWT secret key generator</a> for details.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>There is no JWT size limit in RFC 7519; the limit is set by the infrastructure, most often nginx or Apache's 8 KB per-header default and the 4 KB cookie minimum in RFC 6265.</ArticleLi>
          <ArticleLi>Token length is roughly 4/3 of the header, payload and signature bytes combined; RS256 with a 2048-bit key adds 342 characters, ES256 adds 86.</ArticleLi>
          <ArticleLi>Measure with <ArticleCode>echo -n "$TOKEN" | wc -c</ArticleCode> and enforce a size budget in tests.</ArticleLi>
          <ArticleLi>Keep tokens small by carrying only authorisation claims, capping group lists with an overage pattern, or using reference tokens for large or fast-changing data.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
