import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Send a JWT Bearer Token With curl and Postman',
  description: 'How to send a JWT as a bearer token with curl (-H and --oauth2-bearer), fetch one with client credentials, configure Postman Bearer Token and JWT Bearer auth, and fix common 401 errors.',
  url: 'https://jwtdecode.app/jwt-curl-postman',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-curl-postman',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const MISTAKES: [symptom: string, cause: string][] = [
  ['401, server log says token missing, or "Jwt is missing"', 'No Authorization header reached the API: typo in the header name, the token sent as a query parameter or cookie instead, or a proxy stripping the header. "Jwt is missing" is the wording of Envoy\'s JWT filter, used by Istio and other gateways.'],
  ['401 with a token that decodes fine', 'Missing "Bearer " prefix, "Bearer Bearer" doubled by a tool that adds its own prefix, or an ID token sent where an access token is expected.'],
  ['Literal $TOKEN arrives at the server', 'The header was wrapped in single quotes, so the shell did not expand the variable. Use double quotes.'],
  ['400 Bad Request from Node.js or a proxy', 'A carriage return or newline inside the header value, usually from a token file saved with Windows line endings.'],
  ['401 only after a while', 'The token expired. Check exp; see the expiry section of the errors guide.'],
  ['403 Forbidden', 'The token is valid but lacks the scope, role or audience the endpoint requires. Getting a new token of the same kind will not help.'],
];

