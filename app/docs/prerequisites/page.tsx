import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function PrerequisitesPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Before You Begin</h1>
      <p className="text-xl text-muted-foreground">
        Make sure you have everything needed before installing Continuum:
      </p>

      <section className="mt-8">
        <h2>Required</h2>

        <div className="mt-4 space-y-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="flex items-center gap-2">
              <span className="text-2xl">1.</span> Slack Workspace
            </h3>
            <ul className="mt-2 space-y-2 text-base">
              <li>• <strong className="text-foreground">Free or paid Slack workspace</strong></li>
              <li>• <strong className="text-foreground">Admin permissions</strong> to install apps (or request admin approval)</li>
              <li>• <strong className="text-foreground">Slack web app access</strong> (for OAuth flow)</li>
            </ul>
            <div className="mt-3 p-3 bg-background/50 rounded border border-border">
              <p className="text-sm font-medium mb-1">How to check:</p>
              <p className="text-sm text-muted-foreground">Go to your Slack workspace settings and check if you have "Manage apps" permission.</p>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="flex items-center gap-2">
              <span className="text-2xl">2.</span> Active Internet Connection
            </h3>
            <ul className="mt-2 space-y-2 text-base">
              <li>• Stable internet for OAuth flows</li>
              <li>• Access to external APIs (Jira, GitHub)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2>Optional (But Recommended)</h2>

        <div className="mt-4 space-y-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="flex items-center gap-2">
              <span className="text-2xl">3.</span> Jira Cloud Account
            </h3>
            <ul className="mt-2 space-y-2 text-base">
              <li>• <strong className="text-foreground">Jira Cloud workspace</strong> (not Jira Server/Data Center)</li>
              <li>• <strong className="text-foreground">Admin or user access</strong> to the workspace you want to connect</li>
              <li>• <strong className="text-foreground">Jira API access</strong> (usually enabled by default)</li>
            </ul>
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-sm"><strong>Note:</strong> Jira Server/Data Center support coming soon.</p>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="flex items-center gap-2">
              <span className="text-2xl">4.</span> GitHub Account
            </h3>
            <ul className="mt-2 space-y-2 text-base">
              <li>• <strong className="text-foreground">GitHub.com account</strong> (personal or organization)</li>
              <li>• <strong className="text-foreground">Access to repositories</strong> you want to manage</li>
              <li>• <strong className="text-foreground">OAuth app permissions</strong> (Continuum will request minimal permissions)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2>Permissions Required</h2>

        <div className="mt-4 space-y-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3>Slack Permissions</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm font-mono text-foreground">app_mentions:read</code> - To see when you mention Continuum</li>
              <li><code>chat:write</code> - To respond with messages</li>
              <li><code>commands</code> - For slash commands</li>
              <li><code>im:history</code> / <code>im:read</code> - For DM conversations</li>
              <li><code>users:read</code> - To identify users</li>
              <li><code>reactions:write</code> - For emoji reactions</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h3>Jira Permissions</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Read issues</li>
              <li>Create issues</li>
              <li>Update issues</li>
              <li>Add comments</li>
              <li>View projects</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h3>GitHub Permissions</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Read repository (public and private)</li>
              <li>Read/write pull requests</li>
              <li>Read/write issues</li>
              <li>Read user profile</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2>What You Don't Need</h2>
        <div className="mt-4 p-4 bg-card border border-border rounded-lg">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <span><strong>No installation</strong> on your computer</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <span><strong>No server setup</strong> required</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <span><strong>No code knowledge</strong> needed</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <span><strong>No database</strong> to manage</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <span><strong>No API keys</strong> to generate (we handle OAuth)</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-8 pt-8 border-t border-border flex gap-4">
        <Link href="/docs/quick-start">
          <Button variant="outline" className="w-full sm:w-auto">
            ← Quick Start
          </Button>
        </Link>
        <Link href="/docs/installing-to-slack" className="ml-auto">
          <Button variant="default" className="w-full sm:w-auto">
            Installing to Slack
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
