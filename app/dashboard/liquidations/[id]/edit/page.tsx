'use client';

import LiquidationForm from '@/components/forms/liquidation-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditLiquidationPage() {
  const [liquidation, setLiquidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { data: _session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const liquidationId = params.id as string;

  useEffect(() => {
    const fetchLiquidation = async () => {
      try {
        const response = await fetch(`/api/liquidations/${liquidationId}`);
        if (response.ok) {
          const data = await response.json();
          setLiquidation(data);
        } else {
          toast({
            title: "Error",
            description: "Error al cargar la liquidación",
            variant: "destructive"
          });
          router.push('/dashboard/liquidations');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error de conexión",
          variant: "destructive"
        });
        router.push('/dashboard/liquidations');
      } finally {
        setLoading(false);
      }
    };

    if (liquidationId) {
      fetchLiquidation();
    }
  }, [liquidationId, router, toast]);

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/liquidations/${liquidationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Liquidación actualizada correctamente",
        });
        router.push('/dashboard/liquidations');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la liquidación');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la liquidación",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/liquidations');
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando liquidación...</p>
        </div>
      </div>
    );
  }

  if (!liquidation) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Liquidación no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/liquidations')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Liquidación</h1>
          <p className="text-gray-600">Modificar liquidación de {liquidation.technician?.name}</p>
        </div>
      </div>

      <LiquidationForm
        liquidation={liquidation}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </div>
  );
}