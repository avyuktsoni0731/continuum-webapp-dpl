"use client";

import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

export default function EvCheckoutPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const eventId = searchParams.get("eventId") ?? "";
  const eventName = searchParams.get("eventName") ?? "";
  const amount = searchParams.get("amount");
  const userId = searchParams.get("userId") ?? "";
  const email = searchParams.get("email") ?? "";
  const userName = searchParams.get("userName") ?? "";
  const returnUrl = searchParams.get("returnUrl") ?? "";
  const teamParam = searchParams.get("team");
  const additionalInfo = searchParams.get("additionalInfo");

  let team: unknown = null;
  try {
    if (teamParam) team = JSON.parse(atob(teamParam));
  } catch {
    team = null;
  }

  const openPayment = useCallback(async () => {
    if (
      !eventId ||
      !eventName ||
      !amount ||
      !userId ||
      !email ||
      !razorpayReady ||
      typeof window === "undefined" ||
      !window.Razorpay
    ) {
      setError("Missing parameters or Razorpay not loaded.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const createRes = await fetch("/api/ev/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          eventId,
          eventName,
          email,
          userId,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to create order");
      }

      const order = await createRes.json();
      const keyId = order.keyId ?? order.key_id;
      if (!keyId || !order.id) {
        throw new Error("Invalid order response");
      }

      setStatus("processing");

      const options: RazorpayOptions = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Vercera 5.0",
        description: `Registration for ${eventName}`,
        order_id: order.id,
        prefill: { name: userName || undefined, email: email || undefined },
        theme: { color: "#C1E734" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/ev/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                eventId,
                eventName,
                amount: Number(amount),
                userId,
                team: team || null,
                additionalInfo: additionalInfo || null,
              }),
            });

            if (verifyRes.ok) {
              setStatus("success");
              if (returnUrl) {
                window.location.href = returnUrl;
              }
            } else {
              const err = await verifyRes.json().catch(() => ({}));
              setError((err as { error?: string }).error || "Payment verification failed");
              setStatus("failed");
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : "Verification failed");
            setStatus("failed");
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("failed");
    } finally {
      setStatus((s) => (s === "loading" ? "idle" : s));
    }
  }, [
    eventId,
    eventName,
    amount,
    userId,
    email,
    userName,
    returnUrl,
    team,
    additionalInfo,
    razorpayReady,
  ]);

  useEffect(() => {
    if (status === "idle" && razorpayReady && eventId && amount) {
      openPayment();
    }
  }, [status, razorpayReady, eventId, amount, openPayment]);

  const missing =
    !eventId || !eventName || !amount || !userId || !email;

  if (missing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <h1 className="font-serif text-xl font-medium text-foreground">Invalid checkout link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Missing required parameters. Please start from the event registration page.
        </p>
        {returnUrl && (
          <a
            href={returnUrl}
            className="mt-6 text-sm text-accent hover:underline"
          >
            Return to site
          </a>
        )}
      </main>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
      />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card/50 p-8 text-center">
          {status === "success" && (
            <>
              <p className="font-medium text-foreground">Payment successful</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Redirecting you back…
              </p>
              {returnUrl && (
                <a
                  href={returnUrl}
                  className="mt-4 inline-block text-sm text-accent hover:underline"
                >
                  Click here if not redirected
                </a>
              )}
            </>
          )}
          {status === "failed" && (
            <>
              <p className="font-medium text-destructive">Payment failed</p>
              {error && (
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              )}
              <button
                type="button"
                onClick={() => { setStatus("idle"); setError(null); openPayment(); }}
                className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Try again
              </button>
              {returnUrl && (
                <a
                  href={returnUrl}
                  className="mt-4 block text-sm text-accent hover:underline"
                >
                  Return to site
                </a>
              )}
            </>
          )}
          {(status === "idle" || status === "loading" || status === "processing") && (
            <>
              <p className="text-foreground">
                {status === "loading"
                  ? "Preparing payment…"
                  : status === "processing"
                    ? "Complete payment in the popup."
                    : "Loading…"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {eventName} · ₹{amount}
              </p>
              {!razorpayReady && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Loading payment gateway…
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
