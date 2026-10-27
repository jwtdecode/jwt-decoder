import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'What is a JWT? JSON Web Tokens Explained',
  description: 'A complete guide to JSON Web Tokens, what they are, how they work, the three-part structure, common use cases, and key limitations every developer should know.',
  url: 'https://jwtdecode.app/what-is-a-jwt',
  mainEntityOfPage: 'https://jwtdecode.app/what-is-a-jwt',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-10-26',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function WhatIsJwtPage() {
  return (
    <>
      <SEOHead
        title="What is a JWT? JSON Web Tokens Explained"
        description="A complete guide to JSON Web Tokens — what they are, how they work, the three-part structure, common use cases, and limitations every developer should know."
        path="/what-is-a-jwt"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'What is a JWT?' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-10-26"
        relatedLinks={[
          { to: '/jwt-header-payload-signature-explained', label: 'Header, Payload & Signature', description: 'Deep dive into each of the three JWT segments.' },
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Reference for all standard registered claims.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works in practice.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Key security guidelines for production JWT usage.' },
        ]}
      >
        <ArticleH1>What is a JWT? JSON Web Tokens Explained</ArticleH1>

        <ArticleIntroBox>
          A JSON Web Token (JWT) is a compact, self-contained token format defined in{' '}
          <abbr title="Internet Engineering Task Force Request for Comments 7519">RFC 7519</abbr>.
          It lets two parties securely exchange claims, statements about a subject such as a user ID,
          role, or session scope, in a format that is both URL-safe and cryptographically verifiable.
          JWTs are the dominant token format in modern authentication and authorization systems.
        </ArticleIntroBox>

        <ArticleH2 id="the-problem-jwts-solve">The Problem JWTs Solve</ArticleH2>
        <ArticleP>
          Traditional web sessions store user state on the server. When a user logs in, the server creates
          a session record, assigns it a random ID, and sends that ID to the browser as a cookie. On every
          subsequent request, the server looks up the session ID to find the user's identity and permissions.
        </ArticleP>
        <ArticleP>
          This model works well for single-server applications, but it creates problems at scale. If you run
          ten API servers behind a load balancer, each server needs access to the same session store —
          typically a shared database or Redis cluster. Every API call incurs a session lookup, adding latency
          and creating a single point of failure.
        </ArticleP>
        <ArticleP>
          JWTs take a different approach: the token itself carries all the information the server needs to
          authenticate and authorize a request. The server doesn't need to look anything up. Instead, it
          verifies the token's cryptographic signature and reads the claims directly from the payload.
          This makes JWTs well-suited for distributed systems, microservices, and multi-region APIs.
        </ArticleP>

        <ArticleH2 id="anatomy">JWT Anatomy: Three Parts</ArticleH2>
        <ArticleP>
          A JWT looks like three Base64url-encoded strings separated by dots:
        </ArticleP>
        <ArticlePre lang="jwt">{`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKYW5lIERldiIsImlhdCI6MTcxNjQ3NzM2MSwiZXhwIjoxNzE2NDgwOTYxfQ
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}</ArticlePre>

        <ArticleH3>1. Header</ArticleH3>
        <ArticleP>
          The header identifies the token type and the cryptographic algorithm used to sign it.
          Decoded, it becomes a JSON object like:
        </ArticleP>
        <ArticlePre>{`{ "alg": "HS256", "typ": "JWT" }`}</ArticlePre>
        <ArticleP>
          The <ArticleCode>alg</ArticleCode> field is critical for verification. Common values include{' '}
          <ArticleCode>HS256</ArticleCode> (HMAC-SHA256 with a <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">shared secret</a>),{' '}
          <ArticleCode>RS256</ArticleCode> (RSA-SHA256 with a public/private <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">key pair</a>), and{' '}
          <ArticleCode>ES256</ArticleCode> (ECDSA-SHA256).
        </ArticleP>

        <ArticleH3>2. Payload</ArticleH3>
        <ArticleP>
          The payload contains the token's claims. A typical payload looks like:
        </ArticleP>
        <ArticlePre>{`{
  "sub": "user_123",
  "name": "Jane Developer",
  "iat": 1716477361,
  "exp": 1716480961,
  "roles": ["editor"]
}`}</ArticlePre>
        <ArticleP>
          Claims are divided into three categories: <em>registered</em> claims defined by RFC 7519
          (like <ArticleCode>sub</ArticleCode>, <ArticleCode>exp</ArticleCode>, <ArticleCode>iss</ArticleCode>),
          <em>public</em> claims registered with IANA, and <em>private</em> claims defined by the
          application. The payload is Base64url-encoded, <a href="/is-jwt-encrypted-jws-vs-jwe" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">not encrypted</a>, anyone with the token can read it.
        </ArticleP>

        <ArticleH3>3. Signature</ArticleH3>
        <ArticleP>
          The signature is computed over the concatenated header and payload using the signing key.
          It makes the token tamper-evident: change a single byte in the header or payload and the
          signature will no longer match. Verifying the signature requires either the shared secret
          (for HMAC algorithms) or the issuer's public key (for RSA/ECDSA algorithms).
        </ArticleP>

        <ArticleH2 id="how-jwts-are-issued">How JWTs Are Issued</ArticleH2>
        <ArticleP>
          Understanding the issuance flow makes the security model clear. Here is the typical sequence
          for an API protected by JWT authentication:
        </ArticleP>
        <ArticlePre>{`1. User submits credentials (username + password) to the auth server.

2. Auth server verifies credentials against the user store.

3. Auth server builds the JWT payload:
   {
     "sub": "user_123",
     "iss": "https://auth.example.com/",
     "aud": "https://api.example.com",
     "iat": 1716477361,
     "exp": 1716480961,
     "roles": ["editor"]
   }

4. Auth server signs the token:
   token = base64url(header) + "." + base64url(payload) + "." + sign(...)

5. Auth server returns the token to the client.

6. Client sends the token on every API request:
   Authorization: Bearer eyJhbGci...

7. API server verifies the signature, checks exp/iss/aud,
   then reads the claims, no database lookup required.`}</ArticlePre>
        <ArticleP>
          The key insight is step 7: the API server needs only the signing key (or public key) to
          validate any token. It does not need a connection to the auth server or a session store on
          the hot path. This is what makes JWTs efficient at scale.
        </ArticleP>

        <ArticleH2 id="how-jwts-are-used">How JWTs Are Used in Practice</ArticleH2>
        <ArticleP>
          The most common use cases for JWTs are:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>API authentication:</strong> After login, the auth server issues a JWT access token.
            The client sends this token in the <ArticleCode>Authorization: Bearer &lt;token&gt;</ArticleCode>{' '}
            header on every API request. The API server verifies the token locally without database lookups.
          </ArticleLi>
          <ArticleLi>
            <strong>OAuth 2.0 and OpenID Connect:</strong> Modern identity providers (Auth0, Okta, AWS Cognito,
            Google) issue JWTs as access tokens and ID tokens. The ID token in OIDC is always a JWT and
            carries the authenticated user's identity claims.
          </ArticleLi>
          <ArticleLi>
            <strong>Microservices authentication:</strong> A JWT issued by a central auth service can be
            verified by any downstream microservice that trusts the issuer's public key, enabling
            stateless authentication across service boundaries.
          </ArticleLi>
          <ArticleLi>
            <strong>Single Sign-On (SSO):</strong> JWTs enable a user authenticated on one domain to access
            resources on another domain, since the token itself carries the identity proof.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwt-vs-sessions">JWT or Session Tokens?</ArticleH2>
        <ArticleP>
          JWTs and server-side sessions both solve the authentication persistence problem with opposite
          tradeoffs. A JWT carries its own state and is verified cryptographically, so any service can check
          it without a database lookup, but it cannot easily be revoked before it expires. A session token is
          a small random ID whose state lives on the server, so revocation is instant but every request needs
          a shared session store.
        </ArticleP>
        <ArticleP>
          In short: JWTs suit multiple independent services, public APIs and cross-domain SSO; sessions suit
          single-server apps and anything needing immediate{' '}
          <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">revocation</a>.
          Many systems combine short-lived JWTs with a revocable refresh token. The full comparison, including
          scaling, storage and the hybrid pattern, is in{' '}
          <a href="/jwt-vs-session-tokens" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT vs Session Tokens</a>.
        </ArticleP>

        <ArticleH2 id="benefits">Benefits of JWTs</ArticleH2>
        <ArticleUl>
          <ArticleLi>
            <strong>Stateless:</strong> Servers don't need a session store. Any server with the signing key
            can verify any token, enabling horizontal scaling without shared state.
          </ArticleLi>
          <ArticleLi>
            <strong>Self-contained:</strong> The token carries all necessary claims. No database lookup
            needed on the hot path, reducing latency and infrastructure complexity.
          </ArticleLi>
          <ArticleLi>
            <strong>Cross-domain and cross-service:</strong> JWTs are URL-safe and work across HTTP headers,
            cookies, and POST bodies. They can be verified by any service that trusts the issuer's key.
          </ArticleLi>
          <ArticleLi>
            <strong>Standard and interoperable:</strong> RFC 7519 is widely implemented across every major
            language and platform. JWT libraries exist for Node.js, Python, Java, Go, Ruby, PHP, .NET, and more.
          </ArticleLi>
          <ArticleLi>
            <strong>Algorithm flexibility:</strong> Supports both symmetric (HMAC) and asymmetric (RSA, ECDSA)
            signing, so you can choose the trust model that fits your architecture.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="limitations">Limitations and Tradeoffs</ArticleH2>
        <ArticleCallout type="warning">
          JWTs cannot be easily revoked before they expire. Understand this tradeoff before choosing
          them over opaque session tokens.
        </ArticleCallout>
        <ArticleUl>
          <ArticleLi>
            <strong>Revocation is hard:</strong> Because JWTs are stateless, there is no central registry
            to mark a token as invalidated. Three practical strategies exist: (1) maintain a server-side
            blocklist of revoked <ArticleCode>jti</ArticleCode> values, effective but erodes the stateless
            benefit; (2) use very <a href="/jwt-expiration-time" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">short expiry</a> times (5–15 minutes) paired with refresh tokens, the most
            common production approach; (3) token binding, ties the JWT to a specific TLS session or device,
            preventing replay from a different context.
          </ArticleLi>
          <ArticleLi>
            <strong>Payload is public:</strong> The payload is only encoded, not encrypted. Don't put secrets
            or sensitive personal data in JWT claims unless you use JWE (JSON Web Encryption).
          </ArticleLi>
          <ArticleLi>
            <strong>Key management overhead:</strong> Asymmetric JWTs require a public key infrastructure.
            Key rotation, <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS</a> endpoints, and key distribution add operational complexity.
          </ArticleLi>
          <ArticleLi>
            <strong>Token size:</strong> JWTs are larger than opaque session tokens. A typical JWT with several
            claims is 200–500 bytes; complex tokens with many claims can exceed 1KB. This matters for high-QPS
            APIs where JWT overhead accumulates.
          </ArticleLi>
          <ArticleLi>
            <strong>Signature must actually be verified:</strong> The security model only holds if every
            consuming service verifies the signature, checks expiry, validates the issuer, and enforces the
            audience. Skipping any of these checks creates real vulnerabilities.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="common-misconceptions">Common Misconceptions</ArticleH2>
        <ArticleH3>Misconception 1: JWTs are encrypted</ArticleH3>
        <ArticleP>
          A standard JWT (technically a JWS, JSON Web Signature) is <em>signed</em>, not <em>encrypted</em>.
          The payload is Base64url-encoded, which is trivially reversible. Anyone with the token string can
          read the payload contents without any key. If you need encrypted tokens, you need JWE (JSON Web
          Encryption, RFC 7516), which is a different format.
        </ArticleP>

        <ArticleH3>Misconception 2: Decoding a JWT proves it's valid</ArticleH3>
        <ArticleP>
          Decoding a JWT reveals its claims but proves nothing about authenticity. A token can be decoded
          successfully even if it's expired, issued by a fraudulent party, or had its payload modified.
          Validity requires cryptographic signature verification plus explicit claim validation. See the{' '}
          <a href="/jwt-decoder-vs-jwt-validator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">
            JWT Decoder vs Validator guide
          </a>{' '}
          for a detailed breakdown.
        </ArticleP>

        <ArticleH3>Misconception 3: JWT = authentication</ArticleH3>
        <ArticleP>
          JWTs are a token format, not an authentication protocol. They are commonly used within
          authentication frameworks like OAuth 2.0 and OpenID Connect, but the authentication itself
          (password check, MFA, etc.) happens before the JWT is issued. The JWT is the proof of
          completed authentication, not the authentication mechanism itself.
        </ArticleP>

        <ArticleH3>Misconception 4: All JWTs are secure by default</ArticleH3>
        <ArticleP>
          A JWT is only as secure as its implementation. Common implementation failures include accepting
          the <ArticleCode>alg=none</ArticleCode> header value (disabling signature verification entirely),
          not validating the <ArticleCode>aud</ArticleCode> claim (allowing tokens meant for other services),
          and using weak HMAC secrets (allowing brute-force attacks against the signing key). RFC 7519
          defines the format; security is the implementer's responsibility.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
