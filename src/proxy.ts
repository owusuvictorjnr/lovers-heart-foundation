import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/features/auth/lib/token";

/**
 * Two-Tier Authentication Architecture:
 * 1. Tier 1 (Proxy): Lightweight edge JWT cryptographic verification for fast routing,
 *    redirecting unauthenticated requests away from /admin, and redirecting authenticated
 *    users away from /admin/login without database overhead.
 * 2. Tier 2 (Authoritative Guard): Database-backed sessionVersion validation performed
 *    authoritatively in `requireAdmin()` and `getSession()` on layouts, pages, and server actions.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get(SESSION_COOKIE)?.value ||
    request.cookies.get("__Host-lhf_session")?.value ||
    request.cookies.get("lhf_session")?.value ||
    request.cookies.get("gia_session")?.value;
  const session = await verifySession(token);
  const isLogin = pathname === "/admin/login";

  // If an already authenticated user visits the login page, redirect them straight to the dashboard
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If visiting an admin dashboard route without a valid JWT, redirect to login and clear cookie
  if (!session && !isLogin) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    if (token) {
      res.cookies.delete(SESSION_COOKIE);
      res.cookies.delete("__Host-lhf_session");
      res.cookies.delete("lhf_session");
      res.cookies.delete("gia_session");
    }
    return res;
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

