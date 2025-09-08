import { Metadata } from 'next';
import WebsiteNotifications from '@/components/dashboard/website-notifications';

export const metadata: Metadata = {
  title: 'Notificaciones del Sitio Web - Dashboard Améstica',
  description: 'Gestiona las notificaciones y solicitudes del sitio web de Améstica',
  keywords: 'notificaciones, sitio web, solicitudes, contacto, dashboard, amestica',
  openGraph: {
    title: 'Notificaciones del Sitio Web - Dashboard Améstica',
    description: 'Gestiona las notificaciones y solicitudes del sitio web de Améstica',
    type: 'website',
  },
};

export default function WebsiteNotificationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones del Sitio Web</h1>
          <p className="text-gray-600">
            Gestiona las solicitudes y notificaciones recibidas desde el sitio web público
          </p>
        </div>
      </div>

      <WebsiteNotifications />
    </div>
  );
}
