/**
 * Client-side JWT signature verification using the Web Crypto API.
 * All operations happen in-browser. No keys or tokens are sent anywhere.
 */
import type { VerificationResult } from '../types/jwt';
import { base64urlToBytes } from './jwt';

const enc = new TextEncoder();

// ─── HMAC (HS256 / HS384 / HS512) ───────────────────────────────────────────

export async function verifyHmac(
  token: string,
  secret: string,
  alg: string,
): Promise<VerificationResult> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!signatureB64) throw new Error('Missing signature segment');

    const hashBits = alg.slice(2); // "256" | "384" | "512"
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: `SHA-${hashBits}` },
      false,
      ['verify'],
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlToBytes(signatureB64),
      enc.encode(`${headerB64}.${payloadB64}`),
    );

    return {
      status: valid ? 'valid' : 'invalid',
      message: valid
        ? `${alg} signature verified ✓`
        : `${alg} signature does not match — wrong secret or tampered token`,
    };
  } catch (e) {
    return {
      status: 'error',
      message: `Verification failed: ${e instanceof Error ? e.message : 'unknown error'}`,
    };
  }
}

// ─── RSA-PKCS1 / RSA-PSS (RS256/384/512 · PS256/384/512) ────────────────────

export async function verifyRsa(
  token: string,
  publicKeyPem: string,
  alg: string,
): Promise<VerificationResult> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!signatureB64) throw new Error('Missing signature segment');

    const isPss = alg.startsWith('PS');
    const hashBits = alg.slice(2);

    const pem = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const derBuffer = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      'spki',
      derBuffer,
      {
        name: isPss ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
        hash: `SHA-${hashBits}`,
      },
      false,
      ['verify'],
    );

    const verifyAlg = isPss
      ? { name: 'RSA-PSS', saltLength: parseInt(hashBits) / 8 }
      : 'RSASSA-PKCS1-v1_5';

    const valid = await crypto.subtle.verify(
      verifyAlg,
      key,
      base64urlToBytes(signatureB64),
      enc.encode(`${headerB64}.${payloadB64}`),
    );

    return {
      status: valid ? 'valid' : 'invalid',
      message: valid
        ? `${alg} signature verified ✓`
        : `${alg} signature does not match — wrong key or tampered token`,
    };
  } catch (e) {
    return {
      status: 'error',
      message: `Verification failed: ${e instanceof Error ? e.message : 'unknown error'}. Ensure the key is PEM-encoded SPKI format.`,
    };
  }
}

// ─── ECDSA (ES256 / ES384 / ES512) ──────────────────────────────────────────

const EC_CURVES: Record<string, string> = {
  ES256: 'P-256',
  ES384: 'P-384',
  ES512: 'P-521',
};

export async function verifyEc(
  token: string,
  publicKeyPem: string,
  alg: string,
): Promise<VerificationResult> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!signatureB64) throw new Error('Missing signature segment');

    const curve = EC_CURVES[alg];
    if (!curve) throw new Error(`Unsupported EC algorithm: ${alg}`);

    const hashBits = alg === 'ES512' ? '512' : alg.slice(2);

    const pem = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const derBuffer = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      'spki',
      derBuffer,
      { name: 'ECDSA', namedCurve: curve },
      false,
      ['verify'],
    );

    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: `SHA-${hashBits}` },
      key,
      base64urlToBytes(signatureB64),
      enc.encode(`${headerB64}.${payloadB64}`),
    );

    return {
      status: valid ? 'valid' : 'invalid',
      message: valid
        ? `${alg} signature verified ✓`
        : `${alg} signature does not match — wrong key or tampered token`,
    };
  } catch (e) {
    return {
      status: 'error',
      message: `Verification failed: ${e instanceof Error ? e.message : 'unknown error'}. Ensure the key is PEM-encoded SPKI format.`,
    };
  }
}
