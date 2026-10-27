import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticleCode, ArticlePre, ArticleCallout, ArticleIntroBox } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'WebSocket JWT Authentication: Passing and Verifying a Token on the Handshake',
  description: 'How to authenticate a WebSocket with a JWT when the browser cannot set custom headers: cookies, first-message auth, the subprotocol trick, ticket exchange, plus runnable ws and Socket.IO examples.',
  url: 'https://jwtdecode.app/jwt-websocket-authentication',
  mainEntityOfPage: 'https://jwtdecode.app/jwt-websocket-authentication',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const LINK = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const OPTIONS: [approach: string, worksInBrowser: string, risk: string][] = [
  ['Cookie on the handshake', 'Yes (sent automatically)', 'Cross-site hijacking (CSWSH) unless Origin is checked'],
  ['Token in the first message', 'Yes', 'Connection open but unauthenticated for a moment'],
  ['Sec-WebSocket-Protocol subprotocol', 'Yes', 'Token in a header the server must echo; awkward, size limits'],
  ['Query string ?token=', 'Yes', 'Logged in access logs and proxies'],
  ['Authorization header', 'No (browser API forbids it)', 'Fine for server-to-server clients only'],
  ['Short-lived ticket', 'Yes', 'Needs an extra HTTP endpoint to mint the ticket'],
];

