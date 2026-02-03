"use client";

import { useSession } from "next-auth/react";
import { dispatchUnauthorized } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slack, ArrowRight, Loader2 } from "lucide-react";

interface AddToSlackButtonProps {
  variant?: "default" | "large";
  className?: string;
}

export function AddToSlackButton({ variant = "default", className = "" }: AddToSlackButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      router.push("/register?callbackUrl=/install");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/slack/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirect_uri: `${window.location.origin}/setup`,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatchUnauthorized();
        return;
      }
      if (data.install_url) {
        window.location.href = data.install_url;
      } else {
        throw new Error(data.error || "Failed to get install URL");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const isLarge = variant === "large";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-block group ${className}`}
    >
      <div
        className={`flex items-center gap-4 px-8 py-5 bg-[#4A154B] hover:bg-[#5A1B5B] text-white rounded-full font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-[#4A154B]/30 ${isLarge ? "text-lg md:text-2xl py-6 px-12" : "text-lg"
          }`}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <Slack className={isLarge ? "w-7 h-7" : "w-6 h-6"} />
            <span>Add to Slack</span>
            <ArrowRight className={`group-hover:translate-x-1 transition-transform ${isLarge ? "w-6 h-6" : "w-5 h-5"}`} />
          </>
        )}
      </div>
    </button>
  );
}
