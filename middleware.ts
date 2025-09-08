import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // Optimización: Solo loggear en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] Pathname:", pathname);
      console.log("[Middleware] Token:", token);
    }

    // Si no hay token y está intentando acceder al dashboard, redirigir al login
    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si hay token, manejar redirecciones basadas en roles
    if (token) {
      const role = token['role'] as string;

      // Verificar permisos específicos por ruta
      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/workers") && role === "tecnico") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/cash") && role === "tecnico") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/quotes") && role === "tecnico") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/liquidations") && role === "tecnico") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/reports") && role === "tecnico") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Solo redirigir si está en la ruta base del dashboard
      if (pathname === "/dashboard") {
        // Para todos los roles, mantener en /dashboard (se renderizará el dashboard específico)
        // No redirigir automáticamente, dejar que el componente decida
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Rutas públicas que no requieren autenticación
        const publicPaths = ['/login', '/api/auth'];
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }
        
        // Todas las demás rutas requieren autenticación
        return !!token;
      },
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
    "/api/quotes/:path*",
    "/api/reports/:path*",
    "/api/roles/:path*",
    "/api/upload/:path*",
    "/api/analytics/:path*",
    "/api/schedule/:path*",
    "/api/calendar/:path*",
  ],
};
