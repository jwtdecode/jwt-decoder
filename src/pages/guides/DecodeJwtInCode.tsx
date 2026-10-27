import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How to Decode and Verify a JWT in JavaScript, Python, and Go',
  description: 'Practical code examples for decoding and verifying JWTs in JavaScript, Python, and Go, from raw Base64url decoding without a library to production-ready verification with algorithm restriction and claim validation.',
  url: 'https://jwtdecode.app/how-to-decode-jwt-in-javascript-python-go',
  mainEntityOfPage: 'https://jwtdecode.app/how-to-decode-jwt-in-javascript-python-go',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function DecodeJwtInCodePage() {
  return (
    <>
      <SEOHead
        title="Decode &amp; Verify JWT in JavaScript, Python, Go"
        description="Working code examples for decoding and verifying JWTs in JavaScript, Python, and Go — from raw Base64url to production-ready library verification."
        path="/how-to-decode-jwt-in-javascript-python-go"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Decode JWT in Code' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works in detail.' },
          { to: '/jwt-decoder-vs-jwt-validator', label: 'Decoder vs Validator', description: 'The difference between decoding and validating.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Fixing signature and validation errors.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Choosing the right signing algorithm.' },
        ]}
      >
        <ArticleH1>How to Decode and Verify a JWT in JavaScript, Python, and Go</ArticleH1>

        <ArticleIntroBox>
          This guide provides working code examples for decoding and verifying JWTs in the three most
          common backend languages. It covers two levels: raw Base64url decoding without any library
          (useful for understanding the format or for constrained environments) and production-ready
          verification using the canonical library for each language, with the security options that
          matter most.
        </ArticleIntroBox>

        <ArticleH2 id="decoding-vs-verifying">Decoding vs Verifying, A Reminder</ArticleH2>
        <ArticleP>
          Before the code examples, a critical distinction: <em>decoding</em> and <em>verifying</em>{' '}
          are different operations.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Decoding</strong> extracts the JSON from the Base64url-encoded header and payload.
            No key is needed. Anyone can decode any JWT. Decoded claims must not be trusted for
            authorization without verification.
          </ArticleLi>
          <ArticleLi>
            <strong>Verifying</strong> cryptographically confirms the signature using the correct key
            and validates the <a href="/jwt-claims-explained" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">standard claims</a> (exp, iss, aud). This is the operation your server-side
            code must perform before using any JWT claims.
          </ArticleLi>
        </ArticleUl>
        <ArticleCallout type="danger">
          Never use decoded-but-unverified JWT claims for authorization decisions in production.
          The decoding examples below are for debugging and educational purposes.
        </ArticleCallout>

        <ArticleH2 id="js-decode">JavaScript: Decoding Without a Library</ArticleH2>
        <ArticleP>
          This pure JavaScript function decodes a JWT without any dependencies. It works in both
          Node.js and browser environments.
        </ArticleP>
        <ArticlePre>{`function decodeJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 dot-separated segments')
  }

  function base64urlDecode(str) {
    // Convert Base64url to standard Base64
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=')
    // Decode to bytes, then to UTF-8 string
    return JSON.parse(atob(padded))
  }

  const header  = base64urlDecode(parts[0])
  const payload = base64urlDecode(parts[1])
  // parts[2] is the signature, raw binary, not JSON

  return { header, payload }
}

// Usage:
const { header, payload } = decodeJwt('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...')
console.log(header.alg)     // "RS256"
console.log(payload.sub)    // "user_123"
console.log(payload.exp)    // 1716480961 (Unix timestamp)
console.log(new Date(payload.exp * 1000).toISOString())  // human-readable`}</ArticlePre>
        <ArticleP>
          In Node.js, <ArticleCode>atob</ArticleCode> is available from Node 16. For older versions
          use <ArticleCode>Buffer.from(padded, 'base64').toString('utf-8')</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="js-jwt-decode">JavaScript: Decoding with the jwt-decode Package</ArticleH2>
        <ArticleP>
          In the browser, the <ArticleCode>jwt-decode</ArticleCode> npm package is the usual shortcut for reading
          claims such as <ArticleCode>exp</ArticleCode> to schedule a token refresh. Version 4 changed the import:
          the function is a named export, <ArticleCode>jwtDecode</ArticleCode>, and there is no default export any more.
        </ArticleP>
        <ArticlePre>{`npm install jwt-decode

import { jwtDecode, InvalidTokenError } from 'jwt-decode';

try {
  const payload = jwtDecode(token);                   // { sub, exp, iat, ... }
  const header  = jwtDecode(token, { header: true }); // { alg, typ, kid }
  const msLeft  = payload.exp * 1000 - Date.now();
} catch (e) {
  if (e instanceof InvalidTokenError) {
    // e.g. "Invalid token specified: missing part #2"
  }
}`}</ArticlePre>
        <ArticleCallout type="info">
          Seeing <ArticleCode>jwt_decode is not a function</ArticleCode> after an upgrade? That is the v4 import change.
          Switch to <ArticleCode>{"import { jwtDecode } from 'jwt-decode'"}</ArticleCode>; the full list of symptoms is in{' '}
          <a href="/common-jwt-errors-and-fixes#jwt-decode-not-a-function" className="underline underline-offset-2">Common JWT Errors</a>.
          Like the hand-written decoder above, <ArticleCode>jwt-decode</ArticleCode> never verifies the signature.
        </ArticleCallout>

        <ArticleH2 id="js-verify">JavaScript: Verifying with jsonwebtoken (Node.js)</ArticleH2>
        <ArticleP>
          For production use, use the <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">jsonwebtoken</code>{' '}
          package (the most widely used JWT library for Node.js). Install it with{' '}
          <ArticleCode>npm install jsonwebtoken</ArticleCode>.
        </ArticleP>
        <ArticleH3>Verifying an HS256 token</ArticleH3>
        <ArticlePre>{`const jwt = require('jsonwebtoken')

function verifyHs256(token, secret) {
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],            // explicit, prevents alg confusion
    issuer: 'https://auth.example.com/',
    audience: 'https://api.example.com',
    clockTolerance: 60,               // allow 60s clock skew
  })
}

try {
  const payload = verifyHs256(token, process.env.JWT_SECRET)
  console.log('Valid token for user:', payload.sub)
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    console.error('Token expired at:', new Date(err.expiredAt))
  } else if (err.name === 'JsonWebTokenError') {
    console.error('Invalid token:', err.message)
  } else if (err.name === 'NotBeforeError') {
    console.error('Token not yet valid')
  }
}`}</ArticlePre>
        <ArticleH3>Verifying an RS256 token with JWKS</ArticleH3>
        <ArticlePre>{`const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')   // npm install jwks-rsa

const client = jwksClient({
  jwksUri: 'https://auth.example.com/.well-known/jwks.json',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,          // 10 minutes
})

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    callback(null, key.getPublicKey())
  })
}

function verifyRs256(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: 'https://auth.example.com/',
      audience: 'https://api.example.com',
      clockTolerance: 60,
    }, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  })
}

// Usage in Express middleware:
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    req.user = await verifyRs256(token)
    next()
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}`}</ArticlePre>

        <ArticleH2 id="python-decode">Python: Decoding Without a Library</ArticleH2>
        <ArticlePre>{`import json
import base64

def decode_jwt(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError(f'Invalid JWT: expected 3 segments, got {len(parts)}')

    def base64url_decode(segment: str) -> dict:
        # Add padding
        padding = 4 - len(segment) % 4
        if padding != 4:
            segment += '=' * padding
        # Decode base64url → bytes → UTF-8 → JSON
        decoded = base64.urlsafe_b64decode(segment)
        return json.loads(decoded.decode('utf-8'))

    header  = base64url_decode(parts[0])
    payload = base64url_decode(parts[1])
    # parts[2] is the raw signature bytes, not JSON

    return {'header': header, 'payload': payload}

# Usage:
result = decode_jwt('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...')
print(result['header']['alg'])      # RS256
print(result['payload']['sub'])     # user_123

import datetime
exp = result['payload'].get('exp')
if exp:
    print(datetime.datetime.utcfromtimestamp(exp).isoformat())`}</ArticlePre>

        <ArticleH3 id="python-pyjwt-unverified">Reading claims with PyJWT without verifying</ArticleH3>
        <ArticleP>
          If PyJWT is already installed, it can decode without a key. Signature checking has to be switched off
          explicitly, which keeps the intent obvious in code review. Use this for logging and <a href="/how-to-debug-a-jwt" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">debugging</a> only.
        </ArticleP>
        <ArticlePre>{`import jwt

header  = jwt.get_unverified_header(token)   # {'alg': 'RS256', 'kid': '...'}
payload = jwt.decode(token, options={"verify_signature": False})

# Malformed input raises jwt.DecodeError, e.g. "Not enough segments"`}</ArticlePre>

        <ArticleH2 id="python-verify">Python: Verifying with PyJWT</ArticleH2>
        <ArticleP>
          Use <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">PyJWT</code> (2.x) for production.
          Install with <ArticleCode>pip install PyJWT cryptography</ArticleCode>. The{' '}
          <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">cryptography</code> package is required
          for RS256/ES256 algorithm support.
        </ArticleP>
        <ArticleH3>Verifying an RS256 token</ArticleH3>
        <ArticlePre>{`import jwt
from jwt import PyJWKClient

ISSUER   = "https://auth.example.com/"
AUDIENCE = "https://api.example.com"
JWKS_URL = "https://auth.example.com/.well-known/jwks.json"

# jwks_client caches keys automatically
jwks_client = PyJWKClient(JWKS_URL)

def verify_rs256(token: str) -> dict:
    # Look up the signing key by kid
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    payload = jwt.decode(
        token,
        signing_key,
        algorithms=["RS256"],      # explicit, never omit
        issuer=ISSUER,
        audience=AUDIENCE,         # without it, any token carrying aud is rejected
        leeway=60,                 # clock skew tolerance in seconds
    )
    return payload

# Usage:
try:
    payload = verify_rs256(token)
    print("Valid token for user:", payload["sub"])
except jwt.ExpiredSignatureError:
    print("Token has expired")
except jwt.InvalidAudienceError:
    print("Wrong audience")
except jwt.InvalidIssuerError:
    print("Wrong issuer")
except jwt.InvalidSignatureError:
    print("Signature verification failed")`}</ArticlePre>
        <ArticleH3>Verifying an HS256 token</ArticleH3>
        <ArticlePre>{`import jwt, os

def verify_hs256(token: str) -> dict:
    return jwt.decode(
        token,
        os.environ["JWT_SECRET"],
        algorithms=["HS256"],
        issuer=ISSUER,
        audience=AUDIENCE,
        leeway=60,
    )`}</ArticlePre>

        <ArticleH2 id="go-decode">Go: Decoding Without a Library</ArticleH2>
        <ArticlePre>{`package main

import (
    "encoding/base64"
    "encoding/json"
    "fmt"
    "strings"
)

type JwtParts struct {
    Header  map[string]interface{}
    Payload map[string]interface{}
}

func DecodeJwt(token string) (*JwtParts, error) {
    parts := strings.Split(token, ".")
    if len(parts) != 3 {
        return nil, fmt.Errorf("invalid JWT: expected 3 segments, got %d", len(parts))
    }

    decode := func(segment string) (map[string]interface{}, error) {
        // RawURLEncoding handles Base64url without padding
        b, err := base64.RawURLEncoding.DecodeString(segment)
        if err != nil {
            return nil, err
        }
        var result map[string]interface{}
        return result, json.Unmarshal(b, &result)
    }

    header, err := decode(parts[0])
    if err != nil {
        return nil, fmt.Errorf("decode header: %w", err)
    }

    payload, err := decode(parts[1])
    if err != nil {
        return nil, fmt.Errorf("decode payload: %w", err)
    }

    return &JwtParts{Header: header, Payload: payload}, nil
}

// Usage:
func main() {
    parts, err := DecodeJwt("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    if err != nil {
        panic(err)
    }
    fmt.Println(parts.Header["alg"])   // RS256
    fmt.Println(parts.Payload["sub"])  // user_123
}`}</ArticlePre>

        <ArticleH2 id="go-verify">Go: Verifying with golang-jwt/jwt</ArticleH2>
        <ArticleP>
          Use <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300">github.com/golang-jwt/jwt/v5</code>{' '}
          for production verification. Install with{' '}
          <ArticleCode>go get github.com/golang-jwt/jwt/v5</ArticleCode>.
        </ArticleP>
        <ArticleH3>Verifying an RS256 token</ArticleH3>
        <ArticlePre>{`package main

import (
    "crypto/rsa"
    "fmt"
    "github.com/golang-jwt/jwt/v5"
)

func VerifyRS256(tokenString string, publicKey *rsa.PublicKey) (jwt.MapClaims, error) {
    parser := jwt.NewParser(
        jwt.WithValidMethods([]string{"RS256"}),    // explicit, required
        jwt.WithIssuer("https://auth.example.com/"),
        jwt.WithAudience("https://api.example.com"),
        jwt.WithLeeway(60),                          // clock skew tolerance
    )

    token, err := parser.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
        // Verify the algorithm matches what we expect
        if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
        }
        return publicKey, nil
    })
    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || !token.Valid {
        return nil, fmt.Errorf("invalid token claims")
    }

    return claims, nil
}`}</ArticlePre>
        <ArticleH3>Loading a public key from PEM</ArticleH3>
        <ArticlePre>{`import (
    "crypto/x509"
    "encoding/pem"
    "errors"
)

func ParseRSAPublicKey(pemBytes []byte) (*rsa.PublicKey, error) {
    block, _ := pem.Decode(pemBytes)
    if block == nil {
        return nil, errors.New("failed to decode PEM block")
    }

    pub, err := x509.ParsePKIXPublicKey(block.Bytes)
    if err != nil {
        return nil, err
    }

    rsaKey, ok := pub.(*rsa.PublicKey)
    if !ok {
        return nil, errors.New("not an RSA public key")
    }
    return rsaKey, nil
}`}</ArticlePre>
        <ArticleH3>Handling key rotation in Go</ArticleH3>
        <ArticlePre>{`// keystore maintains a map of kid → public key, refreshed from JWKS
type KeyStore struct {
    mu   sync.RWMutex
    keys map[string]*rsa.PublicKey
}

func (ks *KeyStore) GetKey(kid string) (*rsa.PublicKey, error) {
    ks.mu.RLock()
    key, ok := ks.keys[kid]
    ks.mu.RUnlock()

    if ok {
        return key, nil
    }

    // Unknown kid, refresh from JWKS endpoint
    if err := ks.Refresh(); err != nil {
        return nil, fmt.Errorf("key %q not found and JWKS refresh failed: %w", kid, err)
    }

    ks.mu.RLock()
    key, ok = ks.keys[kid]
    ks.mu.RUnlock()

    if !ok {
        return nil, fmt.Errorf("key %q not found after JWKS refresh", kid)
    }
    return key, nil
}`}</ArticlePre>

        <ArticleH2 id="testing">Testing with a Sample Token</ArticleH2>
        <ArticleP>
          To verify your decode implementation against a known-good token, use the sample token
          from this tool (click "Load sample" on the home page). The sample token uses HS256 with
          the secret <ArticleCode>your-256-bit-secret</ArticleCode> and contains the following payload:
        </ArticleP>
        <ArticlePre>{`{
  "sub":   "1234567890",
  "name":  "Jane Developer",
  "iat":   1516239022,
  "exp":   <current time + 1 hour>,
  "iss":   "https://jwtdecode.app",
  "roles": ["user"]
}`}</ArticlePre>
        <ArticleP>
          You can also construct test tokens manually using JWT libraries in your language of choice,
          or use the{' '}
          <a href="https://github.com/golang-jwt/jwt" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2" rel="noopener noreferrer" target="_blank">golang-jwt/jwt</a>,{' '}
          <a href="https://pypi.org/project/PyJWT/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2" rel="noopener noreferrer" target="_blank">PyJWT</a>, or{' '}
          <a href="https://www.npmjs.com/package/jsonwebtoken" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2" rel="noopener noreferrer" target="_blank">jsonwebtoken</a>{' '}
          libraries to sign test tokens with a known key, then verify that your decode and verify
          implementations produce the expected output.
        </ArticleP>

        <ArticleH2 id="security-checklist">Security Checklist for JWT Code</ArticleH2>
        <ArticleUl>
          <ArticleLi>Always specify <ArticleCode>algorithms</ArticleCode> explicitly, never use the library default or trust the token's <ArticleCode>alg</ArticleCode> header alone</ArticleLi>
          <ArticleLi>Always validate <ArticleCode>issuer</ArticleCode>: use exact string matching</ArticleLi>
          <ArticleLi>Always validate <ArticleCode>audience</ArticleCode>: PyJWT rejects a token that has <ArticleCode>aud</ArticleCode> when no audience is passed, but silently accepts a token with no <ArticleCode>aud</ArticleCode> at all; check your library's default behaviour</ArticleLi>
          <ArticleLi>Set clock skew tolerance to 30–60 seconds, never higher</ArticleLi>
          <ArticleLi>Use <ArticleCode>kid</ArticleCode> to select the correct key when multiple keys exist</ArticleLi>
          <ArticleLi>Cache <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS</a> responses, don't fetch the JWKS on every request</ArticleLi>
          <ArticleLi>Refresh the JWKS cache when you encounter an unknown <ArticleCode>kid</ArticleCode></ArticleLi>
          <ArticleLi>Handle all error types explicitly, do not swallow JWT errors silently</ArticleLi>
          <ArticleLi>Never implement JWT signature verification from scratch, use a reviewed library</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
