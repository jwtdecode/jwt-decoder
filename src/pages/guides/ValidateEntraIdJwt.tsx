import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Azure AD JWT Token Validation: Validating Microsoft Entra ID Access Tokens',
  description: 'How to validate Azure AD (Microsoft Entra ID) JWTs: v1 vs v2 issuers, aud, tid, oid vs sub, scp vs roles, OpenID discovery and JWKS, why Graph tokens are off limits, and APIM validate-jwt policies.',
  url: 'https://jwtdecode.app/validate-azure-entra-id-jwt',
  mainEntityOfPage: 'https://jwtdecode.app/validate-azure-entra-id-jwt',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const VERSIONS: [item: string, v1: string, v2: string][] = [
  ['ver claim', '"1.0"', '"2.0"'],
  ['iss', 'https://sts.windows.net/{tenant-id}/', 'https://login.microsoftonline.com/{tenant-id}/v2.0'],
  ['aud', 'Client ID or the App ID URI (e.g. api://...), depending on the request', 'Always the API\'s client ID (GUID)'],
  ['Client application', 'appid, appidacr', 'azp, azpacr'],
  ['Username', 'unique_name, upn', 'preferred_username'],
  ['Header key IDs', 'kid and x5t', 'kid only'],
  ['OIDC metadata', 'login.microsoftonline.com/{tenant}/.well-known/openid-configuration', 'login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration'],
];

const ERRORS: [message: string, meaning: string][] = [
  ['IDX10214: Audience validation failed', 'aud is the client ID but you configured the App ID URI (or the reverse), or the token is for another API such as Graph'],
  ['IDX10205: Issuer validation failed', 'v1 token (sts.windows.net) checked against a v2 issuer, or a multi-tenant app expecting one tenant'],
  ['IDX10503 / IDX10511: Signature validation failed', 'Keys fetched from the wrong metadata document, a Graph token, or a token from another cloud or tenant'],
  ['IDX10223: Lifetime validation failed. The token is expired', 'Expired token or clock drift; clients should refresh silently through MSAL'],
];

