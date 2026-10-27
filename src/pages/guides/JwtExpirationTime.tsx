import { useState } from 'react';
import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Expiration Time: The exp, iat and nbf Claims, Units and Best Practice',
  description: 'How JWT expiration works: the exp claim format (NumericDate seconds), exp vs iat vs nbf, converting exp to a date in JavaScript, Python and bash, expiresIn units in popular libraries, OAuth expires_in, and sensible token lifetimes.',
  url: 'https://jwtdecode.app/jwt-expiration-time',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-expiration-time',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const TIME_CLAIMS: [claim: string, name: string, rfc: string, check: string][] = [
  ['exp', 'Expiration time', 'RFC 7519 §4.1.4', 'Reject if now is at or after exp (minus leeway)'],
  ['nbf', 'Not before', 'RFC 7519 §4.1.5', 'Reject if now is before nbf (plus leeway)'],
  ['iat', 'Issued at', 'RFC 7519 §4.1.6', 'Informational; optionally enforce a maximum age'],
];

const LIB_UNITS: [lib: string, option: string, units: string][] = [
  ['jsonwebtoken (Node)', 'expiresIn', 'Number = seconds from now. String = vercel/ms timespan ("15m", "1h", "7d"). A bare numeric string such as "60" is read as milliseconds.'],
  ['jose (Node, browser)', 'setExpirationTime()', 'Number = absolute NumericDate. String = relative ("15m", "2h"). Date object = absolute.'],
  ['PyJWT (Python)', 'exp in payload', 'int NumericDate or timezone-aware datetime; datetimes are converted to int seconds.'],
  ['OAuth 2.0 token response', 'expires_in', 'Seconds from issuance (RFC 6749 §5.1). Not a timestamp.'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

function toRows(raw: string): { label: string; secs: number }[] | string {
  const v = raw.trim();
  if (!v) return [];
  if (/^\d{1,16}$/.test(v)) {
    const n = Number(v);
    return v.length >= 13 ? [{ label: 'Value (milliseconds)', secs: n / 1000 }] : [{ label: 'Value (seconds)', secs: n }];
  }
  const parts = v.split('.');
  if (parts.length !== 3) return 'Enter a Unix timestamp in seconds, or a three-part JWT.';
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
    const rows = ['exp', 'iat', 'nbf'].filter((k) => typeof payload[k] === 'number').map((k) => ({ label: k, secs: payload[k] as number }));
    return rows.length ? rows : 'This token has no exp, iat or nbf claim.';
  } catch {
    return 'Could not decode the payload of that token.';
  }
}

function relative(secs: number): string {
  const diff = Math.round(secs - Date.now() / 1000);
  const a = Math.abs(diff);
  const [n, unit] = a < 60 ? [a, 'second'] : a < 3600 ? [Math.floor(a / 60), 'minute'] : a < 86400 ? [Math.floor(a / 3600), 'hour'] : [Math.floor(a / 86400), 'day'];
  const text = `${n} ${unit}${n === 1 ? '' : 's'}`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
}

function TimestampConverter() {
  const [input, setInput] = useState('');
  const rows = toRows(input);
  return (
    <div className="mb-6 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-sm">
      <label htmlFor="ts-input" className="block font-medium text-slate-700 dark:text-slate-300 mb-2">Unix timestamp to date</label>
      <input id="ts-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste an exp / iat value, e.g. 1767225600, or a whole JWT"
        spellCheck={false} autoComplete="off"
        className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface)] text-slate-700 dark:text-slate-300" />
      {typeof rows === 'string' && <p className="mt-3 text-xs text-amber-500">{rows}</p>}
      {typeof rows !== 'string' && rows.map((r) => {
        const d = new Date(r.secs * 1000);
        if (Number.isNaN(d.getTime())) return <p key={r.label} className="mt-3 text-xs text-amber-500">{r.label}: out of range</p>;
        return (
          <div key={r.label} className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
            <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">{r.label}: {r.secs}</div>
            <div>UTC: <span className="font-mono">{d.toISOString()}</span></div>
            <div>Local: <span className="font-mono">{d.toLocaleString()}</span></div>
            <div>Relative: {relative(r.secs)}{r.label === 'exp' && (r.secs <= Date.now() / 1000 ? ' (expired)' : ' (not yet expired)')}</div>
          </div>
        );
      })}
      <p className="mt-3 text-xs text-slate-500">Runs entirely in your browser. Nothing is sent anywhere.</p>
    </div>
  );
}

