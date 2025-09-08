'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InvoiceFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
  initialData?: any
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function InvoiceForm({ onSubmit, onCancel, loading = false, initialData }: InvoiceFormProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientId: '',
    companyId: '',
    notes: '',
    items: [] as InvoiceItem[]
  })

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0
  })
  const [unitPriceInput, setUnitPriceInput] = useState('0')
  const [taxRateInput, setTaxRateInput] = useState('19')

  useEffect(() => {
    fetchClients()
    fetchCompanies()
    fetchServices()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : formData.date,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : formData.dueDate
      })
      setSelectedClient(initialData.clientId || '')
      setSelectedCompany(initialData.companyId || '')
    }
  }, [initialData])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const getCompanyConfig = (companyType: string) => {
    const configs = {
      AMESTICA: {
        name: 'AMESTICA LIMITADA',
        colors: {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-200'
        }
      },
      MULTIFUGAS: {
        name: 'MULTIFUGAS',
        colors: {
          primary: 'bg-green-600',
          secondary: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200'
        }
      },
      SERVIFUGAS: {
        name: 'SERVIFUGAS SPA',
        colors: {
          primary: 'bg-green-600',
          secondary: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200'
        }
      }
    }

    return configs[companyType as keyof typeof configs] || configs.AMESTICA
  }

  const selectedCompanyConfig = selectedCompany ? getCompanyConfig(selectedCompany) : null

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos del ítem",
        variant: "destructive"
      })
      return
    }

    const item: InvoiceItem = {
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))

    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0
    })
    setUnitPriceInput('0')
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const taxRate = parseFloat(taxRateInput) || 19
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    return { subtotal, tax, total, taxRate }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clientId || !formData.companyId || formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos y agrega al menos un ítem",
        variant: "destructive"
      })
      return
    }

         const { subtotal, tax, total, taxRate } = calculateTotals()
     
     const invoiceData = {
       ...formData,
       subtotal,
       tax,
       total,
       taxRate
     }

    onSubmit(invoiceData)
  }

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId)
    setFormData(prev => ({ ...prev, clientId }))
  }

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId)
    setFormData(prev => ({ ...prev, companyId }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con información de la empresa seleccionada */}
      {selectedCompanyConfig && (
        <Card className={`border-2 ${selectedCompanyConfig.colors.border}`}>
          <CardHeader className={`${selectedCompanyConfig.colors.secondary}`}>
            <CardTitle className={`${selectedCompanyConfig.colors.text}`}>
              {selectedCompanyConfig.name}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Generando factura con el estilo de {selectedCompanyConfig.name}
            </p>
          </CardHeader>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                 <Label htmlFor="invoiceNumber">Número de Factura</Label>
                 <Input
                   id="invoiceNumber"
                   value={formData.invoiceNumber}
                   onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                   placeholder="FAC-001"
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="date">Fecha de Emisión</Label>
                 <Input
                   id="date"
                   type="date"
                   value={formData.date}
                   onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                 <Input
                   id="dueDate"
                   type="date"
                   value={formData.dueDate}
                   onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                 <Input
                   id="taxRate"
                   type="number"
                   value={taxRateInput}
                   onChange={(e) => {
                     const value = e.target.value
                     setTaxRateInput(value)
                   }}
                   min="0"
                   max="100"
                   step="0.01"
                   placeholder="19"
                 />
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies
                      .map((company) => ({
                        ...company,
                        displayName: company.name.replace(/\s+Ltda\.?$/i, '')
                      }))
                      .filter((company, index, self) => 
                        index === self.findIndex(c => c.displayName === company.displayName)
                      )
                      .map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.displayName} ({company.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClient} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ítems de la factura */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulario para agregar ítems */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del servicio"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
                             <div>
                 <Label htmlFor="unitPrice">Precio Unitario</Label>
                 <Input
                   id="unitPrice"
                   type="text"
                   value={unitPriceInput ? new Intl.NumberFormat('es-CL', {
                     style: 'currency',
                     currency: 'CLP',
                     minimumFractionDigits: 0,
                     maximumFractionDigits: 0
                   }).format(parseFloat(unitPriceInput)) : ''}
                   onChange={(e) => {
                     const value = e.target.value
                     // Remover símbolos de moneda y separadores de miles
                     const cleanValue = value.replace(/[^\d]/g, '')
                     const numValue = cleanValue === '' ? '' : cleanValue
                     setUnitPriceInput(numValue)
                     const parsedValue = cleanValue === '' ? 0 : parseInt(cleanValue) || 0
                     setNewItem(prev => ({ ...prev, unitPrice: parsedValue }))
                   }}
                   placeholder="$0"
                 />
               </div>
              <div>
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Lista de ítems */}
            {formData.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-center">Cantidad</th>
                      <th className="px-4 py-2 text-right">Precio Unit.</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totales */}
            {formData.items.length > 0 && (
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateTotals().subtotal)}</span>
                  </div>
                                     <div className="flex justify-between">
                     <span>IVA ({calculateTotals().taxRate}%):</span>
                     <span>{formatCurrency(calculateTotals().tax)}</span>
                   </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className={selectedCompanyConfig?.colors.text}>
                      {formatCurrency(calculateTotals().total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observaciones adicionales sobre la factura..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || formData.items.length === 0}
            className={selectedCompanyConfig?.colors.primary}
          >
            {loading ? 'Guardando...' : 'Crear Factura'}
          </Button>
        </div>
      </form>
    </div>
  )
}
