import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleP } from '../components/ArticleLayout';
import { GUIDES, GUIDE_CLUSTERS } from '../guides';

const CLUSTER_INTROS: Record<string, string> = {
  'Fundamentals': 'What a JWT is, how its three parts fit together, and what verification actually proves.',
  'Debugging & Code': 'Tracking down rejected tokens and decoding or verifying JWTs in code.',
  'Algorithms': 'Choosing and implementing HS256, RS256, ES256 and PS256, and the algorithm pitfalls to avoid.',
  'Concepts & Claims': 'Individual claims and headers in depth: expiry, audience, scopes, roles, kid and JWKS.',
  'Keys & Tooling': 'Generating secrets and key pairs, and working with JWTs from the command line, curl and Postman.',
  'Comparisons': 'How JWTs relate to OAuth, SAML, API keys, bearer tokens, sessions and encrypted tokens.',
  'Framework Guides': 'Implementing JWT authentication in Node.js, Next.js, FastAPI, Django, Spring Boot and ASP.NET Core.',
  'Identity Providers': 'Validating tokens issued by AWS Cognito and Microsoft Entra ID.',
  'Security & Architecture': 'Attacks, storage, refresh, logout and revocation, WebSockets and microservices.',
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'JWT Guides',
  url: 'https://jwtdecode.app/guides',
  description: 'Every jwtdecode.app guide to JSON Web Tokens, grouped by topic.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://jwtdecode.app${g.to}`, name: g.title })),
  },
};

export default function GuidesHubPage() {
  return (
    <>
      <SEOHead
        title="JWT Guides: Tutorials and Reference"
        description={`${GUIDES.length} in-depth guides to JSON Web Tokens: claims, algorithms, debugging, security, framework tutorials and identity providers.`}
        path="/guides"
        jsonLd={jsonLd}
      />
      <ArticleLayout breadcrumbs={[{ label: 'Guides' }]}>
        <ArticleH1>JWT Guides</ArticleH1>
        <ArticleP>
          Technical guides to JSON Web Tokens, written for developers who need a working answer: how tokens are
          built and verified, why a token is being rejected, how to implement JWT authentication in your framework,
          and how to keep it secure. Each guide links to the{' '}
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">JWT decoder</Link>,
          which runs entirely in your browser.
        </ArticleP>

        <nav aria-label="Guide topics" className="flex flex-wrap gap-2 mb-8">
          {GUIDE_CLUSTERS.map(c => (
            <a key={c} href={`#${slugify(c)}`} className="px-2.5 py-1 rounded-full text-xs border border-[var(--border-default)] text-slate-600 dark:text-slate-400 hover:text-indigo-400">
              {c}
            </a>
          ))}
        </nav>

        {GUIDE_CLUSTERS.map(cluster => {
          const items = GUIDES.filter(g => g.cluster === cluster);
          if (items.length === 0) return null;
          return (
            <section key={cluster} aria-labelledby={slugify(cluster)} className="mb-10">
              <h2 id={slugify(cluster)} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{cluster}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">{CLUSTER_INTROS[cluster]}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map(g => (
                  <Link
                    key={g.to}
                    to={g.to}
                    className="block p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]
                      hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-400 transition-colors mb-1">
                      {g.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-600 leading-relaxed">{g.description}</div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </ArticleLayout>
    </>
  );
}
