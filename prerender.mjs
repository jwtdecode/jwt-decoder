/**
 * Prerender every route in dist/ using the SSR bundle.
 * Reads dist/index.html as the template, renders each route through
 * src/entry-server.tsx, and writes dist/<route>/index.html with the
 * Helmet-driven head and the route-specific markup.
 *
 * Output layout (so nginx try_files $uri/ serves the right file):
 *   /                        -> dist/index.html
 *   /what-is-a-jwt           -> dist/what-is-a-jwt/index.html
 *   /jwt-claims-explained    -> dist/jwt-claims-explained/index.html
 *   …
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const SERVER_BUNDLE = path.join(DIST, 'server', 'entry-server.js');

const ROUTES = [
  '/',
  '/guides',
  '/what-is-a-jwt',
  '/jwt-header-payload-signature-explained',
  '/jwt-claims-explained',
  '/jwt-verification-guide',
  '/hs256-vs-rs256',
  '/jwt-security-best-practices',
  '/common-jwt-errors-and-fixes',
  '/jwt-decoder-vs-jwt-validator',
  '/jwt-vs-session-tokens',
  '/jwt-in-oauth2-and-openid-connect',
  '/how-to-decode-jwt-in-javascript-python-go',
  '/es256-explained',
  '/ps256-vs-rs256',
  '/none-algorithm-vulnerability',
  '/decode-jwt-without-a-server',
  '/jwt-storage-localstorage-vs-cookie',
  '/jwt-refresh-token-pattern',
  '/how-to-debug-a-jwt',
  '/jwt-io-alternative',
  '/what-is-jwks',
  '/validate-azure-entra-id-jwt',
  '/validate-aws-cognito-jwt',
  '/jwt-websocket-authentication',
  '/jwt-vs-saml',
  '/jwt-vs-oauth',
  '/jwt-vs-bearer-token',
  '/jwt-vs-api-key',
  '/jwt-size-limit',
  '/jwt-secret-key-generator',
  '/jwt-scopes-vs-roles',
  '/jwt-logout-and-revocation',
  '/jwt-kid-header',
  '/jwt-in-microservices',
  '/jwt-expiration-time',
  '/jwt-curl-postman',
  '/jwt-authentication-spring-boot',
  '/jwt-authentication-nodejs-express',
  '/jwt-authentication-nextjs',
  '/jwt-authentication-fastapi',
  '/jwt-authentication-django',
  '/jwt-authentication-aspnet-core',
  '/jwt-audience-claim',
  '/jwt-attacks-and-vulnerabilities',
  '/is-jwt-encrypted-jws-vs-jwe',
  '/generate-jwt-signing-keys-openssl',
  '/decode-jwt-command-line',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/how-it-works',
  '/404',
];

// Preload the Latin Inter file (body text font) so first paint isn't waiting
// on CSS discovery of the hashed woff2.
const interLatin = (await fs.readdir(path.join(DIST, 'assets')))
  .find(f => /^inter-latin-wght-normal-.*\.woff2$/.test(f));
const fontPreload = interLatin
  ? `<link rel="preload" href="/assets/${interLatin}" as="font" type="font/woff2" crossorigin />\n    `
  : '';

let template = (await fs.readFile(path.join(DIST, 'index.html'), 'utf-8'))
  .replace('<!--app-head-->', () => fontPreload + '<!--app-head-->');

// Inline the (small) main stylesheet so first paint doesn't wait on a
// render-blocking CSS request. Asset URLs inside it are root-absolute.
const cssLink = template.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/);
if (cssLink) {
  const css = await fs.readFile(path.join(DIST, cssLink[1]), 'utf-8');
  template = template.replace(cssLink[0], () => `<style>${css}</style>`);
}
const { render } = await import(SERVER_BUNDLE);

let count = 0;
for (const route of ROUTES) {
  const { html, head } = await render(route);

  // Function replacers: a string replacement would expand $&, $' and $$
  // sequences that appear in page content (e.g. C# interpolated strings).
  const page = route === '/404'
    ? template.replace(/\n\s*<meta name="(?:robots|googlebot)"[^>]*>/g, '')
    : template;
  const finalHtml = page
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => html);

  const outFile = route === '/'
    ? path.join(DIST, 'index.html')
    : route === '/404'
      ? path.join(DIST, '404.html')                 // top-level for nginx error_page
      : path.join(DIST, route.replace(/^\//, ''), 'index.html');

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, finalHtml, 'utf-8');
  console.log(`  ✓ ${route.padEnd(46)} -> ${path.relative(DIST, outFile)}`);
  count++;
}

// SSR bundle is a build artefact only — no need to ship it in the image.
await fs.rm(path.join(DIST, 'server'), { recursive: true, force: true });

console.log(`\nPrerendered ${count} routes.`);
