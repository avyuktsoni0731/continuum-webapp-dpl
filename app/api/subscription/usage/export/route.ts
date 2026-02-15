import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") || "30";
  const daysNum = Math.min(90, Math.max(1, parseInt(days, 10) || 30));

  const res = await fetch(
    `${API_URL}/subscription/usage/export?days=${daysNum}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "Export failed");
    return new Response(text, { status: res.status });
  }

  const csv = await res.text();
  const filename = `continuum-usage-${daysNum}d.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
