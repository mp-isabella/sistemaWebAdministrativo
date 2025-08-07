import type { Metadata } from 'next';
import './globals.css';
import ClientProvider from './ClientProvider';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });


export const metadata: Metadata = {
  title: {
    default: 'Amestica | Especialistas en Detección de Fugas',
    template: '%s | Amestica',
  },
  description: 'Empresa especializada en detección de fugas de agua en Coihueco y Chillán. Tecnología avanzada y equipo profesional.',
  generator: 'MP Riquelme | mpriquelme.dev',
  keywords: ['detección de fugas', 'Amestica', 'Coihueco', 'tecnología agua', 'empresa Chillán'],
  authors: [{ name: 'MP Riquelme', url: 'https://mpriquelme.dev' }],
  metadataBase: new URL('https://tudominio.com'), // cámbialo cuando esté deployado
  openGraph: {
    title: 'Amestica | Especialistas en Detección de Fugas',
    description: 'Soluciones profesionales en detección de fugas de agua.',
    type: 'website',
    locale: 'es_CL',
    url: 'https://tudominio.com',
    siteName: 'Amestica',
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
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${montserrat.variable} bg-background text-foreground antialiased`}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}

