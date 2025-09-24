"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSignatureCanvas } from "@/hooks/use-signature-canvas"
import {
  Camera,
  // CheckCircle, 
  Clock,
  DollarSign,
  // Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  Signature,
  Upload,
  User,
  Wrench,
  // AlertCircle, 
  X
} from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  description: string
  status: string
  priority: string
  scheduledAt: string
  startTime: string
  endTime: string
  address: string
  notes: string
  images: string
  signature: string
  client: {
    name: string
    phone: string
    email: string
    address: string
  }
  service: {
    name: string
  }
}

interface JobManagementModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onJobUpdated: () => void
}

export default function JobManagementModal({
  job,
  isOpen,
  onClose,
  onJobUpdated
}: JobManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(job?.status || "")
  const [observations, setObservations] = useState(job?.notes || "")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [signature, setSignature] = useState(job?.signature || "")
  const [paymentStatus, setPaymentStatus] = useState("PENDING")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [activeTab, setActiveTab] = useState("status")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    canvasRef,
    isDrawing: _isDrawing,
    hasSignature: _hasSignature,
    clearCanvas,
    getSignatureData,
    setSignatureData
  } = useSignatureCanvas()

  useEffect(() => {
    if (job) {
      setCurrentStatus(job.status)
      setObservations(job.notes || "")
      setSignature(job.signature || "")
      if (job.images) {
        setUploadedImages(job.images.split(",").filter(img => img.trim()))
      }
      if (job.signature) {
        setSignatureData(job.signature)
      }
    }
  }, [job, setSignatureData])

  // Manejar el scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restaurar scroll cuando el modal se cierra
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            setUploadedImages(prev => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const saveSignature = () => {
    const signatureData = getSignatureData()
    if (signatureData) {
      setSignature(signatureData)
      toast.success("Firma guardada correctamente")
    }
  }

  const handleStatusUpdate = async () => {
    if (!job) return

    // Validar que se haya seleccionado un estado
    if (!currentStatus) {
      toast.error("❌ Por favor selecciona un estado para el trabajo")
      return
    }

    setLoading(true)
    try {
      // Simular actualización para datos de ejemplo
      if (job.id.startsWith('JOB-')) {
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mostrar mensaje específico según el estado
        const statusMessages = {
          'PENDING': '✅ Trabajo marcado como Pendiente',
          'IN_PROGRESS': '✅ Trabajo marcado como En Progreso',
          'COMPLETED': '✅ Trabajo marcado como Completado',
          'CANCELLED': '✅ Trabajo marcado como Cancelado'
        }

        toast.success(statusMessages[currentStatus as keyof typeof statusMessages] || "✅ Trabajo actualizado correctamente")

        // Actualizar el estado local del trabajo para reflejar el cambio inmediatamente
        const _updatedJob = {
          // Intentionally unused - we only need to update the parent component
          ...job,
          status: currentStatus,
          notes: observations,
          images: uploadedImages.join(","),
          signature: signature
        }
        // _updatedJob is intentionally unused - we only need to update the parent component
        void _updatedJob

        // Notificar al componente padre sobre la actualización
        onJobUpdated()
        onClose()
        return
      }

      // Actualización real para datos de la base de datos
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: currentStatus,
          notes: observations,
          images: uploadedImages.join(","),
          signature: signature,
          completedAt: currentStatus === "COMPLETED" ? new Date().toISOString() : null
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Mostrar mensaje específico según el estado
        const statusMessages = {
          'PENDING': '✅ Trabajo marcado como Pendiente',
          'IN_PROGRESS': '✅ Trabajo marcado como En Progreso',
          'COMPLETED': '✅ Trabajo marcado como Completado',
          'CANCELLED': '✅ Trabajo marcado como Cancelado'
        }

        toast.success(statusMessages[currentStatus as keyof typeof statusMessages] || "✅ Trabajo actualizado correctamente")

        // Notificar al componente padre sobre la actualización
        onJobUpdated()
        onClose()

        // Emitir evento personalizado para notificar al calendario
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('jobStatusUpdated', {
            detail: {
              jobId: job.id,
              newStatus: currentStatus,
              jobData: result
            }
          }))
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al actualizar el trabajo")
      }
    } catch (error) {

      toast.error(`❌ Error: ${error instanceof Error ? error.message : "Error al actualizar el trabajo"}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentRecord = async () => {
    if (!job || !paymentAmount || !paymentMethod) {
      toast.error("Por favor complete todos los campos de pago")
      return
    }

    setLoading(true)
    try {
      if (job.id.startsWith('JOB-')) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPaymentStatus("PAID")
        toast.success("Pago registrado correctamente")
        return
      }

      const response = await fetch("/api/cash-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          type: "INCOME",
          description: `Pago por trabajo: ${job.title}`,
          category: "Servicios",
          paymentMethod: paymentMethod,
          reference: `Job-${job.id}`,
          date: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setPaymentStatus("PAID")
        toast.success("Pago registrado correctamente")
      } else {
        throw new Error("Error al registrar el pago")
      }
    } catch (error) {

      toast.error("Error al registrar el pago")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      HIGH: { label: 'Alta', color: 'bg-red-100 text-red-800' },
      MEDIUM: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
      LOW: { label: 'Baja', color: 'bg-green-100 text-green-800' }
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!job) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="job-management-modal !fixed !left-1/2 !top-1/2 !z-[9999] !w-[98vw] !max-w-7xl !h-[92vh] !-translate-x-1/2 !-translate-y-1/2 !bg-white !rounded-2xl !shadow-2xl !border-0 !overflow-hidden"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '98vw',
          maxWidth: '80rem',
          height: '92vh',
          overflow: 'hidden',
          margin: 0,
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-6 bg-white z-10">
          <DialogTitle className="flex items-center gap-4 text-2xl">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Wrench className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-xl">{job.title}</div>
              <div className="text-sm font-normal text-gray-500 flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                {job.client.name} • {job.service.name}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 200px)' }}>
            {/* Panel Izquierdo - Información */}
            <div className="lg:col-span-1 space-y-6">
              {/* Información del Trabajo */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                    Información del Trabajo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Estado:</span>
                    {getStatusBadge(currentStatus)}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Prioridad:</span>
                    {getPriorityBadge(job.priority)}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Descripción:</span>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{job.description}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Dirección:</span>
                    <p className="text-sm text-gray-600 mt-2">{job.address}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(job.scheduledAt)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Horario:</span>
                      <p className="text-sm text-gray-600 mt-1">{job.startTime} - {job.endTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Cliente */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                    <User className="h-5 w-5" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">{job.client.name}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{job.client.phone}</span>
                  </div>
                  {job.client.email && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">{job.client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{job.client.address}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel Derecho - Gestión */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs de Navegación */}
              <div className="flex space-x-2 bg-gray-100 p-2 rounded-2xl">
                <button
                  onClick={() => setActiveTab("status")}
                  className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "status"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estado
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("evidence")}
                  className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "evidence"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Camera className="h-4 w-4" />
                    Evidencias
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("signature")}
                  className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "signature"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Signature className="h-4 w-4" />
                    Firma
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "payment"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pago
                  </div>
                </button>
              </div>

              {/* Contenido de los Tabs */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 300px)' }}>
                {/* Tab Estado */}
                {activeTab === "status" && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardContent className="pt-8 space-y-8">
                      <div>
                        <Label htmlFor="status" className="text-lg font-semibold text-gray-900 mb-3 block">Estado del Trabajo</Label>
                        <Select value={currentStatus} onValueChange={setCurrentStatus}>
                          <SelectTrigger className="h-14 text-base border-2 border-gray-200 focus:border-blue-500 hover:border-blue-400 transition-colors">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING" className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                              Pendiente
                            </SelectItem>
                            <SelectItem value="IN_PROGRESS" className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                              En Progreso
                            </SelectItem>
                            <SelectItem value="COMPLETED" className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                              Completado
                            </SelectItem>
                            <SelectItem value="CANCELLED" className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                              Cancelado
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Mostrar el estado actual con color */}
                        {currentStatus && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                            <span className="text-sm font-medium text-gray-700">Estado actual: </span>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${currentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              currentStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  currentStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                              }`}>
                              <div className={`w-2 h-2 rounded-full ${currentStatus === 'PENDING' ? 'bg-yellow-500' :
                                currentStatus === 'IN_PROGRESS' ? 'bg-blue-500' :
                                  currentStatus === 'COMPLETED' ? 'bg-green-500' :
                                    currentStatus === 'CANCELLED' ? 'bg-red-500' :
                                      'bg-gray-500'
                                }`}></div>
                              {currentStatus === 'PENDING' ? 'Pendiente' :
                                currentStatus === 'IN_PROGRESS' ? 'En Progreso' :
                                  currentStatus === 'COMPLETED' ? 'Completado' :
                                    currentStatus === 'CANCELLED' ? 'Cancelado' :
                                      currentStatus}
                            </span>

                            {/* Botón de prueba rápida */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">Prueba rápida de estados:</p>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCurrentStatus('PENDING')}
                                  className="text-xs h-8 px-3"
                                >
                                  Pendiente
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCurrentStatus('IN_PROGRESS')}
                                  className="text-xs h-8 px-3"
                                >
                                  En Progreso
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCurrentStatus('COMPLETED')}
                                  className="text-xs h-8 px-3"
                                >
                                  Completado
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCurrentStatus('CANCELLED')}
                                  className="text-xs h-8 px-3"
                                >
                                  Cancelado
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="observations" className="text-lg font-semibold text-gray-900 mb-3 block">Observaciones</Label>
                        <Textarea
                          id="observations"
                          value={observations}
                          onChange={(e) => setObservations(e.target.value)}
                          placeholder="Agregar observaciones sobre el trabajo..."
                          rows={8}
                          className="resize-none border-2 border-gray-200 focus:border-blue-500 text-base p-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tab Evidencias */}
                {activeTab === "evidence" && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardContent className="pt-8 space-y-8">
                      <div>
                        <Label className="text-lg font-semibold text-gray-900 mb-3 block">Imágenes de Evidencia</Label>
                        <div className="mt-4">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-16 text-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                          >
                            <Upload className="mr-3 h-6 w-6" />
                            Subir Imágenes de Evidencia
                          </Button>
                        </div>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-3 block">Imágenes Cargadas</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {uploadedImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={image}
                                  alt={`Evidencia ${index + 1}`}
                                  width={200}
                                  height={160}
                                  className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-3 right-3 h-10 w-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full shadow-lg"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tab Firma */}
                {activeTab === "signature" && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardContent className="pt-8 space-y-8">
                      {signature && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                          <Label className="text-lg font-semibold text-gray-900 mb-3 block">Firma Actual</Label>
                          <Image src={signature} alt="Firma" width={300} height={160} className="max-w-full h-40 object-contain mt-4" />
                        </div>
                      )}

                      <div className="space-y-6">
                        <Label className="text-lg font-semibold text-gray-900 mb-3 block">Firma Digital del Cliente</Label>
                        <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                          <canvas
                            ref={canvasRef}
                            width={600}
                            height={250}
                            className="w-full cursor-crosshair bg-white"
                            style={{ touchAction: "none" }}
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={saveSignature}
                            className="flex-1 h-14 text-lg"
                          >
                            <Save className="mr-3 h-5 w-5" />
                            Guardar Firma
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={clearCanvas}
                            className="h-14 px-8 text-lg"
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tab Pago */}
                {activeTab === "payment" && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardContent className="pt-8 space-y-8">
                      <div>
                        <Label htmlFor="paymentStatus" className="text-lg font-semibold text-gray-900 mb-3 block">Estado de Pago</Label>
                        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                          <SelectTrigger className="h-14 text-base border-2 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="PAID">Pagado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentStatus === "PAID" && (
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="paymentMethod" className="text-lg font-semibold text-gray-900 mb-3 block">Método de Pago</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger className="h-14 text-base border-2 border-gray-200 focus:border-blue-500">
                                <SelectValue placeholder="Seleccionar método" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">Efectivo</SelectItem>
                                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                                <SelectItem value="CARD">Tarjeta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="paymentAmount" className="text-lg font-semibold text-gray-900 mb-3 block">Monto</Label>
                            <Input
                              id="paymentAmount"
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="0.00"
                              step="0.01"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500"
                            />
                          </div>

                          <Button
                            type="button"
                            onClick={handlePaymentRecord}
                            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                            disabled={!paymentMethod || !paymentAmount}
                          >
                            <DollarSign className="mr-3 h-6 w-6" />
                            Registrar Pago
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 bg-white">
            <Button variant="outline" onClick={onClose} className="h-14 px-8 text-lg">
              Cancelar
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={loading}
              className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </div>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
