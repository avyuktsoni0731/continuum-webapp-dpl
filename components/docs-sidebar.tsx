"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, BookOpen, Rocket, Settings, Target, MessageSquare, Wrench, HelpCircle, FileCode } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DocsSection {
    title: string;
    icon: React.ReactNode;
    items: {
        title: string;
        href: string;
    }[];
}

const docsSections: DocsSection[] = [
    {
        title: "Getting Started",
        icon: <Rocket className="w-4 h-4" />,
        items: [
            { title: "Introduction", href: "/docs/introduction" },
            { title: "Quick Start", href: "/docs/quick-start" },
            { title: "Prerequisites", href: "/docs/prerequisites" },
        ],
    },
    {
        title: "Setup & Installation",
        icon: <Settings className="w-4 h-4" />,
        items: [
            { title: "Installing to Slack", href: "/docs/installing-to-slack" },
            { title: "Connecting Jira", href: "/docs/connecting-jira" },
            { title: "Connecting GitHub", href: "/docs/connecting-github" },
            { title: "Verifying Installation", href: "/docs/verifying-installation" },
        ],
    },
    {
        title: "Using Continuum",
        icon: <Target className="w-4 h-4" />,
        items: [
            { title: "Basic Commands", href: "/docs/basic-commands" },
            { title: "Jira Operations", href: "/docs/jira-operations" },
            { title: "GitHub Operations", href: "/docs/github-operations" },
        ],
    },
    {
        title: "Advanced Features",
        icon: <MessageSquare className="w-4 h-4" />,
        items: [
            { title: "Organizational Memory", href: "/docs/organizational-memory" },
            { title: "Task Delegation", href: "/docs/task-delegation" },
            { title: "Conversation Context", href: "/docs/conversation-context" },
        ],
    },
    {
        title: "Configuration",
        icon: <Wrench className="w-4 h-4" />,
        items: [
            { title: "Workspace Settings", href: "/docs/workspace-settings" },
            { title: "Integration Settings", href: "/docs/integration-settings" },
        ],
    },
    {
        title: "Troubleshooting",
        icon: <HelpCircle className="w-4 h-4" />,
        items: [
            { title: "Common Issues", href: "/docs/common-issues" },
            { title: "Error Messages", href: "/docs/error-messages" },
            { title: "Connection Problems", href: "/docs/connection-problems" },
        ],
    },
];

export function DocsSidebar() {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>(
        // Auto-expand the section containing the current page
        docsSections
            .filter((section) =>
                section.items.some((item) => pathname === item.href)
            )
            .map((section) => section.title)
    );

    const toggleSection = (title: string) => {
        setExpandedSections((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title]
        );
    };

    return (
        <aside className="w-64 shrink-0 border-r border-border bg-card/50 p-6 overflow-y-auto">
            <div className="mb-8">
                <Link
                    href="/docs/introduction"
                    className="flex items-center gap-2 text-xl font-serif font-bold hover:text-accent transition-colors"
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Documentation</span>
                </Link>
            </div>

            <nav className="space-y-2">
                {docsSections.map((section) => {
                    const isExpanded = expandedSections.includes(section.title);
                    return (
                        <div key={section.title} className="space-y-1">
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/10"
                            >
                                <span className="shrink-0">{section.icon}</span>
                                <span className="flex-1 text-left">{section.title}</span>
                                <ChevronRight
                                    className={`w-4 h-4 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="ml-7 space-y-1 pl-2 border-l border-border">
                                            {section.items.map((item) => {
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${isActive
                                                                ? "bg-accent/20 text-accent font-medium"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
