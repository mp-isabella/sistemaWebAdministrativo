'use client'

import { RoleRedirect } from '@/components/auth/role-redirect'
import LiquidationForm from '@/components/forms/liquidation-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewLiquidationPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {

      setLoading(true)

      const response = await fetch('/api/liquidations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await response.json()

        toast({
          title: "Éxito",
          description: "Liquidación creada correctamente"
        })

        router.push('/dashboard/liquidations')
      } else {
        const error = await response.json()

        toast({
          title: "Error",
          description: error.error || "Error al crear liquidación",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/liquidations')
  }

  if (!session) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleRedirect allowedRoles={["admin", "administrador"]}>
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
            <h1 className="text-3xl font-bold text-gray-900">Nueva Liquidación</h1>
            <p className="text-gray-600">Crear una nueva liquidación para un técnico</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Liquidación</CardTitle>
          </CardHeader>
          <CardContent>
            <LiquidationForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </RoleRedirect>
  )
}
