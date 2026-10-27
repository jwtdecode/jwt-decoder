// Single source of truth for every guide page: drives the homepage guide grid,
// the /guides hub, the footer and the Guides breadcrumb level.

export interface GuideEntry {
  to: string;
  title: string;
  description: string;
  cluster: GuideCluster;
  icon?: string;
  featured?: boolean;
}

export const GUIDE_CLUSTERS = [
  'Fundamentals',
  'Debugging & Code',
  'Algorithms',
  'Concepts & Claims',
  'Keys & Tooling',
  'Comparisons',
  'Framework Guides',
  'Identity Providers',
  'Security & Architecture',
] as const;

export type GuideCluster = (typeof GUIDE_CLUSTERS)[number];

export const GUIDES: GuideEntry[] = [
  { to: '/what-is-a-jwt', title: 'What is a JWT?', description: 'The complete introduction to JSON Web Tokens — what they are, how they work, and when to use them.', cluster: 'Fundamentals', icon: '📘', featured: true },
  { to: '/jwt-header-payload-signature-explained', title: 'Header, Payload & Signature', description: 'Deep dive into each of the three JWT segments, including Base64url encoding and what each field means.', cluster: 'Fundamentals', icon: '🔍' },
  { to: '/jwt-claims-explained', title: 'JWT Claims Explained', description: 'A complete reference for all seven standard registered claims — iss, sub, aud, exp, nbf, iat, jti — with practical guidance.', cluster: 'Fundamentals', icon: '📋', featured: true },
  { to: '/jwt-verification-guide', title: 'Verification Guide', description: 'How JWT signature verification works, including HMAC vs asymmetric algorithms, JWKS, and what verification actually proves.', cluster: 'Fundamentals', icon: '✅', featured: true },
  { to: '/hs256-vs-rs256', title: 'HS256 vs RS256', description: 'When to use a shared secret vs a public/private key pair, and how the choice affects your security architecture.', cluster: 'Algorithms', icon: '⚖', featured: true },
  { to: '/jwt-security-best-practices', title: 'Security Best Practices', description: 'Token lifetime, storage, audience/issuer validation, key rotation, algorithm confusion attacks, and common implementation mistakes.', cluster: 'Security & Architecture', icon: '🛡', featured: true },
  { to: '/common-jwt-errors-and-fixes', title: 'Common JWT Errors & Fixes', description: 'Fix malformed tokens, invalid signatures, expired tokens, wrong audience/issuer errors, and clock skew issues.', cluster: 'Debugging & Code', icon: '🔧', featured: true },
  { to: '/jwt-decoder-vs-jwt-validator', title: 'Decoder vs Validator', description: 'Understand the critical difference between decoding, verification, claim validation, and full authorization enforcement.', cluster: 'Fundamentals', icon: '🗂' },
  { to: '/jwt-vs-session-tokens', title: 'JWT vs Session Tokens', description: 'How to choose between stateless JWTs and server-side sessions — revocation, scaling, storage, and the hybrid approach.', cluster: 'Comparisons', icon: '🔄' },
  { to: '/jwt-in-oauth2-and-openid-connect', title: 'JWTs in OAuth 2.0 & OIDC', description: 'How JWTs function within OAuth 2.0 and OpenID Connect — ID tokens, access tokens, JWKS, discovery, and major provider token shapes.', cluster: 'Fundamentals', icon: '🔑' },
  { to: '/how-to-decode-jwt-in-javascript-python-go', title: 'Decode & Verify JWT in Code', description: 'Working code examples for decoding and verifying JWTs in JavaScript, Python, and Go — from raw Base64url to production-ready verification.', cluster: 'Debugging & Code', icon: '💻' },
  { to: '/es256-explained', title: 'ES256 Explained', description: 'ECDSA with P-256 and SHA-256 — the modern asymmetric JWT algorithm. Signature format, key sizes, and why it beats RS256 for greenfield systems.', cluster: 'Algorithms', icon: '🌀' },
  { to: '/ps256-vs-rs256', title: 'PS256 vs RS256', description: 'RSA-PSS padding versus PKCS#1 v1.5 — same key pair, different security properties. Migration guidance and the algorithm-confusion pitfall both share.', cluster: 'Algorithms', icon: '🔐' },
  { to: '/none-algorithm-vulnerability', title: 'The "none" Algorithm Vulnerability', description: 'The 2015 JWT none-algorithm attack: how libraries shipped vulnerable defaults, the confusion variant that followed, and the universal defence every verifier must apply.', cluster: 'Algorithms', icon: '⚠' },
  { to: '/decode-jwt-without-a-server', title: 'Decode a JWT Without a Server', description: 'How to decode and verify a JWT entirely in your browser via the Web Crypto API — no upload, no telemetry. The privacy-first way to inspect production tokens.', cluster: 'Fundamentals', icon: '🔒', featured: true },
  { to: '/jwt-storage-localstorage-vs-cookie', title: 'JWT Storage: localStorage vs Cookie', description: 'localStorage, sessionStorage, HttpOnly cookies, in-memory variables — the XSS and CSRF tradeoffs of each, and the hybrid pattern most modern apps end up with.', cluster: 'Security & Architecture', icon: '💾' },
  { to: '/jwt-refresh-token-pattern', title: 'Refresh Token Pattern', description: 'Short-lived access tokens plus long-lived refresh tokens — rotation, replay detection, family revocation, and the implementation pitfalls that break the flow.', cluster: 'Security & Architecture', icon: '♻' },
  { to: '/how-to-debug-a-jwt', title: 'How to Debug a JWT', description: 'A step-by-step routine for 401 and 403 errors: capture the real token, check alg, kid, exp, iss and aud, then verify the signature.', cluster: 'Debugging & Code', icon: '🐞', featured: true },
  { to: '/jwt-io-alternative', title: 'jwt.io Alternative', description: 'A factual comparison of jwtdecode.app and jwt.io: what is the same, what differs, and when each is the better tool.', cluster: 'Comparisons' },
  // NEW-GUIDES-BELOW
  { to: '/what-is-jwks', title: 'What Is JWKS?', description: 'JSON Web Key Sets explained: JWK fields, jwks_uri discovery, caching, rotation, JWK-to-PEM and verification code.', cluster: 'Concepts & Claims' },
  { to: '/validate-azure-entra-id-jwt', title: 'Validate Azure Entra ID JWTs', description: 'Validate Azure AD / Entra ID access tokens: v1 vs v2 issuers, aud, oid vs sub, scp vs roles, JWKS discovery and APIM policies.', cluster: 'Identity Providers' },
  { to: '/validate-aws-cognito-jwt', title: 'Validate AWS Cognito JWTs', description: 'Verify Cognito ID and access tokens: JWKS URL, issuer formats, token_use, aud vs client_id, aws-jwt-verify and API Gateway.', cluster: 'Identity Providers' },
  { to: '/jwt-websocket-authentication', title: 'WebSocket JWT Authentication', description: 'Authenticating a WebSocket with a JWT when the browser can\'t set headers: cookies, first message, subprotocol trick and ticket exchange.', cluster: 'Security & Architecture' },
  { to: '/jwt-vs-saml', title: 'JWT vs SAML', description: 'SAML XML assertions versus JWT and OpenID Connect ID tokens for single sign-on: format, signatures, flows and where each is used.', cluster: 'Comparisons' },
  { to: '/jwt-vs-oauth', title: 'JWT vs OAuth', description: 'Why OAuth is an authorisation framework and JWT a token format, plus JWT vs opaque access tokens and introspection.', cluster: 'Comparisons' },
  { to: '/jwt-vs-bearer-token', title: 'JWT vs Bearer Token', description: 'Bearer describes how a token is used, JWT what it contains: Bearer auth, RFC 6750 errors, the JWT bearer grant and DPoP.', cluster: 'Comparisons' },
  { to: '/jwt-vs-api-key', title: 'JWT vs API Key', description: 'Static API keys versus short-lived signed JWTs: revocation, validation cost, security, and exchanging a key for a JWT.', cluster: 'Comparisons' },
  { to: '/jwt-size-limit', title: 'JWT Size Limit', description: 'No size limit in RFC 7519, but nginx, Apache, Node.js, AWS and cookies impose one. Calculate token size and shrink it.', cluster: 'Keys & Tooling' },
  { to: '/jwt-secret-key-generator', title: 'JWT Secret Key Generator', description: 'Generate a random HS256, HS384 or HS512 secret in your browser, and learn the RFC 7518 minimum size and CLI commands.', cluster: 'Keys & Tooling' },
  { to: '/jwt-scopes-vs-roles', title: 'JWT Scopes vs Roles', description: 'Scopes vs roles in JWTs: the scope and scp claims, roles and permissions claims by provider, naming conventions and RBAC design.', cluster: 'Concepts & Claims' },
  { to: '/jwt-logout-and-revocation', title: 'JWT Logout & Revocation', description: 'How to invalidate a JWT before it expires: short access tokens, revocable refresh tokens, a Redis jti denylist and token versioning.', cluster: 'Security & Architecture' },
  { to: '/jwt-kid-header', title: 'The JWT kid Header', description: 'What the kid key ID means, why it is a header not a claim, value formats, JWKS lookup, key rotation and kid injection defences.', cluster: 'Concepts & Claims' },
  { to: '/jwt-in-microservices', title: 'JWT in Microservices', description: 'Gateway vs per-service validation, token propagation vs RFC 8693 exchange, mTLS/SPIFFE, per-service audiences and JWKS caching.', cluster: 'Security & Architecture' },
  { to: '/jwt-expiration-time', title: 'JWT Expiration Time', description: 'The exp, iat and nbf claims, seconds vs milliseconds, expiresIn units by library, OAuth expires_in, lifetimes, plus a timestamp converter.', cluster: 'Concepts & Claims' },
  { to: '/jwt-curl-postman', title: 'JWT With curl and Postman', description: 'Send a JWT bearer token with curl or --oauth2-bearer, set up Postman Bearer Token and JWT Bearer auth, and fix 401s.', cluster: 'Keys & Tooling' },
  { to: '/jwt-authentication-spring-boot', title: 'JWT Authentication in Spring Boot', description: 'Spring Security\'s OAuth2 Resource Server for Boot 4 and 3: starter, issuer-uri, role mapping, NimbusJwtEncoder and jjwt.', cluster: 'Framework Guides' },
  { to: '/jwt-authentication-nodejs-express', title: 'JWT Authentication in Node.js & Express', description: 'Sign and verify JWTs with jsonwebtoken or jose, write Express auth middleware, and validate RS256 tokens via JWKS.', cluster: 'Framework Guides' },
  { to: '/jwt-authentication-nextjs', title: 'JWT Authentication in Next.js', description: 'App Router JWT auth with jose: HttpOnly cookies via cookies(), proxy.ts (formerly middleware.ts), route handlers and server actions.', cluster: 'Framework Guides' },
  { to: '/jwt-authentication-fastapi', title: 'JWT Authentication in FastAPI', description: 'FastAPI JWT auth with PyJWT, Argon2 via pwdlib and OAuth2PasswordBearer, plus JWKS verification and WebSocket tokens.', cluster: 'Framework Guides' },
  { to: '/jwt-authentication-django', title: 'JWT Authentication in Django REST Framework', description: 'Simple JWT setup for DRF: settings, token URLs, refresh rotation, blacklist logout, React clients and Django Ninja.', cluster: 'Framework Guides' },
  { to: '/jwt-authentication-aspnet-core', title: 'JWT Authentication in ASP.NET Core', description: 'AddJwtBearer for .NET 8 to 10 Web APIs: validation parameters, roles and MapInboundClaims, dotnet user-jwts, refresh and logout.', cluster: 'Framework Guides' },
  { to: '/jwt-audience-claim', title: 'JWT aud Claim', description: 'What the audience claim means, string vs array values, aud vs sub, iss and azp, audience validation in code and fixing invalid audience.', cluster: 'Concepts & Claims' },
  { to: '/jwt-attacks-and-vulnerabilities', title: 'JWT Attacks & Vulnerabilities', description: 'alg none, algorithm confusion, weak secrets, kid/jku injection, psychic signatures and token leakage, with a test and a fix for each.', cluster: 'Security & Architecture' },
  { to: '/is-jwt-encrypted-jws-vs-jwe', title: 'Is a JWT Encrypted? JWS vs JWE', description: 'Why most JWTs are signed not encrypted, how JWE\'s five parts and alg/enc work, and when a nested signed-then-encrypted JWT fits.', cluster: 'Comparisons' },
  { to: '/generate-jwt-signing-keys-openssl', title: 'Generate JWT Signing Keys With OpenSSL', description: 'OpenSSL commands for RS256, ES256 and Ed25519 key pairs, PKCS#1 vs PKCS#8 conversion, and a Node.js sign-and-verify test.', cluster: 'Keys & Tooling' },
  { to: '/decode-jwt-command-line', title: 'Decode JWT From the Command Line', description: 'Tested bash, jq, PowerShell and Python one-liners that handle base64url padding, plus the jwt-cli and step CLI tools.', cluster: 'Keys & Tooling' },
];

export const isGuidePath = (path: string) => GUIDES.some(g => g.to === path);
