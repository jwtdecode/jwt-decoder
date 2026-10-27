import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleP, ArticleUl, ArticleLi, ArticleCallout } from '../../components/ArticleLayout';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy for JWT Decode — Local Processing"
        description="Privacy Policy for jwtdecode.app — how the JWT decoder handles your data, what is processed locally, analytics, advertising, cookies, and how to contact us."
        path="/privacy-policy"
        noSuffix
      />
      <ArticleLayout breadcrumbs={[{ label: 'Privacy Policy' }]}>
        <ArticleH1>Privacy Policy</ArticleH1>

        <ArticleP>
          <strong>Last updated: 26 October 2026.</strong>
        </ArticleP>

        <ArticleP>
          This Privacy Policy explains how jwtdecode.app ("we", "our", "the site") handles information
          when you use this website. We have designed this tool with privacy as a primary requirement.
        </ArticleP>

        <ArticleH2 id="jwt-data">JWT Token Data</ArticleH2>
        <ArticleCallout type="success">
          JWT tokens you paste into the decoder are processed entirely in your browser.
          They are never transmitted to our servers, to third-party servers, or to any external service.
        </ArticleCallout>
        <ArticleP>
          All JWT decoding, parsing, and signature verification is performed by JavaScript running
          locally in your browser. The processing uses your device's own computing resources and the
          browser's built-in Web Crypto API. No token content, claims, keys, or secrets you enter
          into this tool are ever sent over the network.
        </ArticleP>
        <ArticleP>
          Token data is held only in the browser's JavaScript memory for the duration of your session.
          It is not written to localStorage, sessionStorage, IndexedDB, or cookies. When you close
          the tab or clear the input field, the data is no longer accessible.
        </ArticleP>
        <ArticleP>
          You can independently verify this by opening your browser's DevTools Network panel before
          pasting a token and confirming that no network requests are triggered by the decoding process.
          The tool also works fully offline: disconnect from the internet after the page loads and
          all decoding and verification features continue to function.
        </ArticleP>

        <ArticleH2 id="analytics">Analytics</ArticleH2>
        <ArticleP>
          This site uses <strong>Google Analytics 4</strong> to measure aggregate page views (which pages
          are visited, approximate location, browser and referring site). Google Analytics sets
          first-party cookies (<code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">_ga</code> and{' '}
          <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">_ga_*</code>) to distinguish visits. It
          never receives JWT content, keys, or anything you type into the tool. You can opt out with
          Google's{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2" rel="noopener noreferrer">Analytics opt-out browser add-on</a>{' '}
          or any content blocker.
        </ArticleP>

        <ArticleH2 id="advertising">Advertising</ArticleH2>
        <ArticleP>
          This site uses <strong>Google AdSense</strong> to display advertisements. Google AdSense loads
          ad scripts and may set cookies for advertising purposes. The AdSense and Google Analytics scripts run in the page itself, as on any site that uses them; the ads they display render inside iframes. Neither script is given your token: the decoder never passes token content to them and makes no network request with it.
        </ArticleP>
        <ArticleP>
          Google AdSense may use cookies and other browser storage mechanisms to:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>Measure ad performance and attribution</ArticleLi>
          <ArticleLi>Serve interest-based advertisements</ArticleLi>
          <ArticleLi>Prevent fraud</ArticleLi>
        </ArticleUl>
        <ArticleP>
          Google's data practices are governed by the{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            Google Privacy Policy
          </a>.
          You can opt out of interest-based advertising via{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            Google Ads Settings
          </a>.
        </ArticleP>

        <ArticleH2 id="cookies">Cookies</ArticleH2>
        <ArticleP>
          The site's own code stores only one item in your browser:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>theme</strong> — stored in <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1 rounded">localStorage</code>.
            Remembers whether you prefer dark or light mode. Contains only the string "dark" or "light".
            No personal information is stored.
          </ArticleLi>
        </ArticleUl>
        <ArticleP>
          Google Analytics and Google AdSense set their own cookies, as described in the Analytics and
          Advertising sections above.
        </ArticleP>

        <ArticleH2 id="server-logs">Server Logs</ArticleH2>
        <ArticleP>
          Our web server may keep standard HTTP access logs that record the IP address, timestamp,
          requested URL, and browser user agent for each page request. These logs are used for
          security monitoring and diagnosis of server issues. They do not contain any JWT token
          content (since tokens are never transmitted to the server). Access logs are retained
          for a limited period consistent with operational need and deleted thereafter.
        </ArticleP>

        <ArticleH2 id="third-parties">Third-Party Services</ArticleH2>
        <ArticleP>
          The following third-party services may load resources on this site:
        </ArticleP>
        <ArticleUl>
          <ArticleLi>
            <strong>Google Analytics:</strong> The analytics script is loaded from Google's servers as described above.
          </ArticleLi>
          <ArticleLi>
            <strong>Google AdSense:</strong> Ad scripts are loaded from Google's servers as described above.
          </ArticleLi>
        </ArticleUl>

        <ArticleH2 id="children">Children's Privacy</ArticleH2>
        <ArticleP>
          This site is a technical developer tool intended for adults. We do not knowingly collect
          any personal information from children under 13 years of age.
        </ArticleP>

        <ArticleH2 id="changes">Changes to This Policy</ArticleH2>
        <ArticleP>
          We may update this Privacy Policy from time to time. Material changes will be reflected
          in the "Last updated" date at the top of this page. Continued use of the site after
          changes constitutes acceptance of the updated policy.
        </ArticleP>

        <ArticleH2 id="contact">Contact</ArticleH2>
        <ArticleP>
          For privacy-related questions, contact us at:{' '}
          <a href="mailto:hello@jwtdecode.app" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            hello@jwtdecode.app
          </a>
        </ArticleP>
      </ArticleLayout>
    </>
  );
}
