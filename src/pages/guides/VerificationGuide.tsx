import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Signature Verification Guide',
  description: 'How JWT signature verification works, symmetric vs asymmetric algorithms, JWKS endpoints, what verification proves, and how to verify correctly in production.',
  url: 'https://jwtdecode.app/jwt-verification-guide',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-verification-guide',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-05-05',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function VerificationGuidePage() {
  return (
    <>
      <SEOHead
        title="JWT Signature Verification Guide"
        description="How JWT signature verification works — symmetric vs asymmetric algorithms, JWKS, what verification proves and doesn't prove, and production best practices."
        path="/jwt-verification-guide"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Verification Guide' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-05-05"
        relatedLinks={[
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'When to use symmetric vs asymmetric signing.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Complete security checklist for production JWTs.' },
          { to: '/jwt-decoder-vs-jwt-validator', label: 'Decoder vs Validator', description: 'The difference between decoding, verifying, and validating.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Fixing invalid signature and verification errors.' },
        ]}
      >
        <ArticleH1>JWT Signature Verification Guide</ArticleH1>

        <ArticleIntroBox>
          Signature verification is the process of confirming that a JWT was signed by a specific key
          and that its contents have not been modified since signing. It is the most critical step in
          JWT processing, a decoded but unverified token should never be trusted. This guide explains
          the mechanics of verification, the difference between symmetric and asymmetric approaches,
          and what verification can and cannot prove.
        </ArticleIntroBox>

        <ArticleH2 id="why-verification-matters">Why Verification Matters</ArticleH2>
        <ArticleP>
          A JWT payload is just Base64url-encoded JSON. Anyone can modify the payload, change a user ID,
          elevate a role, extend an expiry, and re-encode it into a new token. Without verification,
          your application has no way to distinguish a legitimate token issued by your auth server from
          a forged one.
        </ArticleP>
        <ArticleP>
          Signature verification uses cryptography to bind the header and payload to a specific key.
          If even a single character in the header or payload changes, the signature check fails.
          This makes tampering detectable, but only if you actually run the check. The verification
          algorithm itself is defined in <strong>RFC 7515</strong> (JSON Web Signature); the family of
          algorithms supported (HS256, RS256, <a href="/es256-explained" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">ES256</a>, <a href="/ps256-vs-rs256" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">PS256</a> and variants) is specified in
          <strong> RFC 7518</strong> (JSON Web Algorithms).
        </ArticleP>

        <ArticleH2 id="symmetric">Symmetric Verification: HMAC Algorithms</ArticleH2>
        <ArticleP>
          HMAC algorithms (HS256, HS384, HS512) use a single <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">shared secret</a> known to both the issuer
          and the verifier. The signing and verification processes are identical: compute
          HMAC-SHA{'{256|384|512}'} over the signing input using the shared secret, then compare the
          result to the token's signature.
        </ArticleP>
        <ArticlePre>{`// Verification pseudocode for HS256
expected_sig = HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  shared_secret
)
is_valid = constant_time_compare(expected_sig, token_signature)`}</ArticlePre>
        <ArticleP>
          The comparison must use a constant-time algorithm to prevent timing side-channel attacks
          that could leak information about the secret.
        </ArticleP>
        <ArticleCallout type="warning">
          HS256 is only appropriate when the issuer and all verifiers trust each other completely,
          because any party with the secret can also issue new tokens. If your token is verified by
          multiple independent services, prefer an asymmetric algorithm.
        </ArticleCallout>

        <ArticleH2 id="asymmetric">Asymmetric Verification: RSA and ECDSA</ArticleH2>
        <ArticleP>
          Asymmetric algorithms (RS256/RS384/RS512, ES256/ES384/ES512, PS256/PS384/PS512) use a
          public/private <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">key pair</a>. The issuer signs with the <em>private key</em>. Verifiers only
          need the <em>public key</em>, which can be distributed freely.
        </ArticleP>
        <ArticlePre>{`// RS256 signing (by the auth server, uses private key)
signature = RSA-PKCS1v15-SHA256(signing_input, private_key)

// RS256 verification (by the API, uses public key only)
is_valid = RSA-PKCS1v15-SHA256-Verify(signing_input, signature, public_key)`}</ArticlePre>
        <ArticleP>
          This separation of concerns is the key advantage: API services need only the public key to
          verify tokens. They cannot issue new tokens because they never have access to the private key.
          This is why RS256 and ES256 are preferred in multi-service architectures.
        </ArticleP>

        <ArticleH3>RSA vs ECDSA</ArticleH3>
        <ArticleUl>
          <ArticleLi>
            <strong>RSA (RS256/RS384/RS512):</strong> Based on the difficulty of factoring large integers.
            Key sizes of 2048–4096 bits are standard. Widely supported across all JWT libraries and platforms.
            Tokens are larger due to the RSA signature size.
          </ArticleLi>
          <ArticleLi>
            <strong>ECDSA (ES256/ES384/ES512):</strong> Based on elliptic curve cryptography.
            Much shorter keys (256 bits for ES256 vs 2048 bits for RS256) providing equivalent security.
            Produces smaller signatures. Preferred in bandwidth-constrained environments.
          </ArticleLi>
          <ArticleLi>
            <strong>RSA-PSS (PS256/PS384/PS512):</strong> A stronger RSA padding scheme that provides
            security proofs not available with PKCS#1 v1.5 (RS256). Preferred over RS256 for new systems
            when RSA is required.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwks">JWKS Endpoints</ArticleH2>
        <ArticleP>
          A <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JSON Web Key Set</a> (JWKS) endpoint is a URL that publishes an issuer's public keys in
          a standardized format. When your application needs to verify a token, it fetches the public
          key corresponding to the token's <ArticleCode>kid</ArticleCode> header from the JWKS endpoint.
        </ArticleP>
        <ArticlePre>{`// Example JWKS endpoint response
GET https://auth.example.com/.well-known/jwks.json

{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-2024-01",
      "n": "...",   // RSA modulus
      "e": "AQAB"  // RSA exponent
    }
  ]
}`}</ArticlePre>
        <ArticleP>
          Best practices for JWKS:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Cache JWKS responses using the HTTP cache headers provided by the issuer</ArticleLi>
          <ArticleLi>Refresh the cache when you receive a token with an unknown <ArticleCode>kid</ArticleCode></ArticleLi>
          <ArticleLi>Set a maximum cache age (e.g., 24 hours) to pick up key rotations in reasonable time</ArticleLi>
          <ArticleLi>Only fetch JWKS over HTTPS with certificate validation enabled</ArticleLi>
          <ArticleLi>Validate the issuer's URL before using its JWKS, never fetch keys from an attacker-controlled URL</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="library-examples">Verification in Code: Library Examples</ArticleH2>
        <ArticleP>
          Always use a well-tested JWT library for server-side verification. Here are correct
          verification patterns for the most common platforms. Note the explicit algorithm
          restriction and claim validation options, these are critical for security.
        </ArticleP>

        <ArticleH3>Node.js, jsonwebtoken</ArticleH3>
        <ArticlePre>{`const jwt = require('jsonwebtoken')

// RS256 with explicit algorithm restriction
const payload = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],       // never omit, prevents alg confusion
  issuer: 'https://auth.example.com/',
  audience: 'https://api.example.com',
})

// HS256 with explicit algorithm restriction
const payload = jwt.verify(token, sharedSecret, {
  algorithms: ['HS256'],
  issuer: 'https://auth.example.com/',
  audience: 'https://api.example.com',
})`}</ArticlePre>

        <ArticleH3>Python, PyJWT</ArticleH3>
        <ArticlePre>{`import jwt

# RS256 verification
payload = jwt.decode(
    token,
    public_key,
    algorithms=["RS256"],        # explicit list, never ["RS256", "HS256"]
    issuer="https://auth.example.com/",
    audience="https://api.example.com",
)

# HS256 verification
payload = jwt.decode(
    token,
    shared_secret,
    algorithms=["HS256"],
    issuer="https://auth.example.com/",
    audience="https://api.example.com",
)`}</ArticlePre>

        <ArticleH3>Go, golang-jwt/jwt</ArticleH3>
        <ArticlePre>{`import "github.com/golang-jwt/jwt/v5"

// RS256 verification
parser := jwt.NewParser(
    jwt.WithValidMethods([]string{"RS256"}),  // explicit
    jwt.WithIssuer("https://auth.example.com/"),
    jwt.WithAudience("https://api.example.com"),
)
token, err := parser.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
    if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
        return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
    }
    return publicKey, nil
})`}</ArticlePre>

        <ArticleH2 id="key-rotation">Key Rotation Without Downtime</ArticleH2>
        <ArticleP>
          Rotating signing keys is necessary for long-term security, but must be done carefully to
          avoid invalidating all active tokens at once. The safe procedure:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Step 1:</strong> Generate a new key pair. Assign it a new{' '}
            <ArticleCode>kid</ArticleCode> (e.g., <ArticleCode>key-2026-05</ArticleCode>).
          </ArticleLi>
          <ArticleLi>
            <strong>Step 2:</strong> Add the new public key to your JWKS endpoint alongside the old key.
            Both keys are now published. Verifiers will cache both.
          </ArticleLi>
          <ArticleLi>
            <strong>Step 3:</strong> Update your auth server to sign new tokens with the new private key.
            New tokens carry the new <ArticleCode>kid</ArticleCode>.
          </ArticleLi>
          <ArticleLi>
            <strong>Step 4:</strong> Wait for all tokens signed with the old key to expire. The overlap
            period equals your maximum <a href="/jwt-expiration-time" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">token lifetime</a>.
          </ArticleLi>
          <ArticleLi>
            <strong>Step 5:</strong> Remove the old public key from your JWKS endpoint. Destroy the old
            private key.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          Verifiers handle this transparently: they look up the key by <ArticleCode>kid</ArticleCode>,
          so they automatically use whichever key the token was signed with, as long as it is present
          in the JWKS. Tokens signed with the old key continue to verify successfully during the
          overlap period.
        </ArticleP>

        <ArticleH2 id="what-verification-proves">What Verification Proves, and What It Doesn't</ArticleH2>
        <ArticleP>
          A successful signature verification proves:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>The token was signed by a party holding the specific private key or shared secret</ArticleLi>
          <ArticleLi>The header and payload have not been modified since signing</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Verification does <em>not</em> prove:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>The token has not expired (you must check <ArticleCode>exp</ArticleCode> explicitly)</ArticleLi>
          <ArticleLi>The token was issued by the expected issuer (check <ArticleCode>iss</ArticleCode>)</ArticleLi>
          <ArticleLi>The token is intended for your service (check <ArticleCode>aud</ArticleCode>)</ArticleLi>
          <ArticleLi>The claims are semantically valid for your application's business logic</ArticleLi>
          <ArticleLi>The user still has the roles or permissions stated in the claims (claims are a snapshot at issuance)</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="info">
          Full JWT processing requires: <strong>1)</strong> verify signature,{' '}
          <strong>2)</strong> validate iss, aud, exp, nbf,{' '}
          <strong>3)</strong> apply application-specific claim logic.
          Steps 2 and 3 are equally important as step 1.
        </ArticleCallout>

        <ArticleH2 id="server-side">Why Always Verify Server-Side</ArticleH2>
        <ArticleP>
          Client-side verification (as this tool demonstrates) is valuable for debugging and inspection,
          but it must never be used for authorization decisions in production. A determined attacker can
          modify client-side JavaScript to bypass verification checks. Server-side verification in a
          trusted environment, a backend API, a gateway, a serverless function, is the only meaningful
          security boundary.
        </ArticleP>
        <ArticleP>
          Always use a well-tested JWT library for server-side verification. Do not implement JWT
          verification from scratch. Libraries like{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-1 rounded">jsonwebtoken</code> (Node.js),{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-1 rounded">PyJWT</code> (Python),{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-1 rounded">golang-jwt/jwt</code> (Go), and{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-1 rounded">nimbus-jose-jwt</code> (Java)
          have been reviewed and audited by the security community.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
