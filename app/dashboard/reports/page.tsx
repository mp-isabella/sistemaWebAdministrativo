"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart3,
  Building2,
  // Clock,
  // Eye,
  // Settings,
  Database,
  DollarSign,
  Download,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  // PieChart,
  TrendingUp,
  // Calendar as CalendarIcon,
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

interface Company {
  id: string;
  name: string;
  displayName?: string;
  type?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface ReportStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCompany: Record<string, number>;
}

export default function ReportsDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Tipos de reportes disponibles
  const reportTypes = [
    {
      id: "FINANCIAL",
      title: "Reporte Financiero",
      description: "Análisis completo de ingresos, gastos y rentabilidad",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "OPERATIONAL",
      title: "Reporte Operacional",
      description: "Métricas de servicios, técnicos y eficiencia",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "PERFORMANCE",
      title: "Reporte de Rendimiento",
      description: "Análisis de productividad y tiempos de respuesta",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: "QUALITY",
      title: "Reporte de Calidad",
      description: "Satisfacción del cliente y métricas de calidad",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCompany !== 'all') params.append('companyId', filterCompany);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterYear !== 'all') params.append('year', filterYear);

      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Error al cargar reportes');

      const data = await response.json();
      setReports(data.reports || []);
      setStats(data.stats || null);
    } catch (error) {

      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCompany, filterStatus, filterYear, toast]);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Error al cargar empresas');

      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {

    }
  }, []);

  // Cargar datos
  useEffect(() => {
    fetchReports();
    fetchCompanies();
  }, [fetchReports, fetchCompanies]);

  const generateReport = async (type: string, companyId: string) => {
    try {
      setGenerating(type);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Crear el reporte
      const createResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${reportTypes.find(t => t.id === type)?.title} - ${format(now, 'MMMM yyyy', { locale: es })}`,
          type,
          period: 'MONTHLY',
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          companyId
        })
      });

      if (!createResponse.ok) throw new Error('Error al crear reporte');

      const report = await createResponse.json();

      // Generar datos del reporte
      const generateResponse = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          type,
          companyId,
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        })
      });

      if (!generateResponse.ok) throw new Error('Error al generar datos del reporte');

      toast({
        title: "Éxito",
        description: "Reporte generado exitosamente"
      });

      fetchReports();
    } catch (error) {

      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = async (reportId: string, title: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (!response.ok) throw new Error('Error al descargar reporte');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Éxito",
        description: "Reporte descargado exitosamente"
      });

      fetchReports();
    } catch (error) {

      toast({
        title: "Error",
        description: "No se pudo descargar el reporte",
        variant: "destructive"
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <span>Cargando reportes...</span>
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
            Genera y gestiona reportes detallados por empresa con análisis financiero, operacional y de rendimiento.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/reports/generate')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      {/* Estadísticas Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byStatus.COMPLETED || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byCompany).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byStatus.GENERATING || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tipos de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Reportes Disponibles</CardTitle>
          <CardDescription>
            Selecciona el tipo de reporte que necesitas generar para cada empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <Card key={type.id} className={`${type.bgColor} ${type.borderColor} border-2 hover:shadow-md transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <type.icon className={`h-8 w-8 ${type.color}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {companies.map((company) => (
                      <Button
                        key={company.id}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => generateReport(type.id, company.id)}
                        disabled={generating === type.id}
                      >
                        {generating === type.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {company.displayName || company.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reportes Generados</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReports}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros básicos - Hidden on tablet and mobile */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {reportTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.displayName || company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros avanzados */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="GENERATING">Generando</SelectItem>
                  <SelectItem value="FAILED">Fallido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Lista de reportes */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
                <p className="text-gray-500">Genera tu primer reporte para comenzar</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: report.company.primaryColor || '#2563eb' }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{report.company.displayName || report.company.name}</span>
                              <span>•</span>
                              <span>{format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                              <span>•</span>
                              <span>{report.year}{report.month ? `/${report.month.toString().padStart(2, '0')}` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          <div>{report.downloadCount} descargas</div>
                          {report.fileSize && (
                            <div>{formatFileSize(report.fileSize)}</div>
                          )}
                        </div>
                        {report.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            onClick={() => downloadReport(report.id, report.title)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
