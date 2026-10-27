import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Cognito JWT Validation: How to Verify Amazon Cognito User Pool Tokens',
  description: 'How to validate Amazon Cognito ID and access tokens: JWKS URL, issuer formats, token_use, aud vs client_id, cognito:groups, the aws-jwt-verify library and the API Gateway JWT authorizer.',
  url: 'https://jwtdecode.app/validate-aws-cognito-jwt',
  mainEntityOfPage: 'https://jwtdecode.app/validate-aws-cognito-jwt',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const CLAIMS: [claim: string, idToken: string, accessToken: string][] = [
  ['token_use', '"id"', '"access"'],
  ['App client ID', 'aud', 'client_id'],
  ['aud', 'The app client ID', 'Present only when a resource binding was requested; then it is the API URL'],
  ['Username', 'cognito:username', 'username'],
  ['cognito:groups', 'Yes (array of group names)', 'Yes (array of group names)'],
  ['scope', 'No', 'Yes (space-separated OAuth scopes)'],
  ['User attributes (email, name, custom:*)', 'Yes', 'No (use the userInfo endpoint)'],
  ['cognito:roles / cognito:preferred_role', 'Yes, when groups have IAM roles', 'No'],
  ['origin_jti, jti, event_id, auth_time', 'Yes', 'Yes'],
  ['Signing key (kid)', 'ID-token key', 'A different access-token key'],
];

const FAILURES: [symptom: string, cause: string][] = [
  ['ParameterValidationError about the issuer', 'Token from another user pool or Region, or the verifier was created with the wrong userPoolId'],
  ['Invalid audience with an access token', 'Checking aud instead of client_id; access tokens carry the app client in client_id'],
  ['CognitoJwtInvalidTokenUseError', 'An ID token sent to an API that expects access tokens (or the reverse)'],
  ['KidNotFoundInJwksError', 'Token signed by a different pool, or a JWKS cache that predates a key rotation'],
  ['Groups missing from the token', 'User added to the group after the token was issued; groups update on the next token refresh'],
  ['Token still works after sign-out', 'Offline checks cannot see revocation; keep lifetimes short or check with Cognito'],
];

