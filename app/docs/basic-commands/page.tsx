import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function BasicCommandsPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Getting Started with Continuum</h1>
      <p className="text-xl text-muted-foreground">
        Learn the basic commands to start using Continuum effectively.
      </p>

      <h2>How to Use Continuum</h2>
      <p><strong>Two ways to interact:</strong></p>
      <ol>
        <li><strong>Mention Continuum</strong> in a channel or DM:
          <pre className="mt-2"><code>{`@continuum show my tasks`}</code></pre>
        </li>
        <li><strong>Use slash commands</strong> (limited commands available):
          <pre className="mt-2"><code>{`/connections
/connect-jira
/connect-github`}</code></pre>
        </li>
      </ol>

      <h2>Basic Query Patterns</h2>
      <p>Continuum understands natural language. You don't need to memorize exact commands—just ask naturally.</p>

      <h3>General Queries</h3>
      <p><strong>Get help:</strong></p>
      <pre><code>{`@continuum help
@continuum what can you do?`}</code></pre>

      <p className="mt-4"><strong>Check status:</strong></p>
      <pre><code>{`@continuum status
@continuum what integrations are connected?`}</code></pre>

      <h3>Jira Queries (if Jira is connected)</h3>
      <p><strong>View your tasks:</strong></p>
      <pre><code>{`@continuum show my tasks
@continuum what are my open issues?
@continuum list my assigned tasks`}</code></pre>

      <p className="mt-4"><strong>Get issue details:</strong></p>
      <pre><code>{`@continuum what's the status of KAN-123?
@continuum show me KAN-123
@continuum details for issue KAN-123`}</code></pre>

      <h3>GitHub Queries (if GitHub is connected)</h3>
      <p><strong>View your PRs:</strong></p>
      <pre><code>{`@continuum show my pull requests
@continuum what PRs do I have open?
@continuum list my PRs`}</code></pre>

      <p className="mt-4"><strong>Get PR details:</strong></p>
      <pre><code>{`@continuum show PR #42
@continuum what's the status of PR #42?
@continuum details for PR #42 in avyuktsoni0731/continuum-api`}</code></pre>

      <h2>Slash Commands Reference</h2>
      
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3><code>/connections</code></h3>
          <p className="text-sm mt-2">Shows status of all connected integrations.</p>
          <p className="text-sm mt-2"><strong>Response:</strong> Shows formatted cards with Jira and GitHub connection status (✅ Connected / ❌ Not connected), plus Connect/Reconnect buttons.</p>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3><code>/connect-jira</code></h3>
          <p className="text-sm mt-2">Initiates Jira OAuth connection flow.</p>
          <p className="text-sm mt-2"><strong>Response:</strong> Shows button to start Jira authorization. Click to connect.</p>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3><code>/connect-github</code></h3>
          <p className="text-sm mt-2">Initiates GitHub OAuth connection flow.</p>
          <p className="text-sm mt-2"><strong>Response:</strong> Shows button to start GitHub authorization. Click to connect.</p>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h3><code>/disconnect</code></h3>
          <p className="text-sm mt-2">Shows options to disconnect integrations.</p>
          <p className="text-sm mt-2"><strong>Response:</strong> Shows disconnect buttons for each connected integration.</p>
        </div>
      </div>

      <h2>Tips for Better Queries</h2>
      <div className="mt-4 space-y-2">
        <p><strong>Be specific:</strong></p>
        <ul>
          <li>❌ "show tasks"</li>
          <li>✅ "show my open tasks"</li>
        </ul>

        <p className="mt-4"><strong>Include context:</strong></p>
        <ul>
          <li>❌ "show PR"</li>
          <li>✅ "show PR #42 in avyuktsoni0731/continuum-api"</li>
        </ul>

        <p className="mt-4"><strong>Use natural language:</strong></p>
        <ul>
          <li>✅ "move KAN-123 to In Progress"</li>
          <li>✅ "who should I assign this backend task to?"</li>
          <li>✅ "what PRs need review?"</li>
        </ul>
      </div>

      <div className="mt-8 pt-8 border-t border-border flex gap-4">
        <Link href="/docs/verifying-installation">
          <Button variant="outline" className="w-full sm:w-auto">
            ← Verifying Installation
          </Button>
        </Link>
        <Link href="/docs/jira-operations" className="ml-auto">
          <Button variant="default" className="w-full sm:w-auto">
            Jira Operations
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
