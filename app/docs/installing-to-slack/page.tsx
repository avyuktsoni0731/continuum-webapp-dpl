import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function InstallingToSlackPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Install Continuum to Your Slack Workspace</h1>
      <p className="text-xl text-muted-foreground">
        This guide walks you through installing Continuum step-by-step.
      </p>

      <h2>Installation Methods</h2>

      <section className="mt-6 space-y-6">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 1: Public Landing Page (Recommended)</h3>
          <ol className="mt-2 space-y-2">
            <li><strong>Visit the landing page</strong> - Go to <a href="/install">the Continuum install page</a></li>
            <li><strong>Authorize in Slack</strong> - You'll be redirected to Slack's authorization page. Review the permissions Continuum requests and click <strong>"Allow"</strong> to authorize.</li>
            <li><strong>Complete installation</strong> - You'll be redirected back to the setup page. Continuum is now installed in your workspace!</li>
          </ol>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 2: Direct OAuth URL</h3>
          <ol className="mt-2 space-y-2">
            <li><strong>Visit the OAuth URL</strong> - Go to: <code>https://api.continuumworks.app/slack/install</code></li>
            <li><strong>Follow authorization flow</strong> - Same as Method 1, steps 2-3</li>
          </ol>
        </div>
      </section>

      <h2>What Happens During Installation</h2>
      <p>When you click "Add to Slack":</p>
      <ol>
        <li><strong>Slack OAuth Flow Starts</strong> - Continuum redirects you to Slack's authorization page. Slack shows the permissions Continuum is requesting.</li>
        <li><strong>You Review Permissions</strong> - See what Continuum needs access to. All permissions are standard for Slack apps.</li>
        <li><strong>You Authorize</strong> - Click "Allow" to grant permissions. Slack processes the authorization.</li>
        <li><strong>Workspace Created</strong> - Continuum creates a workspace record in its database. Your Slack workspace ID is stored (for security and isolation).</li>
        <li><strong>Bot Token Stored</strong> - Continuum receives a bot token from Slack. Token is encrypted and stored securely. Only your workspace can use this token.</li>
        <li><strong>Setup Page Opens</strong> - You're redirected to the setup page. URL includes: <code>?workspace_id={`{uuid}`}&success=true</code></li>
      </ol>

      <h2>Verifying Installation</h2>
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 1: Check Slack</h3>
          <ol className="mt-2 space-y-1 text-sm">
            <li>Open Slack</li>
            <li>Go to any channel</li>
            <li>Type <code>@continuum</code> (you should see "Continuum" in autocomplete)</li>
            <li>Or check <code>/apps</code> command to see installed apps</li>
          </ol>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3>Method 2: Test Command</h3>
          <p className="text-sm mt-2">In any channel or DM, type:</p>
          <pre className="mt-2"><code>{`@continuum help`}</code></pre>
          <p className="text-sm mt-2">Continuum should respond.</p>
        </div>
      </div>

      <h2>Permissions Explained</h2>
      <p><strong>What Continuum requests:</strong></p>
      <ul>
        <li><code>app_mentions:read</code> - See when you mention <code>@continuum</code></li>
        <li><code>chat:write</code> - Send messages back to you</li>
        <li><code>commands</code> - Handle slash commands like <code>/connections</code></li>
        <li><code>im:history</code> / <code>im:read</code> - Read DM history for context</li>
        <li><code>users:read</code> - Identify team members for delegation</li>
        <li><code>reactions:write</code> - Add emoji reactions (future feature)</li>
      </ul>

      <div className="mt-8 pt-8 border-t border-border flex gap-4">
        <Link href="/docs/prerequisites">
          <Button variant="outline" className="w-full sm:w-auto">
            ← Prerequisites
          </Button>
        </Link>
        <Link href="/docs/connecting-jira" className="ml-auto">
          <Button variant="default" className="w-full sm:w-auto">
            Connecting Jira
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
