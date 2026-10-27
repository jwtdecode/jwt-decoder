import type { JwtPayload } from '../types/jwt';
import { formatTimestamp, getRelativeTime, getTokenStatus } from '../utils/formatting';
import { CopyButton } from './CopyButton';

interface ClaimsViewProps {
  payload: JwtPayload;
  onCopy: (msg: string) => void;
}

interface ClaimDef {
  key: string;
  name: string;
  description: string;
  isTime?: boolean;
}

const STANDARD_CLAIMS: ClaimDef[] = [
  { key: 'iss', name: 'Issuer', description: 'Who issued the token (identity provider URL or name)' },
  { key: 'sub', name: 'Subject', description: 'Who the token is about — typically a user ID' },
  { key: 'aud', name: 'Audience', description: 'Who the token is intended for (target service or client ID)' },
  { key: 'exp', name: 'Expires At', description: 'Token must not be accepted after this time', isTime: true },
  { key: 'nbf', name: 'Not Before', description: 'Token must not be accepted before this time', isTime: true },
  { key: 'iat', name: 'Issued At', description: 'Time at which the token was issued', isTime: true },
  { key: 'jti', name: 'JWT ID', description: 'Unique identifier for this token — used to prevent replay attacks' },
];

function TimestampCard({ claim, value }: { claim: ClaimDef; value: number }) {
  const now = Math.floor(Date.now() / 1000);
  const isExp = claim.key === 'exp';
  const isNbf = claim.key === 'nbf';

  let statusLabel = '';
  let statusClass = '';

  if (isExp) {
    const expired = now > value;
    statusLabel = expired ? 'Expired' : 'Valid';
    statusClass = expired
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
  } else if (isNbf) {
    const notYet = now < value;
    statusLabel = notYet ? 'Not Yet Valid' : 'Past';
    statusClass = notYet
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
      : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25';
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-card-alt)] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            {claim.key}
          </span>
          <span className="text-xs text-slate-500">{claim.name}</span>
        </div>
        {statusLabel && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
            {statusLabel}
          </span>
        )}
      </div>
      <div className="font-mono text-sm text-slate-700 dark:text-slate-300">{value}</div>
      <div className="text-xs text-slate-500">{formatTimestamp(value)}</div>
      <div className="text-xs text-slate-500 dark:text-slate-600 italic">{getRelativeTime(value)}</div>
      <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">{claim.description}</p>
    </div>
  );
}

function ClaimCard({ claim, value, onCopy }: { claim: ClaimDef; value: unknown; onCopy: () => void }) {
  const displayValue = Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : String(value);

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-card-alt)] p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            {claim.key}
          </span>
          <span className="text-xs text-slate-500">{claim.name}</span>
        </div>
        <CopyButton text={displayValue} onCopy={onCopy} />
      </div>
      <div className="font-mono text-sm text-slate-700 dark:text-slate-300 break-all">{displayValue}</div>
      <p className="text-xs text-slate-500 dark:text-slate-600">{claim.description}</p>
    </div>
  );
}

function CustomClaimCard({ claimKey, value, onCopy }: { claimKey: string; value: unknown; onCopy: () => void }) {
  const displayValue = typeof value === 'object' && value !== null
    ? JSON.stringify(value, null, 2)
    : String(value);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{claimKey}</span>
        <CopyButton text={displayValue} onCopy={onCopy} />
      </div>
      <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all whitespace-pre-wrap">{displayValue}</div>
    </div>
  );
}

export function ClaimsView({ payload, onCopy }: ClaimsViewProps) {
  const status = getTokenStatus(
    typeof payload.exp === 'number' ? payload.exp : undefined,
    typeof payload.nbf === 'number' ? payload.nbf : undefined,
  );

  const standardKeys = new Set(STANDARD_CLAIMS.map(c => c.key));
  const presentStandard = STANDARD_CLAIMS.filter(c => c.key in payload);
  const customClaims = Object.entries(payload).filter(([k]) => !standardKeys.has(k));

  const statusMessages: Record<typeof status, { text: string; cls: string }> = {
    active: { text: '✓ Token is currently active and within its validity window', cls: 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' },
    expired: { text: '✗ Token has expired — the exp claim is in the past', cls: 'bg-rose-500/8 border-rose-500/20 text-rose-400' },
    'not-yet-valid': { text: '◷ Token is not yet valid — the nbf claim is in the future', cls: 'bg-amber-500/8 border-amber-500/20 text-amber-400' },
    'no-expiry': { text: '∞ Token has no expiration date (no exp claim)', cls: 'bg-slate-100 dark:bg-slate-100 dark:bg-slate-700/20 border-slate-200 dark:border-slate-200 dark:border-slate-600/20 text-slate-600 dark:text-slate-400' },
    invalid: { text: 'Invalid token structure', cls: 'bg-rose-500/8 border-rose-500/20 text-rose-400' },
  };

  const sm = statusMessages[status];

  return (
    <div className="space-y-5">
      {/* Validity status */}
      <div className={`px-3 py-2.5 rounded-lg border text-xs font-medium ${sm.cls}`}>
        {sm.text}
      </div>

      {/* Standard registered claims */}
      {presentStandard.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-600 mb-3">
            Registered Claims
          </h3>
          <div className="space-y-2">
            {presentStandard.map(claim => {
              const value = payload[claim.key as keyof JwtPayload];
              if (claim.isTime && typeof value === 'number') {
                return <TimestampCard key={claim.key} claim={claim} value={value} />;
              }
              return (
                <ClaimCard
                  key={claim.key}
                  claim={claim}
                  value={value}
                  onCopy={() => onCopy(`${claim.key} copied`)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Custom / private claims */}
      {customClaims.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-600 mb-3">
            Custom Claims
          </h3>
          <div className="space-y-2">
            {customClaims.map(([k, v]) => (
              <CustomClaimCard
                key={k}
                claimKey={k}
                value={v}
                onCopy={() => onCopy(`${k} copied`)}
              />
            ))}
          </div>
        </section>
      )}

      {presentStandard.length === 0 && customClaims.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-600 text-sm">No claims found in payload</div>
      )}
    </div>
  );
}
