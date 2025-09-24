// app/layout.tsx
import CustomSessionProvider from "@/components/auth/session-provider";
import { ChangeProtectionProvider } from "@/components/providers/change-protection-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./components-no-text-cursor.css";
import "./floating-buttons.css";
import "./globals.css";
import "./no-text-cursor.css";
import "./utilities-no-text-cursor.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Améstica Ltda. - Detección de Fugas de Agua",
  description: "Empresa especializada en detección de fugas, destapes de alcantarillado y videoinspección de tuberías. Servicios profesionales en Santiago y Ñuble.",
  keywords: "detección de fugas, destapes, videoinspección, tuberías, Santiago, Ñuble",
  authors: [{ name: "Améstica Ltda." }],
  creator: "Améstica Ltda.",
  publisher: "Améstica Ltda.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Améstica Ltda. - Detección de Fugas de Agua",
    description: "Especialistas en detección de fugas, destapes y videoinspección de tuberías",
    url: "/",
    siteName: "Améstica Ltda.",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Améstica Ltda. - Detección de Fugas de Agua",
    description: "Especialistas en detección de fugas, destapes y videoinspección de tuberías",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Maps for faster loading */}
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <CustomSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ChangeProtectionProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
            </ChangeProtectionProvider>
          </ThemeProvider>
        </CustomSessionProvider>
      </body>
    </html>
  );
}
