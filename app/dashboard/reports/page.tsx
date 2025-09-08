"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Filter,
  Search,
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  Eye,
  Settings,
  Database,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  period: string;
  generatedBy: string;
  size: string;
  downloads: number;
  status: string;
  createdAt: string;
  downloadUrl?: string;
}

export default function ReportsDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Tipos de reportes disponibles
  const reportTypes = [
    {
      id: "financial",
      title: "Reporte Financiero",
      description: "Análisis completo de ingresos, gastos y rentabilidad",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      lastGenerated: "2024-01-15",
      status: "disponible"
    },
    {
      id: "operational",
      title: "Reporte Operacional",
      description: "Métricas de servicios, técnicos y eficiencia",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      lastGenerated: "2024-01-14",
      status: "disponible"
    },
    {
      id: "performance",
      title: "Reporte de Rendimiento",
      description: "Análisis de productividad y tiempos de respuesta",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      lastGenerated: "2024-01-13",
      status: "procesando"
    },
    {
      id: "quality",
      title: "Reporte de Calidad",
      description: "Satisfacción del cliente y métricas de calidad",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      lastGenerated: "2024-01-12",
      status: "disponible"
    }
  ];

  // Cargar reportes
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      
      if (!response.ok) {
        throw new Error('Error al cargar reportes');
      }
      
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Procesando</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const handleGenerateReport = async (type: string) => {
    try {
      toast({
        title: "Generando Reporte",
        description: `Generando reporte de ${type}...`,
      });

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Reporte Generado",
          description: "El reporte se ha generado exitosamente",
        });
        
        // Recargar reportes
        fetchReports();
      } else {
        throw new Error('Error al generar reporte');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = async (reportId: string, reportType: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Descarga Completada",
          description: "El reporte se ha descargado exitosamente",
        });
      } else {
        throw new Error('Error al descargar reporte');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-2">
            Genera reportes detallados y análisis de rendimiento para tomar decisiones informadas.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/reports/generate')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      {/* Tipos de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Reportes Disponibles</CardTitle>
          <CardDescription>
            Selecciona el tipo de reporte que necesitas generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${type.bgColor}`}>
                      <type.icon className={`h-5 w-5 ${type.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                      <p className="text-xs text-gray-500">{type.status}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Último: {type.lastGenerated}</span>
                  </div>
                  <Button
                    onClick={() => handleGenerateReport(type.id)}
                    className="w-full"
                    size="sm"
                  >
                    Generar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reportes, tipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="financial">Financiero</option>
                <option value="operational">Operacional</option>
                <option value="performance">Rendimiento</option>
                <option value="quality">Calidad</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reportes Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>
            Últimos reportes generados y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'No se encontraron reportes con los filtros aplicados'
                  : 'Comienza generando tu primer reporte'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button onClick={() => router.push('/dashboard/reports/generate')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{report.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{report.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{report.generatedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {report.downloads} descargas
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id, report.type)}
                        disabled={report.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programación de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Programación de Reportes Automáticos</CardTitle>
          <CardDescription>
            Configuración de reportes que se generan automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Reportes de Operaciones</span>
              </div>
              <p className="text-xs text-gray-600">Diario a las 08:00</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Reportes de Rendimiento</span>
              </div>
              <p className="text-xs text-gray-600">Semanal los lunes</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Reportes Financieros</span>
              </div>
              <p className="text-xs text-gray-600">Mensual el día 1</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
