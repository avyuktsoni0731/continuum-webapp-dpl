import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const EV_PROXY_SECRET = process.env.EV_PROXY_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

function isContinuumOrigin(req: NextRequest): boolean {
  try {
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const siteHost = new URL(SITE_URL).hostname;
    if (!origin) return false;
    const originHost = new URL(origin).hostname;
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
    const body = await req.json();
    const { amount, eventId, eventName, email, userId } = body;

    if (!amount || !eventId || !eventName || !email || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ev_${eventId}_${Date.now().toString(36)}`,
      notes: {
        event_id: eventId,
        event_name: eventName,
        user_id: userId,
        participant_email: email,
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
