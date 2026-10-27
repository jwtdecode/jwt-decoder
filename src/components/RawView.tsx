import type { JwtParts } from '../types/jwt';
import { CopyButton } from './CopyButton';
import { base64urlDecode } from '../utils/jwt';

interface RawViewProps {
  parts: JwtParts;
  token: string;
  onCopy: (msg: string) => void;
}

interface RawSegmentProps {
  label: string;
  b64value: string;
  colorClass: string;
  borderColor: string;
  onCopy: () => void;
}

function tryDecodeBase64url(s: string): string {
  try {
    return base64urlDecode(s);
  } catch {
    return '(could not decode)';
  }
}

function RawSegment({ label, b64value, colorClass, borderColor, onCopy }: RawSegmentProps) {
  const decoded = label !== 'Signature' ? tryDecodeBase64url(b64value) : null;

  return (
    <div className={`rounded-xl border ${borderColor} bg-[var(--surface-card)] overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-bar)] border-b border-[var(--border-subtle)]">
        <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass}`}>{label}</span>
        <CopyButton text={b64value} label="base64url" onCopy={onCopy} />
      </div>

      {/* Raw base64url */}
      <div className="px-4 py-3">
        <div className="text-xs text-slate-500 dark:text-slate-600 mb-1.5 font-mono uppercase tracking-wider">Base64url</div>
        <pre className={`font-mono text-xs ${colorClass} break-all whitespace-pre-wrap leading-relaxed`}>
          {b64value}
        </pre>
      </div>

      {/* Decoded (for header/payload only) */}
      {decoded && (
        <div className="px-4 pb-3 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-600 font-mono uppercase tracking-wider">Decoded UTF-8</div>
            <CopyButton text={decoded} label="decoded" onCopy={onCopy} />
          </div>
          <pre className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all whitespace-pre-wrap leading-relaxed">
            {decoded}
          </pre>
        </div>
      )}

      {/* Signature note */}
      {label === 'Signature' && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-600 dark:text-slate-700 italic">
            The signature is raw binary data encoded as base64url.
            It cannot be meaningfully decoded as UTF-8 text.
            Use the <strong className="text-slate-500">Verify</strong> tab to validate it.
          </p>
        </div>
      )}
    </div>
  );
}

export function RawView({ parts, token, onCopy }: RawViewProps) {
  return (
    <div className="space-y-4">
      {/* Full token */}
      <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-bar)] border-b border-[var(--border-subtle)]">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Full Token</span>
          <CopyButton text={token} label="token" onCopy={() => onCopy('Token copied')} />
        </div>
        <pre className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 break-all whitespace-pre-wrap leading-relaxed">
          <span className="text-[#fb923c]">{parts.header}</span>
          <span className="text-[#3d4460]">.</span>
          <span className="text-[#a78bfa]">{parts.payload}</span>
          <span className="text-[#3d4460]">.</span>
          <span className="text-[#34d399]">{parts.signature}</span>
        </pre>
      </div>

      <RawSegment
        label="Header"
        b64value={parts.header}
        colorClass="text-[#fb923c]"
        borderColor="border-orange-500/20"
        onCopy={() => onCopy('Header segment copied')}
      />

      <RawSegment
        label="Payload"
        b64value={parts.payload}
        colorClass="text-[#a78bfa]"
        borderColor="border-violet-500/20"
        onCopy={() => onCopy('Payload segment copied')}
      />

      <RawSegment
        label="Signature"
        b64value={parts.signature}
        colorClass="text-[#34d399]"
        borderColor="border-emerald-500/20"
        onCopy={() => onCopy('Signature segment copied')}
      />
    </div>
  );
}
