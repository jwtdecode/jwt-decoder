import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'JWT in Microservices: Gateway Validation, Token Propagation and Service-to-Service Auth',
  description: 'How JWTs work across microservices: gateway vs per-service validation, zero trust, token propagation vs RFC 8693 exchange, mTLS and SPIFFE, per-service audiences, JWKS caching and the phantom token pattern.',
  url: 'https://jwtdecode.app/jwt-in-microservices',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-in-microservices',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const APPROACHES: [pattern: string, whoValidates: string, tradeOff: string][] = [
  ['Gateway only', 'The API gateway; services trust it', 'Simple, but a compromised service can call others freely'],
  ['Gateway + every service', 'Gateway and each service independently', 'Zero trust; each service needs the JWKS and the checks'],
  ['Phantom token', 'Gateway swaps opaque token for a JWT inward', 'Opaque outside, JWT inside; revocation stays easy'],
  ['Token exchange (RFC 8693)', 'Each hop gets a narrowed token', 'Least privilege per call; needs an authorisation server'],
];

export default function JwtMicroservicesPage() {
  return (
    <>
      <SEOHead
        title="JWT in Microservices: Architecture and Patterns"
        description="JWT in microservices: gateway vs per-service validation, zero trust, token propagation vs RFC 8693 token exchange, per-service audiences and JWKS caching."
        path="/jwt-in-microservices"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in Microservices' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/what-is-jwks', label: 'What is JWKS', description: 'The key set every service fetches to verify signatures.' },
          { to: '/jwt-audience-claim', label: 'The aud Claim', description: 'How per-service audiences stop token replay between services.' },
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'Where the tokens come from and how issuance works.' },
          { to: '/jwt-security-best-practices', label: 'Security Best Practices', description: 'Algorithm allow-lists, key rotation and claim validation.' },
        ]}
      >
        <ArticleH1>JWT in Microservices: Gateway Validation, Token Propagation and Service-to-Service Auth</ArticleH1>

        <ArticleIntroBox>
          JWTs suit microservices because verification needs no shared session store: any service holding the
          issuer's public key can check a token locally. The real design questions are who validates it, how it
          travels between services, and how services prove their own identity to each other. The short answers:
          validate at the gateway <em>and</em> in every service (zero trust, don't trust the network); prefer
          <strong> token exchange</strong> (RFC 8693) over blindly forwarding the user's token when a call needs
          narrower rights; give each service its own <ArticleCode>aud</ArticleCode> so a token for one cannot be
          replayed at another; authenticate service-to-service calls with mTLS or client-credentials tokens, with
          SPIFFE as the standard for workload identity; and cache JWKS with a bounded lifetime so verification
          stays fast without going stale on key rotation. This guide covers each, with a diagram of the request
          path.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-microservices-architecture">JWT Microservices Architecture at a Glance</ArticleH2>
        <ArticleP>
          A JWT-based microservices setup has three moving parts: an <strong>authorisation server</strong> (often
          your OIDC provider) that issues tokens and publishes a <ArticleCode>jwks_uri</ArticleCode>; an
          <strong> API gateway</strong> that is the single ingress; and the <strong>services</strong> behind it.
          The client authenticates once, receives a token, and sends it on every call. The gateway and services
          verify the signature against the authorisation server's public keys, no call back to the issuer per
          request.
        </ArticleP>
        <ArticlePre lang="text">{`          issues tokens, publishes JWKS
        +---------------------------+
        |   Authorisation server    |  <----  /.well-known/openid-configuration
        +---------------------------+           jwks_uri (public keys)
             ^                     \\  (JWKS fetched + cached by verifiers)
   login /  |                      \\_______________________
   token    |                              |               |
        +--------+   JWT (aud=gateway)  +--------+      +--------+
 client |        | ------------------>  |Gateway | ...  |  ...   |
        +--------+                      +--------+      +--------+
                                          |  validates, then propagates
                                          |  or exchanges the token
                    aud=orders  v         v  aud=billing
                            +---------+   +---------+
                            | Orders  |-->| Billing |   each service validates again
                            +---------+   +---------+   (zero trust)`}</ArticlePre>

        <ArticleH2 id="jwt-api-gateway-validation">JWT Validation: API Gateway vs Every Service</ArticleH2>
        <ArticleP>
          The gateway is the natural place for a first, coarse validation: reject anything unsigned, expired or
          malformed before it reaches the mesh, and strip client-supplied headers that could spoof identity. The
          tempting next step, "the gateway checked it, so services can trust the network", is the mistake zero
          trust exists to prevent. If any one service is compromised, or a bug lets an internal caller reach a
          service directly, unchecked services will honour whatever they receive.
        </ArticleP>
        <ArticleP>
          The zero-trust position is that every service validates every token it receives: signature against the
          JWKS, <ArticleCode>exp</ArticleCode>, <ArticleCode>iss</ArticleCode>, and its own <ArticleCode>aud</ArticleCode>.
          Verification is a signature check and a few comparisons, cheap enough to do per request. The gateway
          still earns its place by centralising rate limiting, coarse authz, and the swap to internal tokens
          described below.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Pattern</th>
                <th className="px-3 py-2 font-semibold">Who validates</th>
                <th className="px-3 py-2 font-semibold">Trade-off</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {APPROACHES.map(([pattern, who, tradeOff]) => (
                <tr key={pattern} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{pattern}</td>
                  <td className="px-3 py-2">{who}</td>
                  <td className="px-3 py-2">{tradeOff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="jwt-between-microservices">JWT Between Microservices: Propagation vs Exchange</ArticleH2>
        <ArticleP>
          When Orders calls Billing on behalf of a user, two models exist for the token on that internal hop.
        </ArticleP>
        <ArticleH3 id="token-propagation">Token propagation (pass-through)</ArticleH3>
        <ArticleP>
          Orders forwards the user's token as received. Simple, and the user's identity flows end to end, but the
          token was minted for the whole request: every downstream service sees the user's full set of scopes,
          and a token stolen from one hop works at every hop. It also fails audience checks if each service
          expects its own <ArticleCode>aud</ArticleCode>, which pushes people towards a single shared audience,
          weakening the very control that stops replay.
        </ArticleP>
        <ArticleH3 id="token-exchange">Token exchange (RFC 8693)</ArticleH3>
        <ArticleP>
          Instead of forwarding, Orders exchanges the incoming token at the authorisation server for a new one
          scoped to exactly what Billing needs, addressed to Billing's audience. RFC 8693, OAuth 2.0 Token
          Exchange, standardises this: the caller presents a <ArticleCode>subject_token</ArticleCode> and asks for
          a token with a specific <ArticleCode>audience</ArticleCode> and reduced <ArticleCode>scope</ArticleCode>,
          and the may-act (<ArticleCode>act</ArticleCode>) claim records the delegation chain. The result is least
          privilege per call and audience isolation, at the cost of a round trip to the authorisation server on
          the exchange (cacheable for the token's lifetime) and more moving parts. Use propagation for simple
          read paths, exchange where a downstream service should not receive the user's full authority.
        </ArticleP>

        <ArticleH2 id="jwt-microservices-audience">A Distinct Audience Per Service</ArticleH2>
        <ArticleP>
          The <ArticleCode>aud</ArticleCode> claim names who a token is for, and each service must reject tokens
          whose <ArticleCode>aud</ArticleCode> is not its own identifier. This is what stops a token intended for
          the profile service being replayed against the payments service. It only works if tokens are minted
          per audience, which is the strongest argument for token exchange over pass-through in sensitive paths.
          The mechanics of matching, and the array-vs-string subtlety, are in{' '}
          <a href="/jwt-audience-claim" className={LINK}>the aud claim guide</a>. RFC 9068 (JWT access tokens)
          additionally recommends a <ArticleCode>typ</ArticleCode> of <ArticleCode>at+jwt</ArticleCode> so an ID
          token can never be substituted for an access token between services.
        </ArticleP>

        <ArticleH2 id="jwt-microservices-service-auth">Service-to-Service Authentication</ArticleH2>
        <ArticleP>
          A user token answers "who is the user"; it does not answer "is this really the Orders service calling".
          For calls with no user, a scheduled job, an internal event handler, services authenticate as
          themselves. Three common mechanisms:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Client credentials (OAuth 2.0)</strong>: a service authenticates to the authorisation server with its own credentials and receives a JWT with a <ArticleCode>sub</ArticleCode> identifying the service, not a user. Standard, and fits the same verification path as user tokens.</ArticleLi>
          <ArticleLi><strong>mTLS</strong>: each service presents a client certificate on the TLS connection, so the transport itself proves identity. Often terminated at a service mesh sidecar so application code stays unchanged. RFC 8705 also allows binding a JWT access token to the client certificate.</ArticleLi>
          <ArticleLi><strong>SPIFFE / SPIRE</strong>: SPIFFE gives each workload a verifiable identity (a SPIFFE ID such as <ArticleCode>spiffe://example.org/orders</ArticleCode>) delivered as an X.509 certificate (X509-SVID) or a JWT (JWT-SVID). SPIRE is the reference implementation that attests and rotates these automatically. It is the emerging standard for machine identity behind mTLS.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          User identity and service identity are different questions, and a robust system answers both: the JWT
          carries the user, mTLS or a client-credentials token carries the workload. The difference from a plain
          API key is covered in <a href="/jwt-vs-api-key" className={LINK}>JWT vs API key</a>.
        </ArticleP>

        <ArticleH2 id="phantom-token-pattern">The Phantom Token Pattern: Opaque Outside, JWT Inside</ArticleH2>
        <ArticleP>
          A JWT in the browser leaks its claims to anyone who decodes it and cannot be revoked without extra
          machinery. The phantom token pattern keeps the best of both worlds: the client holds an <em>opaque</em>
          reference token; the gateway calls the authorisation server's introspection endpoint (RFC 7662) or
          otherwise looks it up, and injects a <em>JWT</em> for internal calls. Externally you get easy
          revocation (invalidate the opaque token and it is dead at once) and no leaked claims; internally
          services get a self-contained JWT they can verify locally without calling the issuer per request. The
          related <strong>split token</strong> variant sends only the signature to the client and reassembles the
          JWT at the gateway. Both trade a lookup at the edge for revocability, which is often the right
          exchange; contrast with <a href="/jwt-logout-and-revocation" className={LINK}>JWT logout and
          revocation</a> where the JWT reaches the client directly.
        </ArticleP>

        <ArticleH2 id="jwt-microservices-jwks-caching">JWKS Caching and Key Rotation</ArticleH2>
        <ArticleP>
          Every verifying service fetches the issuer's public keys from its <ArticleCode>jwks_uri</ArticleCode>
          (see <a href="/what-is-jwks" className={LINK}>what is JWKS</a>) and caches them, otherwise it would call
          the issuer on every request and couple every service's availability to it. The caching rules that keep
          this both fast and correct:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Cache by <ArticleCode>kid</ArticleCode></strong>: pick the key whose <ArticleCode>kid</ArticleCode> matches the token header, so rotation (a new key alongside the old) works without a flush.</ArticleLi>
          <ArticleLi><strong>Bound the cache age</strong>: keep keys for minutes, not forever, so a retired key eventually leaves the cache. Libraries like <ArticleCode>jose</ArticleCode> default to a 10-minute cache and a 30-second cooldown before re-fetching on an unknown key.</ArticleLi>
          <ArticleLi><strong>Re-fetch on an unknown <ArticleCode>kid</ArticleCode>, with a cooldown</strong>: when a token arrives signed by a key you have not seen, fetch once, but rate-limit that fetch so a flood of bad <ArticleCode>kid</ArticleCode>s cannot hammer the issuer.</ArticleLi>
          <ArticleLi><strong>Overlap keys during rotation</strong>: publish the new key before signing with it and retire the old one only after all outstanding tokens signed by it have expired.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Stale JWKS is the most common cause of "signature suddenly fails after a rotation": the verifier cached
          the old set and did not re-fetch on the new <ArticleCode>kid</ArticleCode>. You can confirm which
          <ArticleCode> kid</ArticleCode> a token names by decoding its header in{' '}
          <a href="/" className={LINK}>the jwtdecode.app decoder</a>, which runs locally in the browser, then
          check that <ArticleCode>kid</ArticleCode> is present at the <ArticleCode>jwks_uri</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="jwt-microservices-clock-skew">Clock Skew Across Services</ArticleH2>
        <ArticleP>
          Time claims are compared against each verifier's own clock, and hosts drift. A service running a minute
          fast rejects freshly issued tokens as expired; one running slow rejects tokens as not yet valid via
          <ArticleCode> nbf</ArticleCode>. Run NTP everywhere and allow a small leeway, typically 30 to 60 seconds,
          in each verifier's configuration. In a mesh of many services this is not optional: without it, a single
          badly synced node produces intermittent 401s that are painful to trace.
        </ArticleP>

        <ArticleH2 id="spring-boot-microservices">JWT Authentication in Microservices with Spring Boot</ArticleH2>
        <ArticleP>
          In Spring, each service is an OAuth2 resource server. Point it at the issuer and it discovers the
          <ArticleCode> jwks_uri</ArticleCode>, fetches and caches the keys, and validates the signature,
          <ArticleCode> exp</ArticleCode> and <ArticleCode>iss</ArticleCode> automatically. Set each service's own
          audience so tokens for another service are rejected.
        </ArticleP>
        <ArticlePre lang="yaml">{`# application.yml on the Orders service
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com/
          audiences:
            - orders-api   # reject tokens whose aud is not this service`}</ArticlePre>
        <ArticleP>
          The <ArticleCode>audiences</ArticleCode> property has validated the <ArticleCode>aud</ArticleCode> claim
          since Spring Boot 2.7; for anything more (a token-version check, a denylist) add an
          <ArticleCode> OAuth2TokenValidator&lt;Jwt&gt;</ArticleCode>. Verify exact property names against your
          Spring Boot version. The full setup is in{' '}
          <a href="/jwt-authentication-spring-boot" className={LINK}>JWT authentication in Spring Boot</a>.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Across microservices, validate JWTs at the gateway and again in every service (zero trust), and give
          each service its own <ArticleCode>aud</ArticleCode>. Forward the user's token only for simple paths;
          use RFC 8693 token exchange to hand downstream services a narrower token for their audience. Prove
          workload identity separately with mTLS or client-credentials tokens, standardised by SPIFFE. Keep the
          user's raw JWT off the client with the phantom token pattern when you need easy revocation, and cache
          JWKS with a bounded age and a per-<ArticleCode>kid</ArticleCode> re-fetch so rotation is seamless.
          Finally, run NTP and allow a little clock leeway, because a single skewed node produces 401s that look
          like a token bug and are not.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
