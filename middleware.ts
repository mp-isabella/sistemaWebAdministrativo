import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // Optimización: Solo loggear en desarrollo
    if (process.env.NODE_ENV === "development") {

    }

    // Si no hay token y está intentando acceder al dashboard, redirigir al login
    // Pero solo si no está ya en el proceso de autenticación
    if (!token && pathname.startsWith("/dashboard") && !pathname.includes("/api/auth")) {

      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si hay token, manejar redirecciones basadas en roles
    if (token) {
      const role = token['role'] as string;

      // Permitir acceso al calendario para todos los roles autenticados
      if (pathname.startsWith("/dashboard/schedule/calendar")) {
        return NextResponse.next();
      }

      // Verificar permisos específicos por ruta
      if (pathname.startsWith("/dashboard/admin") && role !== "ADMINISTRADOR" && role !== "administrador" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/workers") && (role === "TECNICO" || role === "tecnico")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/cash") && (role === "TECNICO" || role === "tecnico")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/quotes") && (role === "TECNICO" || role === "tecnico")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/liquidations") && (role === "TECNICO" || role === "tecnico")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/reports") && (role === "TECNICO" || role === "tecnico")) {
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
    "/api/liquidations/:path*",
    "/api/reports/:path*",
    "/api/roles/:path*",
    "/api/upload/:path*",
    "/api/analytics/:path*",
    "/api/schedule/:path*",
    "/api/calendar/:path*",
  ],
};
