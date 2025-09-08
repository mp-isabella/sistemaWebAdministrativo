import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard de Administración | Améstica Servicios Técnicos',
  description: 'Gestiona usuarios, configuraciones del sistema y monitorea el historial de actividades CRUD.',
  keywords: 'administración, usuarios, configuración, sistema, seguridad, historial, Améstica',
  openGraph: {
    title: 'Dashboard de Administración | Améstica Servicios Técnicos',
    description: 'Gestiona usuarios, configuraciones del sistema y monitorea el historial de actividades CRUD.',
    type: 'website',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
