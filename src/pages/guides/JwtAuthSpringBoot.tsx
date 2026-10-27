import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Spring Boot JWT Authentication with Spring Security OAuth2 Resource Server',
  description: 'How to add JWT authentication to a Spring Boot 4 or 3 API with Spring Security: the resource server starter, issuer-uri, SecurityFilterChain, roles and scopes, issuing tokens with NimbusJwtEncoder or jjwt.',
  url: 'https://jwtdecode.app/jwt-authentication-spring-boot',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-authentication-spring-boot',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LIBS: [aspect: string, nimbus: string, jjwt: string][] = [
  ['Used by', 'Spring Security itself (NimbusJwtDecoder, NimbusJwtEncoder)', 'Your own code, directly'],
  ['Comes with the Boot starter', 'Yes, via spring-security-oauth2-jose', 'No, add jjwt-api, jjwt-impl and jjwt-jackson'],
  ['JWKS fetching and caching', 'Built in (issuer-uri, jwk-set-uri)', 'Not built in; you supply the key or a locator'],
  ['JWE (encrypted tokens)', 'Supported by Nimbus; not wired up by the resource server', 'Supported'],
  ['Best fit', 'Validating tokens from an identity provider; issuing tokens inside Spring', 'Small services that sign and parse their own HS256/RS256 tokens'],
];

