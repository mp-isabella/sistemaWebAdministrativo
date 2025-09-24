'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Calendar, Camera, CheckCircle, Clock, FileText, Image as ImageIcon, MapPin, MessageCircle, Phone, RefreshCw, Save, Wrench, X, XCircle } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Datos de ejemplo para trabajos del técnico
const jobsData = [
  {
    id: 1,
    clientName: 'María González',
    clientPhone: '+56 9 1234 5678',
    clientAddress: 'Av. Providencia 1234, Providencia',
    service: 'Reparación de grifo',
    description: 'Grifo de cocina con fuga de agua',
    scheduledDate: '2024-01-16',
    scheduledTime: '10:00',
    status: 'asignado',
    priority: 'media',
    estimatedDuration: '2 horas',
    notes: null,
  },
  {
    id: 2,
    clientName: 'Carlos Rodríguez',
    clientPhone: '+56 9 2345 6789',
    clientAddress: 'Las Condes 567, Las Condes',
    service: 'Instalación de aire acondicionado',
    description: 'Instalación de split en dormitorio principal',
    scheduledDate: '2024-01-17',
    scheduledTime: '14:00',
    status: 'en_progreso',
    priority: 'media',
    estimatedDuration: '4 horas',
    notes: 'Acceso por estacionamiento',
  },
  {
    id: 3,
    clientName: 'Ana Silva',
    clientPhone: '+56 9 3456 7890',
    clientAddress: 'Ñuñoa 890, Ñuñoa',
    service: 'Mantenimiento preventivo',
    description: 'Mantenimiento de calefón',
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00',
    status: 'completado',
    priority: 'baja',
    estimatedDuration: '1 hora',
    notes: 'Cliente satisfecho con el servicio',
  },
  {
    id: 4,
    clientName: 'Roberto Pérez',
    clientPhone: '+56 9 4567 8901',
    clientAddress: 'Vitacura 123, Vitacura',
    service: 'Reparación de calentador',
    description: 'Calentador eléctrico no funciona',
    scheduledDate: '2024-01-18',
    scheduledTime: '11:00',
    status: 'asignado',
    priority: 'media',
    estimatedDuration: '3 horas',
    notes: null,
  },
];

// Componente memoizado para el header
const MyJobsHeader = memo(({ onRefresh, isLoading }: { onRefresh: () => void; isLoading: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Wrench className="h-6 w-6 text-blue-500" />
        Mis Trabajos
      </h1>
      <p className="text-gray-600 mt-1">
        Gestiona tus trabajos asignados y en progreso
      </p>
    </div>
    <Button
      onClick={onRefresh}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Actualizando...' : 'Actualizar'}
    </Button>
  </div>
));

MyJobsHeader.displayName = 'MyJobsHeader';

// Componente memoizado para estadísticas
const JobsStats = memo(({ jobs }: { jobs: any[] }) => {
  const stats = useMemo(() => ({
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'asignado').length,
    inProgress: jobs.filter(j => j.status === 'en_progreso').length,
    completed: jobs.filter(j => j.status === 'completado').length,
  }), [jobs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Trabajos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {stats.total}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.pending}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            En Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.inProgress}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Completados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

JobsStats.displayName = 'JobsStats';

// Componente memoizado para tarjeta de trabajo
const JobCard = memo(({
  job,
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
  onStartWork,
  onViewDetails,
  onGeneratePDF,
  loading,
  isGeneratingPDF
}: {
  job: any;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
  onStartWork: (jobId: number) => void;
  onCompleteWork: (jobId: number) => void;
  onViewDetails: (jobId: number) => void;
  onGeneratePDF: (jobId: number) => void;
  loading: boolean;
  isGeneratingPDF: boolean;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {job.service}
            </h3>
            <Badge
              variant="outline"
              className={getStatusColor(job.status)}
            >
              {getStatusIcon(job.status)}
              <span className="ml-1">{getStatusLabel(job.status)}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1">
              <p className="flex items-center gap-2">
                <span className="font-medium">Cliente:</span> {job.clientName}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {job.clientPhone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {job.clientAddress}
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(job.scheduledDate).toLocaleDateString('es-CL')} a las {job.scheduledTime}
              </p>
            </div>
          </div>

          {job.notes && job.notes.trim() !== '' && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Notas:</strong> {job.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {job.status === 'asignado' && (
          <>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onStartWork(job.id)}
              disabled={loading}
            >
              {loading ? 'Abriendo...' : 'Ver Formulario'}
            </Button>
          </>
        )}
        {job.status === 'en_progreso' && (
          <>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onStartWork(job.id)}
              disabled={loading}
            >
              {loading ? 'Abriendo...' : 'Continuar Trabajo'}
            </Button>
            <Button size="sm" variant="outline">
              Agregar Notas
            </Button>
          </>
        )}
        {job.status === 'completado' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(job.id)}
            >
              Ver Detalles
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onGeneratePDF(job.id)}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generando...' : 'Generar PDF Informe Final Cliente'}
            </Button>
          </>
        )}
      </div>
    </CardContent>
  </Card>
));

