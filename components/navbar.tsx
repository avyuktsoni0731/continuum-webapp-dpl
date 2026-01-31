"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  const isInstallPage = pathname === "/install";

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

              </>
            )}
          </div>
        </div>
        {isInstallPage ? (
          <Link href="/install">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-foreground text-white hover:bg-foreground/90 transition-all border-none font-medium"
            >
              Beta Access!
            </Button>
          </Link>
        ) : (
          <div className="space-x-2">

            <Link
              href="/install"
            >
              <Button className="rounded-full bg-foreground text-white hover:bg-foreground/90 transition-all border-none font-medium"
                variant="outline"
              >
                Beta Access!
              </Button>
            </Link>

            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection("waitlist")}
              className="rounded-full bg-foreground text-white hover:bg-foreground/90 transition-all border-none font-medium"
            >
              Join Waitlist
            </Button> */}
          </div>
        )}
      </nav>
    </motion.header>
  );
}
