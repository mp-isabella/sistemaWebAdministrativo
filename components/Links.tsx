"use client";

// import Link from "next/link";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useRouter } from "next/navigation";

interface LinksProps {
  variant: 'header' | 'mobile' | 'footer';
  onLinkClick?: () => void;
}

// Navigation items configuration
const navigationItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export default function Links({ variant, onLinkClick }: LinksProps) {
  const router = useRouter();
  const { scrollToSection } = useSmoothScroll();

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href);
    } else {
      router.push(href);
    }

    // Call the optional callback (useful for closing mobile menu)
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // Header variant - horizontal navigation
  if (variant === 'header') {
    return (
      <nav className="flex items-center space-x-8">
        {navigationItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleLinkClick(item.href)}
            className="text-gray-700 hover:text-blue-700 font-semibold text-base transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1"
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  // Mobile variant - vertical navigation
  if (variant === 'mobile') {
    return (
      <nav className="flex flex-col space-y-6 w-full">
        {navigationItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleLinkClick(item.href)}
            className="text-gray-700 hover:text-blue-700 font-semibold text-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-4 py-2 text-center"
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  // Footer variant - vertical navigation
  if (variant === 'footer') {
    return (
      <nav className="flex flex-col space-y-3">
        {navigationItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleLinkClick(item.href)}
            className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-base font-semibold text-left"
          >
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-[#F46015]"></span>
          </button>
        ))}
      </nav>
    );
  }

  return null;
}
