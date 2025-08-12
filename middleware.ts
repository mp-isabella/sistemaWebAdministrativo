import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Para debug (sólo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] Pathname:", pathname);
      console.log("[Middleware] User role:", token?.role);
    }

    // Si no hay token y quiere ir a /dashboard, redirigir a login
    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token) {
      const userRole = (token.role || "").toLowerCase();

      // Rutas solo para Admin
      const adminOnlyPaths = ["/dashboard/admin"];

      // Rutas para Admin, Secretaria y Operador
      const adminSecretariaOperadorPaths = [
        "/dashboard/billing",
        "/dashboard/cash",
        "/dashboard/clients",
        "/dashboard/workers",
        "/dashboard/reports",
        "/dashboard/schedule",
        "/dashboard/analytics",
        "/dashboard/schedule/calendar",
      ];

      // Rutas solo para Operador
      const operadorOnlyPaths = ["/dashboard/my-jobs", "dashboard/evidences"];

      // Rutas accesibles para todos roles autenticados (dashboard principal)
      const allRolesPaths = ["/dashboard"];

      // Validar acceso según ruta
      if (adminOnlyPaths.some(path => pathname.startsWith(path))) {
        if (userRole !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } else if (operadorOnlyPaths.some(path => pathname.startsWith(path))) {
        if (userRole !== "operador") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } else if (adminSecretariaOperadorPaths.some(path => pathname.startsWith(path))) {
        // Estas rutas permiten admin, secretaria y operador
        if (!["admin", "secretaria", "operador"].includes(userRole)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } else if (allRolesPaths.some(path => pathname === path)) {
        // Dashboard principal - todos roles autenticados pueden entrar
        if (!["admin", "secretaria", "operador"].includes(userRole)) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      } else {
        // Para cualquier otra ruta, bloquear acceso si no está autenticado
        if (!token) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      }
    }

    // Si pasa todas las validaciones, dejar continuar
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
