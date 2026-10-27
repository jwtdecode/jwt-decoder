import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWTs in OAuth 2.0 and OpenID Connect',
  description: 'How JWTs function within OAuth 2.0 and OpenID Connect, token types, ID tokens vs access tokens, the discovery endpoint, JWKS verification, and how major identity providers use JWTs.',
  url: 'https://jwtdecode.app/jwt-in-oauth2-and-openid-connect',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-in-oauth2-and-openid-connect',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-05-05',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function JwtInOauth2AndOidcPage() {
  return (
    <>
      <SEOHead
        title="JWTs in OAuth 2.0 and OpenID Connect"
        description="How JWTs function within OAuth 2.0 and OpenID Connect — ID tokens vs access tokens, JWKS, discovery, nonce, at_hash, and provider token shapes."
        path="/jwt-in-oauth2-and-openid-connect"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWTs in OAuth 2.0 and OIDC' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-05-05"
        relatedLinks={[
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Reference for all standard registered claims.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How to verify signatures and validate claims.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Algorithm choices for JWT signing.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Security checklist for JWT-based systems.' },
        ]}
      >
        <ArticleH1>JWTs in OAuth 2.0 and OpenID Connect</ArticleH1>

        <ArticleIntroBox>
          OAuth 2.0 is an authorization framework; OpenID Connect (OIDC) is an identity layer built
          on top of it. Together they define how applications obtain tokens, what those tokens mean,
          and how they should be verified. JWTs are the token format that makes OIDC work, the
          ID token is always a JWT, and most modern access tokens are JWTs too. Understanding where
          JWTs fit in these protocols is essential for integrating with any modern identity provider.
        </ArticleIntroBox>

        <ArticleH2 id="oauth2-overview">OAuth 2.0 Token Types</ArticleH2>
        <ArticleP>
          OAuth 2.0 defines three token types, each with a different purpose and lifetime:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Access token:</strong> A credential that grants access to a protected resource.
            Presented to the resource server (your API) on every request. Short-lived (minutes to
            hours). In modern deployments, usually a JWT.
          </ArticleLi>
          <ArticleLi>
            <strong>Refresh token:</strong> A credential used to obtain new access tokens without
            re-authenticating the user. Long-lived (days to weeks). Almost always an opaque random
            string, not a JWT, because it is stored server-side and benefits from revocability.
          </ArticleLi>
          <ArticleLi>
            <strong>Authorization code:</strong> A short-lived, single-use code issued by the
            authorization server after the user logs in. Exchanged for access and <a href="/jwt-refresh-token-pattern" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">refresh tokens</a>
            via a POST request. Not a JWT, it is an opaque value that is only valid for one exchange.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          OAuth 2.0 itself says nothing about the format of access tokens, they can be opaque
          strings or JWTs. The resource server must be able to validate them, but the spec leaves
          the mechanism open. In practice, modern identity providers issue JWT access tokens
          because they can be validated locally without calling back to the auth server.
        </ArticleP>

        <ArticleH2 id="oidc-id-token">OpenID Connect and the ID Token</ArticleH2>
        <ArticleP>
          OpenID Connect adds an <strong>ID token</strong> to the OAuth 2.0 flow. The ID token is
          always a JWT and it carries identity claims about the authenticated user:
        </ArticleP>
        <ArticlePre>{`// Typical OIDC ID token payload
{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",        // unique, stable user ID
  "aud": "my-client-id.apps.googleusercontent.com",
  "exp": 1716480961,
  "iat": 1716477361,
  "nonce": "abc123def456",              // replay protection
  "email": "jane@example.com",
  "email_verified": true,
  "name": "Jane Developer",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "Jane",
  "family_name": "Developer",
  "locale": "en-GB",
  "at_hash": "HK6E_P6Dh8Y93mRNtsDB1Q"  // access token hash
}`}</ArticlePre>
        <ArticleP>
          The ID token is meant for the <em>client application</em>, to establish who the user is.
          It is not meant to be sent to the resource server (API). The access token is what gets
          sent to the API. Mixing these up is a common mistake.
        </ArticleP>

        <ArticleH3>ID token vs access token, what goes where</ArticleH3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Property</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">ID token</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Access token</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ['Format', 'Always JWT (OIDC spec mandates this)', 'JWT or opaque (provider-dependent)'],
                ['Purpose', 'Authenticate the user to the client app', 'Authorize requests to the resource server'],
                ['Audience (aud)', 'The client_id of the application', 'The API / resource server identifier'],
                ['Who reads it', 'The client application', 'The resource server (API)'],
                ['Sent to API?', 'No, never send ID tokens to APIs', 'Yes, in Authorization: Bearer header'],
                ['Contains PII?', 'Yes, name, email, profile claims', 'Minimal, sub, scope, permissions'],
                ['Typical lifetime', 'Short (1 hour)', 'Short (5 minutes to 1 hour)'],
              ].map(([prop, id, access]) => (
                <tr key={prop as string} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{prop}</td>
                  <td className="py-2 px-3">{id}</td>
                  <td className="py-2 px-3">{access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleCallout type="danger">
          Never send an ID token to an API in the Authorization header. ID tokens have your
          application's <ArticleCode>client_id</ArticleCode> as the audience, any API that
          validates the <ArticleCode>aud</ArticleCode> claim will reject it. Sending ID tokens
          to APIs is also a security risk if the API does not validate the audience, as it may
          accept tokens containing sensitive PII that were never intended for it.
        </ArticleCallout>

        <ArticleH2 id="nonce-at-hash">nonce and at_hash: Anti-Replay and Token Binding</ArticleH2>
        <ArticleH3>nonce</ArticleH3>
        <ArticleP>
          The <ArticleCode>nonce</ArticleCode> claim is a string value set by the client in the
          initial authorization request. The authorization server echoes it back in the ID token.
          The client verifies that the <ArticleCode>nonce</ArticleCode> in the ID token matches
          the value it sent, preventing replay attacks where an attacker intercepts and reuses
          a previously issued ID token.
        </ArticleP>
        <ArticlePre>{`// Client generates a random nonce and stores it
const nonce = generateRandomString(32)
sessionStorage.setItem('auth_nonce', nonce)

// Nonce is included in the authorization request
GET /authorize?
  response_type=code
  &client_id=my-app
  &nonce=<nonce>
  ...

// After receiving the ID token, verify the nonce
const storedNonce = sessionStorage.getItem('auth_nonce')
if (idTokenPayload.nonce !== storedNonce) {
  throw new Error('Nonce mismatch, possible replay attack')
}
sessionStorage.removeItem('auth_nonce')  // one-time use`}</ArticlePre>
        <ArticleH3>at_hash</ArticleH3>
        <ArticleP>
          The <ArticleCode>at_hash</ArticleCode> (access token hash) claim binds the ID token to
          a specific access token. It is computed as the base64url encoding of the left half of
          the SHA-256 hash of the ASCII representation of the access token:
        </ArticleP>
        <ArticlePre>{`// at_hash verification (pseudocode)
const hash = sha256(accessToken)           // full 32-byte hash
const leftHalf = hash.slice(0, 16)         // first 16 bytes
const atHash = base64url(leftHalf)

if (idToken.at_hash !== atHash) {
  throw new Error('Access token does not match ID token')
}`}</ArticlePre>
        <ArticleP>
          Verifying <ArticleCode>at_hash</ArticleCode> confirms that the access token and ID token
          were issued together in the same authorization response. This prevents an attacker from
          substituting a different access token obtained from another flow.
        </ArticleP>

        <ArticleH2 id="discovery">The Discovery Endpoint</ArticleH2>
        <ArticleP>
          OIDC providers publish a <strong>discovery document</strong> at a standardised URL:
          <ArticleCode>{`{issuer}/.well-known/openid-configuration`}</ArticleCode>. This JSON
          document describes the provider's capabilities and the URLs of all its endpoints,
          including the <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS endpoint</a>:
        </ArticleP>
        <ArticlePre>{`// Example: GET https://accounts.google.com/.well-known/openid-configuration
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "response_types_supported": ["code", "token", "id_token", ...],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "email", "profile"],
  ...
}`}</ArticlePre>
        <ArticleP>
          The <ArticleCode>jwks_uri</ArticleCode> value tells you exactly where to fetch the public
          keys for verifying tokens from this provider. Your JWT library or OIDC SDK should fetch
          this document automatically. When integrating manually, use the <ArticleCode>jwks_uri</ArticleCode>{' '}
          from the discovery document rather than hardcoding a key URL, it can change.
        </ArticleP>

        <ArticleH2 id="jwks-verification">Connecting the Discovery Document to Token Verification</ArticleH2>
        <ArticleP>
          The complete verification flow for an OIDC token uses all three of: the discovery document,
          the JWKS endpoint, and the token's <ArticleCode>kid</ArticleCode> header:
        </ArticleP>
        <ArticlePre>{`// Step 1: Fetch the discovery document (cache this, it rarely changes)
const discovery = await fetch(
  'https://accounts.google.com/.well-known/openid-configuration'
).then(r => r.json())

// Step 2: Fetch the JWKS from the jwks_uri (cache with HTTP headers)
const jwks = await fetch(discovery.jwks_uri).then(r => r.json())

// Step 3: Decode the token header to get the kid
const { kid } = decodeHeader(token)

// Step 4: Find the matching key in JWKS by kid
const signingKey = jwks.keys.find(key => key.kid === kid)
if (!signingKey) {
  // Unknown kid, refresh JWKS cache and try again before rejecting
  throw new Error('Unknown key ID')
}

// Step 5: Verify the token using the matching public key
const payload = jwt.verify(token, publicKeyFromJwk(signingKey), {
  algorithms: ['RS256'],
  issuer: discovery.issuer,
  audience: 'my-client-id',
})`}</ArticlePre>

        <ArticleH2 id="provider-shapes">Token Shapes from Major Identity Providers</ArticleH2>
        <ArticleP>
          Each identity provider structures its tokens slightly differently. These examples show
          representative access token payloads from popular providers:
        </ArticleP>
        <ArticleH3>Auth0</ArticleH3>
        <ArticlePre>{`{
  "iss": "https://your-tenant.auth0.com/",
  "sub": "auth0|5f7d9c8b2a1e3f4d5e6f7a8b",
  "aud": ["https://your-api.example.com", "https://your-tenant.auth0.com/userinfo"],
  "iat": 1716477361,
  "exp": 1716480961,
  "azp": "your-client-id",
  "scope": "openid profile email read:posts",
  "permissions": ["read:posts", "write:posts"]
}`}</ArticlePre>
        <ArticleH3>AWS Cognito</ArticleH3>
        <ArticlePre>{`{
  "sub": "aaaa1111-bbbb-2222-cccc-3333dddd4444",
  "iss": "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_AbCdEfGhI",
  "client_id": "1a2b3c4d5e6f7g8h9i0j",
  "origin_jti": "aaaa1111-2222-3333-4444-5555bbbbcccc",
  "token_use": "access",
  "scope": "phone openid profile email",
  "auth_time": 1716477361,
  "exp": 1716480961,
  "iat": 1716477361,
  "jti": "aaaa1111-...",
  "username": "jane@example.com"
}`}</ArticlePre>
        <ArticleH3>Okta</ArticleH3>
        <ArticlePre>{`{
  "ver": 1,
  "jti": "AT.abc123",
  "iss": "https://your-org.okta.com/oauth2/default",
  "aud": "api://default",
  "iat": 1716477361,
  "exp": 1716480961,
  "cid": "your-client-id",
  "uid": "00u1aaabbb2CcDdEeFF3",
  "sub": "jane@example.com",
  "scp": ["openid", "profile", "email"]
}`}</ArticlePre>
        <ArticleP>
          Each provider uses slightly different claim names and structures. Auth0 uses{' '}
          <ArticleCode>permissions</ArticleCode> for fine-grained permissions, Okta uses{' '}
          <ArticleCode>scp</ArticleCode> (an array) instead of <ArticleCode>scope</ArticleCode>{' '}
          (a space-delimited string), and <a href="/validate-aws-cognito-jwt" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">Cognito</a> uses <ArticleCode>token_use</ArticleCode> to
          distinguish access tokens from ID tokens. Always consult your provider's documentation
          for the exact claim names your application should read.
        </ArticleP>

        <ArticleH2 id="scopes">OAuth 2.0 Scopes and What They Appear in Tokens</ArticleH2>
        <ArticleP>
          OAuth 2.0 <a href="/jwt-scopes-vs-roles" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">scopes</a> represent the permissions the client is requesting. They appear in
          the access token as a <ArticleCode>scope</ArticleCode> claim (space-delimited string in
          most providers) and determine what data the client can access:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>openid:</strong> Required for OIDC flows. Causes an ID token to be returned
            alongside the access token.
          </ArticleLi>
          <ArticleLi>
            <strong>profile:</strong> Returns the user's name, locale, picture, and other profile claims
            in the ID token.
          </ArticleLi>
          <ArticleLi>
            <strong>email:</strong> Returns <ArticleCode>email</ArticleCode> and{' '}
            <ArticleCode>email_verified</ArticleCode> in the ID token.
          </ArticleLi>
          <ArticleLi>
            <strong>offline_access:</strong> Requests a refresh token (not all providers support this scope;
            some issue refresh tokens by default based on configuration).
          </ArticleLi>
          <ArticleLi>
            <strong>Custom API scopes</strong> (e.g., <ArticleCode>read:orders</ArticleCode>,{' '}
            <ArticleCode>write:profile</ArticleCode>): Application-defined scopes registered with the
            identity provider. They appear in the access token and the resource server uses them
            for authorization decisions.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          The client requests scopes in the authorization URL. The user may be shown a consent
          screen listing the permissions being requested. The identity provider includes only the
          approved scopes in the issued token.
        </ArticleP>
        <ArticleCallout type="info">
          Scopes control what the client app can do on behalf of the user. They are not a substitute
          for server-side authorization logic. Always verify that the token's scope includes the
          required permission before serving a protected endpoint, and never grant a scope to a
          client that should not have access to that functionality.
        </ArticleCallout>
      </ArticleLayout>
    </>
  );
}
