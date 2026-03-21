"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OpsAppShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/ops");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/ops" className="flex min-w-0 items-center gap-3">
            <Image
              src="/Continuum_Ops_Logo.png"
              alt="Continuum Ops"
              width={120}
              height={40}
              className="h-9 w-auto object-contain object-left sm:h-10"
              priority
            />
            <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
              Command center
            </span>
          </Link>

          <Button variant="outline" size="sm" className="shrink-0 gap-2 rounded-full" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to website
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative">{children}</main>
    </div>
  );
}
