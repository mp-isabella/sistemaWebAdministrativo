// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Providers } from './providers'

// Fuente Montserrat
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// Configuración del viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  userScalable: true,
};

// Metadata del sitio
export const metadata: Metadata = {
  title: {
    default: "Amestica | Especialistas en Detección de Fugas",
    template: "%s | Amestica",
  },
  description:
    "Empresa especializada en detección de fugas de agua en Coihueco y Chillán. Tecnología avanzada y equipo profesional.",
  generator: "MP Riquelme | mpriquelme.dev",
  keywords: [
    "detección de fugas",
    "Amestica",
    "Coihueco",
    "tecnología agua",
    "empresa Chillán",
  ],
  authors: [{ name: "MP Riquelme", url: "https://mpriquelme.dev" }],
  metadataBase: new URL("https://amestica.cl"),
  openGraph: {
    title: "Amestica | Especialistas en Detección de Fugas",
    description: "Soluciones profesionales en detección de fugas de agua.",
    type: "website",
    locale: "es_CL",
    url: "https://amestica.cl",
    siteName: "Amestica",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
