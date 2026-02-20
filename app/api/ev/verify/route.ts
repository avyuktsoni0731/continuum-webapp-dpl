import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const EV_PROXY_SECRET = process.env.EV_PROXY_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const VERCERA_CALLBACK_URL = process.env.VERCERA_CALLBACK_URL;
const VERCERA_CALLBACK_SECRET = process.env.VERCERA_CALLBACK_SECRET;

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

  if (!RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const {
      orderId,
      paymentId,
      signature,
      eventId,
      eventName,
      amount,
      userId,
      team,
      teamName,
      memberEmails,
      additionalInfo,
    } = body;

    if (
      !orderId ||
      !paymentId ||
      !signature ||
      !eventId ||
      !eventName ||
      amount == null ||
      !userId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (!VERCERA_CALLBACK_URL || !VERCERA_CALLBACK_SECRET) {
      return NextResponse.json(
        { error: "Callback not configured" },
        { status: 503 }
      );
    }

    const callbackPayload = {
      orderId,
      paymentId,
      eventId,
      eventName,
      amount: Number(amount),
      userId,
      team: team || null,
      teamName: teamName || null,
      memberEmails: memberEmails || null,
      additionalInfo: additionalInfo || null,
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
        { error: "Registration callback failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and registration saved",
    });
  } catch (err) {
    console.error("EV verify error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
