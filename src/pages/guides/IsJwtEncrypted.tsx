import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Is a JWT Encrypted? JWS vs JWE vs JWT Explained',
  description: 'Most JWTs are signed (JWS), not encrypted: the payload is only Base64url-encoded and anyone can read it. This guide explains JWS (RFC 7515) versus JWE (RFC 7516), the five parts of an encrypted JWT, the alg and enc algorithms, and nested JWTs.',
  url: 'https://jwtdecode.app/is-jwt-encrypted-jws-vs-jwe',
  mainEntityOfPage: 'https://jwtdecode.app/is-jwt-encrypted-jws-vs-jwe',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const JWS_VS_JWE: [aspect: string, jws: string, jwe: string][] = [
  ['Specification', 'RFC 7515', 'RFC 7516'],
  ['Protects', 'Integrity and authenticity', 'Confidentiality, plus integrity of the ciphertext'],
  ['Payload readable by holder', 'Yes, it is only Base64url-encoded', 'No, only the recipient with the decryption key'],
  ['Compact form', '3 parts: header.payload.signature', '5 parts: header.encryptedKey.iv.ciphertext.tag'],
  ['Header algorithm fields', 'alg (e.g. RS256, ES256, HS256)', 'alg (key management) and enc (content encryption)'],
  ['Who holds which key', 'Issuer signs with private key; anyone verifies with public key', 'Sender encrypts with recipient’s public key; only recipient decrypts'],
  ['Proves who issued it', 'Yes (asymmetric algorithms)', 'Not on its own; sign first, then encrypt (nested JWT)'],
  ['Typical use', 'Access tokens, ID tokens, almost all JWTs', 'Tokens carrying personal data through untrusted parties, encrypted session cookies'],
];

const JWE_ALG: [value: string, meaning: string][] = [
  ['RSA-OAEP-256', 'Random content key, encrypted to the recipient’s RSA public key with OAEP and SHA-256. A sound default.'],
  ['RSA-OAEP', 'As above with SHA-1 in OAEP. Still widely supported; prefer the SHA-256 variant for new systems.'],
  ['RSA1_5', 'RSA PKCS#1 v1.5 key encryption. Prone to padding-oracle attacks; avoid (RFC 8725).'],
  ['ECDH-ES / ECDH-ES+A256KW', 'Ephemeral elliptic-curve key agreement with the recipient’s EC public key; direct or with AES key wrap.'],
  ['A128KW / A256KW', 'Content key wrapped with a shared AES key.'],
  ['dir', 'No key management: the shared symmetric key is used directly as the content key. The encrypted-key part is empty.'],
];

const JWE_ENC: [value: string, meaning: string][] = [
  ['A256GCM / A128GCM', 'AES in Galois/Counter Mode. Authenticated, fast, the common choice.'],
  ['A256CBC-HS512 / A128CBC-HS256', 'AES-CBC with an HMAC-SHA-2 tag, combined as an authenticated scheme. Used by Auth.js session cookies.'],
];

