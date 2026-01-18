import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ConnectingGitHubPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Connect Your GitHub Account</h1>
      <p className="text-xl text-muted-foreground">
        Connect your GitHub account to Continuum to manage pull requests, issues, and code reviews directly from Slack.
      </p>

      <section className="mt-8 p-4 bg-card border border-border rounded-lg">
        <h2>Before You Begin</h2>
        <p className="mb-3"><strong className="text-foreground">Requirements:</strong></p>
        <ul className="space-y-2 text-base">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <span>Continuum installed in Slack (see <Link href="/docs/installing-to-slack">Installing to Slack</Link>)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <span>GitHub.com account (GitHub Enterprise not supported yet)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <span>Access to repositories you want to manage</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <p className="text-sm"><strong>Note:</strong> Continuum currently supports GitHub.com (public and private repos). GitHub Enterprise support coming soon.</p>
        </div>
      </section>

      <h2>Connection Methods</h2>

      <div className="space-y-6 mt-6">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 1: Setup Page (Recommended)</h3>
          <ol className="mt-2 space-y-2 text-base">
            <li><strong className="text-foreground">Open setup page</strong> - After installing Continuum, you'll be on the setup page. Or visit: <code>https://continuumworks.app/setup?workspace_id={`{your_uuid}`}</code></li>
            <li><strong className="text-foreground">Click "Connect GitHub"</strong> - Find the GitHub integration card and click the <strong>"Connect GitHub"</strong> button</li>
            <li><strong className="text-foreground">Authorize in GitHub</strong> - You'll be redirected to GitHub's authorization page. Review permissions and click <strong>"Authorize"</strong></li>
            <li><strong className="text-foreground">Confirm connection</strong> - You'll be redirected back with <code>?github_connected=true</code>. Check Slack for a confirmation notification</li>
          </ol>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 2: Slack Command</h3>
          <ol className="mt-2 space-y-2 text-base">
            <li><strong className="text-foreground">Open Slack</strong> - In any channel or DM</li>
            <li><strong className="text-foreground">Run the command</strong> - Type: <pre className="inline-block bg-background border border-border rounded px-2 py-1 text-sm"><code>/connect-github</code></pre></li>
            <li><strong className="text-foreground">Click the button</strong> - Slack will show a button to connect GitHub. Click <strong>"Connect GitHub"</strong></li>
            <li><strong className="text-foreground">Follow authorization flow</strong> - Same as Method 1, steps 3-4</li>
          </ol>
        </div>
      </div>

      <h2>Verifying Connection</h2>
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 1: Test Query</h3>
          <p className="text-base mt-2">In Slack, try:</p>
          <pre className="mt-2"><code>{`@continuum show my pull requests`}</code></pre>
          <p className="text-base mt-2">If GitHub is connected, you should see your PRs.</p>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 2: Check Status</h3>
          <p className="text-base mt-2">Run in Slack:</p>
          <pre className="mt-2"><code>{`/connections`}</code></pre>
          <p className="text-base mt-2">You should see GitHub listed as "✅ Connected".</p>
        </div>
      </div>

      <h2>Permissions Explained</h2>
      <p><strong className="text-foreground">What Continuum requests from GitHub:</strong></p>
      <ul className="space-y-2 text-base mt-2">
        <li><strong className="text-foreground">Read repositories</strong> - To list PRs and issues</li>
        <li><strong className="text-foreground">Read/write pull requests</strong> - To view, create, and update PRs</li>
        <li><strong className="text-foreground">Read/write issues</strong> - To view, create, and comment on issues</li>
        <li><strong className="text-foreground">Read user profile</strong> - To identify you for queries</li>
      </ul>
      <p className="mt-3 text-base"><strong>Scope:</strong> <code>repo</code> scope (for private repos) and <code>user:email</code> (optional).</p>
      <p className="mt-2 text-base">All standard GitHub OAuth permissions - nothing excessive.</p>

      <section className="mt-8 p-4 bg-card border border-border rounded-lg">
        <h2>Repository Access</h2>
        <p className="text-base mt-2"><strong className="text-foreground">Which repositories can Continuum access?</strong></p>
        <ul className="space-y-2 text-base mt-2">
          <li>• <strong className="text-foreground">Public repositories</strong> - Full access (read/write)</li>
          <li>• <strong className="text-foreground">Private repositories</strong> - Only if you have access and granted <code>repo</code> scope</li>
        </ul>
        <p className="mt-3 text-base">Continuum can only access repositories you have access to - it doesn't gain additional permissions.</p>
      </section>

      <div className="mt-8 pt-8 border-t border-border flex gap-4">
        <Link href="/docs/connecting-jira">
          <Button variant="outline" className="w-full sm:w-auto">
            ← Connecting Jira
          </Button>
        </Link>
        <Link href="/docs/verifying-installation" className="ml-auto">
          <Button variant="default" className="w-full sm:w-auto">
            Verifying Installation
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
