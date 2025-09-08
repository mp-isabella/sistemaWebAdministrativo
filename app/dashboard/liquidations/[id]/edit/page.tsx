'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { RoleRedirect } from '@/components/auth/role-redirect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import LiquidationForm from '@/components/forms/liquidation-form'

export default function EditLiquidationPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [liquidation, setLiquidation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchLiquidation()
    }
  }, [params.id])

  const fetchLiquidation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/liquidations/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setLiquidation(data)
      } else {
        toast({
          title: "Error",
          description: "Liquidación no encontrada",
          variant: "destructive"
        })
        router.push('/dashboard/liquidations')
      }
    } catch (error) {
      console.error('Error fetching liquidation:', error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/liquidations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Éxito",
          description: "Liquidación actualizada correctamente"
        })
        router.push(`/dashboard/liquidations/${result.id}`)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al actualizar liquidación",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating liquidation:', error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/liquidations/${params.id}`)
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Cargando liquidación...</p>
        </div>
      </div>
    )
  }

  if (!liquidation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Liquidación no encontrada</p>
          <Button onClick={() => router.push('/dashboard/liquidations')} className="mt-4">
            Volver a Liquidaciones
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RoleRedirect allowedRoles={["admin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/liquidations/${params.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Liquidación</h1>
            <p className="text-gray-600">Modificar liquidación {liquidation.liquidationNumber}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Liquidación</CardTitle>
          </CardHeader>
          <CardContent>
            <LiquidationForm
              liquidation={liquidation}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
            />
          </CardContent>
        </Card>
      </div>
    </RoleRedirect>
  )
}
