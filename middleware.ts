import { NextResponse } from "next/server";

export function middleware() {
  // Middleware simplificado - solo permitir el flujo normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/api/auth/:path*",
    "/api/dashboard/:path*",
    "/api/jobs/:path*",
    "/api/clients/:path*",
    "/api/workers/:path*",
    "/api/services/:path*",
    "/api/cash-transactions/:path*",
    "/api/invoices/:path*",
    "/api/quotes/:path*",
    "/api/liquidations/:path*",
    "/api/reports/:path*",
    "/api/roles/:path*",
    "/api/upload/:path*",
    "/api/analytics/:path*",
    "/api/schedule/:path*",
    "/api/calendar/:path*",
  ],
};
