import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Scopes vs Roles: Scope, scp, roles and permissions Claims for Authorisation',
  description: 'The difference between scopes and roles in JWTs: the scope claim format from RFC 8693 and RFC 9068, scp in Entra ID and Okta, roles and permissions claims in Keycloak and Auth0, naming conventions, and how to design role-based authorisation.',
  url: 'https://jwtdecode.app/jwt-scopes-vs-roles',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-scopes-vs-roles',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const COMPARE: [aspect: string, scopes: string, roles: string][] = [
  ['Answers', 'What has this client been allowed to do on the user\'s behalf?', 'What is this user (or app) allowed to do in this system?'],
  ['Granted by', 'The user\'s consent or the client\'s registration', 'An administrator assigning roles or groups'],
  ['Applies to', 'The client application, for this token', 'The subject, across every client they use'],
  ['Standard claim', 'scope (RFC 8693 §4.2, used by RFC 9068)', 'None universal; RFC 9068 suggests roles / groups / entitlements'],
  ['Typical values', 'read:orders, orders.write, api://app/access', 'admin, support-agent, billing-manager'],
];

const PROVIDERS: [provider: string, scopeClaim: string, roleClaim: string][] = [
  ['RFC 9068 / generic OAuth', 'scope: space-delimited string', 'roles, groups or entitlements (optional)'],
  ['Microsoft Entra ID', 'scp: space-delimited string (user tokens)', 'roles: array (app roles; also app permissions in client credentials tokens)'],
  ['Okta', 'scp: array', 'Custom claim such as groups, configured by you'],
  ['Auth0', 'scope: space-delimited string', 'permissions: array (with RBAC and "Add Permissions in the Access Token")'],
  ['Keycloak', 'scope: space-delimited string', 'realm_access.roles and resource_access.<client>.roles'],
  ['AWS Cognito', 'scope: space-delimited string (access token)', 'cognito:groups: array'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtScopesVsRolesPage() {
  return (
    <>
      <SEOHead
        title="JWT Scopes vs Roles: Claims for Authorisation"
        description="JWT scopes vs roles: scopes limit what a client may do for a user, roles describe what the user may do. Scope, scp, roles and permissions claims compared."
        path="/jwt-scopes-vs-roles"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Scopes vs Roles' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-audience-claim', label: 'JWT aud Claim', description: 'Audience decides whether the token is for you at all.' },
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Registered, public and private claims and how to use them.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'Where scopes come from in the OAuth flows.' },
          { to: '/jwt-size-limit', label: 'JWT Size Limit', description: 'What happens when role and group claims make tokens too large.' },
        ]}
      >
        <ArticleH1>JWT Scopes vs Roles: Scope, scp, roles and permissions Claims for Authorisation</ArticleH1>

        <ArticleIntroBox>
          Scopes and roles both end up as claims in a JWT, but they answer different questions. A <strong>scope</strong> limits
          what a <em>client application</em> may do on a user's behalf, and is usually granted by the user's consent: a
          calendar app may read your calendar but not delete it. A <strong>role</strong> describes what the <em>user</em> is
          allowed to do in the system, assigned by an administrator: an admin may delete anything. In a token, scopes normally
          appear as a space-delimited <ArticleCode>scope</ArticleCode> string (RFC 8693 §4.2, used by RFC 9068 for access
          tokens), though some providers use <ArticleCode>scp</ArticleCode>. Roles have no single standard claim. An API that
          handles delegated access should check both: the client must hold the scope, and the user must hold the role.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-scopes-vs-roles">JWT Scopes vs Roles: The Difference</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold"></th>
                <th className="px-3 py-2 font-semibold">Scopes</th>
                <th className="px-3 py-2 font-semibold">Roles</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {COMPARE.map(([aspect, scopes, roles]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{scopes}</td>
                  <td className="px-3 py-2">{roles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          The two combine as an intersection. If a user with the <ArticleCode>admin</ArticleCode> role signs in to a
          read-only reporting tool that was only granted <ArticleCode>orders:read</ArticleCode>, the token should not let
          that tool delete orders, even though the user could. Conversely, a client granted
          <ArticleCode>orders:write</ArticleCode> cannot write orders for a user whose role does not allow it. Scopes stop
          over-privileged clients; roles stop over-privileged users.
        </ArticleP>
        <ArticleP>
          In a client credentials flow there is no user, so the "role" question collapses into the client's own
          permissions. Some providers express those as scopes; Microsoft Entra ID puts them in <ArticleCode>roles</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="jwt-scope-claim">JWT Scope Claim and Its Format</ArticleH2>
        <ArticleP>
          OAuth 2.0 defines scope in requests and responses as a list of space-delimited, case-sensitive strings (RFC 6749
          §3.3). RFC 8693 §4.2 registered <ArticleCode>scope</ArticleCode> as a JWT claim with the same format: a single JSON
          string, space-separated, not an array. RFC 9068, the profile for JWT access tokens, says tokens issued in response
          to a request with a scope parameter should include this claim.
        </ArticleP>
        <ArticleH3 id="jwt-scope-claim-example">JWT scope claim example</ArticleH3>
        <ArticlePre>{`{
  "iss": "https://login.example.com/",
  "sub": "user_8412",
  "aud": "https://api.example.com",
  "client_id": "reporting-dashboard",
  "scope": "openid orders:read invoices:read",
  "exp": 1790284151,
  "iat": 1790283251,
  "jti": "5c3a1f0e-6b1d-4e0a-9f3a-2d1b7c8e9a10"
}`}</ArticlePre>
        <ArticleP>
          Two formats you will meet in the wild: Microsoft Entra ID uses <ArticleCode>scp</ArticleCode> as a space-separated
          string in user tokens, and Okta uses <ArticleCode>scp</ArticleCode> as a JSON array. Code that reads scopes should
          normalise, rather than assume:
        </ArticleP>
        <ArticlePre>{`function getScopes(payload) {
  const raw = payload.scope ?? payload.scp ?? [];
  return new Set(Array.isArray(raw) ? raw : String(raw).split(' ').filter(Boolean));
}

function requireScope(payload, needed) {
  if (!getScopes(payload).has(needed)) {
    // RFC 6750 §3.1: respond 403 with error="insufficient_scope"
    throw Object.assign(new Error('insufficient_scope'), { status: 403 });
  }
}`}</ArticlePre>
        <ArticleP>
          Never check scopes with a substring match. <ArticleCode>payload.scope.includes('orders')</ArticleCode> is true for
          <ArticleCode>orders:read</ArticleCode> and for <ArticleCode>no-orders</ArticleCode>; split and compare whole values.
        </ArticleP>

        <ArticleH2 id="jwt-roles-claim">JWT Roles Claim</ArticleH2>
        <ArticleP>
          There is no registered <ArticleCode>roles</ArticleCode> claim in RFC 7519. RFC 9068 §2.2.3.1 recommends that an
          authorisation server wanting to include roles, groups or entitlements use the <ArticleCode>roles</ArticleCode>,
          <ArticleCode>groups</ArticleCode> and <ArticleCode>entitlements</ArticleCode> attribute names from the SCIM core schema
          (RFC 7643). In practice each provider has its own shape:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Provider</th>
                <th className="px-3 py-2 font-semibold">Scope claim</th>
                <th className="px-3 py-2 font-semibold">Role / permission claim</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {PROVIDERS.map(([provider, scopeClaim, roleClaim]) => (
                <tr key={provider} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{provider}</td>
                  <td className="px-3 py-2">{scopeClaim}</td>
                  <td className="px-3 py-2">{roleClaim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticlePre>{`// Keycloak access token (trimmed)
{
  "azp": "orders-ui",
  "scope": "openid profile email",
  "realm_access":    { "roles": ["offline_access", "support-agent"] },
  "resource_access": { "orders-api": { "roles": ["refund"] } }
}

// Microsoft Entra ID v2.0 access token (trimmed)
{
  "aud": "6e74172b-be56-4843-9ff4-e66a39bb12e3",
  "scp": "Orders.Read Orders.Write",
  "roles": ["Orders.Admin"]
}`}</ArticlePre>
        <ArticleP>
          Custom role claims are private claims. If you add your own, avoid collisions by namespacing them, for example
          <ArticleCode>https://example.com/roles</ArticleCode>; Auth0's documentation recommends namespaced names for
          custom claims. The <a href="/jwt-claims-explained" className={link}>claims guide</a> explains registered,
          public and private claims.
        </ArticleP>

        <ArticleH2 id="jwt-roles-and-permissions">JWT Roles and Permissions</ArticleH2>
        <ArticleP>
          A <strong>role</strong> is a named bundle (<ArticleCode>support-agent</ArticleCode>); a <strong>permission</strong> is a
          single action (<ArticleCode>orders:refund</ArticleCode>). You can put either in the token. Auth0's RBAC feature, for
          example, can emit a <ArticleCode>permissions</ArticleCode> array: enable RBAC on the API and turn on "Add
          Permissions in the Access Token", and the token lists every permission granted to the user through their roles.
          Auth0's own Express sample checks it like this:
        </ArticleP>
        <ArticlePre>{`import { auth, claimIncludes, requiredScopes } from 'express-oauth2-jwt-bearer';

app.use(auth({ issuerBaseURL: 'https://YOUR_TENANT.auth0.com', audience: 'https://api.example.com' }));

// Delegated check against the space-delimited "scope" claim
app.get('/orders', requiredScopes('read:orders'), listOrders);

// User permission check against the "permissions" array
app.post('/orders/:id/refund', claimIncludes('permissions', 'refund:orders'), refundOrder);`}</ArticlePre>
        <ArticleP>
          Putting permissions in the token makes the API simpler (no lookup) but makes the token larger and freezes the
          permissions until it expires. Putting roles in the token and mapping them to permissions in the API keeps the
          token small and lets you change what a role can do with a deploy. Either works; mapping in the API is easier to
          evolve.
        </ArticleP>

        <ArticleH2 id="jwt-scopes-machine-to-machine">Scopes and Roles in Machine-to-Machine Tokens</ArticleH2>
        <ArticleP>
          Service-to-service calls using the client credentials grant (RFC 6749 §4.4) have no user, so there is no consent
          step and no user role. Whatever the token carries describes the calling service itself, and the
          <ArticleCode>sub</ArticleCode> is typically the client ID. Providers differ in where they put those permissions.
          Auth0, Okta, Keycloak and Cognito express them as scopes granted to the client, so your API sees a
          <ArticleCode>scope</ArticleCode> (or <ArticleCode>scp</ArticleCode>) claim just as it would for a user token. Microsoft
          Entra ID instead puts application permissions in the <ArticleCode>roles</ArticleCode> claim and omits
          <ArticleCode>scp</ArticleCode>, which is why an Entra-protected API often needs two checks: <ArticleCode>scp</ArticleCode> for
          delegated calls and <ArticleCode>roles</ArticleCode> for app-only calls.
        </ArticleP>
        <ArticleP>
          Decide up front whether an endpoint should be reachable by services at all. A policy that only reads
          <ArticleCode>scope</ArticleCode> may accidentally grant a background job the same power as a signed-in
          administrator, or refuse it entirely. Naming machine-only permissions distinctly (for example
          <ArticleCode>orders:sync</ArticleCode>) makes the intent visible in both the token and the code, and the
          <a href="/jwt-in-microservices" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> microservices guide</a> covers how to propagate identity across service hops.
        </ArticleP>

        <ArticleH2 id="jwt-claims-vs-scopes">JWT Claims vs Scopes</ArticleH2>
        <ArticleP>
          "Claims" is the general term: every name/value pair in the payload is a claim, including <ArticleCode>scope</ArticleCode>.
          The confusion comes from OpenID Connect, where requesting a scope such as <ArticleCode>profile</ArticleCode> or
          <ArticleCode>email</ArticleCode> causes a set of claims (<ArticleCode>name</ArticleCode>, <ArticleCode>email</ArticleCode>,
          <ArticleCode>email_verified</ArticleCode>) to be returned. In that sense a scope is a request, and claims are what
          you receive. In an access token, the <ArticleCode>scope</ArticleCode> claim then records which scopes were granted.
        </ArticleP>

        <ArticleH2 id="jwt-scope-vs-audience">JWT Scope vs Audience</ArticleH2>
        <ArticleP>
          <ArticleCode>aud</ArticleCode> says which API the token is for; <ArticleCode>scope</ArticleCode> says what the token
          allows at that API. Check audience first. A token with <ArticleCode>scope: "orders:write"</ArticleCode> issued for a
          different API must be rejected outright, not authorised against your scope names, because scope strings mean
          nothing outside the audience they were issued for. RFC 9068 makes the same point: scopes in the token are meaningful
          only for the resources in <ArticleCode>aud</ArticleCode>. The <a href="/jwt-audience-claim" className={link}>audience claim guide</a> covers
          validation in detail.
        </ArticleP>

        <ArticleH2 id="jwt-scope-naming-convention">JWT Scope Naming Conventions</ArticleH2>
        <ArticleP>
          RFC 6749 only restricts scope tokens to printable ASCII without spaces, double quotes or backslashes. The rest is
          convention. Common styles:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>action:resource</strong>, e.g. <ArticleCode>read:orders</ArticleCode>. Used in Auth0 examples.</ArticleLi>
          <ArticleLi><strong>resource:action</strong>, e.g. <ArticleCode>orders:read</ArticleCode>. Groups naturally when sorted.</ArticleLi>
          <ArticleLi><strong>Resource.Action</strong>, e.g. <ArticleCode>Orders.Read</ArticleCode>, <ArticleCode>User.Read</ArticleCode>. The Microsoft Graph style.</ArticleLi>
          <ArticleLi><strong>URL scopes</strong>, e.g. <ArticleCode>https://www.googleapis.com/auth/calendar.readonly</ArticleCode>. Globally unique, verbose.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Pick one style and keep it. Make scopes coarse enough that a consent screen makes sense to a human
          (<ArticleCode>orders:read</ArticleCode>, not <ArticleCode>orders:read:line-items:v2</ArticleCode>), and avoid
          scopes that encode a specific user or record, which belong in claims or in your database instead.
        </ArticleP>

        <ArticleH2 id="jwt-role-based-authorization">JWT Role-Based Authorisation: Design Guidance</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Verify first, authorise second.</strong> Only read scopes and roles from a token whose signature, <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode> and <ArticleCode>exp</ArticleCode> have been validated. A decoded but unverified token is just user input; see <a href="/jwt-decoder-vs-jwt-validator" className={link}>decoder vs validator</a>.</ArticleLi>
          <ArticleLi><strong>Return the right status.</strong> Invalid or expired token: 401. Valid token lacking a scope or role: 403, with <ArticleCode>error="insufficient_scope"</ArticleCode> in <ArticleCode>WWW-Authenticate</ArticleCode> for OAuth APIs (RFC 6750 §3.1).</ArticleLi>
          <ArticleLi><strong>Keep tokens small.</strong> Dozens of roles or hundreds of group IDs push tokens past header limits. Entra ID already replaces the <ArticleCode>groups</ArticleCode> claim with an overage pointer above 200 groups in a JWT. See <a href="/jwt-size-limit" className={link}>JWT size limits</a>.</ArticleLi>
          <ArticleLi><strong>Remember staleness.</strong> Roles in a token are a snapshot from issue time. Revoking a role takes effect only when the token expires, so keep access token lifetimes short or check critical permissions server-side.</ArticleLi>
          <ArticleLi><strong>Do not trust the client for roles.</strong> The client never decides roles; they come from the issuer and are protected by the signature.</ArticleLi>
          <ArticleLi><strong>Object-level checks still live in your code.</strong> A role says "support agents may refund orders", not "this agent may refund this order". Tenancy and ownership checks cannot be expressed in a token.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="info">
          When a request gets a 403 and you are not sure why, decode the access token in the <a href="/" className={link}>jwtdecode.app decoder</a> (it
          runs locally in your browser) and compare the actual <ArticleCode>scope</ArticleCode>, <ArticleCode>scp</ArticleCode> or role claim with the
          name your policy reads. A renamed or missing claim is the usual answer. The <a href="/how-to-debug-a-jwt" className={link}>JWT debugging
          routine</a> covers the rest.
        </ArticleCallout>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Scopes limit what a client may do on a user's behalf; roles and permissions describe what the user may do. The
          standard scope claim is a space-delimited <ArticleCode>scope</ArticleCode> string (RFC 8693 §4.2, RFC 9068), with
          <ArticleCode>scp</ArticleCode> used by Entra ID (string) and Okta (array). Roles have no universal claim:
          Entra ID uses <ArticleCode>roles</ArticleCode>, Keycloak <ArticleCode>realm_access</ArticleCode> and
          <ArticleCode>resource_access</ArticleCode>, Auth0 a <ArticleCode>permissions</ArticleCode> array, Cognito
          <ArticleCode>cognito:groups</ArticleCode>. Validate the token and its audience first, normalise scope formats, compare
          whole values, return 403 for missing permissions, and keep fine-grained and object-level decisions in your API.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
