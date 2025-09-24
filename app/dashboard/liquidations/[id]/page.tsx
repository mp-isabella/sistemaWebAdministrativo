'use client'

import { RoleRedirect } from '@/components/auth/role-redirect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Calculator, Download, Edit, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface LiquidationItem {
  id: string
  description: string
  type: string
  quantity?: number
  unitPrice?: number
  total: number
  notes?: string
}

interface LiquidationAdvance {
  id: string
  date: string
  amount: number
  description: string
  notes?: string
}

interface Liquidation {
  id: string
  liquidationNumber: string
  date: string
  periodStart: string
  periodEnd: string
  baseSalary: number
  totalEarnings: number
  totalDeductions: number
  netSalary: number
  taxRate: number
  notes?: string
  status: string
  technician: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  company: {
    id: string
    name: string
    type: string
    logo: string
    primaryColor: string
    secondaryColor: string
    address: string
    phone: string
    email: string
    taxId: string
  }
  items: LiquidationItem[]
  advances: LiquidationAdvance[]
  createdBy: {
    name: string
    email: string
  }
}

export default function LiquidationDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [liquidation, setLiquidation] = useState<Liquidation | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  const fetchLiquidation = useCallback(async () => {
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

      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [params.id, toast, router])

  useEffect(() => {
    if (params.id) {
      fetchLiquidation()
    }
  }, [params.id, fetchLiquidation])

  const downloadPDF = async () => {
    try {
      setDownloading(true)
      const response = await fetch(`/api/liquidations/${params.id}/export-pdf`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `liquidacion-${liquidation?.liquidationNumber}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Éxito",
          description: "PDF descargado correctamente"
        })
      } else {
        toast({
          title: "Error",
          description: "Error al generar PDF",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al descargar PDF",
        variant: "destructive"
      })
    } finally {
      setDownloading(false)
    }
  }

  const deleteLiquidation = async () => {
    if (!confirm('¿Está seguro de que desea eliminar esta liquidación?')) {
      return
    }

    try {
      const response = await fetch(`/api/liquidations/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Liquidación eliminada correctamente"
        })
        router.push('/dashboard/liquidations')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al eliminar liquidación",
          variant: "destructive"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pendiente</Badge>
      case 'APPROVED':
        return <Badge variant="default">Aprobada</Badge>
      case 'PAID':
        return <Badge variant="default" className="bg-green-500">Pagada</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getItemTypeText = (type: string) => {
    switch (type) {
      case 'EARNINGS': return 'Ganancias'
      case 'DEDUCTION': return 'Deducción'
      case 'MATERIAL': return 'Materiales'
      case 'FUEL': return 'Combustible'
      case 'LOAN': return 'Préstamo'
      case 'ADVANCE': return 'Anticipo'
      default: return type
    }
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

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <p className="text-gray-500">Cargando liquidación...</p>
        </div>
      </div>
    )
  }

  if (!liquidation) {
    return (
      <div className="w-full p-6">
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
    <RoleRedirect allowedRoles={["admin", "administrador"]}>
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
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
              <h1 className="text-3xl font-bold text-gray-900">Liquidación {liquidation.liquidationNumber}</h1>
              <p className="text-gray-600">Detalles completos de la liquidación</p>
            </div>
          </div>

          <div className="flex gap-2">
            {getStatusBadge(liquidation.status)}
            <Button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/liquidations/${liquidation.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={deleteLiquidation}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Técnico y Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Técnico</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nombre:</strong> {liquidation.technician.name}</p>
                      <p><strong>Email:</strong> {liquidation.technician.email}</p>
                      <p><strong>Teléfono:</strong> {liquidation.technician.phone || 'No especificado'}</p>
                      <p><strong>Dirección:</strong> {liquidation.technician.address || 'No especificada'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Empresa</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nombre:</strong> {liquidation.company.name}</p>
                      <p><strong>Email:</strong> {liquidation.company.email || 'No especificado'}</p>
                      <p><strong>Teléfono:</strong> {liquidation.company.phone || 'No especificado'}</p>
                      <p><strong>RUT:</strong> {liquidation.company.taxId || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Período de Liquidación</p>
                    <p className="font-semibold">{formatDate(liquidation.periodStart)} - {formatDate(liquidation.periodEnd)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Creación</p>
                    <p className="font-semibold">{formatDate(liquidation.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Creado por</p>
                    <p className="font-semibold">{liquidation.createdBy.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items de Liquidación */}
            <Card>
              <CardHeader>
                <CardTitle>Items de Liquidación</CardTitle>
              </CardHeader>
              <CardContent>
                {liquidation.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay items registrados</p>
                ) : (
                  <div className="space-y-4">
                    {liquidation.items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{item.description}</h4>
                            <Badge variant="outline" className="mt-1">
                              {getItemTypeText(item.type)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(item.total)}</p>
                            {(item.quantity && item.unitPrice) && (
                              <p className="text-sm text-gray-600">
                                {item.quantity} x {formatCurrency(item.unitPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anticipos */}
            {liquidation.advances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Anticipos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {liquidation.advances.map((advance) => (
                      <div key={advance.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{advance.description}</h4>
                            <p className="text-sm text-gray-600">{formatDate(advance.date)}</p>
                            {advance.notes && (
                              <p className="text-sm text-gray-600 mt-1">{advance.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              -{formatCurrency(advance.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sueldo Base:</span>
                    <span className="font-semibold">{formatCurrency(liquidation.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Ganancias:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(liquidation.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deducciones:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(liquidation.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Anticipos:</span>
                    <span className="font-semibold text-orange-600">
                      -{formatCurrency(liquidation.advances.reduce((sum, advance) => sum + advance.amount, 0))}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>TOTAL A PAGAR:</span>
                      <span className="text-green-600">{formatCurrency(liquidation.netSalary)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            {liquidation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{liquidation.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RoleRedirect>
  )
}
