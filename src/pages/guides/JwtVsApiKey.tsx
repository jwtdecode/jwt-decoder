import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT vs API Key: Differences, Trade-offs and When to Use Each',
  description: 'A JSON Web Token is a short-lived, signed set of claims; an API key is a long-lived static secret. Compare identity, expiry, revocation and validation cost, and see how to use an API key and a JWT together.',
  url: 'https://jwtdecode.app/jwt-vs-api-key',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-vs-api-key',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const COMPARISON: [aspect: string, apiKey: string, jwt: string][] = [
  ['What it is', 'A random secret string, meaningless on its own', 'A signed JSON document of claims (RFC 7519)'],
  ['Identifies', 'Usually an application, project or customer account', 'Usually a user or a service, plus scopes and audience'],
  ['Lifetime', 'Months or years; valid until someone revokes it', 'Minutes to hours, enforced by the exp claim'],
  ['Validation', 'Database or cache lookup on every request', 'Signature check with a key already in memory'],
  ['Revocation', 'Immediate: delete or disable the record', 'Hard before exp without a deny-list or introspection'],
  ['Carries data', 'No; everything is looked up server-side', 'Yes; claims travel with the token and can be read by the holder'],
  ['Standard', 'None; each vendor picks a format and header', 'RFC 7519, with JWS (RFC 7515) for signing'],
  ['Issued by', 'A developer dashboard or admin API', 'A login endpoint or an OAuth authorisation server'],
  ['Damage if leaked', 'High: works until noticed and revoked', 'Limited to the remaining lifetime of the token'],
];

const THREE_WAY: [option: string, bestFor: string, weakness: string][] = [
  ['API key', 'Server-to-server calls by a known customer; metering and rate limits', 'Long-lived, no user context, easy to leak into code and logs'],
  ['JWT', 'Stateless auth for users and services across many APIs', 'Hard to revoke early; payload readable by anyone who holds it'],
  ['OAuth 2.0', 'Delegated access, third-party apps, SSO, standard machine flows', 'More moving parts; needs an authorisation server'],
];

