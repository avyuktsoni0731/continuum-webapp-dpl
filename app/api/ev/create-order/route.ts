import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { resolveVerceraCheckoutSession } from "@/lib/ev-checkout-session";

const EV_PROXY_SECRET = process.env.EV_PROXY_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

function normalizeHost(host: string): string {
  return host.replace(/^www\./i, "") || host;
}

function isContinuumOrigin(req: NextRequest): boolean {
  try {
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const siteHost = normalizeHost(new URL(SITE_URL).hostname);
    if (!origin) return false;
    const originHost = normalizeHost(new URL(origin).hostname);
    return originHost === siteHost || originHost === "localhost";
  } catch {
    return false;
  }
}

function isAuthorized(req: NextRequest): boolean {
  if (isContinuumOrigin(req)) return true;
  if (!EV_PROXY_SECRET) return false;
  const header =
    req.headers.get("x-ev-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === EV_PROXY_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!RAZORPAY_KEY_ID || !keySecret) {
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 500 }
    );
  }

  try {
    const checkoutId = req.cookies.get("ev_checkout_id")?.value?.trim();
    if (!checkoutId) {
      return NextResponse.json({ error: "Checkout session missing" }, { status: 400 });
    }
    const session = await resolveVerceraCheckoutSession(checkoutId);

    const amountInPaise = Math.round(Number(session.amountInr) * 100);
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: keySecret,
    });

    const receiptId = session.bundleId ? `bundle_${session.bundleId}` : `ev_${session.eventId}`;
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `${receiptId}_${Date.now().toString(36)}`,
      notes: {
        checkout_id: checkoutId,
        ...(session.eventId && { event_id: session.eventId }),
        ...(session.bundleId && { bundle_id: session.bundleId }),
        event_name: session.eventName,
        user_id: session.userId,
        participant_email: session.email ?? "",
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("EV create-order error:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