export default function JwtCurlPostmanPage() {
  return (
    <>
      <SEOHead
        title="curl JWT Bearer Token and Postman JWT Auth"
        description="Send a JWT bearer token with curl using -H or --oauth2-bearer, fetch one via client credentials, set up Postman Bearer Token and JWT Bearer auth, fix 401s."
        path="/jwt-curl-postman"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT With curl and Postman' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-vs-bearer-token', label: 'JWT vs Bearer Token', description: 'Why a JWT is one kind of bearer token, and what RFC 6750 defines.' },
          { to: '/decode-jwt-command-line', label: 'Decode JWT on the Command Line', description: 'Inspect the token in the terminal before you send it.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Error messages from popular libraries mapped to their causes.' },
          { to: '/how-to-debug-a-jwt', label: 'How to Debug a JWT', description: 'A repeatable routine for a token the server rejects.' },
        ]}
      >
        <ArticleH1>curl JWT Bearer Token and Postman JWT Authentication, With Examples</ArticleH1>

        <ArticleIntroBox>
          To call an API with a JWT from curl, send it in the Authorization header with the Bearer scheme:{' '}
          <ArticleCode>curl -H "Authorization: Bearer $TOKEN" https://api.example.com/me</ArticleCode>. In Postman, open
          the request's Authorization tab, choose <strong>Bearer Token</strong> and put{' '}
          <ArticleCode>{'{{access_token}}'}</ArticleCode> in the Token field. Both produce exactly the same HTTP header.
          <br /><br />
          This guide covers curl's built-in <ArticleCode>--oauth2-bearer</ArticleCode> option, fetching a token with
          the client credentials grant, Postman's separate <strong>JWT Bearer</strong> auth type that signs tokens for
          you, a script that saves tokens to a Postman environment automatically, and the mistakes behind most 401
          and 403 responses.
        </ArticleIntroBox>

        <ArticleH2 id="curl-jwt-header">curl JWT Header: Sending a Bearer Token</ArticleH2>
        <ArticleP>
          RFC 6750 §2.1 defines the header: the word <ArticleCode>Bearer</ArticleCode>, one space, then the token. For a
          JWT the token is the whole compact string, all three dot-separated parts, with no quotes and no line breaks.
        </ArticleP>
        <ArticlePre lang="bash">{`TOKEN='eyJhbGciOiJSUzI1NiIsImtpZCI6ImsxIn0.eyJzdWIiOiJ1c2VyLTEyMyJ9.c2ln...'

# GET with the token
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/me

# POST JSON with the token (--json needs curl 7.82.0 or later)
curl -H "Authorization: Bearer $TOKEN" \\
  --json '{"name":"Ada"}' https://api.example.com/profile

# Show the status line and response headers, useful for 401s
curl -i -H "Authorization: Bearer $TOKEN" https://api.example.com/me`}</ArticlePre>
        <ArticleP>
          Use double quotes around the header. With single quotes, the shell does not expand{' '}
          <ArticleCode>$TOKEN</ArticleCode> and the server receives the literal text <ArticleCode>Bearer $TOKEN</ArticleCode>.{' '}
          <ArticleCode>-i</ArticleCode> prints the response headers, including any <ArticleCode>WWW-Authenticate</ArticleCode>{' '}
          header, which often names the exact problem (for example{' '}
          <ArticleCode>error="invalid_token", error_description="The access token expired"</ArticleCode>).{' '}
          <ArticleCode>-v</ArticleCode> shows the request headers too, but it also prints your token to the terminal and
          anything capturing it.
        </ArticleP>

        <ArticleH3 id="curl-oauth2-bearer">curl --oauth2-bearer</ArticleH3>
        <ArticleP>
          curl has had a dedicated option since version 7.33.0. It builds the same header for you:
        </ArticleP>
        <ArticlePre lang="bash">{`curl --oauth2-bearer "$TOKEN" https://api.example.com/me
# sends: Authorization: Bearer eyJhbGciOi...`}</ArticlePre>
        <ArticleP>
          It cannot be combined with <ArticleCode>--basic</ArticleCode>, <ArticleCode>--digest</ArticleCode>,{' '}
          <ArticleCode>--negotiate</ArticleCode> or <ArticleCode>--ntlm</ArticleCode>. The benefit is mostly readability,
          and that you cannot forget the <ArticleCode>Bearer</ArticleCode> prefix.
        </ArticleP>

        <ArticleH2 id="curl-jwt-authentication">curl JWT Authentication: Getting a Token First</ArticleH2>
        <ArticleP>
          Before you can send a token you need one. For machine-to-machine access with an OAuth 2.0 authorisation
          server (Auth0, Okta, Keycloak, Microsoft Entra ID, Amazon Cognito and others), that is the client
          credentials grant from RFC 6749 §4.4:
        </ArticleP>
        <ArticlePre lang="bash">{`# Client authenticates with HTTP Basic (-u); scope and audience parameters vary by provider
TOKEN=$(curl -s -X POST https://auth.example.com/oauth/token \\
  -u "$CLIENT_ID:$CLIENT_SECRET" \\
  -d grant_type=client_credentials \\
  -d scope="orders:read" | jq -r .access_token)

curl -H "Authorization: Bearer $TOKEN" https://api.example.com/orders`}</ArticlePre>
        <ArticleP>
          Some providers expect <ArticleCode>client_id</ArticleCode> and <ArticleCode>client_secret</ArticleCode> as form
          fields instead of Basic authentication, and some require an <ArticleCode>audience</ArticleCode> or{' '}
          <ArticleCode>resource</ArticleCode> parameter to decide which API the token is for. Check the token endpoint
          documentation for your provider. A home-grown API with a login endpoint usually looks like this instead:
        </ArticleP>
        <ArticlePre lang="bash">{`TOKEN=$(curl -s --json '{"email":"ada@example.com","password":"..."}' \\
  https://api.example.com/auth/login | jq -r .token)`}</ArticlePre>
        <ArticleP>
          If <ArticleCode>jq</ArticleCode> prints <ArticleCode>null</ArticleCode>, the response did not contain that
          field; run the request without the pipe to see the error body. Once you have a token, inspect its{' '}
          <ArticleCode>aud</ArticleCode>, <ArticleCode>scope</ArticleCode> and <ArticleCode>exp</ArticleCode> claims in{' '}
          <a href="/" className={link}>the jwtdecode.app decoder</a> or with the{' '}
          <a href="/decode-jwt-command-line" className={link}>command-line one-liners</a> before blaming the API.
        </ArticleP>

        <ArticleH2 id="curl-jwt-token-example">curl JWT Token Example: Reusable Script</ArticleH2>
        <ArticleP>
          Keeping the token in a file rather than on the command line keeps it out of shell history. Strip
          newlines and carriage returns when reading it back:
        </ArticleP>
        <ArticlePre lang="bash">{`#!/usr/bin/env bash
set -euo pipefail

token_file="\${HOME}/.cache/api-token"
TOKEN=$(tr -d '\\r\\n' < "$token_file")

status=$(curl -s -o /tmp/resp.json -w '%{http_code}' \\
  -H "Authorization: Bearer $TOKEN" https://api.example.com/me)

echo "HTTP $status"
jq . /tmp/resp.json`}</ArticlePre>
        <ArticleP>
          The <ArticleCode>tr -d '\r\n'</ArticleCode> step is not decoration. A token file saved on Windows ends in{' '}
          <ArticleCode>\r\n</ArticleCode>; command substitution strips the newline but leaves the carriage return, and
          curl then sends it inside the header. In testing, a Node.js server rejected that request with 400 Bad
          Request before any JWT code ran.
        </ArticleP>

        <ArticleH3 id="curl-jwt-cookie">When the API expects the JWT in a cookie</ArticleH3>
        <ArticleP>
          Browser-facing APIs often read the token from an HttpOnly cookie instead of the Authorization header.
          curl sends cookies with <ArticleCode>-b</ArticleCode>, and can capture the ones a login endpoint sets with{' '}
          <ArticleCode>-c</ArticleCode>:
        </ArticleP>
        <ArticlePre lang="bash">{`# Send a known token as a cookie (the cookie name depends on the API)
curl -b "access_token=$TOKEN" https://app.example.com/api/me

# Log in, store the cookies the server sets, then reuse them
curl -c cookies.txt --json '{"email":"ada@example.com","password":"..."}' https://app.example.com/login
curl -b cookies.txt https://app.example.com/api/me`}</ArticlePre>
        <ArticleP>
          Sending a bearer header to a cookie-based API, or a cookie to a header-based one, produces the same
          "token missing" 401 as sending nothing. The{' '}
          <a href="/jwt-storage-localstorage-vs-cookie" className={link}>storage guide</a> explains why an API might
          choose either.
        </ArticleP>

        <ArticleH2 id="postman-jwt-bearer-token">Postman JWT Bearer Token: the Bearer Token Auth Type</ArticleH2>
        <ArticleP>
          For a token you already have, use Postman's <strong>Bearer Token</strong> auth type:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Open the request, or better the collection, and go to the <strong>Authorization</strong> tab.</ArticleLi>
          <ArticleLi>Set <strong>Auth Type</strong> to <strong>Bearer Token</strong>.</ArticleLi>
          <ArticleLi>In <strong>Token</strong>, enter <ArticleCode>{'{{access_token}}'}</ArticleCode> rather than pasting the raw JWT, so the value lives in a variable.</ArticleLi>
          <ArticleLi>Set individual requests to <strong>Inherit auth from parent</strong> so every request in the collection or folder uses the same token.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Postman adds the <ArticleCode>Bearer </ArticleCode> prefix itself. Pasting <ArticleCode>Bearer eyJ...</ArticleCode>{' '}
          into the Token field produces <ArticleCode>Authorization: Bearer Bearer eyJ...</ArticleCode>, a common cause of
          baffling 401s. The Postman Console shows the headers that were actually sent.
        </ArticleP>

        <ArticleH2 id="postman-jwt-bearer-authorization">Postman JWT Bearer Authorization: Signing Tokens in Postman</ArticleH2>
        <ArticleP>
          Postman also has a separate auth type called <strong>JWT Bearer</strong>. Instead of sending a token you
          paste in, it builds and signs a new JWT for each request from settings you provide:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Add JWT token to</strong>: the request header or a query parameter.</ArticleLi>
          <ArticleLi><strong>Algorithm</strong>: HS, RS, ES or PS families.</ArticleLi>
          <ArticleLi><strong>Secret</strong> for HS algorithms, with a <strong>Secret Base64 encoded</strong> checkbox if your secret is stored as Base64 (the distinction explained in the <a href="/jwt-secret-key-generator" className={link}>secret key guide</a>).</ArticleLi>
          <ArticleLi><strong>Private key</strong> for RS, ES and PS algorithms, in PKCS#8 format (<ArticleCode>BEGIN PRIVATE KEY</ArticleCode>).</ArticleLi>
          <ArticleLi><strong>Payload</strong>: the claims as JSON. Advanced options set the <strong>Request header prefix</strong> and extra <strong>JWT headers</strong> such as <ArticleCode>kid</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Use it when the client is supposed to sign its own token: testing your own HS256 API locally, or APIs that
          authenticate clients with a self-signed JWT. For tokens issued by an identity provider, use Bearer Token
          or Postman's OAuth 2.0 auth type, which can run the token request for you. If you need a key pair to try it,{' '}
          <a href="/generate-jwt-signing-keys-openssl" className={link}>generate one with OpenSSL</a>.
        </ArticleP>

        <ArticleH2 id="postman-jwt-authentication">Postman JWT Authentication: Save the Token Automatically</ArticleH2>
        <ArticleP>
          Rather than copying tokens by hand, let the login or token request store the result. Add this to that
          request's <strong>Scripts &gt; Post-response</strong> tab (called <strong>Tests</strong> in older Postman
          versions):
        </ArticleP>
        <ArticlePre lang="javascript">{`pm.test('token issued', () => {
  pm.response.to.have.status(200);
});

const body = pm.response.json();
pm.environment.set('access_token', body.access_token); // or body.token for a custom login API`}</ArticlePre>
        <ArticleP>
          Every request using <ArticleCode>{'{{access_token}}'}</ArticleCode> now picks up the fresh token. Use{' '}
          <ArticleCode>pm.collectionVariables.set</ArticleCode> instead if you prefer to keep it on the collection.
          Postman variables have a local value, which stays on your machine, and a shared value that syncs to the
          Postman cloud for your team. Keep tokens and client secrets as local values or in Postman Vault, never as
          shared values in a workspace other people can see.
        </ArticleP>

        <ArticleH3 id="postman-jwt-token-example">Postman JWT token example: tracking expiry</ArticleH3>
        <ArticleP>
          Most token endpoints return <ArticleCode>expires_in</ArticleCode> (seconds) next to the token. Storing an
          absolute expiry time lets a collection-level pre-request script warn you before requests start failing:
        </ArticleP>
        <ArticlePre lang="javascript">{`// Post-response script on the token request
const body = pm.response.json();
pm.environment.set('access_token', body.access_token);
pm.environment.set('access_token_expires_at', Date.now() + body.expires_in * 1000);

// Pre-request script on the collection
const expiresAt = Number(pm.environment.get('access_token_expires_at') || 0);
if (Date.now() > expiresAt - 30000) {
  console.warn('access_token has expired or expires within 30s: run the token request again');
}`}</ArticlePre>
        <ArticleP>
          The warning appears in the Postman Console. Checking 30 seconds early leaves a margin for clock skew
          between your machine and the API.
        </ArticleP>

        <ArticleH2 id="common-mistakes">Common Mistakes: Missing Bearer, Quotes and "Jwt is missing"</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Symptom</th>
                <th className="px-3 py-2 font-semibold">Likely cause</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {MISTAKES.map(([symptom, cause]) => (
                <tr key={symptom} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{symptom}</td>
                  <td className="px-3 py-2">{cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          For expired, wrong-audience and wrong-issuer failures, the{' '}
          <a href="/common-jwt-errors-and-fixes#expired" className={link}>common JWT errors guide</a> maps library error
          messages to causes.
        </ArticleP>

        <ArticleH3 id="401-vs-403">401 vs 403 With a JWT</ArticleH3>
        <ArticleP>
          RFC 6750 §3.1 separates the two. <strong>401 Unauthorized</strong> with{' '}
          <ArticleCode>error="invalid_token"</ArticleCode> means the token itself was rejected: missing, malformed,
          expired, badly signed, or issued for another audience. <strong>403 Forbidden</strong> with{' '}
          <ArticleCode>error="insufficient_scope"</ArticleCode> means the token was accepted but does not grant this
          operation. The fix for a 401 is a correct token; the fix for a 403 is a token with different permissions,
          which usually means requesting other scopes or changing the user's roles. Not every framework follows the
          RFC exactly, so read the <ArticleCode>WWW-Authenticate</ArticleCode> header and the server log together. The{' '}
          <a href="/how-to-debug-a-jwt" className={link}>JWT debugging routine</a> walks through the checks in order.
        </ArticleP>

        <ArticleCallout type="warning">
          Do not send JWTs in URLs (<ArticleCode>?access_token=...</ArticleCode>) unless an API gives you no choice.
          RFC 6750 discourages it because URLs end up in server logs, proxy logs and browser history. The same goes
          for Postman's JWT Bearer option to add the token to query parameters.
        </ArticleCallout>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>curl: <ArticleCode>-H "Authorization: Bearer $TOKEN"</ArticleCode> in double quotes, or <ArticleCode>--oauth2-bearer "$TOKEN"</ArticleCode> (curl 7.33.0+).</ArticleLi>
          <ArticleLi>Fetch machine tokens with the client credentials grant and <ArticleCode>jq -r .access_token</ArticleCode>; strip <ArticleCode>\r</ArticleCode> and <ArticleCode>\n</ArticleCode> from token files.</ArticleLi>
          <ArticleLi>Postman: Bearer Token auth with <ArticleCode>{'{{access_token}}'}</ArticleCode>, inherited from the collection; JWT Bearer auth only when Postman should sign the token itself.</ArticleLi>
          <ArticleLi>Save tokens with <ArticleCode>pm.environment.set</ArticleCode> in a post-response script, as local values.</ArticleLi>
          <ArticleLi>401 means the token was rejected; 403 means it was accepted but lacks permission.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
