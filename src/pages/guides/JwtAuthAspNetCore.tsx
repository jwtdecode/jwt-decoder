import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'ASP.NET Core JWT Authentication for .NET Web APIs (.NET 8 to .NET 10)',
  description: 'How to configure JWT bearer authentication in an ASP.NET Core Web API: AddJwtBearer, TokenValidationParameters, JsonWebTokenHandler, roles and MapInboundClaims, dotnet user-jwts, refresh tokens and logout.',
  url: 'https://jwtdecode.app/jwt-authentication-aspnet-core',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-authentication-aspnet-core',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const PACKAGES: [pkg: string, role: string][] = [
  ['Microsoft.AspNetCore.Authentication.JwtBearer', 'The authentication handler: reads the bearer header, validates the token, builds HttpContext.User. This is the one a Web API references.'],
  ['Microsoft.IdentityModel.JsonWebTokens', 'JsonWebTokenHandler and JsonWebToken. Creates and validates JWTs; used by JwtBearer by default since ASP.NET Core 8.'],
  ['System.IdentityModel.Tokens.Jwt', 'JwtSecurityTokenHandler and JwtSecurityToken, the previous generation. Still published, but Microsoft describes JsonWebTokens as the newer, faster replacement.'],
  ['Microsoft.Identity.Web', 'Wrapper for Microsoft Entra ID that configures JwtBearer for you (issuer rules, v1/v2 tokens, scopes and app roles).'],
];

