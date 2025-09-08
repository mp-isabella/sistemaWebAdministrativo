"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Building, Wrench, Plus, Filter, RefreshCw, ChevronLeft, ArrowUp, X, Phone, Mail, MessageCircle, DollarSign, FileText, ChevronRight } from "lucide-react";
import { useResponsive } from "@/hooks/use-responsive";
import ResponsiveContainer, { ResponsiveGrid, ResponsiveFlex } from "@/components/ui/responsive-container";
import ResponsiveModal from "@/components/ui/responsive-modal";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledAt: string;
  startTime: string;
  endTime: string;
  client: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  service: {
    name: string;
    price?: number;
  };
  company: {
    name: string;
    type: string;
  };
  technician?: {
    id: string;
    name: string;
  };
}

interface Technician {
  id: string;
  name: string;
  specialty?: string;
}

export default function ResponsiveCalendar() {
  const { data: session } = useSession();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTechnician, setSelectedTechnician] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassigningJob, setReassigningJob] = useState<Job | null>(null);
  const [selectedNewTechnician, setSelectedNewTechnician] = useState<string>("");
  const [isReassigning, setIsReassigning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Generar horarios de 8:00 a 19:00
  const timeSlots = [];
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Función para obtener el tiempo actual en Chile
  const getCurrentTimeInChile = () => {
    return new Date().toLocaleString("en-US", { timeZone: "America/Santiago" });
  };

  // Función para obtener el horario actual en formato HH:00
  const getCurrentHourSlot = () => {
    const chileTime = new Date(getCurrentTimeInChile());
    const hour = chileTime.getHours();
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Función para verificar si un horario es el actual
  const isCurrentTimeSlot = (time: string) => {
    const currentHourSlot = getCurrentHourSlot();
    return time === currentHourSlot;
  };

  // Actualizar el tiempo actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar trabajos
      const jobsResponse = await fetch('/api/calendar/jobs');
      if (!jobsResponse.ok) {
        throw new Error('Error al cargar trabajos');
      }
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);

      // Cargar técnicos
      const techniciansResponse = await fetch('/api/workers');
      if (techniciansResponse.ok) {
        const techniciansData = await techniciansResponse.json();
        setTechnicians(techniciansData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar trabajos
  const filteredJobs = jobs.filter(job => {
    const matchesTechnician = selectedTechnician === "todos" || job.technician?.id === selectedTechnician;
    const matchesStatus = selectedStatus === "todos" || job.status === selectedStatus;
    const jobDate = new Date(job.scheduledAt);
    const matchesDate = jobDate.toDateString() === selectedDate.toDateString();
    
    return matchesTechnician && matchesStatus && matchesDate;
  });

  // Obtener trabajos por horario
  const getJobsByTimeSlot = (timeSlot: string) => {
    return filteredJobs.filter(job => job.startTime === timeSlot);
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'border-l-green-500';
      case 'MEDIUM': return 'border-l-yellow-500';
      case 'HIGH': return 'border-l-orange-500';
      case 'URGENT': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navegación de fechas
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Manejar clic en trabajo
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  // Manejar reasignación
  const handleReassign = async () => {
    if (!reassigningJob || !selectedNewTechnician) return;

    try {
      setIsReassigning(true);
      const response = await fetch(`/api/jobs/${reassigningJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: selectedNewTechnician })
      });

      if (response.ok) {
        await fetchData();
        setShowReassignModal(false);
        setReassigningJob(null);
        setSelectedNewTechnician("");
      }
    } catch (err) {
      console.error('Error al reasignar trabajo:', err);
    } finally {
      setIsReassigning(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <X className="w-full h-full" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="h-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Header del Calendario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <ResponsiveFlex 
            direction="responsive"
            justify="between"
            align="center"
            gap="md"
          >
            {/* Título y navegación */}
            <div className="space-y-2 sm:space-y-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Calendario de Trabajos
              </h1>
              <ResponsiveFlex 
                direction="responsive"
                align="center"
                gap="sm"
                className="text-sm sm:text-base text-gray-600"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousDay}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium">
                  {formatDate(selectedDate)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextDay}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs sm:text-sm"
                >
                  Hoy
                </Button>
              </ResponsiveFlex>
            </div>

            {/* Botones de acción */}
            <ResponsiveFlex 
              direction="responsive"
              align="center"
              gap="sm"
            >
              {/* Filtros - Solo visible en móvil */}
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>

              <Link href="/dashboard/jobs/new">
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo Trabajo</span>
                </Button>
              </Link>
            </ResponsiveFlex>
          </ResponsiveFlex>

          {/* Filtros - Desktop */}
          {!isMobile && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <ResponsiveGrid 
                cols={{ mobile: 1, tablet: 2, desktop: 3 }}
                gap="md"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Técnico</label>
                  <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los técnicos</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="COMPLETED">Completado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ResponsiveGrid>
            </div>
          )}

          {/* Filtros - Móvil (Collapsible) */}
          {isMobile && showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Técnico</label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los técnicos</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isMobile ? (
            /* Vista móvil - Lista de trabajos */
            <div className="p-3 sm:p-4">
              <div className="space-y-3">
                {timeSlots.map((timeSlot) => {
                  const jobsInSlot = getJobsByTimeSlot(timeSlot);
                  const isCurrent = isCurrentTimeSlot(timeSlot);
                  
                  return (
                    <div key={timeSlot} className="space-y-2">
                      <div className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        isCurrent ? "text-blue-600" : "text-gray-500"
                      )}>
                        <Clock className="w-4 h-4" />
                        {timeSlot}
                        {isCurrent && <Badge variant="secondary" className="text-xs">Ahora</Badge>}
                      </div>
                      
                      {jobsInSlot.length > 0 ? (
                        <div className="space-y-2">
                          {jobsInSlot.map((job) => (
                            <div
                              key={job.id}
                              onClick={() => handleJobClick(job)}
                              className={cn(
                                "p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-gray-50",
                                getPriorityColor(job.priority),
                                "bg-white border border-gray-200"
                              )}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                                    {job.title}
                                  </h3>
                                  <Badge className={cn("text-xs", getStatusColor(job.status))}>
                                    {job.status}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{job.client.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    <span>{job.client.address}</span>
                                  </div>
                                  {job.technician && (
                                    <div className="flex items-center gap-1">
                                      <Wrench className="w-3 h-3" />
                                      <span>{job.technician.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic pl-6">
                          Sin trabajos programados
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Vista desktop - Tabla de calendario */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Hora
                    </th>
                    {technicians.length > 0 ? (
                      technicians.map((tech) => (
                        <th key={tech.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {tech.name}
                        </th>
                      ))
                    ) : (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trabajos
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.map((timeSlot) => {
                    const isCurrent = isCurrentTimeSlot(timeSlot);
                    
                    return (
                      <tr key={timeSlot} className={cn(
                        "hover:bg-gray-50",
                        isCurrent && "bg-blue-50"
                      )}>
                        <td className={cn(
                          "px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200",
                          isCurrent && "text-blue-600"
                        )}>
                          <div className="flex items-center gap-2">
                            {timeSlot}
                            {isCurrent && <Badge variant="secondary" className="text-xs">Ahora</Badge>}
                          </div>
                        </td>
                        
                        {technicians.length > 0 ? (
                          technicians.map((tech) => {
                            const techJobs = getJobsByTimeSlot(timeSlot).filter(job => job.technician?.id === tech.id);
                            
                            return (
                              <td key={tech.id} className="px-4 py-3 border-r border-gray-200">
                                {techJobs.length > 0 ? (
                                  <div className="space-y-2">
                                    {techJobs.map((job) => (
                                      <div
                                        key={job.id}
                                        onClick={() => handleJobClick(job)}
                                        className={cn(
                                          "p-2 rounded border-l-4 cursor-pointer transition-colors hover:bg-gray-100",
                                          getPriorityColor(job.priority),
                                          "bg-white border border-gray-200"
                                        )}
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-start justify-between">
                                            <h4 className="font-medium text-xs text-gray-900 line-clamp-1">
                                              {job.title}
                                            </h4>
                                            <Badge className={cn("text-xs", getStatusColor(job.status))}>
                                              {job.status}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-gray-600 line-clamp-1">
                                            {job.client.name}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 italic">
                                    Sin trabajos
                                  </div>
                                )}
                              </td>
                            );
                          })
                        ) : (
                          <td className="px-4 py-3">
                            {getJobsByTimeSlot(timeSlot).length > 0 ? (
                              <div className="space-y-2">
                                {getJobsByTimeSlot(timeSlot).map((job) => (
                                  <div
                                    key={job.id}
                                    onClick={() => handleJobClick(job)}
                                    className={cn(
                                      "p-2 rounded border-l-4 cursor-pointer transition-colors hover:bg-gray-100",
                                      getPriorityColor(job.priority),
                                      "bg-white border border-gray-200"
                                    )}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-start justify-between">
                                        <h4 className="font-medium text-xs text-gray-900 line-clamp-1">
                                          {job.title}
                                        </h4>
                                        <Badge className={cn("text-xs", getStatusColor(job.status))}>
                                          {job.status}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 line-clamp-1">
                                        {job.client.name}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic">
                                Sin trabajos
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del trabajo */}
      <ResponsiveModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title="Detalles del Trabajo"
        size={isMobile ? "full" : "lg"}
      >
        {selectedJob && (
          <div className="space-y-4 sm:space-y-6">
            {/* Información básica */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {selectedJob.title}
                </h3>
                <Badge className={cn("text-sm", getStatusColor(selectedJob.status))}>
                  {selectedJob.status}
                </Badge>
              </div>
              
              {selectedJob.description && (
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedJob.description}
                </p>
              )}
            </div>

            {/* Información del cliente */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Cliente
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm sm:text-base text-gray-900">{selectedJob.client.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedJob.client.phone}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Dirección</p>
                  <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {selectedJob.client.address}
                  </p>
                </div>
                {selectedJob.client.email && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedJob.client.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del servicio */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Información del Servicio
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Servicio</p>
                  <p className="text-sm sm:text-base text-gray-900">{selectedJob.service.name}</p>
                </div>
                {selectedJob.service.price && (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Precio</p>
                    <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${selectedJob.service.price.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Empresa</p>
                  <p className="text-sm sm:text-base text-gray-900">{selectedJob.company.name}</p>
                </div>
                {selectedJob.technician && (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Técnico</p>
                    <p className="text-sm sm:text-base text-gray-900">{selectedJob.technician.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Horarios */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horarios
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Fecha</p>
                  <p className="text-sm sm:text-base text-gray-900">
                    {new Date(selectedJob.scheduledAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Hora de inicio</p>
                  <p className="text-sm sm:text-base text-gray-900">{selectedJob.startTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Hora de fin</p>
                  <p className="text-sm sm:text-base text-gray-900">{selectedJob.endTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Prioridad</p>
                  <Badge className={cn("text-xs", getPriorityColor(selectedJob.priority))}>
                    {selectedJob.priority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {selectedJob.technician && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setReassigningJob(selectedJob);
                    setShowReassignModal(true);
                    setShowJobModal(false);
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Reasignar Técnico
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowJobModal(false)}
                className="flex-1 sm:flex-none"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Modal de reasignación */}
      <ResponsiveModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reasignar Técnico"
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nuevo Técnico</label>
            <Select value={selectedNewTechnician} onValueChange={setSelectedNewTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar técnico" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowReassignModal(false)}
              disabled={isReassigning}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReassign}
              disabled={isReassigning || !selectedNewTechnician}
              className="flex-1 sm:flex-none"
            >
              {isReassigning ? 'Reasignando...' : 'Reasignar'}
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </ResponsiveContainer>
  );
}
