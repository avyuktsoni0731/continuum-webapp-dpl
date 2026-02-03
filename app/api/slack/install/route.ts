import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const redirectUri =
    body.redirect_uri ||
    `${process.env.NEXTAUTH_URL || req.headers.get("origin") || "http://localhost:3000"}/setup`;

  const res = await fetch(`${API_URL}/slack/install/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({ redirect_uri: redirectUri }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return Response.json(
      (err as { message?: string }) || { error: "Failed to get install URL" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json({ install_url: data.install_url });
}
