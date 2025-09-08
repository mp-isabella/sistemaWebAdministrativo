'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Calculator, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import LiquidationPreview from '@/components/forms/liquidation-preview'

interface LiquidationFormProps {
  liquidation?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

interface LiquidationItem {
  id?: string
  description: string
  type: string
  quantity?: number
  unitPrice?: number
  total: number
  notes?: string
}

interface LiquidationAdvance {
  id?: string
  date: string
  amount: number
  description: string
  notes?: string
}

export default function LiquidationForm({ liquidation, onSubmit, onCancel, loading = false }: LiquidationFormProps) {
  const [technicians, setTechnicians] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    technicianId: liquidation?.technicianId || '',
    companyId: liquidation?.companyId || '',
    periodStart: liquidation?.periodStart ? new Date(liquidation.periodStart).toISOString().split('T')[0] : '',
    periodEnd: liquidation?.periodEnd ? new Date(liquidation.periodEnd).toISOString().split('T')[0] : '',
    baseSalary: liquidation?.baseSalary || 0,
    taxRate: liquidation?.taxRate || 19,
    notes: liquidation?.notes || '',
    status: liquidation?.status || 'DRAFT'
  })

  const [items, setItems] = useState<LiquidationItem[]>(
    liquidation?.items?.map((item: any) => ({
      id: item.id,
      description: item.description,
      type: item.type,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      notes: item.notes
    })) || []
  )

  const [advances, setAdvances] = useState<LiquidationAdvance[]>(
    liquidation?.advances?.map((advance: any) => ({
      id: advance.id,
      date: new Date(advance.date).toISOString().split('T')[0],
      amount: advance.amount,
      description: advance.description,
      notes: advance.notes
    })) || []
  )

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoadingData(true)
    try {
      // Cargar en paralelo para mayor velocidad
      const [techniciansRes, companiesRes] = await Promise.all([
        fetch("/api/workers"),
        fetch("/api/companies")
      ])

      const techniciansData = await techniciansRes.json()
      const companiesData = await companiesRes.json()

      // Filtrar solo técnicos activos
      const activeTechnicians = techniciansData.workers?.filter((w: any) => 
        w.isActive && (w.role?.name === 'TECNICO' || w.role?.name === 'tecnico')
      ) || []
      
      setTechnicians(activeTechnicians)
      setCompanies(companiesData || [])

      console.log('✅ Datos cargados:', {
        technicians: activeTechnicians.length,
        companies: companiesData?.length || 0
      })
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      toast({
        title: "Error",
        description: "Error al cargar datos",
        variant: "destructive"
      })
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.technicianId) {
      newErrors.technicianId = "Debe seleccionar un técnico"
    }

    if (!formData.companyId) {
      newErrors.companyId = "Debe seleccionar una empresa"
    }

    if (!formData.periodStart) {
      newErrors.periodStart = "Debe seleccionar fecha de inicio"
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = "Debe seleccionar fecha de fin"
    }

    if (formData.periodStart && formData.periodEnd && new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      newErrors.periodEnd = "La fecha de fin debe ser posterior a la fecha de inicio"
    }

    if (formData.baseSalary < 0) {
      newErrors.baseSalary = "El sueldo base no puede ser negativo"
    }

    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = "El IVA debe estar entre 0 y 100"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submissionData = {
      ...formData,
      items,
      advances
    }

    onSubmit(submissionData)
  }

  const handlePreview = () => {
    if (!validateForm()) {
      return
    }
    setShowPreview(true)
  }

  const handleConfirmSave = async () => {
    try {
      const submissionData = {
        ...formData,
        items,
        advances
      }
      await onSubmit(submissionData)
      setShowPreview(false) // Cerrar la vista previa después de confirmar
    } catch (error) {
      console.error('Error in handleConfirmSave:', error)
      // No cerrar la vista previa si hay error
    }
  }

  const addItem = () => {
    setItems([...items, {
      description: '',
      type: 'EARNINGS',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: ''
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LiquidationItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Calcular total automáticamente
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity || 0
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice || 0
      newItems[index].total = quantity * unitPrice
    }
    
    setItems(newItems)
  }

  const addAdvance = () => {
    setAdvances([...advances, {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      notes: ''
    }])
  }

  const removeAdvance = (index: number) => {
    setAdvances(advances.filter((_, i) => i !== index))
  }

  const updateAdvance = (index: number, field: keyof LiquidationAdvance, value: any) => {
    const newAdvances = [...advances]
    newAdvances[index] = { ...newAdvances[index], [field]: value }
    setAdvances(newAdvances)
  }

  const calculateTotals = () => {
    const totalEarnings = items
      .filter(item => item.type === 'EARNINGS')
      .reduce((sum, item) => sum + (item.total || 0), 0)
    
    const totalDeductions = items
      .filter(item => item.type !== 'EARNINGS')
      .reduce((sum, item) => sum + (item.total || 0), 0)
    
    const totalAdvances = advances.reduce((sum, advance) => sum + (advance.amount || 0), 0)
    
    const netSalary = (formData.baseSalary + totalEarnings - totalDeductions - totalAdvances)

    return {
      totalEarnings,
      totalDeductions,
      totalAdvances,
      netSalary
    }
  }

  const totals = calculateTotals()

  if (loadingData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technicianId">Técnico *</Label>
              <Select
                value={formData.technicianId}
                onValueChange={(value) => setFormData({ ...formData, technicianId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white" position="popper">
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.technicianId && (
                <p className="text-red-500 text-sm mt-1">{errors.technicianId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyId">Empresa *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white" position="popper">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="periodStart">Fecha de Inicio *</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              />
              {errors.periodStart && (
                <p className="text-red-500 text-sm mt-1">{errors.periodStart}</p>
              )}
            </div>

            <div>
              <Label htmlFor="periodEnd">Fecha de Fin *</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              />
              {errors.periodEnd && (
                <p className="text-red-500 text-sm mt-1">{errors.periodEnd}</p>
              )}
            </div>

            <div>
              <Label htmlFor="baseSalary">Sueldo Base *</Label>
              <Input
                id="baseSalary"
                type="text"
                value={formData.baseSalary ? new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(formData.baseSalary) : ''}
                onChange={(e) => {
                  const value = e.target.value
                  // Remover símbolos de moneda y separadores de miles
                  const cleanValue = value.replace(/[^\d]/g, '')
                  const numValue = cleanValue === '' ? 0 : parseInt(cleanValue) || 0
                  setFormData({ ...formData, baseSalary: numValue })
                }}
                placeholder="$0"
              />
              {errors.baseSalary && (
                <p className="text-red-500 text-sm mt-1">{errors.baseSalary}</p>
              )}
            </div>

            <div>
              <Label htmlFor="taxRate">IVA (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                placeholder="19"
              />
              {errors.taxRate && (
                <p className="text-red-500 text-sm mt-1">{errors.taxRate}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items de Liquidación */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items de Liquidación</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay items agregados</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <Label>Descripción</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Descripción del item"
                      />
                    </div>
                    
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) => updateItem(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white" position="popper">
                          <SelectItem value="EARNINGS">Ganancias</SelectItem>
                          <SelectItem value="DEDUCTION">Deducción</SelectItem>
                          <SelectItem value="MATERIAL">Materiales</SelectItem>
                          <SelectItem value="FUEL">Combustible</SelectItem>
                          <SelectItem value="LOAN">Préstamo</SelectItem>
                          <SelectItem value="ADVANCE">Anticipo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="1"
                      />
                    </div>
                    
                    <div>
                      <Label>Precio Unitario</Label>
                      <Input
                        type="text"
                        value={item.unitPrice ? new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(item.unitPrice) : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          // Remover símbolos de moneda y separadores de miles
                          const cleanValue = value.replace(/[^\d]/g, '')
                          const numValue = cleanValue === '' ? 0 : parseInt(cleanValue) || 0
                          updateItem(index, 'unitPrice', numValue)
                        }}
                        placeholder="$0"
                      />
                    </div>
                    
                    <div>
                      <Label>Total</Label>
                      <Input
                        type="text"
                        value={new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(item.total)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Notas</Label>
                      <Input
                        value={item.notes || ''}
                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                        placeholder="Notas adicionales..."
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anticipos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Anticipos</CardTitle>
            <Button type="button" onClick={addAdvance} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Anticipo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {advances.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay anticipos registrados</p>
          ) : (
            <div className="space-y-4">
              {advances.map((advance, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={advance.date}
                        onChange={(e) => updateAdvance(index, 'date', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        value={advance.description}
                        onChange={(e) => updateAdvance(index, 'description', e.target.value)}
                        placeholder="Descripción del anticipo"
                      />
                    </div>
                    
                    <div>
                      <Label>Monto</Label>
                      <Input
                        type="text"
                        value={advance.amount ? new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(advance.amount) : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          // Remover símbolos de moneda y separadores de miles
                          const cleanValue = value.replace(/[^\d]/g, '')
                          const numValue = cleanValue === '' ? 0 : parseInt(cleanValue) || 0
                          updateAdvance(index, 'amount', numValue)
                        }}
                        placeholder="$0"
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Notas</Label>
                        <Input
                          value={advance.notes || ''}
                          onChange={(e) => updateAdvance(index, 'notes', e.target.value)}
                          placeholder="Notas..."
                        />
                      </div>
                      
                      <Button
                        type="button"
                        onClick={() => removeAdvance(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Resumen de Liquidación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sueldo Base:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(formData.baseSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Ganancias:</span>
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totals.totalEarnings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Deducciones:</span>
                <span className="font-semibold text-red-600">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totals.totalDeductions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Anticipos:</span>
                <span className="font-semibold text-orange-600">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totals.totalAdvances)}
                </span>
              </div>
            </div>
            
            <div className="pl-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  TOTAL A PAGAR
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totals.netSalary)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" variant="outline" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Vista Previa
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : liquidation ? 'Actualizar Liquidación' : 'Crear Liquidación'}
        </Button>
      </div>
    </form>

    {/* Vista Previa */}
    {showPreview && (
      <LiquidationPreview
        data={{
          ...formData,
          items,
          advances
        }}
        technician={technicians.find(t => t.id === formData.technicianId)}
        company={companies.find(c => c.id === formData.companyId)}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowPreview(false)}
        onEdit={() => setShowPreview(false)}
      />
    )}
    </>
  )
}