export default function ValidateCognitoJwtPage() {
  return (
    <>
      <SEOHead
        title="Cognito JWT Validation: Verify User Pool Tokens"
        description="Cognito JWT validation step by step: JWKS URL and issuer, ID vs access token claims, token_use and client_id checks, aws-jwt-verify and API Gateway."
        path="/validate-aws-cognito-jwt"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Validate Cognito JWTs' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/what-is-jwks', label: 'What Is a JWKS?', description: 'How key sets, kid and key rotation work.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'ID tokens vs access tokens in any provider.' },
          { to: '/validate-azure-entra-id-jwt', label: 'Validate Entra ID JWTs', description: 'The same checks for Microsoft Entra ID tokens.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'What signature verification involves for RS256.' },
        ]}
      >
        <ArticleH1>Cognito JWT Validation: How to Verify Amazon Cognito User Pool Tokens</ArticleH1>

        <ArticleIntroBox>
          To validate a Cognito JWT, verify its RS256 signature with the key whose <ArticleCode>kid</ArticleCode>
          matches in <ArticleCode>https://cognito-idp.{'{region}'}.amazonaws.com/{'{userPoolId}'}/.well-known/jwks.json</ArticleCode>.
          Then check that <ArticleCode>exp</ArticleCode> is in the future, that <ArticleCode>iss</ArticleCode> is your
          user pool, and that <ArticleCode>token_use</ArticleCode> is <ArticleCode>access</ArticleCode> or
          <ArticleCode>id</ArticleCode> as your API expects. Finally, check the app client: <ArticleCode>aud</ArticleCode>
          in an ID token, but <ArticleCode>client_id</ArticleCode> in an access token. In Node.js, AWS recommends the
          <ArticleCode>aws-jwt-verify</ArticleCode> library, which does all of this in one call. In front of an HTTP API,
          API Gateway's JWT authorizer can do it without any code. This guide follows the AWS "Verifying JSON web tokens"
          documentation and aws-jwt-verify 5.2.1, and the Node and Python examples were run against locally signed test tokens.
        </ArticleIntroBox>

        <ArticleH2 id="cognito-jwt-token-example">Cognito JWT Token Example</ArticleH2>
        <ArticleP>
          Every user pool token is a signed JWT (JWS) with a two-field header. Cognito signs with RS256 using a
          2048-bit RSA key, and it uses different keys for ID tokens and access tokens, so their
          <ArticleCode>kid</ArticleCode> values differ even within one session.
        </ArticleP>
        <ArticlePre lang="json">{`// header
{ "kid": "1234example=", "alg": "RS256" }

// access token payload (from the AWS docs, trimmed)
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "cognito:groups": ["testgroup"],
  "iss": "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_example",
  "version": 2,
  "client_id": "xxxxxxxxxxxxexample",
  "origin_jti": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "token_use": "access",
  "scope": "phone openid profile resourceserver.1/appclient2 email",
  "auth_time": 1676313851,
  "exp": 1676317451,
  "iat": 1676313851,
  "jti": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "username": "my-test-user"
}`}</ArticlePre>
        <ArticlePre lang="json">{`// ID token payload (trimmed)
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "cognito:groups": ["test-group-a", "test-group-b"],
  "email_verified": true,
  "iss": "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_example",
  "cognito:username": "my-test-user",
  "aud": "xxxxxxxxxxxxexample",
  "token_use": "id",
  "auth_time": 1676312777,
  "exp": 1676316377,
  "iat": 1676312777,
  "email": "my-test-user@example.com"
}`}</ArticlePre>

        <ArticleH2 id="cognito-jwt-claims">Cognito JWT Claims: ID Token vs Access Token</ArticleH2>
        <ArticleP>
          The most common Cognito validation bug is applying ID-token rules to access tokens. The two differ in several places:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Claim</th>
                <th className="px-3 py-2 font-semibold">ID token</th>
                <th className="px-3 py-2 font-semibold">Access token</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {CLAIMS.map(([claim, idToken, accessToken]) => (
                <tr key={claim} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{claim}</td>
                  <td className="px-3 py-2">{idToken}</td>
                  <td className="px-3 py-2">{accessToken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleUl>
          <ArticleLi><strong>sub</strong> is the stable user identifier. AWS warns that it does not follow a strict UUID format, so do not validate it as one. <ArticleCode>username</ArticleCode> is not guaranteed unique.</ArticleLi>
          <ArticleLi><strong>cognito:groups</strong> is the natural place for role-based checks. The claim name contains a colon, so read it as <ArticleCode>payload["cognito:groups"]</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Custom attributes</strong> appear in ID tokens as <ArticleCode>custom:name</ArticleCode>, and Cognito always writes them as strings, whatever the attribute type.</ArticleLi>
          <ArticleLi><strong>Extra claims</strong> can be added with a pre token generation Lambda trigger. Adding claims and scopes to <em>access</em> tokens requires the Essentials or Plus feature plan.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Which token should your API accept? Normally the access token: it carries scopes and exists to authorise API
          calls. The ID token tells the client who signed in. <a href="/jwt-in-oauth2-and-openid-connect" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWTs in OAuth 2.0 and OIDC</a> explains the split.
        </ArticleP>

        <ArticleH2 id="cognito-jwt-decode">Cognito JWT Decode: Reading the Payload</ArticleH2>
        <ArticleP>
          Decoding is not validation. The header and payload are just base64url JSON, and anyone can decode, or forge,
          them. Decoding is still the first debugging step: it tells you which pool issued the token
          (<ArticleCode>iss</ArticleCode>), which type it is (<ArticleCode>token_use</ArticleCode>), and whether it has
          expired. Paste a token into <a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">the jwtdecode.app decoder</a> to see
          the Cognito JWT payload with readable timestamps. It runs in the browser, so the token is not uploaded.
          For scripts, see <a href="/decode-jwt-command-line" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">decoding a JWT on the command line</a>.
          Never make an authorisation decision from decoded claims until the signature and the checks below have passed.
        </ArticleP>

        <ArticleH2 id="cognito-jwt-validation-steps">Cognito JWT Validation Steps</ArticleH2>
        <ArticleP>AWS's documented procedure comes down to five checks, in this order:</ArticleP>
        <ArticleUl>
          <ArticleLi><strong>1. Signature.</strong> Fetch the JWKS from <ArticleCode>https://cognito-idp.{'{region}'}.amazonaws.com/{'{userPoolId}'}/.well-known/jwks.json</ArticleCode>, pick the key whose <ArticleCode>kid</ArticleCode> matches the token header, and verify with RS256 only. Cache keys by <ArticleCode>kid</ArticleCode>; if a token from your issuer has an unknown <ArticleCode>kid</ArticleCode>, refresh the cache once, because Cognito may have rotated keys.</ArticleLi>
          <ArticleLi><strong>2. Expiry.</strong> <ArticleCode>exp</ArticleCode> must be in the future. AWS specifically says to check this locally rather than calling <ArticleCode>GetUser</ArticleCode> or <ArticleCode>userInfo</ArticleCode> to see whether the token still works.</ArticleLi>
          <ArticleLi><strong>3. Audience.</strong> <ArticleCode>aud</ArticleCode> (ID token) or <ArticleCode>client_id</ArticleCode> (access token) must equal your app client ID.</ArticleLi>
          <ArticleLi><strong>4. Issuer.</strong> <ArticleCode>iss</ArticleCode> must be your user pool, for example <ArticleCode>https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EXAMPLE</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>5. token_use.</strong> <ArticleCode>access</ArticleCode> if your API accepts access tokens only, <ArticleCode>id</ArticleCode> if it accepts ID tokens only.</ArticleLi>
        </ArticleUl>
        <ArticleH3 id="cognito-issuer-formats">Original and updated issuer formats</ArticleH3>
        <ArticleP>
          User pools now offer two issuer types. The <em>original</em> issuer is
          <ArticleCode>https://cognito-idp.{'{region}'}.amazonaws.com/{'{userPoolId}'}</ArticleCode>. The
          <em> updated</em> issuer, which AWS recommends and which supports multi-Region replication, is
          <ArticleCode>https://issuer-cognito-idp.{'{region}'}.amazonaws.com/{'{userPoolId}'}</ArticleCode>. If you
          hard-code the issuer string, match the one your pool actually uses. aws-jwt-verify 5.x accepts either form for
          the configured pool. AWS notes that the updated issuer does not yet work with Application Load Balancer
          authentication or with API Gateway REST API Cognito authorizers.
        </ArticleP>
        <ArticleCallout type="info">
          A valid signature and an unexpired <ArticleCode>exp</ArticleCode> do not prove the token hasn't been
          revoked. When a user signs out or you call <ArticleCode>RevokeToken</ArticleCode>, Cognito invalidates tokens
          that share the <ArticleCode>origin_jti</ArticleCode>, but an offline verifier cannot see that. Keep access-token
          lifetimes short (they can be set from 5 minutes to 1 day per app client), or check with Cognito when a
          request is sensitive. See <a href="/jwt-logout-and-revocation" className="underline underline-offset-2">JWT logout and revocation</a>.
        </ArticleCallout>

        <ArticleH2 id="cognito-jwt-verifier">Cognito JWT Verifier: aws-jwt-verify</ArticleH2>
        <ArticleP>
          <ArticleCode>aws-jwt-verify</ArticleCode> (published by AWS Labs, installed with <ArticleCode>npm install aws-jwt-verify</ArticleCode>)
          knows the Cognito rules: it derives the issuer and JWKS URL from the pool ID and checks
          <ArticleCode>token_use</ArticleCode> and the correct client claim for each token type.
        </ArticleP>
        <ArticlePre lang="javascript">{`import { CognitoJwtVerifier } from "aws-jwt-verify";
import { JwtExpiredError } from "aws-jwt-verify/error";

// Create once, outside the request handler (or Lambda handler), so the JWKS cache is reused.
const verifier = CognitoJwtVerifier.create({
  userPoolId: "eu-west-2_EXAMPLE",
  tokenUse: "access",          // or "id"
  clientId: "1example23456789", // checked against client_id (access) or aud (id)
  groups: "admin",             // optional: require membership of cognito:groups
});

await verifier.hydrate();      // optional: pre-load the JWKS at start-up

export async function authenticate(authorizationHeader) {
  const token = authorizationHeader?.replace(/^Bearer /, "");
  try {
    return await verifier.verify(token); // returns the verified payload
  } catch (err) {
    if (err instanceof JwtExpiredError) throw new Error("token expired");
    throw new Error("invalid token");
  }
}`}</ArticlePre>
        <ArticleUl>
          <ArticleLi><strong>Multiple pools or clients</strong>: pass an array of configurations to <ArticleCode>create()</ArticleCode>, or a list of client IDs.</ArticleLi>
          <ArticleLi><strong>Extra checks</strong>: <ArticleCode>customJwtCheck: ({'{'} header, payload, jwk {'}'}) =&gt; {'{'} ... {'}'}</ArticleCode> runs after the standard checks. Throw to reject the token.</ArticleLi>
          <ArticleLi><strong>Scopes</strong>: the <ArticleCode>scope</ArticleCode> option requires specific OAuth scopes on access tokens.</ArticleLi>
          <ArticleLi><strong>Errors</strong> are typed: <ArticleCode>JwtExpiredError</ArticleCode>, <ArticleCode>CognitoJwtInvalidTokenUseError</ArticleCode>, <ArticleCode>CognitoJwtInvalidClientIdError</ArticleCode>, <ArticleCode>CognitoJwtInvalidGroupError</ArticleCode>, <ArticleCode>KidNotFoundInJwksError</ArticleCode> and others, all exported from <ArticleCode>aws-jwt-verify/error</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Non-Cognito issuers</strong>: <ArticleCode>JwtVerifier</ArticleCode> does the same with an explicit issuer, audience and JWKS URI.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          You can set <ArticleCode>clientId: null</ArticleCode> to skip the client check, but the library's README
          advises against it and so does this guide: without it, tokens from any app client in the pool are accepted.
        </ArticleP>

        <ArticleH3 id="cognito-jwt-python">Validating Cognito tokens in Python</ArticleH3>
        <ArticleP>
          Any standards-compliant JWT library works. With PyJWT 2.x, check <ArticleCode>client_id</ArticleCode> and
          <ArticleCode>token_use</ArticleCode> yourself, because access tokens have no <ArticleCode>aud</ArticleCode> to
          hand to the library:
        </ArticleP>
        <ArticlePre lang="python">{`import jwt  # pip install "pyjwt[crypto]"

REGION = "eu-west-2"
USER_POOL_ID = "eu-west-2_EXAMPLE"
APP_CLIENT_ID = "1example23456789"
ISSUER = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}"
jwks_client = jwt.PyJWKClient(f"{ISSUER}/.well-known/jwks.json")  # caches keys

def verify_access_token(token: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=ISSUER,
        options={"require": ["exp", "iat", "iss", "token_use"], "verify_aud": False},
        leeway=30,
    )
    if claims["token_use"] != "access":
        raise jwt.InvalidTokenError("not an access token")
    if claims.get("client_id") != APP_CLIENT_ID:
        raise jwt.InvalidTokenError("wrong client_id")
    return claims`}</ArticlePre>

        <ArticleH3 id="cognito-jwt-java-dotnet">Cognito tokens in Spring Boot and ASP.NET Core</ArticleH3>
        <ArticleP>
          Cognito publishes standard OpenID Connect metadata at
          <ArticleCode>https://cognito-idp.{'{region}'}.amazonaws.com/{'{userPoolId}'}/.well-known/openid-configuration</ArticleCode>,
          so framework resource servers can use the user pool URL as their issuer or authority. There is one catch:
          Cognito <em>access</em> tokens normally have no <ArticleCode>aud</ArticleCode> claim, so a framework's standard
          audience check rejects them.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Spring Boot</strong>: set <ArticleCode>issuer-uri</ArticleCode> to the user pool URL, do not set <ArticleCode>audiences</ArticleCode>, and add a custom <ArticleCode>OAuth2TokenValidator&lt;Jwt&gt;</ArticleCode> that requires <ArticleCode>token_use == "access"</ArticleCode> and the expected <ArticleCode>client_id</ArticleCode>. See <a href="/jwt-authentication-spring-boot" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT in Spring Boot</a>.</ArticleLi>
          <ArticleLi><strong>ASP.NET Core</strong>: set <ArticleCode>Authority</ArticleCode> to the user pool URL and <ArticleCode>ValidateAudience = false</ArticleCode>, then check <ArticleCode>client_id</ArticleCode> and <ArticleCode>token_use</ArticleCode> in <ArticleCode>OnTokenValidated</ArticleCode> or an authorisation policy. See <a href="/jwt-authentication-aspnet-core" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT in ASP.NET Core</a>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Disabling the generic audience check is only safe because you replace it with the <ArticleCode>client_id</ArticleCode>
          check. Without that replacement, your API accepts tokens issued to every app client in the pool. If you
          configure a resource binding, access tokens carry an <ArticleCode>aud</ArticleCode> (your API's URL) and the
          standard audience setting works again.
        </ArticleP>

        <ArticleH2 id="cognito-jwt-authorizer">Cognito JWT Authorizer in API Gateway</ArticleH2>
        <ArticleP>
          For an API Gateway <em>HTTP API</em>, a JWT authorizer validates Cognito tokens before your integration runs:
        </ArticleP>
        <ArticlePre lang="bash">{`aws apigatewayv2 create-authorizer \\
  --api-id abc123 \\
  --name cognito-jwt \\
  --authorizer-type JWT \\
  --identity-source '$request.header.Authorization' \\
  --jwt-configuration Audience=1example23456789,Issuer=https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_EXAMPLE`}</ArticlePre>
        <ArticleUl>
          <ArticleLi>The authorizer fetches keys from the issuer's <ArticleCode>jwks_uri</ArticleCode>, supports RSA algorithms only, and may cache keys for up to two hours. Allow a grace period when keys rotate.</ArticleLi>
          <ArticleLi>It checks <ArticleCode>iss</ArticleCode>, <ArticleCode>exp</ArticleCode>, <ArticleCode>nbf</ArticleCode>, <ArticleCode>iat</ArticleCode>, and <ArticleCode>aud</ArticleCode> <em>or</em> <ArticleCode>client_id</ArticleCode> against the configured audiences. It uses <ArticleCode>client_id</ArticleCode> only when <ArticleCode>aud</ArticleCode> is absent, so for a Cognito access token the "audience" you configure is the app client ID.</ArticleLi>
          <ArticleLi>It does <em>not</em> check <ArticleCode>token_use</ArticleCode>. An ID token for the same app client has <ArticleCode>aud</ArticleCode> equal to the client ID and passes too. AWS recommends requiring authorization scopes on routes; ID tokens have no <ArticleCode>scope</ArticleCode> claim, so they are then rejected.</ArticleLi>
          <ArticleLi>Validated claims reach a Lambda integration at <ArticleCode>event.requestContext.authorizer.jwt.claims</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          REST APIs use a different mechanism, the Cognito user pool authorizer. For custom logic, use a Lambda
          authorizer running aws-jwt-verify, created outside the handler so its key cache survives between invocations.
        </ArticleP>

        <ArticleH2 id="cognito-jwt-troubleshooting">Troubleshooting Cognito JWT Validation</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Symptom</th>
                <th className="px-3 py-2 font-semibold">Likely cause</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {FAILURES.map(([symptom, cause]) => (
                <tr key={symptom} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{symptom}</td>
                  <td className="px-3 py-2">{cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          For generic failures such as clock skew or a malformed header, see <a href="/common-jwt-errors-and-fixes" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">common JWT errors and fixes</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Cognito JWT validation means checking an RS256 signature against the user pool's JWKS
          (<ArticleCode>/.well-known/jwks.json</ArticleCode> under the issuer), then <ArticleCode>exp</ArticleCode>,
          <ArticleCode>iss</ArticleCode>, <ArticleCode>token_use</ArticleCode>, and the app client: <ArticleCode>aud</ArticleCode>
          for ID tokens, <ArticleCode>client_id</ArticleCode> for access tokens. Use <ArticleCode>CognitoJwtVerifier.create({'{'} userPoolId, tokenUse, clientId {'}'})</ArticleCode>
          from aws-jwt-verify in Node.js, any standard JWT library elsewhere, or an API Gateway HTTP API JWT authorizer
          with route scopes. Base group-based access on <ArticleCode>cognito:groups</ArticleCode>, and keep token
          lifetimes short, because offline checks cannot detect revocation.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
