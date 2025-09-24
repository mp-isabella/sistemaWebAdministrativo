"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Appointment } from "@/types/calendar"
import {
  CheckCircle,
  Clock,
  DollarSign,
  X,
} from "lucide-react"

interface JobDetailsModalProps {
  job: Appointment | null
  onClose: () => void
  onJobUpdate?: (updatedJob: Appointment) => void
}

export function JobDetailsModal({ job, onClose, onJobUpdate }: JobDetailsModalProps) {
  const { toast } = useToast()
  const { data: _session } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)
  const [_localJob, _setLocalJob] = useState<Appointment | null>(job)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  // Función para traducir métodos de pago a español
  const translatePaymentMethod = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'cash': 'Efectivo',
      'CASH': 'Efectivo',
      'transfer': 'Transferencia',
      'TRANSFER': 'Transferencia',
      'card': 'Tarjeta',
      'CARD': 'Tarjeta',
      'check': 'Cheque',
      'CHECK': 'Cheque',
      'deposit': 'Depósito',
      'DEPOSIT': 'Depósito'
    }
    return methodMap[method] || 'Efectivo'
  }

  // Sincronizar el estado local cuando cambie el prop job
  useEffect(() => {
    
    _setLocalJob(job)

    // Cargar información de pago cuando se actualiza el job
    if (job?.id) {
      loadPaymentInfo(job.id)
    }
  }, [job])

  // Función para cargar información de pago
  const loadPaymentInfo = async (jobId: string) => {
    setIsLoadingPayment(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/payment`)
      if (response.ok) {
        const data = await response.json()
        if (data.hasPayment && data.payment) {
          setPaymentInfo({
            isPaid: data.payment.status === 'PAID',
            paidAmount: data.payment.status === 'PAID' ? data.payment.amount : 0,
            paymentMethod: data.payment.method?.toLowerCase() || 'efectivo',
            budget: data.payment.amount || 0,
            status: data.payment.status,
            method: data.payment.method,
            amount: data.payment.amount
          })
        } else {
          setPaymentInfo({
            isPaid: false,
            paidAmount: 0,
            paymentMethod: 'efectivo',
            budget: 0,
            status: 'PENDING',
            method: 'CASH',
            amount: 0
          })
        }
      }
    } catch (error) {
      
    } finally {
      setIsLoadingPayment(false)
    }
  }

  // Función para marcar como pagado
  const handleMarkAsPaid = async () => {
    if (!job?.id) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPaid: true,
          paymentMethod: 'CASH',
          amount: job.totalBudget || 0
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "✅ Pago Registrado",
          description: result.message || "El trabajo ha sido marcado como pagado.",
        })

        // Actualizar el estado local
        setPaymentInfo((prev: any) => ({
          ...prev,
          isPaid: true,
          paidAmount: job.totalBudget || 0,
          status: 'PAID'
        }))

        // Notificar al componente padre
        if (onJobUpdate && job) {
          onJobUpdate({
            ...job,
            paymentStatus: 'PAID'
          })
        }

        // Disparar evento personalizado para sincronizar con la agenda
        window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
          detail: {
            jobId: job.id,
            isPaid: true,
            amount: job.totalBudget || 0
          }
        }));
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al marcar como pagado')
      }
    } catch (error) {
      
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al marcar como pagado",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!job) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="pr-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Detalles del Trabajo
            </h2>
            <p className="text-gray-600 text-sm">
              {job.type}
            </p>
          </div>
        </div>

        {/* Content - Sin Cotización */}
        <div className="p-6 space-y-4">
          {/* Información General */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Información General</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-sm">{job.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                Completado
              </Badge>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-sm font-medium">Cliente</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-sm">{job.patientName}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-sm">{job.client?.phone || "+56 9 3333 3333"}</span>
              <div className="flex gap-1 ml-2">
                <a
                  href={`https://wa.me/${(job.client?.phone || "+56933333333").replace(/\D/g, '')}?text=Hola ${job.client?.name || 'cliente'}, soy de ${job.company?.name || 'la empresa'} y te contacto sobre el trabajo de ${job.type || 'servicio'}. ¿Podemos confirmar la cita?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-6 w-6 p-0 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors group relative"
                  title="Abrir WhatsApp"
                >
                  <span className="text-xs">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Horario</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
              >
                <span className="text-xs">Editar</span>
              </Button>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {job.startTimeDisplay || job.startTime} - {job.endTimeDisplay || job.endTime}
              </span>
            </div>
          </div>

          {/* Trabajador Asignado */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-sm font-medium">Trabajador Asignado</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
              >
                <span className="text-xs">Cambiar</span>
              </Button>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-sm">
                {job.technician?.name || "Sin técnico asignado"}
              </span>
            </div>
          </div>

          {/* Estado del Trabajo */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-sm font-medium">Estado del Trabajo</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                Completado
              </Badge>
            </div>
          </div>

          {/* Información de Pago */}
          {paymentInfo && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Información de Pago</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estado de pago:</span>
                  <Badge className={
                    paymentInfo.isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }>
                    {paymentInfo.isPaid ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Presupuesto:</span>
                    <span className="font-medium">${(job?.totalBudget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pagado:</span>
                    <span className="font-medium text-green-600">${paymentInfo.paidAmount?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                {paymentInfo.isPaid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Método:</span>
                    <span className="text-sm">{translatePaymentMethod(paymentInfo.paymentMethod || 'cash')}</span>
                  </div>
                )}

                {!paymentInfo.isPaid && (
                  <div className="pt-2">
                    <Button
                      onClick={handleMarkAsPaid}
                      disabled={isUpdating || isLoadingPayment}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar Pagado
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cerrar
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                onClose()
                setTimeout(() => {
                  window.location.href = `/dashboard/schedule?edit=${job.id}`
                }, 100)
              }}
            >
              Editar
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
