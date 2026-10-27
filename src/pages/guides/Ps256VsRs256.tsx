import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'PS256 vs RS256: RSA-PSS or RSA-PKCS1 for JWT Signing?',
  description: 'A practical comparison of PS256 (RSA-PSS) and RS256 (RSA-PKCS1 v1.5) JWT algorithms, padding differences, security properties, interoperability, and when to migrate.',
  url: 'https://jwtdecode.app/ps256-vs-rs256',
  mainEntityOfPage: 'https://jwtdecode.app/ps256-vs-rs256',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-05-27',
  dateModified: '2026-05-27',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function Ps256VsRs256Page() {
  return (
    <>
      <SEOHead
        title="PS256 vs RS256: RSA-PSS vs PKCS#1 Padding"
        description="PS256 vs RS256: RSA-PSS versus PKCS#1 v1.5 padding. Security differences, signature determinism, interoperability, and migration guidance."
        path="/ps256-vs-rs256"
        ogType="article"
        article={{ publishedTime: '2026-05-27', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'PS256 vs RS256' }]}
        publishedDate="2026-05-27"
        relatedLinks={[
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'The broader symmetric-vs-asymmetric decision PS256/RS256 sits inside.' },
          { to: '/es256-explained', label: 'ES256 Explained', description: 'The modern ECDSA alternative, smaller keys, faster verification.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How signature verification works for RSA-PSS and PKCS1.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Algorithm allow-listing and avoiding algorithm-confusion attacks.' },
        ]}
      >
        <ArticleH1>PS256 vs RS256: RSA-PSS or RSA-PKCS1 for JWT Signing?</ArticleH1>

        <ArticleIntroBox>
          PS256 and RS256 both use 2048-bit RSA keys and SHA-256, but they differ in one decisive detail:
          padding. RS256 uses PKCS#1 v1.5 padding (defined in <strong>PKCS#1 v1.5 / RFC 2313</strong> and
          carried into <strong>RFC 8017</strong>), widely known to be deterministic and historically
          vulnerable to oracle attacks. PS256 uses RSA-PSS, the Probabilistic Signature Scheme defined in
          <strong> RFC 8017 §9.1</strong>, which has a tight security proof and is randomised. Both
          algorithm identifiers are registered for JWT use in <strong>RFC 7518 §3.3 and §3.5</strong>.
          This guide explains when the difference matters, when it doesn't, and how to migrate.
        </ArticleIntroBox>

        <ArticleH2 id="same-key-different-padding">Same Key, Different Padding</ArticleH2>
        <ArticleP>
          A practical truth that surprises people: PS256 and RS256 can use the <em>same RSA <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">key pair</a></em>. The
          algorithm identifier in the JWT header (<ArticleCode>"alg":"PS256"</ArticleCode> vs
          <ArticleCode>"alg":"RS256"</ArticleCode>) selects the padding scheme applied during signing and
          verification, the underlying key material is identical. This is why most <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS</a> endpoints can serve
          one key that supports either, controlled by the <ArticleCode>alg</ArticleCode> field on the JWK.
        </ArticleP>
        <ArticleP>
          The difference is what happens between "I have a SHA-256 hash of the signing input" and "I have an
          RSA signature". RS256 wraps the hash in PKCS#1 v1.5 deterministic padding before the RSA private-key
          operation. PS256 generates a random salt, runs the hash and salt through MGF1 (a mask generation
          function), and produces a randomised padding block, same RSA operation, different (and probably better)
          input.
        </ArticleP>

        <ArticleH2 id="why-pkcs1-is-suspect">Why PKCS#1 v1.5 Is Suspect</ArticleH2>
        <ArticleP>
          PKCS#1 v1.5 isn't "broken" for digital signatures in the sense that you can directly forge a
          signature without the private key. But it has a 30-year history of edge-case attacks:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Bleichenbacher's e=3 attack (2006)</strong>: exploits implementations that don't fully verify the padding structure on signature verification. The classic "RSA signature forgery via a low exponent" attack.</ArticleLi>
          <ArticleLi><strong>ROBOT (2017)</strong>: a Bleichenbacher-style timing oracle resurrection that affected major TLS implementations 19 years after the original was published.</ArticleLi>
          <ArticleLi><strong>Marvin attack (2023)</strong>: yet another timing variant, still finding implementations that hadn't constant-timed padding parsing.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          None of these directly forge a JWT signature, and a correctly-implemented RS256 verifier is safe
          against the known attacks. The pattern matters, though: PKCS#1 v1.5 keeps yielding new variants of
          old attacks because its deterministic structure leaves room for implementation mistakes. PSS is
          mathematically harder to misimplement in an exploitable way.
        </ArticleP>

        <ArticleH2 id="pss-properties">What PSS Buys You</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Provable security</strong>: PSS has a tight security reduction to the RSA problem under standard assumptions. PKCS#1 v1.5 famously does not.</ArticleLi>
          <ArticleLi><strong>Randomised signatures</strong>: signing the same JWT twice produces two different signatures. RS256 produces an identical signature each time.</ArticleLi>
          <ArticleLi><strong>No "low exponent" concern</strong>: the salt and MGF1 step eliminate the <a href="/jwt-attacks-and-vulnerabilities" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">attack surface</a> that low-exponent PKCS#1 v1.5 has been bitten by.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="info">
          The randomisation of PSS is irrelevant for JWT semantics, you don't gain or lose any property
          from signatures being non-deterministic, because the JWT payload includes <ArticleCode>iat</ArticleCode>
          / <ArticleCode>jti</ArticleCode> claims that already make repeated signings produce different tokens.
          The benefit is purely cryptographic.
        </ArticleCallout>

        <ArticleH2 id="interoperability">Interoperability: Where PS256 Wins, Where RS256 Wins</ArticleH2>
        <ArticleH3 id="rs256-wins">RS256 wins on legacy reach</ArticleH3>
        <ArticleP>
          Every JWT library ever shipped supports RS256. Old enterprise IAM products (older ADFS, legacy
          Java SSO frameworks, embedded device firmware) often only support RS256. If you're integrating with
          any unknown identity ecosystem, RS256 is the highest-confidence default.
        </ArticleP>
        <ArticleH3 id="ps256-wins">PS256 wins on modern stacks</ArticleH3>
        <ArticleP>
          Every modern library, node-jose, jose-jwt, python-jose, golang-jwt, .NET Microsoft.IdentityModel,
          PyJWT, Auth0's auth0/node-jsonwebtoken (v9+), supports PS256 first-class. <a href="/jwt-in-oauth2-and-openid-connect" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">OpenID Connect</a>'s
          self-issued OPs, FAPI 2.0 profiles, and most fintech compliance regimes mandate PS256 (or PS384/PS512)
          and forbid RS256 in new deployments.
        </ArticleP>

        <ArticleH2 id="signature-size">Signature and Key Sizes</ArticleH2>
        <ArticleP>
          Both produce identical-size signatures for a given RSA key size: 256 bytes for 2048-bit RSA, 512 bytes
          for 4096-bit. The base64url-encoded signature in the JWT is ~342 characters (2048-bit) regardless of
          which padding is used. No bandwidth tradeoff between the two, only ES256/EdDSA save bytes.
        </ArticleP>

        <ArticleH2 id="migration">Migrating from RS256 to PS256</ArticleH2>
        <ArticleP>
          Because the key pair is shared, the migration is a "header swap" not a "key rotation":
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Update the issuer to sign tokens with <ArticleCode>alg: PS256</ArticleCode> using the existing private key.</ArticleLi>
          <ArticleLi>Update every verifier's allow-list to accept BOTH RS256 and PS256 during the transition window.</ArticleLi>
          <ArticleLi>After all in-flight tokens expire (one access-token lifetime), remove RS256 from the allow-list.</ArticleLi>
          <ArticleLi>Update the JWKS endpoint's <ArticleCode>alg</ArticleCode> field on the key to <ArticleCode>"PS256"</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          DO NOT silently switch issuance to PS256 without first updating every verifier's allow-list. Verifiers
          that only accept RS256 will reject your new PS256 tokens. The "allow both, then narrow" pattern is
          the safe rollout.
        </ArticleCallout>

        <ArticleH2 id="algorithm-confusion">The Algorithm Confusion Pitfall (Applies to Both)</ArticleH2>
        <ArticleP>
          Both PS256 and RS256 are vulnerable to algorithm-confusion attacks if your verifier picks the
          verification algorithm from the JWT's own <ArticleCode>alg</ArticleCode> header rather than from a
          server-side allow-list. The classic attack: attacker takes a token meant to be RS256-signed, changes
          the header to <ArticleCode>HS256</ArticleCode>, and "signs" it using the public key as the <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">HMAC secret</a>.
          A naive verifier reads <ArticleCode>alg: HS256</ArticleCode>, fetches the RSA public key (treated as a
          byte string), runs HMAC-SHA256, and accepts.
        </ArticleP>
        <ArticleP>
          The fix is universal: always pick the verification algorithm from your code or configuration, not
          from the token header. Switching from RS256 to PS256 doesn't help here, the attack works the same
          way against PS256 verifiers that trust the header.
        </ArticleP>

        <ArticleH2 id="when-to-pick-what">Decision Guide</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>New system, full control, no legacy partners</strong> → ES256 first, PS256 if RSA infrastructure is already in place.</ArticleLi>
          <ArticleLi><strong>Mixed legacy ecosystem, need broadest interop</strong> → RS256, with intent to migrate to PS256 later.</ArticleLi>
          <ArticleLi><strong>Fintech, FAPI, OIDC self-issued, compliance regime mandate</strong> → PS256 (or whatever the regime mandates explicitly).</ArticleLi>
          <ArticleLi><strong>HSM-based signing</strong> → Confirm the HSM supports RSA-PSS before choosing it; some older HSMs only do PKCS#1 v1.5.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="verifying-ps256">Verifying a PS256 Token</ArticleH2>
        <ArticleP>
          jwtdecode.app verifies PS256 alongside RS256 using the browser's Web Crypto API
          (<ArticleCode>SubtleCrypto.verify("RSA-PSS", ...)</ArticleCode>). Paste any token with
          <ArticleCode>alg: PS256</ArticleCode> and the matching public key into <a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline">the JWT decoder</a>, verification runs locally, the token never leaves your browser.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          PS256 is RS256's modern replacement at the same key size: provably secure, randomised, and free of
          the recurring PKCS#1 v1.5 implementation pitfalls. They share key infrastructure, so migration is a
          header swap not a key rotation. RS256 stays the right choice when broad legacy interop is the
          constraint; PS256 is the right choice when compliance or threat-modelling pushes for the stronger
          padding. Either way, allow-list algorithms server-side, algorithm confusion attacks bite both.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
