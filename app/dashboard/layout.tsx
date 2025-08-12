"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Droplets,
  Wrench,
  Camera,
  ChevronDown,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type SearchResult = {
  id: string | number;
  tipo: string;
  nombre?: string;
  titulo?: string;
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Función para manejar la búsqueda con debounce
  useEffect(() => {
    const fetchResults = async () => {
      if (search.trim() === "") {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        } else {
          console.error("Error en la búsqueda:", res.statusText);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error buscando:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 300); // Debounce de 300ms
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Función para manejar clics en resultados de búsqueda
 const handleSearchResultClick = async (item: SearchResult) => {
  if (!item || !item.id || !item.tipo) {
    console.warn("Elemento de búsqueda inválido:", item);
    return;
  }

  const href =
    item.tipo === "cliente"
      ? `/dashboard/clients/${item.id}`
      : item.tipo === "trabajo"
      ? `/dashboard/my-jobs/${item.id}`
      : null;

  if (!href) {
    console.warn("Tipo desconocido en resultado de búsqueda:", item.tipo);
    return;
  }

  console.log("Navegando a resultado:", href);
  setSearch("");
  setSearchResults([]);

  if (pathname !== href) {
    await router.refresh(); // invalida la cache de la página actual o ruta
    router.push(href);
  }
};

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
    return null;
  }

  const userRole = session?.user?.role?.toLowerCase() ?? "";

  const getNavigationItems = () => {
    const commonItems = [
      {
        name: "Calendario",
        href: "/dashboard/schedule/calendar",
        icon: Calendar,
        color: "text-yellow-600",
      },
    ];

    switch (userRole) {
      case "admin":
        return [
          ...commonItems,
          {
            name: "Agenda",
            href: "/dashboard/schedule",
            icon: Calendar,
            color: "text-purple-600",
          },
          {
            name: "Clientes",
            href: "/dashboard/clients",
            icon: Users,
            color: "text-green-600",
          },
          {
            name: "Trabajadores",
            href: "/dashboard/workers",
            icon: Users,
            color: "text-indigo-600",
          },
          
          {
            name: "Cajas",
            href: "/dashboard/cash",
            icon: CreditCard,
            color: "text-purple-600",
          },
          {
            name: "Facturación",
            href: "/dashboard/billing",
            icon: DollarSign,
            color: "text-orange-600",
          },
          {
            name: "Reportes",
            href: "/dashboard/reports",
            icon: FileText,
            color: "text-red-600",
          },
          {
            name: "Administración",
            href: "/dashboard/admin",
            icon: Settings,
            color: "text-gray-600",
          },
        ];
      case "secretaria":
        return [
          ...commonItems,
          {
            name: "Programación",
            href: "/dashboard/schedule",
            icon: Calendar,
            color: "text-purple-600",
          },
          {
            name: "Clientes",
            href: "/dashboard/clients",
            icon: Users,
            color: "text-green-600",
          },
          
          {
            name: "Cajas",
            href: "/dashboard/cash",
            icon: CreditCard,
            color: "text-purple-600",
          },
          {
            name: "Facturación",
            href: "/dashboard/billing",
            icon: DollarSign,
            color: "text-orange-600",
          },
          {
            name: "Reportes",
            href: "/dashboard/reports",
            icon: FileText,
            color: "text-red-600",
          },
          
        ];
      case "operador":
        return [
          ...commonItems,
          {
            name: "Mis Trabajos",
            href: "/dashboard/my-jobs",
            icon: Wrench,
            color: "text-blue-600",
          },
          {
            name: "Evidencias",
            href: "/dashboard/evidences",
            icon: Wrench,
            color: "text-red-600",
          },
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
      case "operador":
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
      case "operador":
        return "Operador";
      default:
        return role;
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar fijo en escritorio */}
        <div className="hidden lg:flex">
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-lg z-50">
            <aside>
              <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Améstica</h1>
                    <p className="text-xs text-blue-100">Servicios Técnicos</p>
                  </div>
                </Link>
              </div>
              <nav className="mt-6 px-3 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActiveRoute(item.href)
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 pointer-events-none ${
                        isActiveRoute(item.href) ? "text-blue-700" : item.color
                      } group-hover:scale-110 transition-transform`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
              {userRole === "admin" && (
                <div className="absolute bottom-4 left-3 right-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Améstica
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Overlay móvil y sidebar móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-xl transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:hidden`}
        >
          <aside>
            <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Améstica</h1>
                  <p className="text-xs text-blue-100">Servicios Técnicos</p>
                </div>
              </Link>
              <button
                className="lg:hidden text-white hover:opacity-75 transition-opacity"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6 px-3 space-y-1">
  {navigationItems.map((item) => (
    <Link key={item.name} href={item.href} legacyBehavior>
  <a
    className={`group w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActiveRoute(item.href)
        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    <item.icon
      className={`mr-3 h-5 w-5 pointer-events-none ${
        isActiveRoute(item.href) ? "text-blue-700" : item.color
      } group-hover:scale-110 transition-transform`}
    />
    {item.name}
  </a>
</Link>


  ))}
</nav>

          </aside>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col min-h-screen lg:pl-64">
          <header className="sticky top-0 z-30 bg-white border-b shadow-sm h-16 flex items-center px-4 sm:px-6 justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar clientes / trabajos..."
                  className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
                  value={search}
                  onChange={handleSearch}
                />

                {/* Resultados de búsqueda */}
                {(searchResults.length > 0 || isSearching) && search && (
                  <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-80 z-50 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="px-4 py-3 text-center text-gray-500">
                        Buscando...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <button
                          key={`${item.tipo}-${item.id}`}
                          onClick={() => handleSearchResultClick(item)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {item.nombre || item.titulo}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.tipo}
                            </Badge>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No se encontraron resultados
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <Badge className={getRoleColor(userRole)} variant="outline">
                {getRoleLabel(userRole)}
              </Badge>
              <Suspense fallback={<div>Cargando...</div>}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src="/placeholder.svg"
                          alt={session.user.name || ""}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {session.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-3 space-y-1">
                      <p className="font-medium text-sm">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/profile")}
                      className="cursor-pointer"
                    >
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/settings")}
                      className="cursor-pointer"
                    >
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Suspense>
            </div>
          </header>
          <main className="flex-1 p-6 w-full">{children}</main>
        </div>
      </div>
    </>
  );
}
