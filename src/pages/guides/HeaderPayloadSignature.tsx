import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Header, Payload and Signature Explained',
  description: 'A deep dive into the three parts of a JWT, header fields, payload claims, Base64url encoding, and how the cryptographic signature is computed and verified.',
  url: 'https://jwtdecode.app/jwt-header-payload-signature-explained',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-header-payload-signature-explained',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-05-05',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function HeaderPayloadSignaturePage() {
  return (
    <>
      <SEOHead
        title="JWT Header, Payload and Signature Explained"
        description="Deep dive into the three parts of a JWT — header fields, payload claims, Base64url encoding, and how the cryptographic signature is computed and verified."
        path="/jwt-header-payload-signature-explained"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Header, Payload & Signature' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-05-05"
        relatedLinks={[
          { to: '/what-is-a-jwt', label: 'What is a JWT?', description: 'Introduction to JSON Web Tokens and their use cases.' },
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Reference for all standard registered claims.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How the signature is verified in practice.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Choosing the right signing algorithm.' },
        ]}
      >
        <ArticleH1>JWT Header, Payload and Signature Explained</ArticleH1>

        <ArticleIntroBox>
          A JSON Web Token has exactly three parts. Each is a Base64url-encoded string, and the parts
          are joined with dots to form the compact token format. Understanding what each part contains,
          how it is encoded, and what it proves, or does not prove, is the foundation of working
          correctly with JWTs.
        </ArticleIntroBox>

        <ArticleH2 id="the-three-parts">The Three-Part Structure</ArticleH2>
        <ArticlePre lang="jwt">{`HEADER.PAYLOAD.SIGNATURE

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcxNjQ3NzM2MSwiZXhwIjoxNzE2NDgwOTYxfQ
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}</ArticlePre>
        <ArticleP>
          The first segment is the header. The second is the payload. The third is the signature.
          All three are Base64url-encoded. The header and payload are Base64url-encoded JSON objects.
          The signature is Base64url-encoded raw binary cryptographic output.
        </ArticleP>

        <ArticleH2 id="base64url">What is Base64url Encoding?</ArticleH2>
        <ArticleP>
          Base64url is a variant of standard Base64 designed to be safe in URLs, HTTP headers, and cookies.
          The differences from standard Base64:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><ArticleCode>+</ArticleCode> in standard Base64 becomes <ArticleCode>-</ArticleCode> in Base64url</ArticleLi>
          <ArticleLi><ArticleCode>/</ArticleCode> in standard Base64 becomes <ArticleCode>_</ArticleCode> in Base64url</ArticleLi>
          <ArticleLi>Padding characters (<ArticleCode>=</ArticleCode>) are omitted</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="danger">
          Base64url is an <strong>encoding</strong>, not encryption. It is trivially reversible
         , anyone can decode a Base64url string without a key. JWT payloads are therefore
          readable by anyone who has the token. Never store secrets in JWT claims.
        </ArticleCallout>

        <ArticleH2 id="encoding-walkthrough">Encoding Walk-through: Step by Step</ArticleH2>
        <ArticleP>
          Here is exactly how a JWT header is produced from a plain JSON object. The same process
          applies to the payload.
        </ArticleP>
        <ArticlePre>{`// Input: plain JSON object
const header = { "alg": "HS256", "typ": "JWT" }

// Step 1: Serialize to a compact JSON string (no extra whitespace)
const json = JSON.stringify(header)
// → '{"alg":"HS256","typ":"JWT"}'

// Step 2: Encode to UTF-8 bytes
const bytes = new TextEncoder().encode(json)
// → Uint8Array [123, 34, 97, 108, 103, ...]

// Step 3: Standard Base64-encode the bytes
const b64 = btoa(String.fromCharCode(...bytes))
// → 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

// Step 4: Make URL-safe (replace + → -, / → _, strip =)
const b64url = b64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '')
// → 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

// Decoding is the exact reverse:
// base64url → standard base64 → atob → TextDecoder → JSON.parse`}</ArticlePre>
        <ArticleP>
          Because Base64url is fully reversible with no key, pasting a JWT into any decoder —
          including this tool, immediately reveals the full header and payload in plain text.
          This is expected behaviour, not a vulnerability. The security comes from the signature,
          not the encoding.
        </ArticleP>

        <ArticleH2 id="header">The Header</ArticleH2>
        <ArticleP>
          The header is a JSON object that provides metadata about the token itself, primarily the
          signing algorithm and token type. A minimal header looks like:
        </ArticleP>
        <ArticlePre>{`{
  "alg": "RS256",
  "typ": "JWT"
}`}</ArticlePre>
        <ArticleP>
          Common header parameters defined in RFC 7515 (JSON Web Signature):
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <ArticleCode>alg</ArticleCode>: <strong>Algorithm.</strong> The cryptographic algorithm used
            to secure the token. Required. Common values: <ArticleCode>HS256</ArticleCode>,{' '}
            <ArticleCode>RS256</ArticleCode>, <ArticleCode>ES256</ArticleCode>,{' '}
            <ArticleCode>PS256</ArticleCode>. The value <ArticleCode>none</ArticleCode> means unsecured
            and must be rejected by any secure implementation.
          </ArticleLi>
          <ArticleLi>
            <ArticleCode>typ</ArticleCode>: <strong>Type.</strong> Identifies the media type of the token.
            Almost always <ArticleCode>JWT</ArticleCode>. Optional; some issuers omit it.
          </ArticleLi>
          <ArticleLi>
            <ArticleCode>kid</ArticleCode>: <strong>Key ID.</strong> A hint identifying which key was
            used to sign the token. Useful when the issuer uses multiple keys (e.g., during key rotation).
            Receivers use the <ArticleCode>kid</ArticleCode> to select the correct public key from a <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS endpoint</a>.
          </ArticleLi>
          <ArticleLi>
            <ArticleCode>x5t</ArticleCode>: <strong>X.509 Certificate Thumbprint.</strong> A Base64url-encoded
            SHA-1 thumbprint of the DER-encoded X.509 certificate containing the signing key. Used in
            some enterprise PKI deployments.
          </ArticleLi>
          <ArticleLi>
            <ArticleCode>cty</ArticleCode>: <strong>Content Type.</strong> Used in nested JWTs to declare
            the MIME type of the inner content. Not common in plain JWTs.
          </ArticleLi>
        </ArticleUl>

        <ArticleH3>Common Header Patterns from Real Identity Providers</ArticleH3>
        <ArticleP>
          Different platforms use different header conventions. Here are representative examples:
        </ArticleP>
        <ArticlePre>{`// Auth0 RS256 access token
{ "alg": "RS256", "typ": "JWT", "kid": "abc123def456" }

// AWS Cognito RS256 token
{ "kid": "1234example=", "alg": "RS256" }

// Google OAuth2 ID token
{ "alg": "RS256", "kid": "f05415b13acb9590f70df862765c655f5a7a019e", "typ": "JWT" }

// Firebase RS256 token
{ "alg": "RS256", "kid": "abc...def" }

// Internal HS256 service token (no kid, single secret)
{ "alg": "HS256", "typ": "JWT" }`}</ArticlePre>
        <ArticleP>
          The presence of a <ArticleCode>kid</ArticleCode> in the header indicates the issuer uses
          multiple keys and publishes them at a JWKS endpoint. Always look up the matching key by{' '}
          <ArticleCode>kid</ArticleCode> before verifying, never assume you have the right key.
        </ArticleP>

        <ArticleH3>Algorithm Security Notes</ArticleH3>
        <ArticleP>
          The <ArticleCode>alg</ArticleCode> field has serious security implications. Never accept a token
          whose <ArticleCode>alg</ArticleCode> differs from what you expect. Two well-known attacks arise
          from failing to enforce the algorithm:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Algorithm confusion (RS256 to HS256):</strong> Some broken implementations accept both
            symmetric and asymmetric tokens. An attacker who knows your RS256 public key can create a valid
            HS256 token signed with that public key as the <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">HMAC secret</a>.
          </ArticleLi>
          <ArticleLi>
            <strong>alg=none bypass:</strong> Implementations that blindly trust the header's{' '}
            <ArticleCode>alg</ArticleCode> field can be tricked into accepting a token with{' '}
            <ArticleCode>"alg": "none"</ArticleCode>, which has no signature at all.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="payload">The Payload</ArticleH2>
        <ArticleP>
          The payload is a JSON object containing the token's claims. A typical payload:
        </ArticleP>
        <ArticlePre>{`{
  "iss": "https://auth.example.com/",
  "sub": "user_a8f3c2d1",
  "aud": "https://api.example.com",
  "exp": 1716480961,
  "nbf": 1716477361,
  "iat": 1716477361,
  "jti": "unique-token-id-8f3c2d",
  "email": "jane@example.com",
  "roles": ["admin", "editor"]
}`}</ArticlePre>
        <ArticleP>
          The first seven claims are RFC 7519 registered claims. The last two (<ArticleCode>email</ArticleCode>{' '}
          and <ArticleCode>roles</ArticleCode>) are custom claims. All claims are optional by the spec,
          but <ArticleCode>exp</ArticleCode>, <ArticleCode>iss</ArticleCode>, and <ArticleCode>aud</ArticleCode>{' '}
          should be present and validated in production systems.
        </ArticleP>
        <ArticleP>
          The payload is publicly readable. Never put passwords, private keys, credit card numbers,
          full SSNs, or unredacted health records in JWT claims. For sensitive data that must be
          included in a token, use JSON Web Encryption (<a href="/is-jwt-encrypted-jws-vs-jwe" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWE</a>).
        </ArticleP>

        <ArticleH2 id="signature">The Signature</ArticleH2>
        <ArticleP>
          The signature is what makes a JWT tamper-evident. It is computed over the UTF-8 encoding of
          the concatenated header and payload:
        </ArticleP>
        <ArticlePre>{`signing_input = base64url(UTF8(header)) + "." + base64url(UTF8(payload))

// For HS256:
signature = HMAC-SHA256(signing_input, shared_secret)

// For RS256:
signature = RSA-PKCS1v15-SHA256(signing_input, private_key)

// For ES256:
signature = ECDSA-SHA256(signing_input, private_key)

// The final token:
token = signing_input + "." + base64url(signature)`}</ArticlePre>

        <ArticleH3>What the Signature Covers</ArticleH3>
        <ArticleP>
          The signature covers <em>both</em> the header and the payload. If an attacker changes even a
          single character in either part, the signature will not match when recomputed. This makes the
          token tamper-evident.
        </ArticleP>
        <ArticleH3>What the Signature Does Not Cover</ArticleH3>
        <ArticleP>
          The signature does not encrypt the payload, it only authenticates it. It does not prevent
          someone from reading the claims. It does not validate the business logic of the claims
          (whether the expiry is reasonable, whether the issuer is trusted, etc.). Those checks are
          the responsibility of the verifying application.
        </ArticleP>

        <ArticleH2 id="decoding-vs-verifying">Decoding vs Verifying</ArticleH2>
        <ArticleP>
          Decoding a JWT means Base64url-decoding the header and payload to reveal the JSON.
          Anyone can do this, no key is needed, because Base64url is not encryption.
        </ArticleP>
        <ArticleP>
          Verifying a JWT means cryptographically confirming that the signature was produced by a
          specific key and that neither the header nor payload has been modified. This requires the
          correct key, either the HMAC shared secret or the issuer's public key.
        </ArticleP>
        <ArticleP>
          To illustrate why this distinction matters, consider a tampered token. An attacker takes a
          legitimate JWT, changes <ArticleCode>"roles": ["user"]</ArticleCode> to{' '}
          <ArticleCode>"roles": ["admin"]</ArticleCode> in the payload, and re-encodes it. The new
          token decodes perfectly, the JSON is valid. But the signature no longer matches the
          modified payload. Any verifying service will reject it. An application that skips
          verification and uses the decoded claims directly is vulnerable to this exact attack.
        </ArticleP>
        <ArticleCallout type="info">
          This tool decodes JWTs immediately without a key. For signature verification, use the{' '}
          <strong>Verify</strong> tab and supply the appropriate key. Verification runs locally via
          the browser's Web Crypto API, your key is never transmitted.
        </ArticleCallout>
      </ArticleLayout>
    </>
  );
}