export default function JwtAuthAspNetCorePage() {
  return (
    <>
      <SEOHead
        title="ASP.NET Core JWT Authentication for Web APIs"
        description="ASP.NET Core JWT authentication for .NET 8 to 10 Web APIs: AddJwtBearer setup, validation parameters, roles and MapInboundClaims, user-jwts and logout."
        path="/jwt-authentication-aspnet-core"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in ASP.NET Core' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/validate-azure-entra-id-jwt', label: 'Validate Entra ID JWTs', description: 'Issuer, audience, v1 vs v2 and scp vs roles for Microsoft tokens.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Short access tokens with rotating refresh tokens.' },
          { to: '/jwt-logout-and-revocation', label: 'JWT Logout & Revocation', description: 'What logout means when tokens are stateless.' },
          { to: '/jwt-authentication-spring-boot', label: 'JWT in Spring Boot', description: 'The same resource-server pattern in Java.' },
        ]}
      >
        <ArticleH1>ASP.NET Core JWT Authentication for .NET Web APIs (.NET 8 to .NET 10)</ArticleH1>

        <ArticleIntroBox>
          To add JWT authentication to an ASP.NET Core Web API, reference
          <ArticleCode>Microsoft.AspNetCore.Authentication.JwtBearer</ArticleCode>, call
          <ArticleCode>AddAuthentication().AddJwtBearer(...)</ArticleCode> with the token issuer
          (<ArticleCode>Authority</ArticleCode>) and your API's <ArticleCode>Audience</ArticleCode>, then protect
          endpoints with <ArticleCode>[Authorize]</ArticleCode> or <ArticleCode>RequireAuthorization()</ArticleCode>.
          The handler fetches the issuer's signing keys, checks signature, issuer, audience and lifetime, and fills
          <ArticleCode>HttpContext.User</ArticleCode> from the claims. This guide covers the configuration, the
          <ArticleCode>JsonWebTokenHandler</ArticleCode> versus <ArticleCode>JwtSecurityTokenHandler</ArticleCode> question,
          roles and the claim-mapping gotcha, local testing with <ArticleCode>dotnet user-jwts</ArticleCode>, refresh
          tokens and logout. Checked against the Microsoft Learn ASP.NET Core docs for .NET 10 (which also cover 8 and 9) and
          Microsoft.IdentityModel 8.19.
        </ArticleIntroBox>

        <ArticleH2 id="jwt-dotnet-core-web-api">JWT in a .NET Core Web API: Minimal Setup</ArticleH2>
        <ArticlePre lang="bash">{`dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer`}</ArticlePre>
        <ArticlePre lang="csharp">{`using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://idp.example.com/realms/acme"; // the token issuer
        options.Audience  = "https://api.example.com";             // this API's identifier
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/orders", (ClaimsPrincipal user) => $"Orders for {user.FindFirst("sub")?.Value}")
   .RequireAuthorization();

app.Run();`}</ArticlePre>
        <ArticleP>
          <ArticleCode>Authority</ArticleCode> makes the handler read
          <ArticleCode>{'{Authority}'}/.well-known/openid-configuration</ArticleCode>, take the issuer and
          <ArticleCode>jwks_uri</ArticleCode> from it, and cache the keys. <ArticleCode>Audience</ArticleCode> sets the
          expected <ArticleCode>aud</ArticleCode>. Microsoft's guidance is that an API should validate the signature,
          <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode> and expiry, and return 401 if any of them fail.
          If your provider does not use the standard path, set <ArticleCode>MetadataAddress</ArticleCode> explicitly.
          The background on authorities and discovery is in <a href="/jwt-in-oauth2-and-openid-connect" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWTs in OAuth 2.0 and OpenID Connect</a>.
        </ArticleP>
        <ArticleP>
          <ArticleCode>AddJwtBearer()</ArticleCode> with no delegate also binds from configuration, from the
          <ArticleCode>Authentication:Schemes:Bearer</ArticleCode> section (<ArticleCode>ValidAudiences</ArticleCode>,
          <ArticleCode>ValidIssuer</ArticleCode>, and so on). This is the section <ArticleCode>dotnet user-jwts</ArticleCode> writes to.
        </ArticleP>

        <ArticleH2 id="token-validation-parameters">TokenValidationParameters You Should Set</ArticleH2>
        <ArticlePre lang="csharp">{`builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Api:Authority"];
        options.Audience  = builder.Configuration["Api:Audience"];
        options.MapInboundClaims = false;                 // keep claim names as issued
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 },
            ClockSkew = TimeSpan.FromSeconds(30),         // default is 5 minutes
            NameClaimType = "sub",
            RoleClaimType = "roles",
        };
    });`}</ArticlePre>
        <ArticleUl>
          <ArticleLi><strong>ValidAlgorithms</strong> pins the signature algorithm, so a token that claims a different <ArticleCode>alg</ArticleCode> is rejected before any key is tried.</ArticleLi>
          <ArticleLi><strong>ClockSkew</strong> defaults to five minutes, which means an "expired" token keeps working for up to five minutes. Most teams reduce it. See <a href="/common-jwt-errors-and-fixes#clock-skew" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">clock skew</a> for how much leeway is sensible.</ArticleLi>
          <ArticleLi><strong>ValidAudiences / ValidIssuers</strong> accept lists when an API serves several clients or tenants.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Microsoft's docs recommend keeping to the defaults where you can and setting only what your provider needs.
          Never set <ArticleCode>ValidateIssuerSigningKey</ArticleCode>, <ArticleCode>ValidateLifetime</ArticleCode> or
          <ArticleCode>ValidateAudience</ArticleCode> to false to "fix" a failing token. Find the mismatch instead; the
          <a href="/how-to-debug-a-jwt" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> JWT debugging routine</a> walks through it.
        </ArticleP>

        <ArticleH2 id="jwt-c-sharp-example">JWT C# Example: Issuing and Validating Your Own Tokens</ArticleH2>
        <ArticleCallout type="warning">
          The ASP.NET Core docs are blunt about this: don't generate your own access tokens except for testing, use
          asymmetric keys when you do, and never mint an access token directly from a username and password request.
          Use an OpenID Connect provider (Entra ID, Keycloak, Duende IdentityServer, OpenIddict, Auth0 and so on)
          for production sign-in.
        </ArticleCallout>
        <ArticleP>
          For closed systems and tests, <ArticleCode>JsonWebTokenHandler</ArticleCode> creates a signed JWT from a
          <ArticleCode>SecurityTokenDescriptor</ArticleCode>:
        </ArticleP>
        <ArticlePre lang="csharp">{`using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

var key = new SymmetricSecurityKey(Convert.FromBase64String(config["Jwt:Key"]!)); // 32+ random bytes

string token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
{
    Issuer   = "https://api.example.com",
    Audience = "https://api.example.com",
    Subject  = new ClaimsIdentity(new[]
    {
        new Claim("sub", userId),
        new Claim("roles", "Admin"),
    }),
    Expires  = DateTime.UtcNow.AddMinutes(15),
    SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
});`}</ArticlePre>
        <ArticleP>
          The API then validates with the same key instead of an <ArticleCode>Authority</ArticleCode>:
        </ArticleP>
        <ArticlePre lang="csharp">{`.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = "https://api.example.com",
        ValidAudience = "https://api.example.com",
        IssuerSigningKey = key,
        ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },
        ClockSkew = TimeSpan.FromSeconds(30),
        RoleClaimType = "roles",
    };
});`}</ArticlePre>
        <ArticleP>
          Generate the key with a CSPRNG, not a memorable passphrase (see the <a href="/jwt-secret-key-generator" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">JWT secret key generator</a>), and keep it in
          user secrets or a vault rather than <ArticleCode>appsettings.json</ArticleCode>. To check what you produced,
          paste the token into <a href="/" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">the jwtdecode.app decoder</a>, which decodes it and verifies HS256 locally in your browser.
        </ArticleP>

        <ArticleH2 id="jwt-c-sharp-library">Which JWT C# Library? JsonWebTokenHandler vs JwtSecurityTokenHandler</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Package</th>
                <th className="px-3 py-2 font-semibold">What it is for</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {PACKAGES.map(([pkg, role]) => (
                <tr key={pkg} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{pkg}</td>
                  <td className="px-3 py-2">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          In new code, use <ArticleCode>JsonWebTokenHandler</ArticleCode>. Since ASP.NET Core 8 the JwtBearer handler
          uses it by default. Microsoft gives three reasons for the switch: about 30% better performance, "last known
          good" metadata for reliability, and async processing. The visible side effect is that
          <ArticleCode>TokenValidatedContext.SecurityToken</ArticleCode> is now a <ArticleCode>JsonWebToken</ArticleCode>,
          so event code that casts it to <ArticleCode>JwtSecurityToken</ArticleCode> gets null. Cast to
          <ArticleCode>JsonWebToken</ArticleCode> instead, or set <ArticleCode>options.UseSecurityTokenValidators = true</ArticleCode>
          to restore the old behaviour while you migrate.
        </ArticleP>

        <ArticleH2 id="jwt-roles-c-sharp">JWT Roles in C#: [Authorize(Roles = ...)] and Claim Mapping</ArticleH2>
        <ArticlePre lang="csharp">{`[Authorize(Roles = "Admin")]
[ApiController, Route("admin")]
public class AdminController : ControllerBase { /* ... */ }

// Minimal APIs, with a scope policy as well.
// "scope" is usually one space-separated string, so match individual values.
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("orders.read", p => p.RequireAssertion(ctx =>
        ctx.User.FindAll("scope")
           .SelectMany(c => c.Value.Split(' '))
           .Contains("orders.read")));

app.MapGet("/orders", () => "...").RequireAuthorization("orders.read");
app.MapDelete("/orders/{id}", (int id) => "...").RequireAuthorization(p => p.RequireRole("Admin"));`}</ArticlePre>
        <ArticleP>
          <ArticleCode>[Authorize(Roles = "Admin")]</ArticleCode> and <ArticleCode>RequireRole</ArticleCode> check
          claims of the identity's <em>role claim type</em>, not a claim literally named <ArticleCode>role</ArticleCode>.
          That is where most "my token has the role but I get 403" reports come from. Likewise,
          <ArticleCode>RequireClaim("scope", "orders.read")</ArticleCode> compares whole claim values, so it fails
          against a token whose <ArticleCode>scope</ArticleCode> is <ArticleCode>"orders.read orders.write"</ArticleCode>;
          that is why the policy above splits the string.
        </ArticleP>
        <ArticleH3 id="map-inbound-claims">The MapInboundClaims gotcha</ArticleH3>
        <ArticleP>
          By default the handler renames well-known JWT claims to the long WS-* claim type URIs, using
          <ArticleCode>JsonWebTokenHandler.DefaultInboundClaimTypeMap</ArticleCode> (on .NET 8 and later). For example,
          <ArticleCode>sub</ArticleCode> becomes <ArticleCode>ClaimTypes.NameIdentifier</ArticleCode>. Code that calls
          <ArticleCode>User.FindFirst("sub")</ArticleCode> then finds nothing. You have two consistent options:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Keep the mapping</strong> and read claims through <ArticleCode>ClaimTypes.*</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Turn it off</strong> with <ArticleCode>options.MapInboundClaims = false</ArticleCode> (per scheme) or <ArticleCode>JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear()</ArticleCode> (globally). Then tell ASP.NET Core which claims carry the name and roles, with <ArticleCode>TokenValidationParameters.NameClaimType</ArticleCode> and <ArticleCode>RoleClaimType</ArticleCode>. Entra ID puts app roles in <ArticleCode>roles</ArticleCode>; other providers use <ArticleCode>role</ArticleCode>, <ArticleCode>groups</ArticleCode> or a namespaced claim.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          The second option is easier to reason about, because what you see in the decoded token is what
          <ArticleCode>User</ArticleCode> contains. For the difference between scopes and roles, see
          <a href="/jwt-scopes-vs-roles" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> scopes vs roles</a>.
        </ArticleP>

        <ArticleH2 id="jwt-dotnet-8-dotnet-10">JWT in .NET 8 and .NET 10: What to Know</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>.NET 8</strong> made <ArticleCode>JsonWebToken</ArticleCode>/<ArticleCode>JsonWebTokenHandler</ArticleCode> the default in JwtBearer, as described above. Claim-map code that edited <ArticleCode>JwtSecurityTokenHandler.DefaultInboundClaimTypeMap</ArticleCode> no longer has any effect; edit <ArticleCode>JsonWebTokenHandler.DefaultInboundClaimTypeMap</ArticleCode> instead.</ArticleLi>
          <ArticleLi><strong>.NET 8 Identity API endpoints</strong> (<ArticleCode>AddIdentityApiEndpoints</ArticleCode> plus <ArticleCode>MapIdentityApi</ArticleCode>) issue bearer and refresh tokens from <ArticleCode>/login</ArticleCode> and <ArticleCode>/refresh</ArticleCode>. Microsoft states these are proprietary tokens, <em>not</em> JWTs. You cannot decode them or validate them in another service with JwtBearer.</ArticleLi>
          <ArticleLi><strong>.NET 10</strong> is the current LTS release. The JwtBearer configuration shown in this guide is the same on .NET 8, 9 and 10; the Microsoft Learn pages cited here cover all three.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="dotnet-user-jwts">Testing Locally with dotnet user-jwts</ArticleH2>
        <ArticleP>
          The <ArticleCode>dotnet user-jwts</ArticleCode> tool (available since .NET 7) creates development tokens
          signed with a key it stores in your user secrets. It also writes the matching issuer and audiences into
          <ArticleCode>appsettings.Development.json</ArticleCode>, so a bare <ArticleCode>AddJwtBearer()</ArticleCode> accepts them.
        </ArticleP>
        <ArticlePre lang="bash">{`dotnet user-jwts create --name alice --role Admin --scope "orders.read" --valid-for 1h
dotnet user-jwts list
dotnet user-jwts print <id> --show-all

curl -i -H "Authorization: Bearer <token>" https://localhost:7076/orders`}</ArticlePre>
        <ArticleP>
          The default issuer is <ArticleCode>dotnet-user-jwts</ArticleCode>. These tokens exist only for the
          Development environment; make sure production configuration never trusts that issuer or key. The tool is
          also handy for reproducing authorisation bugs: create one token with the role and one without, and confirm
          that the second gets a 403 rather than a 401.
        </ArticleP>

        <ArticleH2 id="jwt-c-sharp-refresh-token">JWT Refresh Tokens in C#</ArticleH2>
        <ArticleP>
          JwtBearer only <em>validates</em> tokens; it has no refresh endpoint. Where refresh tokens come from depends on who issues the access token:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>An OpenID Connect provider</strong>: the client requests the <ArticleCode>offline_access</ArticleCode> scope (or the provider's equivalent) and calls the provider's token endpoint with <ArticleCode>grant_type=refresh_token</ArticleCode>. Your API does nothing.</ArticleLi>
          <ArticleLi><strong>Identity API endpoints</strong>: call <ArticleCode>POST /refresh</ArticleCode> with the refresh token from <ArticleCode>/login</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>Self-issued JWTs</strong>: store a hash of a random refresh token per user and device, rotate it on every use, and revoke the whole family if an old one is replayed. The <a href="/jwt-refresh-token-pattern" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">refresh token pattern</a> sets out the rules.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="jwt-logout-c-sharp">JWT Logout in C#</ArticleH2>
        <ArticleP>
          A signed JWT stays valid until <ArticleCode>exp</ArticleCode>. Logout therefore means deleting the tokens on
          the client, revoking the refresh token, and keeping access tokens short. If you must cut off an access token
          immediately, check a deny-list of <ArticleCode>jti</ArticleCode> values after validation:
        </ArticleP>
        <ArticlePre lang="csharp">{`options.Events = new JwtBearerEvents
{
    OnTokenValidated = async context =>
    {
        var jti = context.Principal?.FindFirst("jti")?.Value;
        var denyList = context.HttpContext.RequestServices.GetRequiredService<ITokenDenyList>();
        if (jti is null || await denyList.IsRevokedAsync(jti))
        {
            context.Fail("Token has been revoked.");
        }
    }
};`}</ArticlePre>
        <ArticleP>
          <ArticleCode>ITokenDenyList</ArticleCode> is your own abstraction, usually backed by Redis with entries that
          expire at the token's <ArticleCode>exp</ArticleCode>. This adds a lookup to every request, which is the
          stateful cost that JWTs were meant to avoid, so use it only where it is needed.
          <a href="/jwt-logout-and-revocation" className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"> JWT logout and revocation</a> compares the options.
        </ArticleP>

        <ArticleH2 id="common-aspnet-core-jwt-mistakes">Common ASP.NET Core JWT Mistakes</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong>Middleware order.</strong> <ArticleCode>UseAuthentication()</ArticleCode> must run before <ArticleCode>UseAuthorization()</ArticleCode>, and both after <ArticleCode>UseRouting()</ArticleCode> when you call it explicitly. If they are in the wrong order, <ArticleCode>User</ArticleCode> is always anonymous.</ArticleLi>
          <ArticleLi><strong>Sending the ID token.</strong> The ASP.NET Core docs say ID tokens should never be used to access APIs. An ID token's <ArticleCode>aud</ArticleCode> is the client's ID, so a correctly configured API rejects it with an audience error. Have the client send the access token for your API.</ArticleLi>
          <ArticleLi><strong>Turning off HTTPS metadata.</strong> <ArticleCode>RequireHttpsMetadata</ArticleCode> defaults to true. Setting it to false outside local development lets anyone who can tamper with the metadata request supply their own signing keys.</ArticleLi>
          <ArticleLi><strong>Multiple schemes without a default.</strong> If you register more than one scheme, set the default or name the scheme on <ArticleCode>[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]</ArticleCode>. Otherwise the bearer handler may never run.</ArticleLi>
          <ArticleLi><strong>Reading 401 and 403 the same way.</strong> A 401 means the token failed validation, and the <ArticleCode>WWW-Authenticate</ArticleCode> response header usually says why. A 403 means the token was fine but the policy failed, which almost always comes down to role or scope claim types. Enable logging for <ArticleCode>Microsoft.AspNetCore.Authentication</ArticleCode> to see the exact <ArticleCode>IDX</ArticleCode> error.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          ASP.NET Core JWT authentication is <ArticleCode>AddAuthentication().AddJwtBearer()</ArticleCode> with an
          <ArticleCode>Authority</ArticleCode> and <ArticleCode>Audience</ArticleCode>, plus a few
          <ArticleCode>TokenValidationParameters</ArticleCode>: pinned algorithms, a shorter <ArticleCode>ClockSkew</ArticleCode>,
          and explicit name and role claim types. Set <ArticleCode>MapInboundClaims = false</ArticleCode> so claim names
          match the token. Use <ArticleCode>JsonWebTokenHandler</ArticleCode> rather than the legacy
          <ArticleCode>JwtSecurityTokenHandler</ArticleCode>. Issue your own tokens only in tests or closed systems, test locally with
          <ArticleCode>dotnet user-jwts</ArticleCode>, and handle logout with short lifetimes and refresh-token revocation.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
