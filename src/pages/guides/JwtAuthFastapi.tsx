import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'FastAPI JWT Authentication with PyJWT, OAuth2PasswordBearer and Argon2',
  description: 'A tested FastAPI JWT authentication tutorial: hash passwords with pwdlib and Argon2, issue tokens with PyJWT, protect routes with an OAuth2PasswordBearer dependency, verify identity-provider tokens via JWKS, and authenticate WebSockets.',
  url: 'https://jwtdecode.app/jwt-authentication-fastapi',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-authentication-fastapi',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const ERRORS: [exception: string, meaning: string][] = [
  ['ExpiredSignatureError', 'exp is in the past (beyond leeway). Message: "Signature has expired".'],
  ['InvalidSignatureError', 'Signature does not match the key. Message: "Signature verification failed".'],
  ['InvalidAudienceError', 'aud does not match the audience you passed.'],
  ['InvalidIssuerError', 'iss does not match the issuer you passed.'],
  ['MissingRequiredClaimError', 'A claim listed in options["require"] is absent, e.g. "Token is missing the "aud" claim".'],
  ['DecodeError', 'Not a JWT at all, e.g. "Not enough segments".'],
  ['InvalidAlgorithmError', 'The header alg is not in your algorithms list.'],
];

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

export default function JwtAuthFastapiPage() {
  return (
    <>
      <SEOHead
        title="FastAPI JWT Authentication with PyJWT"
        description="FastAPI JWT authentication, tested: Argon2 password hashing, PyJWT tokens, an OAuth2PasswordBearer dependency, JWKS verification and WebSocket auth."
        path="/jwt-authentication-fastapi"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'JWT in FastAPI' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-authentication-django', label: 'JWT in Django REST Framework', description: 'The Django route: Simple JWT, rotation and blacklist logout.' },
          { to: '/jwt-websocket-authentication', label: 'JWT WebSocket Authentication', description: 'Query string, subprotocol and first-message token patterns.' },
          { to: '/jwt-refresh-token-pattern', label: 'Refresh Token Pattern', description: 'Short access tokens plus rotating refresh tokens.' },
          { to: '/how-to-decode-jwt-in-javascript-python-go', label: 'Decode JWT in Python', description: 'Reading token contents with PyJWT and the standard library.' },
        ]}
      >
        <ArticleH1>FastAPI JWT Authentication with PyJWT, OAuth2PasswordBearer and Argon2</ArticleH1>

        <ArticleIntroBox>
          FastAPI JWT authentication uses three pieces: a <ArticleCode>/token</ArticleCode> endpoint that checks the password and
          returns a signed JWT, an <ArticleCode>OAuth2PasswordBearer</ArticleCode> dependency that pulls the token from the
          <ArticleCode>Authorization</ArticleCode> header, and a <ArticleCode>get_current_user</ArticleCode> dependency that verifies
          it with PyJWT and raises 401 on failure. FastAPI's own tutorial now uses PyJWT and <ArticleCode>pwdlib</ArticleCode> with
          Argon2, and so does this guide. The app below was run under Uvicorn and tested with <ArticleCode>TestClient</ArticleCode>
          on Python 3.12 with FastAPI 0.141.1, PyJWT 2.15.0, pwdlib 0.3.1 and Uvicorn 0.53.0.
        </ArticleIntroBox>

        <ArticleH2 id="how-it-works">How JWT Authentication Works in FastAPI</ArticleH2>
        <ArticleP>
          The flow follows the OAuth 2.0 password grant shape, simplified. The client posts a username and password as form data to
          <ArticleCode>/token</ArticleCode>. The server checks the password hash and, if it matches, returns a JSON body with
          <ArticleCode>access_token</ArticleCode> and <ArticleCode>token_type: "bearer"</ArticleCode>. From then on the client sends
          <ArticleCode>Authorization: Bearer &lt;token&gt;</ArticleCode> (RFC 6750) on every request.
        </ArticleP>
        <ArticleP>
          On the server side, <ArticleCode>OAuth2PasswordBearer</ArticleCode> does only one job: it extracts the token from that
          header, or responds 401 if the header is missing. It does not verify anything. Verification is your
          <ArticleCode>get_current_user</ArticleCode> dependency, which decodes the token with PyJWT, checks signature, algorithm,
          expiry, issuer and audience, and returns a user object. Endpoints declare that dependency and receive the user as a typed
          parameter. Because the token is self-contained, no session table is consulted on each request; that is the benefit, and
          also why revocation needs extra work (covered at the end). If you are weighing this against server-side sessions, see
          <a href="/jwt-vs-session-tokens" className={link}> JWT vs session tokens</a>.
        </ArticleP>

        <ArticleH2 id="install">Installing PyJWT and pwdlib</ArticleH2>
        <ArticlePre lang="bash">{`pip install fastapi "uvicorn[standard]" pyjwt "pwdlib[argon2]" python-multipart
# for RS256/ES256 tokens (JWKS), add the crypto extra:
pip install "pyjwt[crypto]"

export JWT_SECRET="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"`}</ArticlePre>
        <ArticleP>
          <ArticleCode>python-multipart</ArticleCode> is needed because the OAuth2 password flow posts form data. Older tutorials
          install <ArticleCode>python-jose</ArticleCode> and <ArticleCode>passlib</ArticleCode>; FastAPI's docs have since moved to
          <ArticleCode>pyjwt</ArticleCode> and <ArticleCode>pwdlib</ArticleCode>. passlib's last release was 1.7.4 in October 2020.
          Do not install the unrelated <ArticleCode>jwt</ArticleCode> package from PyPI alongside PyJWT: both provide a top-level
          <ArticleCode>jwt</ArticleCode> module, and whichever wins produces confusing <ArticleCode>AttributeError</ArticleCode>s.
        </ArticleP>

        <ArticleH2 id="fastapi-jwt-auth-example">A Complete FastAPI JWT Auth Example</ArticleH2>
        <ArticleP>
          This is a single-file app: password hashing, token issue, a verifying dependency, a role check and a protected route.
          Compared with the minimal version in FastAPI's tutorial, it adds <ArticleCode>iss</ArticleCode> and
          <ArticleCode>aud</ArticleCode> claims, requires them on decode, allows 30 seconds of clock skew and reads the secret from the
          environment.
        </ArticleP>
        <ArticlePre lang="python">{`# main.py
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET"]  # fail fast if missing
ALGORITHM = "HS256"
ISSUER = "https://api.example.com"
AUDIENCE = "https://api.example.com"
ACCESS_TOKEN_TTL = timedelta(minutes=15)

password_hash = PasswordHash.recommended()  # Argon2id
DUMMY_HASH = password_hash.hash("dummy-password")

# Stand-in for a users table. Store only hashes.
USERS = {
    "ada@example.com": {
        "id": "42",
        "role": "admin",
        "hashed_password": password_hash.hash("correct horse"),
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class CurrentUser(BaseModel):
    id: str
    role: str


def authenticate(email: str, password: str) -> dict | None:
    user = USERS.get(email)
    if user is None:
        password_hash.verify(password, DUMMY_HASH)  # equalise timing
        return None
    if not password_hash.verify(password, user["hashed_password"]):
        return None
    return user


def create_access_token(user: dict) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": user["id"],
        "role": user["role"],
        "iss": ISSUER,
        "aud": AUDIENCE,
        "iat": now,
        "exp": now + ACCESS_TOKEN_TTL,
    }
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> CurrentUser:
    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        issuer=ISSUER,
        audience=AUDIENCE,
        leeway=30,
        options={"require": ["exp", "iat", "iss", "aud", "sub"]},
    )
    return CurrentUser(id=payload["sub"], role=payload["role"])


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> CurrentUser:
    try:
        return decode_access_token(token)
    except ExpiredSignatureError:
        detail = "Token expired"
    except InvalidTokenError:
        detail = "Could not validate credentials"
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_role(role: str):
    async def checker(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user
    return checker


@app.post("/token")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = authenticate(form.username, form.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(
        access_token=create_access_token(user),
        expires_in=int(ACCESS_TOKEN_TTL.total_seconds()),
    )


@app.get("/me")
async def me(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    return user


@app.delete("/admin/cache")
async def clear_cache(user: Annotated[CurrentUser, Depends(require_role("admin"))]):
    return {"cleared_by": user.id}`}</ArticlePre>
        <ArticleP>
          A few details are deliberate. PyJWT converts <ArticleCode>datetime</ArticleCode> values for <ArticleCode>exp</ArticleCode>
          and <ArticleCode>iat</ArticleCode> into NumericDate integers, as RFC 7519 requires. The <ArticleCode>DUMMY_HASH</ArticleCode>
          check comes from FastAPI's tutorial: hashing even when the user does not exist stops response timing from revealing which
          email addresses have accounts. <ArticleCode>algorithms=[ALGORITHM]</ArticleCode> is a fixed allow-list, so a token whose
          header says <ArticleCode>none</ArticleCode> or <ArticleCode>RS256</ArticleCode> is rejected with
          <ArticleCode>InvalidAlgorithmError</ArticleCode>. The reasoning behind each claim is in
          <a href="/jwt-claims-explained" className={link}> JWT claims explained</a>.
        </ArticleP>
        <ArticleCallout type="info">
          PyJWT 2.15 emits an <ArticleCode>InsecureKeyLengthWarning</ArticleCode> when an HS256 key is shorter than 32 bytes. Treat
          it as an error: generate the secret with <ArticleCode>secrets.token_urlsafe(48)</ArticleCode> or
          <ArticleCode>openssl rand</ArticleCode>, as shown in the <a href="/jwt-secret-key-generator" className={link}>JWT secret
          key generator</a> guide.
        </ArticleCallout>

        <ArticleH3 id="hardening-token-endpoint">Hardening the /token endpoint</ArticleH3>
        <ArticleP>
          The login route is the one place an attacker can guess passwords, so rate-limit it by IP and by account, and return the
          same message for "no such user" and "wrong password". <ArticleCode>PasswordHash.recommended()</ArticleCode> produces
          Argon2id hashes (<ArticleCode>$argon2id$v=19$m=65536,t=3,p=4</ArticleCode> with pwdlib 0.3.1). When you later raise the
          cost parameters, <ArticleCode>password_hash.verify_and_update(password, stored_hash)</ArticleCode> returns a tuple of
          <ArticleCode>(valid, new_hash)</ArticleCode>; if <ArticleCode>new_hash</ArticleCode> is not <ArticleCode>None</ArticleCode>,
          save it, and users are migrated to the stronger settings as they log in.
        </ArticleP>
        <ArticleP>
          HS256 with one shared secret is right when the same service issues and verifies tokens. If several services need to verify
          tokens that only one service issues, switch to RS256 or ES256: the issuer keeps the private key and publishes the public
          key, so a compromised downstream service cannot mint tokens. The trade-offs are in
          <a href="/hs256-vs-rs256" className={link}> HS256 vs RS256</a>.
        </ArticleP>

        <ArticleH2 id="fastapi-jwt-token-test">Running and Testing the FastAPI JWT Token Flow</ArticleH2>
        <ArticlePre lang="bash">{`uvicorn main:app --reload

TOKEN=$(curl -s -X POST localhost:8000/token \\
  --data-urlencode username=ada@example.com \\
  --data-urlencode "password=correct horse" | jq -r .access_token)

curl -s localhost:8000/me -H "Authorization: Bearer $TOKEN"
# {"id":"42","role":"admin"}`}</ArticlePre>
        <ArticleP>
          The interactive docs at <ArticleCode>/docs</ArticleCode> show an Authorize button, because
          <ArticleCode>OAuth2PasswordBearer</ArticleCode> registers the security scheme in the OpenAPI schema. For automated tests,
          <ArticleCode>TestClient</ArticleCode> exercises the same code paths without a server:
        </ArticleP>
        <ArticlePre lang="python">{`# test_main.py  (run with: JWT_SECRET=... pytest)
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_login_and_me():
    r = client.post("/token", data={"username": "ada@example.com", "password": "correct horse"})
    assert r.status_code == 200
    token = r.json()["access_token"]
    assert client.get("/me", headers={"Authorization": f"Bearer {token}"}).json() == {"id": "42", "role": "admin"}

def test_rejects_missing_and_tampered_tokens():
    assert client.get("/me").status_code == 401
    assert client.get("/me", headers={"Authorization": "Bearer abc.def.ghi"}).status_code == 401`}</ArticlePre>
        <ArticleP>
          In testing, no token returned 401 <ArticleCode>{'{"detail":"Not authenticated"}'}</ArticleCode> with
          <ArticleCode>WWW-Authenticate: Bearer</ArticleCode>; a tampered, wrong-audience or expired token returned 401; and a
          valid non-admin token on <ArticleCode>/admin/cache</ArticleCode> returned 403. Starlette 1.7 prints a deprecation
          warning suggesting <ArticleCode>httpx2</ArticleCode> as the <ArticleCode>TestClient</ArticleCode> transport; the tests
          still pass with <ArticleCode>httpx</ArticleCode>. To inspect a token the API rejects, paste it into the
          <a href="/" className={link}> jwtdecode.app decoder</a>, which runs locally in the browser, and compare
          <ArticleCode>iss</ArticleCode>, <ArticleCode>aud</ArticleCode> and <ArticleCode>exp</ArticleCode> against the values above.
        </ArticleP>

        <ArticleH3 id="pyjwt-errors">PyJWT exceptions you will see</ArticleH3>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Exception</th>
                <th className="px-3 py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {ERRORS.map(([exception, meaning]) => (
                <tr key={exception} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{exception}</td>
                  <td className="px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ArticleP>
          All of these subclass <ArticleCode>InvalidTokenError</ArticleCode>, which is why a single <ArticleCode>except</ArticleCode>
          covers them. More causes and fixes are in <a href="/common-jwt-errors-and-fixes" className={link}>common JWT errors</a>.
        </ArticleP>

        <ArticleH2 id="fastapi-jwt-middleware">FastAPI JWT Middleware vs Dependencies</ArticleH2>
        <ArticleP>
          People search for "FastAPI JWT middleware", but in FastAPI the idiomatic tool is a dependency, not middleware. A
          dependency gives the endpoint a typed <ArticleCode>CurrentUser</ArticleCode>, shows up in the OpenAPI schema, can be
          overridden in tests with <ArticleCode>app.dependency_overrides</ArticleCode>, and can be applied per route, per router or to
          the whole app:
        </ArticleP>
        <ArticlePre lang="python">{`from fastapi import APIRouter

# every route on this router requires a valid token
orders = APIRouter(prefix="/orders", dependencies=[Depends(get_current_user)])

# or the whole app (then exempt /token by mounting it on a separate app or router)
# app = FastAPI(dependencies=[Depends(get_current_user)])`}</ArticlePre>
        <ArticleP>
          ASGI middleware sees every request, including <ArticleCode>/docs</ArticleCode> and <ArticleCode>/token</ArticleCode>, and
          has no clean way to pass a typed user to the endpoint or to document the scheme. Use middleware for cross-cutting concerns
          such as logging or rejecting obviously malformed headers, and dependencies for authentication and authorisation.
        </ArticleP>
        <ArticleP>
          Dependencies also make tests simpler. In a test that is about business logic rather than auth, set
          <ArticleCode>app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="42", role="admin")</ArticleCode> and the
          endpoint receives that user without any token being minted. Keep at least one end-to-end test, like the ones above, that
          goes through the real <ArticleCode>/token</ArticleCode> route and the real decode, so a broken issuer or audience setting
          cannot hide behind the override.
        </ArticleP>

        <ArticleH2 id="cookie-instead-of-header">Using an HttpOnly Cookie Instead of the Header</ArticleH2>
        <ArticleP>
          For a browser front end served from the same site, an <ArticleCode>HttpOnly</ArticleCode> cookie keeps the token out of
          reach of injected JavaScript, which <ArticleCode>localStorage</ArticleCode> cannot do. FastAPI's
          <ArticleCode>Response.set_cookie</ArticleCode> and the <ArticleCode>Cookie()</ArticleCode> parameter are enough; the same
          <ArticleCode>decode_access_token</ArticleCode> function does the verification.
        </ArticleP>
        <ArticlePre lang="python">{`from fastapi import Cookie, Response

@app.post("/login-cookie")
async def login_cookie(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response):
    user = authenticate(form.username, form.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    response.set_cookie(
        "access_token", create_access_token(user),
        httponly=True, secure=True, samesite="lax", max_age=900,
    )
    return {"ok": True}


async def get_user_from_cookie(access_token: Annotated[str | None, Cookie()] = None) -> CurrentUser:
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return decode_access_token(access_token)
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")`}</ArticlePre>
        <ArticleP>
          Cookies are sent automatically, so state-changing routes need CSRF protection: <ArticleCode>SameSite=Lax</ArticleCode>
          blocks cross-site POSTs in modern browsers, and a CSRF token or an <ArticleCode>Origin</ArticleCode> header check covers the
          rest. The full comparison is in <a href="/jwt-storage-localstorage-vs-cookie" className={link}>JWT storage: localStorage vs
          cookie</a>.
        </ArticleP>

        <ArticleH2 id="identity-provider-tokens">Verifying Tokens from an Identity Provider (JWKS)</ArticleH2>
        <ArticleP>
          If Auth0, Entra ID, Cognito or Keycloak issues the tokens, verify them with the provider's public keys.
          <ArticleCode>PyJWKClient</ArticleCode> fetches and caches the JWKS and selects the key by <ArticleCode>kid</ArticleCode>.
          Background on key sets is in <a href="/what-is-jwks" className={link}>what is JWKS</a>.
        </ArticleP>
        <ArticlePre lang="python">{`from jwt import PyJWKClient, PyJWTError

jwks_client = PyJWKClient(os.environ["JWKS_URI"], cache_keys=True, lifespan=300)

def get_provider_claims(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=os.environ["OIDC_ISSUER"],
            audience=os.environ["API_AUDIENCE"],
        )
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token",
                            headers={"WWW-Authenticate": "Bearer"})`}</ArticlePre>
        <ArticleP>
          Two details matter here. In testing, an unknown <ArticleCode>kid</ArticleCode> raises
          <ArticleCode>PyJWKClientError</ArticleCode>, which is <em>not</em> a subclass of <ArticleCode>InvalidTokenError</ArticleCode>,
          so catch the base <ArticleCode>PyJWTError</ArticleCode> here or the request becomes a 500. And the key fetch uses blocking
          I/O, so this dependency is a plain <ArticleCode>def</ArticleCode>: FastAPI runs sync dependencies in a thread pool rather
          than blocking the event loop.
        </ArticleP>

        <ArticleH2 id="fastapi-websocket-jwt">FastAPI WebSocket JWT Authentication</ArticleH2>
        <ArticleP>
          Browsers cannot set an <ArticleCode>Authorization</ArticleCode> header on a WebSocket handshake, so
          <ArticleCode>OAuth2PasswordBearer</ArticleCode> does not apply. The simplest option is a short-lived token in the query
          string, verified before <ArticleCode>accept()</ArticleCode>:
        </ArticleP>
        <ArticlePre lang="python">{`from fastapi import WebSocket, WebSocketException

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket, token: str | None = None):
    try:
        user = decode_access_token(token or "")
    except InvalidTokenError:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    await websocket.accept()
    await websocket.send_json({"hello": user.id})`}</ArticlePre>
        <ArticleP>
          An invalid token closed the connection with code 1008 in testing. Query strings end up in access logs, so use a dedicated,
          very short-lived ticket rather than the main access token, or pass the token in the
          <ArticleCode>Sec-WebSocket-Protocol</ArticleCode> header or the first message. Long-lived sockets also outlive the token's
          <ArticleCode>exp</ArticleCode>; the trade-offs are covered in <a href="/jwt-websocket-authentication" className={link}>JWT
          WebSocket authentication</a>.
        </ArticleP>

        <ArticleH2 id="refresh-and-logout">Refresh Tokens and Logout in FastAPI</ArticleH2>
        <ArticleP>
          The 15-minute access token above needs a renewal path. Issue an opaque refresh token at login, store a hash of it in your
          database with the user ID and expiry, and expose <ArticleCode>POST /token/refresh</ArticleCode> that validates, rotates and
          returns a new access token. Logout deletes the stored refresh token; the access token simply runs out. If you need instant
          revocation, add a <ArticleCode>jti</ArticleCode> claim and check it against a deny-list in
          <ArticleCode>get_current_user</ArticleCode>. See the <a href="/jwt-refresh-token-pattern" className={link}>refresh token
          pattern</a> and <a href="/jwt-logout-and-revocation" className={link}>JWT logout and revocation</a>.
        </ArticleP>

        <ArticleH2 id="production-checklist">FastAPI JWT Production Checklist</ArticleH2>
        <ArticleUl>
          <ArticleLi><ArticleCode>algorithms=[...]</ArticleCode> fixed in code, never read from the token header.</ArticleLi>
          <ArticleLi><ArticleCode>issuer</ArticleCode>, <ArticleCode>audience</ArticleCode> and <ArticleCode>options={'{"require": [...]}'}</ArticleCode> passed to every <ArticleCode>jwt.decode</ArticleCode> call.</ArticleLi>
          <ArticleLi>Access tokens of 15 minutes or less, with a small <ArticleCode>leeway</ArticleCode>.</ArticleLi>
          <ArticleLi>Secret or private key from the environment or a secrets manager, at least 32 random bytes for HS256.</ArticleLi>
          <ArticleLi>401 with <ArticleCode>WWW-Authenticate: Bearer</ArticleCode> for authentication failures, 403 for role failures.</ArticleLi>
          <ArticleLi>Rate limiting on <ArticleCode>/token</ArticleCode>, and HTTPS in front of Uvicorn.</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          FastAPI JWT authentication is a <ArticleCode>/token</ArticleCode> route that verifies an Argon2 hash with
          <ArticleCode>pwdlib</ArticleCode> and returns <ArticleCode>jwt.encode(...)</ArticleCode>, plus a
          <ArticleCode>get_current_user</ArticleCode> dependency built on <ArticleCode>OAuth2PasswordBearer</ArticleCode> that calls
          <ArticleCode>jwt.decode</ArticleCode> with a fixed <ArticleCode>algorithms</ArticleCode> list, issuer, audience and required
          claims, and raises 401 on <ArticleCode>InvalidTokenError</ArticleCode>. Apply it with dependencies rather than middleware,
          use <ArticleCode>PyJWKClient</ArticleCode> for provider tokens, keep access tokens short, and handle WebSockets separately.
          For general hardening, see <a href="/jwt-security-best-practices" className={link}>JWT security best practices</a>.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
