import { base64urlEncode } from './jwt';

/**
 * Build a demo token at call-time so timestamps are always current.
 * The signature is intentionally fake — labeled clearly in the UI.
 */
export function buildSampleToken(): string {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT', kid: 'demo-key-2024' };
  const payload = {
    sub: 'user_demo_123',
    name: 'Jane Developer',
    email: 'jane@example.com',
    roles: ['developer', 'api:read', 'api:write'],
    org: 'example-corp',
    iss: 'https://auth.example.com',
    aud: ['https://api.example.com', 'https://app.example.com'],
    iat: now - 300,
    nbf: now - 300,
    exp: now + 3300,
    jti: 'demo-jti-not-a-real-token',
  };

  const h = base64urlEncode(JSON.stringify(header));
  const p = base64urlEncode(JSON.stringify(payload));
  // A placeholder signature that is clearly fake and visually distinguishable
  const sig = 'DEMO_SIG_NOT_VERIFIED_replace-with-real-token';

  return `${h}.${p}.${sig}`;
}
