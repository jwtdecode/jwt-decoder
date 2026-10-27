import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT kid Header: What the Key ID Means, Its Format and How to Use It Safely',
  description: 'What the JWT kid (key ID) header parameter means under RFC 7515, what kid values look like, how verifiers use it to select a key from a JWKS, how it enables key rotation, and how to prevent kid injection.',
  url: 'https://jwtdecode.app/jwt-kid-header',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-kid-header',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const KID_FORMATS: [style: string, example: string, seenAt: string][] = [
  ['JWK thumbprint (RFC 7638)', 'NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs', 'Many OIDC libraries and self-hosted issuers'],
  ['Hex certificate or key hash', '943a3a5d7d919625a454e489b75c29adab57acba', 'Google'],
  ['Base64url certificate thumbprint', 'sa3RgZQ_nZNVheAokCVqxY_8Cr4', 'Microsoft Entra ID (same value as x5t)'],
  ['Opaque provider-generated string', '(varies by provider)', 'Many hosted identity providers'],
  ['Human-readable label', 'signing-2026-09', 'In-house issuers'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtKidHeaderPage() {
  return (
    <>
      <SEOHead
        title="JWT kid Header: Key ID Meaning and Examples"
        description="The JWT kid header is a key ID that tells the verifier which key signed the token. Meaning, RFC 7515 rules, value formats, JWKS lookup, rotation and safety."
        path="/jwt-kid-header"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT kid Header' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/what-is-jwks', label: 'What Is JWKS', description: 'The key set the kid points into, and how to verify against it.' },
          { to: '/jwt-header-payload-signature-explained', label: 'Header, Payload & Signature', description: 'Where kid sits among the other header parameters.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Algorithm allow-lists, key handling and rotation.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors & Fixes', description: 'Error strings for missing keys and failed signatures.' },
        ]}
      >
        <ArticleH1>JWT kid Header: What the Key ID Means, Its Format and How to Use It Safely</ArticleH1>

        <ArticleIntroBox>
          <ArticleCode>kid</ArticleCode> is the <strong>key ID</strong>: a string in the JWT header that tells the
          verifier which key was used to sign the token. It is a JOSE header parameter defined in RFC 7515 §4.1.4, not a
          claim, so it sits next to <ArticleCode>alg</ArticleCode> and <ArticleCode>typ</ArticleCode> rather than in the
          payload. Its format is deliberately unspecified: it is a case-sensitive string that only has to match the
          <ArticleCode>kid</ArticleCode> of one key in the issuer's JWKS. It exists so that an issuer can publish several
          keys at once and rotate them without breaking verification. Because the verifier reads it before the signature
          has been checked, it is attacker-controlled input and must be treated as such.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-kid-meaning">JWT kid Meaning</ArticleH2>
        <ArticleP>
          RFC 7515 §4.1.4 describes <ArticleCode>kid</ArticleCode> as a hint indicating which key was used to secure the
          JWS. Three points in that definition matter in practice:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>It is a hint.</strong> The verifier still has to confirm the key is one it trusts. A <ArticleCode>kid</ArticleCode> never introduces a new key; it only selects among keys you already hold.</ArticleLi>
          <ArticleLi><strong>The structure is unspecified.</strong> Any string works, as long as issuer and verifier agree.</ArticleLi>
          <ArticleLi><strong>It is optional.</strong> An issuer with exactly one key may leave it out. Once there are two keys, it becomes necessary in practice.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The matching field on the key side is the JWK <ArticleCode>kid</ArticleCode> parameter from RFC 7517 §4.5. When
          both exist, verification is a simple lookup: the header's <ArticleCode>kid</ArticleCode> equals the JWK's
          <ArticleCode>kid</ArticleCode>. See <a href="/what-is-jwks" className={link}>what is JWKS</a> for the key side of that
          lookup.
        </ArticleP>

        <ArticleH2 id="jwt-header-kid-vs-claim">Is kid a Header or a Claim?</ArticleH2>
        <ArticleP>
          People often search for the "kid claim", but <ArticleCode>kid</ArticleCode> is a header parameter. Claims such as
          <ArticleCode>sub</ArticleCode>, <ArticleCode>aud</ArticleCode> and <ArticleCode>exp</ArticleCode> live in the payload and are
          defined by RFC 7519; <ArticleCode>kid</ArticleCode> lives in the protected header and is defined by RFC 7515 (JWS)
          and RFC 7516 (JWE). The distinction matters in code: libraries return it from the header, not from the decoded
          payload.
        </ArticleP>
        <ArticlePre>{`// Decoded header of a typical RS256 token
{
  "alg": "RS256",
  "kid": "943a3a5d7d919625a454e489b75c29adab57acba",
  "typ": "JWT"
}`}</ArticlePre>
        <ArticleP>
          Because the header is signed along with the payload, a verifier that checks the signature also confirms that
          <ArticleCode>kid</ArticleCode> was not altered. But the lookup happens before that check, which is why the value
          has to be handled carefully. For the layout of the three segments, see
          <a href="/jwt-header-payload-signature-explained" className={link}> header, payload and signature explained</a>.
        </ArticleP>

        <ArticleH2 id="jwt-kid-decode">How to Decode and Read the kid</ArticleH2>
        <ArticleP>
          The header is the first base64url segment of the token. Paste the token into the <a href="/" className={link}>jwtdecode.app decoder</a> and
          the <ArticleCode>kid</ArticleCode> appears in the header panel, decoded locally in your browser. In code:
        </ArticleP>
        <ArticlePre>{`// Node.js (jose)
import { decodeProtectedHeader } from 'jose';
const { kid, alg } = decodeProtectedHeader(token);

// Node.js (jsonwebtoken)
import jwt from 'jsonwebtoken';
const { header } = jwt.decode(token, { complete: true });

# Python (PyJWT)
import jwt
header = jwt.get_unverified_header(token)
print(header.get("kid"))

# Shell
cut -d. -f1 <<< "$TOKEN" | tr '_-' '/+' | base64 -d 2>/dev/null; echo`}</ArticlePre>
        <ArticleP>
          All of these read the header without verifying anything. That is fine for key selection and debugging, and
          never enough to trust the token. The shell version may need <ArticleCode>=</ArticleCode> padding added for some
          lengths; <a href="/how-to-decode-jwt-in-javascript-python-go" className={link}>decoding in JavaScript, Python and Go</a> handles
          that properly.
        </ArticleP>

        <ArticleH2 id="jwt-kid-format">JWT kid Format and Example Values</ArticleH2>
        <ArticleP>
          Since the RFC leaves the format open, providers have settled on a handful of styles. None is more correct than
          another; what matters is that the value is stable for a key and unique within the set.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Style</th>
                <th className="px-3 py-2 font-semibold">Example value</th>
                <th className="px-3 py-2 font-semibold">Where you see it</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {KID_FORMATS.map(([style, example, seenAt]) => (
                <tr key={style} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{style}</td>
                  <td className="px-3 py-2 font-mono break-all">{example}</td>
                  <td className="px-3 py-2">{seenAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          If you are designing your own, the JWK thumbprint from RFC 7638 is a good default: it is derived from the
          public key itself, so it cannot drift out of sync with the key, and libraries compute it for you
          (<ArticleCode>calculateJwkThumbprint</ArticleCode> in jose). Avoid putting file paths, database keys or
          anything meaningful to your infrastructure into the value.
        </ArticleP>

        <ArticleH2 id="jwt-kid-jwks-selection">How Verifiers Use kid to Pick a Key</ArticleH2>
        <ArticleP>
          With a JWKS, the lookup is done for you. jose's <ArticleCode>createRemoteJWKSet</ArticleCode> and PyJWT's
          <ArticleCode>PyJWKClient</ArticleCode> both match on <ArticleCode>kid</ArticleCode> and re-fetch the set when they
          see an unknown one. With keys you hold locally, do the lookup yourself against a fixed map:
        </ArticleP>
        <ArticlePre>{`import jwt from 'jsonwebtoken';

// Keys you trust, loaded from config or a secret store at startup.
const KEYS = {
  'signing-2026-09': process.env.JWT_KEY_2026_09,
  'signing-2026-06': process.env.JWT_KEY_2026_06,
};

function getKey(header, callback) {
  // Exact lookup in a fixed map. Unknown kid = reject.
  const key = Object.hasOwn(KEYS, header.kid) ? KEYS[header.kid] : undefined;
  if (!key) return callback(new Error('unknown kid'));
  callback(null, key);
}

jwt.verify(token, getKey, { algorithms: ['HS256'] }, (err, payload) => {
  // err.message: "error in secret or public key callback: unknown kid"
});

// Signing side: set the kid with the keyid option
jwt.sign(claims, KEYS['signing-2026-09'], { algorithm: 'HS256', keyid: 'signing-2026-09', expiresIn: '15m' });`}</ArticlePre>
        <ArticleP>
          Two details in that snippet are deliberate. <ArticleCode>Object.hasOwn</ArticleCode> stops a
          <ArticleCode>kid</ArticleCode> of <ArticleCode>__proto__</ArticleCode> or <ArticleCode>constructor</ArticleCode> from
          resolving to something on the object prototype. And the algorithm list is fixed by the verifier: the
          <ArticleCode>kid</ArticleCode> picks a key, it never picks the algorithm. Tie each key to one algorithm; the
          <a href="/jwt-security-best-practices" className={link}> security best practices guide</a> explains why.
        </ArticleP>
        <ArticleCallout type="info">
          In PyJWT, set a kid when signing with <ArticleCode>jwt.encode(claims, key, algorithm="RS256", headers={'{'}"kid": "signing-2026-09"{'}'})</ArticleCode>.
          In jose, pass it to <ArticleCode>setProtectedHeader({'{'} alg: 'ES256', kid {'}'})</ArticleCode>.
        </ArticleCallout>

        <ArticleH2 id="jwt-kid-rotation">kid and Key Rotation</ArticleH2>
        <ArticleP>
          Rotation is the reason <ArticleCode>kid</ArticleCode> exists. Without it, a verifier holding two keys has to try
          both, and one holding only the new key rejects every token signed before the switch. With it, the rotation runs
          as an overlap:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Publish</strong> the new public key in the JWKS under a new <ArticleCode>kid</ArticleCode>, alongside the current key.</ArticleLi>
          <ArticleLi><strong>Wait</strong> at least as long as verifiers cache the JWKS, so everyone has the new key before it is used.</ArticleLi>
          <ArticleLi><strong>Switch</strong> signing to the new key. New tokens carry the new <ArticleCode>kid</ArticleCode>; old tokens still verify with the old one.</ArticleLi>
          <ArticleLi><strong>Retire</strong> the old key once the longest-lived token signed with it has expired.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Never reuse a <ArticleCode>kid</ArticleCode> for a different key. Verifiers cache keys by <ArticleCode>kid</ArticleCode>,
          so a reused value can leave some servers verifying with the old key material until their cache expires, which
          shows up as intermittent <a href="/common-jwt-errors-and-fixes#invalid-signature" className={link}>invalid signature errors</a> on some
          instances only.
        </ArticleP>

        <ArticleH2 id="jwt-kid-injection">Security: kid Injection and How to Prevent It</ArticleH2>
        <ArticleP>
          The verifier reads <ArticleCode>kid</ArticleCode> from an unverified token and uses it to find a key. If that
          lookup is anything other than an exact match against a fixed set, the value can steer it. RFC 8725 §3.10 calls
          this out directly: applications should make sure the <ArticleCode>kid</ArticleCode> lookup does not create SQL or
          LDAP injection vulnerabilities. The documented patterns, which PortSwigger's Web Security Academy covers in its
          JWT labs, are:
        </ArticleP>
        <ArticleH3 id="kid-path-traversal">Path traversal</ArticleH3>
        <ArticleP>
          Code that loads a key from disk using the <ArticleCode>kid</ArticleCode> as a filename, such as
          <ArticleCode>readFile(`keys/${'{'}kid{'}'}`)</ArticleCode>, can be pointed at a different file. If that file is
          empty or predictable and the algorithm is HMAC, whoever controls the <ArticleCode>kid</ArticleCode> knows the
          "secret" and can sign any token.
        </ArticleP>
        <ArticleH3 id="kid-sql-injection">SQL injection</ArticleH3>
        <ArticleP>
          Code that builds a query from the <ArticleCode>kid</ArticleCode> by string concatenation can be made to return a
          key value the caller chose, with the same outcome.
        </ArticleP>
        <ArticleH3 id="kid-defences">Defences</ArticleH3>
        <ArticleUl>
          <ArticleLi>Look the <ArticleCode>kid</ArticleCode> up in an in-memory map or a JWKS you fetched from a configured URL. Reject anything not found.</ArticleLi>
          <ArticleLi>If keys must come from a database or filesystem, use parameterised queries, validate the value against a strict pattern (for example <ArticleCode>^[A-Za-z0-9_-]{'{'}1,64{'}'}$</ArticleCode>) first, and never build paths from it.</ArticleLi>
          <ArticleLi>Pin the algorithm per key. A <ArticleCode>kid</ArticleCode> that resolves to an RSA public key must never be usable as an HMAC secret.</ArticleLi>
          <ArticleLi>Ignore <ArticleCode>jku</ArticleCode>, <ArticleCode>x5u</ArticleCode> and embedded <ArticleCode>jwk</ArticleCode> headers unless you have a specific, allow-listed need; they let the token nominate its own key.</ArticleLi>
          <ArticleLi>Treat a missing or unknown <ArticleCode>kid</ArticleCode> as a failure, not as "use the default key".</ArticleLi>
        </ArticleUl>
        <ArticleP>
          To test your own service, sign a token with a <ArticleCode>kid</ArticleCode> that does not exist, one containing
          <ArticleCode>../</ArticleCode>, and one containing a quote character, and confirm each is rejected with the same
          generic error. The <a href="/jwt-attacks-and-vulnerabilities" className={link}>JWT attacks and vulnerabilities guide</a> covers
          the related header-based attacks.
        </ArticleP>

        <ArticleH2 id="jwt-kid-value-problems">Common kid Value Problems</ArticleH2>
        <ArticleP>
          Most <ArticleCode>kid</ArticleCode>-related failures are not attacks but mismatches between the token and the key
          set the verifier loaded:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>The kid is not in the JWKS at all.</strong> The token was issued by a different tenant, realm or environment. Compare the token's <ArticleCode>iss</ArticleCode> with the issuer whose JWKS you fetch; a staging token sent to production is the usual culprit.</ArticleLi>
          <ArticleLi><strong>The kid appeared minutes ago.</strong> The issuer rotated and your cache predates it. A verifier that re-fetches on an unknown <ArticleCode>kid</ArticleCode> recovers on its own; one that only refreshes on a timer fails until the timer fires.</ArticleLi>
          <ArticleLi><strong>The kid matches but the signature fails.</strong> The key is right but the algorithm is not, or the verifier is using a stale copy of a key whose <ArticleCode>kid</ArticleCode> was reused.</ArticleLi>
          <ArticleLi><strong>Case or encoding differs.</strong> <ArticleCode>kid</ArticleCode> comparison is exact and case-sensitive. Trimming, lower-casing or URL-decoding either side breaks matches.</ArticleLi>
          <ArticleLi><strong>The token has no kid.</strong> Fine for a single-key issuer, but a verifier holding several keys has to reject it or try each compatible key. Prefer issuers that always set it.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          When you are debugging, decode the header, note the <ArticleCode>kid</ArticleCode> and <ArticleCode>alg</ArticleCode>, and
          search the issuer's JWKS for that exact string. That single check separates "wrong issuer or stale cache" from
          "wrong algorithm or key material" in a few seconds.
        </ArticleP>

        <ArticleH2 id="jwt-kid-rfc">JWT kid RFC References</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>RFC 7515 §4.1.4</strong>: the <ArticleCode>kid</ArticleCode> header parameter for JWS.</ArticleLi>
          <ArticleLi><strong>RFC 7516 §4.1.6</strong>: the same parameter for JWE, where it identifies the key the content key was encrypted to.</ArticleLi>
          <ArticleLi><strong>RFC 7517 §4.5</strong>: the <ArticleCode>kid</ArticleCode> member of a JWK, used for matching.</ArticleLi>
          <ArticleLi><strong>RFC 7638</strong>: JWK thumbprints, a common way to derive <ArticleCode>kid</ArticleCode> values.</ArticleLi>
          <ArticleLi><strong>RFC 8725 §3.10</strong>: do not trust received claims, including the injection warning for <ArticleCode>kid</ArticleCode>.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          <ArticleCode>kid</ArticleCode> is a JWT header parameter (RFC 7515 §4.1.4), not a claim. Its value is an opaque,
          case-sensitive string that matches the <ArticleCode>kid</ArticleCode> of one key in the issuer's JWKS, and its job
          is to make multiple keys and smooth rotation possible. Read it with <ArticleCode>decodeProtectedHeader</ArticleCode>,
          <ArticleCode>jwt.decode(token, {'{'} complete: true {'}'})</ArticleCode> or <ArticleCode>jwt.get_unverified_header</ArticleCode>,
          look it up with an exact match against keys you already trust, pin the algorithm per key, and never let it
          reach a file path or an unparameterised query.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
