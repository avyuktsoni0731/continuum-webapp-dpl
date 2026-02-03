"use client";

import { useEffect } from "react";
import { SessionProvider, signOut } from "next-auth/react";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleUnauthorized = () => {
      signOut({ callbackUrl: "/login" });
    };
    window.addEventListener("continuum:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("continuum:unauthorized", handleUnauthorized);
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
