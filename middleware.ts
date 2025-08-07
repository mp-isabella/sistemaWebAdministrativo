import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirecciones específicas por rol
    if (pathname === "/dashboard" && token?.role) {
      // Si es técnico, redirigir a sus trabajos
      if (token.role === "operador") {
        return NextResponse.redirect(new URL("/dashboard/my-jobs", req.url))
      }
    }

    // Proteger rutas de admin
    if (
      pathname.startsWith("/dashboard/workers") ||
      pathname.startsWith("/dashboard/analytics") ||
      pathname.startsWith("/dashboard/settings")
    ) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Proteger rutas de técnico
    if (pathname.startsWith("/dashboard/my-jobs") || pathname.startsWith("/dashboard/evidence")) {
      if (token?.role !== "operador") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a páginas públicas
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname === "/login" ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true
        }

        // Requerir autenticación para rutas del dashboard
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/workers/:path*", "/api/jobs/:path*", "/api/reports/:path*"],
}
