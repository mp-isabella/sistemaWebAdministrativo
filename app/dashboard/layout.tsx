"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname, useRouter } from "next/navigation";
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
  ChevronDown,
  Building2,
  Menu,
  X,
  Search,
  LogOut,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Usamos versión de Shadcn UI

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState(3);

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
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

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
          { name: "Agenda", href: "/dashboard/schedule", icon: Calendar, color: "text-purple-600" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-600" },
          { name: "Trabajadores", href: "/dashboard/workers", icon: Users, color: "text-indigo-600" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-600" },
          { name: "Facturación", href: "/dashboard/billing", icon: DollarSign, color: "text-orange-600" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-600" },
          { name: "Administración", href: "/dashboard/admin", icon: Settings, color: "text-gray-600" },
        ];
      case "secretaria":
        return [
          ...commonItems,
          { name: "Programación", href: "/dashboard/schedule", icon: Calendar, color: "text-purple-600" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-600" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-600" },
          { name: "Facturación", href: "/dashboard/billing", icon: DollarSign, color: "text-orange-600" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-600" },
        ];
      case "operador":
        return [
          ...commonItems,
          { name: "Mis Trabajos", href: "/dashboard/my-jobs", icon: Wrench, color: "text-blue-600" },
          { name: "Evidencias", href: "/dashboard/evidences", icon: Wrench, color: "text-red-600" },
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
        return "Técnico";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">Améstica</h1>
              <p className="text-xs text-blue-100">Servicios Técnicos</p>
            </div>
          </Link>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {getNavigationItems().map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`mr-3 h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Company Selector */}
        {userRole === "admin" && (
          <div className="absolute bottom-4 left-3 right-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Améstica</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar clientes, trabajos..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
                />
                {searchResults.length > 0 && (
                  <div className="absolute mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={`${item.tipo}-${item.id}`}
                        onClick={() => handleSearchResultClick(item)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {item.nombre || item.titulo}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* User Role Badge */}
              <Badge className={getRoleColor(userRole)} variant="outline">
                {getRoleLabel(userRole)}
              </Badge>

              {/* User Menu */}
              <Suspense fallback={<div>Loading...</div>}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt={session.user.name || ""} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {session.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex flex-col gap-1 p-3">
                      <p className="font-medium text-sm">{session.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Configuración</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Suspense>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 flex-1 overflow-y-auto">
          {children || (
            <div className="text-center text-gray-500 mt-10">
              Selecciona una opción del menú para comenzar
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
