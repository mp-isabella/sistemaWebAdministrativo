"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CalendarEvents } from "@/lib/calendar-events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  CalendarDays,
  Wrench,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  Zap
} from 'lucide-react';

import JobForm from "@/components/forms/job-form";
import useNotifications from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

// Tipos de datos para el proyecto
type UserRole = 'admin' | 'secretaria' | 'tecnico';
type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  scheduledAt: string;
  client: {
    name: string;
    phone: string;
    address: string;
    type?: string;
  };
  service: {
    name: string;
    price?: number;
  };
  technician?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Componente simple para confirmación de eliminación
const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, message }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, message: string }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
      <div className="w-[95vw] max-w-[425px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">
                Confirmar Eliminación
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {message}
          </p>
        </div>
        <div className="flex-1 p-6 flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para reemplazar el "alert" de JavaScript.
const MessageBox = ({ isOpen, onDismiss, title, message }: { isOpen: boolean, onDismiss: () => void, title: string, message: string }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
      <div className="w-[95vw] max-w-[425px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">
                {title}
              </h2>
            </div>
            <button
              onClick={onDismiss}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-gray-600">{message}</pre>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
          <Button onClick={onDismiss} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal para la página de la agenda.
 * Renderiza la vista adecuada según el rol del usuario.
 */
export default function AgendaPage() {
  // Obtener la sesión real del usuario
  const { data: session, status } = useSession();
  
  // Type assertion para el usuario de la sesión
  const userRole = (session?.user as any)?.role?.toLowerCase() as UserRole || 'admin';
  const userId = (session?.user as any)?.id ?? '';
  const [currentUser, setCurrentUser] = useState<string>('Juan Pérez');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado para controlar la visibilidad del formulario de trabajo
  const [showJobForm, setShowJobForm] = useState(false);
  
  // Nuevo estado para la edición de trabajos
  const [isEditing, setIsEditing] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [technicians, setTechnicians] = useState<any[]>([]);
  
  // Estados para los nuevos cuadros de diálogo
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '' });
  
  // Estado simple para eliminación
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Referencias para optimización
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Hook de notificaciones - siempre llamar para mantener consistencia
  const { addJobNotification } = useNotifications(userRole, userId);
  const { toast } = useToast();

  // Función auxiliar para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = useCallback((dateString: string) => {
    const date = new Date(dateString);
    // Usar la zona horaria local de Chile
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayString = useCallback(() => {
    const today = new Date();
    // Usar la zona horaria local de Chile
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Función para cargar trabajos desde la API
  const fetchJobs = async () => {
    try {
      console.log('🔄 Iniciando fetchJobs...');
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/jobs');
      console.log('📡 Respuesta de la API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en la respuesta:', errorText);
        throw new Error(`Error al cargar los trabajos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Número de trabajos:', data.length);
      
      setJobs(data);
    } catch (error) {
      console.error("❌ Error fetching jobs:", error);
      setError(error instanceof Error ? error.message : "Error al cargar los trabajos");
    } finally {
      console.log('🏁 Finalizando fetchJobs, estableciendo loading a false');
      setLoading(false);
    }
  };

  // Función para cargar técnicos desde la API
  const fetchTechnicians = async () => {
    try {
      console.log('🔄 Iniciando fetchTechnicians...');
      const response = await fetch("/api/workers/technicians");
      console.log('📡 Respuesta de técnicos:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Técnicos recibidos:', data);
        setTechnicians(data);
      } else {
        console.error('❌ Error al cargar técnicos:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("❌ Error fetching technicians:", error);
    }
  };

  // Función optimizada para filtrar y agrupar los trabajos por fecha
  const filterJobs = useCallback(() => {
    const filtered = jobs.filter((job) => {
      // Filtrar por fecha (solo si se selecciona una fecha específica)
      if (selectedDate && selectedDate !== '') {
        const jobDate = getLocalDateString(job.scheduledAt);
        if (jobDate !== selectedDate) return false;
      }
      
      // Filtrar por estado
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      
      // Filtrar por técnico
      if (technicianFilter !== "all" && job.technician?.id !== technicianFilter) return false;
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
    return (
          job.title.toLowerCase().includes(searchLower) ||
          job.client.name.toLowerCase().includes(searchLower) ||
          job.service.name.toLowerCase().includes(searchLower) ||
          (job.technician?.name || "").toLowerCase().includes(searchLower) ||
          job.client.address.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    setFilteredJobs(filtered);
  }, [jobs, selectedDate, statusFilter, technicianFilter, searchTerm, getLocalDateString]);

  // Función para agrupar trabajos solo por mes y año
  const groupJobsByMonth = useMemo(() => {
    const groups: Record<string, Job[]> = {};
    
    filteredJobs.forEach(job => {
      // Crear fecha usando la zona horaria local de Chile
      const date = new Date(job.scheduledAt);
      
      // Usar la zona horaria local de Chile para obtener la fecha correcta
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      // Crear la clave usando solo mes y año
      const monthKey = `${year}-${month}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(job);
    });
    
    return groups;
  }, [filteredJobs]);

  // Estadísticas optimizadas con useMemo
  const stats = useMemo(() => {
    const total = jobs.length;
    const pending = jobs.filter(j => j.status === "PENDING").length;
    const inProgress = jobs.filter(j => j.status === "IN_PROGRESS").length;
    const completed = jobs.filter(j => j.status === "COMPLETED").length;
    const cancelled = jobs.filter(j => j.status === "CANCELLED").length;
    const urgent = jobs.filter(j => j.priority === "URGENT").length;
    const today = jobs.filter(j => {
      const jobDate = getLocalDateString(j.scheduledAt);
      const todayString = getTodayString();
      return jobDate === todayString;
    }).length;
    
    // Contar trabajos nuevos (creados en las últimas 24 horas)
    const newJobs = jobs.filter(j => {
      const jobDate = new Date(j.createdAt);
      const now = new Date();
      const diffInHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 24;
    }).length;

    return { total, pending, inProgress, completed, cancelled, urgent, today, newJobs };
  }, [jobs, getLocalDateString, getTodayString]);

  // Optimización: Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      filterJobs();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [jobs, selectedDate, statusFilter, technicianFilter, searchTerm, filterJobs]);

  useEffect(() => {
    // Solo cargar datos si hay sesión
    if (session && status === "authenticated") {
      fetchJobs();
      fetchTechnicians();
    }
    
    // Escuchar eventos de nuevos trabajos creados
    const handleNewJob = () => {
      console.log('🔄 Nuevo trabajo detectado, recargando datos...');
      if (session && status === "authenticated") {
        fetchJobs();
      }
    };
    
    const handleJobUpdated = () => {
      console.log('🔄 Trabajo actualizado, recargando datos...');
      if (session && status === "authenticated") {
        fetchJobs();
      }
    };
    
    const handleJobDeleted = () => {
      console.log('🔄 Trabajo eliminado, recargando datos...');
      if (session && status === "authenticated") {
        fetchJobs();
      }
    };
    
    const handleJobStatusUpdated = () => {
      console.log('🔄 Estado de trabajo actualizado, recargando datos...');
      if (session && status === "authenticated") {
        fetchJobs();
      }
    };
    
    // Agregar event listeners
    window.addEventListener('newJobCreated', handleNewJob);
    window.addEventListener('jobUpdated', handleJobUpdated);
    window.addEventListener('jobDeleted', handleJobDeleted);
    window.addEventListener('jobStatusUpdated', handleJobStatusUpdated);
    
    // Cleanup
    return () => {
      window.removeEventListener('newJobCreated', handleNewJob);
      window.removeEventListener('jobUpdated', handleJobUpdated);
      window.removeEventListener('jobDeleted', handleJobDeleted);
      window.removeEventListener('jobStatusUpdated', handleJobStatusUpdated);
    };
  }, [session, status]);

  // Mostrar loading mientras la sesión se carga
  if (status === "loading") {
    console.log('🔄 Estado de sesión: loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay sesión
  if (status === "unauthenticated" || !session) {
    console.log('❌ Estado de sesión:', status, 'Session:', !!session);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No autorizado</h2>
          <p className="text-slate-600 mb-4">Debes iniciar sesión para acceder a esta página.</p>
          <Button onClick={() => window.location.href = '/login'} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            Ir al Login
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    console.log('🔄 Estado de carga: loading = true');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando agenda...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Renderizando agenda con:', {
    sessionStatus: status,
    hasSession: !!session,
    userRole,
    userId,
    jobsCount: jobs.length,
    loading,
    error
  });



  // Función simple para abrir confirmación de eliminación
  const confirmDelete = (jobId: string) => {
    setDeletingJobId(jobId);
    setShowDeleteConfirm(true);
  };

  // Función simple para cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingJobId(null);
  };

  // Función simple para eliminar trabajo
  const deleteJob = async () => {
    if (!deletingJobId) return;

    try {
      const response = await fetch(`/api/jobs?id=${deletingJobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el trabajo');
      }

      // Cerrar diálogo
      cancelDelete();
      
      // Recargar datos
      await fetchJobs();
      
      // Notificar al calendario
      CalendarEvents.notifyJobDeleted(deletingJobId);
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('jobDeleted', { detail: { id: deletingJobId } }));
      
      // Mostrar mensaje de éxito
      setMessageBoxContent({
        title: 'Éxito',
        message: 'El trabajo ha sido eliminado correctamente.'
      });
      setShowMessageBox(true);
      
    } catch (error) {
      console.error('Error eliminando trabajo:', error);
      
      // Mostrar error
      setMessageBoxContent({
        title: 'Error',
        message: 'No se pudo eliminar el trabajo. Inténtalo de nuevo.'
      });
      setShowMessageBox(true);
      
      // Cerrar diálogo en caso de error
      cancelDelete();
    }
  };







  // Función para alternar expansión de mes
  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // Función para expandir/contraer todo
  const toggleAllExpansion = (expand: boolean) => {
    const monthKeys = Object.keys(groupJobsByMonth);
    
    setExpandedSections(
      monthKeys.reduce((acc, key) => ({ ...acc, [key]: expand }), {})
    );
  };

  // Funciones para obtener colores y etiquetas de estado/prioridad
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED": 
        return { 
          color: "bg-green-100 text-green-800 border-green-200", 
          icon: CheckCircle,
          label: "Completado" 
        };
      case "IN_PROGRESS": 
        return { 
          color: "bg-blue-100 text-blue-800 border-blue-200", 
          icon: Clock,
          label: "En Progreso" 
        };
      case "PENDING": 
        return { 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          icon: AlertCircle,
          label: "Pendiente" 
        };
      case "CANCELLED": 
        return { 
          color: "bg-red-100 text-red-800 border-red-200", 
          icon: X,
          label: "Cancelado" 
        };
      default: 
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: FileText,
          label: status 
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "URGENT": 
        return { 
          color: "bg-red-100 text-red-800 border-red-200", 
          icon: Zap,
          label: "Urgente" 
        };
      case "HIGH": 
        return { 
          color: "bg-orange-100 text-orange-800 border-orange-200", 
          icon: TrendingUp,
          label: "Alta" 
        };
      case "MEDIUM": 
        return { 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          icon: Star,
          label: "Media" 
        };
      case "LOW": 
        return { 
          color: "bg-green-100 text-green-800 border-green-200", 
          icon: CheckCircle,
          label: "Baja" 
        };
      default: 
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: FileText,
          label: priority 
        };
    }
  };



  // Nueva función para iniciar la edición de un trabajo
  const handleEditJob = (job: Job) => {
    setJobToEdit(job);
    setIsEditing(true);
    setShowJobForm(true);
  };

  // Función para abrir el formulario para un nuevo trabajo
  const handleNewJob = () => {
    setJobToEdit(null);
    setIsEditing(false);
    setShowJobForm(true);
  };

  // Manejador para guardar o actualizar un trabajo
  const handleSaveJob = async (jobData: any) => {
    try {
      let savedJob;
      
      if (isEditing && jobToEdit) {
        // Actualizar trabajo existente
        const response = await fetch(`/api/jobs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        });
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Error en respuesta:', errorText)
          throw new Error('Error al actualizar el trabajo');
        }
        
        savedJob = await response.json();
      } else {
        // Crear nuevo trabajo
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        });
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Error en respuesta:', errorText)
          throw new Error('Error al crear el trabajo');
        }
        
        savedJob = await response.json();
      }
      
      // Resetear estados y recargar datos
      setShowJobForm(false);
      setJobToEdit(null);
      setIsEditing(false);
      await fetchJobs();
      
             // Notificar al calendario sobre el nuevo trabajo
       if (isEditing) {
         CalendarEvents.notifyJobUpdated(savedJob);
         
         // Disparar evento personalizado para notificar a otros componentes
         window.dispatchEvent(new CustomEvent('jobUpdated', { detail: savedJob }));
         
         // Agregar notificación de trabajo actualizado
         addJobNotification({
           jobId: savedJob.id,
           jobTitle: savedJob.title,
           clientName: savedJob.client.name,
           technicianId: savedJob.technician?.id,
           technicianName: savedJob.technician?.name,
           type: 'updated'
         });
       } else {
         CalendarEvents.notifyNewJob(savedJob);
         
         // Disparar evento personalizado para notificar a otros componentes
         window.dispatchEvent(new CustomEvent('newJobCreated', { detail: savedJob }));
         
         // Agregar notificación de trabajo creado
         addJobNotification({
           jobId: savedJob.id,
           jobTitle: savedJob.title,
           clientName: savedJob.client.name,
           technicianId: savedJob.technician?.id,
           technicianName: savedJob.technician?.name,
           type: 'created'
         });
       }
      
    } catch (error) {
      console.error('Error saving job:', error);
      setError("Error al guardar el trabajo");
    }
  };

  // Función para obtener los trabajos que aparecen en el calendario
  const getWorkerJobs = (workerName: string) => {
    // Para administradores y secretarias, mostrar todos los trabajos con técnico asignado
    if (userRole === 'admin' || userRole === 'secretaria') {
      return jobs.filter(job => job.technician && job.technician.id);
    }
    // Para técnicos, mostrar solo sus trabajos asignados
    return jobs.filter(job => job.technician?.name === workerName);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedDate(""); // Limpiar fecha para ver todos los trabajos
    setStatusFilter("all");
    setTechnicianFilter("all");
    setSearchTerm("");
  };

  // Función para exportar datos
  const handleExport = () => {
    // Crear contenido HTML para Excel
    const headers = ['Título', 'Cliente', 'Servicio', 'Técnico', 'Estado', 'Prioridad', 'Fecha Programada', 'Descripción', 'Dirección'];
    const rows = filteredJobs.map(job => [
      job.title,
      job.client.name,
      job.service.name,
      job.technician?.name || 'Sin asignar',
      getStatusConfig(job.status).label,
      getPriorityConfig(job.priority).label,
             new Date(job.scheduledAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
      job.description || '',
      job.client.address || ''
    ]);

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Agenda_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para sincronizar trabajos con el calendario
  const syncWithCalendar = async (jobId: string, technicianId: string | null) => {
    try {
      console.log(`🔄 Sincronizando trabajo con calendario:`);
      console.log(`   - Job ID: ${jobId}`);
      console.log(`   - Technician ID: ${technicianId}`);
      
      // Actualizar el trabajo con el técnico asignado
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ technicianId }),
      });
      
      console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const updatedJob = await response.json();
        console.log(`✅ Trabajo actualizado correctamente:`, updatedJob);
        
        // Mostrar notificación de sincronización
        const technician = technicians.find(t => t.id === technicianId);
        const technicianName = technician ? technician.name : 'Técnico';
        
        setMessageBoxContent({
          title: 'Trabajo Asignado',
          message: technicianId 
            ? `El trabajo ha sido asignado a ${technicianName} y ahora aparece en el calendario.`
            : 'El trabajo ha sido desasignado del técnico.'
        });
        setShowMessageBox(true);
        
        // Recargar datos
        console.log(`🔄 Recargando datos...`);
        await fetchJobs();
        console.log(`✅ Datos recargados`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Error en la respuesta: ${errorText}`);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error syncing with calendar:', error);
      setError("Error al sincronizar con el calendario");
      
      // Mostrar error al usuario
      setMessageBoxContent({
        title: 'Error',
        message: `No se pudo asignar el técnico. Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
      setShowMessageBox(true);
    }
  };

  // Función para asignar técnico rápidamente desde la tarjeta
  const handleQuickAssign = async (jobId: string, technicianId: string) => {
    console.log(`🔄 Iniciando asignación rápida:`);
    console.log(`   - Job ID: ${jobId}`);
    console.log(`   - Technician ID: ${technicianId}`);
    
    // Verificar que el técnico existe
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) {
      console.error(`❌ Técnico no encontrado con ID: ${technicianId}`);
      setMessageBoxContent({
        title: 'Error',
        message: `Técnico no encontrado. ID: ${technicianId}`
      });
      setShowMessageBox(true);
      return;
    }
    
    console.log(`✅ Técnico encontrado: ${technician.name}`);
    
    try {
      // Llamar a la función de sincronización
      await syncWithCalendar(jobId, technicianId);
      
      // Encontrar el trabajo para la notificación
      const job = jobs.find(j => j.id === jobId);
      
      if (job) {
        console.log(`✅ Trabajo encontrado: ${job.title}`);
        
        // Agregar notificación de asignación
        addJobNotification({
          jobId: job.id,
          jobTitle: job.title,
          clientName: job.client.name,
          technicianId: technician.id,
          technicianName: technician.name,
          type: 'assigned'
        });
        
        console.log(`✅ Notificación agregada para: ${technician.name}`);
        
        // Disparar evento personalizado para actualizar el calendario
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('calendarRefresh', {
            detail: { jobId, technicianId, action: 'assigned' }
          }));
        }
        
        // Mostrar notificación de éxito
        toast({
          title: "✅ Técnico Asignado",
          description: `El trabajo "${job.title}" ha sido asignado a ${technician.name}`,
        });
      } else {
        console.error(`❌ Trabajo no encontrado con ID: ${jobId}`);
      }
    } catch (error) {
      console.error('❌ Error en asignación rápida:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al asignar técnico",
        variant: "destructive",
      });
    }
  };

    // Componente de tarjeta de trabajo unificado
  const JobCard = React.memo(({ job }: { job: Job }) => {
    const statusConfig = getStatusConfig(job.status);
    const StatusIcon = statusConfig.icon;

         return (
       <div className="dashboard-card hover:shadow-lg transition-all duration-300">
         <div className="dashboard-card-content">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {job.title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge className={`status-badge ${job.status === 'COMPLETED' ? 'status-completed' : job.status === 'IN_PROGRESS' ? 'status-progress' : job.status === 'PENDING' ? 'status-pending' : 'status-cancelled'}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {job.technician ? (
                    <Badge className="status-badge status-calendar">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      En Calendario
                    </Badge>
                  ) : (
                    <Badge className="status-badge status-pending">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Sin Asignar
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{job.client.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span className="truncate">{job.client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="truncate">
                    {new Date(job.scheduledAt).toLocaleString("es-CL", { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'America/Santiago'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="truncate">
                    {new Date(job.scheduledAt).toLocaleDateString("es-CL", { 
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: 'America/Santiago'
                    })}
                  </span>
                </div>
              </div>
              
              {job.description && (
                <p className="text-gray-700 mb-3">{job.description}</p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {job.service.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {job.technician?.name || "Sin asignar"}
                  </span>
                </div>
                <span className="text-gray-400">ID: {job.id.slice(-8)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
                              <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditJob(job)}
                  className="dashboard-button dashboard-button-secondary"
                  title="Editar trabajo"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              
              {!job.technician && technicians.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="dashboard-button dashboard-button-success"
                  onClick={() => {
                    // Modal simple para asignar técnico
                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay';
                    modal.innerHTML = `
                      <div class="modal max-w-md">
                        <div class="modal-header">
                          <h3 class="modal-title">Asignar Técnico</h3>
                          <button class="modal-close" id="close-modal">
                            <X class="h-5 w-5" />
                          </button>
                        </div>
                        <div class="modal-body">
                          <p class="text-gray-600 mb-4">Selecciona un técnico para: <strong>${job.title}</strong></p>
                          <div class="space-y-2">
                            ${technicians.map((t, i) => `
                              <button 
                                class="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors technician-option" 
                                data-technician-id="${t.id}"
                                data-technician-name="${t.name}"
                              >
                                <div class="font-medium">${t.name}</div>
                              </button>
                            `).join('')}
                          </div>
                        </div>
                      </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    const closeBtn = modal.querySelector('#close-modal');
                    const technicianOptions = modal.querySelectorAll('.technician-option');
                    
                    closeBtn?.addEventListener('click', () => {
                      document.body.removeChild(modal);
                    });
                    
                    technicianOptions.forEach(option => {
                      option.addEventListener('click', () => {
                        const technicianId = option.getAttribute('data-technician-id');
                        const technicianName = option.getAttribute('data-technician-name');
                        
                        if (technicianId) {
                          handleQuickAssign(job.id, technicianId);
                        }
                        
                        document.body.removeChild(modal);
                      });
                    });
                    
                    modal.addEventListener('click', (e) => {
                      if (e.target === modal) {
                        document.body.removeChild(modal);
                      }
                    });
                  }}
                  title="Asignar técnico"
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => confirmDelete(job.id)}
                className="dashboard-button dashboard-button-danger"
                title="Eliminar trabajo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  JobCard.displayName = 'JobCard';

  // Componente de tabla para administradores y secretarias con agrupación por fecha
  const AgendaTable: React.FC<{ data: Job[] }> = ({ data }) => {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    if (data.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 text-slate-300">
            <Calendar className="h-full w-full" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-3">No hay trabajos programados</h3>
          <p className="text-slate-500 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
            {searchTerm || statusFilter !== "all" || technicianFilter !== "all" || selectedDate
              ? "No se encontraron trabajos para los filtros seleccionados. Intenta ajustar los criterios de búsqueda."
              : "Comienza programando tu primer trabajo para organizar tus servicios de manera profesional."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleNewJob} 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="mr-3 h-5 w-5" />
              Programar Trabajo
            </Button>
            {(searchTerm || statusFilter !== "all" || technicianFilter !== "all" || selectedDate) && (
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="px-8 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-semibold text-lg rounded-2xl bg-white hover:bg-slate-50 transition-all duration-200"
              >
                <Filter className="mr-3 h-5 w-5" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Controles de expansión mejorados */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Controles de Vista</h3>
                <p className="text-slate-600 text-sm">Gestiona la visualización de los trabajos</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpansion(true)}
                className="px-6 py-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-medium rounded-xl bg-white hover:bg-slate-50 transition-all duration-200"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Expandir Todo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpansion(false)}
                className="px-6 py-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-medium rounded-xl bg-white hover:bg-slate-50 transition-all duration-200"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Contraer Todo
              </Button>
            </div>
          </div>
        </div>

        {/* Trabajos agrupados solo por mes */}
        {Object.entries(groupJobsByMonth)
          .sort(([a], [b]) => b.localeCompare(a)) // Ordenar meses de más reciente a más antiguo
          .map(([monthKey, monthJobs]) => {
            const [year, month] = monthKey.split('-') || ['', ''];
            const monthName = monthNames[parseInt(month || '1') - 1];
            const isMonthExpanded = expandedSections[monthKey] !== false;
            const totalJobsInMonth = monthJobs.length;

            return (
              <div key={monthKey} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 cursor-pointer hover:from-slate-100 hover:to-blue-100 transition-all duration-200" 
                  onClick={() => toggleMonthExpansion(monthKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMonthExpansion(monthKey);
                        }}
                        className="p-2 h-10 w-10 hover:bg-white/50 rounded-xl transition-all duration-200"
                      >
                        {isMonthExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-600" />
                        )}
                      </Button>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          {monthName} {year}
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-full">
                            {totalJobsInMonth} trabajo{totalJobsInMonth !== 1 ? 's' : ''}
                          </span>
                        </h3>
                        <p className="text-slate-600 mt-1">
                          {isMonthExpanded ? 'Haz clic para contraer' : 'Haz clic para expandir'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-600">
                        {isMonthExpanded ? 'Expandido' : 'Contraído'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isMonthExpanded && (
                  <div className="p-6 space-y-4">
                    {monthJobs
                      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                      .map((job) => (
                        <div key={job.id} className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-lg font-bold text-slate-800 truncate">
                                  {job.title}
                                </h4>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Badge className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' : 
                                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                                    job.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                                    'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {getStatusConfig(job.status).label}
                                  </Badge>
                                  {job.technician ? (
                                    <Badge className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border-2 border-blue-300">
                                      <CalendarDays className="h-3 w-3 mr-1" />
                                      En Calendario
                                    </Badge>
                                  ) : (
                                    <Badge className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border-2 border-orange-300">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Sin Asignar
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                  <User className="h-5 w-5 text-blue-600" />
                                  <span className="font-medium">{job.client.name}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                  <Phone className="h-5 w-5 text-green-600" />
                                  <span className="font-medium">{job.client.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                                  <Clock className="h-5 w-5 text-purple-600" />
                                  <span className="font-medium">
                                    {new Date(job.scheduledAt).toLocaleString("es-CL", { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: false,
                                      timeZone: 'America/Santiago'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                                  <Calendar className="h-5 w-5 text-orange-600" />
                                  <span className="font-medium">
                                    {new Date(job.scheduledAt).toLocaleDateString("es-CL", { 
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      timeZone: 'America/Santiago'
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              {job.description && (
                                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                  <p className="text-slate-700 font-medium">{job.description}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                                    <Wrench className="h-4 w-4 text-slate-600" />
                                    <span className="font-medium">{job.service.name}</span>
                                  </span>
                                  <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                                    <Users className="h-4 w-4 text-slate-600" />
                                    <span className="font-medium">{job.technician?.name || "Sin asignar"}</span>
                                  </span>
                                </div>
                                <span className="text-slate-400 font-mono">ID: {job.id.slice(-8)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 ml-6">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditJob(job)}
                                className="h-10 px-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-medium rounded-xl bg-white hover:bg-slate-50 transition-all duration-200"
                                title="Editar trabajo"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              
                              {!job.technician && technicians.length > 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-10 px-4 border-2 border-green-300 hover:border-green-400 text-green-700 hover:text-green-800 font-medium rounded-xl bg-green-50 hover:bg-green-100 transition-all duration-200"
                                  onClick={() => {
                                    // Modal simple para asignar técnico
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
                                    modal.innerHTML = `
                                      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
                                        <div class="flex items-center justify-between mb-4">
                                          <h3 class="text-xl font-bold text-slate-800">Asignar Técnico</h3>
                                          <button class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors" id="close-modal">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                          </button>
                                        </div>
                                        <p class="text-slate-600 mb-6">Selecciona un técnico para: <strong>${job.title}</strong></p>
                                        <div class="space-y-2">
                                          ${technicians.map((t, i) => `
                                            <button 
                                              class="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 technician-option" 
                                              data-technician-id="${t.id}"
                                              data-technician-name="${t.name}"
                                            >
                                              <div class="font-semibold text-slate-800">${t.name}</div>
                                            </button>
                                          `).join('')}
                                        </div>
                                      </div>
                                    `;
                                    
                                    document.body.appendChild(modal);
                                    
                                    const closeBtn = modal.querySelector('#close-modal');
                                    const technicianOptions = modal.querySelectorAll('.technician-option');
                                    
                                    closeBtn?.addEventListener('click', () => {
                                      document.body.removeChild(modal);
                                    });
                                    
                                    technicianOptions.forEach(option => {
                                      option.addEventListener('click', () => {
                                        const technicianId = option.getAttribute('data-technician-id');
                                        const technicianName = option.getAttribute('data-technician-name');
                                        
                                        if (technicianId) {
                                          handleQuickAssign(job.id, technicianId);
                                        }
                                        
                                        document.body.removeChild(modal);
                                      });
                                    });
                                    
                                    modal.addEventListener('click', (e) => {
                                      if (e.target === modal) {
                                        document.body.removeChild(modal);
                                      }
                                    });
                                  }}
                                  title="Asignar técnico"
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Asignar
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmDelete(job.id)}
                                className="h-10 px-4 border-2 border-red-300 hover:border-red-400 text-red-700 hover:text-red-800 font-medium rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200"
                                title="Eliminar trabajo"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  };

  // Componente de calendario para trabajadores
  const WorkerCalendar: React.FC<{ events: Job[] }> = ({ events }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderDays = () => {
      const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      const startingDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
      const days = [];

      // Días vacíos al principio del mes
      for (let i = 0; i < startingDay; i++) {
        days.push(<div key={`empty-${i}`} className="p-2"></div>);
      }

      // Días del mes
      for (let day = 1; day <= totalDays; day++) {
        const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayEvents = events.filter(e => {
          const date = new Date(e.scheduledAt);
          const jobDateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          return jobDateString === dateString;
        });
        const isToday = today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth() && today.getDate() === day;

        days.push(
          <div
            key={day}
            className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
            onClick={() => {
              if (dayEvents.length > 0) {
                const message = dayEvents.map(e => 
                  `• ${new Date(e.scheduledAt).toLocaleTimeString("es-CL", { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                  })}: ${e.title}
Cliente: ${e.client.name}
Técnico: ${e.technician?.name || 'Sin asignar'}
Servicio: ${e.service.name}
Estado: ${getStatusConfig(e.status).label}`
                ).join('\n\n');
                setMessageBoxContent({
                  title: `Trabajos para el ${new Date(dateString).toLocaleDateString('es-CL')}`,
                  message: message
                });
                setShowMessageBox(true);
              }
            }}
          >
            <span className="text-sm font-medium">{day}</span>
            {dayEvents.length > 0 && (
              <div className="event-count">
                {dayEvents.length}
              </div>
            )}
          </div>
        );
      }

      return days;
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

         return (
       <div className="dashboard-card max-w-4xl mx-auto">
         <div className="dashboard-card-header">
           <div className="flex items-center justify-between">
             <span className="flex items-center gap-2">
               <CalendarDays className="h-5 w-5 text-blue-600" />
               <h3 className="dashboard-card-title">Mi Agenda Personal</h3>
             </span>
             <div className="flex items-center gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                 className="dashboard-button dashboard-button-secondary"
               >
                 <ChevronUp className="h-4 w-4 rotate-90" />
               </Button>
               <span className="text-lg font-semibold text-gray-800 min-w-[200px] text-center">
                 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
               </span>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                 className="dashboard-button dashboard-button-secondary"
               >
                 <ChevronDown className="h-4 w-4 rotate-90" />
               </Button>
             </div>
           </div>
         </div>
         <div className="dashboard-card-content">
          <div className="calendar-grid text-center text-gray-600 font-medium mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="py-2 text-sm">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {renderDays()}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página de agenda mejorado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Agenda de Trabajos
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Gestiona y programa los servicios de manera eficiente y profesional
          </p>
        </div>

        {/* Botones de acción mejorados */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {(userRole === 'admin' || userRole === 'secretaria') && (
            <>
              <Button 
                onClick={handleNewJob} 
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="h-6 w-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Programar Trabajo
              </Button>
              <Button 
                onClick={handleExport} 
                variant="outline"
                className="px-8 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-semibold text-lg rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Download className="h-6 w-6 mr-3" />
                Exportar Excel
              </Button>
            </>
          )}
        </div>

        {/* Alerta de error mejorada */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">Error en el Sistema</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista condicional según el rol del usuario */}
        {userRole === 'admin' || userRole === 'secretaria' ? (
          <>
            {/* Filtros mejorados */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                    <Filter className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Filtros y Búsqueda</h2>
                  <p className="text-slate-600">Personaliza la vista de trabajos según tus necesidades</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Fecha</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-12 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedDate('')}
                        size="sm"
                        title="Ver todos los trabajos"
                        className="h-12 px-4 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Buscar trabajo, cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Estado</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-xl bg-white">
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                        <SelectItem value="COMPLETED">Completado</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Técnico</label>
                    <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                      <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium">
                        <SelectValue placeholder="Todos los técnicos" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-xl bg-white">
                        <SelectItem value="all">Todos los técnicos</SelectItem>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="px-8 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-semibold rounded-xl bg-white hover:bg-slate-50 transition-all duration-200"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tabla de trabajos mejorada */}
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-800">Lista de Trabajos Programados</h3>
                  <p className="text-slate-600 mt-1">Gestiona todos los trabajos del sistema</p>
                </div>
                <div className="overflow-x-auto">
                  <AgendaTable data={filteredJobs} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Vista para técnicos */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Mi Agenda Personal</h2>
                  <p className="text-slate-600">
                    Bienvenido, {currentUser}. Aquí puedes ver tus trabajos programados.
                  </p>
                </div>
                <WorkerCalendar events={getWorkerJobs(currentUser)} />
              </div>
            </div>
          </>
        )}

        {/* Cuadro de diálogo de confirmación de eliminación */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onConfirm={deleteJob}
          onCancel={cancelDelete}
          message={`¿Estás seguro de que quieres eliminar el trabajo? Esta acción no se puede deshacer.`}
        />

        {/* Cuadro de diálogo para mensajes del calendario */}
        <MessageBox
          isOpen={showMessageBox}
          onDismiss={() => setShowMessageBox(false)}
          title={messageBoxContent.title}
          message={messageBoxContent.message}
        />

        {/* Modal para el formulario de nuevo/editar trabajo */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 border border-slate-200 min-h-fit">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Trabajo' : 'Programar Nuevo Trabajo'}
                      </h2>
                      <p className="text-slate-600 text-sm">
                        {isEditing ? 'Modifica los detalles del trabajo existente' : 'Completa el formulario para programar un nuevo trabajo'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJobForm(false)}
                    className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <JobForm 
                  job={jobToEdit}
                  onSubmit={(updatedJob) => handleSaveJob(updatedJob)}
                  onCancel={() => setShowJobForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
