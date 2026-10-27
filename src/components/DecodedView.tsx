import type { DecodedJwt } from '../types/jwt';
import { JsonViewer } from './JsonViewer';

interface DecodedViewProps {
  decoded: DecodedJwt;
  onCopy: (msg: string) => void;
}

export function DecodedView({ decoded, onCopy }: DecodedViewProps) {
  const alg = decoded.header.alg as string | undefined;
  const typ = decoded.header.typ as string | undefined;

  return (
    <div className="space-y-4">
      {/* Algorithm info chip */}
      {alg && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-600 font-mono uppercase tracking-wider">Algorithm</span>
          <span className="px-2 py-0.5 rounded font-mono text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            {alg}
          </span>
          {typ && (
            <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-200/60 dark:bg-slate-200/60 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-600/30">
              {typ}
            </span>
          )}
          {decoded.header.kid && (
            <span className="text-xs text-slate-500 dark:text-slate-600 font-mono">
              kid: <span className="text-slate-600 dark:text-slate-400">{String(decoded.header.kid)}</span>
            </span>
          )}
        </div>
      )}

      {/* Warning: decode ≠ verify */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-amber-400 shrink-0 mt-0.5" aria-hidden>
          <path d="M8 2L1 14h14L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 7v3M8 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-xs text-amber-400/80 leading-relaxed">
          <strong className="text-amber-400">Decoding is not verification.</strong>{' '}
          Anyone can decode a JWT. To confirm authenticity, use the{' '}
          <strong>Verify</strong> tab to check the signature with the correct key.
        </p>
      </div>

      {/* Header JSON */}
      <JsonViewer
        data={decoded.header}
        label="Header"
        colorClass="text-[#fb923c]"
        onCopy={() => onCopy('Header JSON copied')}
      />

      {/* Payload JSON */}
      <JsonViewer
        data={decoded.payload}
        label="Payload"
        colorClass="text-[#a78bfa]"
        onCopy={() => onCopy('Payload JSON copied')}
      />
    </div>
  );
}
