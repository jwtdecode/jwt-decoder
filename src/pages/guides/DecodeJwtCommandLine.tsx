import { SEOHead } from '../../components/SEOHead';
import { ArticleLayout, ArticleH1, ArticleH2, ArticleH3, ArticleP, ArticleUl, ArticleLi, ArticlePre, ArticleCallout, ArticleIntroBox, ArticleCode } from '../../components/ArticleLayout';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Decode a JWT From the Command Line: Bash, jq, PowerShell and JWT CLIs',
  description: 'Tested one-liners to decode a JWT in the terminal with bash, jq, PowerShell, Python and Node.js, plus the Rust jwt-cli and step CLI, with base64url padding handled correctly.',
  url: 'https://jwtdecode.app/decode-jwt-command-line',
  mainEntityOfPage: 'https://jwtdecode.app/decode-jwt-command-line',
  image: 'https://jwtdecode.app/og-image.png',
  datePublished: '2026-09-24',
  dateModified: '2026-09-24',
  author: { '@type': 'Person', '@id': 'https://jwtdecode.app/about#andy', name: 'Andy', url: 'https://jwtdecode.app/about#andy' },
  publisher: { '@type': 'Organization', '@id': 'https://jwtdecode.app/#organization', name: 'JWT Decode', url: 'https://jwtdecode.app/' },
};

const link = 'text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2';

const TOOLS: [tool: string, install: string, decodes: string, verifies: string][] = [
  ['bash + base64 + jq', 'Usually preinstalled (jq via package manager)', 'Yes', 'No'],
  ['jq only (1.7)', 'apt, dnf, brew, winget', 'Yes', 'No'],
  ['PowerShell', 'Built into Windows; pwsh on Linux/macOS', 'Yes', 'No'],
  ['Python / Node.js one-liner', 'Standard library only', 'Yes', 'No'],
  ['jwt-cli (Rust, binary "jwt")', 'cargo install jwt-cli, brew, scoop, pacman', 'Yes', 'HS* secret, or a key file'],
  ['step CLI', 'brew install step, winget, scoop', 'Yes (inspect --insecure)', 'Yes (verify with --key or --jwks)'],
];

