import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/features/auth/lib/token";

/** Redirect unauthenticated visitors away from /admin (first line of defence). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const isLogin = pathname === "/admin/login";

  // If visiting an admin dashboard route without a valid JWT, redirect to login and clear cookie
  if (!session && !isLogin) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    if (token) {
      res.cookies.delete(SESSION_COOKIE);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