JobCard.displayName = 'JobCard';

// Componente memoizado para estado vacío
const EmptyState = memo(({
  icon: Icon,
  title,
  description
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <Card>
    <CardContent className="p-8 text-center">
      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </CardContent>
  </Card>
));

EmptyState.displayName = 'EmptyState';

// Componente para el modal de completar trabajo
// Modal para mostrar detalles del trabajo
const JobDetailsModal = memo(({
  job,
  isOpen,
  onClose
}: {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!job) return null;

  // Funciones de utilidad para el modal
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'asignado': return 'bg-blue-100 text-blue-800';
      case 'en_progreso': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'asignado': return 'Asignado';
      case 'en_progreso': return 'En Progreso';
      case 'completado': return 'Completado';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles del Trabajo: {job.service}
          </DialogTitle>
          <DialogDescription>
            Información completa del trabajo realizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 bg-white">
          {/* Información del trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Cliente</Label>
                  <p className="text-sm">{job.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                  <p className="text-sm">{job.clientPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dirección</Label>
                  <p className="text-sm">{job.clientAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <Badge className={getStatusColor(job.status)}>
                    {getStatusLabel(job.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha Programada</Label>
                  <p className="text-sm">{job.scheduledDate} a las {job.scheduledTime}</p>
                </div>
              </div>
              {job.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                  <p className="text-sm">{job.description}</p>
                </div>
              )}
              {job.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notas</Label>
                  <p className="text-sm">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observaciones del trabajo */}
          {job.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observaciones del Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{job.observations}</p>
              </CardContent>
            </Card>
          )}

          {/* Evidencias */}
          {job.images && job.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evidencias del Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {job.images.map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Evidencia ${index + 1}`}
                        width={200}
                        height={128}
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Firma del cliente */}
          {job.signature && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Firma del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Image
                    src={job.signature}
                    alt="Firma del cliente"
                    width={300}
                    height={128}
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

const JobCompletionModal = memo(({
  job,
  isOpen,
  onClose,
  onSave
}: {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: any) => void;
}) => {
  const [observations, setObservations] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [signature, setSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [_signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          toast.error('Por favor selecciona una imagen válida');
          return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('La imagen es demasiado grande. Máximo 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            setImages(prev => [...prev, ...newImages]);
            toast.success('Imagen agregada correctamente');
          }
        };
        reader.onerror = () => {
          toast.error('Error al leer la imagen');
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  // Funciones para la firma digital
  const handleSignatureStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);

    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (e.type === 'mousedown' || e.type === 'mousemove') {
        const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
        return {
          x: mouseEvent.clientX - rect.left,
          y: mouseEvent.clientY - rect.top
        };
      } else {
        const touchEvent = e as React.TouchEvent<HTMLCanvasElement>;
        return {
          x: touchEvent.touches[0]?.clientX || 0 - rect.left,
          y: touchEvent.touches[0]?.clientY || 0 - rect.top
        };
      }
    };

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, []);

  const handleSignatureMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    e.preventDefault();

    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (e.type === 'mousemove') {
        const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
        return {
          x: mouseEvent.clientX - rect.left,
          y: mouseEvent.clientY - rect.top
        };
      } else {
        const touchEvent = e as React.TouchEvent<HTMLCanvasElement>;
        return {
          x: touchEvent.touches[0]?.clientX || 0 - rect.left,
          y: touchEvent.touches[0]?.clientY || 0 - rect.top
        };
      }
    };

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [isDrawing]);

  const handleSignatureEnd = useCallback(() => {
    setIsDrawing(false);
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();

    // Guardar la firma como imagen
    const signatureData = canvas.toDataURL('image/png');
    setSignature(signatureData);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  }, []);

  // Configurar el canvas cuando se monta el componente
  useEffect(() => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (canvas) {
      setSignatureCanvas(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular guardado

      // Determinar el nuevo estado basado en el estado actual
      const newStatus = job.status === 'asignado' ? 'en_progreso' : 'completado';

      onSave({
        ...job,
        observations,
        images,
        signature,
        status: newStatus,
        completedAt: newStatus === 'completado' ? new Date().toISOString() : undefined
      });

      const statusMessage = newStatus === 'en_progreso'
        ? 'Trabajo iniciado correctamente'
        : 'Trabajo completado correctamente';

      toast.success(statusMessage);
      onClose();
    } catch (error) {
      toast.error('Error al guardar el trabajo');
    } finally {
      setIsSaving(false);
    }
  }, [job, observations, images, signature, onSave, onClose]);

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Completar Trabajo: {job.service}
          </DialogTitle>
          <DialogDescription>
            Registra las observaciones, evidencias y firma del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 bg-white">
          {/* Información del trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Cliente:</strong> {job.clientName}</p>
              <div className="flex items-center justify-between">
                <p><strong>Teléfono:</strong> {job.clientPhone}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  onClick={() => {
                    const phoneNumber = job.clientPhone.replace(/\D/g, '');
                    window.open(`https://wa.me/${phoneNumber}`, '_blank');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
              <p><strong>Fecha:</strong> {new Date(job.scheduledDate).toLocaleDateString('es-CL')} a las {job.scheduledTime}</p>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones del Trabajo</Label>
            <Textarea
              id="observations"
              placeholder="Describe el trabajo realizado, problemas encontrados, soluciones aplicadas..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </div>

          {/* Evidencias - Galería */}
          <div className="space-y-2">
            <Label>Evidencias del Trabajo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('gallery-upload')?.click()}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Galería
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('camera-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Cámara
              </Button>
            </div>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              id="camera-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Mostrar imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={img}
                      alt={`Evidencia ${index + 1}`}
                      width={200}
                      height={96}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Firma Digital */}
          <div className="space-y-2">
            <Label htmlFor="signature">Firma del Cliente</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex flex-col items-center space-y-4">
                <canvas
                  id="signature-canvas"
                  width={400}
                  height={150}
                  className="border border-gray-200 rounded cursor-crosshair bg-white"
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onMouseLeave={handleSignatureEnd}
                  onTouchStart={handleSignatureStart}
                  onTouchMove={handleSignatureMove}
                  onTouchEnd={handleSignatureEnd}
                  style={{
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    disabled={!signature}
                  >
                    Limpiar
                  </Button>
                  {signature && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
                        if (canvas) {
                          const link = document.createElement('a');
                          link.download = 'firma.png';
                          link.href = canvas.toDataURL();
                          link.click();
                        }
                      }}
                    >
                      Descargar Firma
                    </Button>
                  )}
                </div>
                {signature && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Firma capturada correctamente
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !observations.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : job.status === 'asignado' ? 'Iniciar Trabajo' : 'Completar Trabajo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

JobDetailsModal.displayName = 'JobDetailsModal';
JobCompletionModal.displayName = 'JobCompletionModal';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [_searchTerm, _setSearchTerm] = useState('');
  const [_filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Función para cargar trabajos reales
  const fetchJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const jobsData = await response.json();
        // Mapear los datos de la API al formato esperado
        const mappedJobs = jobsData.map((job: any) => {
          // Parsear imágenes si están en formato JSON
          let parsedImages = [];
          if (job.images) {
            try {
              parsedImages = JSON.parse(job.images);
            } catch (e) {
              parsedImages = [];
            }
          }

          return {
            id: job.id,
            clientName: job.client?.name || 'Cliente no especificado',
            clientPhone: job.client?.phone || '',
            clientAddress: job.client?.address || '',
            service: job.service?.name || job.title || 'Servicio no especificado',
            description: job.description || '',
            scheduledDate: job.scheduledAt ? new Date(job.scheduledAt).toISOString().split('T')[0] : '',
            scheduledTime: job.startTime || '',
            status: job.status?.toLowerCase() === 'pending' ? 'asignado' :
              job.status?.toLowerCase() === 'in_progress' ? 'en_progreso' :
                job.status?.toLowerCase() === 'completed' ? 'completado' :
                  job.status?.toLowerCase() === 'assigned' ? 'asignado' :
                    job.status?.toLowerCase() === 'in_progress' ? 'en_progreso' :
                      job.status?.toLowerCase() === 'completed' ? 'completado' : 'asignado',
            priority: job.priority?.toLowerCase() || 'media',
            estimatedDuration: job.endTime ? `${job.startTime} - ${job.endTime}` : 'No especificado',
            notes: job.notes || null,
            observations: job.observations || null,
            images: parsedImages,
            signature: job.signature || null,
            completedAt: job.completedAt || null,
          };
        });
        setJobs(mappedJobs);
        setFilteredJobs(mappedJobs);
      } else {
        // Fallback a datos de ejemplo si hay error
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      }
    } catch (error) {
      // Fallback a datos de ejemplo si hay error
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  // Cargar trabajos al montar el componente
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Memoizar funciones utilitarias
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'asignado':
        return 'bg-blue-100 text-blue-800';
      case 'en_progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'asignado':
        return 'Asignado';
      case 'en_progreso':
        return 'En Progreso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'asignado':
        return <Clock className="h-4 w-4" />;
      case 'en_progreso':
        return <AlertCircle className="h-4 w-4" />;
      case 'completado':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getPriorityLabel = useCallback((priority: string) => {
    switch (priority) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
      default:
        return priority;
    }
  }, []);

  // Memoizar filtros de trabajos
  const jobsByStatus = useMemo(() => {
    const pending = jobs.filter(job => job.status === 'asignado');
    const progress = jobs.filter(job => job.status === 'en_progreso');
    const completed = jobs.filter(job => job.status === 'completado');
    return { pending, progress, completed };
  }, [jobs]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Función para ver detalles del trabajo
  const handleViewDetails = useCallback((jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsDetailsModalOpen(true);
    }
  }, [jobs]);

  // Función para generar PDF del informe final
  const handleGeneratePDF = useCallback(async (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setIsGeneratingPDF(true);
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear contenido del PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe Final - ${job.service}</title>
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              max-width: 800px; 
              margin: 0 auto; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #007bff; 
              padding-bottom: 20px;
            }
            .header h1 { 
              font-size: 24px; 
              margin-bottom: 10px; 
              color: #333;
            }
            .header h2 { 
              font-size: 18px; 
              margin-bottom: 5px; 
              color: #666;
            }
            .section { 
              margin-bottom: 30px; 
              page-break-inside: avoid;
            }
            .section h3 { 
              color: #333; 
              border-bottom: 2px solid #007bff; 
              padding-bottom: 8px; 
              margin-bottom: 15px;
              font-size: 16px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 25px; 
              margin-bottom: 20px; 
            }
            .info-item { 
              margin-bottom: 15px; 
            }
            .label { 
              font-weight: bold; 
              color: #555; 
              font-size: 14px;
            }
            .value { 
              margin-top: 5px; 
              font-size: 14px;
            }
            .observations { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 15px 0; 
              border-left: 4px solid #007bff;
            }
            .signature-section { 
              text-align: center; 
              margin: 30px 0; 
              padding: 20px;
              border: 2px dashed #ddd;
              border-radius: 8px;
            }
            .signature-img { 
              max-width: 400px; 
              max-height: 200px;
              border: 1px solid #ddd; 
              border-radius: 4px;
            }
            .evidence-section {
              margin: 20px 0;
            }
            .evidence-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            .evidence-item {
              text-align: center;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 10px;
            }
            .evidence-img {
              width: 100%;
              height: 150px;
              object-fit: cover;
              border-radius: 4px;
              margin-bottom: 10px;
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              color: #666; 
              font-size: 12px; 
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              background-color: #28a745;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INFORME FINAL DE TRABAJO</h1>
            <h2>${job.service}</h2>
            <p>Fecha: ${new Date().toLocaleDateString('es-CL')}</p>
          </div>

          <div class="section">
            <h3>Información del Cliente</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Cliente:</div>
                <div class="value">${job.clientName}</div>
              </div>
              <div class="info-item">
                <div class="label">Teléfono:</div>
                <div class="value">${job.clientPhone}</div>
              </div>
              <div class="info-item">
                <div class="label">Dirección:</div>
                <div class="value">${job.clientAddress}</div>
              </div>
              <div class="info-item">
                <div class="label">Fecha Programada:</div>
                <div class="value">${job.scheduledDate} a las ${job.scheduledTime}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Detalles del Trabajo</h3>
            <div class="info-item">
              <div class="label">Servicio:</div>
              <div class="value">${job.service}</div>
            </div>
            ${job.description ? `
            <div class="info-item">
              <div class="label">Descripción:</div>
              <div class="value">${job.description}</div>
            </div>
            ` : ''}
            ${job.notes ? `
            <div class="info-item">
              <div class="label">Notas:</div>
              <div class="value">${job.notes}</div>
            </div>
            ` : ''}
          </div>

          ${job.observations ? `
          <div class="section">
            <h3>Observaciones del Trabajo Realizado</h3>
            <div class="observations">
              <p><strong>Descripción del trabajo:</strong></p>
              <p>${job.observations}</p>
            </div>
          </div>
          ` : ''}

          ${job.images && job.images.length > 0 ? `
          <div class="section">
            <h3>Evidencias Fotográficas del Trabajo</h3>
            <div class="evidence-section">
              <p><strong>Imágenes capturadas durante la realización del trabajo:</strong></p>
              <div class="evidence-grid">
                ${job.images.map((image: string, index: number) => `
                  <div class="evidence-item">
                    <img src="${image}" alt="Evidencia ${index + 1}" class="evidence-img" />
                    <p><strong>Evidencia ${index + 1}</strong></p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          ${job.signature ? `
          <div class="section">
            <h3>Firma Digital del Cliente</h3>
            <div class="signature-section">
              <p><strong>Firma de conformidad del cliente:</strong></p>
              <img src="${job.signature}" alt="Firma del Cliente" class="signature-img" />
              <p style="margin-top: 10px; font-style: italic; color: #666;">
                El cliente ha firmado digitalmente confirmando la satisfacción con el trabajo realizado.
              </p>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>Este informe fue generado automáticamente el ${new Date().toLocaleString('es-CL')}</p>
            <p>Estado del trabajo: <span class="status-badge">${job.status === 'completado' ? 'COMPLETADO' : job.status.toUpperCase()}</span></p>
            ${job.completedAt ? `<p>Fecha de finalización: ${new Date(job.completedAt).toLocaleDateString('es-CL')}</p>` : ''}
          </div>
        </body>
        </html>
      `;

      // Crear y descargar el PDF
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Final_PDF_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF generado y descargado correctamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [jobs]);

  // Función para abrir formulario de trabajo
  const handleStartWork = useCallback(async (jobId: number) => {
    setLoading(true);
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Encontrar el trabajo seleccionado
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setSelectedJob(job);
        setIsJobModalOpen(true);
        toast.success('Formulario de trabajo abierto');
      }
    } catch (error) {
      toast.error('Error al abrir el formulario');
    } finally {
      setLoading(false);
    }
  }, [jobs]);

  // Función para cambiar estado a completado
  const handleCompleteWork = useCallback(async (jobId: number) => {
    setLoading(true);
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Actualizar el estado local
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, status: 'completado' }
            : job
        )
      );

      toast.success('Estado cambiado a Completado');

      // Cambiar automáticamente a la pestaña "Completados"
      setActiveTab('completed');
    } catch (error) {
      toast.error('Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para guardar trabajo completado
  const handleSaveCompletedWork = useCallback(async (jobData: any) => {
    setLoading(true);
    try {
      // Enviar datos a la API para guardar en la base de datos
      const response = await fetch(`/api/jobs/${jobData.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: jobData.status,
          observations: jobData.observations,
          images: jobData.images,
          signature: jobData.signature
        }),
      });

      if (response.ok) {
        await response.json();
        // Actualizar el estado local
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobData.id
              ? { ...job, ...jobData }
              : job
          )
        );
        toast.success('Trabajo guardado correctamente en la base de datos');
      } else {
        toast.error('Error al guardar en la base de datos');
      }
    } catch (error) {
      toast.error('Error al guardar el trabajo');
    } finally {
      setLoading(false);
      setSelectedJob(null);
      setIsJobModalOpen(false);
      setActiveTab('completed');
    }
  }, []);

  // Mostrar estado de carga
  if (isLoadingJobs) {
    return (
      <RoleGuard requiredPermission="canAccessMyJobs">
        <div className="space-y-6">
          <MyJobsHeader onRefresh={fetchJobs} isLoading={isLoadingJobs} />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando trabajos...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredPermission="canAccessMyJobs">
      <div className="space-y-6">
        <MyJobsHeader onRefresh={fetchJobs} isLoading={isLoadingJobs} />
        <JobsStats jobs={jobs} />

        {/* Tabs de Trabajos */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pendientes ({jobsByStatus.pending.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              En Progreso ({jobsByStatus.progress.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completados ({jobsByStatus.completed.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab de Trabajos Pendientes */}
          <TabsContent value="pending" className="space-y-4">
            {jobsByStatus.pending.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No hay trabajos pendientes"
                description="Todos tus trabajos están en progreso o completados."
              />
            ) : (
              <div className="grid gap-4">
                {jobsByStatus.pending.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                    getPriorityLabel={getPriorityLabel}
                    onStartWork={handleStartWork}
                    onCompleteWork={handleCompleteWork}
                    onViewDetails={handleViewDetails}
                    onGeneratePDF={handleGeneratePDF}
                    loading={loading}
                    isGeneratingPDF={isGeneratingPDF}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab de Trabajos en Progreso */}
          <TabsContent value="progress" className="space-y-4">
            {jobsByStatus.progress.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No hay trabajos en progreso"
                description="Inicia un trabajo pendiente para verlo aquí."
              />
            ) : (
              <div className="grid gap-4">
                {jobsByStatus.progress.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                    getPriorityLabel={getPriorityLabel}
                    onStartWork={handleStartWork}
                    onCompleteWork={handleCompleteWork}
                    onViewDetails={handleViewDetails}
                    onGeneratePDF={handleGeneratePDF}
                    loading={loading}
                    isGeneratingPDF={isGeneratingPDF}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab de Trabajos Completados */}
          <TabsContent value="completed" className="space-y-4">
            {jobsByStatus.completed.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No hay trabajos completados"
                description="Los trabajos completados aparecerán aquí."
              />
            ) : (
              <div className="grid gap-4">
                {jobsByStatus.completed.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                    getPriorityLabel={getPriorityLabel}
                    onStartWork={handleStartWork}
                    onCompleteWork={handleCompleteWork}
                    onViewDetails={handleViewDetails}
                    onGeneratePDF={handleGeneratePDF}
                    loading={loading}
                    isGeneratingPDF={isGeneratingPDF}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para completar trabajo */}
      <JobCompletionModal
        job={selectedJob}
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setSelectedJob(null);
        }}
        onSave={handleSaveCompletedWork}
      />

      {/* Modal de detalles del trabajo */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </RoleGuard>
  );
}