export default function JwtVsApiKeyPage() {
  return (
    <>
      <SEOHead
        title="JWT vs API Key: Which Should Your API Use?"
        description="JWT vs API key compared: identity, expiry, revocation and validation cost, when each fits, and how to exchange an API key for a short-lived JWT safely."
        path="/jwt-vs-api-key"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT vs API Key' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-vs-oauth', label: 'JWT vs OAuth', description: 'Why OAuth is a framework and JWT is a token format.' },
          { to: '/jwt-vs-session-tokens', label: 'JWT vs Session Tokens', description: 'The stateless-versus-stateful trade-off behind this choice.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Algorithm pinning, lifetimes and key rotation for JWTs.' },
          { to: '/jwt-logout-and-revocation', label: 'JWT Logout & Revocation', description: 'How to invalidate a JWT before it expires.' },
        ]}
      >
        <ArticleH1>JWT vs API Key: Differences and When to Use Each</ArticleH1>

        <ArticleIntroBox>
          An API key is a long-lived random secret that identifies the calling application; the server looks it up
          in a database on every request. A JSON Web Token (JWT) is a short-lived, signed set of claims that usually
          identifies a user or service; the server verifies the signature and reads the claims without a lookup. API
          keys are simpler and revoke instantly. JWTs carry identity and scopes, expire on their own, and scale
          without shared state.
          <br /><br />
          Use an API key when a known customer&rsquo;s server calls your API and you mainly need to know which account to
          bill and rate-limit. Use JWTs when you need to know which user is acting, what they may do, and when many
          services must check that cheaply. Many production APIs use both: a key to obtain a token, and the token for
          the actual calls.
        </ArticleIntroBox>

        <ArticleH2 id="json-web-token-vs-api-key">JSON Web Token vs API Key: The Core Difference</ArticleH2>
        <ArticleP>
          The difference is where the meaning lives. An API key such as <ArticleCode>sk_live_3Zp2cvI1qc2n6duUKf4E</ArticleCode> is
          a reference. On its own it says nothing; the server has to find the matching record to learn which account
          it belongs to, what it may do, and whether it is still enabled. A JWT is a value. Its payload states the
          subject, issuer, audience, expiry and scopes, and the signature proves those statements came from a key the
          server trusts. The <a href="/jwt-header-payload-signature-explained" className={LINK}>header, payload and signature guide</a> explains
          how that works.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">API key</th>
                <th className="px-3 py-2 font-semibold">JWT</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {COMPARISON.map(([aspect, apiKey, jwt]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{apiKey}</td>
                  <td className="px-3 py-2">{jwt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Neither is encrypted in transit by itself. Both must only be sent over HTTPS, and both are bearer
          credentials: whoever holds one can use it. See <a href="/jwt-vs-bearer-token" className={LINK}>JWT vs bearer token</a> for
          what that means and how proof-of-possession changes it.
        </ArticleP>

        <ArticleH2 id="jwt-or-api-key">JWT or API Key: Which Should You Use?</ArticleH2>
        <ArticleH3 id="when-api-key">Use an API key when</ArticleH3>
        <ArticleUl>
          <ArticleLi>The caller is a backend server owned by a customer or partner, not a browser or mobile app.</ArticleLi>
          <ArticleLi>You need to identify an account for billing, quotas and rate limits, and there is no end user in the request.</ArticleLi>
          <ArticleLi>You want the lowest possible integration effort: one header, no token endpoint, no expiry handling.</ArticleLi>
          <ArticleLi>Immediate revocation matters more than avoiding a lookup per request (and the lookup can be cached for a few seconds).</ArticleLi>
        </ArticleUl>
        <ArticleH3 id="when-jwt">Use a JWT when</ArticleH3>
        <ArticleUl>
          <ArticleLi>Requests act on behalf of a logged-in user, and each API needs the user ID, roles or scopes.</ArticleLi>
          <ArticleLi>Several services verify the same credential and you do not want each to query a central database.</ArticleLi>
          <ArticleLi>The credential lives somewhere it can leak, such as a browser or a mobile device, so a short lifetime limits the damage.</ArticleLi>
          <ArticleLi>You already use an identity provider or OAuth server that issues JWT access tokens.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          Never ship an API key with secret-level permissions in a browser bundle or mobile app. It can be extracted by
          anyone who downloads the app. Public clients should get short-lived tokens tied to a user session instead.
        </ArticleCallout>

        <ArticleH2 id="jwt-api-key">Using a JWT as an API Key</ArticleH2>
        <ArticleP>
          Some platforms hand out long-lived JWTs and call them API keys. This gives the key a readable structure
          (tenant ID, role, issue date) and lets gateways check it without a database. It also combines the downsides
          of both approaches:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>No real expiry</strong>: a key-style JWT often has an <ArticleCode>exp</ArticleCode> years away, or none at all, so the main safety property of a JWT is gone.</ArticleLi>
          <ArticleLi><strong>No cheap revocation</strong>: if the gateway never checks a database, the only way to kill one leaked key is to rotate the signing key, which invalidates every other key signed with it.</ArticleLi>
          <ArticleLi><strong>Readable payload</strong>: anyone who finds the key can decode it and learn the tenant and role names.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          If you issue JWT-shaped keys, keep a <ArticleCode>jti</ArticleCode> in each and check it against a revocation list, even if
          that list is cached. The options are covered in <a href="/jwt-logout-and-revocation" className={LINK}>JWT logout and revocation</a>.
          You can inspect such a key with the <a href="/" className={LINK}>jwtdecode.app decoder</a>, which decodes in the browser, to see
          exactly what it discloses.
        </ArticleP>

        <ArticleH2 id="jwt-token-and-api-key">Using an API Key and a JWT Together</ArticleH2>
        <ArticleP>
          The most robust pattern uses each for what it is good at. The client holds a long-lived API key but only
          presents it to one endpoint, which returns a short-lived JWT. Every other call uses the JWT. The key is
          exposed on the wire far less often, the JWT limits the damage of any leak to minutes, and your APIs validate
          tokens statelessly. This is essentially the OAuth client credentials grant, and if you already run an OAuth
          server you should use that grant rather than inventing your own.
        </ArticleP>
        <ArticleP>
          A minimal exchange endpoint in Node.js with the <ArticleCode>jose</ArticleCode> library. Keys are stored as SHA-256
          hashes, so a database leak does not reveal usable keys:
        </ArticleP>
        <ArticlePre>{`import { createHash } from 'node:crypto';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET); // 32+ random bytes

// keysByHash: Map of sha256(key) -> { clientId, scopes }, loaded from your database
function lookupApiKey(presented) {
  const hash = createHash('sha256').update(presented).digest('hex');
  return keysByHash.get(hash) ?? null;
}

export async function exchangeApiKeyForToken(apiKey) {
  const client = lookupApiKey(apiKey);
  if (!client) return null;                     // respond 401

  return new SignJWT({ scope: client.scopes.join(' ') })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(client.clientId)
    .setIssuer('https://api.example.com')
    .setAudience('https://api.example.com')
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}`}</ArticlePre>
        <ArticleP>
          Downstream services then verify with <ArticleCode>jwtVerify(token, secret, {'{'} issuer, audience, algorithms: ['HS256'] {'}'})</ArticleCode>.
          If services other than the issuer need to verify, switch to an asymmetric algorithm so they only hold a
          public key; <a href="/hs256-vs-rs256" className={LINK}>HS256 vs RS256</a> covers that choice.
        </ArticleP>

        <ArticleH2 id="api-key-best-practices">Handling API Keys Safely</ArticleH2>
        <ArticleP>
          API keys have no standard, so the safety properties depend on how you build them. Generating and storing
          them correctly in Python:
        </ArticleP>
        <ArticlePre>{`import hashlib, hmac, secrets

def new_api_key():
    key = "sk_live_" + secrets.token_urlsafe(32)          # show to the user once
    digest = hashlib.sha256(key.encode()).hexdigest()    # store only this
    return key, digest

def check_api_key(presented, stored_digest):
    digest = hashlib.sha256(presented.encode()).hexdigest()
    return hmac.compare_digest(digest, stored_digest)`}</ArticlePre>
        <ArticleUl>
          <ArticleLi><strong>High entropy</strong>: at least 128 bits from a CSPRNG. Because the key is random, a fast hash such as SHA-256 is enough for storage; slow password hashes are not needed.</ArticleLi>
          <ArticleLi><strong>Recognisable prefix</strong>: a prefix such as <ArticleCode>sk_live_</ArticleCode> lets secret scanners and your own log filters spot leaked keys.</ArticleLi>
          <ArticleLi><strong>Send in a header</strong>, never in the query string, where it ends up in access logs, browser history and proxies.</ArticleLi>
          <ArticleLi><strong>Scope and rotate</strong>: let customers create several keys with narrow permissions, and support two active keys at once so rotation has no downtime.</ArticleLi>
          <ArticleLi><strong>Record last use</strong>: unused keys should be flagged and disabled.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="api-key-or-jwt-more-secure">Is an API Key or a JWT More Secure?</ArticleH2>
        <ArticleP>
          Neither is secure or insecure by nature; they fail in different ways.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>API keys fail by leaking and living forever.</strong> Keys get committed to repositories, pasted into CI logs and shared in chat. Because they rarely expire, a key leaked a year ago may still work today. The mitigations are operational: secret scanning, per-environment keys, rotation, and alerting on unusual use.</ArticleLi>
          <ArticleLi><strong>JWTs fail through validation mistakes.</strong> A leaked JWT expires quickly, but a verifier that accepts <ArticleCode>alg: none</ArticleCode>, skips the audience check, or trusts the algorithm in the header can be tricked into accepting forged tokens. The mitigations are in code: a maintained library, a pinned algorithm list, and checks on <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode> and <ArticleCode>exp</ArticleCode>. See <a href="/jwt-attacks-and-vulnerabilities" className={LINK}>JWT attacks and vulnerabilities</a>.</ArticleLi>
          <ArticleLi><strong>Both are bearer credentials.</strong> Whoever holds one can use it, so both need HTTPS, both must stay out of URLs and logs, and neither proves the sender is the rightful owner unless you add proof of possession.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          In practice, the better question is how much damage a single leaked credential can do. A 15-minute JWT with
          one narrow scope limits that far more than a permanent key with full account access. A key limited to one
          IP range and read-only permissions can be safer than a day-long JWT with admin rights. Lifetime and scope
          matter more than format.
        </ArticleP>

        <ArticleH2 id="jwt-vs-oauth2-vs-api-key">JWT vs OAuth2 vs API Key</ArticleH2>
        <ArticleP>
          These three are often listed as alternatives, but OAuth 2.0 is a framework for issuing tokens, and the tokens
          it issues are frequently JWTs. The honest comparison is between approaches:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Approach</th>
                <th className="px-3 py-2 font-semibold">Best for</th>
                <th className="px-3 py-2 font-semibold">Main weakness</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {THREE_WAY.map(([option, bestFor, weakness]) => (
                <tr key={option} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{option}</td>
                  <td className="px-3 py-2">{bestFor}</td>
                  <td className="px-3 py-2">{weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          A typical public API ends up with all three: API keys for simple server integrations, OAuth for third-party
          apps acting for users, and JWT access tokens as the format those OAuth flows produce. The relationship
          between the last two is explained in <a href="/jwt-vs-oauth" className={LINK}>JWT vs OAuth</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>An API key is an opaque, long-lived secret identifying an application; a JWT is a short-lived, signed statement about a user or service.</ArticleLi>
          <ArticleLi>API keys revoke instantly but need a lookup per request; JWTs validate locally but are hard to revoke before they expire.</ArticleLi>
          <ArticleLi>Choose API keys for server-to-server calls by known customers, JWTs for user context and multi-service validation.</ArticleLi>
          <ArticleLi>Avoid long-lived JWTs used as API keys unless you also check a revocation list.</ArticleLi>
          <ArticleLi>Combining them, a key exchanged for a 15-minute JWT, gives you instant revocation of the key and cheap validation of every call.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