export default function JwtAuthSpringBootPage() {
  return (
    <>
      <SEOHead
        title="Spring Boot JWT Authentication: Resource Server"
        description="Spring Boot JWT authentication with Spring Security's resource server: Maven starter, issuer-uri, SecurityFilterChain, role mapping, and jjwt vs Nimbus."
        path="/jwt-authentication-spring-boot"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in Spring Boot' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-in-oauth2-and-openid-connect', label: 'JWTs in OAuth 2.0 & OIDC', description: 'Where access tokens, ID tokens and JWKS fit in the flow.' },
          { to: '/jwt-scopes-vs-roles', label: 'JWT Scopes vs Roles', description: 'Why SCOPE_ and ROLE_ authorities mean different things.' },
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'What a correct signature and claim check involves.' },
          { to: '/jwt-authentication-aspnet-core', label: 'JWT in ASP.NET Core', description: 'The same pattern on .NET with AddJwtBearer.' },
        ]}
      >
        <ArticleH1>Spring Boot JWT Authentication with Spring Security's OAuth2 Resource Server</ArticleH1>

        <ArticleIntroBox>
          The supported way to add JWT authentication to a Spring Boot API is Spring Security's OAuth2 Resource
          Server. Add the resource server starter, set <ArticleCode>spring.security.oauth2.resourceserver.jwt.issuer-uri</ArticleCode>,
          and declare a <ArticleCode>SecurityFilterChain</ArticleCode> with
          <ArticleCode>.oauth2ResourceServer(o -&gt; o.jwt(Customizer.withDefaults()))</ArticleCode>. Spring then
          reads the bearer token, fetches the issuer's public keys, checks the signature, <ArticleCode>iss</ArticleCode>,
          <ArticleCode>exp</ArticleCode> and <ArticleCode>nbf</ArticleCode>, and turns scopes into
          <ArticleCode>SCOPE_</ArticleCode> authorities. You do not need a hand-written <ArticleCode>OncePerRequestFilter</ArticleCode>.
          This guide covers the Maven dependency (renamed in Spring Boot 4), configuration, roles, issuing your own
          tokens, and the jjwt versus Nimbus question. Versions checked: Spring Boot 4.1.1 and Spring Security 7.1.1 reference docs, jjwt 0.13.0.
        </ArticleIntroBox>

        <ArticleH2 id="how-does-jwt-work-in-spring-boot">How Does JWT Work in Spring Boot?</ArticleH2>
        <ArticleP>
          A client sends <ArticleCode>Authorization: Bearer &lt;token&gt;</ArticleCode>. With the resource server
          configured, the request passes through this chain:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>BearerTokenAuthenticationFilter</strong> extracts the token and hands a <ArticleCode>BearerTokenAuthenticationToken</ArticleCode> to the <ArticleCode>AuthenticationManager</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>JwtAuthenticationProvider</strong> calls a <ArticleCode>JwtDecoder</ArticleCode>, which parses the token, selects the key by <ArticleCode>kid</ArticleCode>, verifies the signature and runs the claim validators (timestamps with 60 seconds of default clock skew, plus issuer when configured).</ArticleLi>
          <ArticleLi><strong>JwtAuthenticationConverter</strong> maps claims to granted authorities. By default it reads <ArticleCode>scope</ArticleCode> or <ArticleCode>scp</ArticleCode> and prefixes each value with <ArticleCode>SCOPE_</ArticleCode>.</ArticleLi>
          <ArticleLi>The result is a <ArticleCode>JwtAuthenticationToken</ArticleCode> whose principal is the decoded <ArticleCode>Jwt</ArticleCode>. Authorisation rules then run against its authorities.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Nothing is stored server side. Each request is authenticated from the token alone, which is why expiry and
          key rotation matter more than they do with sessions (see <a href="/jwt-vs-session-tokens" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT vs session tokens</a>).
        </ArticleP>

        <ArticleH2 id="jwt-spring-boot-dependency-maven">JWT Spring Boot Dependency (Maven)</ArticleH2>
        <ArticleP>
          Spring Boot 4.0 renamed several starters to line up with its new modules. The resource server starter is now
          <ArticleCode>spring-boot-starter-security-oauth2-resource-server</ArticleCode>. The old name,
          <ArticleCode>spring-boot-starter-oauth2-resource-server</ArticleCode>, still exists but the Boot 4.0 migration
          guide marks it deprecated. On Spring Boot 3.x, use the old name.
        </ArticleP>
        <ArticlePre lang="xml">{`<!-- Spring Boot 4.x -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webmvc</artifactId>  <!-- was spring-boot-starter-web -->
</dependency>

<!-- Spring Boot 3.x -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>`}</ArticlePre>
        <ArticleP>
          The starter pulls in <ArticleCode>spring-security-oauth2-resource-server</ArticleCode> and
          <ArticleCode>spring-security-oauth2-jose</ArticleCode>. The second one holds the Nimbus-based JWT decoding
          and encoding. You do not need a separate JWT library to validate tokens.
        </ArticleP>

        <ArticleH2 id="jwt-oauth2-spring-boot">JWT with OAuth2 in Spring Boot: Configure the Issuer</ArticleH2>
        <ArticleP>
          If your tokens come from an OAuth 2.0 or OpenID Connect provider (Keycloak, Okta, Auth0, Cognito, Entra ID,
          Spring Authorization Server), point Spring at the issuer:
        </ArticleP>
        <ArticlePre lang="yaml">{`spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://idp.example.com/realms/acme
          # optional: skip discovery and name the key set directly
          # jwk-set-uri: https://idp.example.com/realms/acme/protocol/openid-connect/certs
          audiences: https://api.example.com`}</ArticlePre>
        <ArticleP>
          With <ArticleCode>issuer-uri</ArticleCode>, Spring looks up the provider's metadata
          (<ArticleCode>/.well-known/openid-configuration</ArticleCode>, or the OAuth
          <ArticleCode>oauth-authorization-server</ArticleCode> metadata) when the first JWT arrives, reads
          <ArticleCode>jwks_uri</ArticleCode>, and validates every token's <ArticleCode>iss</ArticleCode> against the
          configured value. If you want to know what that key set looks like, see <a href="/what-is-jwks" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">what a JWKS is</a>.
        </ArticleP>
        <ArticleCallout type="warning">
          Set <ArticleCode>audiences</ArticleCode>. Issuer and signature checks prove the provider minted the token; only
          the <ArticleCode>aud</ArticleCode> check proves it was minted for your API. Without it, an access token issued
          to any other application in the same realm or tenant is accepted. See <a href="/jwt-audience-claim" className="underline underline-offset-2">the audience claim</a>.
        </ArticleCallout>
        <ArticleP>
          Spring Boot also accepts <ArticleCode>public-key-location</ArticleCode> for a single PEM public key, and it
          backs off completely if you declare your own <ArticleCode>JwtDecoder</ArticleCode> bean, for example
          <ArticleCode>NimbusJwtDecoder.withIssuerLocation(issuer).build()</ArticleCode> or
          <ArticleCode>NimbusJwtDecoder.withJwkSetUri(uri).build()</ArticleCode>.
        </ArticleP>

        <ArticleH2 id="jwt-spring-security-filter-chain">JWT with Spring Security: the SecurityFilterChain</ArticleH2>
        <ArticlePre lang="java">{`import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/orders/**").hasAuthority("SCOPE_orders.read")
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
        return http.build();
    }
}`}</ArticlePre>
        <ArticleP>
          In a controller, take the decoded token as the principal rather than parsing the header yourself:
        </ArticleP>
        <ArticlePre lang="java">{`@GetMapping("/me")
Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
    return Map.of("sub", jwt.getSubject(), "scopes", jwt.getClaimAsString("scope"));
}`}</ArticlePre>
        <ArticleP>
          When validation fails, the resource server returns 401 with a <ArticleCode>WWW-Authenticate: Bearer</ArticleCode>
          header that carries an <ArticleCode>error</ArticleCode> and description. When a valid token lacks the needed
          authority, it returns 403. For a quick look at the claims your API actually received, paste the token into
          <a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> the jwtdecode.app decoder</a>. It decodes locally in the browser.
        </ArticleP>

        <ArticleH2 id="jwt-role-based-authentication-spring-boot">JWT Role-Based Authentication in Spring Boot</ArticleH2>
        <ArticleP>
          By default only scopes become authorities, so <ArticleCode>hasRole("ADMIN")</ArticleCode> fails even when the
          token plainly contains <ArticleCode>"roles": ["ADMIN"]</ArticleCode>. <ArticleCode>hasRole</ArticleCode> looks
          for the authority <ArticleCode>ROLE_ADMIN</ArticleCode>. Tell the converter which claim to read and which prefix to use:
        </ArticleP>
        <ArticlePre lang="java">{`@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
    roles.setAuthoritiesClaimName("roles");   // top-level claim holding a list or space-separated string
    roles.setAuthorityPrefix("ROLE_");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(roles);
    return converter;
}`}</ArticlePre>
        <ArticleP>
          Spring Boot picks up this bean automatically. Two points catch people out:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>You lose scopes when you replace the converter.</strong> The converter above yields only <ArticleCode>ROLE_</ArticleCode> authorities. If you need both, write a <ArticleCode>Converter&lt;Jwt, Collection&lt;GrantedAuthority&gt;&gt;</ArticleCode> that combines a default <ArticleCode>JwtGrantedAuthoritiesConverter</ArticleCode> with your role mapping.</ArticleLi>
          <ArticleLi><strong>Nested claims need custom code.</strong> <ArticleCode>setAuthoritiesClaimName</ArticleCode> reads a top-level claim. Keycloak puts realm roles in <ArticleCode>realm_access.roles</ArticleCode>, so map it yourself:</ArticleLi>
        </ArticleUl>
        <ArticlePre lang="java">{`converter.setJwtGrantedAuthoritiesConverter(jwt -> {
    Map<String, Object> realm = jwt.getClaimAsMap("realm_access");
    Collection<?> names = realm == null ? List.of() : (Collection<?>) realm.getOrDefault("roles", List.of());
    return names.stream()
        .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
        .toList();
});`}</ArticlePre>
        <ArticleP>
          Scopes describe what the client application is allowed to do; roles describe what the user is. Keep the two
          prefixes distinct so a rule never confuses them. <a href="/jwt-scopes-vs-roles" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">Scopes vs roles</a> covers the design side.
        </ArticleP>

        <ArticleH2 id="issuing-your-own-jwt-in-spring-boot">Issuing Your Own JWTs in Spring Boot</ArticleH2>
        <ArticleP>
          Most tutorials under "jwt with spring boot" build a login endpoint that signs tokens with a shared secret.
          That works, but it makes your API the identity provider, with password storage, refresh, revocation and key
          rotation to own. If you only need tokens for your own services, Spring Authorization Server or an external
          provider is usually less work. When you do issue tokens yourself, Spring Security already has an encoder.
          Since Spring Security 7.0, <ArticleCode>NimbusJwtEncoder</ArticleCode> has builders for a secret key, an RSA
          key pair or an EC key pair:
        </ArticleP>
        <ArticlePre lang="java">{`@Bean
JwtEncoder jwtEncoder(SecretKey key) {                 // HS256 by default
    return NimbusJwtEncoder.withSecretKey(key).build();
}

@Bean
JwtDecoder jwtDecoder(SecretKey key) {
    return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
}

String issue(Authentication auth) {
    Instant now = Instant.now();
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer("https://api.example.com")
        .subject(auth.getName())
        .audience(List.of("https://api.example.com"))
        .issuedAt(now)
        .expiresAt(now.plus(Duration.ofMinutes(15)))
        .claim("scope", "orders.read orders.write")
        .build();
    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
}`}</ArticlePre>
        <ArticleP>
          Load the secret from configuration or a vault, and make it at least 256 bits for HS256 (RFC 7518 §3.2
          requires a key at least as long as the hash output). If more than one service verifies the tokens, prefer an
          asymmetric key pair (<ArticleCode>NimbusJwtEncoder.withKeyPair(publicKey, privateKey)</ArticleCode>) so
          verifiers never hold signing material; <a href="/hs256-vs-rs256" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">HS256 vs RS256</a> explains the trade-off.
          Keep access tokens short and pair them with the <a href="/jwt-refresh-token-pattern" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">refresh token pattern</a>.
        </ArticleP>

        <ArticleH2 id="jwt-java-library-jjwt-vs-nimbus">JWT Java Library: jjwt vs Nimbus</ArticleH2>
        <ArticleP>
          Both are mature. The choice mostly depends on whether you are already inside Spring Security.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Aspect</th>
                <th className="px-3 py-2 font-semibold">Nimbus JOSE + JWT</th>
                <th className="px-3 py-2 font-semibold">jjwt</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {LIBS.map(([aspect, nimbus, jjwt]) => (
                <tr key={aspect} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{aspect}</td>
                  <td className="px-3 py-2">{nimbus}</td>
                  <td className="px-3 py-2">{jjwt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleH3 id="jjwt-current-api">The current jjwt API</ArticleH3>
        <ArticleP>
          jjwt changed its API in 0.12: the <ArticleCode>set</ArticleCode>-prefixed builder methods and
          <ArticleCode>parseClaimsJws</ArticleCode> are deprecated. Much of the code you will find online still uses
          them. The current form, per the 0.13.0 README:
        </ArticleP>
        <ArticlePre lang="xml">{`<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>0.13.0</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-impl</artifactId>
  <version>0.13.0</version>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-jackson</artifactId>
  <version>0.13.0</version>
  <scope>runtime</scope>
</dependency>`}</ArticlePre>
        <ArticlePre lang="java">{`SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));

String jws = Jwts.builder()
    .subject("user-123")
    .issuer("https://api.example.com")
    .audience().add("https://api.example.com").and()
    .issuedAt(new Date())
    .expiration(Date.from(Instant.now().plusSeconds(900)))
    .claim("roles", List.of("ADMIN"))
    .signWith(key)
    .compact();

Claims claims = Jwts.parser()
    .verifyWith(key)
    .requireIssuer("https://api.example.com")
    .requireAudience("https://api.example.com")
    .clockSkewSeconds(30)
    .build()
    .parseSignedClaims(jws)
    .getPayload();`}</ArticlePre>
        <ArticleP>
          <ArticleCode>parseSignedClaims</ArticleCode> throws a <ArticleCode>JwtException</ArticleCode> subtype
          (<ArticleCode>ExpiredJwtException</ArticleCode>, <ArticleCode>SignatureException</ArticleCode>,
          <ArticleCode>IncorrectClaimException</ArticleCode>, <ArticleCode>MissingClaimException</ArticleCode>) when a
          check fails. <ArticleCode>signWith(key)</ArticleCode> picks the algorithm from the key; for an HMAC key it
          picks the strongest HS algorithm the key length allows.
        </ArticleP>

        <ArticleH2 id="jwt-spring-boot-4">JWT in Spring Boot 4: What Changed</ArticleH2>
        <ArticleP>
          Spring Boot 4.0.0 was released on 20 November 2025, built on Spring Framework 7 and Spring Security 7. At the
          time of writing, the reference documentation covers 4.1.1. For JWT authentication the changes that matter are:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Starter names</strong>: <ArticleCode>spring-boot-starter-security-oauth2-resource-server</ArticleCode>, <ArticleCode>-oauth2-client</ArticleCode> and <ArticleCode>-oauth2-authorization-server</ArticleCode> replace the old names, and <ArticleCode>spring-boot-starter-web</ArticleCode> becomes <ArticleCode>spring-boot-starter-webmvc</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Lambda DSL only</strong>: the chained <ArticleCode>.and()</ArticleCode> configuration style was removed in Spring Security 7, so old tutorials using <ArticleCode>http.csrf().disable().and()</ArticleCode> will not compile.</ArticleLi>
          <ArticleLi><strong>Encoder builders</strong>: <ArticleCode>NimbusJwtEncoder.withSecretKey</ArticleCode> and <ArticleCode>withKeyPair</ArticleCode> are new in Spring Security 7.0. Previously you built a <ArticleCode>JWKSource</ArticleCode> by hand.</ArticleLi>
          <ArticleLi><strong>Jackson 3</strong>: Boot 4 moves to Jackson 3 (<ArticleCode>tools.jackson</ArticleCode> group ID), which matters if you plug in custom claim serialisation. Java 17 remains the minimum.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The property names under <ArticleCode>spring.security.oauth2.resourceserver.jwt</ArticleCode> and the
          <ArticleCode>oauth2ResourceServer(...)</ArticleCode> configuration are the same in Boot 3 and Boot 4.
        </ArticleP>

        <ArticleH2 id="testing-jwt-in-spring-boot">Testing JWT-Protected Endpoints</ArticleH2>
        <ArticleP>
          <ArticleCode>spring-security-test</ArticleCode> can inject an already-authenticated JWT into MockMvc, so tests
          do not need a running identity provider:
        </ArticleP>
        <ArticlePre lang="java">{`import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

mockMvc.perform(get("/orders/42")
        .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_orders.read"))))
    .andExpect(status().isOk());`}</ArticlePre>
        <ArticleP>
          This skips the decoder, so also keep at least one integration test that sends a real signed token through the
          full chain. When real tokens are rejected, the usual causes are an <ArticleCode>iss</ArticleCode> that differs
          by a trailing slash, a missing audience, or clock drift beyond the 60-second default. The
          <a href="/common-jwt-errors-and-fixes" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> common JWT errors guide</a> lists fixes by message.
        </ArticleP>

        <ArticleH2 id="common-spring-boot-jwt-mistakes">Common Spring Boot JWT Mistakes</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Writing a custom JWT filter.</strong> Many tutorials extend <ArticleCode>OncePerRequestFilter</ArticleCode>, parse the header with jjwt and set the <ArticleCode>SecurityContext</ArticleCode> by hand. That duplicates the resource server and usually skips something: the audience check, algorithm pinning, the RFC 6750 error responses, or key rotation. Use the built-in support unless you have a specific reason not to.</ArticleLi>
          <ArticleLi><strong>Setting only jwk-set-uri.</strong> Keys alone prove who signed the token, not which issuer configuration it belongs to. Set <ArticleCode>issuer-uri</ArticleCode> as well (or add an issuer validator to your own <ArticleCode>JwtDecoder</ArticleCode>) so <ArticleCode>iss</ArticleCode> is still checked.</ArticleLi>
          <ArticleLi><strong>Short HMAC secrets.</strong> A secret such as <ArticleCode>"mysecret"</ArticleCode> is too short for HS256, and libraries reject or warn about it. Generate 32 random bytes or more and store them base64-encoded.</ArticleLi>
          <ArticleLi><strong>Long-lived access tokens.</strong> A stateless resource server cannot revoke a token before it expires. Keep access tokens to minutes and handle logout with refresh-token revocation; see <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT logout and revocation</a>.</ArticleLi>
          <ArticleLi><strong>Accepting ID tokens.</strong> An OpenID Connect ID token is addressed to the client application, not your API. If <ArticleCode>audiences</ArticleCode> is set correctly, ID tokens fail the audience check, which is the right result.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          For JWT authentication in Spring Boot, use Spring Security's OAuth2 Resource Server rather than a custom
          filter: <ArticleCode>spring-boot-starter-security-oauth2-resource-server</ArticleCode> on Boot 4 (the
          <ArticleCode>spring-boot-starter-oauth2-resource-server</ArticleCode> name on Boot 3),
          <ArticleCode>issuer-uri</ArticleCode> plus <ArticleCode>audiences</ArticleCode>, and
          <ArticleCode>oauth2.jwt(withDefaults())</ArticleCode> in the filter chain. Map role claims with a
          <ArticleCode>JwtAuthenticationConverter</ArticleCode>. When you must issue tokens yourself, use
          <ArticleCode>NimbusJwtEncoder</ArticleCode> inside Spring, or the jjwt 0.12+ API
          (<ArticleCode>Jwts.builder().subject()</ArticleCode>, <ArticleCode>Jwts.parser().verifyWith(key).build().parseSignedClaims()</ArticleCode>)
          outside it.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
