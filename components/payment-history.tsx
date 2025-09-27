"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, DollarSign, Calendar, CreditCard, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Payment {
  id: string
  amount: number
  paymentDate: string
  method?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface PaymentHistoryProps {
  jobId: string
  totalBudget: number
  onPaymentAdded?: () => void
  onPaymentUpdated?: () => void
  onPaymentDeleted?: () => void
}

export default function PaymentHistory({
  jobId,
  totalBudget,
  onPaymentAdded,
  onPaymentUpdated,
  onPaymentDeleted
}: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    method: "",
    notes: ""
  })

  const paymentMethods = [
    "Efectivo",
    "Transferencia bancaria",
    "Tarjeta de crédito",
    "Tarjeta de débito",
    "Cheque",
    "Otro"
  ]

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${jobId}/payments`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }, [jobId])

  // Cargar historial de pagos
  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const calculateTotals = () => {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const remaining = totalBudget - totalPaid
    const percentage = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0

    return {
      totalPaid,
      remaining,
      percentage: Math.round(percentage)
    }
  }

  const handleAddPayment = async () => {
    setIsSubmitting(true)
    setErrors({})

    // Validación
    const newErrors: Record<string, string> = {}
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0"
    }
    if (!paymentForm.paymentDate) {
      newErrors.paymentDate = "La fecha es requerida"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm)
      })

      if (response.ok) {
        setPaymentForm({
          amount: "",
          paymentDate: format(new Date(), "yyyy-MM-dd"),
          method: "",
          notes: ""
        })
        setShowAddPayment(false)
        await loadPayments()
        onPaymentAdded?.()
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || "Error al agregar el pago" })
      }
    } catch (error) {
      setErrors({ submit: "Error al agregar el pago" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePayment = async () => {
    if (!editingPayment) return

    setIsSubmitting(true)
    setErrors({})

    // Validación
    const newErrors: Record<string, string> = {}
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0"
    }
    if (!paymentForm.paymentDate) {
      newErrors.paymentDate = "La fecha es requerida"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/payments/${editingPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm)
      })

      if (response.ok) {
        setEditingPayment(null)
        setPaymentForm({
          amount: "",
          paymentDate: format(new Date(), "yyyy-MM-dd"),
          method: "",
          notes: ""
        })
        await loadPayments()
        onPaymentUpdated?.()
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || "Error al actualizar el pago" })
      }
    } catch (error) {
      setErrors({ submit: "Error al actualizar el pago" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pago?")) return

    try {
      const response = await fetch(`/api/jobs/${jobId}/payments/${paymentId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadPayments()
        onPaymentDeleted?.()
      }
    } catch (error) {

    }
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setPaymentForm({
      amount: payment.amount.toString(),
      paymentDate: format(new Date(payment.paymentDate), "yyyy-MM-dd"),
      method: payment.method || "",
      notes: payment.notes || ""
    })
    setShowAddPayment(true)
  }

  const resetForm = () => {
    setPaymentForm({
      amount: "",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      method: "",
      notes: ""
    })
    setEditingPayment(null)
    setShowAddPayment(false)
    setErrors({})
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Resumen de pagos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Historial de Pagos</h3>
              <p className="text-slate-600">Gestiona los pagos del trabajo</p>
            </div>
          </div>
          <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPayment ? "Editar Pago" : "Agregar Nuevo Pago"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                    Monto del Pago (CLP)
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Ingresa el monto del pago"
                      min="0"
                      step="100"
                      className={cn(
                        "pl-12 pr-4 h-12 text-base border-2 rounded-xl transition-all duration-200 font-medium",
                        "focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm",
                        errors.amount && "border-red-500 focus:border-red-500 focus:ring-red-100"
                      )}
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentDate" className="text-sm font-semibold text-slate-700">
                    Fecha del Pago
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className={cn(
                      "h-12 text-base border-2 rounded-xl transition-all duration-200 font-medium",
                      "focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm",
                      errors.paymentDate && "border-red-500 focus:border-red-500 focus:ring-red-100"
                    )}
                  />
                  {errors.paymentDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.paymentDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="method" className="text-sm font-semibold text-slate-700">
                    Método de Pago
                  </Label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger className="h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 shadow-sm font-medium">
                      <SelectValue placeholder="Selecciona el método de pago" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border shadow-2xl max-h-64 bg-white">
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method} className="py-3">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-slate-800">{method}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales sobre el pago..."
                    className="min-h-[80px] text-base border-2 rounded-xl p-4 transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 resize-none shadow-sm font-medium"
                  />
                </div>

                {errors.submit && (
                  <Alert variant="destructive" className="py-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 h-12 text-base font-semibold border-2 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={editingPayment ? handleUpdatePayment : handleAddPayment}
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingPayment ? "Actualizando..." : "Agregando..."}
                      </div>
                    ) : (
                      editingPayment ? "Actualizar Pago" : "Agregar Pago"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumen financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Presupuesto Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">${totalBudget.toLocaleString('es-CL')} CLP</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Total Pagado</span>
            </div>
            <p className="text-2xl font-bold text-green-900">${totals.totalPaid.toLocaleString('es-CL')} CLP</p>
          </div>

          <div className={cn(
            "rounded-xl p-4 border",
            totals.remaining > 0
              ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
              : "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className={cn(
                "h-5 w-5",
                totals.remaining > 0 ? "text-orange-600" : "text-emerald-600"
              )} />
              <span className={cn(
                "text-sm font-semibold",
                totals.remaining > 0 ? "text-orange-800" : "text-emerald-800"
              )}>
                {totals.remaining > 0 ? "Pendiente" : "Completado"}
              </span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              totals.remaining > 0 ? "text-orange-900" : "text-emerald-900"
            )}>
              ${Math.abs(totals.remaining).toLocaleString('es-CL')} CLP
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Progreso de Pago</span>
            <span className="text-sm font-bold text-slate-800">{totals.percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                totals.percentage === 100
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              )}
              style={{ width: `${Math.min(totals.percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
        <h4 className="text-lg font-bold text-slate-800 mb-4">Historial de Pagos</h4>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-slate-600">Cargando pagos...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No hay pagos registrados</p>
            <p className="text-sm text-slate-400 mt-1">Agrega el primer pago para comenzar el historial</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">${payment.amount.toLocaleString('es-CL')} CLP</p>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })}</span>
                      </div>
                      {payment.method && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          <span>{payment.method}</span>
                        </div>
                      )}
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-slate-500 mt-1 italic">&quot;{payment.notes}&quot;</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPayment(payment)}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 border-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePayment(payment.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