export default function JwtWebsocketAuthPage() {
  return (
    <>
      <SEOHead
        title="WebSocket JWT Authentication: The Right Way"
        description="WebSocket JWT authentication when the browser can't set headers: cookies, first-message auth, subprotocols and tickets, with runnable ws and Socket.IO code."
        path="/jwt-websocket-authentication"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'WebSocket JWT Auth' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/jwt-verification-guide', label: 'Verification Guide', description: 'What to check when you verify the token on the handshake.' },
          { to: '/jwt-storage-localstorage-vs-cookie', label: 'Where to Store a JWT', description: 'Cookies vs localStorage, which decides your handshake options.' },
          { to: '/jwt-authentication-nodejs-express', label: 'JWT Auth in Node.js', description: 'The HTTP side of the same token, in Express.' },
          { to: '/jwt-logout-and-revocation', label: 'Logout & Revocation', description: 'Closing live connections when a token is revoked.' },
        ]}
      >
        <ArticleH1>WebSocket JWT Authentication: Passing and Verifying a Token on the Handshake</ArticleH1>

        <ArticleIntroBox>
          The problem with WebSocket JWT authentication is one browser limitation: the browser
          <ArticleCode> WebSocket</ArticleCode> constructor takes only a URL and an optional subprotocol, so a
          page cannot set an <ArticleCode>Authorization: Bearer</ArticleCode> header on the handshake the way
          <ArticleCode> fetch</ArticleCode> can. That rules out the obvious approach and leaves four that work
          from a browser: send the token in a <strong>cookie</strong> the browser attaches automatically, send it
          in the <strong>first message</strong> after the socket opens, smuggle it through the
          <strong> Sec-WebSocket-Protocol</strong> subprotocol header, or put it in the <strong>query string</strong>
          (which gets logged). The most robust pattern is a short-lived <strong>ticket</strong>: the page fetches
          a one-time token over authenticated HTTP, then opens the socket with that. Whichever you pick, verify
          the token during the HTTP upgrade and check the <ArticleCode>Origin</ArticleCode> header. This guide has
          runnable code for the <ArticleCode>ws</ArticleCode> library and Socket.IO, plus Spring and FastAPI
          pointers.
        </ArticleIntroBox>

        <ArticleH2 id="websocket-jwt-header">Why You Can't Just Set a WebSocket JWT Header</ArticleH2>
        <ArticleP>
          A WebSocket connection begins as an ordinary HTTP GET carrying an <ArticleCode>Upgrade: websocket</ArticleCode>
          header (RFC 6455). On the server you have full access to that request, including headers and cookies. The
          asymmetry is on the client: the browser's <ArticleCode>WebSocket(url, protocols)</ArticleCode> API
          deliberately exposes no way to add request headers. Non-browser clients do not have this restriction,
          Node's <ArticleCode>ws</ArticleCode>, Python's <ArticleCode>websockets</ArticleCode> and most native
          libraries let you pass an <ArticleCode>Authorization</ArticleCode> header, which is why so much advice
          that "just sends a header" only works outside the browser. The table below is the honest menu for
          browser clients.
        </ArticleP>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Approach</th>
                <th className="px-3 py-2 font-semibold">Works in a browser?</th>
                <th className="px-3 py-2 font-semibold">Main risk</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {OPTIONS.map(([approach, works, risk]) => (
                <tr key={approach} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{approach}</td>
                  <td className="px-3 py-2">{works}</td>
                  <td className="px-3 py-2">{risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="websocket-jwt-token-options">Four Ways to Pass a WebSocket JWT Token</ArticleH2>
        <ArticleH3 id="cookie-handshake">1. Cookie on the handshake</ArticleH3>
        <ArticleP>
          If your access token already lives in an HttpOnly cookie, the browser sends it on the upgrade request
          automatically and you verify it server-side. This is clean and keeps the token out of JavaScript, but
          it inherits the cross-site risk of any cookie auth: a page on another origin can open a WebSocket to
          your server and the cookie rides along. This is <strong>Cross-Site WebSocket Hijacking (CSWSH)</strong>.
          WebSocket handshakes are not covered by the same-origin policy or CORS, so you must check the
          <ArticleCode> Origin</ArticleCode> header yourself and reject unknown origins. A SameSite cookie helps
          but is not sufficient across all browsers, so keep the Origin check. Whether your token is in a cookie
          at all is decided earlier, at storage time; see{' '}
          <a href="/jwt-storage-localstorage-vs-cookie" className={LINK}>where to store a JWT</a>.
        </ArticleP>
        <ArticleH3 id="first-message">2. Token in the first message</ArticleH3>
        <ArticleP>
          Open the socket, then have the client send <ArticleCode>{'{ "type": "auth", "token": "..." }'}</ArticleCode>
          as its first frame. The server starts a short timer on connect and closes the socket if a valid token
          does not arrive in time. This works everywhere and keeps the token out of the URL, at the cost of a
          brief window where the connection is open but unauthenticated, during which you must send nothing and
          accept nothing else.
        </ArticleP>
        <ArticleH3 id="subprotocol-trick">3. The Sec-WebSocket-Protocol subprotocol trick</ArticleH3>
        <ArticleP>
          The one header the browser <em>does</em> let you influence is the subprotocol list, via the second
          argument to <ArticleCode>new WebSocket(url, protocols)</ArticleCode>. A common trick passes two
          "protocols": a real marker and the token, for example
          <ArticleCode> new WebSocket(url, ['access_token', jwt])</ArticleCode>. The server reads the token from
          <ArticleCode> Sec-WebSocket-Protocol</ArticleCode> and, importantly, must echo one accepted subprotocol
          back or compliant browsers abort the connection. Caveats: the token is now visible in a header (so still
          keep connections over TLS), header size limits apply, and it is a misuse of a field meant for protocol
          negotiation, so document it. It is popular because it is the only way to get a token into a request
          header from a browser without a cookie.
        </ArticleP>
        <ArticleH3 id="query-string">4. Query string (with a caveat)</ArticleH3>
        <ArticleP>
          <ArticleCode>new WebSocket('wss://host/ws?token=' + jwt)</ArticleCode> is the simplest option and works
          everywhere, but the full URL, token included, tends to be written to server access logs, proxy logs and
          any monitoring in the path. A bearer token in logs is a credential in logs. If you must use it, keep the
          token short-lived and prefer a single-use ticket (below) so a logged value expires almost immediately.
        </ArticleP>

        <ArticleH2 id="short-lived-ticket">The Short-Lived Ticket Pattern</ArticleH2>
        <ArticleP>
          The pattern that sidesteps every drawback: before connecting, the page makes an authenticated HTTP call
          (where it <em>can</em> send a normal <ArticleCode>Authorization</ArticleCode> header) to an endpoint that
          returns a one-time, short-lived ticket, seconds, not minutes. It then opens the socket with
          <ArticleCode> ?ticket=...</ArticleCode>. The server validates and immediately burns the ticket. Because
          the ticket is single-use and expires almost at once, its appearance in a log is close to harmless, and
          your long-lived access token never touches the WebSocket URL. This is the approach large real-time
          services generally use.
        </ArticleP>

        <ArticleH2 id="websocket-jwt-node-ws">Verifying a JWT on the Upgrade with Node and ws</ArticleH2>
        <ArticleP>
          Verify during the HTTP upgrade so an unauthenticated client never becomes a live WebSocket. Using
          <ArticleCode> noServer: true</ArticleCode> gives you the raw upgrade request to check the token and the
          <ArticleCode> Origin</ArticleCode> before calling <ArticleCode>handleUpgrade</ArticleCode>. This example
          runs against a live server and was tested end to end.
        </ArticleP>
        <ArticlePre lang="javascript">{`// npm install ws jose   (Node 18+, ES module)
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const ALLOWED_ORIGINS = new Set(['https://app.example.com']);

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

function reject(socket, status, text) {
  socket.write(\`HTTP/1.1 \${status} \${text}\\r\\nConnection: close\\r\\n\\r\\n\`);
  socket.destroy();
}

server.on('upgrade', async (req, socket, head) => {
  socket.on('error', () => socket.destroy());

  // Defend against Cross-Site WebSocket Hijacking: the handshake is not covered by CORS
  if (!ALLOWED_ORIGINS.has(req.headers.origin)) return reject(socket, 403, 'Forbidden');

  // Token from a cookie (browser) or Authorization header (native clients)
  const cookie = /(?:^|;\\s*)access_token=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  const bearer = req.headers.authorization?.replace(/^Bearer /, '');
  const token = cookie ?? bearer;
  if (!token) return reject(socket, 401, 'Unauthorized');

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'https://auth.example.com',
      audience: 'realtime-api',
    });
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, payload));
  } catch {
    reject(socket, 401, 'Unauthorized');
  }
});

wss.on('connection', (ws, req, user) => {
  // Long-lived connection: close it when the token expires (see re-auth below)
  const timer = setTimeout(() => ws.close(4001, 'token expired'), user.exp * 1000 - Date.now());
  ws.on('close', () => clearTimeout(timer));
  ws.send(\`hello \${user.sub}\`);
});

server.listen(8080);`}</ArticlePre>
        <ArticleCallout type="info">
          Tested locally with <ArticleCode>ws</ArticleCode> 8 and <ArticleCode>jose</ArticleCode> 6 on Node 22: a
          request with no token is rejected 401, a valid token from a disallowed <ArticleCode>Origin</ArticleCode>
          is rejected 403, and a valid same-origin token connects and is closed with code 4001 the moment the
          token expires.
        </ArticleCallout>
        <ArticleP>
          Verify exactly as you would on the HTTP side: pin the algorithm with an allow-list, and check
          <ArticleCode> iss</ArticleCode> and <ArticleCode>aud</ArticleCode>. The{' '}
          <a href="/jwt-verification-guide" className={LINK}>verification guide</a> covers each family; the checks
          do not change because the transport is a WebSocket.
        </ArticleP>

        <ArticleH2 id="socket-io-jwt">Socket.IO: the auth Option in the Handshake</ArticleH2>
        <ArticleP>
          Socket.IO has a dedicated place for this. The client passes an <ArticleCode>auth</ArticleCode> object (or
          a callback returning one) in the handshake, and the server reads it from
          <ArticleCode> socket.handshake.auth</ArticleCode> inside a namespace middleware registered with
          <ArticleCode> io.use()</ArticleCode>. Calling <ArticleCode>next(err)</ArticleCode> refuses the
          connection. Tested with Socket.IO 4.8.
        </ArticleP>
        <ArticlePre lang="javascript">{`// Server
import { Server } from 'socket.io';
import { jwtVerify } from 'jose';

const io = new Server(3000, { cors: { origin: 'https://app.example.com' } });
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

io.use(async (socket, next) => {
  try {
    const { payload } = await jwtVerify(socket.handshake.auth.token ?? '', secret, {
      algorithms: ['HS256'],
      audience: 'realtime-api',
    });
    socket.data.user = payload;
    next();
  } catch {
    next(new Error('unauthorised'));   // client sees a connect_error
  }
});

io.on('connection', (socket) => socket.emit('hello', socket.data.user.sub));

// Client
import { io } from 'socket.io-client';
const socket = io('https://app.example.com', { auth: (cb) => cb({ token: currentAccessToken }) });
socket.on('connect_error', (err) => console.log(err.message));`}</ArticlePre>
        <ArticleP>
          Using a callback for <ArticleCode>auth</ArticleCode> rather than a static object means the freshest token
          is read on every (re)connection attempt, which matters when tokens rotate. Socket.IO reconnects
          automatically, so returning an expired token here is the natural place for the client to refresh first.
        </ArticleP>

        <ArticleH2 id="spring-websocket-jwt">Spring WebSocket JWT (STOMP ChannelInterceptor)</ArticleH2>
        <ArticleP>
          Spring's messaging stack authenticates STOMP over WebSocket at the <ArticleCode>CONNECT</ArticleCode>
          frame, not the HTTP handshake, which suits browsers because the token can travel in a STOMP header the
          JavaScript client controls. You register a <ArticleCode>ChannelInterceptor</ArticleCode> on the client
          inbound channel, read the token from the <ArticleCode>CONNECT</ArticleCode> frame's headers, and call
          <ArticleCode> accessor.setUser(...)</ArticleCode>.
        </ArticleP>
        <ArticlePre lang="java">{`@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
      @Override
      public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
          String token = accessor.getFirstNativeHeader("Authorization"); // set by the JS client
          // validate the JWT, then:
          // accessor.setUser(authenticatedPrincipal);
        }
        return message;
      }
    });
  }
}`}</ArticlePre>
        <ArticleP>
          The Spring reference notes two things worth repeating: browser clients "can use only standard
          authentication headers ... or cookies and cannot provide custom headers" on the raw WebSocket, which is
          why the token goes in a STOMP frame header instead; and if you combine this with Spring Security message
          authorisation, your interceptor must run first, declared in its own
          <ArticleCode> WebSocketMessageBrokerConfigurer</ArticleCode> annotated
          <ArticleCode> @Order(Ordered.HIGHEST_PRECEDENCE + 99)</ArticleCode>. Confirm exact class names against
          your Spring version. See <a href="/jwt-authentication-spring-boot" className={LINK}>JWT in Spring Boot</a>
          for the HTTP side.
        </ArticleP>

        <ArticleH2 id="fastapi-websocket-jwt">FastAPI WebSocket JWT</ArticleH2>
        <ArticleP>
          FastAPI lets a WebSocket endpoint use the same dependency injection as HTTP routes, including
          <ArticleCode> Cookie</ArticleCode> and <ArticleCode>Query</ArticleCode>. Because a browser cannot set a
          header, the documented approach reads the token from a cookie or a query parameter and raises
          <ArticleCode> WebSocketException(code=status.WS_1008_POLICY_VIOLATION)</ArticleCode> to reject it.
        </ArticleP>
        <ArticlePre lang="python">{`from typing import Annotated
from fastapi import (
    Cookie, Depends, FastAPI, Query, WebSocket, WebSocketException, status,
)
import jwt   # PyJWT

app = FastAPI()

async def get_token(
    websocket: WebSocket,
    session: Annotated[str | None, Cookie()] = None,
    token: Annotated[str | None, Query()] = None,
):
    raw = session or token
    if raw is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    try:
        return jwt.decode(raw, SECRET, algorithms=["HS256"], audience="realtime-api")
    except jwt.PyJWTError:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

@app.websocket("/ws")
async def ws(websocket: WebSocket, claims: Annotated[dict, Depends(get_token)]):
    await websocket.accept()
    await websocket.send_text(f"hello {claims['sub']}")`}</ArticlePre>
        <ArticleP>
          The cookie path is preferable to the query path for the logging reason above; the query path pairs well
          with the ticket pattern. See <a href="/jwt-authentication-fastapi" className={LINK}>JWT authentication in
          FastAPI</a> for token issuance and the PyJWT verification options.
        </ArticleP>

        <ArticleH2 id="long-lived-connections">Re-Authenticating Long-Lived Connections</ArticleH2>
        <ArticleP>
          A WebSocket can stay open for hours; the token that opened it expires in minutes. Verification happens
          once at the handshake, so an expired token does not close an established socket on its own. Two
          approaches, often combined:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Close on expiry</strong>: at connect time, schedule a timer for <ArticleCode>exp</ArticleCode> and close the socket (application close code such as 4001) when it fires, forcing the client to reconnect with a fresh token, as in the <ArticleCode>ws</ArticleCode> example.</ArticleLi>
          <ArticleLi><strong>Re-auth in band</strong>: let the client send a new token over the open connection before the old one expires; the server re-verifies and resets the timer, avoiding a reconnect.</ArticleLi>
        </ArticleUl>
        <ArticleP>
          If you revoke tokens (see <a href="/jwt-logout-and-revocation" className={LINK}>JWT logout and
          revocation</a>), remember that live sockets outlive the revocation unless you also track connections per
          user and close them on logout.
        </ArticleP>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleP>
          Browser WebSockets cannot carry an <ArticleCode>Authorization</ArticleCode> header, so authenticate with
          a cookie (and always check <ArticleCode>Origin</ArticleCode> against CSWSH), a first message, the
          subprotocol trick, or best of all a short-lived single-use ticket. Verify the JWT during the HTTP
          upgrade with the same algorithm allow-list, <ArticleCode>iss</ArticleCode> and <ArticleCode>aud</ArticleCode>
          checks you use over HTTP, and reject before the socket goes live. For long-lived connections, close or
          re-authenticate when the token expires. The <ArticleCode>ws</ArticleCode> and Socket.IO examples above
          are tested; Spring and FastAPI expose the same idea at the STOMP CONNECT frame and through dependency
          injection respectively. If a handshake is refused, decode the token you sent in{' '}
          <a href="/" className={LINK}>the jwtdecode.app decoder</a>, which runs entirely in your browser, to
          confirm its <ArticleCode>aud</ArticleCode> and <ArticleCode>exp</ArticleCode> before blaming the socket.
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
