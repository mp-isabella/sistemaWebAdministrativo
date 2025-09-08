
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { scrollToSection } = useSmoothScroll();

  const navigationItems = [
    { name: "Inicio", href: "#hero" },
    { name: "Quienes Somos", href: "#about" },
    { name: "Servicios", href: "#services" },
    { name: "Galería", href: "#gallery" },
    { name: "Testimonios", href: "#testimonials" },
    { name: "Contacto", href: "#contacto" },
  ];

  const socialMediaLinks = [
  { icon: <FaFacebookF />, url: 'https://www.facebook.com/share/1AwoWrjqxf/' },
  { icon: <FaInstagram />, url: 'https://www.instagram.com/amestica.ltda?igsh=OW15dHN4OW52cnJo' },
  { icon: <FaYoutube />, url: 'https://youtube.com/@amestica_ltda?si=NLRlH1aa4swqSoUQ' },
  { icon: <FaTiktok />, url: 'https://www.tiktok.com/@amesticaltda?is_from_webapp=1&sender_device=pc' },
];

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Optimización: Detectar scroll con throttling
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;
    
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  const handleNavigationClick = useCallback((href: string) => {
    if (!isMounted || typeof window === 'undefined' || typeof document === 'undefined') return;
    
    console.log('handleNavigationClick called with:', href);
    
    // Usar el hook de smooth scroll para consistencia
    if (href.startsWith('#')) {
      scrollToSection(href);
    } else {
      router.push(href);
    }
    
    // Cerrar el menú móvil si está abierto
    setIsMenuOpen(false);
  }, [isMounted, router, scrollToSection]);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-md'
      }`}>
        <div className="flex items-center justify-between py-2 px-3 md:px-6 lg:px-12">
          
          {/* Logo optimizado para móvil */}
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo Améstica"
              width={240}
              height={80}
              className="object-contain w-32 md:w-56 lg:w-64"
              priority
              loading="eager"
            />
          </div>

          {/* Desktop navigation optimizada */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`🖱️ Click en ${item.name} con href: ${item.href}`);
                  
                  if (item.href === '#hero') {
                    console.log('🚀 INICIO - Scroll al tope');
                    
                    // Scroll directo y confiable al tope
                    if (typeof window !== 'undefined') {
                      window.scrollTo(0, 0);
                    }
                    if (typeof document !== 'undefined') {
                      document.documentElement.scrollTop = 0;
                      document.body.scrollTop = 0;
                    }
                    console.log('🚀 Scroll ejecutado');
                  } else {
                    handleNavigationClick(item.href);
                  }
                }}
                className="text-sm md:text-base lg:text-lg text-gray-700 hover:text-blue-700 font-medium relative group transition-colors duration-200 focus:outline-none rounded cursor-pointer"
                aria-label={`Navegar a ${item.name}`}
                onMouseDown={(e) => e.preventDefault()}
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Redes sociales optimizadas */}
          <div className="hidden md:flex space-x-4">
            {socialMediaLinks.map(({ icon, url }, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl md:text-3xl lg:text-4xl w-10 h-10 flex items-center justify-center text-gray-700 hover:text-blue-700 transition-colors focus:outline-none rounded"
                aria-label={`Link to ${url}`}
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Botón de menú hamburguesa optimizado para móvil */}
          <button
            className="md:hidden text-gray-700 focus:outline-none rounded p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Menú móvil optimizado */}
      <aside
        className={`fixed top-0 left-0 w-full h-full bg-white z-[40] p-6 md:p-8 transition-transform duration-300 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
        aria-hidden={!isMenuOpen}
      >
        {/* Botón cerrar dentro del menú */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Cerrar menú"
            className="text-gray-700 focus:outline-none rounded p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Enlaces optimizados para móvil */}
        <nav className="flex flex-col items-center space-y-6 mt-12" role="navigation">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`📱 Click móvil en ${item.name} con href: ${item.href}`);
                
                if (item.href === '#hero') {
                  console.log('🚀 INICIO móvil - Scroll al tope');
                  
                  // Scroll directo y confiable al tope
                  window.scrollTo(0, 0);
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                  console.log('🚀 Scroll móvil ejecutado');
                } else {
                  handleNavigationClick(item.href);
                }
                
                setIsMenuOpen(false);
              }}
              className="text-lg md:text-xl text-gray-700 font-medium focus:outline-none rounded px-4 py-3 cursor-pointer w-full text-center"
              aria-label={`Navegar a ${item.name}`}
              onMouseDown={(e) => e.preventDefault()}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Redes sociales en menú móvil optimizadas */}
        <div className="flex justify-center space-x-6 mt-10">
          {socialMediaLinks.map(({ icon, url }, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl w-10 h-10 flex items-center justify-center text-gray-700 hover:text-blue-700 transition-colors focus:outline-none rounded"
              aria-label={`Link to ${url}`}
            >
              {icon}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
