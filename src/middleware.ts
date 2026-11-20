import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const SESSION_COOKIE_NAME = "lb_session";

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ||
        "lingo-bridge-dev-fallback-secret-change-in-production-64-chars"
    );
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: String(payload.userId || ""),
      role: String(payload.role || "USER"),
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // Note: /admin renders its own built-in Admin Login page when unauthenticated,
  // while all /api/admin/* endpoints remain strictly protected by requireAdmin().
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
