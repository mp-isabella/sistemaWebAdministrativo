'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { RoleRedirect } from '@/components/auth/role-redirect'
import InvoiceForm from '@/components/forms/invoice-form'

export default function NewInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Éxito",
          description: "Factura creada correctamente",
        })
        router.push(`/dashboard/billing/${result.id}`)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Error al crear la factura",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast({
        title: "Error",
        description: "Error al crear la factura",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/billing')
  }

  return (
    <RoleRedirect allowedRoles={["admin"]}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
          <p className="text-gray-600">Crea una nueva factura con el estilo de la empresa seleccionada</p>
        </div>
        
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </RoleRedirect>
  )
}
