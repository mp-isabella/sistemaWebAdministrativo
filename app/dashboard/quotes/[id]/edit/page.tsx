'use client'

import QuoteFormEnhanced from '@/components/forms/quote-form-enhanced'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  materials?: string
  exposedArea?: string
}

interface Quote {
  id: string
  quoteNumber: string
  date: string
  validUntil: string
  subtotal: number
  tax: number
  total: number
  taxRate: number
  discount: number
  notes?: string
  status: string
  technician?: string
  diagnosis?: string
  serviceType?: string
  warranty?: string
  clientName: string
  clientAddress?: string
  clientPhone?: string
  clientRegion?: string
  clientCommune?: string
  companyId: string
  items: QuoteItem[]
}

export default function EditQuotePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch(`/api/quotes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar el presupuesto",
          variant: "destructive"
        })
        router.push('/dashboard/quotes')
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al cargar el presupuesto",
        variant: "destructive"
      })
      router.push('/dashboard/quotes')
    } finally {
      setLoading(false)
    }
  }, [params.id, toast, router])

  useEffect(() => {
    if (session && params.id) {
      fetchQuote()
    }
  }, [session, params.id, fetchQuote])

  const handleSubmit = async (formData: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/quotes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: params.id
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Presupuesto actualizado correctamente",
        })
        router.push(`/dashboard/quotes/${params.id}`)
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar el presupuesto",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al actualizar el presupuesto",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/quotes/${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <p className="text-gray-500">Presupuesto no encontrado</p>
          <button
            onClick={() => router.push('/dashboard/quotes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a Presupuestos
          </button>
        </div>
      </div>
    )
  }

  // Preparar datos iniciales para el formulario
  const initialData = {
    clientId: quote.clientName, // El campo clientId en el formulario contiene el nombre del cliente
    clientName: quote.clientName, // También incluir clientName para compatibilidad
    clientAddress: quote.clientAddress,
    clientPhone: quote.clientPhone,
    clientRegion: quote.clientRegion,
    clientCommune: quote.clientCommune,
    companyId: quote.companyId,
    validUntil: quote.validUntil,
    taxRate: quote.taxRate,
    discount: quote.discount,
    notes: quote.notes,
    technician: quote.technician,
    diagnosis: quote.diagnosis,
    serviceType: quote.serviceType,
    warranty: quote.warranty,
    items: quote.items
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Presupuesto</h1>
        <p className="text-gray-600">Modifica los detalles del presupuesto {quote.quoteNumber}</p>
      </div>

      <QuoteFormEnhanced
        initialData={{
          ...initialData,
          clientAddress: initialData.clientAddress || '',
          clientPhone: initialData.clientPhone || '',
          clientRegion: initialData.clientRegion || '',
          clientCommune: initialData.clientCommune || '',
          companyId: initialData.companyId || '',
          validUntil: initialData.validUntil || '',
          taxRate: initialData.taxRate || 0,
          discount: initialData.discount || 0,
          notes: initialData.notes || '',
          warranty: initialData.warranty || '',
          technician: initialData.technician ?? '',
          diagnosis: initialData.diagnosis ?? '',
          serviceType: initialData.serviceType ?? ''
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
      />
    </div>
  )
}
