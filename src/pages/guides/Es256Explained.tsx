import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'ES256 Explained: ECDSA with P-256 for JWT Signing',
  description: 'A deep technical guide to ES256, the ECDSA P-256 JWT signing algorithm, how it works, how it differs from RS256, key sizes, signature format, and when to choose it.',
  url: 'https://jwtdecode.app/es256-explained',
  mainEntityOfPage: 'https://jwtdecode.app/es256-explained',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-05-27',
  dateModified: '2026-05-27',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function Es256ExplainedPage() {
  return (
    <>
      <SEOHead
        title="ES256 Explained: ECDSA P-256 for JWT Signing"
        description="ES256 — ECDSA with P-256 and SHA-256 — is the modern asymmetric JWT algorithm. Signature format, key sizes, and when to choose it over RS256."
        path="/es256-explained"
        ogType="article"
        article={{ publishedTime: '2026-05-27', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'ES256 Explained' }]}
        publishedDate="2026-05-27"
        relatedLinks={[
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'The broader symmetric-vs-asymmetric decision ES256 sits inside.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works for ECDSA and other families.' },
          { to: '/jwt-header-payload-signature-explained', label: 'Header, Payload & Signature', description: 'How the signature is computed at the JWT-encoding layer.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Algorithm selection, key rotation, and avoiding algorithm-confusion attacks.' },
        ]}
      >
        <ArticleH1>ES256 Explained: ECDSA with P-256 for JWT Signing</ArticleH1>

        <ArticleIntroBox>
          ES256 is the JWT algorithm identifier for ECDSA using the P-256 curve and SHA-256. It's the modern
          asymmetric default, used by Apple Sign in with Apple, every WebAuthn/passkey credential, and most
          new OAuth 2.0 services. This guide explains what ES256 actually does, how the signature format works,
          why the keys are an order of magnitude smaller than RSA keys at equivalent security, and when ES256
          is the right pick over RS256 or PS256.
        </ArticleIntroBox>

        <ArticleH2 id="what-is-es256">What ES256 Means</ArticleH2>
        <ArticleP>
          The algorithm identifier <ArticleCode>ES256</ArticleCode> appears in a JWT's header as
          <ArticleCode>"alg":"ES256"</ArticleCode>. It decomposes into three parts that the JOSE specification
          fixes simultaneously:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>E</strong>: ECDSA (Elliptic Curve Digital Signature Algorithm), defined in FIPS 186-4.</ArticleLi>
          <ArticleLi><strong>S</strong>: Signature (as opposed to encryption, <a href="/is-jwt-encrypted-jws-vs-jwe" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWE</a> uses different identifiers).</ArticleLi>
          <ArticleLi><strong>256</strong>: SHA-256 hash function AND the P-256 curve (also called secp256r1 or prime256v1). The number pins both.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          That last point trips people up. The "256" in ES256 is NOT a free choice of hash length over a curve —
          ES256 is exactly P-256 + SHA-256. ES384 is exactly P-384 + SHA-384. ES512 is P-521 (not 512) + SHA-512.
          RFC 7518 §3.4 specifies these triples explicitly; an implementation that pairs P-256 with SHA-384
          isn't ES256, it's non-compliant.
        </ArticleP>

        <ArticleH2 id="signature-format">The Signature Format That Catches Everyone Out</ArticleH2>
        <ArticleP>
          ECDSA signatures are mathematically pairs of integers, conventionally called <ArticleCode>(r, s)</ArticleCode>.
          For ES256 each integer is 256 bits, 32 bytes. There are two ways the world encodes this pair:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>ASN.1 DER encoding</strong>: what OpenSSL, Java, and most general-purpose crypto libraries produce by default. Variable-length (typically 70-72 bytes), wrapped in an ASN.1 SEQUENCE.</ArticleLi>
          <ArticleLi><strong>Raw IEEE P1363 / R || S concatenation</strong>: what JWT mandates. Fixed-length 64 bytes for ES256 (32 bytes r, 32 bytes s, big-endian, padded with leading zeros if needed). No ASN.1 wrapper.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          The #1 ES256 implementation bug: signing produces a DER-encoded signature, but RFC 7515 requires the
          raw 64-byte concatenation. Tokens then fail verification in any standards-compliant decoder. If your
          ES256 token "verifies in one library but not another", check the signature length, 64 bytes raw vs
          70-72 bytes DER is the giveaway.
        </ArticleCallout>
        <ArticleP>
          The browser's Web Crypto API (which jwtdecode.app uses) produces and accepts the raw P1363 format by
          default for <ArticleCode>ECDSA</ArticleCode> algorithms, so the JWT spec aligns with the platform.
          Node.js's <ArticleCode>crypto.sign()</ArticleCode> defaults to DER and needs the
          <ArticleCode>dsaEncoding: 'ieee-p1363'</ArticleCode> option (Node 13+) to produce JWT-compliant output.
        </ArticleP>

        <ArticleH2 id="key-format">Key Format</ArticleH2>
        <ArticleP>
          ES256 uses an EC <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">key pair</a> on the P-256 curve. In PEM/SPKI form, a P-256 public key is ~178 bytes
          encoded, substantially smaller than a 2048-bit RSA SPKI public key (~294 bytes) and dramatically
          smaller than 4096-bit RSA (~550 bytes). The private key in PKCS#8 form is ~138 bytes.
        </ArticleP>
        <ArticlePre lang="text">{`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----`}</ArticlePre>
        <ArticleP>
          In JWK form, an ES256 public key has four fields: <ArticleCode>kty:"EC"</ArticleCode>,
          <ArticleCode>crv:"P-256"</ArticleCode>, plus the affine point coordinates <ArticleCode>x</ArticleCode>
          and <ArticleCode>y</ArticleCode> as base64url-encoded 32-byte values. The private key adds
          <ArticleCode>d</ArticleCode>, the scalar private key, also 32 bytes base64url-encoded.
        </ArticleP>

        <ArticleH2 id="why-prefer-es256">Why Prefer ES256 over RS256</ArticleH2>
        <ArticleH3 id="size">Smaller signatures and keys</ArticleH3>
        <ArticleP>
          An ES256 signature is 64 bytes raw, ~86 characters in base64url. An RS256 signature with a 2048-bit
          key is 256 bytes, ~342 characters base64url. For high-throughput services issuing many JWTs,
          ES256 saves real bandwidth, a JWT bearer header on every API call multiplies that delta.
        </ArticleP>
        <ArticleH3 id="speed">Faster verification</ArticleH3>
        <ArticleP>
          ECDSA verification with P-256 is typically 2-5× faster than RSA-2048 verification on modern CPUs
          with hardware curve support. Signing is the opposite, RSA signing is faster than ECDSA signing —
          but for the issuer/verifier asymmetry of OAuth/OIDC where one IdP signs and many resource servers
          verify, the ES256 verification speedup is the path that matters.
        </ArticleP>
        <ArticleH3 id="equivalent-security">Equivalent security at smaller parameters</ArticleH3>
        <ArticleP>
          NIST estimates P-256 provides ~128 bits of classical security, roughly equivalent to RSA-3072. A
          P-256 key is 8-12× smaller than an RSA key at equivalent strength. For embedded clients, mobile
          tokens, and constrained-bandwidth scenarios, the trade is decisive.
        </ArticleP>

        <ArticleH2 id="when-not-to-use">When ES256 Is Not the Right Choice</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Legacy HSM constraints</strong>: older HSMs may not support ECDSA, or charge extra for elliptic-curve operations. Check before designing around it.</ArticleLi>
          <ArticleLi><strong>FIPS 140-2 compliance edge cases</strong>: some compliance regimes still favour RSA for institutional reasons unrelated to the underlying math. Confirm with your auditor.</ArticleLi>
          <ArticleLi><strong>Java 8 without BouncyCastle</strong>: out-of-the-box P-256 support exists, but ES256 JWT libraries on Java 8 historically had P1363/DER conversion bugs. Java 11+ is fine.</ArticleLi>
          <ArticleLi><strong>Nonce-reuse risk in your signing code</strong>: ECDSA requires a per-signature nonce. Reusing it (or using a weak RNG) leaks the private key entirely. RFC 6979 deterministic ECDSA eliminates this risk; check your library uses it. RSA-PSS has the same nonce concern but is more forgiving in failure modes.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="es256-vs-ps256">ES256 vs PS256</ArticleH2>
        <ArticleP>
          Both are modern asymmetric JWT algorithms. The honest comparison: ES256 keys are smaller; <a href="/ps256-vs-rs256" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">PS256</a>
          interoperates with RSA-only infrastructure. If you're already paying the cost of RSA key infrastructure
          (HSMs, key rotation tooling, <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS</a> endpoints), PS256 is a solid choice over RS256 because PSS padding
          eliminates the malleability concerns of PKCS#1 v1.5. If you're greenfield, ES256 is generally the better
          default. See <em>PS256 vs RS256</em> for the deeper RSA-side comparison.
        </ArticleP>

        <ArticleH2 id="verifying-es256">Verifying an ES256 Token</ArticleH2>
        <ArticleP>
          Verification needs the issuer's public key (in PEM, JWK, or JWKS form), the algorithm identifier from
          the token header (confirmed to be ES256, never trust the header without checking against an
          allow-list), and the standard JWT verification steps: split on dots, base64url-decode the signature
          to 64 raw bytes, recompute the signing input as <ArticleCode>base64url(header) + "." + base64url(payload)</ArticleCode>,
          SHA-256 the signing input, and verify the signature with the public key.
        </ArticleP>
        <ArticleP>
          jwtdecode.app does this entirely <a href="/decode-jwt-without-a-server" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">in the browser</a> via <ArticleCode>SubtleCrypto.verify("ECDSA")</ArticleCode>.
          Paste a token and its PEM public key into <a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline">the JWT decoder</a>, verification runs locally, the token never leaves your browser.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          ES256 is the recommended asymmetric JWT algorithm for new systems. It produces a 64-byte raw signature
          (not DER), uses P-256 curve and SHA-256 strictly per RFC 7518, and offers smaller keys, faster
          verification, and equivalent security to RSA-3072. The two pitfalls to watch: signature encoding
          (raw vs DER) and nonce generation in your signing library.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
