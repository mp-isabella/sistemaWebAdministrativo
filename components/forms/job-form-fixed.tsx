"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useScheduleValidation } from "@/hooks/use-schedule-validation"
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, Building, CheckCircle, Clock, FileText, MapPin, Plus, User, Wrench, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from "react"

interface JobFormProps {
  job?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function JobForm({ job, onSubmit, onCancel, loading = false }: JobFormProps) {
  // Usar el mapeo completo de regiones y comunas
  const regionCommuneMap = useMemo(() => REGIONES_Y_COMUNAS, []);

  const [formData, setFormData] = useState({
    description: "",
    clientId: "",
    serviceName: "",
    serviceId: "",
    companyId: "sin-empresa",
    assignedToId: "tecnico-generico",
    scheduledAt: null as Date | null,
    startTime: "",
    endTime: "",
    totalBudget: "" as string | number
  })

  // Estado para mostrar nombres de elementos seleccionados
  const [selectedClientName, setSelectedClientName] = useState("")
  const [selectedCompanyName, setSelectedCompanyName] = useState("")
  const [selectedTechnicianName, setSelectedTechnicianName] = useState("")

  // Estado para el tipo de servicio seleccionado
  const [serviceType, setServiceType] = useState<"predetermined" | "custom">("predetermined")
  const [selectedPredeterminedService, setSelectedPredeterminedService] = useState("")

  // Servicios predeterminados
  const predeterminedServices = useMemo(() => [
    "Detección de fugas de agua",
    "Destape de alcantarillado",
    "Video inspección de ductos"
  ], [])

  // Empresas disponibles
  const availableCompanies = useMemo(() => [
    { id: "sin-empresa", name: "Sin empresa" },
    { id: "company-amestica-001", name: "Amestica Ltda" },
    { id: "company-multifugas-001", name: "Multifugas" },
    { id: "company-servifugas-001", name: "Servifugas" }
  ], [])

  // Estado para el formulario de cliente nuevo
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    rut: "",
    region: "",
    commune: ""
  })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clients, setClients] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hook para validación de horarios
  const { clearValidation } = useScheduleValidation()

  // Función para inicializar el formulario con datos del trabajo
  const initializeFormWithJob = useCallback((jobData: any) => {
    // Manejar la fecha correctamente para evitar problemas de zona horaria
    let scheduledDate = null
    if (jobData.scheduledAt) {
      const jobDate = new Date(jobData.scheduledAt)
      // Crear la fecha usando componentes individuales para evitar problemas de zona horaria
      const year = jobDate.getFullYear()
      const month = jobDate.getMonth()
      const day = jobDate.getDate()
      scheduledDate = new Date(year, month, day, 0, 0, 0, 0)
    }

    const serviceName = jobData.service?.name || jobData.serviceName || jobData.title || "";

    // Determinar si el servicio es predeterminado o personalizado
    const isPredetermined = predeterminedServices.includes(serviceName);

    const initialFormData = {
      description: jobData.description || "",
      clientId: jobData.client?.id || jobData.clientId || "",
      serviceName: serviceName,
      companyId: jobData.companyId || "sin-empresa",
      assignedToId: jobData.technician?.id || jobData.technicianId || "tecnico-generico",
      scheduledAt: scheduledDate,
      startTime: jobData.startTime || "",
      endTime: jobData.endTime || "",
      totalBudget: jobData.totalBudget !== null && jobData.totalBudget !== undefined && jobData.totalBudget > 0 ? String(jobData.totalBudget) : ""
    };

    const finalFormData = {
      ...initialFormData,
      serviceId: jobData.serviceId || ""
    };
    setFormData(finalFormData);

    // Configurar el tipo de servicio
    setServiceType(isPredetermined ? "predetermined" : "custom");
    setSelectedPredeterminedService(isPredetermined ? serviceName : "");

    // Establecer nombres de elementos seleccionados
    setSelectedClientName(jobData.client?.name || "");
    setSelectedCompanyName(jobData.company?.name || "");
    setSelectedTechnicianName(jobData.technician?.name || "");

    setErrors({})
    clearValidation()
  }, [clearValidation, predeterminedServices])

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
  }, [])

  // Actualizar formulario cuando se edita un trabajo
  useEffect(() => {
    if (job) {
      // Esperar un poco para asegurar que los datos estén cargados
      setTimeout(() => {
        initializeFormWithJob(job);
      }, 100);
    } else {
      // Si no hay trabajo, limpiar el formulario
      setFormData({
        description: "",
        clientId: "",
        serviceName: "",
        serviceId: "",
        companyId: "sin-empresa",
        assignedToId: "tecnico-generico",
        scheduledAt: null,
        startTime: "",
        endTime: "",
        totalBudget: ""
      });
      setSelectedClientName("");
      setSelectedCompanyName("");
      setSelectedTechnicianName("");
      setServiceType("predetermined");
      setSelectedPredeterminedService("");
    }
  }, [job, initializeFormWithJob])

  const loadAllData = useCallback(async () => {
    setLoadingData(true)

    try {
      // Cargar en paralelo para mayor velocidad
      const [clientsRes, techniciansRes] = await Promise.all([
        fetch("/api/clients").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
        fetch("/api/workers/technicians").catch(() => ({ ok: false, json: () => Promise.resolve([]) }))
      ])

      const clientsData = await clientsRes.json()
      const techniciansData = await techniciansRes.json()

      // Filtrar solo clientes activos para agendamiento
      const activeClients = (clientsData || []).filter((client: any) => client.status === 'active');

      // Eliminar duplicados por nombre (mantener el más reciente)
      const uniqueClients = activeClients.reduce((acc: any[], current: any) => {
        const existingIndex = acc.findIndex(client =>
          client.name.toLowerCase().trim() === current.name.toLowerCase().trim()
        );

        if (existingIndex === -1) {
          // No existe, agregar
          acc.push(current);
        } else {
          // Existe, mantener el más reciente (comparar por fecha de creación)
          const existing = acc[existingIndex];
          const currentDate = new Date(current.createdAt);
          const existingDate = new Date(existing?.createdAt || '');

          if (currentDate > existingDate) {
            acc[existingIndex] = current;
          }
        }

        return acc;
      }, []);

      setClients(uniqueClients);

      // Filtrar técnicos activos y excluir roles no técnicos con filtrado robusto
      const filteredTechnicians = (techniciansData || []).filter((tech: any) => {
        // Verificar que esté activo
        if (tech.isActive === false) return false;

        // Manejar tanto estructura plana como anidada del rol
        const roleName = typeof tech.role === 'string' ? tech.role : tech.role?.name || '';

        // Filtrar SOLO técnicos, excluyendo administradores y secretarias
        const isTechnician = (
          roleName === 'TECNICO' ||
          roleName === 'tecnico' ||
          roleName === 'Técnico' ||
          roleName === 'Trabajador' ||
          roleName === 'TRABAJADOR'
        );

        const isNotAdminOrSecretary = (
          roleName !== 'ADMINISTRADOR' &&
          roleName !== 'Administrador' &&
          roleName !== 'SECRETARIA' &&
          roleName !== 'Secretaria' &&
          roleName !== 'ADMIN' &&
          roleName !== 'Admin'
        );

        // Filtrar también por nombre para excluir usuarios con nombres de secretarias/administradores
        const name = tech.name?.toLowerCase() || '';
        const isNotAdminOrSecretaryByName = (
          !name.includes('administrador') &&
          !name.includes('admin') &&
          !name.includes('secretaria') &&
          !name.includes('secretary')
        );

        return (
          isTechnician &&
          isNotAdminOrSecretary &&
          isNotAdminOrSecretaryByName &&
          tech.name &&
          tech.name.trim() !== ''
        );
      });

      // Log para debugging
      setTechnicians(filteredTechnicians);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    window.addEventListener('closeModal', handleCloseModal);
    return () => {
      window.removeEventListener('closeModal', handleCloseModal);
    };
  }, [handleCloseModal]);

  // Función para manejar cambios en el formulario
  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar errores del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  // Función para manejar cambios en los datos del cliente nuevo
  const handleClientDataChange = useCallback((field: string, value: string) => {
    setNewClientData(prev => ({ ...prev, [field]: value }));

    // Limpiar errores del campo
    if (clientErrors[field]) {
      setClientErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [clientErrors]);

  // Función para cambiar el tipo de servicio
  const handleServiceTypeChange = useCallback((type: "predetermined" | "custom") => {
    setServiceType(type);
    if (type === "predetermined") {
      setFormData(prev => ({ ...prev, serviceName: "" }));
    } else {
      setSelectedPredeterminedService("");
    }
  }, []);

  // Función para calcular el progreso del formulario
  const getFormProgress = useCallback(() => {
    const requiredFields = ['clientId', 'serviceName', 'scheduledAt'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'scheduledAt') return formData[field as keyof typeof formData];
      return formData[field as keyof typeof formData];
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  // Función para obtener el estado de un campo
  const getFieldStatus = useCallback((field: string) => {
    if (errors[field]) return "error";
    if (formData[field as keyof typeof formData]) return "success";
    return "default";
  }, [errors, formData]);

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validaciones básicas
      const newErrors: Record<string, string> = {};

      if (!formData.clientId && !showNewClientForm) {
        newErrors.clientId = "Debe seleccionar un cliente";
      }

      if (!formData.serviceName) {
        newErrors.serviceName = "Debe especificar el servicio";
      }

      if (!formData.scheduledAt) {
        newErrors.scheduledAt = "Debe seleccionar una fecha";
      }

      // Si se está creando un cliente nuevo, validar sus datos
      if (showNewClientForm) {
        if (!newClientData.name.trim()) {
          newErrors.clientName = "El nombre del cliente es requerido";
        }
        if (!newClientData.phone.trim()) {
          newErrors.clientPhone = "El teléfono del cliente es requerido";
        }
        if (!newClientData.address.trim()) {
          newErrors.clientAddress = "La dirección del cliente es requerida";
        }
        if (newClientData.email && !/\S+@\S+\.\S+/.test(newClientData.email)) {
          newErrors.clientEmail = "Email del cliente inválido";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      let clientId = formData.clientId;

      // Si se está creando un cliente nuevo, crearlo primero
      if (showNewClientForm) {
        try {
          const clientResponse = await fetch('/api/clients', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: newClientData.name.trim(),
              email: newClientData.email.trim() || null,
              phone: newClientData.phone.trim(),
              address: newClientData.address.trim(),
              region: newClientData.region || null,
              commune: newClientData.commune || null,
              rut: newClientData.rut.trim() || null,
              company: null,
              status: 'active'
            }),
          });

          if (!clientResponse.ok) {
            const errorData = await clientResponse.json();
            throw new Error(errorData.message || errorData.error || 'Error al crear el cliente');
          }

          const newClient = await clientResponse.json();
          clientId = newClient.id;
          // Actualizar la lista de clientes localmente
          setClients(prev => [...prev, newClient]);

        } catch (clientError) {
          console.error('❌ Error al crear cliente:', clientError);
          let errorMessage = 'Error desconocido';

          if (clientError instanceof Error) {
            // Si el error contiene "Datos inválidos", mostrar detalles específicos
            if (clientError.message.includes('Datos inválidos')) {
              errorMessage = 'Por favor, verifica que todos los campos requeridos estén completos y tengan el formato correcto';
            } else if (clientError.message.includes('email')) {
              errorMessage = 'El email ya está registrado o tiene un formato inválido';
            } else if (clientError.message.includes('teléfono')) {
              errorMessage = 'El formato del teléfono no es válido (formato chileno: 9 XXXX XXXX)';
            } else if (clientError.message.includes('RUT')) {
              errorMessage = 'El formato del RUT no es válido';
            } else {
              errorMessage = clientError.message;
            }
          }

          setErrors({ clientCreation: `Error al crear cliente: ${errorMessage}` });
          return;
        }
      }

      // Validar que todos los campos requeridos estén presentes
      if (!formData.companyId) {
        setErrors({ companyId: "Debe seleccionar una empresa" });
        return;
      }

      if (!formData.serviceId && !formData.serviceName) {
        setErrors({ serviceId: "Debe seleccionar un servicio" });
        return;
      }

      // Preparar datos para envío
      const submitData = {
        ...formData,
        clientId: clientId, // Usar el ID del cliente creado o existente
        title: formData.serviceName, // Usar el nombre del servicio como título
        technicianId: formData.assignedToId !== "tecnico-generico" ? formData.assignedToId : null,
        totalBudget: formData.totalBudget ? Number(formData.totalBudget) : null,
        companyId: formData.companyId,
        scheduledAt: formData.scheduledAt ? formData.scheduledAt.toISOString() : null,
      };

      // Log de datos para debugging
      onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: "Error al enviar el formulario" });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, showNewClientForm, newClientData, setClients]);

  // Función para cancelar
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Función para limpiar el formulario
  const handleClearForm = useCallback(() => {
    setFormData({
      description: "",
      clientId: "",
      serviceName: "",
      serviceId: "",
      companyId: "sin-empresa",
      assignedToId: "tecnico-generico",
      scheduledAt: null,
      startTime: "",
      endTime: "",
      totalBudget: ""
    });
    setSelectedClientName("");
    setSelectedCompanyName("");
    setSelectedTechnicianName("");
    setServiceType("predetermined");
    setSelectedPredeterminedService("");
    setErrors({});
    setClientErrors({});
    setShowNewClientForm(false);
    setNewClientData({
      name: "",
      email: "",
      phone: "",
      address: "",
      rut: "",
      region: "",
      commune: ""
    });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header del formulario */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {job ? 'Editar Trabajo' : 'Programar Nuevo Trabajo'}
              </h2>
              <p className="text-blue-100 text-sm">
                {job ? 'Modifica los datos del trabajo existente' : 'Completa la información para programar un nuevo trabajo'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-white/20"
            aria-label="Cerrar formulario"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="bg-white rounded-b-2xl p-6">
        {loadingData && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-base text-slate-600 font-medium">Cargando datos...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Barra de progreso mejorada */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">Progreso del formulario</span>
              <span className="text-sm font-bold text-blue-600">{getFormProgress()}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${getFormProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Cliente y Empresa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <Label className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-3">
                <div className="bg-blue-600 rounded-lg p-1">
                  <User className="h-4 w-4 text-white" />
                </div>
                Cliente
                <span className="text-red-500">*</span>
              </Label>
              {!showNewClientForm ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Select
                      value={formData.clientId}
                      onValueChange={(value: string) => handleChange("clientId", value)}
                      disabled={loadingData}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-12 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200",
                          "focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                          getFieldStatus("clientId") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                          getFieldStatus("clientId") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                        )}
                      >
                        <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar cliente"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white">
                        {clients.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No hay clientes disponibles
                          </div>
                        ) : (
                          clients.map((client: any) => (
                            <SelectItem key={client.id} value={client.id} className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>{client.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {getFieldStatus("clientId") === "success" && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewClientForm(true)}
                    className="w-full h-10 text-sm font-medium border-2 border-green-300 text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Cliente Nuevo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-green-800">Nuevo Cliente</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewClientForm(false)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      placeholder="Nombre completo"
                      value={newClientData.name}
                      onChange={(e) => handleClientDataChange("name", e.target.value)}
                      className={cn(
                        "h-10 text-sm border-2 rounded-lg",
                        clientErrors.name && "border-red-500"
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => handleClientDataChange("email", e.target.value)}
                        className={cn(
                          "h-10 text-sm border-2 rounded-lg",
                          clientErrors.email && "border-red-500"
                        )}
                      />
                      <Input
                        placeholder="Teléfono"
                        value={newClientData.phone}
                        onChange={(e) => handleClientDataChange("phone", e.target.value)}
                        className={cn(
                          "h-10 text-sm border-2 rounded-lg",
                          clientErrors.phone && "border-red-500"
                        )}
                      />
                    </div>
                    <Input
                      placeholder="Dirección"
                      value={newClientData.address}
                      onChange={(e) => handleClientDataChange("address", e.target.value)}
                      className="h-10 text-sm border-2 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="RUT"
                        value={newClientData.rut}
                        onChange={(e) => handleClientDataChange("rut", e.target.value)}
                        className={cn(
                          "h-10 text-sm border-2 rounded-lg",
                          clientErrors.rut && "border-red-500"
                        )}
                      />
                      <Select
                        value={newClientData.region}
                        onValueChange={(value: string) => handleClientDataChange("region", value)}
                      >
                        <SelectTrigger className="h-10 text-sm border-2 rounded-lg">
                          <SelectValue placeholder="Región" />
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
                    {newClientData.region && (
                      <Select
                        value={newClientData.commune}
                        onValueChange={(value: string) => handleClientDataChange("commune", value)}
                      >
                        <SelectTrigger className="h-10 text-sm border-2 rounded-lg">
                          <SelectValue placeholder="Comuna" />
                        </SelectTrigger>
                        <SelectContent>
                          {regionCommuneMap[newClientData.region as keyof typeof regionCommuneMap]?.map((commune: string) => (
                            <SelectItem key={commune} value={commune}>
                              {commune}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {Object.keys(clientErrors).length > 0 && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {Object.values(clientErrors)[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {errors.clientId && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{errors.clientId}</AlertDescription>
                </Alert>
              )}
              {errors.clientCreation && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{errors.clientCreation}</AlertDescription>
                </Alert>
              )}
              {errors.clientName && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{errors.clientName}</AlertDescription>
                </Alert>
              )}
              {errors.clientPhone && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{errors.clientPhone}</AlertDescription>
                </Alert>
              )}
              {errors.clientAddress && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{errors.clientAddress}</AlertDescription>
                </Alert>
              )}
              {errors.clientEmail && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{errors.clientEmail}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Empresa */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <Label className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-3">
                <div className="bg-green-600 rounded-lg p-1">
                  <Building className="h-4 w-4 text-white" />
                </div>
                Empresa
              </Label>
              <div className="relative">
                <Select
                  value={formData.companyId}
                  onValueChange={(value: string) => handleChange("companyId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className="h-10 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white">
                    {availableCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${company.id === 'sin-empresa' ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                          <span>{company.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Servicio */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
            <Label className="text-sm font-semibold text-purple-800 flex items-center gap-2 mb-3">
              <div className="bg-purple-600 rounded-lg p-1">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              Servicio
              <span className="text-red-500">*</span>
            </Label>

            {/* Botones para tipo de servicio */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={serviceType === "predetermined" ? "default" : "outline"}
                onClick={() => handleServiceTypeChange("predetermined")}
                className={cn(
                  "w-full lg:flex-1 h-10 text-sm font-medium transition-all duration-200",
                  serviceType === "predetermined"
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                    : "border-green-300 text-green-700 hover:bg-green-50"
                )}
              >
                Predeterminado
              </Button>
              <Button
                type="button"
                variant={serviceType === "custom" ? "default" : "outline"}
                onClick={() => handleServiceTypeChange("custom")}
                className={cn(
                  "w-full lg:flex-1 h-10 text-sm font-medium transition-all duration-200",
                  serviceType === "custom"
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                    : "border-green-300 text-green-700 hover:bg-green-50"
                )}
              >
                Personalizado
              </Button>
            </div>

            {/* Campo de servicio según el tipo seleccionado */}
            {serviceType === "predetermined" ? (
              <div className="relative">
                <Select
                  value={selectedPredeterminedService}
                  onValueChange={(value: string) => {
                    setSelectedPredeterminedService(value)
                    handleChange("serviceName", value)
                  }}
                  disabled={loadingData}
                >
                  <SelectTrigger
                    className={cn(
                      "h-10 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200",
                      "focus:ring-2 focus:ring-green-100 focus:border-green-500",
                      getFieldStatus("serviceName") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                      getFieldStatus("serviceName") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                    )}
                  >
                    <SelectValue placeholder="Seleccionar servicio predeterminado" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border shadow-2xl max-h-64 z-[9999] bg-white">
                    {predeterminedServices.map((service) => (
                      <SelectItem key={service} value={service} className="py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Wrench className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium">{service}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {getFieldStatus("serviceName") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            ) : (
              <Input
                placeholder="Describe el servicio personalizado..."
                value={formData.serviceName}
                onChange={(e) => handleChange("serviceName", e.target.value)}
                className={cn(
                  "h-10 text-sm border-2 rounded-lg transition-all duration-200",
                  "focus:ring-2 focus:ring-green-100 focus:border-green-500",
                  getFieldStatus("serviceName") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
                  getFieldStatus("serviceName") === "success" && "border-green-500 focus:border-green-500 focus:ring-green-100"
                )}
              />
            )}
            {errors.serviceName && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.serviceName}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Técnico y Fecha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Técnico */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <Label className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-3">
                <div className="bg-orange-600 rounded-lg p-1">
                  <User className="h-4 w-4 text-white" />
                </div>
                Técnico Asignado
              </Label>
              <div className="relative">
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value: string) => handleChange("assignedToId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className="h-10 pl-9 pr-4 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border shadow-lg max-h-48 z-[9999] bg-white">
                    <SelectItem value="tecnico-generico" className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>Sin asignar</span>
                      </div>
                    </SelectItem>
                    {technicians.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay técnicos disponibles
                      </div>
                    ) : (
                      technicians.map((technician: any) => (
                        <SelectItem key={technician.id} value={technician.id} className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{technician.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

          </div>

          {/* Fecha */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
            <Label className="text-sm font-semibold text-indigo-800 flex items-center gap-2 mb-3">
              <div className="bg-indigo-600 rounded-lg p-1">
                <Clock className="h-4 w-4 text-white" />
              </div>
              Fecha Programada
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.scheduledAt ? format(formData.scheduledAt, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                if (e.target.value) {
                  // Parse the date string and create a date in local timezone
                  const dateParts = e.target.value.split('-')
                  if (dateParts.length === 3) {
                    const [year, month, day] = dateParts.map(Number)
                    const date = new Date(year || 0, (month || 1) - 1, day || 1) // month is 0-indexed
                    handleChange("scheduledAt", date)
                  }
                } else {
                  handleChange("scheduledAt", null)
                }
              }}
              min={format(new Date(), "yyyy-MM-dd")}
              className="h-10 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
            {errors.scheduledAt && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.scheduledAt}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Horarios */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-600 rounded-lg p-1">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-teal-800">Horarios del Trabajo</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hora de Inicio */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  Hora de Inicio
                </Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className="h-10 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              {/* Hora de Término */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Hora de Término
                </Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className="h-10 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Presupuesto - Sección Separada y Clara */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 rounded-lg p-2">
                <span className="text-white text-lg">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800">Presupuesto del Trabajo</h3>
                <p className="text-sm text-green-600">Monto fijo en pesos chilenos</p>
              </div>
            </div>
            <div className="relative max-w-md">
              <Input
                type="number"
                placeholder="0"
                value={formData.totalBudget}
                onChange={(e) => handleChange("totalBudget", e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className={cn(
                  "h-12 text-lg border-2 rounded-lg transition-all duration-200 pr-16 font-semibold",
                  "focus:ring-2 focus:ring-green-100 focus:border-green-500",
                  "[-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  getFieldStatus("totalBudget") === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100"
                )}
                style={{ MozAppearance: 'textfield' }}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg text-gray-600 font-bold">CLP</span>
            </div>
            {errors.totalBudget && (
              <Alert variant="destructive" className="py-2 mt-3">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.totalBudget}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Descripción */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
            <Label className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <div className="bg-slate-600 rounded-lg p-1">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              Descripción del Trabajo
            </Label>
            <Textarea
              placeholder="Describe el problema o trabajo a realizar en detalle... (Opcional)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[80px] text-sm border-2 rounded-lg p-3 transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Información del trabajo programado */}
          {formData.serviceName && formData.scheduledAt && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-2 h-full bg-gradient-to-b from-blue-500 to-green-500 rounded-full flex-shrink-0"></div>
                <div className="text-sm text-blue-800 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="font-semibold text-blue-900">📅 Trabajo Programado</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-blue-700">Servicio:</span>
                      <span className="ml-1 text-blue-800">{formData.serviceName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Cliente:</span>
                      <span className="ml-1 text-blue-800">{selectedClientName || clients.find(c => c.id === formData.clientId)?.name}</span>
                    </div>
                    {formData.companyId && formData.companyId !== "sin-empresa" && (
                      <div>
                        <span className="font-medium text-blue-700">Empresa:</span>
                        <span className="ml-1 text-blue-800">{selectedCompanyName || availableCompanies.find(c => c.id === formData.companyId)?.name}</span>
                      </div>
                    )}
                    {(formData.startTime || formData.endTime) ? (
                      <div>
                        <span className="font-medium text-blue-700">Horario:</span>
                        <span className="ml-1 text-blue-800">
                          {formData.startTime && formData.endTime
                            ? `${formData.startTime} - ${formData.endTime}`
                            : formData.startTime || formData.endTime
                          }
                        </span>
                      </div>
                    ) : null}
                    <div>
                      <span className="font-medium text-blue-700">Fecha:</span>
                      <span className="ml-1 text-blue-800">{format(formData.scheduledAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                    </div>
                    {(formData.startTime || formData.endTime) ? (
                      <div>
                        <span className="font-medium text-blue-700">Horario:</span>
                        <span className="ml-1 text-blue-800">
                          {formData.startTime && formData.endTime
                            ? `${formData.startTime} - ${formData.endTime}`
                            : formData.startTime || formData.endTime
                          }
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium text-blue-700">Hora:</span>
                        <span className="ml-1 text-blue-800">{format(formData.scheduledAt, "hh:mm a", { locale: es })}</span>
                      </div>
                    )}
                    {formData.totalBudget && (
                      <div>
                        <span className="font-medium text-green-700">💰 Presupuesto:</span>
                        <span className="ml-1 text-green-800 font-semibold">${Number(formData.totalBudget).toLocaleString("es-CL")}</span>
                      </div>
                    )}
                    {formData.assignedToId !== "tecnico-generico" && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-green-700">✅ Técnico Asignado:</span>
                        <span className="ml-1 text-green-800 font-semibold">{selectedTechnicianName || technicians.find(t => t.id === formData.assignedToId)?.name}</span>
                      </div>
                    )}
                    {formData.description && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-blue-700">📝 Descripción:</span>
                        <span className="ml-1 text-blue-800">{formData.description}</span>
                      </div>
                    )}
                  </div>
                  {formData.assignedToId === "tecnico-generico" && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        ⚠️ <strong>Nota:</strong> El trabajo se creará sin técnico asignado. Puedes asignarlo más tarde desde la agenda.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading || isSubmitting}
                className="flex-1 h-12 text-sm font-semibold border-2 border-slate-300 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              {!job && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  disabled={loading || isSubmitting}
                  className="flex-1 h-12 text-sm font-semibold border-2 border-orange-300 text-orange-700 rounded-xl transition-all duration-200 hover:bg-orange-50 hover:border-orange-400"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || isSubmitting || loadingData}
                className="flex-1 h-12 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{job ? "Actualizar Trabajo" : "Crear Trabajo"}</span>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Error general */}
          {errors.submit && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">{errors.submit}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>

    </div>
  )
}
