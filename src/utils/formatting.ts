import type { TokenStatus } from '../types/jwt';

export function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

export function getRelativeTime(unix: number): string {
  const diff = unix - Math.floor(Date.now() / 1000);
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? 'from now' : 'ago';

  if (abs < 60) return `${abs}s ${suffix}`;
  if (abs < 3600) return `${Math.floor(abs / 60)}m ${suffix}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${suffix}`;
  return `${Math.floor(abs / 86400)}d ${suffix}`;
}

export function getTokenStatus(exp?: number, nbf?: number): TokenStatus {
  const now = Math.floor(Date.now() / 1000);
  if (nbf !== undefined && now < nbf) return 'not-yet-valid';
  if (exp !== undefined && now > exp) return 'expired';
  if (exp === undefined) return 'no-expiry';
  return 'active';
}

export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

/**
 * Syntax-highlight a JSON string for safe HTML rendering.
 * HTML-escapes the content first to prevent XSS, then wraps tokens in spans.
 */
export function syntaxHighlightJson(json: string): string {
  // Escape HTML characters first — critical before dangerouslySetInnerHTML
  const safe = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return safe.replace(
    /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    match => {
      if (/^"/.test(match)) {
        return /:$/.test(match)
          ? `<span class="jk">${match}</span>`
          : `<span class="js">${match}</span>`;
      }
      if (match === 'true' || match === 'false') return `<span class="jb">${match}</span>`;
      if (match === 'null') return `<span class="jn">${match}</span>`;
      return `<span class="ji">${match}</span>`;
    },
  );
}

/** Truncate a long string with an ellipsis in the middle. */
export function truncateMiddle(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor(maxLen / 2);
  return `${str.slice(0, half)}…${str.slice(-half)}`;
}
