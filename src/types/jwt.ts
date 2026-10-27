export type AlgorithmFamily = 'HS' | 'RS' | 'ES' | 'PS' | 'none' | 'unknown';

export interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface JwtParts {
  header: string;
  payload: string;
  signature: string;
}

export interface DecodedJwt {
  raw: JwtParts;
  header: JwtHeader;
  payload: JwtPayload;
  isValid: boolean;
  error?: string;
}

export type VerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid' | 'error';

export interface VerificationResult {
  status: VerificationStatus;
  message: string;
}

export type Tab = 'decoded' | 'claims' | 'verify' | 'raw' | 'anatomy';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type TokenStatus = 'active' | 'expired' | 'not-yet-valid' | 'no-expiry' | 'invalid';