export default function ValidateEntraIdJwtPage() {
  return (
    <>
      <SEOHead
        title="Azure AD JWT Token Validation (Entra ID)"
        description="Azure AD JWT token validation for Entra ID access tokens: v1 vs v2 issuers, aud, tid, oid vs sub, scp vs roles, JWKS discovery and APIM validate-jwt."
        path="/validate-azure-entra-id-jwt"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Validate Entra ID JWTs' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-authentication-aspnet-core', label: 'JWT in ASP.NET Core', description: 'AddJwtBearer, claim mapping and roles on .NET.' },
          { to: '/jwt-audience-claim', label: 'The aud Claim', description: 'Why audience validation stops token reuse across APIs.' },
          { to: '/jwt-scopes-vs-roles', label: 'Scopes vs Roles', description: 'Delegated scopes (scp) versus app roles (roles).' },
          { to: '/validate-aws-cognito-jwt', label: 'Validate Cognito JWTs', description: 'The same exercise for Amazon Cognito tokens.' },
        ]}
      >
        <ArticleH1>Azure AD JWT Token Validation: Validating Microsoft Entra ID Access Tokens</ArticleH1>

        <ArticleIntroBox>
          To validate an Azure AD (Microsoft Entra ID) access token, your API reads the OpenID Connect metadata for
          the token's version, for example
          <ArticleCode>https://login.microsoftonline.com/{'{tenant}'}/v2.0/.well-known/openid-configuration</ArticleCode>.
          From it, the API verifies the RS256 signature against the key in <ArticleCode>jwks_uri</ArticleCode> that
          matches the token's <ArticleCode>kid</ArticleCode>. It then checks that <ArticleCode>iss</ArticleCode> matches
          the tenant (<ArticleCode>https://login.microsoftonline.com/{'{tid}'}/v2.0</ArticleCode> for v2,
          <ArticleCode>https://sts.windows.net/{'{tid}'}/</ArticleCode> for v1), that <ArticleCode>aud</ArticleCode> is
          your API, and that <ArticleCode>exp</ArticleCode> and <ArticleCode>nbf</ArticleCode> hold. Finally it authorises
          on <ArticleCode>scp</ArticleCode> (delegated) or <ArticleCode>roles</ArticleCode> (app roles). Only validate
          tokens issued for your own API; Microsoft Graph tokens are not meant to be validated by you. This guide follows
          Microsoft's identity platform documentation on learn.microsoft.com as of September 2026.
        </ArticleIntroBox>

        <ArticleH2 id="which-tokens-to-validate">Which Azure Tokens Should You Validate?</ArticleH2>
        <ArticleP>
          Microsoft is specific about this. Web APIs must validate the access tokens sent to them, and must only
          accept tokens whose <ArticleCode>aud</ArticleCode> is one of their own identifiers. Client apps (SPAs,
          mobile and desktop apps) should treat access tokens as opaque strings and not validate them at all.
        </ArticleP>
        <ArticleCallout type="warning">
          Do not validate Microsoft Graph access tokens. Microsoft's docs say you can't validate tokens for Microsoft
          Graph by the standard rules "due to their proprietary format", and that accepting a token meant for another
          resource is an example of the confused deputy problem. A Graph token failing signature validation in your
          code is expected behaviour. If your API needs a token, expose a scope on your own app registration and have
          the client request <ArticleCode>api://{'{your-api-client-id}'}/scope-name</ArticleCode>.
        </ArticleCallout>
        <ArticleP>
          Microsoft's documentation on access token claims and validation applies only to tokens for registered APIs,
          not to tokens for Microsoft-owned APIs. Tokens that a Microsoft API receives might not be a decodable JWT at all.
        </ArticleP>

        <ArticleH2 id="azure-jwt-token-example">Azure JWT Token Example (v2.0 Access Token)</ArticleH2>
        <ArticleP>
          This is the shape of Microsoft's published v2.0 sample, with identifiers replaced by placeholders:
        </ArticleP>
        <ArticlePre lang="json">{`// header
{ "typ": "JWT", "alg": "RS256", "kid": "H4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3a" }

// payload
{
  "aud": "00001111-aaaa-2222-bbbb-3333cccc4444",
  "iss": "https://login.microsoftonline.com/aaaabbbb-0000-cccc-1111-dddd2222eeee/v2.0",
  "iat": 1537231048,
  "nbf": 1537231048,
  "exp": 1537234948,
  "aio": "AXQAi/8IAAAA...",
  "azp": "11112222-bbbb-3333-cccc-4444dddd5555",
  "azpacr": "0",
  "name": "Abe Lincoln",
  "oid": "690222be-ff1a-4d56-abd1-7e4f7d38e474",
  "preferred_username": "abeli@contoso.com",
  "rh": "I",
  "scp": "access_as_user",
  "sub": "HKZpfaHyWadeOouYlitjrI-KffTm222X5rrV3xDqfKQ",
  "tid": "aaaabbbb-0000-cccc-1111-dddd2222eeee",
  "uti": "fqiBqXLPj0eQa82S-IYFAA",
  "ver": "2.0"
}`}</ArticlePre>

        <ArticleH2 id="azure-ad-v1-vs-v2-tokens">Azure AD v1 vs v2 Tokens</ArticleH2>
        <ArticleP>
          The access token version is chosen by the <em>API's</em> app registration, not by the endpoint the client
          calls. The setting is <ArticleCode>requestedAccessTokenVersion</ArticleCode> in Microsoft Graph and the
          current manifest; older manifests and many blog posts call it <ArticleCode>accessTokenAcceptedVersion</ArticleCode>.
          Values of <ArticleCode>null</ArticleCode> or <ArticleCode>1</ArticleCode> produce v1.0 tokens, and
          <ArticleCode>2</ArticleCode> produces v2.0 tokens. It must be <ArticleCode>2</ArticleCode> if the app accepts
          personal Microsoft accounts. A client using the v2.0 endpoint can therefore still receive a v1.0 access token,
          which is why so many APIs are surprised to see <ArticleCode>sts.windows.net</ArticleCode> issuers.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Item</th>
                <th className="px-3 py-2 font-semibold">v1.0 token</th>
                <th className="px-3 py-2 font-semibold">v2.0 token</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {VERSIONS.map(([item, v1, v2]) => (
                <tr key={item} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{item}</td>
                  <td className="px-3 py-2">{v1}</td>
                  <td className="px-3 py-2">{v2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Microsoft's rule is to validate each version against its own metadata document. A v1.0 token (<ArticleCode>ver</ArticleCode> = <ArticleCode>"1.0"</ArticleCode>)
          uses the metadata URL without <ArticleCode>/v2.0</ArticleCode>, even if your API is configured with a v2.0
          authority, and vice versa. The simplest fix is usually to set the API to v2 and accept one format.
        </ArticleP>

        <ArticleH2 id="azure-ad-jwt-claims">Azure AD JWT Claims That Matter for Validation</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>aud</strong>: must be your API. For v2 tokens this is always the API's client ID. For v1 tokens it can be the client ID or the App ID URI the client requested (such as <ArticleCode>api://...</ArticleCode>), so v1 APIs often need both in their valid audiences. See <a href="/jwt-audience-claim" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">the audience claim</a>.</ArticleLi>
          <ArticleLi><strong>iss</strong> and <strong>tid</strong>: the issuer embeds the tenant ID, and <ArticleCode>tid</ArticleCode> repeats it. The personal Microsoft account tenant is <ArticleCode>9188040d-6c67-4c5b-b112-36a304b66dad</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>scp</strong>: a space-separated string of delegated scopes, present only when a user is involved.</ArticleLi>
          <ArticleLi><strong>roles</strong>: an array of app roles. For user tokens these are the user's assigned roles on your app. For client-credentials (app-only) tokens they are the application permissions, and there is no <ArticleCode>scp</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>azp</strong> / <strong>appid</strong>: the client application that requested the token. You can use it to allow-list callers.</ArticleLi>
          <ArticleLi><strong>groups</strong>, <strong>wids</strong>: group object IDs and directory role template IDs, if configured. Above 200 groups in a JWT, Entra ID drops <ArticleCode>groups</ArticleCode> and emits an overage claim (<ArticleCode>_claim_names</ArticleCode> / <ArticleCode>_claim_sources</ArticleCode>) that points you to Graph.</ArticleLi>
          <ArticleLi><strong>name</strong>, <strong>preferred_username</strong>: mutable display values. Microsoft says not to use them for authorisation.</ArticleLi>
          <ArticleLi><strong>aio</strong>, <strong>rh</strong>, <strong>uti</strong>: internal or token-ID claims. Ignore the first two; <ArticleCode>uti</ArticleCode> plays the role of <ArticleCode>jti</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Microsoft also warns that claims appear only when they have a value and that new claims may be added, so do
          not fail a token because an optional claim is missing. For the general meaning of each registered claim, see
          <a href="/jwt-claims-explained" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> JWT claims explained</a>.
        </ArticleP>

        <ArticleH3 id="jwt-sub-vs-oid">JWT sub vs oid in Entra ID</ArticleH3>
        <ArticleP>
          Both identify the user, but at different scopes:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>sub</strong> is a <em>pairwise</em> identifier: unique to the user <em>and</em> the application. The same person signing in to two different client IDs gets two different <ArticleCode>sub</ArticleCode> values.</ArticleLi>
          <ArticleLi><strong>oid</strong> is the user's (or service principal's) object ID in the tenant. It is the same across every application in that tenant, and it is the <ArticleCode>id</ArticleCode> Microsoft Graph returns for the user.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Use <ArticleCode>oid</ArticleCode> together with <ArticleCode>tid</ArticleCode> as the database key when several of your apps
          or services need to agree on who a user is. Use <ArticleCode>sub</ArticleCode> when you want to limit correlation.
          Either way, include the tenant: the same user in two tenants has two different object IDs, and Microsoft notes
          that claims are interpreted within the issuer and tenant.
        </ArticleP>

        <ArticleH2 id="azure-jwt-token-validation-steps">Azure JWT Token Validation, Step by Step</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>1. Load metadata.</strong> Single tenant: <ArticleCode>https://login.microsoftonline.com/{'{tenant-id}'}/v2.0/.well-known/openid-configuration</ArticleCode>. Multi-tenant: <ArticleCode>/organizations/v2.0/...</ArticleCode> or <ArticleCode>/common/v2.0/...</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>2. Verify the signature</strong> with the key from <ArticleCode>jwks_uri</ArticleCode> whose <ArticleCode>kid</ArticleCode> matches the header, and allow only RS256. Keys rotate, so refresh them; Microsoft suggests checking about every 24 hours. Apps using claims-mapping with custom signing keys must add <ArticleCode>?appid={'{client-id}'}</ArticleCode> to the metadata URL.</ArticleLi>
          <ArticleLi><strong>3. Validate the issuer.</strong> Single tenant: exact match with the metadata <ArticleCode>issuer</ArticleCode>. Multi-tenant: the metadata issuer is the template <ArticleCode>https://login.microsoftonline.com/{'{tenantid}'}/v2.0</ArticleCode>. Substitute the token's <ArticleCode>tid</ArticleCode>, require an exact match, confirm <ArticleCode>tid</ArticleCode> is a GUID, and check the signing key's own <ArticleCode>issuer</ArticleCode> property in the keys document. Then restrict to the tenants you actually serve.</ArticleLi>
          <ArticleLi><strong>4. Validate aud</strong> against your client ID (and App ID URI for v1).</ArticleLi>
          <ArticleLi><strong>5. Check exp and nbf</strong> with a small leeway.</ArticleLi>
          <ArticleLi><strong>6. Authorise</strong> on <ArticleCode>scp</ArticleCode> for delegated calls or <ArticleCode>roles</ArticleCode> for app-only calls. See <a href="/jwt-scopes-vs-roles" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">scopes vs roles</a>.</ArticleLi>
        </ArticleUl>

        <ArticleH3 id="entra-multi-tenant-pitfalls">Multi-tenant pitfalls</ArticleH3>
        <ArticleP>
          The most dangerous shortcut in multi-tenant APIs is turning issuer validation off because the issuer
          "changes per tenant". With issuer validation off and the <ArticleCode>common</ArticleCode> keys, any Entra
          tenant in the world can mint a token for an app registration it controls, and only the audience check stands
          in its way. Follow Microsoft's substitution rule instead: build the expected issuer from the token's
          <ArticleCode>tid</ArticleCode>, require an exact match, and then check <ArticleCode>tid</ArticleCode> against the
          tenants you have onboarded. Also include <ArticleCode>tid</ArticleCode> in every data lookup, because
          Microsoft notes that the same <ArticleCode>sub</ArticleCode> in two tenants describes two different users.
        </ArticleP>

        <ArticleH3 id="entra-validation-aspnet-core">ASP.NET Core: Microsoft.Identity.Web</ArticleH3>
        <ArticleP>
          On ASP.NET Core, Microsoft recommends Microsoft.Identity.Web, which applies these rules for you:
        </ArticleP>
        <ArticlePre lang="csharp">{`// appsettings.json: "AzureAd": { "Instance": "https://login.microsoftonline.com/",
//                                "TenantId": "<tenant-id>", "ClientId": "<api-client-id>" }
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));`}</ArticlePre>
        <ArticleP>
          Plain <ArticleCode>AddJwtBearer</ArticleCode> also works for a single tenant; the
          <a href="/jwt-authentication-aspnet-core" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> ASP.NET Core JWT guide</a> covers the
          claim-mapping settings you need for <ArticleCode>roles</ArticleCode> to drive <ArticleCode>[Authorize(Roles = ...)]</ArticleCode>.
        </ArticleP>

        <ArticleH3 id="entra-validation-nodejs">Node.js with jose</ArticleH3>
        <ArticlePre lang="javascript">{`import { createRemoteJWKSet, jwtVerify } from "jose";

const TENANT_ID = "aaaabbbb-0000-cccc-1111-dddd2222eeee";
const API_CLIENT_ID = "00001111-aaaa-2222-bbbb-3333cccc4444";
// jwks_uri from the v2.0 openid-configuration document for the tenant
const JWKS = createRemoteJWKSet(
  new URL(\`https://login.microsoftonline.com/\${TENANT_ID}/discovery/v2.0/keys\`)
);

export async function validateEntraAccessToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: \`https://login.microsoftonline.com/\${TENANT_ID}/v2.0\`,
    audience: API_CLIENT_ID,
    algorithms: ["RS256"],
    clockTolerance: 60,
    requiredClaims: ["tid", "oid"],
  });
  if (payload.ver !== "2.0") throw new Error("Expected a v2.0 access token");
  if (payload.tid !== TENANT_ID) throw new Error("Wrong tenant");

  const scopes = typeof payload.scp === "string" ? payload.scp.split(" ") : [];
  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  if (!scopes.includes("Orders.Read") && !roles.includes("Orders.Read.All")) {
    throw new Error("Missing Orders.Read permission");
  }
  return payload;
}`}</ArticlePre>
        <ArticleP>
          In production, read <ArticleCode>jwks_uri</ArticleCode> from the metadata document rather than hard-coding it.
          The example was run against a locally signed test token with the same claim layout. For the mechanics of
          key sets and <ArticleCode>kid</ArticleCode> lookups, see <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">what is a JWKS</a>.
        </ArticleP>

        <ArticleH2 id="jwt-azure-apim">JWT Validation in Azure API Management (APIM)</ArticleH2>
        <ArticleP>
          APIM can reject bad tokens at the gateway. For Entra ID tokens, Microsoft points to the dedicated
          <ArticleCode>validate-azure-ad-token</ArticleCode> policy; the generic <ArticleCode>validate-jwt</ArticleCode>
          policy is intended for other identity providers but also accepts Entra metadata. Both are available in all
          APIM tiers and run in the inbound section.
        </ArticleP>
        <ArticlePre lang="xml">{`<!-- Entra ID: dedicated policy -->
<validate-azure-ad-token tenant-id="{{aad-tenant-id}}" output-token-variable-name="jwt">
    <client-application-ids>
        <application-id>{{aad-client-application-id}}</application-id>
    </client-application-ids>
    <audiences>
        <audience>00001111-aaaa-2222-bbbb-3333cccc4444</audience>
    </audiences>
</validate-azure-ad-token>

<!-- Generic policy with Entra metadata -->
<validate-jwt header-name="Authorization" require-scheme="Bearer"
              failed-validation-httpcode="401" clock-skew="60">
    <openid-config url="https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration" />
    <audiences>
        <audience>00001111-aaaa-2222-bbbb-3333cccc4444</audience>
    </audiences>
</validate-jwt>`}</ArticlePre>
        <ArticleUl>
          <ArticleLi><ArticleCode>validate-jwt</ArticleCode> defaults to a <ArticleCode>clock-skew</ArticleCode> of 0 seconds and requires <ArticleCode>exp</ArticleCode> unless <ArticleCode>require-expiration-time="false"</ArticleCode>. Its supported asymmetric algorithms are PS256, RS256, RS512 and ES256.</ArticleLi>
          <ArticleLi>APIM re-fetches OpenID configuration hourly, and at most every five minutes when it meets an unknown <ArticleCode>kid</ArticleCode>.</ArticleLi>
          <ArticleLi>Both policies accept a <ArticleCode>required-claims</ArticleCode> block (with <ArticleCode>match="all"</ArticleCode> or <ArticleCode>"any"</ArticleCode>) for simple claim-value checks at the gateway.</ArticleLi>
          <ArticleLi>Gateway validation does not replace validation in the API itself if the API can be reached without going through APIM.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwt-azure-decode">Azure JWT Decode and Troubleshooting</ArticleH2>
        <ArticleP>
          Decoding first answers most questions: <ArticleCode>ver</ArticleCode>, <ArticleCode>iss</ArticleCode> and
          <ArticleCode>aud</ArticleCode> show at once whether you have a v1 or v2 token, and whether it was issued for
          your API or for Graph. Microsoft's docs mention jwt.ms for this. <a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">The jwtdecode.app decoder</a> also works
          and decodes in your browser without sending the token anywhere. Then match the error:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Error (Microsoft.IdentityModel)</th>
                <th className="px-3 py-2 font-semibold">Usual meaning</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {ERRORS.map(([message, meaning]) => (
                <tr key={message} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{message}</td>
                  <td className="px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          More general failure patterns are in <a href="/common-jwt-errors-and-fixes" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">common JWT errors and fixes</a>
          and the <a href="/how-to-debug-a-jwt" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT debugging routine</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Azure AD JWT token validation means validating only tokens for your own API (never Microsoft Graph tokens)
          against the metadata document for the token's version. Check the RS256 signature via
          <ArticleCode>jwks_uri</ArticleCode> and <ArticleCode>kid</ArticleCode>, then the issuer
          (<ArticleCode>sts.windows.net</ArticleCode> for v1, <ArticleCode>login.microsoftonline.com/{'{tid}'}/v2.0</ArticleCode> for v2,
          with <ArticleCode>tid</ArticleCode> substitution for multi-tenant apps), <ArticleCode>aud</ArticleCode>, and the
          lifetime. Authorise on <ArticleCode>scp</ArticleCode> or <ArticleCode>roles</ArticleCode>, and key users on
          <ArticleCode>oid</ArticleCode> plus <ArticleCode>tid</ArticleCode>; <ArticleCode>sub</ArticleCode> is per-application.
          Set <ArticleCode>requestedAccessTokenVersion</ArticleCode> to 2 to keep to one format, and use
          <ArticleCode>validate-azure-ad-token</ArticleCode> when APIM sits in front of the API.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
