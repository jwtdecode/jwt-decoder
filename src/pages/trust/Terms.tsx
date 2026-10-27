import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleP, ArticleUl, ArticleLi } from '../../components/ArticleLayout';

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Use for JWT Decode — Free Tool, No Warranty"
        description="Terms of use for jwtdecode.app — the JWT decoder is a free informational tool provided as-is. No warranty. User responsible for appropriate use."
        path="/terms"
        noSuffix
      />
      <ArticleLayout breadcrumbs={[{ label: 'Terms of Use' }]}>
        <ArticleH1>Terms of Use</ArticleH1>

        <ArticleP>
          <strong>Last updated: April 2026.</strong>
        </ArticleP>

        <ArticleP>
          These Terms of Use govern your use of jwtdecode.app ("the Site", "the Tool", "we", "our").
          By using this site, you agree to these terms. If you do not agree, please do not use the site.
        </ArticleP>

        <ArticleH2 id="description">Service Description</ArticleH2>
        <ArticleP>
          jwtdecode.app provides a free online tool for decoding, inspecting, and verifying JSON Web
          Tokens (JWTs), together with educational guides about JWT technology. The tool processes
          input entirely in your browser; no token data is transmitted to our servers.
        </ArticleP>

        <ArticleH2 id="no-warranty">No Warranty</ArticleH2>
        <ArticleP>
          This site and tool are provided <strong>"as is"</strong> and <strong>"as available"</strong>,
          without warranty of any kind, express or implied. We make no representations or warranties
          regarding the accuracy, completeness, reliability, suitability, or availability of the tool
          or any information on the site.
        </ArticleP>
        <ArticleP>
          In particular:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>The tool is intended for development, debugging, and educational purposes</ArticleLi>
          <ArticleLi>Results should be verified independently before use in security-critical systems</ArticleLi>
          <ArticleLi>We do not guarantee that the tool is free of bugs or that its output is always correct</ArticleLi>
          <ArticleLi>We do not warrant uninterrupted or error-free operation</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="limitation">Limitation of Liability</ArticleH2>
        <ArticleP>
          To the maximum extent permitted by applicable law, we shall not be liable for any direct,
          indirect, incidental, special, consequential, or exemplary damages arising from your use
          of, or inability to use, this site or tool — including but not limited to damages resulting
          from errors in output, security decisions made based on tool output, or service unavailability.
        </ArticleP>

        <ArticleH2 id="user-responsibility">User Responsibility</ArticleH2>
        <ArticleP>
          You are solely responsible for:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Ensuring that using this tool is appropriate for your specific circumstances</ArticleLi>
          <ArticleLi>Complying with any data protection or privacy laws applicable to tokens you paste into the tool</ArticleLi>
          <ArticleLi>
            Not pasting tokens that you are not authorized to inspect. Even though tokens are
            processed locally, you are responsible for handling token data lawfully
          </ArticleLi>
          <ArticleLi>
            Not using this tool as a replacement for proper security testing, audit, or review
            of production authentication systems
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="acceptable-use">Acceptable Use</ArticleH2>
        <ArticleP>
          You agree not to:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Use this site for any unlawful purpose</ArticleLi>
          <ArticleLi>Attempt to disrupt, overload, or interfere with the site's infrastructure</ArticleLi>
          <ArticleLi>Attempt to access any systems or data beyond what is publicly available</ArticleLi>
          <ArticleLi>Reproduce or distribute site content without attribution</ArticleLi>
        </ArticleUl>

        <ArticleH2 id="intellectual-property">Intellectual Property</ArticleH2>
        <ArticleP>
          The content on this site, including guides, explanatory text, and tool code, is owned by or
          licensed to jwtdecode.app. The JWT specification referenced herein (RFC 7519 and related RFCs)
          is published by the IETF and is in the public domain.
        </ArticleP>

        <ArticleH2 id="third-party">Third-Party Services</ArticleH2>
        <ArticleP>
          This site uses Google AdSense for advertising. Your use of this site is also governed by
          Google's applicable terms. We are not responsible for third-party sites linked from this site.
        </ArticleP>

        <ArticleH2 id="changes">Changes to Terms</ArticleH2>
        <ArticleP>
          We may update these terms at any time. Continued use of the site after changes constitutes
          acceptance of the updated terms. Material changes will be reflected in the "Last updated" date.
        </ArticleP>

        <ArticleH2 id="contact">Contact</ArticleH2>
        <ArticleP>
          For questions about these terms, contact:{' '}
          <a href="mailto:hello@jwtdecode.app" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            hello@jwtdecode.app
          </a>
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
