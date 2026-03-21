import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
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

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    const callback = `${path}${request.nextUrl.search}`;
    loginUrl.searchParams.set("callbackUrl", callback);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
