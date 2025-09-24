'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Building, Calendar, Download, Edit, Filter, Mail, MoreVertical, Phone, Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// Interface para liquidaciones
interface Liquidation {
  id: string;
  liquidationNumber: string;
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  totalAdvances: number;
  netSalary: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  technician: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  company: {
    id: string;
    name: string;
  };
}

// Componente principal de liquidaciones
function LiquidationsPage() {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [liquidationToDelete, setLiquidationToDelete] = useState<Liquidation | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Cargar liquidaciones desde la API
  useEffect(() => {
    const fetchLiquidations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/liquidations');
        if (response.ok) {
          const data = await response.json();
          setLiquidations(data);
        } else {
          toast({
            title: "Error",
            description: "Error al cargar liquidaciones",
            variant: "destructive"
          });
        }
      } catch (error) {

        toast({
          title: "Error",
          description: "Error de conexión",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiquidations();
  }, [toast]);

  // Filtrar liquidaciones por término de búsqueda
  const filteredLiquidations = useMemo(() => {
    if (!searchTerm) return liquidations;

    return liquidations.filter(liquidation =>
      liquidation.technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liquidation.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liquidation.liquidationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [liquidations, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Funciones para las acciones del menú
  const handleEdit = (liquidationId: string) => {

    try {
      // Verificar que el router esté disponible
      if (!router) {

        toast({
          title: "Error",
          description: "Error de navegación",
          variant: "destructive"
        });
        return;
      }

      // Intentar navegación
      router.push(`/dashboard/liquidations/${liquidationId}/edit`);

    } catch (error) {

      toast({
        title: "Error",
        description: "Error al navegar a la página de edición",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async (liquidationId: string) => {
    try {
      toast({
        title: "Descargando...",
        description: "Generando PDF, por favor espera",
      });

      const response = await fetch(`/api/liquidations/${liquidationId}/export-pdf`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `liquidacion-${liquidationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Éxito",
          description: "PDF descargado correctamente",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descargar PDF');
      }
    } catch (error) {

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al descargar el PDF",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (liquidation: Liquidation) => {
    setLiquidationToDelete(liquidation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!liquidationToDelete) return;

    try {
      toast({
        title: "Eliminando...",
        description: "Eliminando liquidación, por favor espera",
      });

      const response = await fetch(`/api/liquidations/${liquidationToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLiquidations(prev => prev.filter(l => l.id !== liquidationToDelete.id));
        toast({
          title: "Éxito",
          description: "Liquidación eliminada correctamente",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar liquidación');
      }
    } catch (error) {

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la liquidación",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setLiquidationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLiquidationToDelete(null);
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando liquidaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-blue-600" />
            Liquidaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las liquidaciones de salarios para trabajadores
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/dashboard/liquidations/new'}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Liquidación
        </Button>
      </div>

      {/* Búsqueda y filtros - Hidden on tablet and mobile */}
      <div className="flex gap-4 hidden lg:flex">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar liquidaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Lista de liquidaciones */}
      <div className="space-y-4">
        {filteredLiquidations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron liquidaciones' : 'No hay liquidaciones'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Crea tu primera liquidación para comenzar'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => window.location.href = '/dashboard/liquidations/new'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Liquidación
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredLiquidations.map((liquidation) => (
            <Card key={liquidation.id} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {liquidation.technician.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {liquidation.technician.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {liquidation.technician.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {liquidation.company.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Período: {formatDate(liquidation.periodStart)} - {formatDate(liquidation.periodEnd)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total a Pagar</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(liquidation.finalAmount || liquidation.netSalary || 0)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={(e) => {

                            e.preventDefault();
                            e.stopPropagation();

                            // Pequeño delay para asegurar que el click se procese
                            setTimeout(() => {
                              handleEdit(liquidation.id);
                            }, 100);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(liquidation.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(liquidation)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de que deseas eliminar la liquidación de{' '}
              <span className="font-semibold text-gray-900">
                {liquidationToDelete?.technician.name}
              </span>?
              <br /><br />
              Esta acción <span className="font-semibold text-red-600">no se puede deshacer</span> y
              eliminará permanentemente todos los datos asociados a esta liquidación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Liquidación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function LiquidationsPageWrapper() {
  return (
    <RoleGuard requiredPermission="canAccessLiquidations">
      <LiquidationsPage />
    </RoleGuard>
  );
}