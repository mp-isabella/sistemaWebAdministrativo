'use client'

import QuotePreview from '@/components/quote/quote-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { REGIONES_Y_COMUNAS } from '@/lib/regions-communes'
import { ArrowLeft, Eye, FileText, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface Client {
  id: string
  name: string
  email: string
  company: string
  phone?: string
  address?: string
}

interface QuoteItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  materials?: string
  exposedArea?: string
}

interface Company {
  id: string
  name: string
  displayName?: string
  type: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  rut?: string
  address?: string
  email?: string
  phone?: string
  service?: string
}

interface QuoteFormEnhancedProps {
  initialData?: {
    clientId?: string
    clientName?: string
    clientAddress?: string
    clientPhone?: string
    clientRegion?: string
    clientCommune?: string
    companyId?: string
    validUntil?: string
    taxRate?: number
    discount?: number
    notes?: string
    items?: QuoteItem[]
    technician?: string
    diagnosis?: string
    serviceType?: string
    warranty?: string
  }
  onSubmit: (data: {
    clientName: string
    clientId: string
    clientAddress?: string
    clientPhone?: string
    clientRegion?: string
    clientCommune?: string
    companyId: string
    validUntil: string
    taxRate: number
    discount: number
    notes: string
    items: QuoteItem[]
    technician: string
    diagnosis: string
    serviceType: string
    warranty: string
  }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function QuoteFormEnhanced({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: QuoteFormEnhancedProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [technicians, setTechnicians] = useState<Array<{ id: string, name: string }>>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  // Usar el mapeo completo de regiones y comunas
  const regionCommuneMap = useMemo(() => REGIONES_Y_COMUNAS, []);

  const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [{
    id: '1',
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  }]);

  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || '',
    clientAddress: initialData?.clientAddress || '',
    clientPhone: initialData?.clientPhone || '',
    clientRegion: initialData?.clientRegion || '',
    clientCommune: initialData?.clientCommune || '',
    companyId: initialData?.companyId || '',
    validUntil: initialData?.validUntil || new Date().toISOString().split('T')[0],
    taxRate: initialData?.taxRate || 19,
    discount: initialData?.discount || 0,
    notes: initialData?.notes || '',
    technician: initialData?.technician || '',
    diagnosis: initialData?.diagnosis || '',
    serviceType: initialData?.serviceType || '',
    warranty: initialData?.warranty || ''
  })

  // Actualizar empresa seleccionada cuando cambie el companyId
  useEffect(() => {
    if (formData.companyId && companies.length > 0) {
      const company = companies.find(c => c.id === formData.companyId)

      if (company) {
        setSelectedCompany(company)

      } else {

        setSelectedCompany(null)
      }
    } else {

      setSelectedCompany(null)
    }
  }, [formData.companyId, companies])

