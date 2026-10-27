import type { DecodedJwt, JwtHeader, JwtPayload, AlgorithmFamily } from '../types/jwt';

/** Convert base64url encoding to a UTF-8 string. Handles padding and url-safe chars. */
export function base64urlDecode(str: string): string {
  // Normalize: url-safe → standard base64, then add padding
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Convert base64url string to Uint8Array (used for crypto operations). */
export function base64urlToBytes(str: string): Uint8Array<ArrayBuffer> {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Convert a string to base64url encoding (used for building demo tokens). */
export function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function safeJsonParse(str: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Decode a JWT string into its parts. Does NOT verify the signature. */
export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  const parts = trimmed.split('.');

  if (parts.length !== 3) {
    return {
      raw: { header: parts[0] ?? '', payload: parts[1] ?? '', signature: parts[2] ?? '' },
      header: {},
      payload: {},
      isValid: false,
      error:
        parts.length < 3
          ? `Incomplete JWT — found ${parts.length} part${parts.length !== 1 ? 's' : ''}, expected 3`
          : `Malformed JWT — found ${parts.length} segments, expected exactly 3`,
    };
  }

  const [headerB64, payloadB64, signature] = parts;

  // Decode header
  let header: JwtHeader;
  try {
    const raw = base64urlDecode(headerB64);
    const parsed = safeJsonParse(raw);
    if (!parsed) throw new Error('Header decoded but is not a valid JSON object');
    header = parsed as JwtHeader;
  } catch (e) {
    return {
      raw: { header: headerB64, payload: payloadB64, signature },
      header: {},
      payload: {},
      isValid: false,
      error: `Invalid header: ${e instanceof Error ? e.message : 'base64url decode failed'}`,
    };
  }

  // Decode payload
  let payload: JwtPayload;
  try {
    const raw = base64urlDecode(payloadB64);
    const parsed = safeJsonParse(raw);
    if (!parsed) throw new Error('Payload decoded but is not a valid JSON object');
    payload = parsed as JwtPayload;
  } catch (e) {
    return {
      raw: { header: headerB64, payload: payloadB64, signature },
      header,
      payload: {},
      isValid: false,
      error: `Invalid payload: ${e instanceof Error ? e.message : 'base64url decode failed'}`,
    };
  }

  return {
    raw: { header: headerB64, payload: payloadB64, signature },
    header,
    payload,
    isValid: true,
  };
}

/** Detect the algorithm family from the alg claim. */
export function getAlgorithmFamily(alg: string | undefined): AlgorithmFamily {
  if (!alg) return 'unknown';
  if (alg === 'none') return 'none';
  if (alg.startsWith('HS')) return 'HS';
  if (alg.startsWith('RS')) return 'RS';
  if (alg.startsWith('ES')) return 'ES';
  if (alg.startsWith('PS')) return 'PS';
  return 'unknown';
}
