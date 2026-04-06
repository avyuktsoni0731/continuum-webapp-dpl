import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { resolveVerceraCheckoutSession } from "@/lib/ev-checkout-session";

const EV_PROXY_SECRET = process.env.EV_PROXY_SECRET;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const VERCERA_CALLBACK_URL = process.env.VERCERA_CALLBACK_URL;
const VERCERA_CALLBACK_SECRET = process.env.VERCERA_CALLBACK_SECRET;

function normalizeHost(host: string): string {
  return host.replace(/^www\./i, "") || host;
}

function isContinuumOrigin(req: NextRequest): boolean {
  try {
    const origin =
      req.headers.get("origin") || req.headers.get("referer") || "";
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

  if (!RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const { orderId, paymentId, signature } = body;
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required fields (orderId, paymentId, signature)" },
        { status: 400 },
      );
    }
    const checkoutId = req.cookies.get("ev_checkout_id")?.value?.trim();
    if (!checkoutId) {
      return NextResponse.json({ error: "Checkout session missing" }, { status: 400 });
    }
    const session = await resolveVerceraCheckoutSession(checkoutId);
    const expectedAmountPaise = Math.round(Number(session.amountInr) * 100);

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    if (!RAZORPAY_KEY_ID) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }
    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);
    if (!order || !payment || payment.order_id !== orderId) {
      return NextResponse.json({ error: "Invalid order/payment linkage" }, { status: 400 });
    }
    if (order.amount !== expectedAmountPaise || payment.amount !== expectedAmountPaise) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    if (!VERCERA_CALLBACK_URL || !VERCERA_CALLBACK_SECRET) {
      return NextResponse.json(
        { error: "Callback not configured" },
        { status: 503 },
      );
    }

    const callbackPayload = {
      orderId,
      paymentId,
      checkoutId,
      ...(session.eventId && { eventId: session.eventId }),
      ...(session.bundleId && { bundleId: session.bundleId }),
      eventName: session.eventName,
      amount: Number(session.amountInr),
      userId: session.userId,
      team: null,
      teamName: null,
      memberEmails: null,
      additionalInfo: session.additionalInfo || null,
    };

    const callbackRes = await fetch(VERCERA_CALLBACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Callback-Secret": VERCERA_CALLBACK_SECRET,
      },
      body: JSON.stringify(callbackPayload),
    });

    if (!callbackRes.ok) {
      const errText = await callbackRes.text();
      console.error("Vercera callback failed:", callbackRes.status, errText);
      return NextResponse.json(
        {
          error: "Registration callback failed",
          callbackStatus: callbackRes.status,
          callbackError: errText.slice(0, 200),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and registration saved",
    });
  } catch (err) {
    console.error("EV verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
