import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How to Debug a JWT: A Step-by-Step Routine for 401 and 403 Errors',
  description: 'A repeatable routine for debugging a rejected JSON Web Token: capture the real token, read the header, check exp/nbf/iat, match iss and aud, verify the signature, then rule out authorisation problems.',
  url: 'https://jwtdecode.app/how-to-debug-a-jwt',
  mainEntityOfPage: 'https://jwtdecode.app/how-to-debug-a-jwt',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const SYMPTOMS: [symptom: string, cause: string][] = [
  ['401 on every request, even with a fresh login', 'Wrong token sent (ID token instead of access token), or the "Bearer " prefix is missing'],
  ['401 only on some servers or pods', 'Clock skew on one host, or a stale JWKS cache after key rotation'],
  ['401 a few minutes after login', 'Short exp with no working refresh, or exp issued in milliseconds on one side'],
  ['Works locally, fails in production', 'iss or aud differs between environments; signing secret differs per environment'],
  ['Signature fails after the provider rotated keys', 'Verifier cached the old JWKS and does not re-fetch on an unknown kid'],
  ['403 with a token that verifies', 'Authorisation, not authentication: missing scope or role claim, or the claim has a different name'],
  ['431 or 400 before your code runs', 'Token too large for the proxy or server header limit'],
];

