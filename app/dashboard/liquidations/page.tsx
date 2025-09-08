"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Eye,
  FileText,
  Calculator,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Liquidation {
  id: string;
  liquidationNumber: string;
  technician: {
    id: string;
    name: string;
    email: string;
  };
  company: {
    id: string;
    name: string;
  };
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  totalHours: number;
  totalServices: number;
  bonuses: number;
  deductions: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  notes?: string;
}

export default function LiquidationsDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estadísticas calculadas
  const stats = [
    {
      title: "Total Liquidaciones",
      value: liquidations.length.toString(),
      change: "+0%",
      trend: "neutral",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Aprobadas",
      value: liquidations.filter(l => l.status === 'APPROVED').length.toString(),
      change: "+0%",
      trend: "neutral",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pendientes",
      value: liquidations.filter(l => l.status === 'PENDING').length.toString(),
      change: "+0%",
      trend: "neutral",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Valor Total",
      value: `$${(liquidations.reduce((sum, l) => sum + l.finalAmount, 0) / 1000000).toFixed(1)}M`,
      change: "+0%",
      trend: "neutral",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // Cargar liquidaciones
  useEffect(() => {
    fetchLiquidations();
  }, []);

  const fetchLiquidations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/liquidations');
      
      if (!response.ok) {
        throw new Error('Error al cargar liquidaciones');
      }
      
      const data = await response.json();
      setLiquidations(data);
    } catch (error) {
      console.error('Error fetching liquidations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las liquidaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar liquidaciones
  const filteredLiquidations = liquidations.filter(liquidation => {
    const matchesSearch = liquidation.technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liquidation.liquidationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liquidation.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || liquidation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Borrador</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando liquidaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Liquidaciones</h1>
          <p className="text-gray-600 mt-2">
            Administra y controla las liquidaciones de servicios técnicos y pagos a técnicos.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/liquidations/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Liquidación
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por técnico, número o empresa..."
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

      {/* Liquidations List */}
      <Card>
        <CardHeader>
          <CardTitle>Liquidaciones Recientes</CardTitle>
          <CardDescription>
            Lista de todas las liquidaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLiquidations.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay liquidaciones</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No se encontraron liquidaciones con los filtros aplicados'
                  : 'Comienza creando tu primera liquidación'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => router.push('/dashboard/liquidations/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Liquidación
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLiquidations.map((liquidation) => (
                <div
                  key={liquidation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{liquidation.liquidationNumber}</h3>
                      {getStatusBadge(liquidation.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{liquidation.technician.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{liquidation.company.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatPeriod(liquidation.periodStart, liquidation.periodEnd)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        <span>{liquidation.totalHours}h / {liquidation.totalServices} servicios</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(liquidation.finalAmount)}</p>
                      <p className="text-sm text-gray-500">
                        Base: {formatCurrency(liquidation.baseSalary)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/liquidations/${liquidation.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/api/liquidations/${liquidation.id}/export-pdf`)}
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
    </div>
  );
}
