/**
 * Policy-safe ad wrapper.
 *
 * Only renders ad content on approved content-rich page types.
 * Never renders on: empty states, error states, loading states,
 * or pages without substantial original publisher content.
 */

export type PageType = 'home' | 'guide' | 'trust' | 'tool-only';

interface AdGuardProps {
  children: React.ReactNode;
  pageType: PageType;
  /** Minimum estimated word count on the surrounding page */
  minWordCount?: number;
  /** Actual estimated word count (if known) */
  wordCount?: number;
}

const APPROVED_PAGE_TYPES: PageType[] = ['home', 'guide'];
const DEFAULT_MIN_WORD_COUNT = 400;

export function AdGuard({
  children,
  pageType,
  minWordCount = DEFAULT_MIN_WORD_COUNT,
  wordCount,
}: AdGuardProps) {
  if (!APPROVED_PAGE_TYPES.includes(pageType)) return null;
  if (wordCount !== undefined && wordCount < minWordCount) return null;
  return <>{children}</>;
}
