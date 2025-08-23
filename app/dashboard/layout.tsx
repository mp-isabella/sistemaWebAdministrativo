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
  Building2,
  Menu,
  X,
  Search,
  LogOut,
  Bell,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [notifications, setNotifications] = useState(3);

  const isCalendar = pathname === "/dashboard/schedule/calendar";

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
      { name: "Calendario", href: "/dashboard/schedule/calendar", icon: Calendar, color: "text-yellow-500" },
    ];
    switch (userRole) {
      case "admin":
        return [
          ...commonItems,
          { name: "Agenda", href: "/dashboard/schedule", icon: Calendar, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Trabajadores", href: "/dashboard/workers", icon: Users, color: "text-indigo-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Facturación", href: "/dashboard/billing", icon: DollarSign, color: "text-orange-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
          { name: "Administración", href: "/dashboard/admin", icon: Settings, color: "text-gray-300" },
        ];
      case "secretaria":
        return [
          ...commonItems,
          { name: "Programación", href: "/dashboard/schedule", icon: Calendar, color: "text-purple-500" },
          { name: "Clientes", href: "/dashboard/clients", icon: Users, color: "text-green-500" },
          { name: "Cajas", href: "/dashboard/cash", icon: CreditCard, color: "text-purple-500" },
          { name: "Facturación", href: "/dashboard/billing", icon: DollarSign, color: "text-orange-500" },
          { name: "Reportes", href: "/dashboard/reports", icon: FileText, color: "text-red-500" },
        ];
      case "tecnico":
        return [
          ...commonItems,
          { name: "Mis Trabajos", href: "/dashboard/my-jobs", icon: Wrench, color: "text-blue-500" },
          { name: "Evidencias", href: "/dashboard/evidences", icon: Wrench, color: "text-red-500" },
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-sidebar w-55 bg-[#002D71] shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 dashboard-sidebar ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-900">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
              <Droplets className="h-5 w-5 text-[#002D71]" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">Améstica</h1>
              <p className="text-xs text-blue-200">Servicios Técnicos</p>
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
              className="group flex items-center px-3 py-3 text-sm font-medium rounded-lg hover:bg-blue-800 transition-all duration-150 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${item.color} group-hover:opacity-80 transition-opacity`}
              />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Améstica Ltda */}
        {userRole === "admin" && (
          <div className="absolute bottom-4 left-3 right-3">
            <div className="bg-transparent rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Améstica Ltda</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-[#002D71] shadow-sm border-b border-blue-900 sticky top-0 z-header text-white">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>

              {/* Buscador */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Buscar clientes, trabajos..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10 w-80 bg-white/10 text-white placeholder-white/70 border border-transparent focus:border-transparent focus:ring-0 focus:bg-white/10 focus:text-white placeholder:text-white/80"
                />
                {searchResults.length > 0 && (
                  <div className="absolute mt-1 w-80 bg-white text-black border border-gray-200 rounded-lg shadow-lg z-dropdown max-h-60 overflow-y-auto">
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
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-white" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              <Badge className={getRoleColor(userRole)} variant="outline">
                {getRoleLabel(userRole)}
              </Badge>

              <Suspense fallback={<div>Loading...</div>}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={session?.user?.image || "/avatar-demo.png"}
                          alt={session?.user?.name || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-white text-[#002D71]">
                          {session?.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 header-dropdown" align="end">
                    <div className="flex flex-col gap-1 p-3 text-black">
                      <p className="font-medium text-sm">{session?.user?.name || "Usuario Demo"}</p>
                      <p className="truncate text-xs text-muted-foreground">{session?.user?.email || "usuario@demo.com"}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center text-black">
                        <User className="mr-2 h-4 w-4" /> Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center text-black">
                        <Settings className="mr-2 h-4 w-4" /> Configuración
                      </Link>
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

        <main className={`flex-1 overflow-y-auto ${isCalendar ? "" : "p-6"}`}>
          {children || (
            <div className="text-center text-white/80 mt-10">
              Selecciona una opción del menú para comenzar
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
