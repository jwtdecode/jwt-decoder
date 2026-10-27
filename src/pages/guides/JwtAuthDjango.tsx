import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Django REST Framework JWT Authentication with Simple JWT: Setup, Refresh and Logout',
  description: 'How to add JWT authentication to Django REST Framework with djangorestframework-simplejwt: install, settings, token URLs, refresh token rotation, logout via the token blacklist, React front ends and Django Ninja.',
  url: 'https://jwtdecode.app/jwt-authentication-django',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-authentication-django',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const SETTINGS: [key: string, def: string, recommended: string][] = [
  ['ACCESS_TOKEN_LIFETIME', 'timedelta(minutes=5)', '5 to 15 minutes'],
  ['REFRESH_TOKEN_LIFETIME', 'timedelta(days=1)', 'Days to a few weeks, depending on your risk tolerance'],
  ['ROTATE_REFRESH_TOKENS', 'False', 'True: every refresh returns a new refresh token'],
  ['BLACKLIST_AFTER_ROTATION', 'False', 'True: the old refresh token stops working (needs token_blacklist)'],
  ['ALGORITHM', 'HS256', 'HS256 for one service; RS256/ES256 if other services verify'],
  ['SIGNING_KEY', 'settings.SECRET_KEY', 'A separate key from the environment'],
  ['ISSUER / AUDIENCE', 'None (not checked)', 'Set both; they are then added on issue and checked on verify'],
  ['LEEWAY', '0', '30 seconds of clock skew tolerance'],
  ['CHECK_REVOKE_TOKEN', 'False', 'True to invalidate tokens when the user changes password'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtAuthDjangoPage() {
  return (
    <>
      <SEOHead
        title="Django REST Framework JWT Authentication"
        description="Django REST Framework JWT authentication with Simple JWT: install, settings, token URLs, refresh rotation, blacklist logout, React clients and Django Ninja."
        path="/jwt-authentication-django"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in Django REST Framework' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-authentication-fastapi', label: 'JWT in FastAPI', description: 'The same ideas with PyJWT and FastAPI dependencies.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Why rotation and reuse detection matter.' },
          { to: '/jwt-logout-and-revocation', label: 'JWT Logout and Revocation', description: 'What logging out can and cannot do with stateless tokens.' },
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'localStorage vs Cookie', description: 'Where a React front end should keep Django-issued tokens.' },
        ]}
      >
        <ArticleH1>Django REST Framework JWT Authentication with Simple JWT: Setup, Refresh and Logout</ArticleH1>

        <ArticleIntroBox>
          For Django REST Framework JWT authentication, use <ArticleCode>djangorestframework-simplejwt</ArticleCode>. Add
          <ArticleCode>JWTAuthentication</ArticleCode> to <ArticleCode>DEFAULT_AUTHENTICATION_CLASSES</ArticleCode>, wire up
          <ArticleCode>TokenObtainPairView</ArticleCode> and <ArticleCode>TokenRefreshView</ArticleCode>, and configure lifetimes in a
          <ArticleCode>SIMPLE_JWT</ArticleCode> dict. For logout, install the <ArticleCode>token_blacklist</ArticleCode> app, turn on
          refresh rotation and expose <ArticleCode>TokenBlacklistView</ArticleCode>. The older <ArticleCode>djangorestframework-jwt</ArticleCode>
          package is unmaintained. Everything here was tested with Django 6.1.1, Django REST Framework 3.18.1, Simple JWT 5.5.1 and
          PyJWT 2.15.0 using DRF's <ArticleCode>APITestCase</ArticleCode>.
        </ArticleIntroBox>

        <ArticleH2 id="djangorestframework-jwt-vs-simplejwt">djangorestframework-jwt vs Simple JWT</ArticleH2>
        <ArticleP>
          Searches for "djangorestframework jwt" still surface <ArticleCode>djangorestframework-jwt</ArticleCode>
          (<ArticleCode>rest_framework_jwt</ArticleCode>, <ArticleCode>JSONWebTokenAuthentication</ArticleCode>,
          <ArticleCode>obtain_jwt_token</ArticleCode>). Its last PyPI release was 1.11.0 in June 2017, and it predates current Django and
          DRF versions. Do not start new projects on it. <ArticleCode>djangorestframework-simplejwt</ArticleCode>, maintained under the
          Jazzband organisation, is the package DRF's own documentation points to for JWT, and the one this guide uses. If you are
          migrating, the concepts map directly, but settings, URLs and the token format differ, so every existing token is invalidated
          at switchover.
        </ArticleP>

        <ArticleH2 id="jwt-django-install">JWT Django Install</ArticleH2>
        <ArticlePre lang="bash">{`pip install djangorestframework djangorestframework-simplejwt
# only needed for RS256/ES256 signing or JWKS verification:
pip install "djangorestframework-simplejwt[crypto]"`}</ArticlePre>
        <ArticleP>
          Simple JWT 5.5.1's package metadata lists Django 4.2 to 5.2; the full flow below also passed on Django 6.1.1, but check the
          changelog before upgrading Django in production.
        </ArticleP>

        <ArticleH2 id="settings">Configuring settings.py</ArticleH2>
        <ArticlePre lang="python">{`# settings.py
import os
from datetime import timedelta

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

INSTALLED_APPS = [
    # ... django.contrib apps ...
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",  # for logout and rotation
    "api",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": os.environ["JWT_SIGNING_KEY"],
    "ISSUER": "https://api.example.com",
    "AUDIENCE": "https://api.example.com",
    "LEEWAY": 30,
    "AUTH_HEADER_TYPES": ("Bearer",),
}`}</ArticlePre>
        <ArticleP>
          Run <ArticleCode>python manage.py migrate</ArticleCode> afterwards to create the <ArticleCode>OutstandingToken</ArticleCode>
          and <ArticleCode>BlacklistedToken</ArticleCode> tables. The settings that matter most:
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">SIMPLE_JWT key</th>
                <th className="px-3 py-2 font-semibold">Default (5.5.1)</th>
                <th className="px-3 py-2 font-semibold">Recommended</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {SETTINGS.map(([key, def, recommended]) => (
                <tr key={key} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{key}</td>
                  <td className="px-3 py-2">{def}</td>
                  <td className="px-3 py-2">{recommended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleCallout type="warning">
          By default Simple JWT signs with Django's <ArticleCode>SECRET_KEY</ArticleCode>. That key also protects sessions, password
          reset links and signed cookies, so a leak of one is a leak of all. A dedicated <ArticleCode>SIGNING_KEY</ArticleCode> lets you
          rotate JWT signing without logging everyone out of the admin. Generate it with 32 or more random bytes; see the
          <a href="/jwt-secret-key-generator" className={link}> JWT secret key generator</a> guide.
        </ArticleCallout>
        <ArticleP>
          <ArticleCode>ISSUER</ArticleCode> and <ArticleCode>AUDIENCE</ArticleCode> default to <ArticleCode>None</ArticleCode>, which
          means neither claim is added or checked. Setting them costs nothing and stops tokens from another environment or service
          being accepted. The <ArticleCode>ALGORITHM</ArticleCode> setting doubles as the verification allow-list: only that algorithm is
          accepted on decode. Background on both claims is in <a href="/jwt-claims-explained" className={link}>JWT claims explained</a>.
        </ArticleP>
        <ArticleP>
          If other services need to verify Django-issued tokens, switch to an asymmetric algorithm so they only ever hold a public key:
          set <ArticleCode>ALGORITHM</ArticleCode> to <ArticleCode>RS256</ArticleCode> or <ArticleCode>ES256</ArticleCode>, put the
          PEM private key in <ArticleCode>SIGNING_KEY</ArticleCode> and the public key in <ArticleCode>VERIFYING_KEY</ArticleCode>, and
          install the <ArticleCode>[crypto]</ArticleCode> extra. Going the other way, when Django verifies tokens issued by an external
          identity provider, <ArticleCode>JWK_URL</ArticleCode> points Simple JWT at the provider's JWKS endpoint. The choice between the
          two families is explained in <a href="/hs256-vs-rs256" className={link}>HS256 vs RS256</a>.
        </ArticleP>

        <ArticleH2 id="token-urls">Token URLs: Obtain, Refresh and Blacklist</ArticleH2>
        <ArticlePre lang="python">{`# urls.py
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
)

from api.views import me

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("api/me/", me),
]`}</ArticlePre>
        <ArticlePre lang="python">{`# api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def me(request):
    # request.user is a real User loaded from the token's user_id claim
    return Response({"id": request.user.id, "username": request.user.username})`}</ArticlePre>

        <ArticleH2 id="django-jwt-token">Getting and Using a Django JWT Token</ArticleH2>
        <ArticlePre lang="bash">{`curl -s -X POST localhost:8000/api/token/ \\
  -H 'content-type: application/json' \\
  -d '{"username":"ada","password":"correct horse"}'
# {"refresh":"eyJhbGciOiJIUzI1NiIs...","access":"eyJhbGciOiJIUzI1NiIs..."}

curl -s localhost:8000/api/me/ -H "Authorization: Bearer $ACCESS"
# {"id":1,"username":"ada"}`}</ArticlePre>
        <ArticleP>
          Decoded, the access token payload contains <ArticleCode>token_type: "access"</ArticleCode>, <ArticleCode>exp</ArticleCode>,
          <ArticleCode>iat</ArticleCode>, a <ArticleCode>jti</ArticleCode>, <ArticleCode>user_id</ArticleCode> (a string, such as
          <ArticleCode>"1"</ArticleCode>, in 5.5.1) and the <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode> values
          from settings. You can check this by pasting a token into the <a href="/" className={link}>jwtdecode.app decoder</a>, which
          runs locally in the browser. The <ArticleCode>token_type</ArticleCode> claim matters: presenting a refresh token as a
          Bearer token is rejected with <ArticleCode>Token has wrong type</ArticleCode>.
        </ArticleP>
        <ArticleP>
          Failures observed in testing: bad credentials return 401 with <ArticleCode>No active account found with the given
          credentials</ArticleCode>; no header returns 401 <ArticleCode>Authentication credentials were not provided.</ArticleCode>
          with <ArticleCode>WWW-Authenticate: Bearer realm="api"</ArticleCode>; a tampered token returns 401 with
          <ArticleCode>code: "token_not_valid"</ArticleCode>. If a token that looks fine is rejected, work through
          <a href="/how-to-debug-a-jwt" className={link}> how to debug a JWT</a>.
        </ArticleP>

        <ArticleH3 id="jwt-authentication-in-django-views">JWT authentication in Django views and permissions</ArticleH3>
        <ArticleP>
          Because <ArticleCode>JWTAuthentication</ArticleCode> is in <ArticleCode>DEFAULT_AUTHENTICATION_CLASSES</ArticleCode> and
          <ArticleCode>IsAuthenticated</ArticleCode> is the default permission, every DRF view requires a valid access token unless it
          says otherwise. The token views themselves set <ArticleCode>permission_classes = ()</ArticleCode>, so login still works. For
          public endpoints, set <ArticleCode>permission_classes = [AllowAny]</ArticleCode> on the view; for staff-only endpoints, use
          <ArticleCode>IsAdminUser</ArticleCode>. Authorisation is still read from the database: <ArticleCode>JWTAuthentication</ArticleCode>
          loads the <ArticleCode>User</ArticleCode> named by <ArticleCode>user_id</ArticleCode> on every request and rejects inactive users,
          so deactivating an account takes effect immediately even though the token is still valid. If you want to skip that query,
          <ArticleCode>JWTStatelessUserAuthentication</ArticleCode> builds a <ArticleCode>TokenUser</ArticleCode> from the claims alone,
          at the cost of that immediate check. Plain Django views (not DRF) do not run DRF authentication classes at all; protect them
          with sessions, or move them to DRF.
        </ArticleP>

        <ArticleH3 id="custom-claims">Adding custom claims</ArticleH3>
        <ArticlePre lang="python">{`# api/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username  # public data only; the payload is not encrypted
        token["is_staff"] = user.is_staff
        return token

# settings.py -> SIMPLE_JWT["TOKEN_OBTAIN_SERIALIZER"] = "api.serializers.MyTokenObtainPairSerializer"`}</ArticlePre>

        <ArticleH2 id="refresh-token-rotation">Refresh Token Rotation</ArticleH2>
        <ArticleP>
          <ArticleCode>POST /api/token/refresh/</ArticleCode> with <ArticleCode>{'{"refresh": "..."}'}</ArticleCode> returns a new
          access token. With <ArticleCode>ROTATE_REFRESH_TOKENS</ArticleCode> it also returns a new refresh token, and with
          <ArticleCode>BLACKLIST_AFTER_ROTATION</ArticleCode> the old one is blacklisted. In testing, reusing a rotated refresh token
          returned 401 <ArticleCode>Token is blacklisted</ArticleCode>. That limits the value of a stolen refresh token, but note that
          Simple JWT does not revoke the whole token family on reuse; the <a href="/jwt-refresh-token-pattern" className={link}>refresh
          token pattern</a> explains reuse detection if you need it.
        </ArticleP>

        <ArticleH2 id="jwt-logout-django">JWT Logout in Django</ArticleH2>
        <ArticleP>
          Logout means blacklisting the refresh token: the client posts it to <ArticleCode>TokenBlacklistView</ArticleCode>, which
          returns 200 with an empty body. Any later refresh attempt with it fails with <ArticleCode>Token is blacklisted</ArticleCode>.
          The client then discards both tokens.
        </ArticleP>
        <ArticlePre lang="bash">{`curl -s -X POST localhost:8000/api/token/blacklist/ \\
  -H 'content-type: application/json' -d "{\\"refresh\\":\\"$REFRESH\\"}"`}</ArticlePre>
        <ArticleCallout type="info">
          The access token keeps working until it expires. In testing, <ArticleCode>/api/me/</ArticleCode> still returned 200 with the
          old access token after logout. That is how stateless JWTs behave, and it is why
          <ArticleCode>ACCESS_TOKEN_LIFETIME</ArticleCode> should stay short. For immediate revocation you need a server-side check on
          each request, such as a <ArticleCode>jti</ArticleCode> deny-list; the options are compared in
          <a href="/jwt-logout-and-revocation" className={link}> JWT logout and revocation</a>.
        </ArticleCallout>
        <ArticleP>
          Two more tools help. <ArticleCode>CHECK_REVOKE_TOKEN: True</ArticleCode> embeds a claim derived from the user's password hash,
          so changing the password invalidates every token that user holds. And the outstanding-token table grows with every login, so
          schedule <ArticleCode>python manage.py flushexpiredtokens</ArticleCode> (for example, daily via cron) to delete expired rows.
        </ArticleP>

        <ArticleH2 id="jwt-django-react">JWT with Django and React</ArticleH2>
        <ArticleP>
          A React single-page app talking to DRF usually works like this: log in with <ArticleCode>POST /api/token/</ArticleCode>, keep
          the access token in memory (a React context or state store, not <ArticleCode>localStorage</ArticleCode>), attach it as
          <ArticleCode>Authorization: Bearer</ArticleCode> on each request, and on a 401 call the refresh endpoint once and retry. An
          HTTP client interceptor (Axios or a <ArticleCode>fetch</ArticleCode> wrapper) is the natural place for that retry logic.
        </ArticleP>
        <ArticleP>
          The refresh token is the harder part. Simple JWT returns it in the JSON body; it does not set cookies for you. To keep it out of
          JavaScript, subclass the obtain and refresh views so they move the refresh token into an <ArticleCode>HttpOnly</ArticleCode>,
          <ArticleCode>Secure</ArticleCode>, <ArticleCode>SameSite</ArticleCode> cookie scoped to the refresh path, and read it from
          there on refresh. If the front end runs on a different origin, you will also need <ArticleCode>django-cors-headers</ArticleCode>
          with an explicit allowed origin and credentials enabled. The storage trade-offs are covered in
          <a href="/jwt-storage-localstorage-vs-cookie" className={link}> JWT storage: localStorage vs cookie</a>.
        </ArticleP>

        <ArticleH2 id="jwt-django-ninja">JWT with Django Ninja</ArticleH2>
        <ArticleP>
          Django Ninja does not ship JWT support, but <ArticleCode>django-ninja-jwt</ArticleCode>, a port of Simple JWT built on
          <ArticleCode>django-ninja-extra</ArticleCode>, provides the same obtain, refresh and verify endpoints. Tested with
          django-ninja 1.7.1, django-ninja-extra 0.31.7 and django-ninja-jwt 5.4.5:
        </ArticleP>
        <ArticlePre lang="python">{`# pip install django-ninja-jwt   (add "ninja_extra" and "ninja_jwt" to INSTALLED_APPS)
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)  # /token/pair, /token/refresh, /token/verify


@api.get("/me", auth=JWTAuth())
def me(request):
    return {"id": request.user.id, "username": request.user.username}`}</ArticlePre>
        <ArticleP>
          Configuration lives in a <ArticleCode>NINJA_JWT</ArticleCode> dict with the same key names as <ArticleCode>SIMPLE_JWT</ArticleCode>,
          so set <ArticleCode>ACCESS_TOKEN_LIFETIME</ArticleCode>, <ArticleCode>SIGNING_KEY</ArticleCode>, <ArticleCode>ISSUER</ArticleCode>
          and <ArticleCode>AUDIENCE</ArticleCode> there. A request without a token returned 401 <ArticleCode>{'{"detail": "Unauthorized"}'}</ArticleCode>.
          If you would rather not add the dependency, Django Ninja's <ArticleCode>HttpBearer</ArticleCode> class lets you write an
          <ArticleCode>authenticate(request, token)</ArticleCode> method that calls PyJWT directly, as in the
          <a href="/jwt-authentication-fastapi" className={link}> FastAPI guide</a>.
        </ArticleP>

        <ArticleH2 id="common-problems">Common Django JWT Problems</ArticleH2>
        <ArticleUl>
          <ArticleLi><strong><ArticleCode>no such table: token_blacklist_outstandingtoken</ArticleCode></strong>: the app is in <ArticleCode>INSTALLED_APPS</ArticleCode> but <ArticleCode>migrate</ArticleCode> has not been run.</ArticleLi>
          <ArticleLi><strong>401 with a token that looks valid</strong>: the header prefix does not match <ArticleCode>AUTH_HEADER_TYPES</ArticleCode> (for example <ArticleCode>JWT</ArticleCode> from old djangorestframework-jwt tutorials instead of <ArticleCode>Bearer</ArticleCode>), or <ArticleCode>ISSUER</ArticleCode>/<ArticleCode>AUDIENCE</ArticleCode> differ between the service that issued the token and the one verifying it.</ArticleLi>
          <ArticleLi><strong>Everyone logged out after a deploy</strong>: <ArticleCode>SIGNING_KEY</ArticleCode> (or <ArticleCode>SECRET_KEY</ArticleCode>, if you left the default) changed.</ArticleLi>
          <ArticleLi><strong>The Authorization header never reaches Django</strong>: some Apache mod_wsgi set-ups drop it unless <ArticleCode>WSGIPassAuthorization On</ArticleCode> is set.</ArticleLi>
          <ArticleLi><strong>Intermittent expiry errors</strong>: clock drift between servers. Keep NTP running and set a small <ArticleCode>LEEWAY</ArticleCode>. More causes are listed in <a href="/common-jwt-errors-and-fixes" className={link}>common JWT errors and fixes</a>.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Django REST Framework JWT authentication today means <ArticleCode>djangorestframework-simplejwt</ArticleCode>, not the
          abandoned <ArticleCode>djangorestframework-jwt</ArticleCode>. Add <ArticleCode>JWTAuthentication</ArticleCode>, route
          <ArticleCode>TokenObtainPairView</ArticleCode>, <ArticleCode>TokenRefreshView</ArticleCode> and
          <ArticleCode>TokenBlacklistView</ArticleCode>, use a dedicated <ArticleCode>SIGNING_KEY</ArticleCode>, set
          <ArticleCode>ISSUER</ArticleCode> and <ArticleCode>AUDIENCE</ArticleCode>, keep access tokens to 15 minutes or less, and turn
          on <ArticleCode>ROTATE_REFRESH_TOKENS</ArticleCode> with <ArticleCode>BLACKLIST_AFTER_ROTATION</ArticleCode>. Logout
          blacklists the refresh token; the access token lives until <ArticleCode>exp</ArticleCode>. For Django Ninja, use
          <ArticleCode>django-ninja-jwt</ArticleCode>. For general hardening, see
          <a href="/jwt-security-best-practices" className={link}> JWT security best practices</a>.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
