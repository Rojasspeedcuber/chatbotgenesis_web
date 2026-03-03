import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/api/auth"];

// Routes that require active subscription
const subscriptionRoutes = ["/chat"];

// Admin-only routes
const adminRoutes = ["/admin"];

// Admin email with full access
const ADMIN_EMAIL = "henriquer01@rojasdev.cloud";

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function requiresSubscription(pathname: string): boolean {
  return subscriptionRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except protected ones)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated - redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin email has unlimited access
  if (token.email === ADMIN_EMAIL) {
    return NextResponse.next();
  }

  // Check admin routes
  if (isAdminRoute(pathname)) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
  }

  // Check subscription routes
  if (requiresSubscription(pathname)) {
    // For subscription-required routes, we'll check in the page component
    // since we need to query the database for subscription status
    // The middleware just ensures the user is authenticated
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
