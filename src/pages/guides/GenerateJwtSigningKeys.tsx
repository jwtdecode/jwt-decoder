import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Generate an RSA Key Pair for JWT (plus ES256 and Ed25519) With OpenSSL',
  description: 'OpenSSL commands to generate RS256, ES256 and Ed25519 key pairs for JWT signing, extract the public key, convert between PKCS#1 and PKCS#8, and verify a test token in Node.js.',
  url: 'https://jwtdecode.app/generate-jwt-signing-keys-openssl',
  mainEntityOfPage: 'https://jwtdecode.app/generate-jwt-signing-keys-openssl',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const KEY_TYPES: [alg: string, key: string, command: string][] = [
  ['RS256 / RS384 / RS512', 'RSA, 2048 bits or larger', 'genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048'],
  ['PS256 / PS384 / PS512', 'RSA, 2048 bits or larger (same key type as RS*)', 'genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048'],
  ['ES256', 'EC on P-256 (prime256v1)', 'genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256'],
  ['ES384', 'EC on P-384 (secp384r1)', 'genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-384'],
  ['ES512', 'EC on P-521 (secp521r1), not "P-512"', 'genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-521'],
  ['EdDSA / Ed25519', 'Ed25519 (OKP)', 'genpkey -algorithm ed25519'],
];

const PEM_HEADERS: [header: string, format: string, note: string][] = [
  ['BEGIN PRIVATE KEY', 'PKCS#8, unencrypted', 'Default output of openssl genpkey (and genrsa in OpenSSL 3). Works for RSA, EC and Ed25519.'],
  ['BEGIN ENCRYPTED PRIVATE KEY', 'PKCS#8, password protected', 'Produced by adding a cipher such as -aes-256-cbc to genpkey.'],
  ['BEGIN RSA PRIVATE KEY', 'PKCS#1 (RSA only)', 'Traditional format; OpenSSL 1.x genrsa default. Many JOSE libraries reject it.'],
  ['BEGIN EC PRIVATE KEY', 'SEC 1 (EC only)', 'Output of openssl ecparam -genkey. Convert to PKCS#8 for most JWT libraries.'],
  ['BEGIN PUBLIC KEY', 'SPKI (X.509 SubjectPublicKeyInfo)', 'The format JWT libraries and jwtdecode.app expect for public keys.'],
  ['BEGIN RSA PUBLIC KEY', 'PKCS#1 public key (RSA only)', 'Not SPKI. Convert before using it with jose, Web Crypto or most verifiers.'],
];

