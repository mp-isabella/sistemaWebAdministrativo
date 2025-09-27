"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Receipt, Wrench, Building2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function TestTailwindPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  // Datos de ejemplo para demostrar los PDFs
  const sampleQuote = {
    quoteNumber: "Q-001-2024",
    client: {
      name: "Juan Pérez",
      address: "Av. Providencia 123, Santiago",
      phone: "+569 12345678"
    },
    items: [
      { quantity: 1, description: "Detección de fuga de agua", unitPrice: 50000, total: 50000 },
      { quantity: 1, description: "Reparación de cañería", unitPrice: 80000, total: 80000 }
    ],
    subtotal: 130000,
    tax: 24700,
    taxRate: 19,
    total: 154700,
    date: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  const sampleLiquidation = {
    technician: { name: "Carlos Rodríguez" },
    periodStart: "01/01/2024",
    periodEnd: "31/01/2024",
    totalEarnings: 450000,
    totalDeductions: 50000,
    totalAdvances: 100000,
    netAmount: 300000,
    items: [
      { description: "Servicio de detección", type: "EARNINGS", total: 300000 },
      { description: "Materiales", type: "EARNINGS", total: 150000 },
      { description: "Descuento por tardanza", type: "DEDUCTION", total: 50000 }
    ]
  }

  const sampleInvoice = {
    invoiceNumber: "F-001-2024",
    client: {
      name: "María González",
      address: "Calle Las Condes 456, Santiago",
      phone: "+569 87654321"
    },
    items: [
      { quantity: 1, description: "Servicio de destape de alcantarillado", unitPrice: 120000, total: 120000 }
    ],
    subtotal: 120000,
    tax: 22800,
    taxRate: 19,
    total: 142800,
    date: new Date(),
    status: "PAID"
  }

  const sampleWorkOrder = {
    orderNumber: "OT-001-2024",
    client: {
      name: "Roberto Silva",
      address: "Av. Apoquindo 789, Santiago",
      phone: "+569 11223344"
    },
    description: "Reparación urgente de fuga de agua en baño principal. Se requiere acceso inmediato para evitar daños mayores en la propiedad.",
    status: "IN_PROGRESS",
    priority: "URGENT",
    date: new Date(),
    technician: {
      name: "Pedro Martínez",
      phone: "+569 55667788"
    }
  }

  const companyConfig = {
    name: "AMESTICA LIMITADA",
    service: "Servicio de detección y reparación de filtraciones de agua potable",
    rut: "76.508.960-3",
    address: "Hamburgo 1398, Ñuñoa.",
    email: "amesticaltda@gmail.com",
    phone: "222660040"
  }

  const handleGeneratePDF = async (type: string, data: any) => {
    setIsGenerating(true)
    try {
      const {
        downloadQuotePDF,
        downloadLiquidationPDF,
        downloadInvoicePDF,
        downloadWorkOrderPDF
      } = await import('@/components/pdf-generator')

      switch (type) {
        case 'quote':
          downloadQuotePDF(data, companyConfig)
          break
        case 'liquidation':
          downloadLiquidationPDF(data, companyConfig)
          break
        case 'invoice':
          downloadInvoicePDF(data, companyConfig)
          break
        case 'workOrder':
          downloadWorkOrderPDF(data, companyConfig)
          break
      }

      toast({
        title: "PDF generado",
        description: `El ${type === 'quote' ? 'presupuesto' : type === 'liquidation' ? 'liquidación' : type === 'invoice' ? 'factura' : 'orden de trabajo'} se ha descargado correctamente`,
      })
    } catch (error) {

      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demostración de PDFs Mejorados
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema unificado para generar PDFs de alta calidad con mejor posicionamiento,
            diseño consistente y formato profesional para todos los documentos de la empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Presupuestos</CardTitle>
              <CardDescription>
                Cotizaciones profesionales con diseño mejorado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGeneratePDF('quote', sampleQuote)}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Liquidaciones</CardTitle>
              <CardDescription>
                Reportes de técnicos con cálculos precisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGeneratePDF('liquidation', sampleLiquidation)}
                disabled={isGenerating}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Facturas</CardTitle>
              <CardDescription>
                Documentos comerciales con formato estándar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGeneratePDF('invoice', sampleInvoice)}
                disabled={isGenerating}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Órdenes de Trabajo</CardTitle>
              <CardDescription>
                Instrucciones técnicas detalladas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGeneratePDF('workOrder', sampleWorkOrder)}
                disabled={isGenerating}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar PDF'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Características de los PDFs Mejorados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Posicionamiento Preciso</h3>
              <p className="text-gray-600">
                Todos los elementos están perfectamente alineados y posicionados para un resultado profesional
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Diseño Consistente</h3>
              <p className="text-gray-600">
                Sistema de colores, fuentes y espaciado unificado en todos los documentos
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generación Rápida</h3>
              <p className="text-gray-600">
                Proceso optimizado que genera PDFs de alta calidad en segundos
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsive</h3>
              <p className="text-gray-600">
                Los PDFs se adaptan perfectamente a diferentes tamaños de página
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguro</h3>
              <p className="text-gray-600">
                Generación local sin envío de datos a servidores externos
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tablas Profesionales</h3>
              <p className="text-gray-600">
                Tablas con formato automático y diseño profesional para datos complejos
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Beneficios de la Nueva Implementación
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Badge variant="default" className="mr-3">Antes</Badge>
                  Problemas Identificados
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Elementos mal posicionados en PDFs
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Inconsistencias en el diseño entre documentos
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Problemas de escalado con html2canvas
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Calidad variable en la generación
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Badge variant="default" className="mr-3">Ahora</Badge>
                  Soluciones Implementadas
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Posicionamiento preciso y consistente
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Sistema de diseño unificado
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Generación nativa con jsPDF
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Calidad profesional garantizada
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