export default function DecodeJwtCommandLinePage() {
  return (
    <>
      <SEOHead
        title="Decode JWT From the Command Line (Bash, CLI)"
        description="Decode a JWT from the command line with tested bash, jq, PowerShell and Python one-liners that handle base64url padding, plus the jwt-cli and step CLI tools."
        path="/decode-jwt-command-line"
        ogType="article"
        article={{ publishedTime: '2026-09-24', section: 'JWT Guides' }}
        jsonLd={jsonLd}
      />
      <ArticleLayout
        breadcrumbs={[{ label: 'Decode JWT on the Command Line' }]}
        publishedDate="2026-09-24"
        relatedLinks={[
          { to: '/how-to-decode-jwt-in-javascript-python-go', label: 'Decode JWT in Code', description: 'Decoding in JavaScript, Python and Go application code.' },
          { to: '/jwt-curl-postman', label: 'JWT With curl and Postman', description: 'Sending a bearer token once you have decoded and checked it.' },
          { to: '/how-to-debug-a-jwt', label: 'How to Debug a JWT', description: 'A step-by-step routine for a token the server rejects.' },
          { to: '/decode-jwt-without-a-server', label: 'Decode JWT Without a Server', description: 'Why local decoding keeps tokens out of third-party logs.' },
        ]}
      >
        <ArticleH1>Decode a JWT From the Command Line: Bash, jq, PowerShell and JWT CLI Tools</ArticleH1>

        <ArticleIntroBox>
          The shortest reliable way to decode a JWT in a terminal is jq 1.7 on its own:{' '}
          <ArticleCode>jq -R 'split(".") | .[0:2] | map(gsub("-";"+") | gsub("_";"/") | @base64d | fromjson)' {'<<<'} "$TOKEN"</ArticleCode>.
          It prints the header and payload as JSON. The popular <ArticleCode>cut -d. -f2 | base64 -d</ArticleCode>{' '}
          trick fails on many real tokens, because JWT segments use the base64url alphabet and drop the{' '}
          <ArticleCode>=</ArticleCode> padding.
          <br /><br />
          Below are tested versions for bash, PowerShell, Python and Node.js, followed by two dedicated tools, the
          Rust <ArticleCode>jwt-cli</ArticleCode> and smallstep's <ArticleCode>step</ArticleCode>, which can also verify
          signatures. Decoding only reads the token; it proves nothing about who issued it.
        </ArticleIntroBox>

        <ArticleH2 id="why-base64-d-fails">Why the Naive base64 -d Approach Fails</ArticleH2>
        <ArticleP>
          A JWT is three base64url segments joined by dots (RFC 7515 §2). Base64url differs from ordinary Base64 in
          two ways: it uses <ArticleCode>-</ArticleCode> and <ArticleCode>_</ArticleCode> in place of{' '}
          <ArticleCode>+</ArticleCode> and <ArticleCode>/</ArticleCode>, and it omits trailing <ArticleCode>=</ArticleCode>{' '}
          padding. GNU <ArticleCode>base64 -d</ArticleCode> understands neither. Here is a real payload segment that
          contains an underscore:
        </ArticleP>
        <ArticlePre lang="bash">{`$ echo "$TOKEN" | cut -d. -f2 | base64 -d
{"sub":"user-123","name":"Ada Lovelace","role":"admin","emoji_free":"übase64: invalid input`}</ArticlePre>
        <ArticleP>
          The output stops at the first <ArticleCode>_</ArticleCode>. When a segment's length is not a multiple of four,
          the last few bytes are also lost or rejected, depending on the implementation. Whether a given token
          happens to work is luck, which is why a one-liner that works on one token breaks on the next. The{' '}
          <a href="/jwt-header-payload-signature-explained" className={link}>header, payload and signature guide</a>{' '}
          explains the encoding in full.
        </ArticleP>

        <ArticleH2 id="decode-jwt-bash">How to Decode a JWT in Bash</ArticleH2>
        <ArticleP>
          This function translates the alphabet, restores the padding and pretty-prints with jq. Pass{' '}
          <ArticleCode>1</ArticleCode> for the header; the payload is the default.
        </ArticleP>
        <ArticlePre lang="bash">{`jwt_decode() {
  local seg
  seg=$(printf '%s' "$1" | cut -d. -f"\${2:-2}" | tr '_-' '/+')
  case $(( \${#seg} % 4 )) in
    2) seg="$seg==" ;;
    3) seg="$seg=" ;;
  esac
  printf '%s' "$seg" | base64 --decode | jq .
}

jwt_decode "$TOKEN" 1   # header
jwt_decode "$TOKEN"     # payload
jwt_decode "$TOKEN" | jq -r '.exp | todate'
# 2026-09-21T15:13:20Z`}</ArticlePre>
        <ArticleP>
          It works in bash and zsh. The function was tested on a token whose payload needed two padding characters
          and contained both <ArticleCode>_</ArticleCode> and multi-byte UTF-8.
        </ArticleP>
        <ArticleH3 id="macos-base64">macOS: base64 -D vs -d</ArticleH3>
        <ArticleP>
          The long option <ArticleCode>--decode</ArticleCode> is accepted by both GNU coreutils and the macOS{' '}
          <ArticleCode>base64</ArticleCode>, which is why the function uses it. The short flag is where scripts break:
          GNU uses <ArticleCode>-d</ArticleCode>, older macOS releases accepted only <ArticleCode>-D</ArticleCode>, and
          recent macOS accepts both. For timestamps without jq, GNU <ArticleCode>date -u -d @1790003600</ArticleCode>{' '}
          and BSD/macOS <ArticleCode>date -u -r 1790003600</ArticleCode> do the same conversion.
        </ArticleP>

        <ArticleH2 id="decode-jwt-jq">Decode a JWT With jq Alone</ArticleH2>
        <ArticleP>
          jq's <ArticleCode>@base64d</ArticleCode> filter decodes Base64 and, in jq 1.7, accepts input without padding,
          so only the alphabet needs translating. Running it with <ArticleCode>-R</ArticleCode> reads the token as a raw
          string:
        </ArticleP>
        <ArticlePre lang="bash">{`jq -R 'split(".") | .[0:2] | map(gsub("-";"+") | gsub("_";"/") | @base64d | fromjson)' <<< "$TOKEN"

# Only the payload, with readable dates
jq -R 'split(".")[1] | gsub("-";"+") | gsub("_";"/") | @base64d | fromjson
       | .exp |= todate | .iat |= todate' <<< "$TOKEN"`}</ArticlePre>
        <ArticleP>
          The second form fails if a token has no <ArticleCode>iat</ArticleCode>; drop that part of the filter when
          needed. If you are on jq 1.6 and see decoding errors, use the bash function instead, which pads explicitly.
        </ArticleP>

        <ArticleH2 id="decode-jwt-powershell">Decode a JWT in PowerShell</ArticleH2>
        <ArticleP>
          .NET's <ArticleCode>Convert.FromBase64String</ArticleCode> is strict about both alphabet and padding, so the
          same two fixes are needed. This function was tested in PowerShell 7.6 and uses nothing that Windows
          PowerShell 5.1 lacks:
        </ArticleP>
        <ArticlePre lang="powershell">{`function ConvertFrom-Jwt([string]$Token) {
  foreach ($part in $Token.Split('.')[0..1]) {
    $s = $part.Replace('-', '+').Replace('_', '/')
    switch ($s.Length % 4) { 2 { $s += '==' } 3 { $s += '=' } }
    [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($s)) |
      ConvertFrom-Json | ConvertTo-Json -Depth 10
  }
}

ConvertFrom-Jwt $env:TOKEN

# Convert exp to a date
[DateTimeOffset]::FromUnixTimeSeconds(1790003600).UtcDateTime`}</ArticlePre>
        <ArticleP>
          <ArticleCode>ConvertTo-Json -Depth 10</ArticleCode> matters: the default depth truncates nested claims such as
          Keycloak's <ArticleCode>realm_access</ArticleCode> or Entra ID's nested objects.
        </ArticleP>

        <ArticleH2 id="decode-jwt-python-node">Python and Node.js One-Liners</ArticleH2>
        <ArticlePre lang="bash">{`# Python 3: header and payload, padding restored with -len(s) % 4
python3 -c "import sys,json,base64; [print(json.dumps(json.loads(base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))), indent=2, ensure_ascii=False)) for s in sys.argv[1].split('.')[:2]]" "$TOKEN"

# Node.js 16+: Buffer understands base64url directly, no padding needed
node -e 'for (const s of process.argv[1].split(".").slice(0, 2)) console.log(JSON.parse(Buffer.from(s, "base64url")))' "$TOKEN"`}</ArticlePre>
        <ArticleP>
          These are useful on servers where jq is not installed but a runtime is. For decoding inside application
          code rather than a shell, see{' '}
          <a href="/how-to-decode-jwt-in-javascript-python-go" className={link}>decoding a JWT in JavaScript, Python and Go</a>.
        </ArticleP>

        <ArticleH2 id="decode-jwt-from-logs-and-curl">Decode Tokens From curl Output and Log Files</ArticleH2>
        <ArticleP>
          In practice the token is rarely sitting in a variable. It arrives in a JSON response from a token
          endpoint, or it is buried in a log line. Both cases compose with the bash function above:
        </ArticleP>
        <ArticlePre lang="bash">{`# Straight from a token endpoint response
TOKEN=$(curl -s -X POST https://auth.example.com/oauth/token \\
  -d grant_type=client_credentials -u "$CLIENT_ID:$CLIENT_SECRET" | jq -r .access_token)
jwt_decode "$TOKEN"

# Every JWT-shaped string in a log file, summarised one per line
grep -oE 'eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*' app.log |
  while read -r t; do jwt_decode "$t" | jq -c '{sub, exp}'; done`}</ArticlePre>
        <ArticleP>
          The pattern relies on the fact that a compact JSON header starting with <ArticleCode>{'{"'}</ArticleCode> always encodes
          to <ArticleCode>eyJ</ArticleCode>. It also matches some non-JWT strings with that prefix, so treat the output as
          candidates. If a log contains tokens at all, that is worth fixing: Authorization headers should be
          redacted before they are written. The <a href="/jwt-curl-postman" className={link}>curl and Postman guide</a>{' '}
          shows how to send the token back to an API once you have inspected it.
        </ArticleP>

        <ArticleH2 id="jwt-cli-rust">jwt-cli: The Rust JWT CLI (brew, cargo, Linux)</ArticleH2>
        <ArticleP>
          <ArticleCode>jwt-cli</ArticleCode> by Mike Engel is the most widely used dedicated tool. The crate and
          package are called <ArticleCode>jwt-cli</ArticleCode>; the installed binary is <ArticleCode>jwt</ArticleCode>.
          Version 6.2.0 is current on crates.io and Homebrew at the time of writing.
        </ArticleP>
        <ArticlePre lang="bash">{`# Install (pick one)
brew install jwt-cli          # Homebrew formula; the README also lists mike-engel/jwt-cli/jwt-cli
cargo install jwt-cli         # installs to ~/.cargo/bin
scoop install jwt-cli         # Windows
sudo pacman -S jwt-cli        # Arch Linux
# Other Linux: prebuilt binaries on the GitHub releases page

# Decode (header and claims, pretty-printed)
jwt decode "$TOKEN"

# JSON output with exp/iat/nbf rendered as ISO 8601 dates
jwt decode --json --date "$TOKEN"

# Read the token from stdin
curl -s https://auth.example.com/token ... | jq -r .access_token | jwt decode -

# Validate an HS256 signature too (secret from a file, or base64 bytes)
jwt decode --secret @secret.txt "$TOKEN"
jwt decode --secret b64:c2VjcmV0... "$TOKEN"`}</ArticlePre>
        <ArticleP>
          Without <ArticleCode>--secret</ArticleCode>, <ArticleCode>jwt decode</ArticleCode> only decodes. With one, it
          also checks the signature and expiry: a wrong secret prints "The JWT provided has an invalid signature" and
          exits with status 1, and an expired token is rejected unless you pass <ArticleCode>--ignore-exp</ArticleCode>.
          For RSA and EC keys, <ArticleCode>--secret @public.pem</ArticleCode> reads the key from a file; the
          underlying library requires PKCS#8 for EC private keys when encoding. The same binary can also create
          tokens with <ArticleCode>jwt encode</ArticleCode>, handy for local tests.
        </ArticleP>
        <ArticleH3 id="jwt-cli-npm">What about "jwt cli npm"?</ArticleH3>
        <ArticleP>
          The npm package named <ArticleCode>jwt-cli</ArticleCode> is a different, smaller project (version 2.0.0, last
          published in 2022) that also installs a command called <ArticleCode>jwt</ArticleCode>. Installing both puts
          two unrelated <ArticleCode>jwt</ArticleCode> binaries on your <ArticleCode>PATH</ArticleCode>; check{' '}
          <ArticleCode>jwt --version</ArticleCode> if the flags above do not work. If you already have Node.js, the
          one-liner in the previous section avoids the extra dependency.
        </ArticleP>

        <ArticleH2 id="step-cli">step CLI: Inspect and Verify</ArticleH2>
        <ArticleP>
          smallstep's <ArticleCode>step</ArticleCode> (installed with <ArticleCode>brew install step</ArticleCode>,{' '}
          <ArticleCode>winget install Smallstep.step</ArticleCode> or a Linux package) has a{' '}
          <ArticleCode>crypto jwt</ArticleCode> subcommand. Inspecting requires <ArticleCode>--insecure</ArticleCode>{' '}
          as a deliberate reminder that nothing is being verified:
        </ArticleP>
        <ArticlePre lang="bash">{`# Decode without verifying
echo "$TOKEN" | step crypto jwt inspect --insecure

# Verify signature, issuer and audience with a PEM public key
echo "$TOKEN" | step crypto jwt verify --key public.pem \\
  --iss https://issuer.example --aud api

# Or against a JWKS file
echo "$TOKEN" | step crypto jwt verify --jwks jwks.json \\
  --iss https://issuer.example --aud api`}</ArticlePre>
        <ArticleP>
          <ArticleCode>verify</ArticleCode> insists on <ArticleCode>--iss</ArticleCode> and <ArticleCode>--aud</ArticleCode>{' '}
          unless you pass <ArticleCode>--subtle</ArticleCode>, and <ArticleCode>--no-exp-check</ArticleCode> lets you
          examine an expired token. That strictness makes it a good model of what a real verifier should check; see
          the <a href="/jwt-verification-guide" className={link}>JWT verification guide</a> for the full list.
        </ArticleP>

        <ArticleH2 id="jwt-cli-comparison">JWT CLI Options Compared</ArticleH2>
        <div className="overflow-x-auto mb-6 rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--surface-card)] text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Tool</th>
                <th className="px-3 py-2 font-semibold">Install</th>
                <th className="px-3 py-2 font-semibold">Decodes</th>
                <th className="px-3 py-2 font-semibold">Verifies</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {TOOLS.map(([tool, install, decodes, verifies]) => (
                <tr key={tool} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{tool}</td>
                  <td className="px-3 py-2">{install}</td>
                  <td className="px-3 py-2">{decodes}</td>
                  <td className="px-3 py-2">{verifies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ArticleH2 id="decode-jwt-locally-safely">Decode JWTs Locally Without Leaking Them</ArticleH2>
        <ArticleP>
          A JWT is a bearer credential until it expires. Anyone who copies it from your terminal, logs or history
          can use it. A few habits keep that from happening:
        </ArticleP>
        <ArticleUl>
          <ArticleLi><strong>Keep tokens out of shell history.</strong> Pasting <ArticleCode>TOKEN=eyJ...</ArticleCode> writes the token to <ArticleCode>~/.bash_history</ArticleCode> or <ArticleCode>~/.zsh_history</ArticleCode>. Read it without echoing instead: <ArticleCode>read -rs TOKEN</ArticleCode>, then paste. In bash, <ArticleCode>HISTCONTROL=ignorespace</ArticleCode> also skips any command typed with a leading space; zsh has <ArticleCode>setopt HIST_IGNORE_SPACE</ArticleCode>.</ArticleLi>
          <ArticleLi><strong>PowerShell keeps history too.</strong> PSReadLine saves commands to the file shown by <ArticleCode>(Get-PSReadLineOption).HistorySavePath</ArticleCode>. Load tokens from an environment variable or file rather than typing them.</ArticleLi>
          <ArticleLi><strong>Watch process listings.</strong> A token passed as an argument is visible to other users via <ArticleCode>ps</ArticleCode> while the command runs. Piping it on stdin (<ArticleCode>jwt decode -</ArticleCode>, <ArticleCode>step crypto jwt inspect</ArticleCode>) avoids that.</ArticleLi>
          <ArticleLi><strong>Never paste production tokens into tools that upload them.</strong> All the commands on this page run locally. In the browser, <a href="/" className={link}>the jwtdecode.app decoder</a> also decodes entirely client-side, which <a href="/decode-jwt-without-a-server" className={link}>decoding without a server</a> explains.</ArticleLi>
        </ArticleUl>
        <ArticleCallout type="warning">
          Decoding is not validation. Every method above will happily print a token with a forged signature or a
          past <ArticleCode>exp</ArticleCode>. Use decoded output for debugging only, and make authorisation decisions
          from a verified token. The <a href="/jwt-decoder-vs-jwt-validator" className={link}>decoder vs validator</a>{' '}
          page covers the difference.
        </ArticleCallout>

        <ArticleH2 id="summary">Summary</ArticleH2>
        <ArticleUl>
          <ArticleLi>JWT segments are base64url without padding; translate <ArticleCode>-_</ArticleCode> to <ArticleCode>+/</ArticleCode> and pad to a multiple of four before using <ArticleCode>base64 --decode</ArticleCode> or <ArticleCode>FromBase64String</ArticleCode>.</ArticleLi>
          <ArticleLi>jq 1.7's <ArticleCode>@base64d</ArticleCode> gives a one-liner; Python and Node.js one-liners work where jq is missing.</ArticleLi>
          <ArticleLi>For a dedicated tool, the Rust <ArticleCode>jwt-cli</ArticleCode> (binary <ArticleCode>jwt</ArticleCode>) decodes, validates and encodes; <ArticleCode>step crypto jwt</ArticleCode> inspects and strictly verifies.</ArticleLi>
          <ArticleLi>Keep tokens out of shell history and process listings, and never treat decoded output as verified.</ArticleLi>
        </ArticleUl>
      </ArticleLayout>
    </>
  );
}
