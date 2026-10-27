import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const ALGORITHMS: [alg: string, family: string, key: string, sigSize: string, status: string][] = [
  ['HS256 / HS384 / HS512', 'HMAC with SHA-2', 'Shared secret, at least as long as the hash output', '32 / 48 / 64 bytes', 'HS256 Required'],
  ['RS256 / RS384 / RS512', 'RSASSA-PKCS1-v1_5', 'RSA key pair, 2048 bits or more', 'Key size (256 bytes at 2048 bits)', 'RS256 Recommended'],
  ['PS256 / PS384 / PS512', 'RSASSA-PSS', 'RSA key pair, 2048 bits or more', 'Key size (256 bytes at 2048 bits)', 'Optional'],
  ['ES256 / ES384 / ES512', 'ECDSA on P-256 / P-384 / P-521', 'EC key pair on the named curve', '64 / 96 / 132 bytes', 'ES256 Recommended+'],
  ['EdDSA', 'Ed25519 / Ed448 (RFC 8037)', 'OKP key pair', '64 bytes (Ed25519)', 'Registered separately'],
  ['ES256K', 'ECDSA on secp256k1 (RFC 8812)', 'secp256k1 key pair', '64 bytes', 'Registered separately'],
  ['none', 'Unsecured JWT', 'None', '0 bytes', 'Must be rejected by verifiers'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'HS256 vs RS256: When to Use Symmetric vs Asymmetric JWT Signing',
  description: 'A practical comparison of HS256 and RS256 JWT signing algorithms, operational differences, security tradeoffs, key management implications, and which to choose for your architecture.',
  url: 'https://jwtdecode.app/hs256-vs-rs256',
  mainEntityOfPage: 'https://jwtdecode.app/hs256-vs-rs256',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-04-21',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function Hs256VsRs256Page() {
  return (
    <>
      <SEOHead
        title="HS256 vs RS256: JWT Signing Algorithms"
        description="Practical comparison of HS256 and RS256 JWT algorithms — when to use each, security tradeoffs, key management, and ES256 as an alternative."
        path="/hs256-vs-rs256"
        ogType="article"
        article={{ publishedTime: '2026-04-21', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'HS256 vs RS256' }]}
        publishedDate="2026-04-21"
        updatedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'How verification works for HMAC and asymmetric algorithms.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Complete security checklist including key management.' },
          { to: '/jwt-header-payload-signature-explained', label: 'Header, Payload & Signature', description: 'How the signature is computed for each algorithm.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Fixing algorithm-related verification errors.' },
        ]}
      >
        <ArticleH1>HS256 vs RS256: When to Use Symmetric vs Asymmetric JWT Signing</ArticleH1>

        <ArticleIntroBox>
          The choice between HS256 (HMAC-SHA256) and RS256 (RSA-SHA256) is one of the most consequential
          decisions in a JWT-based authentication architecture. It determines who can verify tokens, who
          can issue them, and how you manage keys across your system. This guide explains both algorithms,
          compares their operational differences, and helps you choose the right one for your use case.
        </ArticleIntroBox>

        <ArticleH2 id="fundamental-difference">The Fundamental Difference</ArticleH2>
        <ArticleP>
          <strong>HS256</strong> is a <em>symmetric</em> algorithm. It uses a single shared secret for
          both signing and verification. Any party with the secret can sign <em>and</em> verify tokens.
        </ArticleP>
        <ArticleP>
          <strong>RS256</strong> is an <em>asymmetric</em> algorithm. It uses a <a href="/generate-jwt-signing-keys-openssl" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">private key</a> for signing
          and a public key for verification. Only the party with the private key can sign tokens, but
          anyone with the public key can verify them, without being able to forge new tokens.
        </ArticleP>
        <ArticlePre>{`// HS256: one secret, used for both
sign(payload, secret)      → token
verify(token, secret)      → valid/invalid

// RS256: separate keys for sign vs verify
sign(payload, private_key) → token
verify(token, public_key)  → valid/invalid`}</ArticlePre>

        <ArticleH2 id="hs256">HS256: HMAC-SHA256</ArticleH2>
        <ArticleH3>How it works</ArticleH3>
        <ArticleP>
          HMAC-SHA256 computes a keyed hash of the signing input (base64url(header) + "." + base64url(payload))
          using the shared secret. The output is used as the JWT signature. Verification re-computes the HMAC
          and compares it to the token's signature using a constant-time comparison.
        </ArticleP>
        <ArticleH3>When to use HS256</ArticleH3>
        <ArticleUl>
          <ArticleLi>
            Simple architectures with a single auth server and a single API service that are both under
            your control and share the same trust boundary
          </ArticleLi>
          <ArticleLi>
            Environments where distributing and managing a public key infrastructure adds complexity
            that isn't justified by the scale
          </ArticleLi>
          <ArticleLi>
            Internal tools or development environments where the secret can be tightly controlled
          </ArticleLi>
        </ArticleUl>
        <ArticleH3>HS256 limitations</ArticleH3>
        <ArticleCallout type="warning">
          Any service that can verify HS256 tokens can also forge them. If a downstream API service
          is compromised, an attacker can issue arbitrary tokens.
        </ArticleCallout>
        <ArticleUl>
          <ArticleLi>
            <strong>Secret distribution problem:</strong> The shared secret must be securely distributed
            to every service that verifies tokens. More services = more exposure.
          </ArticleLi>
          <ArticleLi>
            <strong>No separation of signing authority:</strong> A verifier is also a potential forger.
            This is acceptable in a monolithic app but dangerous in a multi-team <a href="/jwt-in-microservices" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">microservices</a> environment.
          </ArticleLi>
          <ArticleLi>
            <strong>Rotation complexity:</strong> Rotating the secret requires coordinating the update
            across all services simultaneously or implementing a dual-secret overlap period.
          </ArticleLi>
          <ArticleLi>
            <strong>Low-entropy secret risk:</strong> An HS256 secret is only as strong as the entropy
            it contains. Short or predictable secrets (common passwords, UUIDs, base64 of a short string)
            are vulnerable to offline brute-force attacks against captured tokens. Use at least 32 bytes
            of cryptographically random data.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="rs256">RS256: RSA-SHA256</ArticleH2>
        <ArticleH3>How it works</ArticleH3>
        <ArticleP>
          The auth server uses a 2048-bit (or larger) RSA private key to sign the token with PKCS#1 v1.5
          padding. API services verify the token using the corresponding RSA public key. The public key can
          be distributed via a <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWKS endpoint</a> without security risk.
        </ArticleP>
        <ArticleH3>When to use RS256</ArticleH3>
        <ArticleUl>
          <ArticleLi>
            Architectures with multiple independent services that need to verify tokens, each gets
            the public key but cannot forge tokens
          </ArticleLi>
          <ArticleLi>
            Any system where the token issuer (auth server) and the token consumers (APIs) are operated
            by different teams or organizations
          </ArticleLi>
          <ArticleLi>
            When you want to publish your public keys openly via a JWKS endpoint for third-party
            integrations or open-source SDKs
          </ArticleLi>
          <ArticleLi>
            Production systems where the principle of least privilege applies, services should
            not have access to capabilities they don't need
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="es256">ES256: ECDSA as an Alternative</ArticleH2>
        <ArticleP>
          <strong>ES256</strong> (ECDSA with P-256 and SHA-256) provides the same separation of signing
          and verification as RS256, but with much smaller keys and signatures. An ES256 private key is
          256 bits; an RS256 key is typically 2048–4096 bits.
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Smaller signatures reduce JWT size and HTTP header overhead</ArticleLi>
          <ArticleLi>Faster verification on constrained hardware (IoT, edge nodes)</ArticleLi>
          <ArticleLi>Equivalent security to RS256 with much smaller keys</ArticleLi>
          <ArticleLi>Slightly more complex to implement correctly, use a well-tested library</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="ps256">PS256: RSA-PSS as the Modern Alternative to RS256</ArticleH2>
        <ArticleP>
          <strong>PS256</strong> (RSA-PSS with SHA-256) is the successor to RS256. Both use RSA key pairs,
          but they differ in the padding scheme applied before signing:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>RS256 uses PKCS#1 v1.5 padding</strong>: deterministic, well-understood, but the
            padding scheme has theoretical weaknesses (Bleichenbacher attacks) and lacks a tight security
            proof in the standard cryptographic sense.
          </ArticleLi>
          <ArticleLi>
            <strong>PS256 uses PSS (Probabilistic Signature Scheme) padding</strong>: randomised (each
            signature of the same input produces a different output), and provably secure in the random
            oracle model. RFC 7518 notes that RSA-PSS is preferable to PKCS#1 v1.5 for new implementations.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          In practice, both RS256 and PS256 are secure with 2048+ bit keys. The choice matters more for
          compliance (some standards now mandate PSS) than for immediate <a href="/jwt-attacks-and-vulnerabilities" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">attack surface</a>. If you are
          starting a new system and require RSA, use PS256. If you are operating an existing RS256 system,
          migration is low-priority unless your threat model or compliance requirements demand it.
        </ArticleP>

        <ArticleH2 id="real-world">Real-World Algorithm Choices by Platform</ArticleH2>
        <ArticleP>
          Major identity providers and cloud platforms have made different default algorithm choices:
        </ArticleP>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Platform</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Default algorithm</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ['Auth0', 'RS256', 'Recommended default; HS256 available for legacy'],
                ['Okta', 'RS256', 'Keys published at /oauth2/v1/keys JWKS endpoint'],
                ['AWS Cognito', 'RS256', 'Keys at cognito-idp.<region>.amazonaws.com/<pool>/.well-known/jwks.json'],
                ['Google (OAuth2 / Firebase)', 'RS256', 'Keys at accounts.google.com/.well-known/openid-configuration'],
                ['Azure AD / Entra ID', 'RS256', 'Supports PS256 for newer app registrations'],
                ['Keycloak', 'RS256', 'Configurable; ES256 and PS256 available'],
                ['Custom HS256', 'HS256', 'Typical for internal monolith, single shared secret'],
              ].map(([platform, alg, notes]) => (
                <tr key={platform as string} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{platform}</td>
                  <td className="py-2 px-3 font-mono text-indigo-700 dark:text-indigo-400">{alg}</td>
                  <td className="py-2 px-3">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          If you integrate with a third-party identity provider, you have no choice, use whatever
          algorithm the provider issues. The choice between HS256 and RS256 is relevant only when
          you are building and operating your own token issuer.
        </ArticleP>

        <ArticleH2 id="comparison">Side-by-Side Comparison</ArticleH2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">Property</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">HS256</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">RS256</th>
                <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-500 font-semibold">ES256</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ['Algorithm type', 'Symmetric', 'Asymmetric', 'Asymmetric'],
                ['Key for signing', 'Shared secret', 'RSA private key', 'EC private key'],
                ['Key for verification', 'Same shared secret', 'RSA public key', 'EC public key'],
                ['Key size', '≥ 32 bytes', '2048–4096 bits', '256 bits'],
                ['Can verifier forge tokens?', 'Yes', 'No', 'No'],
                ['JWKS support', 'No (key is secret)', 'Yes', 'Yes'],
                ['Signature size', '32 bytes (HS256)', '256–512 bytes', '64 bytes'],
                ['Best for', 'Single-service apps', 'Multi-service, enterprise', 'Performance-sensitive'],
              ].map(([prop, hs, rs, es]) => (
                <tr key={prop as string} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{prop}</td>
                  <td className="py-2 px-3">{hs}</td>
                  <td className="py-2 px-3">{rs}</td>
                  <td className="py-2 px-3">{es}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="algorithm-list">JWT Algorithms List</ArticleH2>
        <ArticleP>
          The <ArticleCode>alg</ArticleCode> values for signed JWTs are defined by JSON Web Algorithms, RFC 7518 §3.1,
          with a few later additions. The implementation-requirement column is RFC 7518's own: only HS256 is
          required, RS256 is recommended and ES256 is "Recommended+", meaning it is expected to become required.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">alg</th>
                <th className="px-3 py-2 font-semibold">Family</th>
                <th className="px-3 py-2 font-semibold">Key</th>
                <th className="px-3 py-2 font-semibold">Signature size</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {ALGORITHMS.map(([alg, family, key, size, status]) => (
                <tr key={alg} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">{alg}</td>
                  <td className="px-3 py-2">{family}</td>
                  <td className="px-3 py-2">{key}</td>
                  <td className="px-3 py-2">{size}</td>
                  <td className="px-3 py-2">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          The{' '}<a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">jwtdecode.app decoder</a>{' '}
          verifies every HS, RS, PS and ES variant <a href="/decode-jwt-without-a-server" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">in the browser</a>. EdDSA and ES256K tokens decode normally but
          cannot be verified there. For how the ECDSA and RSA-PSS rows differ in practice, see{' '}
          <a href="/es256-explained" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">ES256 explained</a> and{' '}
          <a href="/ps256-vs-rs256" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">PS256 vs RS256</a>; for why{' '}
          <ArticleCode>none</ArticleCode> must be refused, see{' '}
          <a href="/none-algorithm-vulnerability" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">the none algorithm vulnerability</a>.
        </ArticleP>

        <ArticleH2 id="hs256-vs-hs512">HS256 vs HS384 vs HS512</ArticleH2>
        <ArticleP>
          The three HMAC variants differ only in the SHA-2 function underneath. HS256 produces a 32-byte tag,
          HS384 a 48-byte tag and HS512 a 64-byte tag, so tokens get longer as you move up. RFC 7518 §3.2
          requires the key to be at least as long as the hash output: 256 bits for HS256, 384 for HS384 and 512
          for HS512.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Security</strong>: with a properly random key of the required length, HS256 already gives a margin far beyond any practical attack. Moving to HS512 does not fix the real-world HMAC failure, which is a short, guessable secret.</ArticleLi>
          <ArticleLi><strong>Performance</strong>: SHA-512 processes 64-bit words and is often as fast as or faster than SHA-256 on 64-bit servers without SHA extensions. For JWT-sized inputs the difference is negligible either way.</ArticleLi>
          <ArticleLi><strong>When HS512 makes sense</strong>: a compliance policy that mandates it, or consistency with other systems that already use it.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Whichever you choose, generate the secret with a cryptographic random generator; see the{' '}
          <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT secret key generator</a>.
        </ArticleP>

        <ArticleH2 id="best-algorithm">Which JWT Algorithm Is Best?</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>One service issues and verifies its own tokens</strong>: HS256 with a 256-bit random secret is simple and fast.</ArticleLi>
          <ArticleLi><strong>Tokens are verified by other services or third parties</strong>: an asymmetric algorithm, so verifiers only ever hold a public key. ES256 for new systems; RS256 where you need the widest library and identity-provider support; PS256 if you already run RSA keys and your stack supports it.</ArticleLi>
          <ArticleLi><strong>Whatever you pick</strong>: pin the expected algorithm in the verifier's allow-list rather than trusting the token's header, as RFC 8725 §3.1 requires.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="migration">Migrating from HS256 to RS256</ArticleH2>
        <ArticleP>
          If you're upgrading an existing HS256 system to RS256:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Generate an RSA or EC key pair in your auth service</ArticleLi>
          <ArticleLi>Publish the public key via a JWKS endpoint at a predictable URL</ArticleLi>
          <ArticleLi>Update all verifying services to fetch and cache the JWKS</ArticleLi>
          <ArticleLi>Deploy a transition period where both algorithms are accepted</ArticleLi>
          <ArticleLi>Once all existing HS256 tokens have expired, remove the old verification path</ArticleLi>
          <ArticleLi>Revoke and destroy the HS256 shared secret</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
