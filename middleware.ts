import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Skip middleware entirely for API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/auth/signin",
      "/auth/signup",
      "/auth/error",
      "/flights",
      "/ticket-details",
      "/about",
      "/services",
      "/help-center",
      "/faqs",
      "/terms",
      "/privacy",
      "/sitemap",
      "/accessibility",
      "/cookie-settings",
      "/unauthorized",
      "/pending-approval",
    ];

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route =>
      pathname.startsWith(route)
    );

    // If not authenticated and not on a public route, redirect to signin
    if (!token && !isPublicRoute) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url));
    }

    // Check role-based access for authenticated routes
    if (token) {
      const userRole = token.role as string;
      const isApproved = token.isApproved as boolean;

      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (userRole !== "admin") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Agent routes
      if (pathname.startsWith("/agent")) {
        if (userRole !== "agent") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        if (!isApproved) {
          return NextResponse.redirect(new URL("/pending-approval", req.url));
        }
      }

      // Client routes
      if (pathname.startsWith("/client")) {
        if (userRole !== "client") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the middleware function handle authorization
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
