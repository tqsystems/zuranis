import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting routes
 * 
 * This middleware will:
 * 1. Check if the user is authenticated
 * 2. Redirect to sign-in if not authenticated
 * 3. Allow access if authenticated
 * 
 * You can customize which routes to protect by modifying the matcher
 */

export default withAuth(
  function middleware(req) {
    // You can add custom logic here
    // For example, role-based access control
    
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

    // If user is on an auth page and is authenticated, redirect to home
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
        
        // Allow access to auth pages without authentication
        if (isAuthPage) {
          return true;
        }

        // Require authentication for protected routes
        // Add your protected routes to the matcher below
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

/**
 * Matcher configuration
 * 
 * Specify which routes should be protected by this middleware.
 * Routes not matched will be publicly accessible.
 * 
 * Examples:
 * - "/dashboard/:path*" - Protect all dashboard routes
 * - "/api/protected/:path*" - Protect API routes
 * - "/((?!api|_next/static|_next/image|favicon.ico).*)" - Protect all routes except public assets
 */
export const config = {
  matcher: [
    // Protect these routes (uncomment to enable)
    // "/dashboard/:path*",
    // "/profile/:path*",
    // "/settings/:path*",
    // "/api/protected/:path*",
  ],
};
