"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCallback, useEffect, useState } from "react"

import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Fuel,
  GraduationCap,
  Home,
  Megaphone,
  Plus,
  Shield,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  X,
  Zap
} from 'lucide-react'

interface CashTransactionFormProps {
  type: 'income' | 'expense'
  onSubmit: (data: any) => void
  onCancel: () => void
}

interface FormData {
  amount: string
  description: string
  category: string
  paymentMethod: string
  reference: string
  date: string
  notes?: string
  attachments?: string[]
}

interface ValidationErrors {
  amount?: string
  description?: string
  category?: string
  paymentMethod?: string
  date?: string
}

interface TouchedFields {
  amount: boolean
  description: boolean
  category: boolean
  paymentMethod: boolean
  date: boolean
}

export default function CashTransactionForm({
  type,
  onSubmit,
  onCancel
}: CashTransactionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    category: '',
    paymentMethod: '',
    reference: '',
    date: new Date().toISOString().split('T')[0] || '',
    notes: '',
    attachments: []
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({
    amount: false,
    description: false,
    category: false,
    paymentMethod: false,
    date: false
  })
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)

  // Categorías con iconos y colores
  const incomeCategories = [
    { value: 'servicios_plomeria', label: 'Servicios de Plomería', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
    { value: 'deteccion_fugas', label: 'Detección de Fugas', icon: Zap, color: 'bg-purple-100 text-purple-800' },
    { value: 'reparaciones', label: 'Reparaciones', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
    { value: 'mantencion', label: 'Mantención', icon: Building, color: 'bg-green-100 text-green-800' },
    { value: 'instalaciones', label: 'Instalaciones', icon: Home, color: 'bg-indigo-100 text-indigo-800' },
    { value: 'emergencias', label: 'Emergencias', icon: Zap, color: 'bg-red-100 text-red-800' },
    { value: 'consultoria', label: 'Consultoría', icon: Users, color: 'bg-teal-100 text-teal-800' },
    { value: 'otros_ingresos', label: 'Otros Ingresos', icon: Plus, color: 'bg-gray-100 text-gray-800' }
  ]

  const expenseCategories = [
    { value: 'materiales', label: 'Materiales', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
    { value: 'herramientas', label: 'Herramientas', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
    { value: 'combustible', label: 'Combustible', icon: Fuel, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'salarios', label: 'Salarios', icon: Users, color: 'bg-green-100 text-green-800' },
    { value: 'servicios_basicos', label: 'Servicios Básicos', icon: Zap, color: 'bg-purple-100 text-purple-800' },
    { value: 'arriendo', label: 'Arriendo', icon: Home, color: 'bg-indigo-100 text-indigo-800' },
    { value: 'seguros', label: 'Seguros', icon: Shield, color: 'bg-red-100 text-red-800' },
    { value: 'marketing', label: 'Marketing', icon: Megaphone, color: 'bg-pink-100 text-pink-800' },
    { value: 'capacitacion', label: 'Capacitación', icon: GraduationCap, color: 'bg-cyan-100 text-cyan-800' },
    { value: 'otros_gastos', label: 'Otros Gastos', icon: Plus, color: 'bg-gray-100 text-gray-800' }
  ]

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: Wallet },
    { value: 'transferencia', label: 'Transferencia', icon: CreditCard },
    { value: 'cheque', label: 'Cheque', icon: FileText },
    { value: 'tarjeta_debito', label: 'Tarjeta de Débito', icon: CreditCard },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito', icon: CreditCard },
    { value: 'otros', label: 'Otros', icon: Plus }
  ]

  const categories = type === 'income' ? incomeCategories : expenseCategories

  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {}

    const numericAmount = parseFloat(formData.amount.replace(/[^\d]/g, ''))
    if (!formData.amount || numericAmount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Selecciona un método de pago'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }

    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [formData])

  useEffect(() => {
    validateForm()
  }, [formData, validateForm])

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'amount') {
      // Para el campo de monto, permitir solo números y formatear
      const numericValue = value.replace(/[^\d]/g, '')
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleFieldBlur = (field: keyof TouchedFields) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const shouldShowError = (field: keyof ValidationErrors) => {
    return touched[field] && errors[field]
  }

  // Función para formatear monto en CLP
  const formatAmount = (value: string) => {
    if (!value) return ''
    const numericValue = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(numericValue)) return ''
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como tocados al intentar enviar
    setTouched({
      amount: true,
      description: true,
      category: true,
      paymentMethod: true,
      date: true
    })

    if (!isValid) return

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount.replace(/[^\d]/g, ''))
      })
    } catch (error) {
      
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value) || 0
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(numValue)
  }

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <Card className="border-0 shadow-soft">
          <CardHeader className="bg-gradient-to-r from-[#002D71] to-[#1e40af] text-white rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  {type === 'income' ? (
                    <TrendingUp className="h-7 w-7" />
                  ) : (
                    <TrendingDown className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    Registrar {type === 'income' ? 'Ingreso' : 'Gasto'}
                  </CardTitle>
                  <p className="text-blue-100 text-sm mt-1">
                    Completa los detalles del movimiento financiero
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección Principal - Monto y Categoría */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monto */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Monto *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="0"
                      value={formData.amount ? formatAmount(formData.amount) : ''}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      onBlur={() => handleFieldBlur('amount')}
                      className={`h-12 pl-10 text-lg font-semibold border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('amount')
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : ''
                        }`}
                    />
                  </div>
                  {shouldShowError('amount') && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    Categoría *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      handleInputChange('category', value)
                      handleFieldBlur('category')
                    }}
                  >
                    <SelectTrigger className={`h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('category')
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : ''
                      }`}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {categories.map((category) => {
                        const IconComponent = category.icon
                        return (
                          <SelectItem key={category.value} value={category.value} className="py-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4" />
                              <span className="font-medium">{category.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {shouldShowError('category') && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Método de Pago y Fecha */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Método de Pago */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    Método de Pago *
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => {
                      handleInputChange('paymentMethod', value)
                      handleFieldBlur('paymentMethod')
                    }}
                  >
                    <SelectTrigger className={`h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('paymentMethod')
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : ''
                      }`}>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon
                        return (
                          <SelectItem key={method.value} value={method.value} className="py-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4" />
                              <span className="font-medium">{method.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {shouldShowError('paymentMethod') && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Fecha *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    onBlur={() => handleFieldBlur('date')}
                    className={`h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('date')
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : ''
                      }`}
                  />
                  {shouldShowError('date') && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Descripción *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe detalladamente el motivo del movimiento..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onBlur={() => handleFieldBlur('description')}
                  rows={4}
                  className={`border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 resize-none ${shouldShowError('description')
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : ''
                    }`}
                />
                {shouldShowError('description') && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Referencia y Notas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referencia */}
                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    Referencia
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Número de factura, boleta, etc."
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    className="h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500">Opcional: Número de documento relacionado</p>
                </div>

                {/* Notas adicionales */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" />
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional relevante..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 resize-none"
                  />
                  <p className="text-xs text-gray-500">Opcional: Comentarios adicionales</p>
                </div>
              </div>

              {/* Resumen de la transacción */}
              {formData.amount && formData.category && (
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Resumen de la Transacción
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-600">Monto:</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(formData.amount)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-600">Categoría:</span>
                        <div className="flex items-center">
                          {(() => {
                            const category = categories.find(cat => cat.value === formData.category)
                            const IconComponent = category?.icon || Plus
                            return (
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <Badge variant="secondary" className={`${category?.color} text-xs font-medium px-2 py-1`}>
                                  {category?.label}
                                </Badge>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-600">Método:</span>
                        <div className="flex items-center">
                          {(() => {
                            const method = paymentMethods.find(m => m.value === formData.paymentMethod)
                            const IconComponent = method?.icon || CreditCard
                            return (
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-gray-600" />
                                <span className="font-medium text-gray-900 text-sm">{method?.label}</span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator className="my-6" />

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12 text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 h-12 transition-colors font-medium ${type === 'income'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    } ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading || !isValid}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {`Registrar ${type === 'income' ? 'Ingreso' : 'Gasto'}`}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
