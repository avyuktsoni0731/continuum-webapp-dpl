import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { tier, billing_interval = "monthly" } = body;

  if (!tier || !["starter", "pro"].includes(tier)) {
    return Response.json(
      { error: "Invalid tier. Must be starter or pro." },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const res = await fetch(`${API_URL}/subscription/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      tier,
      billing_interval,
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return Response.json(
      (err as { message?: string }) || { error: "Checkout failed" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
