'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import QuoteFormEnhanced from '@/components/forms/quote-form-enhanced'

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  materials?: string
  exposedArea?: string
}

export default function NewQuotePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: {
    clientName: string
    clientId: string
    companyId: string
    validUntil: string
    taxRate: number
    notes: string
    items: QuoteItem[]
    technician: string
    diagnosis: string
    serviceType: string
    clientAddress?: string
    clientEmail?: string
    clientPhone?: string
    clientRegion?: string
    clientCommune?: string
  }) => {
    console.log('handleSubmit called with data:', data)
    setLoading(true)

    try {
      console.log('Making API request to /api/quotes')
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('API response status:', response.status)
      console.log('API response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('API response data:', result)
        toast({
          title: "Éxito",
          description: "Presupuesto creado exitosamente",
        })
        router.push('/dashboard/quotes')
      } else {
        const error = await response.json()
        console.error('API error:', error)
        toast({
          title: "Error",
          description: error.error || "Error al crear el presupuesto",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      toast({
        title: "Error",
        description: "Error al crear el presupuesto",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Presupuesto</h1>
          <p className="text-gray-600">Crear un presupuesto detallado de servicios</p>
        </div>
      </div>

      <QuoteFormEnhanced
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}

