"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  // TrendingUp,
  Eye,
  FileText,
  Filter,
  Loader2,
  // XCircle,
  Plus,
  Search,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Quote {
  id: string;
  quoteNumber: string;
  client: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  company: {
    id: string;
    name: string;
    type: string;
  };
  date: string;
  validUntil: string;
  status: string;
  total: number;
  createdAt?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    type: string;
    status: string;
    scheduledAt: string;
    startTime: string;
    endTime: string;
    technician?: {
      id: string;
      name: string;
    };
  };
}

export default function QuotesDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estadísticas calculadas
  const stats = [
    {
      title: "Total Cotizaciones",
      value: quotes.length.toString(),
      change: "+0%",
      trend: "neutral",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Aprobadas",
      value: quotes.filter(q => q.status === 'APPROVED').length.toString(),
      change: "+0%",
      trend: "neutral",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pendientes",
      value: quotes.filter(q => q.status === 'PENDING').length.toString(),
      change: "+0%",
      trend: "neutral",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Valor Total",
      value: `$${(quotes.reduce((sum, q) => sum + q.total, 0) / 1000000).toFixed(1)}M`,
      change: "+0%",
      trend: "neutral",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes');

      if (!response.ok) {
        throw new Error('Error al cargar cotizaciones');
      }

      const data = await response.json();
      setQuotes(data);
    } catch (error) {

      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cargar cotizaciones
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Filtrar cotizaciones
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = (quote.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Agrupar cotizaciones por mes y año (más recientes primero)
  const groupedQuotes = useMemo(() => {
    const groups: Record<string, Quote[]> = {};

    filteredQuotes.forEach(quote => {
      // Usar fecha de creación si la fecha de la cotización es inválida
      const dateToUse = quote.date || quote.createdAt || new Date().toISOString();
      const date = new Date(dateToUse);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {

        // Usar fecha actual como fallback
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const monthKey = `${year}-${month}`;

        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(quote);
        return;
      }

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthKey = `${year}-${month}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(quote);
    });

    // Ordenar los grupos por fecha descendente (más recientes primero)
    const sortedGroups: Record<string, Quote[]> = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      return b.localeCompare(a);
    });

    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key] || [];
    });

    return sortedGroups;
  }, [filteredQuotes]);

  // Función para obtener el nombre del mes en español
  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year || '0'), parseInt(month || '1') - 1);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';

    // Intentar parsear la fecha
    let date = new Date(dateString);

    // Si la fecha es inválida, intentar con diferentes formatos
    if (isNaN(date.getTime())) {
      // Intentar con formato ISO
      date = new Date(dateString + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        // Intentar parsear como timestamp
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
    }

    // Si aún es inválida, mostrar mensaje
    if (isNaN(date.getTime())) {

      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cotizaciones</h1>
          <p className="text-gray-600 mt-2">
            Crea, gestiona y da seguimiento a cotizaciones de servicios técnicos de manera profesional.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/quotes/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, número o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="DRAFT">Borrador</option>
                <option value="PENDING">Pendiente</option>
                <option value="APPROVED">Aprobada</option>
                <option value="REJECTED">Rechazada</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones Recientes</CardTitle>
          <CardDescription>
            Lista de todas las cotizaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'No se encontraron cotizaciones con los filtros aplicados'
                  : 'Comienza creando tu primera cotización'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => router.push('/dashboard/quotes/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Cotización
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedQuotes).map(([monthKey, quotesInMonth]) => (
                <div key={monthKey} className="space-y-4">
                  {/* Encabezado del mes */}
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getMonthName(monthKey)}
                      </h3>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {quotesInMonth.length} cotización{quotesInMonth.length !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  {/* Lista de cotizaciones del mes */}
                  <div className="space-y-4">
                    {quotesInMonth.map((quote) => (
                      <div
                        key={quote.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{quote.quoteNumber}</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{quote.client?.name || 'Cliente no asignado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{quote.company?.name || 'Empresa no asignada'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(quote.date)}</span>
                            </div>
                          </div>

                          {/* Información del trabajo asignado */}
                          {quote.job && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Asignada a Trabajo
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700">
                                <div>
                                  <strong>Trabajo:</strong> {quote.job.title || quote.job.type}
                                </div>
                                <div>
                                  <strong>Estado:</strong> {quote.job.status}
                                </div>
                                {quote.job.technician && (
                                  <div>
                                    <strong>Técnico:</strong> {quote.job.technician.name}
                                  </div>
                                )}
                                <div>
                                  <strong>Programado:</strong> {formatDate(quote.job.scheduledAt)} {quote.job.startTime} - {quote.job.endTime}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Válida hasta {formatDate(quote.validUntil)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                              title="Ver detalles de la cotización"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
