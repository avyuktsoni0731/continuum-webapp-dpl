import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function IntroductionPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Welcome to Continuum</h1>
      <p className="text-xl text-muted-foreground">
        <strong>Continuum</strong> is an AI-powered Slack agent that brings Jira, GitHub, and team collaboration tools into your Slack workspace. Ask questions naturally, execute actions, and get intelligent task assignment suggestions—all without leaving Slack.
      </p>

      <h2>What You Can Do</h2>
      <p className="text-lg">With Continuum, you can:</p>
      <ul className="space-y-3 text-base">
        <li>📋 <strong className="text-foreground">Query Jira</strong>: Get issue details, search tasks, check sprint status</li>
        <li>🔀 <strong className="text-foreground">Manage GitHub</strong>: View PRs, check review status, merge requests</li>
        <li>🧠 <strong className="text-foreground">Smart Delegation</strong>: Get AI-powered task assignment suggestions</li>
        <li>💬 <strong className="text-foreground">Natural Language</strong>: Ask questions in plain English</li>
        <li>🔄 <strong className="text-foreground">Execute Actions</strong>: Create issues, update statuses, assign tasks</li>
      </ul>

      <h2>How It Works</h2>
      <ol className="space-y-3 text-base">
        <li><strong className="text-foreground">Install</strong> Continuum to your Slack workspace</li>
        <li><strong className="text-foreground">Connect</strong> your Jira and/or GitHub accounts (OAuth-based, secure)</li>
        <li><strong className="text-foreground">Start using</strong> by mentioning <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm font-mono text-foreground">@continuum</code> in any channel or DM</li>
        <li><strong className="text-foreground">Ask naturally</strong> and get rich, formatted responses</li>
      </ol>

      <h2>Example</h2>
      <pre className="bg-card border border-border rounded-lg p-5 overflow-x-auto text-sm leading-relaxed">
        <code className="text-foreground">{`You: @continuum show my open tasks

Continuum: 📋 Here are your open tasks:

✅ KAN-123 - Fix login bug (In Progress)
📝 KAN-124 - Update API docs (To Do)
🔴 KAN-125 - Security audit (Blocked)

[View in Jira] [Assign] [Update Status]`}</code>
      </pre>

      <div className="mt-8 pt-8 border-t border-border">
        <h2>Next Steps</h2>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/docs/quick-start">
            <Button variant="default" className="w-full sm:w-auto">
              Quick Start Guide
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/docs/basic-commands">
            <Button variant="outline" className="w-full sm:w-auto">
              Learn Commands
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
