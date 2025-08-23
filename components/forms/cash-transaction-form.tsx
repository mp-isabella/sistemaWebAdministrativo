"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface CashTransactionFormProps {
  type: 'income' | 'expense'
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function CashTransactionForm({ type, onSubmit, onCancel }: CashTransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    paymentMethod: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [loading, setLoading] = useState(false)

  const incomeCategories = [
    'Servicios de plomería',
    'Detección de fugas',
    'Reparaciones',
    'Mantención',
    'Instalaciones',
    'Emergencias',
    'Consultoría',
    'Otros ingresos'
  ]

  const expenseCategories = [
    'Materiales',
    'Herramientas',
    'Combustible',
    'Salarios',
    'Servicios básicos',
    'Arriendo',
    'Seguros',
    'Publicidad',
    'Capacitación',
    'Otros gastos'
  ]

  const paymentMethods = [
    'Efectivo',
    'Transferencia bancaria',
    'Tarjeta de débito',
    'Tarjeta de crédito',
    'Cheque',
    'Otro'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        type
      })
    } catch (error) {
      console.error('Error submitting transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            {type === 'income' ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Registrar Ingreso</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span>Registrar Gasto</span>
              </>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {(type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe el motivo del movimiento..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                placeholder="Número de factura, boleta, etc."
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  type === 'income' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Guardando...' : `Registrar ${type === 'income' ? 'Ingreso' : 'Gasto'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
