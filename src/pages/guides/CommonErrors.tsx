import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Common JWT Errors and How to Fix Them',
  description: 'Troubleshooting guide for frequent JWT errors, malformed token, invalid signature, expired token, wrong audience, wrong issuer, clock skew, and algorithm issues.',
  url: 'https://jwtdecode.app/common-jwt-errors-and-fixes',
  mainEntityOfPage: 'https://jwtdecode.app/common-jwt-errors-and-fixes',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const ERROR_LOOKUP: [message: string, library: string, anchor: string, label: string][] = [
  ['JsonWebTokenError: jwt malformed', 'jsonwebtoken', 'malformed', 'Malformed JWT'],
  ['DecodeError: Not enough segments', 'PyJWT', 'malformed', 'Malformed JWT'],
  ['token is malformed', 'golang-jwt', 'malformed', 'Malformed JWT'],
  ['JsonWebTokenError: invalid signature', 'jsonwebtoken', 'invalid-signature', 'Invalid signature'],
  ['InvalidSignatureError: Signature verification failed', 'PyJWT', 'invalid-signature', 'Invalid signature'],
  ['token signature is invalid', 'golang-jwt', 'invalid-signature', 'Invalid signature'],
  ['TokenExpiredError: jwt expired', 'jsonwebtoken', 'expired', 'Expired token'],
  ['ExpiredSignatureError: Signature has expired', 'PyJWT', 'expired', 'Expired token'],
  ['token has invalid claims: token is expired', 'golang-jwt', 'expired', 'Expired token'],
  ['NotBeforeError: jwt not active', 'jsonwebtoken', 'nbf', 'Not yet valid'],
  ['ImmatureSignatureError: The token is not yet valid (nbf)', 'PyJWT', 'nbf', 'Not yet valid'],
  ['JsonWebTokenError: jwt audience invalid. expected: …', 'jsonwebtoken', 'wrong-audience', 'Wrong audience'],
  ["InvalidAudienceError: Audience doesn't match", 'PyJWT', 'wrong-audience', 'Wrong audience'],
  ['InvalidAudienceError: Invalid audience', 'PyJWT', 'wrong-audience', 'Wrong audience'],
  ['JsonWebTokenError: jwt issuer invalid. expected: …', 'jsonwebtoken', 'wrong-issuer', 'Wrong issuer'],
  ['InvalidIssuerError: Invalid issuer', 'PyJWT', 'wrong-issuer', 'Wrong issuer'],
  ['JsonWebTokenError: invalid algorithm', 'jsonwebtoken', 'unsupported-algorithm', 'Unsupported algorithm'],
  ['InvalidAlgorithmError: The specified alg value is not allowed', 'PyJWT', 'unsupported-algorithm', 'Unsupported algorithm'],
  ['TypeError: jwt_decode is not a function', 'jwt-decode (npm)', 'jwt-decode-not-a-function', 'jwt-decode is not a function'],
  ["SyntaxError: The requested module 'jwt-decode' does not provide an export named 'default'", 'jwt-decode (npm)', 'jwt-decode-not-a-function', 'jwt-decode is not a function'],
  ['InvalidTokenError: Invalid token specified: missing part #2', 'jwt-decode (npm)', 'malformed', 'Malformed JWT'],
];

