import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const EV_PROXY_SECRET = process.env.EV_PROXY_SECRET;
// Use only RAZORPAY_KEY_ID here (server-side). The key is returned in the response
// so Vercera's frontend can open Razorpay; no need for NEXT_PUBLIC_ on Continuum for this proxy.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

function checkSecret(req: NextRequest): boolean {
  if (!EV_PROXY_SECRET) return false;
  const header =
    req.headers.get("x-ev-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === EV_PROXY_SECRET;
}

export async function POST(req: NextRequest) {
  if (!checkSecret(req)) {
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
