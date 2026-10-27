import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT vs SAML: Tokens, Assertions and Single Sign-On Compared',
  description: 'SAML 2.0 assertions are signed XML documents used for browser single sign-on; JWTs are compact signed JSON used by OpenID Connect and OAuth. Compare formats, signatures, SSO flows, security pitfalls and where each is used today.',
  url: 'https://jwtdecode.app/jwt-vs-saml',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-vs-saml',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const COMPARISON: [aspect: string, saml: string, jwt: string][] = [
  ['What it is', 'A full federation protocol (SAML 2.0, OASIS, 2005) plus its assertion format', 'A token format (RFC 7519); the protocol is usually OpenID Connect or OAuth 2.0'],
  ['Encoding', 'XML, Base64-encoded when sent through the browser', 'JSON, Base64url-encoded, three dot-separated segments'],
  ['Signature', 'XML Signature (XML-DSig) over a canonicalised XML element', 'JWS (RFC 7515) over the exact encoded header and payload bytes'],
  ['Encryption', 'XML Encryption: EncryptedAssertion', 'JWE (RFC 7516), rarely used for ID tokens'],
  ['Key distribution', 'X.509 certificate in SAML metadata XML', 'JWKS endpoint advertised by the OIDC discovery document'],
  ['Typical size', 'Several KB; too large for an HTTP header', 'Usually under 1 KB; designed for headers and URLs'],
  ['Transport', 'Browser redirects and auto-submitting POST forms', 'Token endpoint responses, then Authorization headers'],
  ['Primary use', 'Enterprise web SSO', 'Consumer and enterprise sign-on, mobile and SPA apps, API access'],
  ['API and mobile support', 'Poor: built for browser-to-web-app flows', 'Native: tokens are sent directly to APIs'],
];

const CLAIM_MAP: [saml: string, jwt: string][] = [
  ['<Issuer>', 'iss'],
  ['<Subject><NameID>', 'sub'],
  ['<AudienceRestriction><Audience>', 'aud'],
  ['<Conditions NotBefore>', 'nbf'],
  ['<Conditions NotOnOrAfter>', 'exp'],
  ['<Assertion IssueInstant>', 'iat'],
  ['<Assertion ID>', 'jti'],
  ['<AuthnStatement AuthnInstant>', 'auth_time (OIDC)'],
  ['<AuthnContextClassRef>', 'acr (OIDC)'],
  ['<SubjectConfirmationData InResponseTo>', 'nonce (OIDC, roughly equivalent)'],
  ['<AttributeStatement>', 'Custom or standard claims (email, name, groups)'],
];

