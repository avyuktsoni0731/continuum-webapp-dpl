import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature,
  } = body;

  if (
    !razorpay_payment_id ||
    !razorpay_payment_link_id ||
    !razorpay_signature
  ) {
    return Response.json(
      { error: "Missing required Razorpay parameters" },
      { status: 400 }
    );
  }

  const res = await fetch(`${API_URL}/subscription/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id:
        razorpay_payment_link_reference_id || "",
      razorpay_payment_link_status,
      razorpay_signature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return Response.json(
      (err as { message?: string; detail?: string }) || {
        error: "Confirmation failed",
      },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
