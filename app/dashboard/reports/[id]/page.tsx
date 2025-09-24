"use client"

import { ReportCharts } from '@/components/charts/report-charts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  BarChart3,
  // Building2,
  Calendar,
  Clock,
  DollarSign,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Report {
  id: string;
  title: string;
  type: string;
  period: string;
  year: number;
  month?: number;
  status: string;
  createdAt: string;
  downloadCount: number;
  fileSize?: number;
  data?: any;
  summary?: string;
  company: {
    id: string;
    name: string;
    displayName?: string;
    type?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    unit?: string;
    category?: string;
  }>;
}

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const { id } = await params;
      const response = await fetch(`/api/reports/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "Reporte no encontrado",
            variant: "destructive"
          });
          router.push('/dashboard/reports');
          return;
        }
        throw new Error('Error al cargar el reporte');
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [params, toast, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const downloadReport = async () => {
    if (!report) return;

    try {
      setDownloading(true);
      const response = await fetch(`/api/reports/${report.id}/download`);

      if (!response.ok) throw new Error('Error al descargar el reporte');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Éxito",
        description: "Reporte descargado exitosamente"
      });

      // Actualizar el reporte para reflejar el nuevo contador de descargas
      fetchReport();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'GENERATING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completado';
      case 'GENERATING': return 'Generando';
      case 'FAILED': return 'Fallido';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL': return DollarSign;
      case 'OPERATIONAL': return Users;
      case 'PERFORMANCE': return TrendingUp;
      case 'QUALITY': return BarChart3;
      default: return FileText;
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'FINANCIAL': return 'Reporte Financiero';
      case 'OPERATIONAL': return 'Reporte Operacional';
      case 'PERFORMANCE': return 'Reporte de Rendimiento';
      case 'QUALITY': return 'Reporte de Calidad';
      default: return 'Reporte';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando reporte...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reporte no encontrado</h3>
        <p className="text-gray-500 mb-4">El reporte que buscas no existe o ha sido eliminado</p>
        <Button onClick={() => router.push('/dashboard/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Reportes
        </Button>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(report.type);
  const reportData = report.data ? JSON.parse(report.data) : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: report.company.primaryColor || '#2563eb' }}
                />
                <span className="text-gray-600">{report.company.displayName || report.company.name}</span>
              </div>
              <Badge className={getStatusColor(report.status)}>
                {getStatusText(report.status)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchReport}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {report.status === 'COMPLETED' && (
            <Button
              onClick={downloadReport}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {downloading ? 'Descargando...' : 'Descargar PDF'}
            </Button>
          )}
        </div>
      </div>

      {/* Información del Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TypeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tipo</p>
                <p className="text-lg font-bold text-gray-900">{getTypeTitle(report.type)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Período</p>
                <p className="text-lg font-bold text-gray-900">
                  {report.year}{report.month ? `/${report.month.toString().padStart(2, '0')}` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Descargas</p>
                <p className="text-lg font-bold text-gray-900">{report.downloadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamaño</p>
                <p className="text-lg font-bold text-gray-900">{formatFileSize(report.fileSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Ejecutivo */}
      {report.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Ejecutivo</CardTitle>
            <CardDescription>Resumen del análisis realizado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{report.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principales */}
      {report.metrics && report.metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Principales</CardTitle>
            <CardDescription>Indicadores clave del reporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.metrics.map((metric) => (
                <div key={metric.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.category}</p>
                      <p className="text-lg font-bold text-gray-900">{metric.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: report.company.primaryColor || '#2563eb' }}>
                        {metric.value.toLocaleString()}
                      </p>
                      {metric.unit && (
                        <p className="text-sm text-gray-500">{metric.unit}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos y Análisis */}
      {reportData && report.status === 'COMPLETED' && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Análisis Visual</CardTitle>
              <CardDescription>Gráficos y visualizaciones del reporte</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportCharts
                data={reportData}
                type={report.type as any}
                company={report.company}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Detalles Generales</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID del Reporte:</span>
                  <span className="font-medium">{report.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado por:</span>
                  <span className="font-medium">{report.createdBy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de creación:</span>
                  <span className="font-medium">
                    {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium">{report.period}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Empresa</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{report.company.displayName || report.company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{report.company.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">{report.company.id}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}