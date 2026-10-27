import { useState, useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import type { DecodedJwt, Tab } from './types/jwt';
import { decodeJwt } from './utils/jwt';
import { getTokenStatus } from './utils/formatting';
import { buildSampleToken } from './utils/sample';
import { useToast } from './hooks/useToast';

import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { ScrollToTop } from './components/ScrollToTop';
import { PrivacyBanner } from './components/PrivacyBanner';
import { TokenInput } from './components/TokenInput';
import { TokenStructure } from './components/TokenStructure';
import { TabBar } from './components/TabBar';
import { DecodedView } from './components/DecodedView';
import { ClaimsView } from './components/ClaimsView';
import { VerificationView } from './components/VerificationView';
import { RawView } from './components/RawView';
import { JwtAnatomy } from './components/JwtAnatomy';
import { FaqSection, FAQ_DATA } from './components/FaqSection';
import { SideRailAd } from './components/SideRailAd';
import { Toast } from './components/Toast';
import { HomeHero, HomeIntro } from './components/HomeIntro';
import { HowToSection } from './components/HowToSection';
import { JwtStructureSection } from './components/JwtStructureSection';
import { SecurityNotesSection } from './components/SecurityNotesSection';
import { GuidesGrid } from './components/GuidesGrid';
import { AdGuard } from './components/AdGuard';
import { SEOHead } from './components/SEOHead';
import { lazyPage, type LazyPage } from './lazyPage';

const WhatIsJwtPage = lazyPage(() => import('./pages/guides/WhatIsJwt'));
const HeaderPayloadSignaturePage = lazyPage(() => import('./pages/guides/HeaderPayloadSignature'));
const ClaimsExplainedPage = lazyPage(() => import('./pages/guides/ClaimsExplained'));
const VerificationGuidePage = lazyPage(() => import('./pages/guides/VerificationGuide'));
const Hs256VsRs256Page = lazyPage(() => import('./pages/guides/Hs256VsRs256'));
const SecurityBestPracticesPage = lazyPage(() => import('./pages/guides/SecurityBestPractices'));
const CommonErrorsPage = lazyPage(() => import('./pages/guides/CommonErrors'));
const DecoderVsValidatorPage = lazyPage(() => import('./pages/guides/DecoderVsValidator'));
const JwtVsSessionTokensPage = lazyPage(() => import('./pages/guides/JwtVsSessionTokens'));
const JwtInOauth2AndOidcPage = lazyPage(() => import('./pages/guides/JwtInOauth2AndOidc'));
const DecodeJwtInCodePage = lazyPage(() => import('./pages/guides/DecodeJwtInCode'));
const Es256ExplainedPage = lazyPage(() => import('./pages/guides/Es256Explained'));
const Ps256VsRs256Page = lazyPage(() => import('./pages/guides/Ps256VsRs256'));
const NoneAlgorithmVulnerabilityPage = lazyPage(() => import('./pages/guides/NoneAlgorithmVulnerability'));
const DecodeJwtWithoutAServerPage = lazyPage(() => import('./pages/guides/DecodeJwtWithoutAServer'));
const JwtStorageLocalstorageVsCookiePage = lazyPage(() => import('./pages/guides/JwtStorageLocalstorageVsCookie'));
const JwtRefreshTokenPatternPage = lazyPage(() => import('./pages/guides/JwtRefreshTokenPattern'));
const HowToDebugAJwtPage = lazyPage(() => import('./pages/guides/HowToDebugAJwt'));
const JwtIoAlternativePage = lazyPage(() => import('./pages/guides/JwtIoAlternative'));
const NotFoundPage = lazyPage(() => import('./pages/NotFound'));
const GuidesHubPage = lazyPage(() => import('./pages/GuidesHub'));
const WhatIsJwksPage = lazyPage(() => import('./pages/guides/WhatIsJwks'));
const ValidateEntraIdJwtPage = lazyPage(() => import('./pages/guides/ValidateEntraIdJwt'));
const ValidateCognitoJwtPage = lazyPage(() => import('./pages/guides/ValidateCognitoJwt'));
const JwtWebsocketAuthPage = lazyPage(() => import('./pages/guides/JwtWebsocketAuth'));
const JwtVsSamlPage = lazyPage(() => import('./pages/guides/JwtVsSaml'));
const JwtVsOauthPage = lazyPage(() => import('./pages/guides/JwtVsOauth'));
const JwtVsBearerTokenPage = lazyPage(() => import('./pages/guides/JwtVsBearerToken'));
const JwtVsApiKeyPage = lazyPage(() => import('./pages/guides/JwtVsApiKey'));
const JwtSizeLimitPage = lazyPage(() => import('./pages/guides/JwtSizeLimit'));
const JwtSecretKeyGeneratorPage = lazyPage(() => import('./pages/guides/JwtSecretKeyGenerator'));
const JwtScopesVsRolesPage = lazyPage(() => import('./pages/guides/JwtScopesVsRoles'));
const JwtLogoutRevocationPage = lazyPage(() => import('./pages/guides/JwtLogoutRevocation'));
const JwtKidHeaderPage = lazyPage(() => import('./pages/guides/JwtKidHeader'));
const JwtMicroservicesPage = lazyPage(() => import('./pages/guides/JwtMicroservices'));
const JwtExpirationTimePage = lazyPage(() => import('./pages/guides/JwtExpirationTime'));
const JwtCurlPostmanPage = lazyPage(() => import('./pages/guides/JwtCurlPostman'));
const JwtAuthSpringBootPage = lazyPage(() => import('./pages/guides/JwtAuthSpringBoot'));
const JwtAuthNodeExpressPage = lazyPage(() => import('./pages/guides/JwtAuthNodeExpress'));
const JwtAuthNextjsPage = lazyPage(() => import('./pages/guides/JwtAuthNextjs'));
const JwtAuthFastapiPage = lazyPage(() => import('./pages/guides/JwtAuthFastapi'));
const JwtAuthDjangoPage = lazyPage(() => import('./pages/guides/JwtAuthDjango'));
const JwtAuthAspNetCorePage = lazyPage(() => import('./pages/guides/JwtAuthAspNetCore'));
const JwtAudienceClaimPage = lazyPage(() => import('./pages/guides/JwtAudienceClaim'));
const JwtAttacksPage = lazyPage(() => import('./pages/guides/JwtAttacks'));
const IsJwtEncryptedPage = lazyPage(() => import('./pages/guides/IsJwtEncrypted'));
const GenerateJwtSigningKeysPage = lazyPage(() => import('./pages/guides/GenerateJwtSigningKeys'));
const DecodeJwtCommandLinePage = lazyPage(() => import('./pages/guides/DecodeJwtCommandLine'));
const AboutPage = lazyPage(() => import('./pages/trust/About'));
const ContactPage = lazyPage(() => import('./pages/trust/Contact'));
const PrivacyPolicyPage = lazyPage(() => import('./pages/trust/PrivacyPolicy'));
const TermsPage = lazyPage(() => import('./pages/trust/Terms'));
const HowItWorksPage = lazyPage(() => import('./pages/trust/HowItWorks'));

const AD_SLOT_LEFT  = '093802897';
const AD_SLOT_RIGHT = '1126115108';

// Home-page JSON-LD. The FAQPage is built from the same FAQ_DATA that renders
// the visible accordion, so the markup always matches the on-page text.
// (HowTo and a one-item BreadcrumbList were removed: HowTo rich results are
// retired and a single-item breadcrumb carries no information.)
const HOME_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  },
];

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

