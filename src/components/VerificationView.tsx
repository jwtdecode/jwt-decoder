import { useState } from 'react';
import type { VerificationResult, AlgorithmFamily } from '../types/jwt';
import { verifyHmac, verifyRsa, verifyEc } from '../utils/crypto';
import { getAlgorithmFamily } from '../utils/jwt';

interface VerificationViewProps {
  token: string;
  alg?: string;
}

const ALG_FAMILY_LABELS: Record<AlgorithmFamily, string> = {
  HS: 'HMAC Secret',
  RS: 'RSA Public Key (PEM)',
  ES: 'EC Public Key (PEM)',
  PS: 'RSA-PSS Public Key (PEM)',
  none: 'Unsecured (alg=none)',
  unknown: 'Unknown Algorithm',
};

const ALG_HINTS: Record<AlgorithmFamily, string> = {
  HS: 'Enter the shared secret string used to sign this token.',
  RS: 'Paste the RSA public key in PEM format (-----BEGIN PUBLIC KEY----- … -----END PUBLIC KEY-----).',
  ES: 'Paste the EC public key in PEM format (-----BEGIN PUBLIC KEY----- … -----END PUBLIC KEY-----).',
  PS: 'Paste the RSA public key in PEM format (-----BEGIN PUBLIC KEY----- … -----END PUBLIC KEY-----).',
  none: 'This token uses alg=none and has no cryptographic signature.',
  unknown: 'The algorithm is not recognized. Verification is not supported.',
};

const resultStyles = {
  idle: '',
  verifying: 'bg-indigo-500/8 border-indigo-500/20 text-indigo-400',
  valid: 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400',
  invalid: 'bg-rose-500/8 border-rose-500/20 text-rose-400',
  error: 'bg-amber-500/8 border-amber-500/20 text-amber-400',
};

const resultIcons = {
  idle: null,
  verifying: '⟳',
  valid: '✓',
  invalid: '✗',
  error: '⚠',
};

export function VerificationView({ token, alg }: VerificationViewProps) {
  const [keyInput, setKeyInput] = useState('');
  const [result, setResult] = useState<VerificationResult>({ status: 'idle', message: '' });
  const [isVerifying, setIsVerifying] = useState(false);

  const family = getAlgorithmFamily(alg);
  const isSupported = family !== 'none' && family !== 'unknown';
  const inputLabel = ALG_FAMILY_LABELS[family];
  const inputHint = ALG_HINTS[family];
  const isMultiline = family === 'RS' || family === 'ES' || family === 'PS';

  const handleVerify = async () => {
    if (!keyInput.trim() || !token) return;
    setIsVerifying(true);
    setResult({ status: 'verifying', message: 'Verifying signature locally…' });

    try {
      let res: VerificationResult;
      if (family === 'HS') {
        res = await verifyHmac(token, keyInput.trim(), alg!);
      } else if (family === 'RS' || family === 'PS') {
        res = await verifyRsa(token, keyInput.trim(), alg!);
      } else if (family === 'ES') {
        res = await verifyEc(token, keyInput.trim(), alg!);
      } else {
        res = { status: 'error', message: 'Unsupported algorithm' };
      }
      setResult(res);
    } catch (e) {
      setResult({
        status: 'error',
        message: `Unexpected error: ${e instanceof Error ? e.message : 'unknown'}`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Verification disclaimer */}
      <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/15">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400 shrink-0 mt-0.5" aria-hidden>
          <path d="M8 2L2 5v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L8 2z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-indigo-300">Local-only verification</p>
          <p className="text-xs text-indigo-400/70 leading-relaxed">
            Your key or secret never leaves your browser. All cryptographic operations are performed
            using the browser's built-in{' '}
            <code className="bg-slate-100 dark:bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded text-indigo-300">Web Crypto API</code>.
          </p>
        </div>
      </div>

      {/* Algorithm info */}
      {alg && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-600">Detected algorithm:</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
            {alg}
          </span>
        </div>
      )}

      {/* Not supported message */}
      {family === 'none' && (
        <div className="px-4 py-6 text-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)]">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-amber-400 font-medium">Unsecured JWT (alg=none)</p>
          <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">
            This token explicitly has no signature. It should be rejected by any secure implementation.
          </p>
        </div>
      )}

      {family === 'unknown' && (
        <div className="px-4 py-6 text-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)]">
          <p className="text-sm text-slate-600 dark:text-slate-400">Algorithm not recognized. Verification not supported.</p>
        </div>
      )}

      {isSupported && (
        <>
          {/* Key input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {inputLabel}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-600">{inputHint}</p>
            {isMultiline ? (
              <textarea
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                rows={6}
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-[var(--surface-card)] border border-[var(--border-strong)] rounded-lg px-3 py-3
                  font-mono text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-700
                  focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                  resize-none transition-colors"
              />
            ) : (
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="Enter HMAC secret…"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-[var(--surface-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2.5
                  font-mono text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-700
                  focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                  transition-colors"
              />
            )}
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={!keyInput.trim() || isVerifying}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500
              disabled:bg-indigo-900/50 disabled:text-indigo-800 disabled:cursor-not-allowed
              text-sm font-semibold text-white transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isVerifying ? 'Verifying…' : 'Verify Signature'}
          </button>

          {/* Result */}
          {result.status !== 'idle' && (
            <div className={`flex items-start gap-2.5 px-3 py-3 rounded-lg border text-sm font-medium ${resultStyles[result.status]}`}>
              <span className="text-base shrink-0">{resultIcons[result.status]}</span>
              <span>{result.message}</span>
            </div>
          )}
        </>
      )}

      {/* Security reminder */}
      <div className="text-xs text-slate-600 dark:text-slate-700 border-t border-[var(--border-subtle)] pt-4 leading-relaxed">
        <strong className="text-slate-500 dark:text-slate-600">Security reminder:</strong> Always validate JWTs on your
        server/backend with a proper JWT library. Client-side verification here is for inspection
        and debugging purposes only.
      </div>
    </div>
  );
}
