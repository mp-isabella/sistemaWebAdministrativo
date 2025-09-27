import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Améstica Servicios Técnicos',
    short_name: 'Améstica',
    description: 'Empresa líder en servicios técnicos en Chile. Especialistas en mantenimiento, reparación e instalación de sistemas HVAC, eléctricos y de seguridad.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#002D71',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'es-CL',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    // screenshots: [
    //   {
    //     src: '/screenshot-wide.png',
    //     sizes: '1280x720',
    //     type: 'image/png',
    //   },
    //   {
    //     src: '/screenshot-narrow.png',
    //     sizes: '750x1334',
    //     type: 'image/png',
    //   },
    // ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Acceso rápido al dashboard principal',
        url: '/dashboard',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'Nuevo Servicio',
        short_name: 'Nuevo',
        description: 'Crear un nuevo servicio técnico',
        url: '/dashboard/services/new',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'Contacto',
        short_name: 'Contacto',
        description: 'Información de contacto',
        url: '/contacto',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
          },
        ],
      },
    ],
    related_applications: [
      {
        platform: 'webapp',
        url: 'https://amestica.cl',
      },
    ],
    prefer_related_applications: false,

  };
}
