import { useState } from 'react';
import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Secret Key Generator: Create a Strong HS256 Secret',
  description: 'Generate a random JWT secret key in the browser, learn the minimum size for HS256, HS384 and HS512 under RFC 7518, and create secrets with openssl, Node.js and Python.',
  url: 'https://jwtdecode.app/jwt-secret-key-generator',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-secret-key-generator',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function SecretGenerator() {
  const [bits, setBits] = useState<number | null>(null);
  const [values, setValues] = useState<{ base64url: string; hex: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function generate(size: number) {
    const bytes = new Uint8Array(size / 8);
    crypto.getRandomValues(bytes);
    setBits(size);
    setValues({ base64url: toBase64Url(bytes), hex: toHex(bytes) });
    setCopied(null);
  }

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="mb-6 p-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]">
      <div className="flex flex-wrap gap-2 mb-4">
        {[256, 384, 512].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => generate(size)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white"
          >
            Generate {size}-bit (HS{size})
          </button>
        ))}
      </div>
      {values && bits ? (
        <div className="space-y-3">
          {([['Base64url', values.base64url], ['Hex', values.hex]] as const).map(([label, value]) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label} ({bits} bits, {value.length} characters)</span>
                <button
                  type="button"
                  onClick={() => copy(label, value)}
                  className="text-xs px-2 py-1 rounded-md border border-[var(--border-default)] text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {copied === label ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="block font-mono text-xs break-all p-3 rounded-lg border border-[var(--border-subtle)] text-slate-700 dark:text-slate-300">{value}</code>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">Choose a size to generate a secret.</p>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
        Secrets are generated in your browser with <code>crypto.getRandomValues</code> and never transmitted or stored.
      </p>
    </div>
  );
}

const SIZES: [alg: string, bytes: string, b64: string, hex: string][] = [
  ['HS256', '32 bytes (256 bits)', '43 characters', '64 characters'],
  ['HS384', '48 bytes (384 bits)', '64 characters', '96 characters'],
  ['HS512', '64 bytes (512 bits)', '86 characters', '128 characters'],
];

export default function JwtSecretKeyGeneratorPage() {
  return (
    <>
      <SEOHead
        title="JWT Secret Key Generator (HS256, HS512)"
        description="Free JWT secret key generator that runs in your browser, plus the RFC 7518 minimum size for HS256 and the openssl, Node.js and Python commands to make one."
        path="/jwt-secret-key-generator"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Secret Key Generator' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/generate-jwt-signing-keys-openssl', label: 'Generate JWT Signing Keys', description: 'RSA, EC and Ed25519 key pairs for RS256, ES256 and EdDSA with openssl.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'When a shared secret is the right choice and when a key pair is.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Access and refresh tokens, rotation and reuse detection.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Algorithm pinning, key management and claim validation.' },
        ]}
      >
        <ArticleH1>JWT Secret Key Generator: Create a Strong HS256, HS384 or HS512 Secret</ArticleH1>

        <ArticleIntroBox>
          A JWT secret for HS256 should be at least 32 random bytes (256 bits), produced by a cryptographically
          secure random number generator, never a word or passphrase a person chose. The generator below creates
          one in your browser. From a terminal, <ArticleCode>openssl rand -base64 32</ArticleCode> does the same job.
          <br /><br />
          The rest of this page explains where that 256-bit figure comes from (RFC 7518 §3.2), how to generate
          secrets with openssl, Node.js, Python and PowerShell, the Base64-versus-raw-bytes mistake that breaks
          signature verification, and why access tokens and refresh tokens should never share a secret.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-secret-generator">JWT Secret Generator</ArticleH2>
        <ArticleP>
          Pick the size that matches your algorithm: 256 bits for HS256, 384 for HS384, 512 for HS512. Larger
          is allowed; smaller is not. The output is the same random bytes shown in two encodings, so choose the
          one your configuration expects and read the section on encodings below before pasting it anywhere.
        </ArticleP>
        <SecretGenerator />

        <ArticleH2 id="jwt-secret-key-generator-online">Is an Online JWT Secret Key Generator Safe?</ArticleH2>
        <ArticleP>
          It depends entirely on where the randomness comes from and whether the value leaves your machine. A
          generator that calls <ArticleCode>crypto.getRandomValues</ArticleCode> in the page, as this one does, draws
          from the same operating-system CSPRNG that <ArticleCode>openssl rand</ArticleCode> uses, and the result
          exists only in your browser tab. A generator that fetches the secret from a server, or sends it anywhere
          for "analytics", gives a third party a copy of your signing key. You can check by opening the browser's
          network panel before clicking Generate: no request should appear. For production keys, generating on the
          server or inside your secrets manager is still the cleanest option, because the secret never passes
          through a clipboard.
        </ArticleP>

        <ArticleH2 id="what-is-a-jwt-secret-key">What Is a JWT Secret Key?</ArticleH2>
        <ArticleP>
          HS256, HS384 and HS512 are HMAC algorithms defined in RFC 7518 §3.2. The issuer computes an HMAC over
          the encoded header and payload using a secret key, and the verifier recomputes it with the same key.
          If the two values match, the token has not been altered and was produced by someone holding the key.
          Because both sides need the identical secret, HMAC is a <em>symmetric</em> scheme: any service that can
          verify a token can also mint one.
        </ArticleP>
        <ArticleP>
          That makes the secret the entire security of the token. The algorithm itself is sound; what fails in
          practice is the key. A guessable secret lets an attacker take any captured token and brute-force the
          key offline, with no rate limit and no log entry on your side. Once they have it, they can sign tokens
          with any <ArticleCode>sub</ArticleCode>, role or expiry they like. The{' '}
          <a href="/jwt-header-payload-signature-explained" className={link}>header, payload and signature guide</a>{' '}
          shows exactly which bytes the HMAC covers.
        </ArticleP>

        <ArticleH2 id="jwt-secret-size">JWT Secret Size: How Long Should an HS256 Secret Be?</ArticleH2>
        <ArticleP>
          RFC 7518 §3.2 is explicit: "A key of the same size as the hash output (for instance, 256 bits for
          'HS256') or larger MUST be used with this algorithm." The minimum therefore tracks the hash, not
          the token or the payload:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Algorithm</th>
                <th className="px-3 py-2 font-semibold">Minimum key</th>
                <th className="px-3 py-2 font-semibold">As base64url</th>
                <th className="px-3 py-2 font-semibold">As hex</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {SIZES.map(([alg, bytes, b64, hex]) => (
                <tr key={alg} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{alg}</td>
                  <td className="px-3 py-2">{bytes}</td>
                  <td className="px-3 py-2">{b64}</td>
                  <td className="px-3 py-2">{hex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          The requirement is about entropy, not string length. A 32-character password typed by a person has far
          less than 256 bits of entropy, so "32 characters" is not the same as "32 bytes". The RFC 8725 best
          current practice makes the same point: human-memorable passwords must not be used directly as HMAC keys.
        </ArticleP>
        <ArticleP>
          Libraries differ in how strictly they enforce this. Recent PyJWT releases emit an{' '}
          <ArticleCode>InsecureKeyLengthWarning</ArticleCode> for a key shorter than the hash output, and the
          Java JJWT library refuses short HMAC keys with a <ArticleCode>WeakKeyException</ArticleCode>. In Node.js,
          both <ArticleCode>jose</ArticleCode> (6.x) and <ArticleCode>jsonwebtoken</ArticleCode> (9.x) will happily
          sign with a five-byte secret. Do not rely on the library to stop you.
        </ArticleP>

        <ArticleH2 id="how-to-generate-jwt-secret-key">How to Generate a JWT Secret Key From the Command Line</ArticleH2>
        <ArticleP>
          Every command below reads from the operating system's CSPRNG and produces 32 random bytes, which is
          enough for HS256. Change <ArticleCode>32</ArticleCode> to 48 or 64 for HS384 or HS512.
        </ArticleP>

        <ArticleH3 id="openssl-generate-jwt-secret">OpenSSL</ArticleH3>
        <ArticlePre lang="bash">{`# 32 random bytes, Base64 encoded (44 characters, ends with "=")
openssl rand -base64 32

# 32 random bytes, hex encoded (64 characters)
openssl rand -hex 32`}</ArticlePre>

        <ArticleH3 id="node-generate-jwt-secret">Node.js</ArticleH3>
        <ArticlePre lang="bash">{`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`}</ArticlePre>

        <ArticleH3 id="python-generate-jwt-secret">Python</ArticleH3>
        <ArticlePre lang="bash">{`python3 -c "import secrets; print(secrets.token_urlsafe(32))"`}</ArticlePre>

        <ArticleH3 id="other-generate-jwt-secret">PowerShell 7 and plain Unix tools</ArticleH3>
        <ArticlePre lang="bash">{`# PowerShell 7 (.NET 6+)
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Any Unix-like system
head -c 32 /dev/urandom | base64`}</ArticlePre>
        <ArticleP>
          <ArticleCode>randomBytes(32).toString('base64url')</ArticleCode> and{' '}
          <ArticleCode>secrets.token_urlsafe(32)</ArticleCode> both print 43 URL-safe characters with no padding,
          which is convenient in <ArticleCode>.env</ArticleCode> files and YAML because there is no{' '}
          <ArticleCode>+</ArticleCode>, <ArticleCode>/</ArticleCode> or <ArticleCode>=</ArticleCode> to quote.
          Avoid <ArticleCode>Math.random()</ArticleCode>, <ArticleCode>uuidgen</ArticleCode> and Python's{' '}
          <ArticleCode>random</ArticleCode> module: they are either not cryptographically secure or, in the case of
          a version 4 UUID, carry only 122 random bits.
        </ArticleP>

        <ArticleH2 id="base64-vs-raw-bytes">The Base64 vs Raw Bytes Pitfall</ArticleH2>
        <ArticleP>
          The output of <ArticleCode>openssl rand -base64 32</ArticleCode> is a 44-character string that{' '}
          <em>represents</em> 32 bytes. A library can use that secret in two different ways:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>As text</strong>: the 44 ASCII characters themselves become the HMAC key (44 bytes).</ArticleLi>
          <ArticleLi><strong>As decoded bytes</strong>: the string is Base64-decoded first and the 32 underlying bytes become the key.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Both are fine on their own. The failure happens when the issuer does one and the verifier does the
          other: the keys differ, and every token fails with "invalid signature". Here is the effect in Node.js
          with <ArticleCode>jose</ArticleCode>:
        </ArticleP>
        <ArticlePre lang="javascript">{`import { SignJWT, jwtVerify } from 'jose';

const secret = 'fp6K+eRso7YXF5YjbJ/c5QxSFM+LL7btginHiPgZzoU=';
const asText = new TextEncoder().encode(secret);   // 44 bytes
const asBytes = Buffer.from(secret, 'base64');      // 32 bytes

const token = await new SignJWT({ sub: '1' })
  .setProtectedHeader({ alg: 'HS256' })
  .sign(asBytes);

await jwtVerify(token, asBytes); // ok
await jwtVerify(token, asText);  // throws ERR_JWS_SIGNATURE_VERIFICATION_FAILED`}</ArticlePre>
        <ArticleP>
          Tools make the choice visible in different ways. Postman's JWT Bearer auth type has a "Secret Base64
          encoded" checkbox, and the Rust <ArticleCode>jwt-cli</ArticleCode> accepts a <ArticleCode>b64:</ArticleCode>{' '}
          prefix on <ArticleCode>--secret</ArticleCode>. The Verify tab on{' '}
          <a href="/" className={link}>the jwtdecode.app decoder</a> treats the HMAC secret as UTF-8 text and runs
          entirely in the browser, so if it rejects a token that your server accepts, the server is probably
          decoding the secret first. Pick one convention, write it next to the variable in your configuration, and
          apply it on every service. The{' '}
          <a href="/common-jwt-errors-and-fixes#invalid-signature" className={link}>invalid signature section</a>{' '}
          lists the other causes worth ruling out.
        </ArticleP>

        <ArticleH2 id="best-jwt-secret-key">What Makes the Best JWT Secret Key?</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Random, from a CSPRNG</strong>: generated by one of the commands above or the tool on this page, never typed.</ArticleLi>
          <ArticleLi><strong>At least as long as the hash</strong>: 32 bytes for HS256, 48 for HS384, 64 for HS512. Going longer costs nothing measurable.</ArticleLi>
          <ArticleLi><strong>Unique per purpose and environment</strong>: development, staging and production each get their own; so do access and refresh tokens.</ArticleLi>
          <ArticleLi><strong>Never committed</strong>: not in source control, container images, front-end bundles or example configuration files. A secret shipped to a browser is public.</ArticleLi>
          <ArticleLi><strong>Paired with a pinned algorithm</strong>: the verifier should accept only the HMAC algorithm you chose, never whatever the token header says. The <a href="/none-algorithm-vulnerability" className={link}>none algorithm guide</a> explains why.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="store-and-rotate-jwt-secret">How to Store and Rotate a JWT Secret</ArticleH2>
        <ArticleP>
          Load the secret at start-up from a secrets manager (AWS Secrets Manager, Google Secret Manager, Azure
          Key Vault, HashiCorp Vault, Kubernetes Secrets with encryption at rest) or, at minimum, an environment
          variable injected by the deployment system. Keep it out of logs and error reports; a stack trace that
          dumps configuration is a common leak.
        </ArticleP>
        <ArticleP>
          Rotation is easiest when every token carries a <ArticleCode>kid</ArticleCode> header naming the key that
          signed it. The sequence is:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Add the new secret to every verifier, keyed by its new <ArticleCode>kid</ArticleCode>, alongside the old one.</ArticleLi>
          <ArticleLi>Switch the issuer to sign with the new secret.</ArticleLi>
          <ArticleLi>Wait for the longest-lived token signed with the old secret to expire, then remove the old secret.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          If the secret has leaked, skip the waiting period: remove it immediately and accept that every user
          signed in with an old token must authenticate again. The{' '}
          <a href="/jwt-kid-header" className={link}>kid header guide</a> covers key lookup in more detail.
        </ArticleP>

        <ArticleH2 id="jwt-refresh-secret">JWT Refresh Secret: Use a Separate Key</ArticleH2>
        <ArticleP>
          If your system issues its own refresh tokens as JWTs, generate a second secret for them and give it its
          own name, for example <ArticleCode>JWT_ACCESS_SECRET</ArticleCode> and{' '}
          <ArticleCode>JWT_REFRESH_SECRET</ArticleCode>. Sharing one secret means a refresh token is a validly
          signed token as far as your API is concerned; if the API only checks the signature and expiry, a
          long-lived refresh token can be replayed as an access token. Separate keys, plus a{' '}
          <ArticleCode>typ</ArticleCode> or <ArticleCode>token_use</ArticleCode> claim checked on both sides, close
          that gap. A separate secret also means the refresh endpoint's key can live only in the authentication
          service, while the access-token key is distributed to APIs.
        </ArticleP>
        <ArticleP>
          Many teams skip JWTs for refresh tokens entirely and use an opaque random value stored server-side,
          which makes revocation a simple database delete. The{' '}
          <a href="/jwt-refresh-token-pattern" className={link}>refresh token pattern guide</a> compares both.
        </ArticleP>

        <ArticleH2 id="when-to-use-a-key-pair">When a Shared Secret Is the Wrong Tool</ArticleH2>
        <ArticleP>
          HMAC works well when the same service, or a small set of services you control, both issues and verifies
          tokens. Once tokens are verified by many services, by third parties, or by anything you do not fully
          trust, every verifier holding the secret is also able to forge tokens. That is the point to move to an
          asymmetric algorithm such as RS256 or ES256, where verifiers hold only a public key. See{' '}
          <a href="/hs256-vs-rs256" className={link}>HS256 vs RS256</a> for the trade-offs and{' '}
          <a href="/generate-jwt-signing-keys-openssl" className={link}>generating JWT signing keys with OpenSSL</a>{' '}
          for the commands.
        </ArticleP>

        <ArticleCallout type="warning">
          Do not paste a production secret into any website, including this one's generator or verifier, unless you
          understand where it goes. The generator above never sends anything anywhere, but the safest production
          secret is one generated on the machine or secrets manager that will use it.
        </ArticleCallout>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>RFC 7518 requires an HMAC key at least as large as the hash output: 256 bits for HS256, 384 for HS384, 512 for HS512.</ArticleLi>
          <ArticleLi>Generate secrets with a CSPRNG: <ArticleCode>openssl rand -base64 32</ArticleCode>, <ArticleCode>crypto.randomBytes(32)</ArticleCode> or <ArticleCode>secrets.token_urlsafe(32)</ArticleCode>.</ArticleLi>
          <ArticleLi>Decide whether the secret is used as text or as decoded bytes, and make every service agree.</ArticleLi>
          <ArticleLi>Store secrets in a secrets manager, rotate them with <ArticleCode>kid</ArticleCode>, and keep access and refresh secrets separate.</ArticleLi>
          <ArticleLi>When many services verify tokens, switch to an asymmetric key pair instead of sharing the secret.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
