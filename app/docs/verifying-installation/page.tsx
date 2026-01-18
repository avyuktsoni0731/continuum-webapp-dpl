import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function VerifyingInstallationPage() {
    return (
        <article className="prose prose-invert max-w-none">
            <h1>Verify Everything Is Working</h1>
            <p className="text-xl text-muted-foreground">
                Use these methods to confirm Continuum is installed and configured correctly.
            </p>

            <section className="mt-8 p-4 bg-card border border-border rounded-lg">
                <h2>Quick Verification Checklist</h2>
                <ul className="space-y-2 text-base mt-2">
                    <li className="flex items-center gap-2">
                        <span className="w-5 h-5 border border-border rounded flex items-center justify-center shrink-0">□</span>
                        <span>Continuum is installed in Slack</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-5 h-5 border border-border rounded flex items-center justify-center shrink-0">□</span>
                        <span>You can mention <code>@continuum</code> in channels/DMs</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-5 h-5 border border-border rounded flex items-center justify-center shrink-0">□</span>
                        <span>Jira is connected (if you want Jira features)</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-5 h-5 border border-border rounded flex items-center justify-center shrink-0">□</span>
                        <span>GitHub is connected (if you want GitHub features)</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-5 h-5 border border-border rounded flex items-center justify-center shrink-0">□</span>
                        <span>Continuum responds to queries</span>
                    </li>
                </ul>
            </section>

            <h2>Verification Methods</h2>

            <div className="space-y-6 mt-6">
                <div className="p-4 bg-card border border-border rounded-lg">
                    <h3>Method 1: Test Basic Query (Fastest)</h3>
                    <p className="text-base mt-2"><strong className="text-foreground">In any Slack channel or DM:</strong></p>
                    <pre className="mt-2"><code>{`@continuum help`}</code></pre>
                    <p className="text-base mt-3"><strong className="text-foreground">Expected response:</strong></p>
                    <p className="text-base">Continuum should respond with a help message or acknowledge your query.</p>
                    <div className="mt-3 p-3 bg-background/50 rounded border border-border">
                        <p className="text-sm font-medium mb-1">If no response:</p>
                        <ul className="text-sm space-y-1">
                            <li>• Check if app is installed: <code>/apps</code> in Slack</li>
                            <li>• Verify you're mentioning <code>@continuum</code> correctly</li>
                            <li>• Try in a DM instead of a channel</li>
                        </ul>
                    </div>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                    <h3>Method 2: Check Connections</h3>
                    <p className="text-base mt-2"><strong className="text-foreground">Run in Slack:</strong></p>
                    <pre className="mt-2"><code>{`/connections`}</code></pre>
                    <p className="text-base mt-3"><strong className="text-foreground">Expected response:</strong></p>
                    <p className="text-base">Slack shows a formatted message with:</p>
                    <ul className="space-y-1 text-base mt-2">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            <span>Slack: Connected (always connected after installation)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            <span>Jira: Connected (if you connected Jira)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            <span>GitHub: Connected (if you connected GitHub)</span>
                        </li>
                    </ul>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                    <h3>Method 3: Test Integration-Specific Query</h3>
                    <div className="mt-3 space-y-4">
                        <div>
                            <p className="text-base font-medium mb-2">Test Jira (if connected):</p>
                            <pre className="mt-1"><code>{`@continuum show my tasks`}</code></pre>
                            <p className="text-sm text-muted-foreground mt-2">Should return your Jira issues or a message saying no tasks found. Should NOT say "Jira not connected".</p>
                        </div>
                        <div>
                            <p className="text-base font-medium mb-2">Test GitHub (if connected):</p>
                            <pre className="mt-1"><code>{`@continuum show my pull requests`}</code></pre>
                            <p className="text-sm text-muted-foreground mt-2">Should return your GitHub PRs or a message saying no PRs found. Should NOT say "GitHub not connected".</p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="mt-8 p-4 bg-card border border-border rounded-lg">
                <h2>Verification Status Dashboard</h2>
                <p className="text-base mt-2 mb-4">Summary of what's working:</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 font-medium text-foreground">Feature</th>
                                <th className="text-left py-2 pr-4 font-medium text-foreground">Status</th>
                                <th className="text-left py-2 font-medium text-foreground">How to Check</th>
                            </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                            <tr className="border-b border-border/50">
                                <td className="py-2 pr-4">Slack Installation</td>
                                <td className="py-2 pr-4">✅ / ❌</td>
                                <td className="py-2"><code>/apps</code> or <code>@continuum help</code></td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-2 pr-4">Jira Connection</td>
                                <td className="py-2 pr-4">✅ / ❌</td>
                                <td className="py-2"><code>/connections</code> or <code>@continuum show my tasks</code></td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-2 pr-4">GitHub Connection</td>
                                <td className="py-2 pr-4">✅ / ❌</td>
                                <td className="py-2"><code>/connections</code> or <code>@continuum show my pull requests</code></td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">Basic Queries</td>
                                <td className="py-2 pr-4">✅ / ❌</td>
                                <td className="py-2"><code>@continuum help</code></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="mt-8 pt-8 border-t border-border flex gap-4">
                <Link href="/docs/connecting-github">
                    <Button variant="outline" className="w-full sm:w-auto">
                        ← Connecting GitHub
                    </Button>
                </Link>
                <Link href="/docs/basic-commands" className="ml-auto">
                    <Button variant="default" className="w-full sm:w-auto">
                        Basic Commands
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </article>
    );
}
