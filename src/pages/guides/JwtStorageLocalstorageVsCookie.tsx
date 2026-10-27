import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT Storage: localStorage vs Cookie vs Memory',
  description: 'Where should a browser-based JWT live? A practical comparison of localStorage, sessionStorage, HttpOnly cookies, and in-memory storage, with the XSS and CSRF tradeoffs each carries.',
  url: 'https://jwtdecode.app/jwt-storage-localstorage-vs-cookie',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-storage-localstorage-vs-cookie',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-05-27',
  dateModified: '2026-05-27',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

export default function JwtStorageLocalstorageVsCookiePage() {
  return (
    <>
      <SEOHead
        title="JWT Storage: localStorage vs Cookie vs Memory"
        description="A practical comparison of JWT storage options in the browser — localStorage, sessionStorage, HttpOnly cookies, and in-memory. XSS and CSRF tradeoffs explained."
        path="/jwt-storage-localstorage-vs-cookie"
        ogType="article"
        article={{ publishedTime: '2026-05-27', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT Storage' }]}
        publishedDate="2026-05-27"
        relatedLinks={[
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'The broader checklist this fits inside.' },
          { to: '/jwt-vs-session-tokens', label: 'JWT vs Session Tokens', description: 'When to skip JWTs entirely and use server-side sessions.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Short-lived access tokens + secure refresh storage.' },
          { to: '/common-jwt-errors-and-fixes', label: 'Common JWT Errors', description: 'Storage-related bugs that surface as auth errors.' },
        ]}
      >
        <ArticleH1>JWT Storage: localStorage vs Cookie vs Memory</ArticleH1>

        <ArticleIntroBox>
          Where should a JWT live in a browser? Stack Overflow says cookies; Twitter says localStorage; OWASP
          says it depends; security researchers say "neither, use both differently". This guide breaks down
          the four real options, localStorage, sessionStorage, HttpOnly cookie, in-memory variable, against
          the two threats that actually drive the decision (XSS and CSRF) and explains why most modern apps
          end up with the hybrid pattern.
        </ArticleIntroBox>

        <ArticleH2 id="the-options">The Four Storage Options</ArticleH2>
        <ArticleH3 id="localstorage">localStorage</ArticleH3>
        <ArticleP>
          Persistent across tabs and sessions. Accessible from JavaScript via <ArticleCode>localStorage.getItem("jwt")</ArticleCode>.
          Survives browser restarts. ~5 MB per origin.
        </ArticleP>
        <ArticleH3 id="sessionstorage">sessionStorage</ArticleH3>
        <ArticleP>
          Like localStorage but scoped to the tab, discarded when the tab closes. Same JavaScript-accessible
          API.
        </ArticleP>
        <ArticleH3 id="cookie">HttpOnly Cookie</ArticleH3>
        <ArticleP>
          Sent automatically by the browser with every request to the matching domain. With the
          <ArticleCode>HttpOnly</ArticleCode> flag set, JavaScript cannot read or write it, only the browser
          and the server see the value. Should also carry <ArticleCode>Secure</ArticleCode>,
          <ArticleCode>SameSite=Strict</ArticleCode> (or <ArticleCode>Lax</ArticleCode>), and optionally
          <ArticleCode>__Host-</ArticleCode> prefix for additional binding.
        </ArticleP>
        <ArticleH3 id="memory">In-Memory Variable</ArticleH3>
        <ArticleP>
          A plain JavaScript variable in your app's runtime memory. Lost on page reload, every fresh load
          starts without a token until something restores it.
        </ArticleP>

        <ArticleH2 id="threat-model">The Two Threats That Drive the Choice</ArticleH2>
        <ArticleH3 id="xss">XSS, Cross-Site Scripting</ArticleH3>
        <ArticleP>
          An attacker injects JavaScript into your page (via a vulnerable input, a third-party script,
          a compromised dependency, or DOM-based XSS). Their script then runs with the privileges of your
          origin. Anything reachable by JavaScript, localStorage, sessionStorage, in-memory variables,
          non-HttpOnly cookies, is reachable by the attacker.
        </ArticleP>
        <ArticleP>
          XSS is the dominant front-end threat in 2026. The bar for a working XSS exploit is low; it shows up
          in real-world breach reports every quarter.
        </ArticleP>
        <ArticleH3 id="csrf">CSRF, Cross-Site Request Forgery</ArticleH3>
        <ArticleP>
          An attacker tricks a logged-in user's browser into making an authenticated request to your site —
          typically via a hidden form submission from <ArticleCode>evil.com</ArticleCode>. Because the browser
          automatically attaches cookies for the target domain, a vanilla cookie-based session is vulnerable.
          CSRF only affects credentials the browser sends automatically, i.e. cookies. Authorization headers
          set explicitly by JavaScript don't auto-attach.
        </ArticleP>
        <ArticleP>
          CSRF was a much bigger problem before <ArticleCode>SameSite</ArticleCode> cookies landed; with
          <ArticleCode>SameSite=Strict</ArticleCode> or <ArticleCode>Lax</ArticleCode> (now default in modern
          browsers), cross-site cookie attachment is mostly blocked. CSRF tokens are still belt-and-braces.
        </ArticleP>

        <ArticleH2 id="comparison-table">Direct Comparison</ArticleH2>
        <ArticleP>The vulnerability profile of each option:</ArticleP>
        <ArticlePre lang="text">{`Storage             | XSS-readable | CSRF-vulnerable | Survives reload | Auto-sent
localStorage        | YES          | no              | YES             | no
sessionStorage      | YES          | no              | tab-scoped      | no
non-HttpOnly cookie | YES          | yes (legacy)    | YES             | YES
HttpOnly cookie     | no           | yes (legacy)    | YES             | YES
In-memory variable  | YES (live)   | no              | NO              | no`}</ArticlePre>

        <ArticleH2 id="why-localstorage-loses">Why "Just Use localStorage" Is the Wrong Default</ArticleH2>
        <ArticleP>
          The case for localStorage is convenience: a SPA reads the token, attaches it to API requests via
          <ArticleCode>Authorization: Bearer ...</ArticleCode>, never has to think about CSRF (because the
          header isn't auto-attached), and survives reloads.
        </ArticleP>
        <ArticleP>
          The case against: <strong>any XSS becomes immediate token theft</strong>. The attacker's injected script
          runs <ArticleCode>localStorage.getItem("jwt")</ArticleCode> and exfiltrates the <a href="/jwt-vs-bearer-token" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">bearer token</a> to
          their own server. They now have full account access until the token expires. The attacker doesn't
          need persistent access, one XSS, one exfiltrate, one replay.
        </ArticleP>
        <ArticleCallout type="warning">
          Auth0's official position (as of their most recent SDK update) and OWASP's JWT Cheat Sheet both
          recommend AGAINST localStorage for JWT storage in security-sensitive applications. The convenience
          isn't worth the XSS blast radius.
        </ArticleCallout>

        <ArticleH2 id="why-cookies-have-tradeoffs">Why HttpOnly Cookies Aren't a Silver Bullet</ArticleH2>
        <ArticleP>
          A correctly-configured HttpOnly cookie (<ArticleCode>HttpOnly</ArticleCode>,
          <ArticleCode>Secure</ArticleCode>, <ArticleCode>SameSite=Strict</ArticleCode>) is the strongest
          single option:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>XSS cannot read the value (HttpOnly).</ArticleLi>
          <ArticleLi>Cross-site requests don't carry it (SameSite=Strict).</ArticleLi>
          <ArticleLi>HTTPS-only transport (Secure).</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The remaining XSS risk: the attacker's script can still make authenticated requests <em>from your
          own origin</em>, the browser still attaches the HttpOnly cookie automatically when the script makes
          a same-origin request. So XSS doesn't get the token, but it CAN perform actions as the user for as
          long as the page is open. That's less bad than full token theft (no replay after the tab closes),
          but it's not zero.
        </ArticleP>
        <ArticleP>
          Other limitations: cookies are bound to a single domain (or a Public Suffix List subset), making
          cross-domain SPA architectures awkward; SameSite breaks legitimate cross-origin flows like OIDC
          redirects (mitigated by SameSite=Lax in most cases); and CSRF tokens are still recommended for
          state-changing requests as defence-in-depth.
        </ArticleP>

        <ArticleH2 id="hybrid-pattern">The Hybrid Pattern Most Modern Apps Use</ArticleH2>
        <ArticleP>
          The widely-recommended pattern in 2026:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Refresh token</strong> in an HttpOnly, Secure, SameSite=Strict cookie. Long-lived (days), restricted to the auth endpoint's path (<ArticleCode>Path=/auth</ArticleCode>) so it's only sent when refreshing.</ArticleLi>
          <ArticleLi><strong>Access token (the JWT)</strong> held in an in-memory JavaScript variable. Short-lived (5-15 minutes). Attached via <ArticleCode>Authorization: Bearer</ArticleCode> header.</ArticleLi>
          <ArticleLi><strong>On page reload</strong>, the SPA's bootstrap code calls the refresh endpoint. The browser auto-attaches the refresh cookie, the server issues a new access token, the SPA holds it in memory.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          XSS that steals the in-memory access token gets a 5-15-minute window. XSS cannot read the refresh
          cookie. CSRF is blocked by SameSite + the fact that the refresh endpoint requires the cookie (which
          cross-site requests won't carry). The tradeoff is one extra HTTP request on page load.
        </ArticleP>
        <ArticleCallout type="info">
          This pattern is documented in detail at <a href="/jwt-refresh-token-pattern" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline">JWT Refresh Token Pattern</a> with implementation notes.
        </ArticleCallout>

        <ArticleH2 id="mobile-and-native">Native / Mobile Storage Is Different</ArticleH2>
        <ArticleP>
          Outside the browser, the threat model shifts. Mobile apps use the platform keychain (iOS Keychain,
          Android Keystore) which provides hardware-backed encrypted storage; tokens there are immune to
          web-style XSS but vulnerable to a different threat surface (rooted devices, app-to-app attacks). The
          patterns above are browser-specific.
        </ArticleP>

        <ArticleH2 id="defence-in-depth">Defence in Depth Regardless</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Content Security Policy</strong>: restricts which scripts can load. Cuts XSS exploit surface dramatically.</ArticleLi>
          <ArticleLi><strong>Subresource Integrity</strong> on third-party scripts you can't avoid loading.</ArticleLi>
          <ArticleLi><strong>Short access-token lifetimes</strong> (5-15 min). The blast radius of any token theft is bounded by <ArticleCode>exp</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Refresh-token rotation</strong> on each use, so a stolen refresh cookie can only be used once before the legitimate user's next refresh invalidates it.</ArticleLi>
          <ArticleLi><strong>Server-side <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">revocation</a> list</strong> for refresh tokens, JWTs can't be revoked unilaterally, but refresh tokens stored on a server can.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          localStorage is the worst common choice for JWT storage, XSS turns into full token theft. HttpOnly
          cookies are stronger but not perfect (XSS can still act-as-user without exfiltrating the token).
          The hybrid pattern, refresh token in HttpOnly cookie, access token in memory, is the modern
          default for security-conscious SPAs. The browser's storage choice isn't a substitute for the rest
          of the security stack (CSP, short expiries, refresh rotation, server-side revocation), but it's the
          one decision developers tend to make once and never revisit, so it's worth getting right.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
