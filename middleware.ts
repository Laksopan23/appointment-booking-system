import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Special handling for home route: redirect logged-in users to their dashboard
  if (pathname === "/") {
    const token = req.cookies.get("token")?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const url = req.nextUrl.clone();
        url.pathname =
          payload.role === "CUSTOMER"
            ? "/customer/book"
            : payload.role === "PROVIDER"
              ? "/provider/availability"
              : "/admin/services";
        return NextResponse.redirect(url);
      }
    }
    // Not logged in, allow home page to load
    return NextResponse.next();
  }

  // Public routes allowed without login
  const isPublic =
    pathname.startsWith("/docs") ||
    pathname.startsWith("/api/docs") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  // Protect API routes (optional - we already check roles inside APIs)
  // For now, let API routes pass; API handles auth itself.
  if (pathname.startsWith("/api")) {
    // CSRF protection: enforce X-Requested-With header for non-GET requests
    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      req.method !== "OPTIONS"
    ) {
      const requestedWith = req.headers.get("x-requested-with");
      if (requestedWith !== "fetch") {
        return NextResponse.json({ error: "Invalid request" }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) return redirectToLogin(req);

  const payload = verifyToken(token);
  if (!payload) return redirectToLogin(req);

  // Role-based access rules
  if (pathname.startsWith("/customer") && payload.role !== "CUSTOMER") {
    const url = req.nextUrl.clone();
    url.pathname =
      payload.role === "PROVIDER"
        ? "/provider/availability"
        : "/admin/services";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/provider") && payload.role !== "PROVIDER") {
    const url = req.nextUrl.clone();
    url.pathname =
      payload.role === "CUSTOMER" ? "/customer/book" : "/admin/services";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname =
      payload.role === "CUSTOMER" ? "/customer/book" : "/provider/availability";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
