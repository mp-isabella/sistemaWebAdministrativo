"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Importamos los iconos

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Inicio", href: "#inicio" },
    { name: "Quienes Somos", href: "#nosotros" },
    { name: "Servicios", href: "#servicios" },
    { name: "Fotos de Trabajos", href: "#galeria" },
    { name: "Contacto", href: "#contacto" },
    { name: "Testimonios", href: "#testimonios" },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white shadow-md w-full transition-all duration-300"
      >
        <div className="flex items-center justify-between py-1 px-4 md:px-8 lg:px-16 w-full max-w-full">
          {/* Logo con responsive sizing */}
          <div className="flex items-center">
            <Image
  src="/logo.png"
  alt="Logo Améstica"
  width={240} // Puedes dejarlo o eliminar si usas solo Tailwind para tamaño
  height={80}
  className="object-contain w-40 md:w-56 lg:w-64" // más grande en todos los tamaños
  priority
/>
          </div>

          {/* Navegación para desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm md:text-base lg:text-lg text-gray-700 hover:text-blue-700 font-medium relative group transition-colors duration-200"
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Botón para desktop y mobile */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/login")}
              className="text-lg md:text-xl bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 md:px-8 md:py-6 rounded-full transition-colors duration-200"
            >
              Acceso
            </Button>
            {/* Menú hamburguesa para mobile */}
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 bg-transparent text-gray-700 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Menú de navegación móvil */}
      <aside 
        className={`fixed top-0 left-0 w-full h-full bg-white z-40 p-8 transition-transform duration-300 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <nav className="flex flex-col items-center space-y-8 mt-24">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-xl text-gray-700 hover:text-blue-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}