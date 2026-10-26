import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("pulse_role")?.value;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!role) {
      // Not logged in -> redirect to root where AuthGuard prompts for PIN
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (role === "marketing") {
      // Logged in as marketing only -> redirect to root with restricted param
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("restricted", "admin");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
