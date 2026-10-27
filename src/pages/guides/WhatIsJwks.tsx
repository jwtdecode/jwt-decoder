import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'What Is JWKS? JSON Web Key Sets, jwks_uri and Verifying JWTs',
  description: 'What a JSON Web Key Set is, the RFC 7517 JWK fields, how jwks_uri discovery works, how to cache and rotate keys, and how to verify JWTs against a JWKS in Node.js and Python.',
  url: 'https://jwtdecode.app/what-is-jwks',
  mainEntityOfPage: 'https://jwtdecode.app/what-is-jwks',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const JWK_FIELDS: [field: string, appliesTo: string, meaning: string][] = [
  ['kty', 'All keys', 'Key type: RSA, EC, oct (symmetric) or OKP (Ed25519/X25519). Required.'],
  ['kid', 'All keys', 'Key ID. Matched against the kid header of the JWT to pick the right key.'],
  ['use', 'All keys', 'Intended use: sig (signatures) or enc (encryption).'],
  ['alg', 'All keys', 'Algorithm the key is meant for, e.g. RS256 or ES256. Optional but useful.'],
  ['key_ops', 'All keys', 'Finer-grained alternative to use, e.g. ["verify"]. Rare in public JWKS.'],
  ['x5c / x5t', 'All keys', 'X.509 certificate chain / certificate thumbprint for the same key.'],
  ['n', 'RSA', 'Modulus, base64url-encoded big-endian integer.'],
  ['e', 'RSA', 'Public exponent, almost always AQAB (65537).'],
  ['crv', 'EC / OKP', 'Curve: P-256, P-384, P-521, or Ed25519 for OKP.'],
  ['x, y', 'EC', 'Public point coordinates, base64url-encoded. OKP keys have x only.'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function WhatIsJwksPage() {
  return (
    <>
      <SEOHead
        title="What Is JWKS? JSON Web Key Sets Explained"
        description="What is JWKS? A JSON Web Key Set publishes the public keys that verify JWTs. The JWK fields, jwks_uri discovery, caching, rotation and code to verify."
        path="/what-is-jwks"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'What Is JWKS' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-kid-header', label: 'The JWT kid Header', description: 'How the key ID in the token header selects a key from the JWKS.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works for each algorithm family.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Why asymmetric algorithms are what make a public JWKS possible.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'Where ID tokens, access tokens and discovery documents fit.' },
        ]}
      >
        <ArticleH1>What Is JWKS? JSON Web Key Sets, jwks_uri and Verifying JWTs</ArticleH1>

        <ArticleIntroBox>
          JWKS stands for JSON Web Key Set: a JSON document containing a <ArticleCode>keys</ArticleCode> array of
          public keys, each one a JSON Web Key (JWK). Identity providers publish it at a URL, the <ArticleCode>jwks_uri</ArticleCode>,
          so that any API can verify the signatures on the tokens they issue without sharing a secret. The format is
          defined in RFC 7517. When an API receives a JWT, it reads the <ArticleCode>kid</ArticleCode> from the token
          header, finds the JWK with the same <ArticleCode>kid</ArticleCode> in the set, and verifies the signature with
          that public key. This guide covers the JWK fields, how to find a provider's JWKS endpoint, caching and key
          rotation, and working verification code for Node.js and Python.
        </ArticleIntroBox>

        <ArticleH2 id="jwks-meaning">JWKS Meaning and Full Form</ArticleH2>
        <ArticleP>
          The full form of JWKS is <strong>JSON Web Key Set</strong>. It is one of the JOSE (JSON Object Signing and
          Encryption) specifications alongside JWS (RFC 7515), JWE (RFC 7516), JWA (RFC 7518) and JWT (RFC 7519).
          RFC 7517 defines two things:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>JWK</strong> (JSON Web Key): a JSON object that represents one cryptographic key.</ArticleLi>
          <ArticleLi><strong>JWK Set</strong>: a JSON object with a single required member, <ArticleCode>keys</ArticleCode>, whose value is an array of JWKs (RFC 7517 §5).</ArticleLi>
        </ArticleUl>
        <ArticleP>
          A JWKS only makes sense for asymmetric algorithms such as RS256, PS256 and ES256, where the verifying key
          can be public. With HS256 the same secret signs and verifies, so publishing it would let anyone mint tokens.
          If that distinction is new, <a href="/hs256-vs-rs256" className={link}>HS256 vs RS256</a> covers it.
        </ArticleP>

        <ArticleH2 id="jwks-vs-jwt">JWKS vs JWT (and JWT vs JWK)</ArticleH2>
        <ArticleP>
          These are easy to mix up because the names differ by one letter:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>JWT</strong> is the token: a signed set of claims such as <ArticleCode>sub</ArticleCode>, <ArticleCode>iss</ArticleCode> and <ArticleCode>exp</ArticleCode>. See <a href="/what-is-a-jwt" className={link}>what is a JWT</a>.</ArticleLi>
          <ArticleLi><strong>JWK</strong> is a key, expressed as JSON. It is not a token and carries no claims about a user.</ArticleLi>
          <ArticleLi><strong>JWKS</strong> is a published list of JWKs, normally the issuer's current signing keys plus any keys that are being rotated in or out.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The relationship is one-directional: the issuer signs a JWT with a private key, and the JWKS publishes the
          matching public key. The JWT points at its key through the <a href="/jwt-kid-header" className={link}><ArticleCode>kid</ArticleCode> header</a>.
        </ArticleP>

        <ArticleH2 id="jwks-example">JWKS Example</ArticleH2>
        <ArticleP>
          Below is the shape of a real JWKS, trimmed. The first key is RSA (the modulus is shortened here), the second
          is an EC P-256 key.
        </ArticleP>
        <ArticlePre>{`{
  "keys": [
    {
      "kty": "RSA",
      "kid": "943a3a5d7d919625a454e489b75c29adab57acba",
      "use": "sig",
      "alg": "RS256",
      "n": "pIpnzA2ezyEERJSxiqpLBmMeIqATH-V6iuBtKIib...",
      "e": "AQAB"
    },
    {
      "kty": "EC",
      "kid": "ec-2026-09",
      "use": "sig",
      "alg": "ES256",
      "crv": "P-256",
      "x": "XSjZksk5dCoq0zwbizuNVlQSWcPQ8wkP_dgK18zq3C4",
      "y": "eI3sdta7q5ni5JH584cQtaPzY9x5lGJ57Ayz5MtHJ0U"
    }
  ]
}`}</ArticlePre>
        <ArticleP>
          A JWKS contains public material only. If you ever see <ArticleCode>d</ArticleCode>, <ArticleCode>p</ArticleCode>,
          <ArticleCode>q</ArticleCode> or <ArticleCode>k</ArticleCode> members in a published set, private or symmetric
          key material has leaked and the keys must be replaced.
        </ArticleP>

        <ArticleH2 id="jwks-keys">JWKS Keys: the JWK Fields</ArticleH2>
        <ArticleP>
          RFC 7517 §4 defines the common parameters (<ArticleCode>kty</ArticleCode>, <ArticleCode>use</ArticleCode>,
          <ArticleCode>key_ops</ArticleCode>, <ArticleCode>alg</ArticleCode>, <ArticleCode>kid</ArticleCode> and the
          X.509 members). The key-type-specific members, such as <ArticleCode>n</ArticleCode> and <ArticleCode>e</ArticleCode> for
          RSA or <ArticleCode>crv</ArticleCode>, <ArticleCode>x</ArticleCode> and <ArticleCode>y</ArticleCode> for EC,
          are defined in RFC 7518 §6. OKP keys (Ed25519) come from RFC 8037.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Field</th>
                <th className="px-3 py-2 font-semibold">Applies to</th>
                <th className="px-3 py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {JWK_FIELDS.map(([field, appliesTo, meaning]) => (
                <tr key={field} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono font-medium text-slate-700 dark:text-slate-300">{field}</td>
                  <td className="px-3 py-2">{appliesTo}</td>
                  <td className="px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Providers add their own members too. Microsoft Entra ID's keys, for example, carry <ArticleCode>x5t</ArticleCode>,
          <ArticleCode>x5c</ArticleCode> and an <ArticleCode>issuer</ArticleCode> member. Libraries ignore members they do
          not understand, as RFC 7517 requires.
        </ArticleP>

        <ArticleH2 id="jwks-endpoint">JWKS Endpoint, jwks_uri and JWKS URL</ArticleH2>
        <ArticleP>
          "JWKS endpoint", "JWKS URL" and <ArticleCode>jwks_uri</ArticleCode> all mean the same thing: the HTTPS URL where
          the set is served. <ArticleCode>jwks_uri</ArticleCode> is the name of the field in an OpenID Connect discovery
          document (and in OAuth authorisation server metadata, RFC 8414). The reliable way to find it is to read the
          issuer's discovery document rather than hard-coding a path:
        </ArticleP>
        <ArticlePre>{`# OpenID Connect discovery: <issuer>/.well-known/openid-configuration
curl -s https://accounts.google.com/.well-known/openid-configuration | jq -r .jwks_uri
# https://www.googleapis.com/oauth2/v3/certs

curl -s https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration | jq -r .jwks_uri
# https://login.microsoftonline.com/common/discovery/v2.0/keys`}</ArticlePre>
        <ArticleP>
          Paths vary between providers. Auth0 serves <ArticleCode>/.well-known/jwks.json</ArticleCode>, Keycloak serves
          <ArticleCode>/realms/&lt;realm&gt;/protocol/openid-connect/certs</ArticleCode>, and Google uses the
          <ArticleCode>/oauth2/v3/certs</ArticleCode> path shown above. Discovery removes the guesswork. For the wider
          picture of how discovery, ID tokens and access tokens fit together, see
          <a href="/jwt-in-oauth2-and-openid-connect" className={link}> JWTs in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>
        <ArticleCallout type="warning">
          Take the <ArticleCode>jwks_uri</ArticleCode> from configuration you control, never from the token. A JWT header
          can carry <ArticleCode>jku</ArticleCode> (a JWKS URL), and RFC 8725 §3.10 warns that following it blindly can
          lead to server-side request forgery and to accepting keys chosen by an attacker.
        </ArticleCallout>

        <ArticleH2 id="jwks-validation">JWKS Validation: How Verification Works</ArticleH2>
        <ArticleP>
          Verifying a JWT against a JWKS follows the same steps in every library:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Decode the header (without trusting it yet) and read <ArticleCode>kid</ArticleCode> and <ArticleCode>alg</ArticleCode>.</ArticleLi>
          <ArticleLi>Check <ArticleCode>alg</ArticleCode> is on your allow-list. Never let the token choose between HS256 and RS256; see <a href="/jwt-security-best-practices" className={link}>JWT security best practices</a>.</ArticleLi>
          <ArticleLi>Find the JWK whose <ArticleCode>kid</ArticleCode> matches, ideally also matching <ArticleCode>kty</ArticleCode>, <ArticleCode>use: "sig"</ArticleCode> and <ArticleCode>alg</ArticleCode>.</ArticleLi>
          <ArticleLi>If no key matches, re-fetch the JWKS once (the issuer may have rotated), subject to a cooldown.</ArticleLi>
          <ArticleLi>Verify the signature, then validate <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode>, <ArticleCode>exp</ArticleCode> and <ArticleCode>nbf</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          A valid signature only proves which key signed the token. The claim checks decide whether this API should
          accept it; <a href="/jwt-audience-claim" className={link}>audience validation</a> in particular is what stops a token
          issued for another application from working on yours.
        </ArticleP>

        <ArticleH3 id="node-jose">Node.js: jose createRemoteJWKSet</ArticleH3>
        <ArticlePre>{`import { createRemoteJWKSet, jwtVerify } from 'jose';

// Create once at startup; it caches keys and handles unknown kids.
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function verifyGoogleIdToken(token) {
  const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: process.env.GOOGLE_CLIENT_ID,
    algorithms: ['RS256'],
  });
  return payload;
}`}</ArticlePre>
        <ArticleP>
          In jose v6, <ArticleCode>createRemoteJWKSet</ArticleCode> keeps the set for 10 minutes by default
          (<ArticleCode>cacheMaxAge</ArticleCode>), re-fetches when a token's <ArticleCode>kid</ArticleCode> is not
          found but at most once per 30 seconds (<ArticleCode>cooldownDuration</ArticleCode>), and times out requests
          after 5 seconds (<ArticleCode>timeoutDuration</ArticleCode>). A token whose key still is not found fails with
          <ArticleCode>ERR_JWKS_NO_MATCHING_KEY</ArticleCode> ("no applicable key found in the JSON Web Key Set").
        </ArticleP>

        <ArticleH3 id="jwks-rsa">Node.js: jwks-rsa with jsonwebtoken</ArticleH3>
        <ArticleP>
          If your code already uses <ArticleCode>jsonwebtoken</ArticleCode>, the <ArticleCode>jwks-rsa</ArticleCode> package
          fetches the key for a <ArticleCode>kid</ArticleCode> and returns it as PEM:
        </ArticleP>
        <ArticlePre>{`import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://YOUR_TENANT.auth0.com/.well-known/jwks.json',
  cache: true,          // default cacheMaxAge is 10 minutes
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid)
    .then((key) => callback(null, key.getPublicKey()))
    .catch(callback);
}

jwt.verify(token, getKey, { algorithms: ['RS256'], audience: 'https://api.example.com' },
  (err, payload) => { /* ... */ });`}</ArticlePre>

        <ArticleH3 id="python-pyjwkclient">Python: PyJWT PyJWKClient</ArticleH3>
        <ArticlePre>{`import jwt
from jwt import PyJWKClient

# Create once and reuse; the JWK set is cached (lifespan defaults to 300 s).
jwks_client = PyJWKClient("https://www.googleapis.com/oauth2/v3/certs")

def verify(token: str, client_id: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=client_id,
        issuer="https://accounts.google.com",
    )`}</ArticlePre>
        <ArticleP>
          <ArticleCode>PyJWKClient</ArticleCode> needs the crypto extra (<ArticleCode>pip install "pyjwt[crypto]"</ArticleCode>).
          When the <ArticleCode>kid</ArticleCode> is not in the set, <ArticleCode>get_signing_key_from_jwt</ArticleCode>
          raises <ArticleCode>PyJWKClientError: Unable to find a signing key that matches: "..."</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="jwks-caching-and-rotation">JWKS Caching and Key Rotation</ArticleH2>
        <ArticleP>
          Fetching the JWKS on every request adds latency and makes your API depend on the provider's uptime for every
          call. Fetching it once at deploy breaks the day the provider rotates keys. The standard pattern sits between
          the two:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Cache with a TTL.</strong> Respect <ArticleCode>Cache-Control</ArticleCode> if you can; Google's certs endpoint, for instance, sends a <ArticleCode>max-age</ArticleCode> of several hours. Library defaults (10 minutes in jose and jwks-rsa, 5 minutes in PyJWKClient) are safe.</ArticleLi>
          <ArticleLi><strong>Refresh on unknown kid</strong>, with a cooldown so a flood of tokens carrying random <ArticleCode>kid</ArticleCode> values cannot turn your API into a traffic amplifier against the provider.</ArticleLi>
          <ArticleLi><strong>Keep serving the cached set if a refresh fails</strong>, rather than rejecting every token during a brief provider outage.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          From the issuer's side, rotation is a three-step overlap: publish the new public key in the JWKS, wait longer
          than consumers' cache TTL, start signing with the new key, then remove the old key once every token signed with
          it has expired. Skipping the waiting step is the classic cause of a burst of "invalid signature" errors right after
          a rotation. The <a href="/jwt-kid-header" className={link}>kid header guide</a> goes into rotation in more detail.
        </ArticleP>

        <ArticleH2 id="jwk-to-pem">Converting a JWK to PEM</ArticleH2>
        <ArticleP>
          Many tools, including the jwtdecode.app verifier, take a public key in PEM (SPKI) format rather than a JWK.
          Converting is one call in Node.js 16+:
        </ArticleP>
        <ArticlePre>{`// jwk-to-pem.mjs — usage: node jwk-to-pem.mjs <jwks_uri> [kid]
import { createPublicKey } from 'node:crypto';

const [url, kid] = process.argv.slice(2);
const { keys } = await (await fetch(url)).json();
const jwk = kid ? keys.find((k) => k.kid === kid) : keys[0];

console.log(createPublicKey({ key: jwk, format: 'jwk' })
  .export({ type: 'spki', format: 'pem' }));`}</ArticlePre>
        <ArticleP>
          The same works for EC keys. In Python, <ArticleCode>jwt.PyJWK(jwk).key</ArticleCode> gives a
          <ArticleCode>cryptography</ArticleCode> public key object:
        </ArticleP>
        <ArticlePre>{`import jwt
from cryptography.hazmat.primitives import serialization

key = jwt.PyJWK(jwk_dict).key
pem = key.public_bytes(
    serialization.Encoding.PEM,
    serialization.PublicFormat.SubjectPublicKeyInfo,
).decode()`}</ArticlePre>
        <ArticleP>
          Paste the token into the <a href="/" className={link}>decoder</a>, read its <ArticleCode>kid</ArticleCode>, convert
          the matching JWK to PEM, and paste the PEM into the verification panel. Everything runs locally in the browser;
          the decoder does not fetch a JWKS itself, so the conversion step is yours. For the
          same workflow without a browser, see <a href="/jwt-verification-guide" className={link}>the verification guide</a>.
        </ArticleP>

        <ArticleH2 id="jwks-troubleshooting">Common JWKS Problems</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>No matching key</strong>: the token came from a different tenant, environment or issuer than the JWKS you are loading, or you cached the set across a rotation. Compare the token's <ArticleCode>iss</ArticleCode> with the discovery document you used.</ArticleLi>
          <ArticleLi><strong>Signature invalid with the right kid</strong>: usually an algorithm mismatch, such as a PS256 token checked as RS256.</ArticleLi>
          <ArticleLi><strong>Works in dev, fails in production</strong>: the two environments use different issuers and therefore different JWKS URLs.</ArticleLi>
          <ArticleLi><strong>Token has no kid</strong>: some issuers with a single key omit it. jose then accepts the token only if exactly one key in the set is compatible, and otherwise fails with <ArticleCode>ERR_JWKS_MULTIPLE_MATCHING_KEYS</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The <a href="/common-jwt-errors-and-fixes#invalid-signature" className={link}>common JWT errors page</a> lists
          the exact error strings for each library.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          A JWKS (JSON Web Key Set, RFC 7517) is the issuer's list of public keys, served at the <ArticleCode>jwks_uri</ArticleCode> from
          its <ArticleCode>/.well-known/openid-configuration</ArticleCode> document. Each JWK carries a <ArticleCode>kty</ArticleCode>,
          a <ArticleCode>kid</ArticleCode> and the key material (<ArticleCode>n</ArticleCode>/<ArticleCode>e</ArticleCode> for RSA,
          <ArticleCode>crv</ArticleCode>/<ArticleCode>x</ArticleCode>/<ArticleCode>y</ArticleCode> for EC). Verifiers pick the key
          by the token's <ArticleCode>kid</ArticleCode>, cache the set, refresh it on an unknown <ArticleCode>kid</ArticleCode> with a
          cooldown, and still validate <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode> and <ArticleCode>exp</ArticleCode> after
          the signature passes. Use <ArticleCode>createRemoteJWKSet</ArticleCode> in Node.js or <ArticleCode>PyJWKClient</ArticleCode> in
          Python rather than writing the fetch-and-cache logic yourself.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
