"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LayoutDashboard, LogOut } from "lucide-react";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isInstallPage = pathname === "/install";
  const isLoggedIn = status === "authenticated" && !!session;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
    >
      <nav className="flex items-center justify-between px-6 py-2 bg-card/50 backdrop-blur-xl border border-border rounded-full shadow-2xl shadow-black/50">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-serif text-lg font-bold tracking-tight">
              Continuum
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-medium">
            {isInstallPage ? (
              <>
                <Link
                  href="/#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/#features"
                  className="hover:text-foreground transition-colors"
                >
                  Integrations
                </Link>
                <Link
                  href="/#pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
                <Link href="/docs" className="hover:text-foreground transition-colors"
                >
                  Docs
                </Link>
                {/* <Link
                  href="/install"
                  className="px-4 py-1.5 rounded-full bg-accent text-background hover:bg-accent/90 border border-accent transition-colors font-medium shadow-lg shadow-accent/20"
                >
                  Install
                </Link> */}
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-foreground transition-colors"
                >
                  Integrations
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
                <Link href="/docs" className="hover:text-foreground transition-colors"
                >
                  Docs
                </Link>
              </>
            )}
          </div>
        </div>
        {isLoggedIn ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Account menu"
              >
                <Avatar.Root className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-accent/20 ring-offset-background">
                  <Avatar.Image
                    src={session?.user?.image ?? undefined}
                    alt={session?.user?.name ?? "User"}
                    className="h-full w-full object-cover"
                  />
                  <Avatar.Fallback
                    className="flex h-full w-full items-center justify-center bg-accent/30 text-sm font-medium text-foreground"
                    delayMs={0}
                  >
                    {session?.user?.name
                      ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : session?.user?.email?.[0]?.toUpperCase() ?? "?"}
                  </Avatar.Fallback>
                </Avatar.Root>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-xl"
                sideOffset={8}
                align="end"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard"
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 border-none font-medium"
              >
                Get started
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </motion.header>
  );
}