export default function CommonErrorsPage() {
  return (
    <>
      <SEOHead
        title="Common JWT Errors and How to Fix Them"
        description="Fix JWT errors by their exact message: jwt malformed, invalid signature, jwt expired, jwt-decode is not a function, wrong audience or issuer, clock skew."
        path="/common-jwt-errors-and-fixes"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Common JWT Errors & Fixes' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-09-24"
        relatedLinks={[
          { to: '/how-to-debug-a-jwt', label: 'How to Debug a JWT', description: 'A step-by-step routine for tracking down any rejected token.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works.' },
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Understanding exp, aud, iss, and other claims.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Preventing JWT issues in production.' },
        ]}
      >
        <ArticleH1>Common JWT Errors and How to Fix Them</ArticleH1>

        <ArticleIntroBox>
          JWT errors can be cryptic, a library error message like "invalid signature" or "jwt expired"
          rarely tells you exactly what went wrong or how to fix it. This guide covers the most frequent
          JWT errors, their root causes, and practical steps to diagnose and resolve each one. It also
          covers how to use browser DevTools effectively to inspect JWT issues and how environment
          misconfigurations cause a distinct class of errors that look like JWT bugs but aren't.
        </ArticleIntroBox>

        <ArticleH2 id="error-lookup">Error Message Lookup</ArticleH2>
        <ArticleP>
          Find the exact message your library printed, then jump to the section that explains it. Messages are
          quoted from the current major versions of each library: <ArticleCode>jsonwebtoken</ArticleCode> (Node.js),
          <ArticleCode>PyJWT</ArticleCode> 2.x (Python) and <ArticleCode>golang-jwt/jwt</ArticleCode> v5 (Go).
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Error message</th>
                <th className="px-3 py-2 font-semibold">Library</th>
                <th className="px-3 py-2 font-semibold">Section</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {ERROR_LOOKUP.map(([message, library, anchor, label]) => (
                <tr key={message + library} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-rose-700 dark:text-rose-400 break-words">{message}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{library}</td>
                  <td className="px-3 py-2"><a href={`#${anchor}`} className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">{label}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="malformed">Malformed JWT / Invalid Format</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">JsonWebTokenError: jwt malformed</code>,{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Invalid token format</code>, or{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Not enough or too many segments</code>.
          The decoder on this tool shows "Malformed JWT" or a segment count other than 3/3.
        </ArticleP>
        <ArticleH3>Root causes</ArticleH3>
        <ArticleUl>
          <ArticleLi>Token was truncated when copied from a log, URL, or storage</ArticleLi>
          <ArticleLi>Extra whitespace, newlines, or line breaks were included when copying</ArticleLi>
          <ArticleLi>The "Bearer " prefix from an Authorization header was left in</ArticleLi>
          <ArticleLi>The token was double-encoded (URL-encoded or JSON-stringified)</ArticleLi>
          <ArticleLi>A non-JWT string (opaque session token, API key) was passed to a JWT parser</ArticleLi>
        </ArticleUl>
        <ArticleH3>Fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>Verify the token has exactly three dot-separated segments</ArticleLi>
          <ArticleLi>Strip the <ArticleCode>Bearer </ArticleCode> prefix before parsing</ArticleLi>
          <ArticleLi>Trim whitespace from both ends of the token string</ArticleLi>
          <ArticleLi>If the token came from a URL, URL-decode it first</ArticleLi>
          <ArticleLi>If the token was stored as a JSON string, parse the JSON to get the raw token</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="invalid-signature">Invalid Signature</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">JsonWebTokenError: invalid signature</code>,{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Signature verification failed</code>, or{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">JWT signature does not match</code>.
        </ArticleP>
        <ArticleH3>Root causes</ArticleH3>
        <ArticleUl>
          <ArticleLi>Wrong secret or key was used for verification</ArticleLi>
          <ArticleLi>The key is correct but in the wrong format (e.g., raw string vs. base64-encoded secret)</ArticleLi>
          <ArticleLi>The token payload was modified after signing</ArticleLi>
          <ArticleLi>The algorithm used for verification doesn't match the <ArticleCode>alg</ArticleCode> header</ArticleLi>
          <ArticleLi>Key rotation happened and you're using an old key, check the <ArticleCode>kid</ArticleCode> header</ArticleLi>
          <ArticleLi>The token was signed with a <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">private key</a> but you have a different private key (not the public key)</ArticleLi>
        </ArticleUl>
        <ArticleH3>Fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>Confirm the exact secret or key used by the issuer matches what you're using for verification</ArticleLi>
          <ArticleLi>Check the <ArticleCode>alg</ArticleCode> header claim and match it to your library configuration</ArticleLi>
          <ArticleLi>If using RS256/ES256, ensure you have the public key (not the private key) for verification</ArticleLi>
          <ArticleLi>Use the <ArticleCode>kid</ArticleCode> header to look up the correct key from the issuer's <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS endpoint</a></ArticleLi>
          <ArticleLi>If the issuer recently rotated keys, fetch a fresh copy of the JWKS</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="expired">Expired Token (jwt expired)</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">TokenExpiredError: jwt expired</code>.
          The Claims tab shows an "Expired" badge on the <ArticleCode>exp</ArticleCode> claim.
        </ArticleP>
        <ArticleH3>Root causes</ArticleH3>
        <ArticleUl>
          <ArticleLi>The token's <ArticleCode>exp</ArticleCode> timestamp is in the past</ArticleLi>
          <ArticleLi>Client clock is significantly ahead of the server clock</ArticleLi>
          <ArticleLi>Token was cached too aggressively and is being reused after it expired</ArticleLi>
          <ArticleLi>Refresh token flow is not working, so expired access tokens aren't being replaced</ArticleLi>
        </ArticleUl>
        <ArticleH3>Fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>In development: issue a new token or increase the expiry for testing (but fix the root cause)</ArticleLi>
          <ArticleLi>Check server and client clock synchronization (NTP)</ArticleLi>
          <ArticleLi>Verify your <a href="/jwt-refresh-token-pattern" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">refresh token</a> flow is being triggered before access tokens expire</ArticleLi>
          <ArticleLi>In production: never just extend the expiry to work around the issue, investigate why tokens aren't being refreshed</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          A common anti-pattern is extending token expiry to "fix" expiration errors. This reduces
          the security benefit of short-lived tokens. Always fix the refresh flow instead.
        </ArticleCallout>

        <ArticleH2 id="nbf">Not Yet Valid (jwt not active)</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">NotBeforeError: jwt not active</code>.
          The Claims tab shows "Not Yet Valid" on the <ArticleCode>nbf</ArticleCode> claim.
        </ArticleP>
        <ArticleH3>Root causes and fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>The <ArticleCode>nbf</ArticleCode> claim is set to a future time, this is intentional if the token should only activate later</ArticleLi>
          <ArticleLi>Clock skew between issuer and verifier, add a clock skew tolerance of 30–60 seconds in your library configuration</ArticleLi>
          <ArticleLi>If <ArticleCode>nbf</ArticleCode> is unintentionally in the future, check the issuer's clock and token generation logic</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="wrong-audience">Wrong Audience</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">JsonWebTokenError: jwt audience invalid</code>{' '}
          or <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Audience validation failed</code>.
        </ArticleP>
        <ArticleH3>Root causes and fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>Your service's audience identifier doesn't match the <ArticleCode>aud</ArticleCode> claim in the token</ArticleLi>
          <ArticleLi>Token was issued for a different service and is being replayed against your API</ArticleLi>
          <ArticleLi>Your audience configuration uses a different format (URL vs. client ID) than the issuer uses</ArticleLi>
          <ArticleLi>Fix: confirm the exact audience value your issuer includes and configure your library to match it exactly</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="wrong-issuer">Wrong Issuer</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">JsonWebTokenError: jwt issuer invalid</code>{' '}
          or <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Issuer validation failed</code>.
        </ArticleP>
        <ArticleH3>Root causes and fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>The token's <ArticleCode>iss</ArticleCode> claim doesn't match your expected issuer string</ArticleLi>
          <ArticleLi>Common mismatch: trailing slash in one but not the other (<ArticleCode>https://auth.example.com</ArticleCode> vs <ArticleCode>https://auth.example.com/</ArticleCode>)</ArticleLi>
          <ArticleLi>Token was issued by a different environment (staging vs production)</ArticleLi>
          <ArticleLi>Fix: copy the exact issuer URL from a known-good token's <ArticleCode>iss</ArticleCode> claim and use that as your expected value</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="clock-skew">Clock Skew Errors</ArticleH2>
        <ArticleP>
          Clock skew occurs when the clocks on the issuing server and the verifying server are not
          synchronized. Even a difference of 2–3 minutes can cause tokens to appear expired immediately
          after issuance, or not-yet-valid when they should be active.
        </ArticleP>
        <ArticleH3>Why clocks drift</ArticleH3>
        <ArticleP>
          NTP (Network Time Protocol) keeps server clocks accurate, but drift is inevitable. In cloud
          environments a 1–5 second drift is normal. In Docker containers or VMs that are paused and
          resumed, the internal clock can drift significantly, sometimes by minutes, until the next
          NTP sync. A container that is not configured to use the host clock or an NTP server will
          drift continuously.
        </ArticleP>
        <ArticleH3>Diagnosing clock skew</ArticleH3>
        <ArticleP>
          Paste the token into this tool. In the Claims tab, look at the <ArticleCode>exp</ArticleCode>{' '}
          and <ArticleCode>iat</ArticleCode> timestamps. If the token shows as expired but was just
          issued, the difference between the current time and <ArticleCode>exp</ArticleCode> tells you
          the approximate clock skew. If the token expires 1 hour after issuance but shows as expired
          2 minutes after it was issued, the verifier's clock is running ~58 minutes fast.
        </ArticleP>
        <ArticleH3>Fixes</ArticleH3>
        <ArticleUl>
          <ArticleLi>
            <strong>Configure clock skew tolerance in your library:</strong> Most JWT libraries accept
            a <ArticleCode>clockTolerance</ArticleCode> or <ArticleCode>leeway</ArticleCode> option.
            Set it to 30–60 seconds. Do not set it higher, a large tolerance defeats the purpose of
            short-lived tokens.
          </ArticleLi>
          <ArticleLi>
            <strong>On Linux servers:</strong> Verify NTP is running with{' '}
            <ArticleCode>timedatectl status</ArticleCode>. If <ArticleCode>NTP service: inactive</ArticleCode>,
            enable it: <ArticleCode>timedatectl set-ntp true</ArticleCode>.
          </ArticleLi>
          <ArticleLi>
            <strong>In Docker containers:</strong> Containers share the host kernel clock by default.
            If the host clock is correct, container clocks should match. Verify the host NTP sync
            first. If the container is running in a VM, also verify the hypervisor clock sync.
          </ArticleLi>
          <ArticleLi>
            <strong>In Kubernetes:</strong> Pod clocks inherit from the node. Check node time sync
            with <ArticleCode>kubectl get nodes -o wide</ArticleCode> and verify the node's NTP
            configuration in your cloud provider's OS configuration.
          </ArticleLi>
        </ArticleUl>
        <ArticlePre>{`# Check NTP status (Linux)
timedatectl status

# Force NTP sync immediately (systemd-timesyncd)
systemctl restart systemd-timesyncd

# Check clock offset (chrony)
chronyc tracking | grep "System time"

# In a Docker container, check if host clock is correct
date && docker run --rm alpine date`}</ArticlePre>

        <ArticleH2 id="unsupported-algorithm">Unsupported Algorithm</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          Library throws: <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Invalid algorithm</code>,{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">Algorithm not supported</code>, or the decoder
          shows an unrecognized <ArticleCode>alg</ArticleCode> value.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>The token uses an algorithm your library doesn't support, check the library's documentation for supported algorithms</ArticleLi>
          <ArticleLi>Your library is configured to only accept specific algorithms and the token's <ArticleCode>alg</ArticleCode> is not in that list</ArticleLi>
          <ArticleLi>The token has <ArticleCode>"alg": "none"</ArticleCode>: this should always be rejected</ArticleLi>
          <ArticleLi>Fix: update the library or configure the allowed algorithm list to include the required algorithm</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwt-decode-not-a-function">jwt-decode Is Not a Function</ArticleH2>
        <ArticleH3>Symptoms</ArticleH3>
        <ArticleP>
          After installing or upgrading the <ArticleCode>jwt-decode</ArticleCode> npm package, the app throws{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">TypeError: jwt_decode is not a function</code>,{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">jwtDecode is not a function</code>, or a bundler variant such as{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">(0 , jwt_decode__WEBPACK_IMPORTED_MODULE_0__.default) is not a function</code>.
          Native ES modules in Node.js fail earlier with{' '}
          <code className="font-mono text-xs text-rose-700 dark:text-rose-400">SyntaxError: The requested module 'jwt-decode' does not provide an export named 'default'</code>,
          and TypeScript reports that the module has no default export.
        </ArticleP>
        <ArticleH3>Root cause</ArticleH3>
        <ArticleP>
          Version 4 of <ArticleCode>jwt-decode</ArticleCode> removed the default export. The function is now a named
          export called <ArticleCode>jwtDecode</ArticleCode>. Code written for v3 (and most older tutorials) imports a
          default that no longer exists, so the imported value is <ArticleCode>undefined</ArticleCode>.
        </ArticleP>
        <ArticlePre>{`// v3 and older tutorials: breaks on v4
import jwt_decode from 'jwt-decode';
const claims = jwt_decode(token);`}</ArticlePre>
        <ArticleH3>Fixes</ArticleH3>
        <ArticlePre>{`// ES modules / TypeScript (jwt-decode v4)
import { jwtDecode } from 'jwt-decode';
const claims = jwtDecode(token);                     // payload
const header = jwtDecode(token, { header: true });   // header

// CommonJS
const { jwtDecode } = require('jwt-decode');`}</ArticlePre>
        <ArticleUl>
          <ArticleLi>If you cannot touch every call site yet, pin the old major version: <ArticleCode>npm install jwt-decode@3</ArticleCode>.</ArticleLi>
          <ArticleLi>In v4, malformed input throws <ArticleCode>InvalidTokenError</ArticleCode> (also a named export), so wrap calls in <ArticleCode>try/catch</ArticleCode>.</ArticleLi>
          <ArticleLi>If the typed result is <ArticleCode>unknown</ArticleCode>-shaped, pass a type: <ArticleCode>{'jwtDecode<JwtPayload>(token)'}</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          <ArticleCode>jwt-decode</ArticleCode> only Base64url-decodes the token. It never checks the signature, so its
          output is fine for reading an expiry time in the browser but must not drive authorisation. Verify on the
          server with a library such as <ArticleCode>jose</ArticleCode> or <ArticleCode>jsonwebtoken</ArticleCode>.
        </ArticleCallout>

        <ArticleH2 id="devtools">Debugging JWT Issues with Browser DevTools</ArticleH2>
        <ArticleP>
          Browser DevTools is the fastest way to capture a live token from a web application and
          diagnose what's wrong with it. Here is the standard workflow:
        </ArticleP>
        <ArticleH3>Step 1: Capture the token from a network request</ArticleH3>
        <ArticleUl>
          <ArticleLi>Open DevTools (F12 or Cmd+Option+I on Mac)</ArticleLi>
          <ArticleLi>Go to the <strong>Network</strong> tab</ArticleLi>
          <ArticleLi>Perform the action that triggers the failing API call (e.g., load the page, click a button)</ArticleLi>
          <ArticleLi>Find the failing request in the network list, look for a 401 or 403 status</ArticleLi>
          <ArticleLi>Click the request and go to the <strong>Headers</strong> tab</ArticleLi>
          <ArticleLi>Find the <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">Authorization</code> header, the value looks like <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">Bearer eyJhbGci...</code></ArticleLi>
          <ArticleLi>Copy everything after "Bearer " (the three-segment JWT)</ArticleLi>
        </ArticleUl>
        <ArticleH3>Step 2: Inspect the token</ArticleH3>
        <ArticleP>
          Paste the copied token into this tool. Check:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Claims tab:</strong> Is <ArticleCode>exp</ArticleCode> in the past? Does <ArticleCode>aud</ArticleCode> match your API? Does <ArticleCode>iss</ArticleCode> match the expected issuer?</ArticleLi>
          <ArticleLi><strong>Decoded tab:</strong> Are the header fields (<ArticleCode>alg</ArticleCode>, <ArticleCode>kid</ArticleCode>) what you expect?</ArticleLi>
          <ArticleLi><strong>Verify tab:</strong> If you have the signing key, verify the signature to rule out tampering</ArticleLi>
        </ArticleUl>
        <ArticleH3>Step 3: Check storage</ArticleH3>
        <ArticleP>
          If the token in the Authorization header looks correct but the request still fails, check
          where the token is coming from. In the DevTools Application tab:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Cookies:</strong> If the token is in a cookie, check the cookie's domain, path, and expiry</ArticleLi>
          <ArticleLi><strong>Local Storage / Session Storage:</strong> If the token is stored here, check whether it has been refreshed recently</ArticleLi>
        </ArticleUl>
        <ArticlePre>{`// Find all JWTs in localStorage (browser console)
Object.keys(localStorage)
  .filter(k => localStorage.getItem(k)?.startsWith('eyJ'))
  .forEach(k => console.log(k, localStorage.getItem(k)))`}</ArticlePre>

        <ArticleH2 id="environment-issues">Environment-Specific Issues</ArticleH2>
        <ArticleP>
          A distinct class of JWT errors stems not from the token itself but from mismatches between
          the configuration of different deployment environments. These errors are often misdiagnosed
          as JWT library bugs.
        </ArticleP>
        <ArticleH3>Staging vs production token mix-ups</ArticleH3>
        <ArticleP>
          A token issued by a staging auth server (e.g., <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">iss: https://staging-auth.example.com/</code>)
          will fail validation against a production API configured to accept only{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">iss: https://auth.example.com/</code>.
          This happens most often when a developer copies a token from a staging environment and
          tests it against a production endpoint, or when environment variables are misconfigured
          in a deployment pipeline.
        </ArticleP>
        <ArticleP>
          <strong>Diagnose:</strong> Check the <ArticleCode>iss</ArticleCode> claim in the token
          and compare it to the <ArticleCode>EXPECTED_ISSUER</ArticleCode> configuration in your
          API service. They must match exactly (including trailing slashes and protocol).
        </ArticleP>
        <ArticleH3>Mismatched iss due to environment config</ArticleH3>
        <ArticleP>
          When services are containerised, the auth service URL seen by the issuer may differ from
          the URL expected by the verifier. For example, an auth service running inside a Docker
          Compose network might issue tokens with{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">iss: http://auth-service:8080/</code>{' '}
          (an internal hostname), while an API service configured for production expects{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">iss: https://auth.example.com/</code>.
        </ArticleP>
        <ArticleP>
          <strong>Fix:</strong> Configure the auth service to always issue tokens with the
          public-facing issuer URL, regardless of the internal hostname used for the service.
          The <ArticleCode>iss</ArticleCode> claim should reflect the external, canonical URL of
          the auth server.
        </ArticleP>
        <ArticleH3>Docker container clock drift causing exp failures</ArticleH3>
        <ArticleP>
          Docker containers can experience clock drift after the host is suspended, migrated, or
          restarted. If a container is running in a development environment (a laptop that is
          suspended and resumed), the container's clock can drift by minutes before the next
          NTP sync. This causes tokens with <a href="/jwt-expiration-time" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">short expiry</a> times to fail immediately.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Verify host clock accuracy: <ArticleCode>date</ArticleCode> on the host vs. inside the container</ArticleLi>
          <ArticleLi>Restart the container after a host suspend/resume to force a clock re-sync</ArticleLi>
          <ArticleLi>In CI environments, ensure the runner's NTP is active before running JWT integration tests</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="info">
          When debugging JWT failures in a microservices environment, always check the clock on
          both the issuing service and the verifying service. A 2-minute drift is enough to cause
          intermittent failures that are nearly impossible to reproduce in development.
        </ArticleCallout>
      </ArticleLayout>
    </>
  );
}
