import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConnectingJiraPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Connect Your Jira Account</h1>
      <p className="text-xl text-muted-foreground">
        Connect your Jira Cloud workspace to Continuum to manage issues, tasks, and sprints directly from Slack.
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
            <span>Jira Cloud account (Jira Server/Data Center not supported yet)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <span>Admin or user access to the Jira workspace you want to connect</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <p className="text-sm"><strong>Note:</strong> Continuum currently supports Jira Cloud only. Jira Server/Data Center support coming soon.</p>
        </div>
      </section>

      <h2>Connection Methods</h2>

      <div className="space-y-6 mt-6">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 1: Setup Page (Recommended)</h3>
          <ol className="mt-2 space-y-2 text-base">
            <li><strong className="text-foreground">Open setup page</strong> - After installing Continuum, you'll be on the setup page. Or visit: <code>https://continuumworks.app/setup?workspace_id={`{your_uuid}`}</code></li>
            <li><strong className="text-foreground">Click "Connect Jira"</strong> - Find the Jira integration card and click the <strong>"Connect Jira"</strong> button</li>
            <li><strong className="text-foreground">Authorize in Atlassian</strong> - You'll be redirected to Atlassian's authorization page. Select your Jira site/workspace and review permissions, then click <strong>"Authorize"</strong></li>
            <li><strong className="text-foreground">Confirm connection</strong> - You'll be redirected back with <code>?jira_connected=true</code>. Check Slack for a confirmation notification</li>
          </ol>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 2: Slack Command</h3>
          <ol className="mt-2 space-y-2 text-base">
            <li><strong className="text-foreground">Open Slack</strong> - In any channel or DM</li>
            <li><strong className="text-foreground">Run the command</strong> - Type: <pre className="inline-block bg-background border border-border rounded px-2 py-1 text-sm"><code>/connect-jira</code></pre></li>
            <li><strong className="text-foreground">Click the button</strong> - Slack will show a button to connect Jira. Click <strong>"Connect Jira"</strong></li>
            <li><strong className="text-foreground">Follow authorization flow</strong> - Same as Method 1, steps 3-4</li>
          </ol>
        </div>
      </div>

      <h2>Verifying Connection</h2>
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 1: Test Query</h3>
          <p className="text-base mt-2">In Slack, try:</p>
          <pre className="mt-2"><code>{`@continuum show my tasks`}</code></pre>
          <p className="text-base mt-2">If Jira is connected, you should see your Jira issues.</p>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 2: Check Status</h3>
          <p className="text-base mt-2">Run in Slack:</p>
          <pre className="mt-2"><code>{`/connections`}</code></pre>
          <p className="text-base mt-2">You should see Jira listed as "✅ Connected".</p>
        </div>
      </div>

      <h2>Permissions Explained</h2>
      <p><strong className="text-foreground">What Continuum requests from Jira:</strong></p>
      <ul className="space-y-2 text-base mt-2">
        <li><strong className="text-foreground">Read issues</strong> - To show your tasks and issue details</li>
        <li><strong className="text-foreground">Create issues</strong> - To create new issues when you ask</li>
        <li><strong className="text-foreground">Update issues</strong> - To change status, assignee, descriptions</li>
        <li><strong className="text-foreground">Add comments</strong> - To comment on issues</li>
        <li><strong className="text-foreground">View projects</strong> - To list projects and their details</li>
        <li><strong className="text-foreground">Transition issues</strong> - To move issues between statuses</li>
      </ul>
      <p className="mt-3 text-base">All standard Jira permissions - nothing excessive.</p>

      <section className="mt-8 p-4 bg-card border border-border rounded-lg">
        <h2>Security</h2>
        <p className="text-base mt-2"><strong className="text-foreground">How credentials are stored:</strong></p>
        <ul className="space-y-2 text-base mt-2">
          <li>• Tokens encrypted with Fernet (AES-128) before database storage</li>
          <li>• Encryption key stored in secure environment variable</li>
          <li>• Each workspace has isolated credentials (no cross-workspace access)</li>
        </ul>
      </section>

      <div className="mt-8 pt-8 border-t border-border flex gap-4">
        <Link href="/docs/installing-to-slack">
          <Button variant="outline" className="w-full sm:w-auto">
            ← Installing to Slack
          </Button>
        </Link>
        <Link href="/docs/connecting-github" className="ml-auto">
          <Button variant="default" className="w-full sm:w-auto">
            Connecting GitHub
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
