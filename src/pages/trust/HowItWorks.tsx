import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticleCallout, ArticleIntroBox, ArticlePre } from '../../components/ArticleLayout';

export default function HowItWorksPage() {
  return (
    <>
      <SEOHead
        title="How JWT Decode Works"
        description="Technical explanation of how jwtdecode.app decodes, parses, and verifies JWTs — entirely in your browser using JavaScript and the Web Crypto API."
        path="/how-it-works"
      />
      <ArticleLayout breadcrumbs={[{ label: 'How It Works' }]}>
        <ArticleH1>How JWT Decode Works</ArticleH1>

        <ArticleIntroBox>
          JWT Decode is a browser-based tool — all processing happens on your device, in JavaScript,
          using the browser's built-in APIs. No server receives your token content. This page explains
          the technical implementation for those who want to understand or verify exactly what happens
          when you use the tool.
        </ArticleIntroBox>

        <ArticleH2 id="decoding">How Decoding Works</ArticleH2>
        <ArticleP>
          When you paste a JWT, the tool immediately splits the token on the{' '}
          <ArticleCode>.</ArticleCode> character to find the three segments. It then
          Base64url-decodes the header and payload segments into UTF-8 strings and parses them
          as JSON. This is pure string manipulation — no network requests, no cryptography.
        </ArticleP>
        <ArticlePre>{`// Simplified decoding logic
function decodeJwt(token) {
  const [headerB64, payloadB64, signature] = token.split('.')

  const header  = JSON.parse(base64urlDecode(headerB64))
  const payload = JSON.parse(base64urlDecode(payloadB64))

  return { header, payload, raw: { headerB64, payloadB64, signature } }
}

function base64urlDecode(str) {
  // Replace url-safe chars, add padding, then decode
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=')
  return new TextDecoder().decode(
    Uint8Array.from(atob(padded), c => c.charCodeAt(0))
  )
}`}</ArticlePre>
        <ArticleP>
          The decoded header and payload objects are then passed to the various view components
          (Decoded, Claims, Raw) which render them using React. The decoding runs synchronously on
          every keystroke — there is no debounce or async operation involved.
        </ArticleP>

        <ArticleH2 id="signature-verification">How Signature Verification Works</ArticleH2>
        <ArticleP>
          When you use the Verify tab, the tool uses the browser's{' '}
          <ArticleCode>window.crypto.subtle</ArticleCode> API — the Web Crypto API — to perform
          the cryptographic signature check. This API is a native browser capability; no JavaScript
          cryptography library is used.
        </ArticleP>

        <ArticleH3>HMAC (HS256/HS384/HS512)</ArticleH3>
        <ArticleP>
          For HMAC algorithms, the tool imports the secret as a raw key into the Web Crypto API
          and computes HMAC-SHA{'{256|384|512}'} over the signing input
          (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">headerB64 + "." + payloadB64</code>),
          then compares the result to the token's signature using a constant-time comparison.
        </ArticleP>
        <ArticlePre>{`// HMAC verification (pseudocode)
const key = await crypto.subtle.importKey(
  'raw',
  textEncoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['verify']
)
const sigBytes = base64urlToBytes(signatureB64)
const signingInput = textEncoder.encode(headerB64 + '.' + payloadB64)
const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, signingInput)`}</ArticlePre>

        <ArticleH3>RSA (RS256/RS384/RS512/PS256/PS384/PS512)</ArticleH3>
        <ArticleP>
          For RSA and RSA-PSS algorithms, the tool parses the PEM public key you provide, extracts
          the DER-encoded key bytes, imports them via <ArticleCode>crypto.subtle.importKey</ArticleCode>
          with the SPKI format, and then calls <ArticleCode>crypto.subtle.verify</ArticleCode>.
        </ArticleP>

        <ArticleH3>ECDSA (ES256/ES384/ES512)</ArticleH3>
        <ArticleP>
          For ECDSA, the tool follows the same pattern but uses the EC algorithm family with the
          appropriate named curve (P-256, P-384, P-521).
        </ArticleP>

        <ArticleCallout type="success">
          All cryptographic operations use <code className="font-mono text-xs">window.crypto.subtle</code>,
          which runs in the browser's secure runtime. No keys are transmitted. No custom
          cryptography is implemented — only standard Web Crypto API calls.
        </ArticleCallout>

        <ArticleH2 id="privacy-architecture">Privacy Architecture</ArticleH2>
        <ArticleP>
          The tool is deliberately designed so that token data cannot reach the server:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Static site:</strong> The site is served as a static HTML/CSS/JS bundle
            from a CDN-backed server. There is no application server that receives request bodies.
            The server only receives HTTP requests for static asset files.
          </ArticleLi>
          <ArticleLi>
            <strong>No form submissions:</strong> Token input is an HTML textarea whose value
            is never submitted to the server. It is handled entirely by React event handlers
            running in the browser.
          </ArticleLi>
          <ArticleLi>
            <strong>No URL parameters:</strong> Token content is never embedded in the URL,
            so it cannot appear in server access logs or browser history.
          </ArticleLi>
          <ArticleLi>
            <strong>No external API calls for token processing:</strong> The JavaScript code
            makes no fetch or XMLHttpRequest calls with token content. The only outbound network
            requests from the page are for page-view analytics (Google Analytics) and advertisements
            (Google AdSense), neither of which receives any JWT data. Fonts are self-hosted.
          </ArticleLi>
          <ArticleLi>
            <strong>Memory-only state:</strong> Token content lives only in React component state.
            It is not written to localStorage, sessionStorage, IndexedDB, or cookies. Closing the
            tab clears all token data.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          You do not have to take this on trust: the full source code is public on{' '}
          <a href="https://github.com/jwtdecode/jwt-decoder" rel="noopener" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">GitHub</a>{' '}
          under the MIT licence. Decoding lives in <ArticleCode>src/utils/jwt.ts</ArticleCode> and
          verification in <ArticleCode>src/utils/crypto.ts</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="limitations">Tool Limitations</ArticleH2>
        <ArticleUl>
          <ArticleLi>
            <strong>JWE (encrypted JWTs) not supported:</strong> JSON Web Encryption tokens have a
            different structure from plain JWTs (JWS). They have five segments and require a decryption
            key. This tool decodes JWS tokens only — if you paste a JWE token, it will appear malformed
            since the encrypted structure cannot be decoded without the decryption key.
          </ArticleLi>
          <ArticleLi>
            <strong>Verification is for inspection only:</strong> Client-side verification using this
            tool is suitable for debugging. It is not a substitute for server-side verification in
            a trusted environment. The security model for authorization decisions requires server-side
            verification with a trusted JWT library.
          </ArticleLi>
          <ArticleLi>
            <strong>Key format requirements:</strong> For RSA and EC verification, public keys must be
            in PEM SPKI format (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">-----BEGIN PUBLIC KEY-----</code>).
            PKCS#1 (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">-----BEGIN RSA PUBLIC KEY-----</code>) is not supported
            by the Web Crypto API's SPKI import format.
          </ArticleLi>
          <ArticleLi>
            <strong>alg=none:</strong> Tokens with <ArticleCode>alg=none</ArticleCode> are flagged
            as unsecured. The Verify tab will show an appropriate warning — these tokens have no
            cryptographic signature to verify.
          </ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