export default function GenerateJwtSigningKeysPage() {
  return (
    <>
      <SEOHead
        title="Generate RSA Key Pair for JWT With OpenSSL"
        description="Generate an RSA key pair for JWT with OpenSSL, plus ES256 and Ed25519 keys: extract the public key, convert PKCS#1 to PKCS#8 and verify a test token."
        path="/generate-jwt-signing-keys-openssl"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Generate JWT Signing Keys' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-secret-key-generator', label: 'JWT Secret Key Generator', description: 'Random HS256, HS384 and HS512 secrets generated in the browser.' },
          { to: '/es256-explained', label: 'ES256 Explained', description: 'ECDSA with P-256, signature format and when to prefer it over RS256.' },
          { to: '/what-is-jwks', label: 'What Is JWKS?', description: 'Publishing public keys as a JSON Web Key Set for verifiers.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'What a verifier must check besides the signature.' },
        ]}
      >
        <ArticleH1>How to Generate an RSA Key Pair for JWT (and ES256 and Ed25519 Keys) With OpenSSL</ArticleH1>

        <ArticleIntroBox>
          To generate an RSA key pair for RS256 JWTs, run{' '}
          <ArticleCode>openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem</ArticleCode>{' '}
          and then extract the public key with{' '}
          <ArticleCode>openssl pkey -in private.pem -pubout -out public.pem</ArticleCode>. The issuer signs with{' '}
          <ArticleCode>private.pem</ArticleCode>; every verifier gets <ArticleCode>public.pem</ArticleCode>.
          <br /><br />
          This guide gives the equivalent commands for ES256 (P-256) and Ed25519, explains the PEM headers you will
          meet (PKCS#8, PKCS#1, SPKI) and how to convert between them, and ends with a Node.js script that signs and
          verifies a test token so you know the pair works before it reaches production. Every command was run
          against OpenSSL 3.0.
        </ArticleIntroBox>

        <ArticleH2 id="which-key-for-which-algorithm">Which Key Type Does Each JWT Algorithm Need?</ArticleH2>
        <ArticleP>
          The <ArticleCode>alg</ArticleCode> header fixes the key type. RFC 7518 §3.3 requires RSA keys of 2048 bits or
          larger for RS* and PS* algorithms, and §3.4 binds each ES* algorithm to exactly one curve. All commands in
          the table are prefixed with <ArticleCode>openssl</ArticleCode> and write a PKCS#8 private key.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">JWT alg</th>
                <th className="px-3 py-2 font-semibold">Key type</th>
                <th className="px-3 py-2 font-semibold">openssl command</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {KEY_TYPES.map(([alg, key, command]) => (
                <tr key={alg} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{alg}</td>
                  <td className="px-3 py-2">{key}</td>
                  <td className="px-3 py-2 font-mono">{command}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          If you are still deciding between a shared secret and a key pair,{' '}
          <a href="/hs256-vs-rs256" className={link}>HS256 vs RS256</a> covers that choice. If you only need an HMAC
          secret, the <a href="/jwt-secret-key-generator" className={link}>JWT secret key generator</a> is the page you
          want, not this one.
        </ArticleP>

        <ArticleH2 id="openssl-jwt-rs256">How to Generate an RSA Key Pair for JWT (RS256)</ArticleH2>
        <ArticlePre lang="bash">{`# 1. Private key (PKCS#8, "BEGIN PRIVATE KEY")
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out rs256-private.pem

# 2. Public key (SPKI, "BEGIN PUBLIC KEY")
openssl pkey -in rs256-private.pem -pubout -out rs256-public.pem

# 3. Lock down the private key
chmod 600 rs256-private.pem

# Optional: inspect it
openssl pkey -in rs256-private.pem -noout -text | head -1
# Private-Key: (2048 bit, 2 primes)`}</ArticlePre>
        <ArticleP>
          2048 bits is the RFC minimum and remains the most common size. 3072 bits is a reasonable choice for keys
          that will live for many years; the costs are larger signatures (384 bytes instead of 256) and slower
          signing. The same key pair works for PS256, which uses RSA-PSS padding instead of PKCS#1 v1.5; see{' '}
          <a href="/ps256-vs-rs256" className={link}>PS256 vs RS256</a> for when that matters.
        </ArticleP>
        <ArticleP>
          To keep the private key encrypted at rest, add a cipher:{' '}
          <ArticleCode>openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -aes-256-cbc -out private.pem</ArticleCode>{' '}
          prompts for a passphrase and writes <ArticleCode>BEGIN ENCRYPTED PRIVATE KEY</ArticleCode>. Your application
          then needs the passphrase at start-up, so in practice most teams keep the key unencrypted inside a secrets
          manager or use a KMS/HSM that never exposes it.
        </ArticleP>

        <ArticleH2 id="jwt-es256-key">JWT ES256 Key: Generate a P-256 Key Pair</ArticleH2>
        <ArticlePre lang="bash">{`openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out es256-private.pem
openssl pkey -in es256-private.pem -pubout -out es256-public.pem

openssl pkey -in es256-private.pem -noout -text | grep -E "ASN1 OID|NIST CURVE"
# ASN1 OID: prime256v1
# NIST CURVE: P-256`}</ArticlePre>
        <ArticleP>
          Older tutorials use <ArticleCode>openssl ecparam -name prime256v1 -genkey -noout -out key.pem</ArticleCode>.
          That works but writes a SEC 1 key (<ArticleCode>BEGIN EC PRIVATE KEY</ArticleCode>), which{' '}
          <ArticleCode>jose</ArticleCode>'s <ArticleCode>importPKCS8</ArticleCode> and the Rust{' '}
          <ArticleCode>jsonwebtoken</ArticleCode> crate (used by <ArticleCode>jwt-cli</ArticleCode>) reject. Convert it with{' '}
          <ArticleCode>openssl pkcs8 -topk8 -nocrypt -in key.pem -out key-pkcs8.pem</ArticleCode>, or just use{' '}
          <ArticleCode>genpkey</ArticleCode> from the start.
        </ArticleP>
        <ArticleCallout type="info">
          ES256 signatures in a JWT are the raw 64-byte R‖S concatenation, not the DER structure OpenSSL's{' '}
          <ArticleCode>dgst -sign</ArticleCode> emits. JWT libraries handle this for you; hand-rolled signing code
          usually gets it wrong. <a href="/es256-explained" className={link}>ES256 explained</a> has the details.
        </ArticleCallout>

        <ArticleH2 id="jwt-eddsa-ed25519-key">EdDSA: Generate an Ed25519 Key for JWT</ArticleH2>
        <ArticlePre lang="bash">{`openssl genpkey -algorithm ed25519 -out ed25519-private.pem
openssl pkey -in ed25519-private.pem -pubout -out ed25519-public.pem

cat ed25519-public.pem
# -----BEGIN PUBLIC KEY-----
# MCowBQYDK2VwAyEA...  (60 base64 characters: a 12-byte header plus the 32-byte key)
# -----END PUBLIC KEY-----`}</ArticlePre>
        <ArticleP>
          RFC 8037 introduced Ed25519 to JOSE with the algorithm identifier <ArticleCode>"alg": "EdDSA"</ArticleCode>{' '}
          and the JWK key type <ArticleCode>OKP</ArticleCode> with <ArticleCode>"crv": "Ed25519"</ArticleCode>. RFC 9864
          (October 2025) deprecates the polymorphic <ArticleCode>EdDSA</ArticleCode> identifier, because it does not
          say which curve is in use, and registers the fully specified <ArticleCode>"alg": "Ed25519"</ArticleCode>{' '}
          instead. Current <ArticleCode>jose</ArticleCode> (6.x) signs and verifies both. Older libraries and many
          identity providers only know <ArticleCode>EdDSA</ArticleCode>, and plenty of JWT stacks do not support
          Ed25519 at all, so check every verifier before choosing it.
        </ArticleP>

        <ArticleH2 id="pkcs8-vs-pkcs1">PKCS#8 vs PKCS#1: "BEGIN RSA PUBLIC KEY" vs "BEGIN PUBLIC KEY"</ArticleH2>
        <ArticleP>
          The first line of a PEM file tells you the structure inside it, and JWT libraries are strict about it. A
          public key that begins <ArticleCode>-----BEGIN RSA PUBLIC KEY-----</ArticleCode> holds only the RSA modulus and
          exponent (PKCS#1). One that begins <ArticleCode>-----BEGIN PUBLIC KEY-----</ArticleCode> wraps the key in an
          SPKI structure that also names the algorithm. Web Crypto, <ArticleCode>jose</ArticleCode> and most verifiers
          want SPKI.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">PEM header</th>
                <th className="px-3 py-2 font-semibold">Format</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {PEM_HEADERS.map(([header, format, note]) => (
                <tr key={header} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{header}</td>
                  <td className="px-3 py-2">{format}</td>
                  <td className="px-3 py-2">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleH3 id="converting-key-formats">Converting between formats</ArticleH3>
        <ArticlePre lang="bash">{`# PKCS#1 RSA public key  ->  SPKI ("BEGIN PUBLIC KEY")
openssl rsa -RSAPublicKey_in -in rsa-pub-pkcs1.pem -pubout -out public.pem

# SPKI  ->  PKCS#1 RSA public key (for tools that insist on it)
openssl rsa -pubin -in public.pem -RSAPublicKey_out -out rsa-pub-pkcs1.pem

# PKCS#1 or SEC 1 private key  ->  PKCS#8 ("BEGIN PRIVATE KEY")
openssl pkcs8 -topk8 -nocrypt -in legacy-private.pem -out private.pem

# PKCS#8 RSA private key  ->  PKCS#1 ("BEGIN RSA PRIVATE KEY")
openssl rsa -in private.pem -traditional -out rsa-pkcs1.pem`}</ArticlePre>
        <ArticleP>
          In OpenSSL 3, <ArticleCode>openssl pkey -in legacy-private.pem -out private.pem</ArticleCode> also rewrites
          any private key as PKCS#8. If a library reports that a key "must be PKCS#8 formatted" or "must be SPKI
          formatted", one of these conversions is almost always the fix.
        </ArticleP>

        <ArticleH2 id="sign-and-verify-test-token">Sign and Verify a Test Token in Node.js</ArticleH2>
        <ArticleP>
          Before handing the public key to other teams, prove the pair works. This script uses{' '}
          <ArticleCode>jose</ArticleCode> (<ArticleCode>npm install jose</ArticleCode>) and loops over the three key
          pairs generated above:
        </ArticleP>
        <ArticlePre lang="javascript">{`// verify-keys.mjs
import { readFileSync } from 'node:fs';
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';

const pairs = [
  ['RS256', 'rs256-private.pem', 'rs256-public.pem'],
  ['ES256', 'es256-private.pem', 'es256-public.pem'],
  ['EdDSA', 'ed25519-private.pem', 'ed25519-public.pem'],
];

for (const [alg, priv, pub] of pairs) {
  const privateKey = await importPKCS8(readFileSync(priv, 'utf8'), alg);
  const publicKey = await importSPKI(readFileSync(pub, 'utf8'), alg);

  const token = await new SignJWT({ sub: 'user-123' })
    .setProtectedHeader({ alg, kid: 'test-key-1' })
    .setIssuedAt()
    .setIssuer('https://issuer.example')
    .setAudience('api')
    .setExpirationTime('10m')
    .sign(privateKey);

  const { payload } = await jwtVerify(token, publicKey, {
    issuer: 'https://issuer.example',
    audience: 'api',
  });
  console.log(alg, 'verified, sub =', payload.sub);
}`}</ArticlePre>
        <ArticleP>
          If you prefer no dependencies, <ArticleCode>node:crypto</ArticleCode> can do RS256 directly. This is useful
          for understanding what the library does, though a maintained library should do the real verification,
          including claim checks:
        </ArticleP>
        <ArticlePre lang="javascript">{`import { readFileSync } from 'node:fs';
import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';

const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const signingInput = \`\${b64u({ alg: 'RS256', typ: 'JWT' })}.\${b64u({ sub: 'user-123' })}\`;

const signature = sign('sha256', Buffer.from(signingInput),
  createPrivateKey(readFileSync('rs256-private.pem')));
const token = \`\${signingInput}.\${signature.toString('base64url')}\`;

const [h, p, s] = token.split('.');
console.log(verify('sha256', Buffer.from(\`\${h}.\${p}\`),
  createPublicKey(readFileSync('rs256-public.pem')), Buffer.from(s, 'base64url'))); // true`}</ArticlePre>
        <ArticleP>
          For ES256 with <ArticleCode>node:crypto</ArticleCode>, pass <ArticleCode>dsaEncoding: 'ieee-p1363'</ArticleCode>{' '}
          in the key object for both <ArticleCode>sign</ArticleCode> and <ArticleCode>verify</ArticleCode>; the default is
          DER, which produces a roughly 70-byte signature instead of the 64 bytes JWT requires.
        </ArticleP>
        <ArticleP>
          You can also check a token by hand: paste it into{' '}
          <a href="/" className={link}>the jwtdecode.app decoder</a>, open the Verify tab and paste the contents of the
          public key file. The decoder verifies RS, PS and ES algorithms with a PEM public key in SPKI form
          (<ArticleCode>BEGIN PUBLIC KEY</ArticleCode>) using Web Crypto in your browser. It does not accept PKCS#1 public
          keys, JWKs or Ed25519, and it never needs the private key.
        </ArticleP>

        <ArticleH2 id="jwt-rs256-key-generator">Should You Use an Online JWT RS256 Key Generator?</ArticleH2>
        <ArticleP>
          For throwaway test keys, an online generator is convenient. For anything that will sign real tokens, no:
          the private key is the one secret an asymmetric scheme depends on, and a web page that generated it has
          had the chance to keep a copy. Local OpenSSL takes a second, works offline and leaves nothing behind. If
          you do use a browser tool for testing, prefer one that generates keys with Web Crypto locally and label
          the resulting keys clearly so they never drift into a real configuration.
        </ArticleP>

        <ArticleH2 id="publish-the-public-key">Publishing the Public Key as a JWKS</ArticleH2>
        <ArticleP>
          Verifiers that fetch keys automatically expect a JSON Web Key Set (RFC 7517), usually served at{' '}
          <ArticleCode>/.well-known/jwks.json</ArticleCode>. <ArticleCode>jose</ArticleCode> converts a PEM public key to a
          JWK and can derive a stable <ArticleCode>kid</ArticleCode> from the RFC 7638 thumbprint:
        </ArticleP>
        <ArticlePre lang="javascript">{`import { readFileSync } from 'node:fs';
import { importSPKI, exportJWK, calculateJwkThumbprint } from 'jose';

const publicKey = await importSPKI(readFileSync('es256-public.pem', 'utf8'), 'ES256');
const jwk = await exportJWK(publicKey);
jwk.kid = await calculateJwkThumbprint(jwk);
jwk.alg = 'ES256';
jwk.use = 'sig';
console.log(JSON.stringify({ keys: [jwk] }, null, 2));`}</ArticlePre>
        <ArticleP>
          Put the same <ArticleCode>kid</ArticleCode> in the header of every token you sign so verifiers can pick the
          right key during rotation. The <a href="/what-is-jwks" className={link}>JWKS guide</a> and the{' '}
          <a href="/jwt-kid-header" className={link}>kid header guide</a> cover caching and rotation.
        </ArticleP>

        <ArticleH2 id="protect-the-private-key">Protecting the Private Key</ArticleH2>
        <ArticleUl>
          <ArticleLi>Generate the key where it will be used, or inside a KMS/HSM that signs on your behalf, so it never travels through laptops or chat.</ArticleLi>
          <ArticleLi>Keep one key per environment. A staging key must not be able to sign production tokens.</ArticleLi>
          <ArticleLi>Never commit <ArticleCode>*-private.pem</ArticleCode>; add it to <ArticleCode>.gitignore</ArticleCode> before generating.</ArticleLi>
          <ArticleLi>Rotate on a schedule by publishing the new public key first, switching the signer, then retiring the old key once its tokens have expired.</ArticleLi>
          <ArticleLi>Pin the accepted algorithms in every verifier. Accepting whatever <ArticleCode>alg</ArticleCode> the header names is how <a href="/jwt-security-best-practices" className={link}>algorithm confusion</a> happens.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>RS256: <ArticleCode>openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048</ArticleCode>, then <ArticleCode>openssl pkey -pubout</ArticleCode> for the public key.</ArticleLi>
          <ArticleLi>ES256: <ArticleCode>openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256</ArticleCode>. Ed25519: <ArticleCode>openssl genpkey -algorithm ed25519</ArticleCode>, with <ArticleCode>alg</ArticleCode> <ArticleCode>EdDSA</ArticleCode> (RFC 8037) or <ArticleCode>Ed25519</ArticleCode> (RFC 9864).</ArticleLi>
          <ArticleLi>Private keys should be PKCS#8 (<ArticleCode>BEGIN PRIVATE KEY</ArticleCode>) and public keys SPKI (<ArticleCode>BEGIN PUBLIC KEY</ArticleCode>); convert legacy PKCS#1 and SEC 1 files with <ArticleCode>openssl pkcs8</ArticleCode> or <ArticleCode>openssl rsa</ArticleCode>.</ArticleLi>
          <ArticleLi>Sign and verify a test token before distributing the public key, then publish it as a JWKS with a <ArticleCode>kid</ArticleCode>.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
