"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { 
  X, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  CreditCard,
  Wallet,
  Building,
  Wrench,
  Fuel,
  Users,
  Zap,
  Home,
  Shield,
  Megaphone,
  GraduationCap,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag
} from 'lucide-react'

interface CashTransactionFormProps {
  type: 'income' | 'expense'
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: any
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
  onCancel, 
  initialData 
}: CashTransactionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    category: '',
    paymentMethod: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
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

  useEffect(() => {
    validateForm()
  }, [formData])

  const validateForm = () => {
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
  }

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

  // Función para parsear monto de CLP a número
  const parseAmount = (value: string) => {
    if (!value) return ''
    const numericValue = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(numericValue)) return ''
    return numericValue.toString()
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
      console.error('Error submitting form:', error)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {type === 'income' ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">
                  Registrar {type === 'income' ? 'Ingreso' : 'Gasto'}
                </CardTitle>
                <p className="text-blue-100 text-sm">
                  Completa los detalles del movimiento financiero
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Monto
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  $
                </span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0"
                  value={formData.amount ? formatAmount(formData.amount) : ''}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  onBlur={() => handleFieldBlur('amount')}
                  className={`h-12 pl-8 text-lg font-semibold ${
                    shouldShowError('amount') ? 'border-red-500 focus:border-red-500' : ''
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
              <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                Categoría
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => {
                  handleInputChange('category', value)
                  handleFieldBlur('category')
                }}
              >
                <SelectTrigger className={`h-12 ${shouldShowError('category') ? 'border-red-500 focus:border-red-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{category.label}</span>
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

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                Método de Pago
              </Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => {
                  handleInputChange('paymentMethod', value)
                  handleFieldBlur('paymentMethod')
                }}
              >
                <SelectTrigger className={`h-12 ${shouldShowError('paymentMethod') ? 'border-red-500 focus:border-red-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{method.label}</span>
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

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describe detalladamente el motivo del movimiento..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => handleFieldBlur('description')}
                rows={3}
                className={shouldShowError('description') ? 'border-red-500 focus:border-red-500' : ''}
              />
              {shouldShowError('description') && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Fecha y Referencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  onBlur={() => handleFieldBlur('date')}
                  className={`h-12 ${shouldShowError('date') ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {shouldShowError('date') && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Referencia
                </Label>
                <Input
                  id="reference"
                  placeholder="Número de factura, boleta, etc."
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Notas adicionales */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                placeholder="Información adicional relevante..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
              />
            </div>

            {/* Resumen de la transacción */}
            {formData.amount && formData.category && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resumen de la Transacción
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(formData.amount)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Categoría:</span>
                    <div className="flex items-center">
                      {(() => {
                        const category = categories.find(cat => cat.value === formData.category)
                        const IconComponent = category?.icon || Plus
                        return (
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <Badge variant="secondary" className={category?.color}>
                              {category?.label}
                            </Badge>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Botones de acción */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 h-12 shadow-lg transition-all duration-200 hover:scale-105 ${
                  type === 'income' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
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
  )
}
