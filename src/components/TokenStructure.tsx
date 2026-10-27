import { truncateMiddle } from '../utils/formatting';
import type { JwtParts, TokenStatus } from '../types/jwt';

interface TokenStructureProps {
  parts: JwtParts;
  status: TokenStatus;
}

const statusConfig = {
  active: { label: 'Active', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  expired: { label: 'Expired', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/25', dot: 'bg-rose-400' },
  'not-yet-valid': { label: 'Not Yet Valid', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25', dot: 'bg-amber-400' },
  'no-expiry': { label: 'No Expiry', bg: 'bg-slate-500/15', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/25', dot: 'bg-slate-400' },
  invalid: { label: 'Invalid', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/25', dot: 'bg-rose-400' },
};

interface SegmentBadgeProps {
  label: string;
  color: string;
  dotColor: string;
  borderColor: string;
}

function SegmentBadge({ label, color, dotColor, borderColor }: SegmentBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${color} ${borderColor}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </div>
  );
}

export function TokenStructure({ parts, status }: TokenStructureProps) {
  const sc = statusConfig[status];

  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card)] overflow-hidden">
      {/* Colored token visualization */}
      <div className="px-4 py-4 font-mono text-sm break-all leading-relaxed select-all">
        <span className="text-[#fb923c]">{truncateMiddle(parts.header, 36)}</span>
        <span className="text-[#3d4460] font-bold">.</span>
        <span className="text-[#a78bfa]">{truncateMiddle(parts.payload, 56)}</span>
        <span className="text-[#3d4460] font-bold">.</span>
        <span className="text-[#34d399]">{truncateMiddle(parts.signature, 28)}</span>
      </div>

      {/* Segment labels + status */}
      <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--surface-subtle)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SegmentBadge label="Header" color="text-[#fb923c]" dotColor="bg-[#fb923c]" borderColor="border-orange-500/25" />
          <SegmentBadge label="Payload" color="text-[#a78bfa]" dotColor="bg-[#a78bfa]" borderColor="border-violet-500/25" />
          <SegmentBadge label="Signature" color="text-[#34d399]" dotColor="bg-[#34d399]" borderColor="border-emerald-500/25" />
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
          {sc.label}
        </div>
      </div>
    </div>
  );
}
