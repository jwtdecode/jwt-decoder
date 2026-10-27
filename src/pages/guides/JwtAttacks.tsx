import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Attacks and Vulnerabilities: How Each Works, How to Test, and the Fix',
  description: 'A defensive reference to JWT attacks: alg none, algorithm confusion, weak secrets, kid and jku header injection, missing claim checks, psychic signatures and token leakage, with a test and a fix for each.',
  url: 'https://jwtdecode.app/jwt-attacks-and-vulnerabilities',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-attacks-and-vulnerabilities',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const CHEAT_SHEET: [attack: string, howToTest: string, fix: string][] = [
  ['alg: none', 'Confirm the verifier rejects a token whose header claims none', 'Allow-list algorithms; never let the token pick the check'],
  ['Algorithm confusion', 'Confirm an RS256 service rejects an HS256 token', 'Pin one algorithm per key; pass typed key objects'],
  ['Weak HMAC secret', 'Estimate secret entropy; audit how it was generated', '256-bit secret from a CSPRNG, or move to asymmetric keys'],
  ['kid injection', 'Confirm an unusual kid value cannot change the lookup', 'Treat kid as a key into a fixed map, nothing more'],
  ['jku / x5u injection', 'Confirm a token-supplied key URL is ignored', 'Configure the JWKS URL server-side; ignore header URLs'],
  ['Embedded jwk', 'Confirm a key in the header is never trusted', 'Verify only against server-held keys'],
  ['No signature check', 'Change one payload byte and confirm rejection', 'Call verify, not decode, on every request'],
  ['Missing exp / aud / iss', 'Replay an expired or wrong-audience token', 'Require and check exp, iss and aud explicitly'],
  ['Psychic signatures (CVE-2022-21449)', 'Check the Java runtime version', 'Patch affected Java to the April 2022 update or later'],
  ['Token leakage', 'Search logs and analytics for tokens', 'Keep tokens out of URLs and logs; short lifetimes'],
];