  // Debug: Log initial state after items declaration

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, companiesRes, techniciansRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/companies'),
          fetch('/api/technicians-test')
        ])

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()

          // Filtrar solo clientes activos para cotizaciones
          const activeClients = clientsData.filter((client: any) => client.status === 'active')
          setClients(activeClients)
        } else {

        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()

          // Usar todas las empresas activas para cotizaciones
          const filteredCompanies = companiesData || []
          // console.log('Filtered companies:', filteredCompanies.length)
          setCompanies(filteredCompanies)
        } else {
          // console.log('Companies request failed')
        }

        if (techniciansRes.ok) {
          const techniciansData = await techniciansRes.json()

          // El endpoint de prueba ya devuelve solo técnicos activos
          setTechnicians(techniciansData)
        } else {
          // console.log('Technicians request failed')
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Error al cargar los datos iniciales",
          variant: "destructive"
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [toast])

  // Obtener comunas disponibles según la región seleccionada
  const getAvailableCommunes = () => {
    return [...(regionCommuneMap[formData.clientRegion as keyof typeof regionCommuneMap] || [])];
  };

  // Resetear comuna cuando cambia la región
  const handleRegionChange = (region: string) => {
    const availableCommunes = [...(regionCommuneMap[region as keyof typeof regionCommuneMap] || [])];
    const newCommune = availableCommunes.includes(formData.clientCommune as any) ? formData.clientCommune : availableCommunes[0] || "";

    setFormData(prev => ({
      ...prev,
      clientRegion: region,
      clientCommune: newCommune
    }));
  };

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = item.quantity || 0
      const unitPrice = item.unitPrice || 0
      const itemTotal = quantity === 0 ? unitPrice : quantity * unitPrice
      return sum + itemTotal
    }, 0)
    const discount = formData.discount || 0
    const subtotalAfterDiscount = subtotal - discount
    const tax = subtotalAfterDiscount * (formData.taxRate / 100)
    const total = subtotalAfterDiscount + tax
    return { subtotal, discount, subtotalAfterDiscount, tax, total }
  }

  const { subtotal, tax, total } = calculateTotals()

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  // Agregar item
  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      unitPrice: 0,
      total: 0
    }])
  }

  // Eliminar item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  // Actualizar item
  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    const currentItem = newItems[index]
    if (!currentItem) return

    newItems[index] = { ...currentItem, [field]: value }

    // Recalcular total del item
    if (field === 'quantity' || field === 'unitPrice') {
      // Solo cuando la cantidad es exactamente 0, mostrar el precio unitario
      const quantity = newItems[index]?.quantity || 0
      const unitPrice = newItems[index]?.unitPrice || 0
      if (newItems[index]) {
        newItems[index].total = quantity === 0 ? unitPrice : quantity * unitPrice

      }
    }

    setItems(newItems)
  }

  // Confirmar desde vista previa
  const handleConfirmPreview = async () => {
    try {

      const submitData = {
        clientName: formData.clientId, // Ahora clientId contiene el nombre directamente
        clientId: '', // Campo vacío ya que no tenemos ID de cliente
        clientAddress: formData.clientAddress,
        clientPhone: formData.clientPhone,
        clientRegion: formData.clientRegion,
        clientCommune: formData.clientCommune,
        companyId: formData.companyId,
        company: selectedCompany, // Incluir toda la información de la empresa seleccionada
        validUntil: formData.validUntil || new Date().toISOString().split('T')[0],
        taxRate: formData.taxRate,
        discount: formData.discount,
        notes: formData.notes,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          materials: item.materials,
          exposedArea: item.exposedArea
        })),
        technician: formData.technician,
        diagnosis: formData.diagnosis,
        serviceType: formData.serviceType,
        warranty: formData.warranty
      }

      await onSubmit({
        clientName: submitData.clientName || '',
        clientId: submitData.clientId || '',
        clientAddress: submitData.clientAddress || '',
        clientPhone: submitData.clientPhone || '',
        clientRegion: submitData.clientRegion || '',
        clientCommune: submitData.clientCommune || '',
        companyId: submitData.companyId || '',
        validUntil: (submitData.validUntil || new Date().toISOString().split('T')[0]) as string,
        taxRate: submitData.taxRate || 19,
        discount: submitData.discount || 0,
        notes: submitData.notes || '',
        items: (submitData.items || []).map(item => ({
          ...item,
          materials: item.materials || '',
          exposedArea: item.exposedArea || ''
        })),
        technician: submitData.technician || '',
        diagnosis: submitData.diagnosis || '',
        serviceType: submitData.serviceType || '',
        warranty: submitData.warranty || ''
      })

      setShowPreview(false)

      toast({
        title: "Éxito",
        description: "Presupuesto creado y guardado correctamente.",
      })
    } catch (error) {

      toast({
        title: "Error",
        description: "Error al crear el presupuesto. Por favor intenta nuevamente.",
        variant: "destructive"
      })
    }
  }

  // Cancelar vista previa
  const handleCancelPreview = () => {
    setShowPreview(false)
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Verificar si hay datos disponibles
  if (clients.length === 0 || companies.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            No hay datos disponibles para crear presupuestos.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Clientes disponibles: {clients.length}</p>
            <p>Empresas disponibles: {companies.length}</p>
            <p>Técnicos disponibles: {technicians.length}</p>
            {technicians.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Técnicos encontrados:</p>
                <ul className="list-disc list-inside ml-4">
                  {technicians.map(tech => (
                    <li key={tech.id}>{tech.name} (ID: {tech.id})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Recargar página
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar vista previa si está activa
  if (showPreview) {

    // Usar la empresa seleccionada del estado, no buscar nuevamente
    const previewCompany = selectedCompany || companies.find(c => c.id === formData.companyId)

    // Si no se encuentra la empresa, usar la primera disponible
    if (!previewCompany && companies.length > 0) {

      // const fallbackCompany = companies[0]

    }

    // Verificar que tenemos una empresa válida
    if (!previewCompany) {

      toast({
        title: "Error",
        description: "No hay empresa disponible para la vista previa.",
        variant: "destructive"
      })
      setShowPreview(false)
      return null
    }

    // Crear un objeto cliente con los datos del formulario
    const mockClient = {
      id: '',
      name: formData.clientId,
      email: '',
      company: formData.clientAddress || '',
      phone: formData.clientPhone || '',
      address: formData.clientAddress || ''
    }

    return (
      <QuotePreview
        data={{
          ...formData,
          clientName: mockClient.name,
          clientId: mockClient.id,
          items: items,
          validUntil: (formData.validUntil || new Date().toISOString().split('T')[0] || '') as string // Ensure the date is properly passed
        }}
        client={mockClient}
        company={previewCompany}
        onConfirm={handleConfirmPreview}
        onCancel={handleCancelPreview}
        onEdit={() => setShowPreview(false)}
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Información General del Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="clientName" className="text-sm sm:text-base">Señor (a) *</Label>
              <Input
                id="clientName"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                placeholder="Nombre del cliente"
                className="text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="companyId" className="text-sm sm:text-base">Empresa *</Label>
              <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="clientAddress" className="text-sm sm:text-base">Dirección</Label>
              <Input
                id="clientAddress"
                value={formData.clientAddress}
                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                placeholder="Dirección del cliente"
                className="text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="clientPhone" className="text-sm sm:text-base">Contacto</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="Teléfono del cliente"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="clientRegion" className="text-sm sm:text-base">Región</Label>
              <Select value={formData.clientRegion} onValueChange={handleRegionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(regionCommuneMap).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clientCommune" className="text-sm sm:text-base">Comuna</Label>
              <Select value={formData.clientCommune} onValueChange={(value) => setFormData({ ...formData, clientCommune: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar comuna" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCommunes().map((commune) => (
                    <SelectItem key={commune} value={commune}>
                      {commune}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="validUntil" className="text-sm sm:text-base">Fecha *</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="taxRate" className="text-sm sm:text-base">Tasa de IVA (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 19 })}
                min="0"
                max="100"
                step="0.01"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="technician" className="text-sm sm:text-base">Técnico</Label>
              <div className="space-y-2">
                <Select value={formData.technician} onValueChange={(value) => setFormData({ ...formData, technician: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.length === 0 ? (
                      <SelectItem value="no-technicians" disabled>
                        No hay técnicos disponibles
                      </SelectItem>
                    ) : (
                      technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.name}>
                          {technician.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {technicians.length === 0 && (
                  <p className="text-xs text-red-500">
                    No hay técnicos disponibles. Verifica que existan técnicos activos en el sistema.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="serviceType" className="text-sm sm:text-base">Tipo de Servicio</Label>
              <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deteccion_fugas">Detección de Fugas de Agua</SelectItem>
                  <SelectItem value="destape_alcantarillado">Destape de Alcantarillado</SelectItem>
                  <SelectItem value="videointrospeccion">Videoinspección de Ductos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Observaciones y Condiciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Observaciones adicionales, condiciones especiales, términos y condiciones..."
            rows={4}
            className="text-sm sm:text-base"
          />
        </CardContent>
      </Card>

      {/* Servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Servicios y Materiales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Encabezados de la tabla */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="col-span-5">
              <h4 className="text-sm font-semibold text-gray-700">Descripción del Servicio *</h4>
            </div>
            <div className="col-span-2 text-center">
              <h4 className="text-sm font-semibold text-gray-700">Cantidad</h4>
            </div>
            <div className="col-span-2 text-center">
              <h4 className="text-sm font-semibold text-gray-700">Precio Unitario</h4>
            </div>
            <div className="col-span-2 text-center">
              <h4 className="text-sm font-semibold text-gray-700">Total</h4>
            </div>
            <div className="col-span-1 text-center">
              <h4 className="text-sm font-semibold text-gray-700">Acciones</h4>
            </div>
          </div>

          {/* Items de servicios */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  {/* Descripción del servicio */}
                  <div className="col-span-1 sm:col-span-5">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block sm:hidden">
                      Descripción del Servicio *
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Describe el servicio o material de manera detallada..."
                        rows={1}
                        className="min-h-[44px] resize-none overflow-hidden border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-sm leading-relaxed"
                        style={{
                          height: 'auto',
                          minHeight: '44px'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement
                          target.style.height = 'auto'
                          target.style.height = Math.max(44, target.scrollHeight) + 'px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block sm:hidden">Cantidad</Label>
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          const numValue = value === '' ? 0 : parseInt(value) || 0
                          updateItem(index, 'quantity', numValue)
                        }}
                        min="0"
                        className="w-20 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-sm text-center"
                      />
                    </div>
                  </div>

                  {/* Precio Unitario */}
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block sm:hidden">Precio Unitario</Label>
                    <div className="flex justify-center">
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
                        className="w-28 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-sm text-center"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block sm:hidden">Total</Label>
                    <div className="flex justify-center">
                      <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-sm font-semibold text-green-700 text-center shadow-sm w-24">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-1 sm:col-span-1">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block sm:hidden">Acciones</Label>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="h-[44px] w-[44px] p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 shadow-sm"
                        title={items.length === 1 ? "Debe mantener al menos un servicio" : "Eliminar servicio"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para agregar nuevo servicio */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm py-3 px-6 rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Servicio Personalizado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between text-base sm:text-lg">
                <span className="font-medium">Neto:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg">
                <span className="font-medium">Descuento:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={formData.discount ? new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(formData.discount) : ''}
                    onChange={(e) => {
                      const value = e.target.value
                      const cleanValue = value.replace(/[^\d]/g, '')
                      const numValue = cleanValue === '' ? 0 : parseInt(cleanValue) || 0
                      setFormData({ ...formData, discount: numValue })
                    }}
                    placeholder="$0"
                    className="w-24 text-right text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex justify-between text-base sm:text-lg">
                <span className="font-medium">IVA ({formData.taxRate}%):</span>
                <span className="font-semibold text-red-600">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg sm:text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            placeholder="Descripción del diagnóstico del problema..."
            rows={3}
            className="text-sm sm:text-base"
          />
        </CardContent>
      </Card>

      {/* Garantía y Condiciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Garantía y Condiciones del Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="warranty"
            value={formData.warranty}
            onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
            placeholder="Condiciones de garantía, términos del servicio, condiciones de pago, etc."
            rows={4}
            className="text-sm sm:text-base"
          />
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Button type="button" variant="outline" onClick={onCancel} className="text-sm sm:text-base">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {

            // Validación básica
            if (!formData.clientId || formData.clientId.trim() === '') {
              toast({
                title: "Campo Requerido",
                description: "Por favor completa el campo 'Señor (a)' antes de continuar.",
                variant: "destructive"
              })
              return
            }

            if (!formData.companyId || formData.companyId.trim() === '') {
              toast({
                title: "Campo Requerido",
                description: "Por favor selecciona una empresa antes de continuar.",
                variant: "destructive"
              })
              return
            }

            if (!formData.validUntil || formData.validUntil.trim() === '') {
              toast({
                title: "Campo Requerido",
                description: "Por favor selecciona una fecha antes de continuar.",
                variant: "destructive"
              })
              return
            }

            setShowPreview(true)
          }}
          className="text-sm sm:text-base bg-yellow-100 hover:bg-yellow-200"
        >
          <Eye className="mr-2 h-4 w-4" />
          Vista Previa
        </Button>

        <Button
          type="button"
          onClick={async () => {

            // Validación completa para crear presupuesto
            const errors = []

            if (!formData.clientId || formData.clientId.trim() === '') errors.push('Señor (a)')
            if (!formData.companyId || formData.companyId.trim() === '') errors.push('Empresa')
            if (!formData.validUntil || formData.validUntil.trim() === '') errors.push('Fecha')

            if (errors.length > 0) {
              toast({
                title: "Campos Requeridos",
                description: `Por favor completa: ${errors.join(', ')} antes de continuar.`,
                variant: "destructive"
              })
              return
            }

            // Validar que al menos haya un item válido
            const validItems = items.filter(item =>
              item.description &&
              item.description.trim() !== '' &&
              item.quantity > 0 &&
              item.unitPrice > 0
            )

            if (validItems.length === 0) {
              toast({
                title: "Items Requeridos",
                description: "Por favor agrega al menos un servicio con descripción, cantidad y precio válidos.",
                variant: "destructive"
              })
              return
            }

            try {
              const submitData = {
                clientName: formData.clientId,
                clientId: formData.clientId,
                clientAddress: formData.clientAddress,
                clientPhone: formData.clientPhone,
                clientRegion: formData.clientRegion,
                clientCommune: formData.clientCommune,
                companyId: formData.companyId,
                company: selectedCompany, // Incluir toda la información de la empresa seleccionada
                validUntil: formData.validUntil,
                taxRate: formData.taxRate,
                discount: formData.discount,
                notes: formData.notes,
                items: validItems.map(item => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total,
                  materials: item.materials,
                  exposedArea: item.exposedArea
                })),
                technician: formData.technician,
                diagnosis: formData.diagnosis,
                serviceType: formData.serviceType,
                warranty: formData.warranty
              }

              await onSubmit({
                clientName: submitData.clientName || '',
                clientId: submitData.clientId || '',
                clientAddress: submitData.clientAddress || '',
                clientPhone: submitData.clientPhone || '',
                clientRegion: submitData.clientRegion || '',
                clientCommune: submitData.clientCommune || '',
                companyId: submitData.companyId || '',
                validUntil: (submitData.validUntil || new Date().toISOString().split('T')[0] || '') as string,
                taxRate: submitData.taxRate || 19,
                discount: submitData.discount || 0,
                notes: submitData.notes || '',
                items: (submitData.items || []).map(item => ({
                  ...item,
                  materials: item.materials || '',
                  exposedArea: item.exposedArea || '',
                  description: item.description || '',
                  quantity: item.quantity || 1,
                  unitPrice: item.unitPrice || 0,
                  total: item.total || 0
                })),
                technician: submitData.technician || '',
                diagnosis: submitData.diagnosis || '',
                serviceType: submitData.serviceType || '',
                warranty: submitData.warranty || ''
              })

              toast({
                title: "Éxito",
                description: "Presupuesto creado y guardado en el historial correctamente.",
              })
            } catch (error) {

              toast({
                title: "Error",
                description: "Error al crear el presupuesto. Por favor intenta nuevamente.",
                variant: "destructive"
              })
            }
          }}
          disabled={loading}
          className="text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Crear Presupuesto
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
