import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: { signIn: "/login" },
});

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();
  const path = request.nextUrl.pathname;

  const isOpsHost = hostname.startsWith("ops.") || hostname === "ops.localhost";

  if (isOpsHost && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/ops";
    return NextResponse.redirect(url);
  }

  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/setup") ||
    path.startsWith("/ops");

  if (!needsAuth) {
    return NextResponse.next();
  }

  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/setup/:path*",
    "/ops",
    "/ops/:path*",
  ],
};
