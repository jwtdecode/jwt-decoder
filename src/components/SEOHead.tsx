import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://jwtdecode.app';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  ogType?: string;
  article?: { publishedTime?: string; section?: string };
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /**
   * When true, omit the " — JWT Decode" suffix. Use for titles that already
   * contain "JWT Decode" (e.g. "About JWT Decode") to prevent redundant suffix
   * doubling and SERP truncation.
   */
  noSuffix?: boolean;
  /** Emit robots noindex and no canonical (used by the 404 page). */
  noindex?: boolean;
}

export function SEOHead({ title, description, path, ogType = 'website', article, jsonLd, noSuffix, noindex }: SEOHeadProps) {
  const canonical = `${BASE_URL}${path}`;
  const fullTitle = path === '/' || noSuffix
    ? title
    : `${title} — JWT Decode`;

  // Wrap multi-entry JSON-LD in @graph (Google's officially supported form for
  // multiple schema entities in a single script tag). A bare top-level array is
  // not part of the schema.org spec and not all parsers accept it.
  const jsonLdSerialized = jsonLd
    ? JSON.stringify(
        Array.isArray(jsonLd)
          ? { '@context': 'https://schema.org', '@graph': jsonLd.map(({ '@context': _ctx, ...rest }) => rest) }
          : jsonLd,
      )
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="JWT Decode" />
      <meta property="og:image" content={`${BASE_URL}/og-image.png`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {article && ogType === 'article' && article.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article && ogType === 'article' && article.section && (
        <meta property="article:section" content={article.section} />
      )}

      {jsonLdSerialized && (
        <script type="application/ld+json">{jsonLdSerialized}</script>
      )}
    </Helmet>
  );
}
