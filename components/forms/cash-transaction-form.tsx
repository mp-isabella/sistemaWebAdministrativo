"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalSelect } from "@/components/ui/modal-select"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

import {
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Fuel,
  GraduationCap,
  Home,
  Megaphone,
  Shield,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  X
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
}

interface ValidationErrors {
  amount?: string
  description?: string
  category?: string
  paymentMethod?: string
  date?: string
  reference?: string
  notes?: string
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
  // Listener para cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleCloseModal = () => {
      onCancel();
    };

    window.addEventListener('closeModal', handleCloseModal);
    return () => {
      window.removeEventListener('closeModal', handleCloseModal);
    };
  }, [onCancel]);

  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    category: '',
    paymentMethod: '',
    reference: '',
    date: new Date().toISOString().split('T')[0] || '',
    notes: ''
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

  const categories = [
    { value: 'materials', label: 'Materiales', icon: Wrench },
    { value: 'tools', label: 'Herramientas', icon: Wrench },
    { value: 'fuel', label: 'Combustible', icon: Fuel },
    { value: 'salaries', label: 'Salarios', icon: Users },
    { value: 'utilities', label: 'Servicios Básicos', icon: Home },
    { value: 'marketing', label: 'Marketing', icon: Megaphone },
    { value: 'insurance', label: 'Seguros', icon: Shield },
    { value: 'education', label: 'Capacitación', icon: GraduationCap },
    { value: 'other', label: 'Otros', icon: FileText }
  ]

  const paymentMethods = [
    { value: 'cash', label: 'Efectivo', icon: DollarSign },
    { value: 'transfer', label: 'Transferencia', icon: CreditCard },
    { value: 'check', label: 'Cheque', icon: FileText },
    { value: 'card', label: 'Tarjeta', icon: CreditCard }
  ]

  const validateField = (field: keyof FormData, value: string | undefined): string => {
    switch (field) {
      case 'amount':
        if (!value || value.trim() === '') return 'El monto es requerido'
        const numValue = parseFloat(value.replace(/[^\d]/g, ''))
        if (isNaN(numValue) || numValue <= 0) return 'El monto debe ser mayor a 0'
        return ''
      case 'description':
        if (!value || value.trim() === '') return 'La descripción es requerida'
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres'
        return ''
      case 'category':
        if (!value || value.trim() === '') return 'La categoría es requerida'
        return ''
      case 'paymentMethod':
        if (!value || value.trim() === '') return 'El método de pago es requerido'
        return ''
      case 'date':
        if (!value || value.trim() === '') return 'La fecha es requerida'
        return ''
      default:
        return ''
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (touched[field as keyof TouchedFields]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleFieldBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const shouldShowError = (field: keyof FormData) => {
    return touched[field as keyof TouchedFields] && !!errors[field]
  }

  const isValid = Object.values(errors).every(error => !error) &&
    formData.amount &&
    formData.description &&
    formData.category &&
    formData.paymentMethod &&
    formData.date

  const formatCurrencyInput = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(numericValue)) return ''

    return new Intl.NumberFormat('es-CL', {
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

    if (!isValid) {
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount.replace(/[^\d]/g, ''))
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error in form submission:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header con botón de cerrar */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#002D71] to-[#1e40af] text-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          {type === 'income' ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
          <h2 className="text-xl font-semibold">
            Registrar {type === 'income' ? 'Ingreso' : 'Gasto'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-white/20"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto p-6">
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
                  value={formData.amount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value)
                    handleInputChange('amount', formatted)
                  }}
                  onBlur={() => handleFieldBlur('amount')}
                  placeholder="0"
                  className={`pl-8 h-12 text-lg font-semibold border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('amount')
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
              <ModalSelect
                value={formData.category}
                onValueChange={(value) => {
                  handleInputChange('category', value)
                  handleFieldBlur('category')
                }}
                placeholder="Seleccionar categoría"
                options={categories.map(category => ({
                  value: category.value,
                  label: category.label
                }))}
                className={`h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('category')
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : ''
                  }`}
                emptyMessage="No se encontraron categorías."
              />
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
              <ModalSelect
                value={formData.paymentMethod}
                onValueChange={(value) => {
                  handleInputChange('paymentMethod', value)
                  handleFieldBlur('paymentMethod')
                }}
                placeholder="Seleccionar método"
                options={paymentMethods.map(method => ({
                  value: method.value,
                  label: method.label
                }))}
                className={`h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 ${shouldShowError('paymentMethod')
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : ''
                  }`}
                emptyMessage="No se encontraron métodos de pago."
              />
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
                <Calendar className="h-4 w-4 text-orange-600" />
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
              <FileText className="h-4 w-4 text-indigo-600" />
              Descripción *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description')}
              placeholder="Describe detalladamente el motivo del movimiento..."
              className={`min-h-[100px] border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 resize-none ${shouldShowError('description')
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

          {/* Referencia */}
          <div className="space-y-2">
            <Label htmlFor="reference" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              Referencia
            </Label>
            <Input
              id="reference"
              type="text"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="Número de factura, boleta, etc."
              className="h-12 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200"
            />
            <p className="text-xs text-gray-500">Opcional: Número de documento relacionado</p>
          </div>

          {/* Notas Adicionales */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              Notas Adicionales
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Información adicional relevante..."
              className="min-h-[80px] border-gray-200 focus:border-[#002D71] focus:ring-[#002D71] transition-all duration-200 resize-none"
            />
            <p className="text-xs text-gray-500">Opcional: Comentarios adicionales</p>
          </div>
        </form>
      </div>

      {/* Footer con botones */}
      <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !isValid}
          className="px-6 py-2 bg-[#002D71] hover:bg-[#001a4d] text-white"
          onClick={handleSubmit}
        >
          {loading ? "Guardando..." : "Registrar"}
        </Button>
      </div>
    </div>
  )
}