export default function JwtExpirationTimePage() {
  return (
    <>
      <SEOHead
        title="JWT Expiration Time: exp, iat and nbf Explained"
        description="JWT expiration time explained: the exp claim format in seconds, exp vs iat vs nbf, converting exp to a date, expiresIn units, and a free timestamp converter."
        path="/jwt-expiration-time"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Expiration Time' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'Every registered claim, including exp, nbf and iat.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'How short access token lifetimes stay usable.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors & Fixes', description: 'Expired, not-yet-valid and clock skew errors by library.' },
          { to: '/jwt-logout-and-revocation', label: 'Logout & Revocation', description: 'What to do when a token must die before exp.' },
        ]}
      >
        <ArticleH1>JWT Expiration Time: The exp, iat and nbf Claims, Units and Best Practice</ArticleH1>

        <ArticleIntroBox>
          A JWT's expiration time is the <ArticleCode>exp</ArticleCode> claim: a number of <strong>seconds</strong> since
          1970-01-01T00:00:00Z (a Unix timestamp, which RFC 7519 calls a NumericDate). A verifier must reject the token
          once the current time reaches that value. <ArticleCode>iat</ArticleCode> records when the token was issued and
          <ArticleCode>nbf</ArticleCode> says when it becomes valid, both in the same format. The most common bugs are unit
          mix-ups: milliseconds where seconds were expected, or a library option like <ArticleCode>expiresIn</ArticleCode>
          interpreted differently than you assumed. The converter below turns any <ArticleCode>exp</ArticleCode> or
          <ArticleCode>iat</ArticleCode> value, or a whole token, into a readable date.
        </ArticleIntroBox>

        <TimestampConverter />

        <ArticleH2 id="jwt-exp-claim-format">JWT exp Claim Format</ArticleH2>
        <ArticleP>
          RFC 7519 §2 defines NumericDate as the number of seconds from the epoch, ignoring leap seconds, and allows
          non-integer values. In practice every mainstream issuer uses an integer, and some libraries reject fractions,
          so stick to whole seconds. A current value is ten digits long:
        </ArticleP>
        <ArticlePre>{`{
  "sub": "user_8412",
  "iat": 1790283251,
  "nbf": 1790283251,
  "exp": 1790284151
}`}</ArticlePre>
        <ArticleP>
          Here the token lives for 900 seconds, or 15 minutes (<ArticleCode>exp - iat</ArticleCode>). If you see a
          thirteen-digit value, it is milliseconds: someone wrote <ArticleCode>Date.now()</ArticleCode> instead of
          <ArticleCode>Math.floor(Date.now() / 1000)</ArticleCode>, and the token will not expire for tens of thousands of years.
          Treat that as a bug in the issuer, not something to accommodate in the verifier.
        </ArticleP>

        <ArticleH2 id="jwt-iat-vs-exp">JWT iat vs exp vs nbf</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Claim</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Defined in</th>
                <th className="px-3 py-2 font-semibold">How verifiers use it</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {TIME_CLAIMS.map(([claim, name, rfc, check]) => (
                <tr key={claim} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono font-medium text-slate-700 dark:text-slate-300">{claim}</td>
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">{rfc}</td>
                  <td className="px-3 py-2">{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          All three are optional in RFC 7519, but <ArticleCode>exp</ArticleCode> should be treated as required for anything
          used as a credential: a token without it is valid forever unless you build revocation. RFC 9068 makes both
          <ArticleCode>exp</ArticleCode> and <ArticleCode>iat</ArticleCode> required in JWT access tokens.
          <ArticleCode>nbf</ArticleCode> is mostly useful for tokens issued ahead of time; many issuers set it equal to
          <ArticleCode>iat</ArticleCode>. For the other registered claims, see <a href="/jwt-claims-explained" className={link}>JWT claims explained</a>.
        </ArticleP>

        <ArticleH2 id="jwt-exp-to-datetime">JWT exp to Datetime: Converting in Code</ArticleH2>
        <ArticleP>
          Multiply by 1,000 in JavaScript, pass seconds straight through in Python, and prefix with <ArticleCode>@</ArticleCode> in
          GNU <ArticleCode>date</ArticleCode>:
        </ArticleP>
        <ArticlePre>{`// JavaScript
new Date(1767225600 * 1000).toISOString();   // '2026-01-01T00:00:00.000Z'

# Python
from datetime import datetime, timezone
datetime.fromtimestamp(1767225600, tz=timezone.utc).isoformat()  # '2026-01-01T00:00:00+00:00'

# bash, Linux (GNU coreutils)
date -u -d @1767225600        # Thu Jan  1 00:00:00 UTC 2026

# bash, macOS / BSD
date -u -r 1767225600`}</ArticlePre>
        <ArticleP>
          Note that GNU <ArticleCode>date -r</ArticleCode> means "modification time of this file", so the BSD form fails on
          Linux with a "No such file or directory" error. In Python, always pass <ArticleCode>tz=timezone.utc</ArticleCode>;
          without it you get a naive local time that is easy to compare wrongly. The <a href="/" className={link}>jwtdecode.app
          decoder</a> shows <ArticleCode>exp</ArticleCode>, <ArticleCode>iat</ArticleCode> and <ArticleCode>nbf</ArticleCode> as absolute and
          relative times with an active or expired badge, decoded locally in the browser. For decoding the whole
          token on the command line, see <a href="/decode-jwt-command-line" className={link}>decoding a JWT from the command line</a>.
        </ArticleP>

        <ArticleH2 id="jwt-expires-in-unit">JWT expiresIn Units by Library</ArticleH2>
        <ArticleP>
          Libraries let you express lifetime as a duration and compute <ArticleCode>exp</ArticleCode> for you. The units are
          where things go wrong.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Library</th>
                <th className="px-3 py-2 font-semibold">Option</th>
                <th className="px-3 py-2 font-semibold">Units</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {LIB_UNITS.map(([lib, option, units]) => (
                <tr key={lib} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{lib}</td>
                  <td className="px-3 py-2 font-mono">{option}</td>
                  <td className="px-3 py-2">{units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleH3 id="jsonwebtoken-expiresin">jsonwebtoken expiresIn</ArticleH3>
        <ArticlePre>{`import jwt from 'jsonwebtoken';

jwt.sign(claims, secret, { expiresIn: 900 });     // 900 seconds
jwt.sign(claims, secret, { expiresIn: '15m' });   // 900 seconds
jwt.sign(claims, secret, { expiresIn: '1h' });    // 3600 seconds
jwt.sign(claims, secret, { expiresIn: '7d' });    // 604800 seconds
jwt.sign(claims, secret, { expiresIn: '60' });    // 60 ms -> exp === iat (!)`}</ArticlePre>
        <ArticleP>
          The last line is the trap. String values go through the <ArticleCode>ms</ArticleCode> package, where a unitless
          string means milliseconds, so <ArticleCode>'60'</ArticleCode> rounds down to zero seconds and the token is born
          expired. This usually happens when the lifetime comes from an environment variable, which is always a string;
          wrap it in <ArticleCode>Number()</ArticleCode> or include a unit. An unparseable string such as
          <ArticleCode>'1 fortnight'</ArticleCode> throws <ArticleCode>"expiresIn" should be a number of seconds or string representing a timespan</ArticleCode>.
        </ArticleP>
        <ArticleH3 id="jose-setexpirationtime">jose setExpirationTime</ArticleH3>
        <ArticlePre>{`import { SignJWT } from 'jose';

await new SignJWT(claims)
  .setProtectedHeader({ alg: 'ES256' })
  .setIssuedAt()
  .setExpirationTime('15m')          // relative
  // .setExpirationTime(1790284151)  // a NUMBER is an absolute timestamp
  .sign(privateKey);`}</ArticlePre>
        <ArticleP>
          The same number means different things in the two Node libraries: 900 in <ArticleCode>jsonwebtoken</ArticleCode> is
          fifteen minutes from now, while 900 in jose is 00:15 on 1 January 1970, so the token is already expired.
        </ArticleP>
        <ArticleH3 id="pyjwt-exp">PyJWT exp</ArticleH3>
        <ArticlePre>{`import jwt
from datetime import datetime, timedelta, timezone

now = datetime.now(tz=timezone.utc)
token = jwt.encode(
    {"sub": "user_8412", "iat": now, "exp": now + timedelta(minutes=15)},
    key, algorithm="HS256",
)
# PyJWT converts both datetimes to integer seconds in the payload.`}</ArticlePre>

        <ArticleH2 id="jwt-expires-in-oauth">OAuth expires_in vs the exp Claim</ArticleH2>
        <ArticleP>
          The <ArticleCode>expires_in</ArticleCode> field in an OAuth 2.0 token response (RFC 6749 §5.1) is the access token's
          lifetime <strong>in seconds from now</strong>, not a timestamp. A response of <ArticleCode>"expires_in": 3600</ArticleCode>
          means one hour. When the access token is a JWT, its <ArticleCode>exp</ArticleCode> should agree, but clients are
          meant to treat access tokens as opaque: schedule refreshes from <ArticleCode>expires_in</ArticleCode>, computed
          against your own clock when the response arrives, rather than parsing the token. The
          <a href="/jwt-refresh-token-pattern" className={link}> refresh token pattern</a> covers the refresh side.
        </ArticleP>

        <ArticleH2 id="jwt-expiry-check">JWT Expiry Check and Clock Skew</ArticleH2>
        <ArticleP>
          Every serious library checks <ArticleCode>exp</ArticleCode> and <ArticleCode>nbf</ArticleCode> during verification.
          Do not reimplement it, but do configure a small leeway, because the issuer's clock and yours will never agree
          exactly:
        </ArticleP>
        <ArticlePre>{`// jsonwebtoken: seconds
jwt.verify(token, key, { algorithms: ['RS256'], clockTolerance: 30 });

// jose: seconds or a duration string
await jwtVerify(token, JWKS, { clockTolerance: '30s' });

# PyJWT: seconds or timedelta
jwt.decode(token, key, algorithms=["RS256"], leeway=30)`}</ArticlePre>
        <ArticleP>
          Keep the leeway to tens of seconds. If you need minutes, fix NTP on the host rather than widening the window.
          See <a href="/common-jwt-errors-and-fixes#clock-skew" className={link}>clock skew errors</a> for symptoms.
        </ArticleP>

        <ArticleH2 id="jwt-iat-converter-token-age">Using iat to Limit Token Age</ArticleH2>
        <ArticleP>
          <ArticleCode>exp</ArticleCode> is chosen by the issuer. If your API wants a stricter limit than the issuer grants,
          use <ArticleCode>iat</ArticleCode> to enforce a maximum age on your side. Both Node libraries support this
          directly:
        </ArticleP>
        <ArticlePre>{`// jsonwebtoken: throws TokenExpiredError "maxAge exceeded"
jwt.verify(token, key, { algorithms: ['RS256'], maxAge: '1h' });

// jose: ERR_JWT_EXPIRED '"iat" claim timestamp check failed (too far in the past)'
await jwtVerify(token, JWKS, { maxTokenAge: '1h' });`}</ArticlePre>
        <ArticleP>
          With jose, <ArticleCode>maxTokenAge</ArticleCode> also makes <ArticleCode>iat</ArticleCode> mandatory: a token without it
          fails with <ArticleCode>missing required "iat" claim</ArticleCode>. PyJWT has no max-age option, but it rejects an
          <ArticleCode>iat</ArticleCode> in the future, and you can require claims to be present:
        </ArticleP>
        <ArticlePre>{`jwt.decode(token, key, algorithms=["RS256"], options={"require": ["exp", "iat"]})
# MissingRequiredClaimError: Token is missing the "exp" claim`}</ArticlePre>
        <ArticleP>
          Requiring <ArticleCode>exp</ArticleCode> is worth doing everywhere. Most libraries only check expiry if the claim is
          present, so a token minted without one, by a misconfigured service or a test script that leaked into
          production, would otherwise pass as valid indefinitely.
        </ArticleP>

        <ArticleH2 id="jwt-expire-in-client">Checking When a JWT Will Expire on the Client</ArticleH2>
        <ArticleP>
          A client sometimes wants to know how long a token has left, for example to refresh a little before expiry
          instead of waiting for a 401. Decoding the payload is enough for that; no key is needed because the client is
          not making a security decision:
        </ArticleP>
        <ArticlePre>{`import { decodeJwt } from 'jose';

const { exp } = decodeJwt(accessToken);
const secondsLeft = exp - Math.floor(Date.now() / 1000);
if (secondsLeft < 60) await refresh();`}</ArticlePre>
        <ArticleP>
          Two caveats. The user's device clock can be wrong by minutes or more, so treat the result as approximate and
          still handle a 401 by refreshing and retrying once. And if the access token is meant to be opaque to the
          client, as it is in OAuth, prefer the <ArticleCode>expires_in</ArticleCode> value from the token response. The
          server remains the only place where expiry is enforced; see
          <a href="/jwt-decoder-vs-jwt-validator" className={link}> decoder vs validator</a> for why decoding is not validation.
        </ArticleP>

        <ArticleH2 id="jwt-expired-meaning">JWT Expired: What the Error Means</ArticleH2>
        <ArticleP>
          "JWT expired" means the signature may well be valid but the current time is past <ArticleCode>exp</ArticleCode>. The
          fix is to get a new token (refresh or sign in again), not to change the verifier. The exact messages:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>jsonwebtoken</strong>: <ArticleCode>TokenExpiredError: jwt expired</ArticleCode>, with an <ArticleCode>expiredAt</ArticleCode> date; <ArticleCode>NotBeforeError: jwt not active</ArticleCode> for <ArticleCode>nbf</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>jose</strong>: code <ArticleCode>ERR_JWT_EXPIRED</ArticleCode>, message <ArticleCode>"exp" claim timestamp check failed</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>PyJWT</strong>: <ArticleCode>ExpiredSignatureError: Signature has expired</ArticleCode>; <ArticleCode>ImmatureSignatureError: The token is not yet valid (nbf)</ArticleCode>.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          If a token is reported expired seconds after it was issued, check for the <ArticleCode>'60'</ArticleCode>-string trap
          above, a millisecond <ArticleCode>iat</ArticleCode> on one side, or a server clock that is ahead. More in the
          <a href="/common-jwt-errors-and-fixes#expired" className={link}> expired token section</a> of the errors guide.
        </ArticleP>

        <ArticleH2 id="jwt-expiration-time-best-practice">JWT Expiration Time Best Practice</ArticleH2>
        <ArticleP>
          There is no single correct lifetime. The trade-off is simple: a stateless JWT cannot be recalled before
          <ArticleCode>exp</ArticleCode> without extra infrastructure, so its lifetime is the window in which a stolen token
          works. Shorter is safer; longer means fewer refreshes.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Access tokens</strong>: minutes, not hours. Somewhere between 5 and 60 minutes is typical; pick the short end for sensitive APIs and pair it with a refresh token so users are not signed out.</ArticleLi>
          <ArticleLi><strong>Refresh tokens</strong>: longer (hours to weeks), but stored server-side or rotated on every use so they can be revoked.</ArticleLi>
          <ArticleLi><strong>ID tokens</strong>: short. They prove a sign-in event to the client and are not meant to be reused as API credentials.</ArticleLi>
          <ArticleLi><strong>One-off tokens</strong> (email links, service-to-service calls, RFC 7523 client assertions): as short as the flow allows, often a few minutes, ideally with a <ArticleCode>jti</ArticleCode> recorded to block replay.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          When choosing within those ranges, ask three questions. How much damage could a stolen token do before it
          expires? How quickly must a role change or account suspension take effect? And what does a refresh cost your
          identity provider and your users? A banking API and an internal dashboard give very different answers. Whatever
          you choose, make the lifetime a configuration value rather than a constant buried in code, so it can be
          shortened quickly if a leak is suspected, and log <ArticleCode>iat</ArticleCode> and <ArticleCode>exp</ArticleCode> (not the
          token) when rejecting requests so expiry problems are easy to diagnose.
        </ArticleP>
        <ArticleCallout type="warning">
          A long <ArticleCode>exp</ArticleCode> is not a substitute for sessions. If you need instant logout or permission
          changes to take effect immediately, you need a revocation mechanism; see
          <a href="/jwt-logout-and-revocation" className={link}> JWT logout and revocation</a>.
        </ArticleCallout>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          <ArticleCode>exp</ArticleCode>, <ArticleCode>iat</ArticleCode> and <ArticleCode>nbf</ArticleCode> are NumericDates:
          integer seconds since the Unix epoch, in UTC. Convert with <ArticleCode>new Date(exp * 1000)</ArticleCode>,
          <ArticleCode>datetime.fromtimestamp(exp, tz=timezone.utc)</ArticleCode> or <ArticleCode>date -u -d @exp</ArticleCode>.
          In <ArticleCode>jsonwebtoken</ArticleCode>, a numeric <ArticleCode>expiresIn</ArticleCode> is seconds and a string
          uses <ArticleCode>ms</ArticleCode> syntax; in jose, a number passed to <ArticleCode>setExpirationTime</ArticleCode> is
          absolute. OAuth's <ArticleCode>expires_in</ArticleCode> is a duration in seconds. Keep access tokens short, allow
          tens of seconds of clock skew, and rely on refresh tokens and revocation rather than long lifetimes.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