function EmptyState({ onLoadSample }: { onLoadSample: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
        <LockIcon />
      </div>
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Paste any JWT token to decode it instantly
      </h2>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-2">
        View the decoded header, payload, and all claims — including expiry status,
        issuer, subject, audience, and custom claims.
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm leading-relaxed mb-6">
        All JWT decoding runs locally in your browser. Your token is never sent to any server,
        stored, or logged. Disconnect from the internet and this tool still works.
      </p>
      <button
        onClick={onLoadSample}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
      >
        Load a sample JWT token
      </button>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {['HS256 / RS256 / ES256 verification', 'exp · nbf · iat timestamps', 'Claims inspector', 'Raw Base64url view', 'JWT anatomy guide'].map(f => (
          <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500">{f}</span>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-rose-400 shrink-0 mt-0.5" aria-hidden>
        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5v4M9 12.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-sm font-medium text-rose-400">Invalid JWT</p>
        <p className="text-xs text-rose-400/70 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function HomePage() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('decoded');
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const trimmed = token.trim();
    if (!trimmed) { setDecoded(null); return; }
    setDecoded(decodeJwt(trimmed));
  }, [token]);

  const handleCopy = (text: string, msg = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text).catch(() => {});
    addToast(msg, 'success');
  };

  const handleLoadSample = () => setToken(buildSampleToken());

  const tokenStatus = decoded?.isValid
    ? getTokenStatus(
        typeof decoded.payload.exp === 'number' ? decoded.payload.exp : undefined,
        typeof decoded.payload.nbf === 'number' ? decoded.payload.nbf : undefined,
      )
    : 'invalid';

  const hasToken = Boolean(token.trim());
  const isValid  = decoded?.isValid ?? false;

  return (
    <div className="min-h-screen bg-[var(--surface)] text-slate-900 dark:text-slate-100 flex flex-col"
      style={{ fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif" }}>

      <SEOHead
        title="JWT Decode — Free Online JWT Decoder & Verifier"
        description="Free online JWT decoder — decode any JSON Web Token instantly. Inspect header, payload, claims. Verify HS256/RS256/ES256/PS256. 100% local, in-browser."
        path="/"
        jsonLd={HOME_JSONLD}
      />

      <SiteHeader />

      {/* Three-column layout */}
      <div className="flex items-start justify-center gap-5 2xl:gap-6 w-full max-w-[1600px] mx-auto px-2 xl:px-4 flex-1">

        {/* Left rail */}
        <aside
          aria-label="Left advertisement"
          className="hidden xl:flex flex-col w-[160px] 2xl:w-[300px] shrink-0 self-start sticky top-14 pt-6"
        >
          <AdGuard pageType="home" wordCount={1500}>
            <SideRailAd slot={AD_SLOT_LEFT} side="left" />
          </AdGuard>
        </aside>

        {/* Center column */}
        <div className="flex-1 min-w-0 max-w-3xl">
          <main className="px-4 py-6 space-y-6">

            {/* A. Compact hero — H1 + one line, so the input sits above the fold */}
            <HomeHero />

            {/* B. The tool */}
            <section aria-label="JWT decoder tool">
              <TokenInput
                value={token}
                onChange={setToken}
                onCopy={() => handleCopy(token.trim(), 'Token copied')}
              />

              {isValid && <div className="mt-3"><TokenStructure parts={decoded!.raw} status={tokenStatus} /></div>}
              {decoded && !isValid && <div className="mt-3"><ErrorState message={decoded.error ?? 'Unknown error'} /></div>}

              {isValid ? (
                <div className="space-y-3 mt-3">
                  <TabBar active={activeTab} onChange={setActiveTab} />
                  <div className="animate-fade-in">
                    {activeTab === 'decoded'  && <DecodedView decoded={decoded!} onCopy={msg => addToast(msg, 'success')} />}
                    {activeTab === 'claims'   && <ClaimsView payload={decoded!.payload} onCopy={msg => addToast(msg, 'success')} />}
                    {activeTab === 'verify'   && <VerificationView token={token.trim()} alg={typeof decoded!.header.alg === 'string' ? decoded!.header.alg : undefined} />}
                    {activeTab === 'raw'      && <RawView parts={decoded!.raw} token={token.trim()} onCopy={msg => addToast(msg, 'success')} />}
                    {activeTab === 'anatomy'  && <JwtAnatomy />}
                  </div>
                </div>
              ) : (
                !hasToken && <EmptyState onLoadSample={handleLoadSample} />
              )}

              {!isValid && hasToken && (
                <div className="space-y-3 mt-3">
                  <TabBar active={activeTab} onChange={setActiveTab} />
                  {activeTab === 'anatomy' && <JwtAnatomy />}
                </div>
              )}
            </section>

            <PrivacyBanner />

            {/* C. What a JWT is, who the tool is for, feature summary */}
            <HomeIntro />

            {/* D. How to use */}
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <HowToSection />
            </div>

            {/* E. JWT structure explained */}
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <JwtStructureSection />
            </div>

            {/* F. Security notes */}
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <SecurityNotesSection />
            </div>

            {/* G. FAQ */}
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <FaqSection />
            </div>

            {/* H. Guides grid */}
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <GuidesGrid />
            </div>

          </main>
        </div>

        {/* Right rail */}
        <aside
          aria-label="Right advertisement"
          className="hidden xl:flex flex-col w-[160px] 2xl:w-[300px] shrink-0 self-start sticky top-14 pt-6"
        >
          <AdGuard pageType="home" wordCount={1500}>
            <SideRailAd slot={AD_SLOT_RIGHT} side="right" />
          </AdGuard>
        </aside>

      </div>

      <SiteFooter />
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

// Lazy page per route (home stays in the main bundle). Also used by
// entry-client / entry-server to preload the current route before rendering.
const PAGE_ROUTES: Record<string, LazyPage> = {
  '/guides': GuidesHubPage,
  '/what-is-a-jwt': WhatIsJwtPage,
  '/jwt-header-payload-signature-explained': HeaderPayloadSignaturePage,
  '/jwt-claims-explained': ClaimsExplainedPage,
  '/jwt-verification-guide': VerificationGuidePage,
  '/hs256-vs-rs256': Hs256VsRs256Page,
  '/jwt-security-best-practices': SecurityBestPracticesPage,
  '/common-jwt-errors-and-fixes': CommonErrorsPage,
  '/jwt-decoder-vs-jwt-validator': DecoderVsValidatorPage,
  '/jwt-vs-session-tokens': JwtVsSessionTokensPage,
  '/jwt-in-oauth2-and-openid-connect': JwtInOauth2AndOidcPage,
  '/how-to-decode-jwt-in-javascript-python-go': DecodeJwtInCodePage,
  '/es256-explained': Es256ExplainedPage,
  '/ps256-vs-rs256': Ps256VsRs256Page,
  '/none-algorithm-vulnerability': NoneAlgorithmVulnerabilityPage,
  '/decode-jwt-without-a-server': DecodeJwtWithoutAServerPage,
  '/jwt-storage-localstorage-vs-cookie': JwtStorageLocalstorageVsCookiePage,
  '/jwt-refresh-token-pattern': JwtRefreshTokenPatternPage,
  '/how-to-debug-a-jwt': HowToDebugAJwtPage,
  '/jwt-io-alternative': JwtIoAlternativePage,
  '/what-is-jwks': WhatIsJwksPage,
  '/validate-azure-entra-id-jwt': ValidateEntraIdJwtPage,
  '/validate-aws-cognito-jwt': ValidateCognitoJwtPage,
  '/jwt-websocket-authentication': JwtWebsocketAuthPage,
  '/jwt-vs-saml': JwtVsSamlPage,
  '/jwt-vs-oauth': JwtVsOauthPage,
  '/jwt-vs-bearer-token': JwtVsBearerTokenPage,
  '/jwt-vs-api-key': JwtVsApiKeyPage,
  '/jwt-size-limit': JwtSizeLimitPage,
  '/jwt-secret-key-generator': JwtSecretKeyGeneratorPage,
  '/jwt-scopes-vs-roles': JwtScopesVsRolesPage,
  '/jwt-logout-and-revocation': JwtLogoutRevocationPage,
  '/jwt-kid-header': JwtKidHeaderPage,
  '/jwt-in-microservices': JwtMicroservicesPage,
  '/jwt-expiration-time': JwtExpirationTimePage,
  '/jwt-curl-postman': JwtCurlPostmanPage,
  '/jwt-authentication-spring-boot': JwtAuthSpringBootPage,
  '/jwt-authentication-nodejs-express': JwtAuthNodeExpressPage,
  '/jwt-authentication-nextjs': JwtAuthNextjsPage,
  '/jwt-authentication-fastapi': JwtAuthFastapiPage,
  '/jwt-authentication-django': JwtAuthDjangoPage,
  '/jwt-authentication-aspnet-core': JwtAuthAspNetCorePage,
  '/jwt-audience-claim': JwtAudienceClaimPage,
  '/jwt-attacks-and-vulnerabilities': JwtAttacksPage,
  '/is-jwt-encrypted-jws-vs-jwe': IsJwtEncryptedPage,
  '/generate-jwt-signing-keys-openssl': GenerateJwtSigningKeysPage,
  '/decode-jwt-command-line': DecodeJwtCommandLinePage,
  '/about': AboutPage,
  '/contact': ContactPage,
  '/privacy-policy': PrivacyPolicyPage,
  '/terms': TermsPage,
  '/how-it-works': HowItWorksPage,
};

export function preloadRoute(pathname: string): Promise<unknown> {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path === '/') return Promise.resolve();
  return (PAGE_ROUTES[path] ?? NotFoundPage).preload();
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {Object.entries(PAGE_ROUTES).map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