export default function JwtVsSamlPage() {
  return (
    <>
      <SEOHead
        title="JWT vs SAML: Tokens, Assertions and SSO"
        description="JWT vs SAML compared: XML assertions signed with XML-DSig against compact JSON ID tokens, how each drives SSO, their security pitfalls and where each fits."
        path="/jwt-vs-saml"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT vs SAML' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'How ID tokens and access tokens work in OpenID Connect.' },
          { to: '/jwt-vs-oauth', label: 'JWT vs OAuth', description: 'Token format versus authorisation framework.' },
          { to: '/jwt-claims-explained', label: 'JWT Claims Explained', description: 'iss, sub, aud, exp and the rest, claim by claim.' },
          { to: '/jwt-attacks-and-vulnerabilities', label: 'JWT Attacks & Vulnerabilities', description: 'The JWT-side equivalents of SAML signature attacks.' },
        ]}
      >
        <ArticleH1>JWT vs SAML: Tokens, Assertions and Single Sign-On</ArticleH1>

        <ArticleIntroBox>
          SAML 2.0 and JWT are both ways for an identity provider to tell an application &ldquo;this user has
          authenticated, and here are their attributes&rdquo; in a form the application can verify. SAML does it with an
          XML assertion signed using XML Signature and delivered through the browser. JWT does it with a compact JSON
          token signed using JWS; in single sign-on that token is the OpenID Connect ID token. Strictly, SAML is a whole
          protocol and JWT is only a token format, so the like-for-like comparison is SAML vs OpenID Connect.
          <br /><br />
          In practice: SAML remains the standard for enterprise web SSO into SaaS applications, and every serious
          identity provider supports it. JWT-based OpenID Connect is the default for new applications, mobile and
          single-page apps, and anything that also needs to call APIs. Many organisations run both.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-vs-saml-token">JWT vs SAML Token: Format Compared</ArticleH2>
        <ArticleP>
          A SAML assertion and an OIDC ID token carry almost the same information. Here is an abbreviated SAML 2.0
          assertion, with namespaces and most of the signature trimmed:
        </ArticleP>
        <ArticlePre>{`<saml:Assertion ID="_a75adf55" IssueInstant="2026-09-24T09:00:00Z" Version="2.0">
  <saml:Issuer>https://idp.example.com/saml</saml:Issuer>
  <ds:Signature>
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <ds:Reference URI="#_a75adf55">...</ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>kJ3x...</ds:SignatureValue>
  </ds:Signature>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">ada@example.com</saml:NameID>
    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
      <saml:SubjectConfirmationData InResponseTo="_req42" NotOnOrAfter="2026-09-24T09:05:00Z"
        Recipient="https://app.example.com/saml/acs"/>
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions NotBefore="2026-09-24T08:59:30Z" NotOnOrAfter="2026-09-24T09:05:00Z">
    <saml:AudienceRestriction><saml:Audience>https://app.example.com</saml:Audience></saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="2026-09-24T09:00:00Z" SessionIndex="_s1"/>
  <saml:AttributeStatement>
    <saml:Attribute Name="groups"><saml:AttributeValue>engineering</saml:AttributeValue></saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`}</ArticlePre>
        <ArticleP>
          And the decoded payload of an equivalent OpenID Connect ID token:
        </ArticleP>
        <ArticlePre>{`{
  "iss": "https://idp.example.com",
  "sub": "00u1a2b3c4",
  "aud": "app-client-id",
  "iat": 1790240400,
  "exp": 1790240700,
  "auth_time": 1790240400,
  "nonce": "n-0S6_WzA2Mj",
  "email": "ada@example.com",
  "groups": ["engineering"]
}`}</ArticlePre>
        <ArticleP>
          The ID token is then signed as a JWS and serialised as <ArticleCode>header.payload.signature</ArticleCode>. The
          fields map closely:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">SAML assertion</th>
                <th className="px-3 py-2 font-semibold">JWT / OIDC claim</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {CLAIM_MAP.map(([saml, jwt]) => (
                <tr key={saml} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{saml}</td>
                  <td className="px-3 py-2 font-mono">{jwt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          Each JWT claim is described in <a href="/jwt-claims-explained" className={LINK}>JWT claims explained</a>. The validation
          rules are the same idea on both sides: right issuer, right audience, inside the time window, signature valid.
        </ArticleP>

        <ArticleH2 id="jwt-vs-saml-authentication">JWT vs SAML Authentication: The Full Comparison</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">SAML 2.0</th>
                <th className="px-3 py-2 font-semibold">JWT (via OpenID Connect)</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {COMPARISON.map(([aspect, saml, jwt]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{saml}</td>
                  <td className="px-3 py-2">{jwt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="sso-jwt-vs-saml">SSO With JWT vs SAML: How the Flows Differ</ArticleH2>
        <ArticleH3 id="saml-sso-flow">SAML SP-initiated SSO</ArticleH3>
        <ArticleUl>
          <ArticleLi>The user opens the application (the service provider). It builds an <ArticleCode>AuthnRequest</ArticleCode> and redirects the browser to the identity provider, usually with the HTTP-Redirect binding.</ArticleLi>
          <ArticleLi>The user authenticates at the IdP.</ArticleLi>
          <ArticleLi>The IdP returns an HTML page containing an auto-submitting form that POSTs a Base64-encoded <ArticleCode>SAMLResponse</ArticleCode> to the application&rsquo;s Assertion Consumer Service (ACS) URL.</ArticleLi>
          <ArticleLi>The application verifies the XML signature, checks audience, recipient, time conditions and <ArticleCode>InResponseTo</ArticleCode>, then creates its own session, typically a cookie.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          SAML also supports IdP-initiated SSO, where the user starts from a portal tile and the IdP posts an
          unsolicited response. It is convenient but removes the request binding that protects against replayed
          and injected responses.
        </ArticleP>
        <ArticleH3 id="oidc-sso-flow">OpenID Connect SSO</ArticleH3>
        <ArticleUl>
          <ArticleLi>The application redirects the browser to the provider&rsquo;s <ArticleCode>/authorize</ArticleCode> endpoint with <ArticleCode>scope=openid</ArticleCode>, a <ArticleCode>state</ArticleCode>, a <ArticleCode>nonce</ArticleCode> and a PKCE challenge.</ArticleLi>
          <ArticleLi>The user authenticates; the browser comes back with a short-lived authorisation code.</ArticleLi>
          <ArticleLi>The application exchanges the code at the token endpoint over a direct back-channel call and receives an ID token (a JWT) and usually an access token.</ArticleLi>
          <ArticleLi>The application verifies the ID token against the provider&rsquo;s JWKS and creates its session.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The structural difference: in SAML the token travels through the browser, so its signature is the only
          protection. In the OIDC code flow the token comes from a server-to-server call over TLS, which removes a whole
          class of injection problems. The access token from the same flow can then be used to call APIs, which SAML
          has no native answer for. The OIDC side is covered in <a href="/jwt-in-oauth2-and-openid-connect" className={LINK}>JWTs in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>

        <ArticleH2 id="security-differences">Security: XML Signatures vs JWS</ArticleH2>
        <ArticleP>
          Both formats have a history of implementation bugs, and they differ in kind.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>SAML</strong>: XML Signature signs one element inside a larger document, after canonicalisation. That creates XML Signature Wrapping attacks, where an attacker moves the signed element and inserts an unsigned one that the application reads instead. XML parsers add XXE and entity-expansion risks, and comment handling in <ArticleCode>NameID</ArticleCode> has caused authentication bypasses in several libraries.</ArticleLi>
          <ArticleLi><strong>JWT</strong>: the signature covers the exact bytes of the header and payload, so there is no wrapping problem. The classic flaws are in header trust instead: accepting <ArticleCode>alg: none</ArticleCode>, algorithm confusion between RSA and HMAC, and unvalidated <ArticleCode>kid</ArticleCode> or <ArticleCode>jku</ArticleCode> values. See <a href="/none-algorithm-vulnerability" className={LINK}>the none algorithm vulnerability</a> and <a href="/jwt-attacks-and-vulnerabilities" className={LINK}>JWT attacks and vulnerabilities</a>.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          For both, the defence is the same: use a mature, maintained library, never parse or verify signatures by hand,
          pin the expected algorithm and signing key, and validate audience, issuer and time conditions on every token.
        </ArticleCallout>

        <ArticleH2 id="validating-saml-vs-jwt">Validating a SAML Assertion vs a JWT</ArticleH2>
        <ArticleP>
          The checks a relying party must run are close to identical, which is a useful way to see that the two
          formats solve the same problem. For each item, the SAML check is on the left and the JWT check on the right.
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Signature</strong>: verify the XML signature with the IdP certificate from metadata, and confirm the signed element is the one you read / verify the JWS with the key from the JWKS matching <ArticleCode>kid</ArticleCode>, using a pinned algorithm.</ArticleLi>
          <ArticleLi><strong>Issuer</strong>: <ArticleCode>Issuer</ArticleCode> equals the configured IdP entity ID / <ArticleCode>iss</ArticleCode> equals the configured issuer URL, exactly.</ArticleLi>
          <ArticleLi><strong>Audience</strong>: your SP entity ID appears in <ArticleCode>AudienceRestriction</ArticleCode> / your client ID appears in <ArticleCode>aud</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Time window</strong>: now is between <ArticleCode>NotBefore</ArticleCode> and <ArticleCode>NotOnOrAfter</ArticleCode> / now is before <ArticleCode>exp</ArticleCode> and not before <ArticleCode>nbf</ArticleCode>, with a small clock-skew allowance on both.</ArticleLi>
          <ArticleLi><strong>Binding to your request</strong>: <ArticleCode>InResponseTo</ArticleCode> matches the AuthnRequest you sent and <ArticleCode>Recipient</ArticleCode> matches your ACS URL / <ArticleCode>nonce</ArticleCode> matches the one you stored before redirecting.</ArticleLi>
          <ArticleLi><strong>Replay</strong>: remember assertion IDs until they expire and reject repeats / the code flow makes ID token replay much harder, and <ArticleCode>jti</ArticleCode> can be tracked where needed.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The JWT side of this list is covered claim by claim in the <a href="/jwt-verification-guide" className={LINK}>JWT verification guide</a>,
          and the time checks, including clock skew, in <a href="/common-jwt-errors-and-fixes#clock-skew" className={LINK}>common JWT errors</a>.
          On the SAML side, the most important habit is to read attributes only from the element whose signature you
          verified, never by searching the whole document.
        </ArticleP>

        <ArticleH2 id="jwt-and-saml">Using JWT and SAML Together</ArticleH2>
        <ArticleP>
          The two are not mutually exclusive, and mixed estates are common:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Identity brokering</strong>: a broker such as Keycloak or a hosted identity platform accepts SAML from a customer&rsquo;s corporate IdP and issues OIDC ID tokens and JWT access tokens to your applications. Your apps only ever see JWTs.</ArticleLi>
          <ArticleLi><strong>SAML bearer grant</strong>: RFC 7522 lets a client exchange a SAML 2.0 assertion at an OAuth token endpoint for an access token, which may be a JWT.</ArticleLi>
          <ArticleLi><strong>Token exchange</strong>: RFC 8693 defines token type identifiers for both SAML 1.1 and SAML 2.0 assertions alongside JWTs, so a security token service can convert between them.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="where-each-is-used">Where JWT and SAML Are Used Today</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>SAML</strong>: workforce SSO into SaaS products, where enterprise customers expect a SAML option from Okta, Microsoft Entra ID, Google Workspace or ADFS; higher-education and research federations; many government and legacy line-of-business systems.</ArticleLi>
          <ArticleLi><strong>JWT / OIDC</strong>: consumer sign-in (Google, Apple, Microsoft accounts), mobile and single-page apps, B2B SaaS built in the last decade, API authorisation, and service-to-service identity.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          If you are building a new B2B application, the pragmatic answer is usually to implement OIDC yourself and
          support SAML through a broker or identity platform, because some enterprise customers will require it. If you
          only need to call APIs, SAML is the wrong tool. To inspect an ID token or access token from either route, paste
          it into the <a href="/" className={LINK}>jwtdecode.app decoder</a>, which decodes it in the browser without sending it anywhere.
        </ArticleP>

        <ArticleH2 id="jwt-vs-oauth-vs-saml">JWT vs OAuth vs SAML</ArticleH2>
        <ArticleP>
          The three sit at different layers. SAML is a federation protocol for authentication with its own XML
          token. OAuth 2.0 is an authorisation framework for API access and does not define authentication at all.
          JWT is a token format used by OpenID Connect (for authentication) and by many OAuth deployments (for access
          tokens). A modern stack typically pairs OIDC and OAuth with JWTs; SAML sits alongside for enterprise SSO.
          <a href="/jwt-vs-oauth" className={LINK}> JWT vs OAuth</a> covers the second half of that picture.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>SAML is a complete SSO protocol with XML assertions; JWT is a token format, used for SSO through OpenID Connect.</ArticleLi>
          <ArticleLi>SAML assertions are signed with XML-DSig and delivered through browser POSTs; JWTs are signed with JWS and fit in HTTP headers.</ArticleLi>
          <ArticleLi>The claims map almost one-to-one: Issuer to iss, NameID to sub, Audience to aud, NotOnOrAfter to exp.</ArticleLi>
          <ArticleLi>SAML remains the enterprise SSO standard; OIDC with JWTs is the default for new, mobile and API-driven applications.</ArticleLi>
          <ArticleLi>Brokers, the SAML bearer grant (RFC 7522) and token exchange (RFC 8693) let the two coexist.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
