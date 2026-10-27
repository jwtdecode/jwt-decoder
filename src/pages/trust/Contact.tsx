import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi } from '../../components/ArticleLayout';

export default function ContactPage() {
  return (
    <>
      <SEOHead
        title="Contact JWT Decode"
        description="Get in touch with the JWT Decode team. Send feedback, report issues, or ask questions about the JWT decoder tool or guides."
        path="/contact"
        noSuffix
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          url: 'https://jwtdecode.app/contact',
          name: 'Contact JWT Decode',
          about: { '@id': 'https://jwtdecode.app/#organization' },
        }}
      />
      <ArticleLayout breadcrumbs={[{ label: 'Contact' }]}>
        <ArticleH1>Contact</ArticleH1>

        <ArticleP>
          For questions, bug reports, content corrections, or feedback about the JWT decoder tool
          or any of the guides on this site, the best way to reach us is by email:
        </ArticleP>

        <div className="my-6">
          <a
            href="mailto:hello@jwtdecode.app"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 5.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            hello@jwtdecode.app
          </a>
        </div>

        <ArticleH2 id="what-to-include">What to Include</ArticleH2>
        <ArticleP>
          The more context you include, the faster we can respond usefully. Here is what to
          include for each type of message:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Bug reports:</strong> Describe the issue, what you expected to happen, and what
            actually happened. Include the browser name and version, the operating system, and any
            error messages shown. If the issue involves a specific token, describe its algorithm
            and structure without including the actual token contents (which may be sensitive).
          </ArticleLi>
          <ArticleLi>
            <strong>Feature requests:</strong> Describe the use case — what task you were trying to
            accomplish and what the tool currently lacks to support it. Concrete use cases are more
            useful than abstract feature descriptions.
          </ArticleLi>
          <ArticleLi>
            <strong>Content corrections:</strong> Include the specific page URL, the claim that appears
            incorrect, and a supporting reference (RFC, spec document, or authoritative source).
            We take accuracy seriously and act on corrections promptly.
          </ArticleLi>
          <ArticleLi>
            <strong>Security issues:</strong> See the responsible disclosure section below.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="response-time">Response Time</ArticleH2>
        <ArticleP>
          We aim to respond to all messages within 5 business days. Content corrections and
          security disclosures are treated as higher priority and typically receive a response
          within 1–2 business days.
        </ArticleP>
        <ArticleP>
          If you do not receive a reply within 5 business days, it is possible the message was
          filtered as spam. Re-sending with a clear subject line (e.g., "JWT Decode bug report"
          or "Content correction — /jwt-claims-explained") generally resolves this.
        </ArticleP>

        <ArticleH2 id="faq">Frequently Asked Questions</ArticleH2>
        <ArticleH3>Why is there no contact form?</ArticleH3>
        <ArticleP>
          This site has no backend server — all JWT processing runs entirely in your browser.
          Adding a contact form would require a server endpoint to receive submissions, which
          conflicts with the privacy-first design philosophy. Email is the simplest alternative
          that requires no backend infrastructure and leaves no server-side logs of message content.
        </ArticleP>
        <ArticleH3>Is my JWT safe to share with you?</ArticleH3>
        <ArticleP>
          Please do not include actual JWT tokens in your email. If you need to describe an issue
          involving a specific token, describe its structure (algorithm, claims present, approximate
          expiry) without including the token value itself. JWTs often contain PII and session
          credentials that should not be transmitted by email.
        </ArticleP>
        <ArticleH3>Can I use the tool for commercial projects?</ArticleH3>
        <ArticleP>
          Yes. JWT Decode is a free tool with no usage restrictions for personal or commercial
          debugging and development work. There is no API to integrate — the tool is a browser-based
          application for human use.
        </ArticleP>
        <ArticleH3>How do I report a security vulnerability?</ArticleH3>
        <ArticleP>
          See the responsible disclosure section below.
        </ArticleP>

        <ArticleH2 id="security-disclosure">Responsible Disclosure</ArticleH2>
        <ArticleP>
          If you discover a security vulnerability in jwtdecode.app — for example, a cross-site
          scripting issue, a privacy leak where token data could be transmitted without the user's
          knowledge, or a cryptographic verification flaw — please disclose it responsibly via
          email before making it public.
        </ArticleP>
        <ArticleP>
          Send vulnerability reports to{' '}
          <a href="mailto:hello@jwtdecode.app" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">hello@jwtdecode.app</a>{' '}
          with a subject line that includes "Security" so it is prioritised. Include:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>A description of the vulnerability and its potential impact</ArticleLi>
          <ArticleLi>Steps to reproduce the issue</ArticleLi>
          <ArticleLi>Any proof-of-concept code or screenshots</ArticleLi>
          <ArticleLi>Your preferred contact details for follow-up</ArticleLi>
        </ArticleUl>
        <ArticleP>
          We will acknowledge receipt within 48 hours, investigate the report, deploy a fix, and
          notify you when the fix is live. We ask that you allow reasonable time for a fix to be
          deployed before any public disclosure — typically 14 days for straightforward issues,
          longer for complex ones if agreed in advance.
        </ArticleP>

        <ArticleH2 id="self-service">Self-Service Resources</ArticleH2>
        <ArticleP>
          Before emailing, the guides on this site cover the most common questions:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Token shows as "Invalid JWT":</strong> See{' '}
            <a href="/common-jwt-errors-and-fixes" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Common JWT Errors and How to Fix Them</a>
            {' '}for a walkthrough of malformed token issues.
          </ArticleLi>
          <ArticleLi>
            <strong>Signature verification fails:</strong> The same guide covers invalid signature
            errors and key format issues.
          </ArticleLi>
          <ArticleLi>
            <strong>Understanding what claims mean:</strong> See{' '}
            <a href="/jwt-claims-explained" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">JWT Claims Explained</a>
            {' '}for a reference on all seven standard registered claims.
          </ArticleLi>
          <ArticleLi>
            <strong>Choosing between HS256 and RS256:</strong> See{' '}
            <a href="/hs256-vs-rs256" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">HS256 vs RS256: When to Use Symmetric vs Asymmetric JWT Signing</a>.
          </ArticleLi>
          <ArticleLi>
            <strong>Privacy questions:</strong> See the{' '}
            <a href="/privacy-policy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Privacy Policy</a>{' '}
            or the{' '}
            <a href="/how-it-works" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">How It Works</a>{' '}
            page for a technical explanation of how token processing works locally.
          </ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
