"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Calendar,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  FileText,
  Wrench,
  Droplets,
  Building2,
  Menu,
  X,
  Search,
  LogOut,
  Bell,
  User,
  UserCheck,
  UserCog,
  CalendarDays,
} from "lucide-react";
import useNotifications from "@/hooks/use-notifications";
import { useSignOut } from "@/hooks/use-signout";
import { SessionGuard } from "@/components/auth/session-guard";
import { TailwindClasses } from "@/lib/design-system";
import { useResponsive } from "@/hooks/use-responsive";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importar estilos del dashboard
import './dashboard-no-text-cursor.css';
import './dashboard-responsive.css';

type SearchResult = {
  id: string | number;
  tipo: string;
  nombre?: string;
  titulo?: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { handleSignOut } = useSignOut();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const isCalendar = pathname === "/dashboard/schedule/calendar";

  // Cerrar sidebar en móviles cuando se cambia de ruta
  useEffect(() => {
    if (sidebarOpen && !isDesktop) {
      setSidebarOpen(false);
    }
  }, [pathname, sidebarOpen, isDesktop]);

  // Cerrar sidebar cuando se hace clic fuera en móviles
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && !isDesktop) {
        const sidebar = document.querySelector('[data-sidebar]');
        const menuButton = document.querySelector('[data-menu-button]');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isDesktop]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const data = res.ok ? await res.json() : [];
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  const handleSearchResultClick = async (item: SearchResult) => {
    if (!item?.id || !item?.tipo) return;
    const href =
      item.tipo === "cliente"
        ? `/dashboard/clients/${item.id}`
        : item.tipo === "trabajo"
          ? `/dashboard/my-jobs/${item.id}`
          : null;
    if (!href) return;

    setSearch("");
    setSearchResults([]);
    if (pathname !== href) {
      await router.refresh();
      router.push(href);
    }
  };

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
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: CalendarDays, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Trabajadores", href: "/dashboard/workers", icon: UserCog, color: "text-indigo-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Cotización", href: "/dashboard/quotes", icon: DollarSign, color: "text-orange-500" },
          { name: "Liquidación", href: "/dashboard/liquidations", icon: UserCheck, color: "text-red-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
          { name: "Notificaciones Web", href: "/dashboard/website-notifications", icon: Bell, color: "text-blue-500" },
          { name: "Administración", href: "/dashboard/admin", icon: Settings, color: "text-gray-300" },
        ];
      case "secretaria":
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: CalendarDays, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Cotización", href: "/dashboard/quotes", icon: DollarSign, color: "text-orange-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
          { name: "Notificaciones Web", href: "/dashboard/website-notifications", icon: Bell, color: "text-blue-500" },
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
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "secretaria":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "tecnico":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "secretaria":
        return "Secretaria";
      case "tecnico":
        return "Técnico";
      default:
        return role;
    }
  };

  return (
    <SessionGuard>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Optimizado con Tailwind */}
        <div
          data-sidebar
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-80 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-800">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-xl shadow-md">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold">Améstica</h1>
                <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">Servicios Técnicos</p>
              </div>
            </Link>
            <button 
              data-menu-button
              className="lg:hidden p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2">
            {getNavigationItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-800 hover:text-white text-xs sm:text-sm lg:text-base ${
                  pathname === item.href ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color} flex-shrink-0`} />
                <span className="font-medium truncate">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {userRole === "admin" && (
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate hidden sm:block">Améstica Ltda</span>
                <span className="truncate sm:hidden">Améstica</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 py-2 sm:py-3 lg:py-4 shadow-sm">
            <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <button 
                  data-menu-button
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200" 
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* Search - Solo visible en desktop */}
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes, trabajos..."
                    value={search}
                    onChange={handleSearch}
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500 w-64 xl:w-80"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute mt-1 w-64 xl:w-80 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((item) => (
                        <div
                          key={`${item.tipo}-${item.id}`}
                          onClick={() => handleSearchResultClick(item)}
                          className="px-3 sm:px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        >
                          {item.nombre || item.titulo}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:bg-gray-100 p-1 sm:p-2">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Role Badge - Solo visible en tablet y desktop */}
                <Badge className={`${getRoleColor(userRole)} hidden md:inline-flex text-xs`} variant="outline">
                  {getRoleLabel(userRole)}
                </Badge>

                {/* User Profile */}
                <Suspense fallback={<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 text-gray-600 hover:bg-gray-100">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarImage
                            src={session?.user?.image || "/avatar-demo.png"}
                            alt={session?.user?.name || "User"}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-white text-[#002D71] text-xs sm:text-sm">
                            {session?.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden xl:block ml-3 text-left">
                          <p className="text-sm font-medium">{session?.user?.name || "Usuario Demo"}</p>
                          <p className="text-xs text-gray-500">{session?.user?.email || "usuario@demo.com"}</p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <div className="flex flex-col gap-1 p-3">
                        <p className="font-medium text-sm">{session?.user?.name || "Usuario Demo"}</p>
                        <p className="truncate text-xs text-muted-foreground">{session?.user?.email || "usuario@demo.com"}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" /> Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" /> Configuración
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Suspense>
              </div>
            </div>
          </header>

          {/* Mobile Search */}
          <div className="lg:hidden px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar clientes, trabajos..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div
                      key={`${item.tipo}-${item.id}`}
                      onClick={() => handleSearchResultClick(item)}
                      className="px-3 sm:px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    >
                      {item.nombre || item.titulo}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <main className={`flex-1 ${isCalendar ? 'p-0' : 'p-2 sm:p-3 lg:p-4 xl:p-6'}`}>
            <div className={isCalendar ? 'h-full' : 'w-full'}>
              {children || (
                <div className="text-center py-6 sm:py-8 lg:py-12">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 text-gray-400">
                    <Droplets className="w-full h-full" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2">Bienvenido al Sistema</h2>
                  <p className="text-sm sm:text-base text-gray-500 px-4">Selecciona una opción del menú para comenzar</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
