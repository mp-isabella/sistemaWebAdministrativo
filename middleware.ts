import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] Pathname:", pathname);
      console.log("[Middleware] Token:", token);
    }

    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token) {
      const role = token.role?.toLowerCase();

      // Evita redirigir a la misma ruta que ya estás
      if (pathname === "/dashboard" && role === "admin") return NextResponse.next();
      if (pathname === "/dashboard/my-jobs" && role === "tecnico") return NextResponse.next();
      if (pathname === "/dashboard/billing" && role === "secretaria") return NextResponse.next();

      // Redirigir según rol si intenta acceder a /dashboard base
      if (pathname === "/dashboard") {
        if (role === "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
        if (role === "tecnico") return NextResponse.redirect(new URL("/dashboard/my-jobs", req.url));
        if (role === "secretaria") return NextResponse.redirect(new URL("/dashboard/billing", req.url));
      }

      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/api/jobs/:path*",
    "/api/clients/:path*",
    "/api/workers/:path*",
    "/api/services/:path*",
    "/api/cash-transactions/:path*",
    "/api/invoices/:path*",
    "/api/reports/:path*",
    "/api/roles/:path*",
    "/api/upload/:path*",
    "/api/analytics/:path*",
    "/api/schedule/:path*",
  ],
};