export default function IsJwtEncryptedPage() {
  return (
    <>
      <SEOHead
        title="Is JWT Encrypted? JWS vs JWE Explained"
        description="Is JWT encrypted? Usually not: most JWTs are signed and only Base64url-encoded, so anyone can read them. Learn how JWS and JWE differ and when to encrypt."
        path="/is-jwt-encrypted-jws-vs-jwe"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Is JWT Encrypted?' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-header-payload-signature-explained', label: 'Header, Payload & Signature', description: 'How the three parts of a signed JWT are built.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'What not to put in a JWT payload, and why.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How JWS signatures are checked, algorithm by algorithm.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Choosing a signing algorithm for JWS tokens.' },
        ]}
      >
        <ArticleH1>Is JWT Encrypted? JWS vs JWE vs JWT Explained</ArticleH1>

        <ArticleIntroBox>
          No, a JWT is not encrypted by default. Almost every JWT you meet, including OAuth access tokens and OpenID
          Connect ID tokens, is a signed token (a JWS, RFC 7515). Its header and payload are Base64url-encoded, which
          is a reversible text encoding, not encryption, so anyone who holds the token can read every claim. The
          signature only stops anyone from <em>changing</em> the claims without detection.
          <br /><br />
          Encrypted JWTs do exist. They use JWE (RFC 7516), have five dot-separated parts instead of three, and can only
          be read by the holder of the decryption key. You can tell which one you have by counting the dots: two dots
          means signed and readable, four dots means encrypted.
        </ArticleIntroBox>

        <ArticleH2 id="is-jwt-encoded-or-encrypted">Is a JWT Encoded or Encrypted?</ArticleH2>
        <ArticleP>
          A signed JWT is encoded. Base64url turns bytes into URL-safe text and back again with no key involved. One
          line of Node.js reads the payload of any signed JWT:
        </ArticleP>
        <ArticlePre>{`const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

console.log(JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()));
// { sub: '1234567890', name: 'John Doe', iat: 1516239022 }`}</ArticlePre>
        <ArticleP>
          No secret was needed. The same is true in a browser, where the <a href="/" className={LINK}>jwtdecode.app decoder</a> reads
          the header and payload locally. This is by design: resource servers, API gateways and clients often need to
          read claims such as <ArticleCode>exp</ArticleCode> or <ArticleCode>scope</ArticleCode> without holding a secret.
          The details of encoding are in <a href="/jwt-header-payload-signature-explained" className={LINK}>JWT header, payload and signature explained</a>.
        </ArticleP>
        <ArticleCallout type="warning">
          Because the payload is readable, never put passwords, API keys, full card numbers, health data or other
          secrets in a signed JWT. Assume anything in the payload will end up in a browser, a log file or a support
          ticket. See <a href="/jwt-security-best-practices" className="underline underline-offset-2">JWT security best practices</a>.
        </ArticleCallout>

        <ArticleH2 id="jws-vs-jwe-vs-jwt">JWS vs JWE vs JWT: How the Terms Relate</ArticleH2>
        <ArticleP>
          The three acronyms come from the JOSE (JSON Object Signing and Encryption) family of specifications and
          describe different things:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>JWT</strong> (RFC 7519) defines a set of claims as a JSON object: <ArticleCode>iss</ArticleCode>, <ArticleCode>sub</ArticleCode>, <ArticleCode>aud</ArticleCode>, <ArticleCode>exp</ArticleCode> and so on. It does not define how to protect them.</ArticleLi>
          <ArticleLi><strong>JWS</strong> (RFC 7515) is a container that signs any payload. A JWT inside a JWS is a signed JWT.</ArticleLi>
          <ArticleLi><strong>JWE</strong> (RFC 7516) is a container that encrypts any payload. A JWT inside a JWE is an encrypted JWT.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          So &ldquo;JWT vs JWS&rdquo; is not really a choice: a JWT is always carried as either a JWS or a JWE. When people
          say &ldquo;JWT&rdquo; they almost always mean a JWS-signed JWT. The algorithms both use are registered in RFC 7518
          (JWA), and keys can be expressed as JWKs (RFC 7517).
        </ArticleP>

        <ArticleH2 id="jwt-vs-jwe">JWS vs JWE: Signed vs Encrypted Tokens</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">JWS (signed JWT)</th>
                <th className="px-3 py-2 font-semibold">JWE (encrypted JWT)</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {JWS_VS_JWE.map(([aspect, jws, jwe]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{jws}</td>
                  <td className="px-3 py-2">{jwe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Note the key direction flips. With JWS the issuer holds the private key and everyone else verifies with the
          public key. With JWE the <em>recipient</em> holds the private key and anyone with the public key can encrypt to
          them, which means encryption alone says nothing about who created the token.
        </ArticleP>

        <ArticleH2 id="jwe">What a JWE Looks Like: the Five Parts</ArticleH2>
        <ArticleP>
          A JWE in compact serialisation has five Base64url segments:
        </ArticleP>
        <ArticlePre>{`BASE64URL(protected header)
. BASE64URL(encrypted key)
. BASE64URL(initialisation vector)
. BASE64URL(ciphertext)
. BASE64URL(authentication tag)`}</ArticlePre>
        <ArticleUl>
          <ArticleLi><strong>Protected header</strong>: readable JSON such as <ArticleCode>{'{"alg":"RSA-OAEP-256","enc":"A256GCM","kid":"enc-2026"}'}</ArticleCode>. It is not encrypted, but it is authenticated as additional data, so it cannot be altered.</ArticleLi>
          <ArticleLi><strong>Encrypted key</strong>: a random content encryption key (CEK), encrypted for the recipient. Empty when <ArticleCode>alg</ArticleCode> is <ArticleCode>dir</ArticleCode> or plain <ArticleCode>ECDH-ES</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>IV</strong>: the nonce for the content cipher, random per token.</ArticleLi>
          <ArticleLi><strong>Ciphertext</strong>: the encrypted claims.</ArticleLi>
          <ArticleLi><strong>Authentication tag</strong>: detects any modification of the header, IV or ciphertext.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The only readable part is the header, which usually tells you the algorithms and the <ArticleCode>kid</ArticleCode> of
          the key needed to decrypt.
        </ArticleP>

        <ArticleH2 id="is-jwt-token-encrypted">How to Tell if a JWT Token Is Encrypted</ArticleH2>
        <ArticleP>
          You can decide in seconds without any key:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Count the segments.</strong> Three segments (two dots) means JWS; five segments (four dots) means JWE. Nothing else is valid compact serialisation.</ArticleLi>
          <ArticleLi><strong>Decode the first segment.</strong> Both forms start with a readable JSON header, usually beginning <ArticleCode>eyJ</ArticleCode>. A JWS header has <ArticleCode>alg</ArticleCode> values such as <ArticleCode>RS256</ArticleCode> or <ArticleCode>ES256</ArticleCode>; a JWE header has both <ArticleCode>alg</ArticleCode> (for example <ArticleCode>RSA-OAEP-256</ArticleCode>) and <ArticleCode>enc</ArticleCode> (for example <ArticleCode>A256GCM</ArticleCode>).</ArticleLi>
          <ArticleLi><strong>Try to decode the second segment.</strong> In a JWS it is JSON claims. In a JWE it is an encrypted key (or empty) and decodes to random bytes.</ArticleLi>
          <ArticleLi><strong>No dots at all</strong> means neither: it is an opaque reference token that only its issuer can interpret.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Identity providers almost always issue signed access and ID tokens. When you do meet a JWE in the wild, it is
          typically an encrypted ID token requested by a client, a framework&rsquo;s encrypted session cookie, or a token in
          a regulated profile such as open banking. How providers use each token type is covered in
          <a href="/jwt-in-oauth2-and-openid-connect" className={LINK}> JWTs in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>
        <ArticleCallout type="info">
          Use separate keys for signing and encryption, even when both are RSA. A JWKS can publish them side by side,
          distinguished by <ArticleCode>use: sig</ArticleCode> and <ArticleCode>use: enc</ArticleCode>, each with its own
          <ArticleCode> kid</ArticleCode>. Reusing one key pair for both purposes is a long-standing cryptographic anti-pattern.
        </ArticleCallout>

        <ArticleH2 id="jwt-encryption-algorithms">JWT Encryption Algorithms: alg and enc</ArticleH2>
        <ArticleP>
          JWE uses two algorithms together. <ArticleCode>alg</ArticleCode> decides how the content key reaches the recipient;
          <ArticleCode> enc</ArticleCode> decides how the claims themselves are encrypted with that key.
        </ArticleP>
        <ArticleH3 id="jwe-alg">Key management (alg)</ArticleH3>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">alg</th>
                <th className="px-3 py-2 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {JWE_ALG.map(([value, meaning]) => (
                <tr key={value} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{value}</td>
                  <td className="px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleH3 id="jwe-enc">Content encryption (enc)</ArticleH3>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">enc</th>
                <th className="px-3 py-2 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {JWE_ENC.map(([value, meaning]) => (
                <tr key={value} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{value}</td>
                  <td className="px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Sensible defaults: <ArticleCode>RSA-OAEP-256</ArticleCode> or <ArticleCode>ECDH-ES+A256KW</ArticleCode> with
          <ArticleCode> A256GCM</ArticleCode> when sender and recipient are different parties, and <ArticleCode>dir</ArticleCode> with
          <ArticleCode> A256GCM</ArticleCode> or <ArticleCode>A256CBC-HS512</ArticleCode> when the same service both writes and
          reads the token, as with an encrypted session cookie. As with signing, the recipient should allow-list the
          <ArticleCode> alg</ArticleCode> and <ArticleCode>enc</ArticleCode> values it accepts rather than trusting the header.
        </ArticleP>

        <ArticleH2 id="jwt-encryption-example">JWT Encryption in Practice</ArticleH2>
        <ArticleP>
          Encrypting and decrypting a JWT with the <ArticleCode>jose</ArticleCode> library (v6) in Node.js:
        </ArticleP>
        <ArticlePre>{`import { EncryptJWT, jwtDecrypt, generateKeyPair } from 'jose';

// The recipient's key pair; in production the sender only has the public key.
const { publicKey, privateKey } = await generateKeyPair('RSA-OAEP-256');

const jwe = await new EncryptJWT({ sub: 'user_123', email: 'ada@example.com' })
  .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
  .setIssuer('https://auth.example.com')
  .setAudience('https://api.example.com')
  .setExpirationTime('10m')
  .encrypt(publicKey);

console.log(jwe.split('.').length);   // 5

const { payload } = await jwtDecrypt(jwe, privateKey, {
  issuer: 'https://auth.example.com',
  audience: 'https://api.example.com',
});
console.log(payload.email);           // 'ada@example.com'`}</ArticlePre>
        <ArticleCallout type="info">
          jwtdecode.app works with signed tokens only. It does not decrypt JWE, and it rejects five-part tokens rather
          than guessing at their contents. Decrypt a JWE in your own code with the recipient&rsquo;s key, as above.
        </ArticleCallout>

        <ArticleH2 id="nested-jwt">Nested JWTs: Signed and Then Encrypted</ArticleH2>
        <ArticleP>
          A plain JWE hides the claims but, with public-key encryption, does not prove who produced them. When you need
          both confidentiality and a verifiable issuer, sign the JWT first and then encrypt the whole signed token. RFC
          7519 §5.2 calls this a nested JWT and requires the outer header to carry <ArticleCode>"cty": "JWT"</ArticleCode>.
        </ArticleP>
        <ArticlePre>{`import { SignJWT, CompactEncrypt, compactDecrypt, jwtVerify } from 'jose';

// Sender: sign with its own private key, then encrypt to the recipient.
const signed = await new SignJWT({ sub: 'user_123' })
  .setProtectedHeader({ alg: 'ES256' })
  .setExpirationTime('10m')
  .sign(senderPrivateKey);

const nested = await new CompactEncrypt(new TextEncoder().encode(signed))
  .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM', cty: 'JWT' })
  .encrypt(recipientPublicKey);

// Recipient: decrypt, then verify the inner signature.
const { plaintext } = await compactDecrypt(nested, recipientPrivateKey);
const { payload } = await jwtVerify(new TextDecoder().decode(plaintext), senderPublicKey);`}</ArticlePre>
        <ArticleP>
          Sign-then-encrypt is the recommended order: the signature covers the real claims, and the outer layer hides
          both the claims and the signature. OpenID Connect uses exactly this when a client registers for encrypted ID
          tokens.
        </ArticleP>

        <ArticleH2 id="when-to-encrypt">Do You Need to Encrypt Your JWTs?</ArticleH2>
        <ArticleP>
          Usually not. TLS already protects tokens in transit, and signing covers integrity. Encryption is worth its
          extra keys and complexity when:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>The token carries personal or regulated data and passes through a party that should not read it, such as a browser or a third-party client.</ArticleLi>
          <ArticleLi>You store session state in a cookie and do not want users to read or learn from it (Auth.js encrypts its JWT sessions with <ArticleCode>dir</ArticleCode> and <ArticleCode>A256CBC-HS512</ArticleCode> by default).</ArticleLi>
          <ArticleLi>A regulation or partner profile requires it, as some open banking and high-assurance OIDC profiles do.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Often the simpler answer is to keep sensitive data out of the token altogether: put a user ID in the JWT and
          look the rest up server-side, or use an opaque token that only the issuer can resolve. Both options are
          compared in <a href="/jwt-vs-oauth#jwt-vs-opaque-token" className={LINK}>JWT vs opaque access tokens</a>. To confirm
          a signed token still verifies after you change its contents, see the <a href="/jwt-verification-guide" className={LINK}>verification guide</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>A standard JWT is signed (JWS), not encrypted: its payload is Base64url-encoded and readable by anyone who has it.</ArticleLi>
          <ArticleLi>JWS (RFC 7515) gives integrity with three parts; JWE (RFC 7516) gives confidentiality with five.</ArticleLi>
          <ArticleLi>JWE combines a key-management <ArticleCode>alg</ArticleCode> (for example <ArticleCode>RSA-OAEP-256</ArticleCode> or <ArticleCode>dir</ArticleCode>) with a content <ArticleCode>enc</ArticleCode> (for example <ArticleCode>A256GCM</ArticleCode>).</ArticleLi>
          <ArticleLi>For confidentiality and a verifiable issuer, sign first and then encrypt, producing a nested JWT with <ArticleCode>cty: JWT</ArticleCode>.</ArticleLi>
          <ArticleLi>Most systems do not need JWE; keeping secrets out of the payload is simpler.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