export default function HowToDebugAJwtPage() {
  return (
    <>
      <SEOHead
        title="How to Debug a JWT: Step-by-Step for 401 Errors"
        description="A repeatable JWT debugging routine: capture the real token, read alg and kid, check exp, nbf and clock skew, match iss and aud, then verify the signature."
        path="/how-to-debug-a-jwt"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'How to Debug a JWT' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors & Fixes', description: 'Look up an exact library error message and its fix.' },
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'What exp, nbf, iat, iss and aud mean and how they are checked.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works for each algorithm family.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'ID tokens, access tokens and JWKS in real providers.' },
        ]}
      >
        <ArticleH1>How to Debug a JWT: A Step-by-Step Routine for 401 and 403 Errors</ArticleH1>

        <ArticleIntroBox>
          When an API rejects a token, the error message is usually a single line such as "invalid token" or a bare
          401. The quickest way to the cause is to stop guessing and walk the same checks the verifier runs, in the
          same order: is it the right token, is it well formed, which key and algorithm does it claim, is it inside
          its validity window, is it meant for this API, and does the signature hold. This guide sets out that
          routine. Each step either finds the fault or rules a whole class of faults out.
        </ArticleIntroBox>

        <ArticleH2 id="step-1-capture">Step 1: Capture the Token That Was Actually Sent</ArticleH2>
        <ArticleP>
          Debug the token on the failing request, not the one you think the client is using. Tokens in
          <ArticleCode>localStorage</ArticleCode> or a cookie are often a refresh behind, and single-page apps
          frequently hold both an ID token and an access token.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Browser</strong>: DevTools → Network → select the failing request → Headers → <ArticleCode>Authorization</ArticleCode>. Copy the value after <ArticleCode>Bearer </ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Command line</strong>: repeat the call with <ArticleCode>curl -v</ArticleCode> and read the <ArticleCode>&gt; Authorization:</ArticleCode> line that curl printed.</ArticleLi>
          <ArticleLi><strong>Server side</strong>: log the first and last eight characters of the token and its length, never the whole token, then compare with what the client sent.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          While you are there, confirm the header itself is right: the scheme must be <ArticleCode>Bearer</ArticleCode>
          followed by one space, with no quotes around the token and no trailing newline. A surprising share of
          "invalid token" reports end at this step.
        </ArticleP>

        <ArticleH2 id="step-2-structure">Step 2: Check the Structure</ArticleH2>
        <ArticleP>
          Paste the token into a decoder. A signed JWT (JWS, RFC 7515) in compact form has exactly three
          Base64url segments separated by dots. What you see tells you which branch you are on:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Three segments that decode to JSON</strong>: a normal signed JWT. Carry on.</ArticleLi>
          <ArticleLi><strong>Five segments</strong>: an encrypted JWT (<a href="/is-jwt-encrypted-jws-vs-jwe" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWE</a>, RFC 7516). The payload cannot be read without the recipient's private key, so a decoder can only show the header.</ArticleLi>
          <ArticleLi><strong>No dots at all</strong>: an opaque access token. It is not a JWT; the API has to validate it by calling the provider's introspection endpoint (RFC 7662). Some providers only issue JWT access tokens when an API audience or resource is requested at login.</ArticleLi>
          <ArticleLi><strong>Segments that will not decode</strong>: the token was truncated, URL-encoded twice, or had whitespace pasted into it. See <a href="/common-jwt-errors-and-fixes#malformed" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">malformed tokens</a>.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="step-3-header">Step 3: Read the Header: alg, kid and typ</ArticleH2>
        <ArticlePre>{`{
  "alg": "RS256",
  "kid": "2026-09-a1",
  "typ": "at+jwt"
}`}</ArticlePre>
        <ArticleUl>
          <ArticleLi><strong><ArticleCode>alg</ArticleCode></strong> must be in the verifier's allow-list. A token signed with <ArticleCode>RS256</ArticleCode> sent to a service configured for <ArticleCode>HS256</ArticleCode> (or the reverse) fails as "invalid algorithm" or as a signature failure, depending on the library. A token with <ArticleCode>"alg": "none"</ArticleCode> must always be rejected; see <a href="/none-algorithm-vulnerability" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">the none algorithm vulnerability</a>.</ArticleLi>
          <ArticleLi><strong><ArticleCode>kid</ArticleCode></strong> names the key that signed the token. Open the provider's <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS</a> URL (usually listed as <ArticleCode>jwks_uri</ArticleCode> in <ArticleCode>/.well-known/openid-configuration</ArticleCode>) and confirm a key with that exact <ArticleCode>kid</ArticleCode> is published. If it is not, the token came from another tenant or environment, or the verifier is holding a stale key set.</ArticleLi>
          <ArticleLi><strong><ArticleCode>typ</ArticleCode></strong> is <ArticleCode>JWT</ArticleCode> for most tokens. OAuth access tokens that follow RFC 9068 use <ArticleCode>at+jwt</ArticleCode>, and strict validators reject an ID token presented where an access token is expected on this basis.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="step-4-time">Step 4: Check the Time Claims</ArticleH2>
        <ArticleP>
          <ArticleCode>exp</ArticleCode>, <ArticleCode>nbf</ArticleCode> and <ArticleCode>iat</ArticleCode> are NumericDate
          values: seconds since 1970-01-01 UTC (RFC 7519 §2). Compare them with the current Unix time on the
          <em> verifying</em> machine, not your laptop.
        </ArticleP>
        <ArticlePre>{`date -u +%s                       # current Unix time in seconds
# exp must be greater than now; nbf (if present) must be less than or equal to now`}</ArticlePre>
        <ArticleH3 id="time-milliseconds">The milliseconds bug</ArticleH3>
        <ArticleP>
          A 13-digit <ArticleCode>exp</ArticleCode> such as <ArticleCode>1790000000000</ArticleCode> was written in
          milliseconds, usually from <ArticleCode>Date.now()</ArticleCode> without dividing by 1000. Most libraries
          accept it and treat the token as valid for tens of thousands of years, which hides the bug until a
          stricter verifier rejects it. Fix the issuer.
        </ArticleP>
        <ArticleH3 id="time-skew">Clock skew</ArticleH3>
        <ArticleP>
          If the token fails on one server and passes on another, compare their clocks. A verifier running a few
          minutes fast rejects fresh tokens as expired; one running slow rejects them as not yet valid. Make sure
          NTP is running and allow a small leeway, typically 30 to 60 seconds, in the verifier's configuration.
          The <a href="/common-jwt-errors-and-fixes#clock-skew" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">clock skew section</a> covers per-library settings.
        </ArticleP>

        <ArticleH2 id="step-5-audience-issuer">Step 5: Match iss and aud Exactly</ArticleH2>
        <ArticleP>
          <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode> are compared as exact strings. Trailing
          slashes, <ArticleCode>http</ArticleCode> versus <ArticleCode>https</ArticleCode>, and a tenant or region
          segment in the URL all count.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Issuer</strong>: compare the token's <ArticleCode>iss</ArticleCode> with the value your API is configured to expect, character for character. Staging and production usually differ.</ArticleLi>
          <ArticleLi><strong>Audience</strong>: <ArticleCode>aud</ArticleCode> may be a string or an array. The API's identifier must appear in it.</ArticleLi>
          <ArticleLi><strong>ID token sent to an API</strong>: in OpenID Connect the ID token's <ArticleCode>aud</ArticleCode> is the client ID of the application that logged in, not your API. If <ArticleCode>aud</ArticleCode> looks like a client ID, the client is sending the wrong token; it should send the access token.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="step-6-signature">Step 6: Verify the Signature With the Right Key</ArticleH2>
        <ArticleP>
          Only now check the signature. Everything above can be read without a key, and a signature failure is
          much easier to explain once you know which key and algorithm the token expects.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>HS256/384/512</strong>: the secret must be the same bytes on both sides. Some providers display the secret base64-encoded; if the issuer used the decoded bytes and the verifier uses the text as shown (or the reverse), every signature fails. Per-environment secrets are the other common cause.</ArticleLi>
          <ArticleLi><strong>RS256 and PS256</strong>: both use an RSA key pair, but the padding differs. A token signed with <ArticleCode>PS256</ArticleCode> will not verify as <ArticleCode>RS256</ArticleCode>. See <a href="/ps256-vs-rs256" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">PS256 vs RS256</a>.</ArticleLi>
          <ArticleLi><strong>ES256</strong>: JWT requires the raw 64-byte R‖S signature, not DER. Signers that emit DER produce tokens that no standards-compliant verifier accepts. See <a href="/es256-explained" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">ES256 explained</a>.</ArticleLi>
          <ArticleLi><strong>Key rotation</strong>: if failures began when the provider rotated keys, the verifier is probably caching the JWKS and not re-fetching when it meets an unknown <ArticleCode>kid</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="info">
          On <a href="/" className="underline underline-offset-2">the jwtdecode.app decoder</a>, the Verify tab checks
          HS, RS, PS and ES signatures with the Web Crypto API in your browser. Paste the shared secret or the PEM
          public key; the algorithm is taken from the token header. Nothing is uploaded.
        </ArticleCallout>

        <ArticleH2 id="step-7-authorisation">Step 7: If It Verifies, Check Authorisation</ArticleH2>
        <ArticleP>
          A token that passes every check above is authentic and current. If the API still refuses it, the problem
          is what the token is allowed to do. A 403 usually means exactly this; a 401 at this stage usually means
          the middleware is not reading the token you think it is.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Scopes</strong>: RFC 9068 uses a space-separated <ArticleCode>scope</ArticleCode> string; some providers use an <ArticleCode>scp</ArticleCode> array instead. Check which one your policy reads.</ArticleLi>
          <ArticleLi><strong>Roles and groups</strong>: these are private claims, often namespaced (for example <ArticleCode>https://example.com/roles</ArticleCode>). A missing namespace or a renamed claim looks like "user has no role".</ArticleLi>
          <ArticleLi><strong>Header size</strong>: <a href="/jwt-size-limit" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">large tokens</a> full of group claims can exceed header limits. nginx's default <ArticleCode>large_client_header_buffers</ArticleCode> allows 8 KB per header line and Node.js defaults to 16 KB for all headers; beyond that the request fails with 400 or 431 before your code runs.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="symptom-table">Symptom to Likely Cause</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Symptom</th>
                <th className="px-3 py-2 font-semibold">Most likely cause</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {SYMPTOMS.map(([symptom, cause]) => (
                <tr key={symptom} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{symptom}</td>
                  <td className="px-3 py-2">{cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="safe-debugging">Debugging Production Tokens Safely</ArticleH2>
        <ArticleP>
          A live access token is a <a href="/jwt-vs-bearer-token" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">bearer credential</a>: whoever holds it can use it until it expires. Treat it like
          a password while you debug.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Use a decoder that runs locally. You can check any online tool yourself: open DevTools → Network, paste a token, and confirm no request carries it; or load the page, go offline, and see whether decoding still works. See <a href="/decode-jwt-without-a-server" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">decoding a JWT without a server</a>.</ArticleLi>
          <ArticleLi>Never paste tokens into tickets, chat or logs. Share the decoded header and non-sensitive claims instead.</ArticleLi>
          <ArticleLi>Prefer an expired token or a token from a test tenant when you only need to see its shape.</ArticleLi>
          <ArticleLi>If a token has been exposed, <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">revoke</a> the session or refresh token that produced it rather than waiting for <ArticleCode>exp</ArticleCode>.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Debug a JWT in the verifier's order: capture the token that was really sent, confirm it is a three-part
          JWS, read <ArticleCode>alg</ArticleCode> and <ArticleCode>kid</ArticleCode>, check the time claims against the
          server's clock, match <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode> exactly, verify the
          signature with the key the header names, and only then look at <a href="/jwt-scopes-vs-roles" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">scopes</a> and roles. If you have an exact
          error message, the <a href="/common-jwt-errors-and-fixes#error-lookup" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">error lookup table</a> maps it to its cause.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
