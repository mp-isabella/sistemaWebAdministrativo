"use client";

import { SessionGuard } from "@/components/auth/session-guard";
import { MobileMenuButton } from "@/components/mobile/mobile-menu-button";
import { MobileNavigation } from "@/components/mobile/mobile-navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import useNotifications from "@/hooks/use-notifications";
import { useSignOut } from "@/hooks/use-signout";
import {
  Bell,
  Building2,
  Calendar,
  CalendarDays,
  CreditCard,
  DollarSign,
  Droplets,
  FileText,
  LogOut,
  Settings,
  User,
  UserCheck,
  UserCog,
  Users,
  Wrench,
  // Menu,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
// import { TailwindClasses } from "@/lib/design-system";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/roles";

import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importar estilos optimizados del dashboard
import './styles/calendar-mobile-optimizations.css';
import './styles/dashboard-optimized.css';
import './styles/force-no-blur.css';
import './styles/mobile-menu-optimizations.css';
import './styles/mobile-optimizations.css';
import './styles/responsive-optimizations.css';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { handleSignOut } = useSignOut();
  const { isOpen: sidebarOpen, toggleMenu, closeMenu } = useMobileMenu();


  const isCalendar = pathname === "/dashboard/schedule/calendar";





  // Always call useNotifications to maintain hook order consistency
  const userRole = (session?.user as any)?.role?.toLowerCase() ?? "";
  const userId = (session?.user as any)?.id ?? "";
  const { unreadCount } = useNotifications(userRole, userId);

  // El SessionGuard se encarga de la verificación de sesión
  // Solo verificar que tenemos los datos necesarios para el layout
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // SessionGuard mostrará el estado de carga
  }

  const getNavigationItems = () => {
    const commonItems = [
      { name: "Calendario", href: "/dashboard/schedule/calendar", icon: Calendar, color: "text-yellow-500" },
    ];
    switch (userRole) {
      case "admin":
      case "administrador":
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: CalendarDays, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Trabajadores", href: "/dashboard/workers", icon: UserCog, color: "text-indigo-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Cotizaciones", href: "/dashboard/quotes", icon: DollarSign, color: "text-orange-500" },
          { name: "Liquidación", href: "/dashboard/liquidations", icon: UserCheck, color: "text-red-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
          { name: "Administración", href: "/dashboard/admin", icon: Settings, color: "text-gray-300" },
        ];
      case "secretaria":
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: CalendarDays, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Cotizaciones", href: "/dashboard/quotes", icon: DollarSign, color: "text-orange-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
        ];
      case "tecnico":
        return [
          ...commonItems,
          { name: "Mis Trabajos", href: "/dashboard/my-jobs", icon: Wrench, color: "text-blue-500" },
        ];
      default:
        return commonItems;
    }
  };

  const getRoleColor = (role: string) => {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
      return ROLE_COLORS.ADMINISTRADOR;
    }
    return ROLE_COLORS[normalizedRole.toUpperCase() as keyof typeof ROLE_COLORS] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getRoleLabel = (role: string) => {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
      return ROLE_LABELS.ADMINISTRADOR;
    }
    return ROLE_LABELS[normalizedRole.toUpperCase() as keyof typeof ROLE_LABELS] || role;
  };

  return (
    <SessionGuard>
      {/* Mobile Navigation - Renderizado fuera del contenedor principal */}
      <MobileNavigation
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={closeMenu}
      />

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Desktop */}
        <div
          data-sidebar
          className="hidden lg:block lg:static inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl"
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between p-3 sm:p-4 lg:p-5 border-b border-slate-700/50 bg-slate-800/30">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white">Améstica</h1>
                <p className="text-xs text-slate-400 hidden sm:block font-medium">Servicios Técnicos</p>
              </div>
            </Link>
            <button
              data-close-menu-button
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-800 touch-manipulation select-none"
              onClick={closeMenu}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
              }}
              aria-label="Cerrar menú de navegación"
              type="button"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>


          {/* Navigation */}
          <nav className="p-3 sm:p-4 lg:p-5 space-y-2">
            {getNavigationItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center space-x-3 px-3 py-3 text-slate-300 rounded-xl transition-all duration-200 hover:bg-slate-700/50 hover:text-white hover:scale-[1.02] hover:shadow-lg text-sm font-medium relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-800 ${pathname === item.href
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                  : ''
                  }`}
                onClick={(e) => {
                  // Cerrar el menú al hacer clic en cualquier elemento
                  e.preventDefault();
                  closeMenu();
                  // Navegar usando el router de Next.js
                  setTimeout(() => {
                    router.push(item.href);
                  }, 150);
                }}
              >
                <div className={`relative z-10 p-2 rounded-lg transition-all duration-200 ${pathname === item.href
                  ? 'bg-white/20'
                  : 'group-hover:bg-slate-600/30'
                  }`}>
                  <item.icon className={`h-5 w-5 ${item.color} transition-all duration-200 ${pathname === item.href ? 'text-white' : 'group-hover:text-white'
                    }`} />
                </div>
                <span className="relative z-10 truncate font-medium text-base">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {(userRole === "admin" || userRole === "administrador") && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <div className="p-1.5 bg-slate-700/50 rounded-lg">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                </div>
                <span className="truncate hidden sm:block font-medium">Améstica Ltda</span>
                <span className="truncate sm:hidden font-medium">Améstica</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-0 main-content-mobile">
          {/* Header */}
          <header className="bg-white border-b border-gray-200/50 py-2 sm:py-3 lg:py-4 shadow-sm mobile-header">
            <div className="flex items-center justify-between px-2 sm:px-3 lg:px-6">
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                <MobileMenuButton
                  isOpen={sidebarOpen}
                  onToggle={toggleMenu}
                />

                {/* Search - Removed as requested by user */}
                {/* <div className="relative hidden xl:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes, trabajos..."
                    value={search}
                    onChange={handleSearch}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 w-64 xl:w-80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute mt-2 w-64 xl:w-80 bg-white/95 backdrop-blur-sm text-gray-900 border border-gray-200/50 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((item) => (
                        <div
                          key={`${item.tipo}-${item.id}`}
                          onClick={() => handleSearchResultClick(item)}
                          className="px-4 py-3 hover:bg-gray-50/80 cursor-pointer text-sm border-b border-gray-100/50 last:border-b-0 transition-colors duration-150 hover:scale-[1.01]"
                        >
                          {item.nombre || item.titulo}
                        </div>
                      ))}
                    </div>
                  )}
                </div> */}
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:bg-gray-100/80 p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs font-semibold shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Role Badge - Solo visible en tablet y desktop */}
                <Badge className={`${getRoleColor(userRole)} hidden sm:inline-flex text-xs rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-semibold shadow-sm hover:shadow-md transition-all duration-200`} variant="outline">
                  {getRoleLabel(userRole)}
                </Badge>

                {/* User Profile */}
                <Suspense fallback={<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200">
                          <AvatarImage
                            src={session?.user?.image || "/avatar-demo.png"}
                            alt={session?.user?.name || "User"}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-semibold">
                            {session?.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block ml-2 sm:ml-3 text-left">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800">{session?.user?.name || "Usuario Demo"}</p>
                          <p className="text-xs text-gray-500">{session?.user?.email || "usuario@demo.com"}</p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white/95 border border-gray-200/50 rounded-xl shadow-xl" align="end">
                      <div className="flex flex-col gap-1 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-t-xl">
                        <p className="font-semibold text-sm text-gray-800">{session?.user?.name || "Usuario Demo"}</p>
                        <p className="truncate text-xs text-gray-500">{session?.user?.email || "usuario@demo.com"}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-gray-200/50" />
                      <DropdownMenuItem asChild className="hover:bg-gray-50/80 transition-colors duration-150">
                        <Link href="/dashboard/profile" className="flex items-center px-4 py-2">
                          <User className="mr-3 h-4 w-4 text-gray-600" /> Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-gray-50/80 transition-colors duration-150">
                        <Link href="/dashboard/settings" className="flex items-center px-4 py-2">
                          <Settings className="mr-3 h-4 w-4 text-gray-600" /> Configuración
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200/50" />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50/80 transition-colors duration-150 px-4 py-2">
                        <LogOut className="mr-3 h-4 w-4" /> Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Suspense>
              </div>
            </div>
          </header>


          {/* Main Content */}
          <main className={`flex-1 mobile-content ${isCalendar ? 'p-0' : 'p-1 sm:p-2 lg:p-4 xl:p-6'}`}>
            <div className={isCalendar ? 'h-full' : 'w-full max-w-none'}>
              {children || (
                <div className="text-center py-6 sm:py-8 lg:py-12 xl:py-16">
                  <div className="relative mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Droplets className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 sm:mb-3">Bienvenido al Sistema</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 px-2 sm:px-4 max-w-md mx-auto leading-relaxed">Selecciona una opción del menú para comenzar a gestionar tu sistema</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}