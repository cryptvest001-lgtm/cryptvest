import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin_token")?.value;
    if (!adminToken && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const userToken = request.cookies.get("token")?.value;
  const protectedRoutes = [
    "/dashboard",
    "/deposit",
    "/stake",
    "/withdraw",
    "/activity",
    "/kyc",
    "/support",
  ];
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (isProtected && !userToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard",
    "/deposit",
    "/stake",
    "/withdraw",
    "/activity",
    "/kyc",
    "/support",
  ],
};
