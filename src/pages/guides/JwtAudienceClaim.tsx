import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT aud Claim: What the Audience Means and How to Validate It',
  description: 'What the JWT aud (audience) claim means under RFC 7519, string vs array values, how aud differs from sub, iss and the OIDC azp claim, how to validate audience in Node.js and Python, and how to fix invalid audience errors including Keycloak.',
  url: 'https://jwtdecode.app/jwt-audience-claim',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-audience-claim',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const CLAIM_COMPARE: [claim: string, answers: string, example: string][] = [
  ['iss', 'Who issued this token?', 'https://login.example.com/'],
  ['aud', 'Who is this token for?', 'https://api.example.com'],
  ['sub', 'Who is this token about?', 'user_8412'],
  ['azp', 'Which client was it issued to? (OIDC)', 'spa-client-id'],
  ['client_id', 'Which client requested it? (RFC 9068 access tokens)', 'spa-client-id'],
];

const LIB_ERRORS: [lib: string, option: string, error: string][] = [
  ['jsonwebtoken', 'audience: string | RegExp | array', 'JsonWebTokenError: jwt audience invalid. expected: <value>'],
  ['jose', 'audience: string | string[]', 'ERR_JWT_CLAIM_VALIDATION_FAILED: unexpected "aud" claim value'],
  ['PyJWT', 'audience=str | list', 'InvalidAudienceError: Audience doesn\'t match (or "Invalid audience" when none was configured)'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtAudienceClaimPage() {
  return (
    <>
      <SEOHead
        title="JWT aud Claim: Audience Meaning and Validation"
        description="The JWT aud claim names who a token is for. Its meaning, string vs array values, aud vs sub, iss and azp, and how to validate audience in Node.js and Python."
        path="/jwt-audience-claim"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT aud Claim' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'All registered claims and how verifiers check them.' },
          { to: '/jwt-scopes-vs-roles', label: 'JWT Scopes vs Roles', description: 'What the token lets the caller do, once aud says it is for you.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'ID tokens vs access tokens and why their audiences differ.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors & Fixes', description: 'Wrong audience, wrong issuer and other rejections.' },
        ]}
      >
        <ArticleH1>JWT aud Claim: What the Audience Means and How to Validate It</ArticleH1>

        <ArticleIntroBox>
          The <ArticleCode>aud</ArticleCode> (audience) claim identifies the recipients a JWT is intended for, usually the
          API or client application that should accept it. RFC 7519 §4.1.3 allows it to be a single string or an array of
          strings, and requires a recipient to reject the token if it does not find itself in that value. Audience
          validation is what stops a token issued for one service from being replayed against another that trusts the same
          identity provider. The signature cannot catch that, because both services accept the same issuer's keys. This
          guide covers the format, how <ArticleCode>aud</ArticleCode> differs from <ArticleCode>sub</ArticleCode>,
          <ArticleCode>iss</ArticleCode> and <ArticleCode>azp</ArticleCode>, and how to configure audience checks in
          jsonwebtoken, jose and PyJWT.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-aud-meaning">JWT aud Meaning</ArticleH2>
        <ArticleP>
          RFC 7519 §4.1.3 defines <ArticleCode>aud</ArticleCode> as the recipients the JWT is intended for. Each principal
          that processes the token must identify itself with a value in the audience claim; if it does not, and the claim
          is present, it must reject the token. The values are case-sensitive strings, usually URIs or client IDs. Their
          meaning is application-specific: nothing in the spec says what your API's identifier should be, only that the
          issuer and the API must agree on it.
        </ArticleP>
        <ArticleP>
          RFC 8725 §3.9 turns this into advice for issuers: when the same issuer produces tokens for more than one
          recipient, those tokens must carry an <ArticleCode>aud</ArticleCode> and recipients must check it. RFC 9068 makes
          <ArticleCode>aud</ArticleCode> required in JWT access tokens.
        </ArticleP>
        <ArticleH3 id="why-audience-matters">Why skipping the check is dangerous</ArticleH3>
        <ArticleP>
          Picture a company that uses one identity provider for a low-risk newsletter app and a payments API. Both trust
          the same issuer and fetch the same JWKS. If the payments API checks only the signature and
          <ArticleCode>iss</ArticleCode>, then anyone who can get a token for the newsletter app, including the newsletter
          app's own developers or an attacker who compromises it, can present that token to the payments API and it will be
          accepted. The token is genuine; it was simply minted for someone else. This token-substitution pattern is one of
          the reasons audience checks appear in every JWT security checklist, including the
          <a href="/jwt-security-best-practices" className={link}> JWT security best practices</a> on this site. The
          same reasoning applies to third-party identity: a token your users obtained to sign in to some other site that
          uses the same provider must not work on yours.
        </ArticleP>

        <ArticleH2 id="jwt-aud-claim-example">JWT aud Claim Example: String or Array</ArticleH2>
        <ArticlePre>{`// Single audience (most common)
{
  "iss": "https://login.example.com/",
  "sub": "user_8412",
  "aud": "https://api.example.com",
  "exp": 1790284151
}

// Multiple audiences
{
  "iss": "https://login.example.com/",
  "sub": "user_8412",
  "aud": ["https://api.example.com", "https://login.example.com/userinfo"],
  "exp": 1790284151
}`}</ArticlePre>
        <ArticleP>
          Both forms are valid, and code that reads <ArticleCode>aud</ArticleCode> must handle both. A hand-written check like
          <ArticleCode>payload.aud === 'https://api.example.com'</ArticleCode> fails silently for the array form. Auth0, for
          example, issues an array when an access token is requested for your API together with the
          <ArticleCode>openid</ArticleCode> scope, adding its <ArticleCode>/userinfo</ArticleCode> URL as a second audience.
          Libraries handle both forms: the check passes if any value in the token matches any value you configured.
        </ArticleP>
        <ArticleP>
          To see which audience a token actually carries, paste it into the <a href="/" className={link}>jwtdecode.app decoder</a>;
          it runs in the browser and shows <ArticleCode>aud</ArticleCode> alongside a description of the claim.
        </ArticleP>

        <ArticleH2 id="jwt-audience-validation">JWT Audience Validation in Code</ArticleH2>
        <ArticleP>
          In jsonwebtoken and jose, audience is checked only if you pass the option. Leaving it out is the most common way
          audience validation ends up missing entirely. PyJWT is stricter: if the token has an <ArticleCode>aud</ArticleCode> and
          you configured none, it raises an error.
        </ArticleP>
        <ArticleH3 id="aud-jsonwebtoken">Node.js: jsonwebtoken</ArticleH3>
        <ArticlePre>{`import jwt from 'jsonwebtoken';

const payload = jwt.verify(token, publicKeyPem, {
  algorithms: ['RS256'],
  issuer: 'https://login.example.com/',
  audience: 'https://api.example.com',          // or an array, or a RegExp
});
// Mismatch: JsonWebTokenError "jwt audience invalid. expected: https://api.example.com"`}</ArticlePre>
        <ArticleH3 id="aud-jose">Node.js: jose</ArticleH3>
        <ArticlePre>{`import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://login.example.com/.well-known/jwks.json'));

const { payload } = await jwtVerify(token, JWKS, {
  issuer: 'https://login.example.com/',
  audience: 'https://api.example.com',          // or ['https://api.example.com', 'legacy-id']
  algorithms: ['RS256'],
});
// Mismatch: code ERR_JWT_CLAIM_VALIDATION_FAILED, claim "aud", message 'unexpected "aud" claim value'`}</ArticlePre>
        <ArticleH3 id="aud-pyjwt">Python: PyJWT</ArticleH3>
        <ArticlePre>{`import jwt

payload = jwt.decode(
    token,
    public_key,
    algorithms=["RS256"],
    audience="https://api.example.com",   # or a list of accepted values
    issuer="https://login.example.com/",
)
# Mismatch:            jwt.InvalidAudienceError: Audience doesn't match
# aud present, no audience argument: jwt.InvalidAudienceError: Invalid audience`}</ArticlePre>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Library</th>
                <th className="px-3 py-2 font-semibold">Option</th>
                <th className="px-3 py-2 font-semibold">Error on mismatch</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {LIB_ERRORS.map(([lib, option, error]) => (
                <tr key={lib} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{lib}</td>
                  <td className="px-3 py-2 font-mono">{option}</td>
                  <td className="px-3 py-2 font-mono">{error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleCallout type="warning">
          Do not "fix" a PyJWT audience error with <ArticleCode>options={'{'}"verify_aud": False{'}'}</ArticleCode>. That turns
          off the check that keeps other applications' tokens out of your API. Configure the correct audience instead.
        </ArticleCallout>

        <ArticleH2 id="jwt-aud-vs-sub">JWT aud vs sub</ArticleH2>
        <ArticleP>
          <ArticleCode>sub</ArticleCode> is who the token is <em>about</em>: the user, or the service in a client credentials
          flow. <ArticleCode>aud</ArticleCode> is who the token is <em>for</em>: the party that should accept it. A token for
          user 8412 to call the orders API has <ArticleCode>sub: "user_8412"</ArticleCode> and
          <ArticleCode>aud: "https://orders.example.com"</ArticleCode>. Your API authenticates the caller by
          <ArticleCode>sub</ArticleCode> only after <ArticleCode>aud</ArticleCode> has established that the token was meant for it.
        </ArticleP>

        <ArticleH2 id="jwt-audience-vs-issuer">JWT Audience vs Issuer</ArticleH2>
        <ArticleP>
          <ArticleCode>iss</ArticleCode> names who created and signed the token; <ArticleCode>aud</ArticleCode> names who should
          consume it. You need both checks. The issuer check (plus signature) says "this came from an identity provider I
          trust". The audience check says "and it was issued for me, not for some other application that uses the same
          provider". A multi-tenant provider adds a twist: <ArticleCode>iss</ArticleCode> may include the tenant, so check it
          exactly rather than by prefix.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Claim</th>
                <th className="px-3 py-2 font-semibold">Answers</th>
                <th className="px-3 py-2 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {CLAIM_COMPARE.map(([claim, answers, example]) => (
                <tr key={claim} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono font-medium text-slate-700 dark:text-slate-300">{claim}</td>
                  <td className="px-3 py-2">{answers}</td>
                  <td className="px-3 py-2 font-mono">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="jwt-aud-vs-azp">JWT aud vs azp</ArticleH2>
        <ArticleP>
          <ArticleCode>azp</ArticleCode> (authorised party) comes from OpenID Connect Core, not RFC 7519. In an ID token it
          holds the client ID of the party the token was issued to. Normally the ID token's audience is that same client,
          so <ArticleCode>aud</ArticleCode> and <ArticleCode>azp</ArticleCode> carry the same value or <ArticleCode>azp</ArticleCode> is
          absent. They differ when one client obtains a token meant for another: Google's sign-in for mobile apps, for
          example, can issue an ID token whose <ArticleCode>aud</ArticleCode> is the backend's client ID while
          <ArticleCode>azp</ArticleCode> is the Android or iOS app's client ID. The latest OIDC Core errata treats
          <ArticleCode>azp</ArticleCode> as belonging to extensions and says clients may ignore it otherwise.
        </ArticleP>
        <ArticleP>
          In access tokens, providers use <ArticleCode>azp</ArticleCode> to record which client obtained the token, while
          <ArticleCode>aud</ArticleCode> names the API. Keycloak and Microsoft Entra ID (v2.0 tokens) both do this; RFC 9068
          standardises the same idea as <ArticleCode>client_id</ArticleCode>. The practical rule: your API validates
          <ArticleCode>aud</ArticleCode> to decide whether to accept the token, and may additionally check
          <ArticleCode>azp</ArticleCode> or <ArticleCode>client_id</ArticleCode> if only certain client applications are allowed to call it.
          Never accept a token because <ArticleCode>azp</ArticleCode> matches while <ArticleCode>aud</ArticleCode> does not.
        </ArticleP>

        <ArticleH2 id="jwt-invalid-audience">JWT Invalid Audience: Causes and Fixes</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>ID token sent to an API.</strong> An ID token's <ArticleCode>aud</ArticleCode> is the client ID, not your API. The client should send the access token. See <a href="/jwt-in-oauth2-and-openid-connect" className={link}>JWTs in OAuth 2.0 and OIDC</a>.</ArticleLi>
          <ArticleLi><strong>No audience requested.</strong> Some providers only put your API in <ArticleCode>aud</ArticleCode> if the client asks for it: Auth0 needs the <ArticleCode>audience</ArticleCode> parameter on the authorisation request, and Entra ID needs a scope belonging to your API, such as <ArticleCode>api://&lt;app-id&gt;/access</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Two spellings of the same API.</strong> Entra ID v2.0 access tokens always carry the API's client ID (a GUID) in <ArticleCode>aud</ArticleCode>, while v1.0 tokens can carry the App ID URI instead. Accept exactly the values your API really receives.</ArticleLi>
          <ArticleLi><strong>Trailing slash or scheme mismatch.</strong> <ArticleCode>https://api.example.com</ArticleCode> and <ArticleCode>https://api.example.com/</ArticleCode> are different strings.</ArticleLi>
          <ArticleLi><strong>Environment mix-up.</strong> A staging token presented to production carries the staging API identifier.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The <a href="/common-jwt-errors-and-fixes#wrong-audience" className={link}>wrong audience section</a> of the errors guide
          lists the messages from other libraries and frameworks.
        </ArticleP>

        <ArticleH2 id="keycloak-jwt-audience">Keycloak JWT Audience</ArticleH2>
        <ArticleP>
          Keycloak is a frequent source of audience confusion. Out of the box, a user's access token often has
          <ArticleCode>"aud": "account"</ArticleCode>, because the default realm roles include roles on Keycloak's own
          <ArticleCode>account</ArticleCode> client, and Keycloak adds a client to <ArticleCode>aud</ArticleCode> when the token
          carries its roles. Your API's client ID appears in <ArticleCode>azp</ArticleCode> if it was the client that requested
          the token, but not necessarily in <ArticleCode>aud</ArticleCode>.
        </ArticleP>
        <ArticleP>
          The fix is to add an <strong>Audience</strong> protocol mapper, either on the client or on a client scope assigned to
          it, with <strong>Included Client Audience</strong> set to your API's client (or <strong>Included Custom
          Audience</strong> set to an arbitrary identifier) and "Add to access token" enabled. Then configure your API to
          require that value. Resist the temptation to validate against <ArticleCode>account</ArticleCode> or to switch the
          check off; every client in the realm can obtain a token with that audience.
        </ArticleP>

        <ArticleH2 id="choosing-audience-values">Choosing Audience Values</ArticleH2>
        <ArticleUl>
          <ArticleLi>Give each API (resource server) its own identifier. Sharing one audience across services means a token for any of them works on all of them.</ArticleLi>
          <ArticleLi>Use a stable URI such as <ArticleCode>https://orders.example.com</ArticleCode>. It does not have to resolve; it only has to be unique and agreed.</ArticleLi>
          <ArticleLi>Keep multi-audience tokens rare. Each extra audience is another service that can replay the token. For service-to-service calls, token exchange (RFC 8693) lets a service swap a token for one scoped to the next hop.</ArticleLi>
          <ArticleLi>Validate audience in every service, not just at the gateway, if services can be reached directly. The <a href="/jwt-in-microservices" className={link}>JWTs in microservices guide</a> covers this layout.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Audience answers "is this token for me?". Whether the caller may perform a particular action is a separate question,
          answered by scopes or roles; see <a href="/jwt-scopes-vs-roles" className={link}>JWT scopes vs roles</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          <ArticleCode>aud</ArticleCode> (RFC 7519 §4.1.3) names the intended recipients of a JWT, as a string or an array of
          strings, and a recipient must reject a token that does not list it. <ArticleCode>iss</ArticleCode> says who issued the
          token, <ArticleCode>sub</ArticleCode> who it is about, and <ArticleCode>azp</ArticleCode> or <ArticleCode>client_id</ArticleCode> which
          client obtained it. Always pass the audience option (<ArticleCode>audience</ArticleCode> in jsonwebtoken, jose and
          PyJWT), give each API a unique identifier, and fix invalid audience errors by requesting the right token rather than
          disabling the check.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
