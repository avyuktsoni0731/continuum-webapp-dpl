import { DocsSidebar } from "@/components/docs-sidebar";
import { Navbar } from "@/components/navbar";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex pt-24">
                <DocsSidebar />
                <main className="flex-1 p-8 md:p-12 max-w-4xl">
                    {children}
                </main>
            </div>
        </div>
    );
}
