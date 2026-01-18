import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function QuickStartPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Get Started in 5 Minutes</h1>
      <p className="text-xl text-muted-foreground">
        Follow these steps to get Continuum up and running:
      </p>

      <div className="space-y-12 mt-8">
        <section>
          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-muted-foreground/60 flex items-center justify-center font-serif text-2xl font-medium border border-border/50 mt-1">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 mt-0 leading-tight">Install Continuum (2 minutes)</h2>
              <ol className="mt-2 space-y-3 text-base">
                <li>Visit the <a href="/install" className="text-accent hover:text-accent/90 underline decoration-accent/50 hover:decoration-accent transition-colors font-medium">Continuum install page</a></li>
                <li>Click <strong>"Add to Slack"</strong> button</li>
                <li>Select your Slack workspace</li>
                <li>Review and authorize permissions</li>
                <li>You'll be redirected to the setup page</li>
              </ol>
              <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                <p className="font-medium mb-2">What happens:</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    Continuum bot is added to your workspace
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    You can now mention <code>@continuum</code> in any channel
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    A setup page opens to connect integrations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-muted-foreground/60 flex items-center justify-center font-serif text-2xl font-medium border border-border/50 mt-1">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 mt-0 leading-tight">Connect Jira (Optional, 1 minute)</h2>
              <ol className="mt-2 space-y-3 text-base">
                <li>On the setup page, click <strong>"Connect Jira"</strong></li>
                <li>You'll be redirected to Atlassian</li>
                <li>Select your Jira site/workspace</li>
                <li>Review and authorize permissions</li>
                <li>You'll be redirected back with a success confirmation</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-muted-foreground/60 flex items-center justify-center font-serif text-2xl font-medium border border-border/50 mt-1">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 mt-0 leading-tight">Connect GitHub (Optional, 1 minute)</h2>
              <ol className="mt-2 space-y-3 text-base">
                <li>On the setup page, click <strong>"Connect GitHub"</strong></li>
                <li>You'll be redirected to GitHub</li>
                <li>Review and authorize permissions</li>
                <li>You'll be redirected back with a success confirmation</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-muted-foreground/60 flex items-center justify-center font-serif text-2xl font-medium border border-border/50 mt-1">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 mt-0 leading-tight">Start Using (1 minute)</h2>
              <p className="mt-2 text-base">In any Slack channel or DM, try:</p>
              <pre className="bg-card border border-border rounded-lg p-5 mt-3 text-sm leading-relaxed">
                <code className="text-foreground">{`@continuum show my tasks`}</code>
              </pre>
              <p className="mt-4 text-base">Or if you connected GitHub:</p>
              <pre className="bg-card border border-border rounded-lg p-5 mt-3 text-sm leading-relaxed">
                <code className="text-foreground">{`@continuum show my pull requests`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-12 p-6 bg-card border border-border rounded-lg">
        <h2>Verify It's Working</h2>
        <p>You should see:</p>
        <ul className="space-y-2 mt-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            Continuum responds in the thread
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            Rich formatting with cards and buttons
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            Actual data from your connected integrations
          </li>
        </ul>
      </section>

      <div className="mt-8 pt-8 border-t border-border flex gap-4">
        <Link href="/docs/introduction">
          <Button variant="outline" className="w-full sm:w-auto">
            ← Introduction
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