export default function JwtAttacksPage() {
  return (
    <>
      <SEOHead
        title="JWT Attacks and Vulnerabilities: Test and Fix"
        description="JWT attacks explained for defenders: alg none, algorithm confusion, weak secrets, kid and jku injection, psychic signatures, plus how to test and fix each one."
        path="/jwt-attacks-and-vulnerabilities"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Attacks' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/none-algorithm-vulnerability', label: 'The none Algorithm Vulnerability', description: 'The oldest JWT attack in depth, and why it still appears.' },
          { to: '/jwt-security-best-practices', label: 'JWT Security Best Practices', description: 'The positive checklist: algorithms, keys, lifetimes, storage.' },
          { to: '/hs256-vs-rs256', label: 'HS256 vs RS256', description: 'Symmetric vs asymmetric signing, and why mixing them is dangerous.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'What a correct verifier checks, in order.' },
        ]}
      >
        <ArticleH1>JWT Attacks and Vulnerabilities: How Each Works, How to Test, and the Fix</ArticleH1>

        <ArticleIntroBox>
          Almost every practical JWT attack targets the verifier, not the cryptography. The token's header tells
          the server which algorithm and key to use, so a verifier that trusts the header too much can be talked
          into accepting a token nobody legitimate signed. The recurring vulnerability types are:
          <strong> alg none</strong>, <strong>algorithm confusion</strong>, <strong>weak HMAC secrets</strong>,
          header injection through <strong>kid</strong>, <strong>jku</strong>, <strong>x5u</strong> or an embedded
          <strong> jwk</strong>, <strong>signatures that are never checked</strong>, <strong>missing claim
          validation</strong>, library bugs such as <strong>psychic signatures</strong>, and <strong>token
          theft</strong>. For each below you get how it works at a conceptual level, how to test your own system,
          and the fix. This is a defensive reference: the authoritative sources are RFC 8725 (JWT Best Current
          Practices), the OWASP JWT cheat sheet and the PortSwigger Web Security Academy JWT labs, all of which
          document these publicly so defenders can close them.
        </ArticleIntroBox>

        <ArticleCallout type="warning">
          Test only systems you own or are explicitly authorised to test. The aim throughout is to confirm your
          own verifier rejects bad tokens, not to attack anyone else's service.
        </ArticleCallout>

        <ArticleH2 id="jwt-attack-types">JWT Attack Types and Attack Vectors</ArticleH2>
        <ArticleP>
          A JWT reaches your server as three Base64url segments: header, payload and signature (see{' '}
          <a href="/jwt-header-payload-signature-explained" className={LINK}>header, payload and signature
          explained</a>). Every field is attacker-controlled until the signature has been checked with a key and
          algorithm the <em>server</em> chose. The attack vectors fall into four families:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Algorithm handling</strong>: the verifier lets the token choose the algorithm (none, algorithm confusion).</ArticleLi>
          <ArticleLi><strong>Key handling</strong>: the verifier lets the token choose or supply the key (kid, jku, x5u, jwk), or the key is guessable (weak secrets).</ArticleLi>
          <ArticleLi><strong>Validation gaps</strong>: the signature or the claims are never actually checked (decode instead of verify, missing exp, aud, iss).</ArticleLi>
          <ArticleLi><strong>Token handling</strong>: a legitimate token is stolen and replayed (URLs, logs, XSS against browser storage).</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwt-attacks-owasp">JWT Vulnerabilities in OWASP and RFC 8725</ArticleH2>
        <ArticleP>
          OWASP has no separate "JWT Top 10"; JWT flaws sit under Broken Authentication and Cryptographic Failures
          in the OWASP Top 10, and are covered in detail by the{' '}
          <a href="https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html" className={LINK} rel="noopener noreferrer" target="_blank">OWASP JSON Web Token cheat sheet</a>{' '}
          and the Web Security Testing Guide. The IETF's own answer is{' '}
          <a href="https://www.rfc-editor.org/rfc/rfc8725" className={LINK} rel="noopener noreferrer" target="_blank">RFC 8725, JSON Web Token Best Current Practices</a>,
          written precisely because these attacks kept recurring. Its core rules: verify the algorithm against an
          allow-list (§3.1), use keys with enough entropy, validate issuer and audience, and use explicit typing so
          one kind of JWT cannot be substituted for another. The{' '}
          <a href="https://portswigger.net/web-security/jwt" className={LINK} rel="noopener noreferrer" target="_blank">PortSwigger Web Security Academy JWT topic</a>{' '}
          has free hands-on labs for most of these, which is the safest place to watch one work against a
          deliberately vulnerable target.
        </ArticleP>

        <ArticleH2 id="jwt-attack-none">The alg none Attack</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> RFC 7518 defines <ArticleCode>"alg": "none"</ArticleCode> for unsecured
          JWTs, which carry no signature. A verifier that decides how to check a token by reading the header's
          <ArticleCode> alg</ArticleCode>, and that still supports none, will accept an unsigned token as valid,
          so any payload is trusted. Case variants such as <ArticleCode>None</ArticleCode> and
          <ArticleCode> NONE</ArticleCode> have historically bypassed naive string checks.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Confirm your verifier returns 401 for a token whose header declares none and whose
          signature segment is empty. It should never depend on the header to decide whether a signature is
          required.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Pass an explicit algorithm allow-list to your library and never include none. The
          full history and per-library settings are in the{' '}
          <a href="/none-algorithm-vulnerability" className={LINK}>none algorithm vulnerability guide</a>.
        </ArticleP>

        <ArticleH2 id="jwt-algorithm-confusion-attack">Algorithm Confusion (RS256 to HS256)</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> With RS256 the server verifies using an RSA <em>public</em> key, which is
          public by design and often published at a JWKS endpoint. With HS256 the server verifies using a shared
          <em> secret</em>. The vulnerability appears when a verifier picks the algorithm from the token header and
          reuses the <em>same</em> configured key material for both families: it can be induced to treat the RSA
          public key as an HMAC secret. Because that "secret" is public, an attacker who knows it could produce a
          token the server accepts. The root cause is a verifier that both trusts the header's
          <ArticleCode> alg</ArticleCode> and does not bind a key to a single algorithm. HS256 and RS256 are
          compared in <a href="/hs256-vs-rs256" className={LINK}>HS256 vs RS256</a>.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Confirm a service configured for RS256 rejects a token whose header says HS256,
          rather than trying to verify it as HMAC. A service that "supports both" without pinning is the risky
          shape.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Pin exactly one algorithm per key and pass an allow-list containing only the
          asymmetric algorithm you use. Modern libraries help by taking typed key objects (an RSA public key
          object cannot be used as an HMAC secret) rather than raw strings; prefer those APIs.
        </ArticleP>

        <ArticleH2 id="jwt-hs256-attack">Weak HMAC Secrets (HS256)</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> HS256 security rests entirely on the secret. If the secret is a dictionary
          word, a short string, or a well-known example value copied from a tutorial, its signatures can be
          reproduced by anyone who guesses it. Because verification is offline, an attacker with a single captured
          token can test candidate secrets locally, at high speed, with no requests to your server, so rate
          limiting offers no protection. Security researchers use tools such as hashcat (JWT is hash mode 16500)
          and John the Ripper to demonstrate how quickly weak secrets fall; the defensive takeaway is that a weak
          secret is effectively no secret.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Audit how the secret was generated and how long it is. Anything memorable,
          derived from a name, or shorter than the hash output is a finding. Treat any tutorial or default secret
          in production as already compromised.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Use a secret of at least 256 bits from a cryptographically secure RNG (for example
          <ArticleCode> openssl rand -base64 32</ArticleCode>), store it in a secret manager, and rotate it if it
          may have been exposed. For services where the verifier should not also be able to mint tokens, move to
          an asymmetric algorithm so verifiers hold only a public key.
        </ArticleP>

        <ArticleH2 id="jwt-kid-injection">kid Header Injection</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> The <ArticleCode>kid</ArticleCode> (key ID) header names which key signed
          the token. It is only meant to be a lookup key, but some servers feed its value into a file path, a
          database query or a command. An attacker who controls <ArticleCode>kid</ArticleCode> can then try to
          point the verifier at a key they influence: a predictable file on disk, or, via an injection, a value
          they supply, so the token verifies against something they control. Related header abuse
          (<ArticleCode>cty</ArticleCode>, <ArticleCode>x5c</ArticleCode>) shares the pattern of trusting a
          header field. See <a href="/jwt-kid-header" className={LINK}>the kid header guide</a>.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Confirm that unusual <ArticleCode>kid</ArticleCode> values, path fragments, SQL
          metacharacters or an unknown ID, cannot change which key is used or reach a filesystem or database
          unsanitised. The verifier should simply fail closed on an unrecognised <ArticleCode>kid</ArticleCode>.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Treat <ArticleCode>kid</ArticleCode> as an opaque key into a fixed, server-side map
          of known keys. Never interpolate it into a path or query, and reject any value not in the map.
        </ArticleP>

        <ArticleH2 id="jwt-jku-x5u-jwk-injection">jku, x5u and Embedded jwk Injection</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> The JWS spec defines header parameters that can <em>carry</em> or
          <em> reference</em> a key: <ArticleCode>jku</ArticleCode> and <ArticleCode>x5u</ArticleCode> are URLs to a
          key set or certificate, and <ArticleCode>jwk</ArticleCode> embeds a public key directly in the header.
          If a verifier fetches the key from a token-supplied <ArticleCode>jku</ArticleCode> URL, or trusts the
          embedded <ArticleCode>jwk</ArticleCode>, then the attacker chose the key that verifies their token, which
          defeats signing entirely. CVE-2018-0114 is a well-known instance: the Node.js <ArticleCode>node-jose</ArticleCode>
          library would, in affected versions, verify a token using a key embedded in the token itself.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Confirm that setting <ArticleCode>jku</ArticleCode> to a URL you control, or
          embedding a <ArticleCode>jwk</ArticleCode> you generated, does not make the token verify. It must not.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Ignore token-supplied key material and key URLs. Configure the JWKS URL
          server-side and, if you must honour <ArticleCode>jku</ArticleCode>, restrict it to a strict allow-list of
          your own hosts. The safe default is that keys come only from configuration or a trusted, pinned
          <ArticleCode> jwks_uri</ArticleCode>; see <a href="/what-is-jwks" className={LINK}>what is JWKS</a>.
        </ArticleP>

        <ArticleH2 id="jwt-signature-not-verified">Signatures That Are Never Verified (decode vs verify)</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> Decoding a JWT and verifying it are different operations. Decoding just
          Base64url-decodes the segments and gives you the claims; it proves nothing. A surprising amount of code
          reads claims from a decoded token and acts on them without ever checking the signature, for example
          calling a decode-only helper, or passing a "verify" option that is silently ignored. Anyone can then
          edit the payload and be believed. The distinction is covered in{' '}
          <a href="/jwt-decoder-vs-jwt-validator" className={LINK}>decoder vs validator</a>.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Change a single character in the payload of a real token and resend it. If the
          request still succeeds, some code path is decoding without verifying.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Verify on every request, with the key and an algorithm allow-list. Never make an
          authorisation decision from a merely decoded token. In JavaScript specifically, a decode-only library
          such as <ArticleCode>jwt-decode</ArticleCode> must never be used for trust; use a verifying library.
        </ArticleP>

        <ArticleH2 id="jwt-missing-claim-checks">Missing exp, aud and iss Checks</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> A valid signature only proves the issuer produced the token. Without
          claim checks, an expired token still works (no <ArticleCode>exp</ArticleCode> check), a token minted for
          another application is accepted (no <ArticleCode>aud</ArticleCode> check), and a token from a different,
          possibly attacker-controlled issuer is trusted (no <ArticleCode>iss</ArticleCode> check). Audience
          confusion in particular lets a token intended for service A be replayed at service B.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Replay an expired token, and a token whose <ArticleCode>aud</ArticleCode> names a
          different service, against your API. Both must be rejected. The mechanics are in{' '}
          <a href="/jwt-audience-claim" className={LINK}>the aud claim</a> and{' '}
          <a href="/jwt-expiration-time" className={LINK}>JWT expiration time</a>.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Require and validate <ArticleCode>exp</ArticleCode>, <ArticleCode>iss</ArticleCode>
          and <ArticleCode>aud</ArticleCode> explicitly (most libraries take <ArticleCode>issuer</ArticleCode> and
          <ArticleCode> audience</ArticleCode> options that make these mandatory). Compare <ArticleCode>iss</ArticleCode>
          and <ArticleCode>aud</ArticleCode> as exact strings.
        </ArticleP>

        <ArticleH2 id="jwt-psychic-signatures">Psychic Signatures (CVE-2022-21449)</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> This is a library bug, not a protocol flaw. Certain Java releases (15
          through 18, before the April 2022 update) failed to reject an ECDSA signature whose <ArticleCode>r</ArticleCode>
          and <ArticleCode>s</ArticleCode> values were both zero, an obviously invalid signature that a correct
          implementation rejects outright. On an affected runtime, an all-zero signature verified against any
          ES256/384/512 token, so forgery was trivial for anyone who knew about it. The name "psychic signature"
          comes from a signature that verifies without knowing the key.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Check the Java version running your verifiers. If it is in the affected range and
          below the April 2022 Critical Patch Update, it is vulnerable regardless of your JWT code.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Patch the JDK. This is a reminder that JWT security depends on the whole stack,
          not only your own validation logic, keep crypto libraries and runtimes current.
        </ArticleP>

        <ArticleH2 id="jwt-token-leakage">Token Leakage: URLs, Logs and localStorage + XSS</ArticleH2>
        <ArticleP>
          <strong>How it works.</strong> A bearer JWT is a credential: whoever holds it can use it until it
          expires. Tokens leak when they end up in a URL query string (written to server and proxy access logs,
          browser history and <ArticleCode>Referer</ArticleCode> headers), in application logs that dump full
          requests, or in a browser store readable by JavaScript. If a token is kept in
          <ArticleCode> localStorage</ArticleCode>, any cross-site scripting (XSS) flaw on the page can read and
          exfiltrate it, whereas an HttpOnly cookie cannot be read by script. The storage trade-offs are in{' '}
          <a href="/jwt-storage-localstorage-vs-cookie" className={LINK}>where to store a JWT</a>.
        </ArticleP>
        <ArticleP>
          <strong>Test.</strong> Grep your logs and analytics for token-shaped strings (they start
          <ArticleCode> eyJ</ArticleCode>). Check that no route puts a token in the URL, and review whether your
          front end holds tokens where script can reach them.
        </ArticleP>
        <ArticleP>
          <strong>Fix.</strong> Keep tokens out of URLs and logs; send them in the <ArticleCode>Authorization</ArticleCode>
          header or an HttpOnly cookie. Keep access-token lifetimes short so a leaked token expires quickly, and
          have a revocation path (see <a href="/jwt-logout-and-revocation" className={LINK}>JWT logout and
          revocation</a>). Fix XSS at the source with output encoding and a Content Security Policy; token storage
          choices only limit the blast radius.
        </ArticleP>

        <ArticleH2 id="jwt-attack-cheat-sheet">JWT Attack Cheat Sheet: Test and Fix</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Vulnerability</th>
                <th className="px-3 py-2 font-semibold">How to test your system</th>
                <th className="px-3 py-2 font-semibold">Fix</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {CHEAT_SHEET.map(([attack, test, fix]) => (
                <tr key={attack} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{attack}</td>
                  <td className="px-3 py-2">{test}</td>
                  <td className="px-3 py-2">{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="jwt-vulnerability-scanner">Scanners and Testing Tools</ArticleH2>
        <ArticleP>
          For systems you own, automated tools help confirm the fixes hold. <ArticleCode>jwt_tool</ArticleCode>{' '}
          (<a href="https://github.com/ticarpi/jwt_tool" className={LINK} rel="noopener noreferrer" target="_blank">ticarpi/jwt_tool</a>)
          is the widely used open-source toolkit: its playbook scan checks a target for the common
          misconfigurations above, and it can generate the test tokens (none, algorithm confusion, key injection)
          to confirm your verifier rejects them. Burp Suite's JWT extensions and the PortSwigger labs cover the
          same ground interactively. Use these against your own staging environment or a lab target, with
          authorisation, as a regression check that the vulnerabilities are closed, not as a way to attack third
          parties.
        </ArticleP>
        <ArticleP>
          You can inspect any token's header and claims, and check <ArticleCode>alg</ArticleCode>,
          <ArticleCode> kid</ArticleCode> and <ArticleCode>exp</ArticleCode>, in{' '}
          <a href="/" className={LINK}>the jwtdecode.app decoder</a>, which runs entirely in your browser so the
          token is never uploaded. It decodes and (for HS, RS, PS and ES) verifies against a key you paste; it
          deliberately does not sign tokens or accept token-supplied keys, so it cannot be used to forge the
          attack tokens described here.
        </ArticleP>

        <ArticleH2 id="jwt-vulnerability-by-language">JWT Vulnerabilities in Java, Python and Express</ArticleH2>
        <ArticleP>
          The same classes of bug appear in every ecosystem, usually from a permissive default or a decode-only
          call:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Node / Express (<ArticleCode>jsonwebtoken</ArticleCode>)</strong>: always pass <ArticleCode>algorithms: ['RS256']</ArticleCode> (or your one algorithm) to <ArticleCode>jwt.verify</ArticleCode>, and never make decisions from <ArticleCode>jwt.decode</ArticleCode>. Set <ArticleCode>issuer</ArticleCode> and <ArticleCode>audience</ArticleCode>. See <a href="/jwt-authentication-nodejs-express" className={LINK}>JWT auth in Node.js</a>.</ArticleLi>
          <ArticleLi><strong>Python (PyJWT)</strong>: <ArticleCode>jwt.decode</ArticleCode> requires an <ArticleCode>algorithms</ArticleCode> list and, by default, verifies the signature; set <ArticleCode>audience</ArticleCode> and <ArticleCode>issuer</ArticleCode> and do not disable <ArticleCode>verify_signature</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Java</strong>: pin the algorithm on the verifier rather than reading it from the token, keep the JDK patched (psychic signatures), and prefer libraries whose APIs take a typed key.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          For the full defensive checklist across algorithms, keys, lifetimes and storage, see{' '}
          <a href="/jwt-security-best-practices" className={LINK}>JWT security best practices</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          JWT attacks almost all exploit a verifier that trusts the token too much: it lets the header pick the
          algorithm (none, algorithm confusion) or the key (kid, jku, jwk), skips the signature or the claim
          checks, or relies on a weak secret. The defences are consistent, pin one algorithm per key with an
          allow-list, take keys only from server-side configuration or a trusted JWKS, require and check
          <ArticleCode> exp</ArticleCode>, <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode>, keep
          secrets strong and tokens out of URLs and logs, and patch the runtime. Test each with the corresponding
          check above against a system you own, and treat RFC 8725 and the OWASP cheat sheet as the source of
          truth.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
