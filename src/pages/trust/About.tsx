import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleP, ArticleUl, ArticleLi, ArticleCallout } from '../../components/ArticleLayout';

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About JWT Decode — Who Built It and Why"
        description="About jwtdecode.app — a free, privacy-first JWT decoder and verifier built for developers. All processing is local; your tokens are never transmitted anywhere."
        path="/about"
        noSuffix
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          url: 'https://jwtdecode.app/about',
          name: 'About JWT Decode',
          about: { '@id': 'https://jwtdecode.app/#organization' },
          mainEntity: {
            '@type': 'Person',
            '@id': 'https://jwtdecode.app/about#andy',
            name: 'Andy',
            url: 'https://jwtdecode.app/about#andy',
            jobTitle: 'Software engineer',
            description: 'Software engineer who has shipped JWT-based authentication in production systems; writes and maintains the guides on jwtdecode.app.',
            worksFor: { '@id': 'https://jwtdecode.app/#organization' },
          },
        }}
      />
      <ArticleLayout breadcrumbs={[{ label: 'About' }]}>
        <ArticleH1>About JWT Decode</ArticleH1>

        <ArticleP>
          JWT Decode (<strong>jwtdecode.app</strong>) is a free online JSON Web Token decoder,
          inspector, and signature verifier built for developers who need to quickly understand
          what a JWT contains without compromising token security.
        </ArticleP>

        <ArticleP>
          The site is written and maintained by <strong id="andy">Andy</strong>, a software engineer who
          has shipped JWT-based authentication in production systems and writes the guides here
          to make that experience reusable. Corrections, questions, and disagreements are welcome
          — contact details below.
        </ArticleP>

        <ArticleH2 id="purpose">Purpose</ArticleH2>
        <ArticleP>
          Modern authentication systems issue JSON Web Tokens constantly — as access tokens, ID tokens,
          and API credentials. Developers, QA engineers, security engineers, and API integrators
          regularly need to inspect these tokens: to debug auth flows, verify claim values, check
          expiry timestamps, or confirm that an issuer is setting the right fields.
        </ArticleP>
        <ArticleP>
          Many existing JWT tools send the pasted token to a remote server for decoding — a significant
          privacy risk, since JWTs often contain user IDs, session scopes, and role assignments.
          JWT Decode was built specifically to eliminate this risk: all decoding and signature
          verification runs in your browser using JavaScript and the browser's built-in Web Crypto API.
          No token content ever leaves your device.
        </ArticleP>

        <ArticleH2 id="who-its-for">Who This Is For</ArticleH2>
        <ArticleP>
          JWT Decode is used by anyone who works with authentication systems and needs to inspect
          tokens quickly and safely. Common use cases across different roles:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Backend developers</strong> debugging a 401 from an API gateway — paste the token
            from the Authorization header, check whether <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">exp</code> has
            passed, confirm the <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">aud</code> matches
            the expected service, and check the <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">iss</code> against
            the configured issuer.
          </ArticleLi>
          <ArticleLi>
            <strong>QA engineers</strong> verifying that the auth service is setting the right
            claims in test environments — confirm that <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">roles</code>,
            <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">org_id</code>, and custom claims
            are populated correctly in regression tests.
          </ArticleLi>
          <ArticleLi>
            <strong>Security engineers</strong> auditing tokens from a third-party integration —
            inspect exactly what claims an external identity provider is including, verify the
            signing algorithm is RS256 (not HS256), and check that an appropriate token lifetime
            is being used.
          </ArticleLi>
          <ArticleLi>
            <strong>API integrators</strong> onboarding to a new identity provider — decode the
            access and ID tokens returned by the provider's token endpoint to understand the
            claim structure before writing verification code.
          </ArticleLi>
          <ArticleLi>
            <strong>CI/CD pipeline engineers</strong> diagnosing a failing authentication step in
            an automated test suite — copy the token from the pipeline log, check its expiry
            and claims without needing to set up a local debugging environment.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          The tool is intentionally simple: paste a token, see the claims. No account required,
          no sign-up, no configuration. The signature verifier supports every common algorithm
          and accepts keys in standard formats (PEM and raw shared secrets) for when you need
          to go beyond inspection.
        </ArticleP>

        <ArticleH2 id="features">What the Tool Does</ArticleH2>
        <ArticleUl>
          <ArticleLi>
            <strong>Instant JWT decoding:</strong> Paste any JWT and the header and payload are
            decoded in real time, displayed with syntax highlighting. No button click required.
          </ArticleLi>
          <ArticleLi>
            <strong>Claims inspection:</strong> All standard registered claims (iss, sub, aud, exp,
            nbf, iat, jti) are labelled and explained. Timestamp claims are shown in both Unix and
            human-readable formats with relative time, plus expiry status badges.
          </ArticleLi>
          <ArticleLi>
            <strong>Signature verification:</strong> Supports HS256/HS384/HS512 (HMAC shared secret),
            RS256/RS384/RS512 (RSA public key), ES256/ES384/ES512 (ECDSA public key), and
            PS256/PS384/PS512 (RSA-PSS public key). All cryptographic operations use the browser's
            Web Crypto API.
          </ArticleLi>
          <ArticleLi>
            <strong>Raw Base64url view:</strong> Inspect the raw Base64url-encoded segments and their
            decoded UTF-8 output for low-level debugging.
          </ArticleLi>
          <ArticleLi>
            <strong>JWT anatomy guide:</strong> An inline reference explaining JWT structure, standard
            claim fields, and key security reminders.
          </ArticleLi>
          <ArticleLi>
            <strong>Dark and light mode:</strong> Respects system preferences and allows manual override.
          </ArticleLi>
        </ArticleUl>

        <ArticleCallout type="success">
          JWT Decode works fully offline. Once the page has loaded, disconnect from the internet —
          decoding and verification will continue to work perfectly. This confirms no token data
          is being transmitted anywhere.
        </ArticleCallout>

        <ArticleH2 id="editorial">Editorial Standards</ArticleH2>
        <ArticleP>
          The guides on this site are written to be technically accurate and practically useful.
          Content is reviewed against RFC 7519 (JSON Web Token), RFC 7515 (JSON Web Signature),
          RFC 7517 (JSON Web Key), and the OWASP JWT Security Cheat Sheet. Where security
          guidance conflicts with convenience, security takes precedence.
        </ArticleP>
        <ArticleP>
          Factual corrections are welcome. If you find a claim in any guide that appears to be
          incorrect or misleading, please send the specific page, the claim in question, and a
          supporting reference to{' '}
          <a href="mailto:hello@jwtdecode.app" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">hello@jwtdecode.app</a>.
          Corrections that improve accuracy for readers are taken seriously and acted on promptly.
        </ArticleP>
        <ArticleP>
          Content covers the JWT specification itself, the cryptographic algorithms defined in
          RFC 7518, the OpenID Connect specification, OAuth 2.0 best current practices
          (RFC 9700), and practical implementation guidance drawn from real-world deployments.
          Guides are chosen from the questions developers actually search for, and each one is
          checked against the relevant specification and library documentation — the aim is that
          every page is genuinely useful to someone implementing or debugging JWT-based authentication.
        </ArticleP>

        <ArticleH2 id="technical-approach">Technical Approach</ArticleH2>
        <ArticleP>
          The decision to run all processing in the browser was made at the outset and shapes
          every technical decision. JWT payloads often contain PII (names, email addresses,
          user IDs) and security-sensitive data (role assignments, session scopes). A tool that
          sends these to a server — even just to decode Base64url — creates an unnecessary
          exposure surface. The browser has everything needed to do this locally.
        </ArticleP>
        <ArticleP>
          Signature verification uses the{' '}
          <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">window.crypto.subtle</code>{' '}
          API, available in all modern browsers since 2017. Web Crypto supports HMAC (for HS256,
          HS384, HS512), RSA-PKCS1v15 (RS256, RS384, RS512), RSA-PSS (PS256, PS384, PS512),
          and ECDSA with P-256, P-384, and P-521 curves (ES256, ES384, ES512). The key and token
          are passed entirely within the browser's JavaScript sandbox — nothing is serialised
          over the network.
        </ArticleP>
        <ArticleP>
          The site is built with React 18 and server-side prerendered at build time for
          performance and SEO. Each guide page is rendered to static HTML before deployment,
          so there is no server-side rendering on the request path — the server simply serves
          static files. The React application hydrates in the browser and handles all
          interactivity locally.
        </ArticleP>

        <ArticleH2 id="educational">Educational Resource</ArticleH2>
        <ArticleP>
          Beyond the tool itself, this site serves as an educational resource for developers working
          with JWTs. The guides section covers JWT fundamentals, the three-part token structure,
          standard claim semantics, signature verification mechanics, algorithm selection, security
          best practices, common errors, and the distinction between decoding and validation.
        </ArticleP>

        <ArticleH2 id="privacy">Privacy Commitment</ArticleH2>
        <ArticleP>
          Token privacy is the founding principle of this tool. The implementation is deliberately
          designed so that token content cannot leak to the server:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>All JWT decoding is performed by JavaScript running in your browser</ArticleLi>
          <ArticleLi>All signature verification uses <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">window.crypto.subtle</code> — the browser's native cryptography engine</ArticleLi>
          <ArticleLi>No token data is sent to any backend, analytics service, or third party</ArticleLi>
          <ArticleLi>No token data is persisted to localStorage, sessionStorage, or cookies (only your light/dark theme choice is saved)</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The site uses Google AdSense for advertising and Google Analytics for page-view statistics.
          The AdSense and Google Analytics scripts run in the page itself, as on any site that uses them; the ads they display render inside iframes. Neither script is given your token: the decoder never passes token content to them and makes no network request with it. See the <a href="/privacy-policy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Privacy Policy</a> for full details.
        </ArticleP>

        <ArticleH2 id="contact">Contact</ArticleH2>
        <ArticleP>
          For questions, feedback, or to report an issue, visit the <a href="/contact" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Contact page</a>.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
