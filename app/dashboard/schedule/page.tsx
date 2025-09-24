"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEvents } from "@/lib/calendar-events";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileText,
  Filter,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "../styles/dashboard-optimized.css";
import "../styles/schedule-mobile-optimizations.css";

import JobForm from "@/components/forms/job-form";
import useNotifications from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

// Tipos de datos para el proyecto
type UserRole = 'admin' | 'administrador' | 'secretaria' | 'tecnico';
type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  scheduledAt: string;
  startTime?: string;
  endTime?: string;
  clientId?: string;
  serviceId?: string;
  companyId?: string;
  technicianId?: string;
  totalBudget?: number;
  paymentInfo?: {
    isPaid: boolean;
    paidAmount: number;
    paymentMethod: string;
    budget: number;
    status: string;
    method: string;
    amount: number;
  };
  client: {
    id: string;
    name: string;
    phone: string;
    address: string;
    type?: string;
  };
  service: {
    id: string;
    name: string;
    price?: number;
  };
  company?: {
    id: string;
    name: string;
  };
  technician?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Componente principal para la página de la agenda.
 * Renderiza la vista adecuada según el rol del usuario.
 */
export default function AgendaPage() {
  // Obtener la sesión real del usuario
  const { data: session, status } = useSession();

  // Type assertion para el usuario de la sesión
  const userRole = (session?.user as any)?.role?.toLowerCase() as UserRole || 'administrador';
  const userId = (session?.user as any)?.id ?? '';
  const currentUser = (session?.user as any)?.name || 'Usuario';

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
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [technicians, setTechnicians] = useState<any[]>([]);

  // Estados para filtros mejorados
  const [searchText, setSearchText] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [companies, setCompanies] = useState<any[]>([]);

  // Estados para los nuevos cuadros de diálogo
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '' });

  // Estado simple para eliminación
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

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

  // Debounce para evitar múltiples recargas simultáneas
  const fetchJobsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Función para cargar trabajos desde la API
  const fetchJobs = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError("");

      // Usar el mismo endpoint que el calendario para consistencia
      const timestamp = Date.now();
      const response = await fetch(`/api/calendar/jobs?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`Error al cargar los trabajos: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Mapear los datos del calendario al formato esperado por la lista
        const mappedJobs = await Promise.all(result.data.map(async (job: any) => {
          // Cargar información de pago para cada trabajo
          let paymentInfo = {
            isPaid: false,
            paidAmount: 0,
            paymentMethod: 'efectivo',
            budget: job.totalBudget || 0,
            status: 'PENDING',
            method: 'CASH',
            amount: 0
          };

          try {
            const paymentResponse = await fetch(`/api/jobs/${job.id}/payment`);
            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              if (paymentData.hasPayment && paymentData.payment) {
                paymentInfo = {
                  isPaid: paymentData.payment.status === 'PAID',
                  paidAmount: paymentData.payment.status === 'PAID' ? paymentData.payment.amount : 0,
                  paymentMethod: paymentData.payment.method?.toLowerCase() || 'efectivo',
                  budget: paymentData.payment.amount || job.totalBudget || 0,
                  status: paymentData.payment.status,
                  method: paymentData.payment.method,
                  amount: paymentData.payment.amount
                };
              } else {
              }
            }
          } catch (error) {
          }

          return {
            id: job.id,
            title: job.type || job.service?.name || 'Sin título',
            description: job.description || '',
            status: job.status || 'PENDING',
            priority: job.priority || 'MEDIUM',
            scheduledAt: job.scheduledAt || new Date().toISOString(),
            startTime: job.startTime || '08:00',
            endTime: job.endTime || '09:00',
            clientId: job.client?.id,
            serviceId: job.service?.id,
            companyId: job.company?.id,
            technicianId: job.technician?.id,
            totalBudget: job.totalBudget, // ✅ Agregar totalBudget al mapeo
            paymentInfo: paymentInfo, // ✅ Agregar información de pago
            client: job.client ? {
              id: job.client.id,
              name: job.client.name || job.patientName || 'Sin nombre',
              phone: job.client.phone || '',
              address: job.client.address || '',
              type: 'Cliente'
            } : {
              id: 'no-client',
              name: job.patientName || 'Sin cliente',
              phone: '',
              address: '',
              type: 'Cliente'
            },
            service: job.service ? {
              id: job.service.id,
              name: job.service.name || 'Sin servicio',
              price: job.service.price || 0
            } : {
              id: 'no-service',
              name: job.type || 'Sin servicio',
              price: 0
            },
            company: job.company ? {
              id: job.company.id,
              name: job.company.name || 'Sin empresa'
            } : {
              id: 'no-company',
              name: 'Sin empresa'
            },
            technician: job.technician ? {
              id: job.technician.id,
              name: job.technician.name
            } : undefined,
            createdAt: job.scheduledAt || new Date().toISOString(),
            updatedAt: job.scheduledAt || new Date().toISOString(),
          };
        }));

        // Eliminar duplicados antes de establecer el estado
        const uniqueJobs = mappedJobs.filter((job: any, index: number, self: any[]) =>
          index === self.findIndex((j: any) => j.id === job.id)
        )
        // Mostrar notificación si se detectaron duplicados
        if (mappedJobs.length !== uniqueJobs.length) {
          // Mostrar notificación visual si hay duplicados
          if (typeof window !== 'undefined') {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
            notification.innerHTML = `
              <span>⚠️</span>
              <span>Se eliminaron ${mappedJobs.length - uniqueJobs.length} trabajos duplicados</span>
            `;
            document.body.appendChild(notification);

            // Remover notificación después de 4 segundos
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 4000);
          }
        }

        setJobs(uniqueJobs);

        // Cargar empresas después de cargar trabajos
        setTimeout(() => {
          const uniqueCompanies = mappedJobs.reduce((acc: any[], job: any) => {
            if (job.company?.name && !acc.find((c: any) => c.name === job.company?.name)) {
              acc.push({ id: job.company.id, name: job.company.name });
            }
            return acc;
          }, [] as any[]);
          setCompanies(uniqueCompanies);
        }, 100);

        // Solo usar datos reales de la base de datos
      } else {
        setError(result.error || 'Error al cargar los trabajos');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar los trabajos");
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Función helper para recargar datos con debounce
  const debouncedFetchJobs = useCallback(() => {
    if (session && status === "authenticated" && !isFetchingRef.current) {
      // Limpiar timeout anterior si existe
      if (fetchJobsTimeoutRef.current) {
        clearTimeout(fetchJobsTimeoutRef.current);
      }

      // Usar debounce para evitar recargas múltiples simultáneas
      fetchJobsTimeoutRef.current = setTimeout(() => {
        fetchJobs();
      }, 200);
    }
  }, [session, status, fetchJobs]);

  // Función para cargar técnicos desde la API
  const fetchTechnicians = async () => {
    try {
      const response = await fetch("/api/workers/technicians");
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data);
      } else {
      }
    } catch (error) {
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

      // Filtrar por técnico
      if (technicianFilter !== "all" && job.technician?.id !== technicianFilter) return false;

      // Filtrar por empresa
      if (companyFilter !== "all" && job.company?.name !== companyFilter) return false;

      // Filtrar por texto de búsqueda
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          job.title?.toLowerCase().includes(searchLower) ||
          job.client?.name?.toLowerCase().includes(searchLower) ||
          job.client?.phone?.includes(searchText) ||
          job.service?.name?.toLowerCase().includes(searchLower) ||
          job.technician?.name?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.client?.address?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });

    // Ordenar por fecha de creación (más recientes primero) - solo por fecha de creación
    filtered.sort((a, b) => {
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();

      // Ordenar por fecha de creación descendente (más recientes primero)
      return createdB - createdA;
    });

    setFilteredJobs(filtered);
  }, [jobs, selectedDate, technicianFilter, companyFilter, searchText, getLocalDateString]);

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
  }, [jobs, selectedDate, technicianFilter, filterJobs]);

  useEffect(() => {
    // Solo cargar datos si hay sesión
    if (session && status === "authenticated") {
      fetchJobs();
      fetchTechnicians();
    }

    // Escuchar eventos de nuevos trabajos creados
    const handleNewJobEvent = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        debouncedFetchJobs();
      }
    };

    const handleJobUpdated = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        debouncedFetchJobs();
      }
    };

    const handleJobDeleted = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        debouncedFetchJobs();
      }
    };

    const handleJobStatusUpdated = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        debouncedFetchJobs();
      }
    };

    const handlePaymentStatusUpdated = () => {
      // Solo recargar si no estamos ya cargando
      if (!isFetchingRef.current) {
        debouncedFetchJobs();
      }
    };

    // Agregar event listeners
    window.addEventListener('newJobCreated', handleNewJobEvent as EventListener);
    window.addEventListener('jobUpdated', handleJobUpdated as EventListener);
    window.addEventListener('jobDeleted', handleJobDeleted as EventListener);
    window.addEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener);
    window.addEventListener('paymentStatusUpdated', handlePaymentStatusUpdated as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('newJobCreated', handleNewJobEvent as EventListener);
      window.removeEventListener('jobUpdated', handleJobUpdated as EventListener);
      window.removeEventListener('jobDeleted', handleJobDeleted as EventListener);
      window.removeEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener);
      window.removeEventListener('paymentStatusUpdated', handlePaymentStatusUpdated as EventListener);

      // Limpiar timeout pendiente
      if (fetchJobsTimeoutRef.current) {
        clearTimeout(fetchJobsTimeoutRef.current);
      }
    };
  }, [session, status, debouncedFetchJobs, fetchJobs]);

  // Mostrar loading mientras la sesión se carga
  if (status === "loading") {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando agenda...</p>
        </div>
      </div>
    );
  }
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
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))

          throw new Error(errorData.error || 'Error al actualizar el trabajo');
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
          await response.text()

          throw new Error('Error al crear el trabajo');
        }

        savedJob = await response.json();
      }

      // Resetear estados
      setShowJobForm(false);
      setJobToEdit(null);
      setIsEditing(false);

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

      // Recargar datos después de un breve delay para asegurar que la notificación se procese
      setTimeout(() => {
        if (!isFetchingRef.current) {
          debouncedFetchJobs();
        }
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al guardar el trabajo"
      setError(errorMessage);

      // Mostrar error específico al usuario con más detalles
      const errorTitle = isEditing ? 'Error al Actualizar' : 'Error al Guardar'
      const errorDetail = error instanceof Error ? error.message : "Error desconocido al guardar el trabajo"

      setMessageBoxContent({
        title: errorTitle,
        message: errorDetail
      });
      setShowMessageBox(true);
    }
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedDate(""); // Limpiar fecha para ver todos los trabajos
    setTechnicianFilter("all");
  };

  // Función para exportar datos
  const handleExport = () => {
    // Crear contenido HTML para Excel
    const headers = ['Título', 'Cliente', 'Empresa', 'Servicio', 'Técnico', 'Estado', 'Prioridad', 'Fecha Programada', 'Horario', 'Descripción', 'Dirección'];
    const rows = filteredJobs.map(job => [
      job.title,
      job.client.name,
      job.company?.name || 'Sin empresa',
      job.service.name,
      job.technician?.name || 'Sin asignar',
      getStatusConfig(job.status).label,
      getPriorityConfig(job.priority).label,
      new Date(job.scheduledAt).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
      job.startTime && job.endTime ? `${job.startTime} - ${job.endTime}` : 'Sin horario',
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
      // Actualizar el trabajo con el técnico asignado
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ technicianId }),
      });
      if (response.ok) {
        await response.json();
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
        await fetchJobs();
      } else {
        await response.text();
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setError("Error al sincronizar con el calendario");

      // Mostrar error al usuario
      setMessageBoxContent({
        title: 'Error',
        message: `No se pudo asignar el técnico. Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
      setShowMessageBox(true);
    }
  };

  // Función para marcar como pagado
  const handleMarkAsPaid = async (jobId: string) => {
    setIsUpdating(true);
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Trabajo no encontrado');
      }

      const response = await fetch(`/api/jobs/${jobId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPaid: true,
          paymentMethod: 'CASH',
          amount: job.totalBudget || 0
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "✅ Pago Registrado",
          description: result.message || "El trabajo ha sido marcado como pagado.",
        });

        // Actualizar el estado local del trabajo
        setJobs(prevJobs =>
          prevJobs.map(j =>
            j.id === jobId
              ? {
                ...j,
                paymentInfo: j.paymentInfo ? {
                  ...j.paymentInfo,
                  isPaid: true,
                  paidAmount: job.totalBudget || 0,
                  status: 'PAID'
                } : {
                  isPaid: true,
                  paidAmount: job.totalBudget || 0,
                  paymentMethod: 'efectivo',
                  budget: job.totalBudget || 0,
                  status: 'PAID',
                  method: 'CASH',
                  amount: job.totalBudget || 0
                }
              }
              : j
          )
        );

        // Disparar evento personalizado para sincronizar con el calendario
        window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
          detail: {
            jobId,
            isPaid: true,
            amount: job.totalBudget || 0
          }
        }));

        // Recargar datos para asegurar sincronización
        setTimeout(() => {
          if (!isFetchingRef.current) {
            debouncedFetchJobs();
          }
        }, 500);

      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al marcar como pagado');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al marcar como pagado",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para asignar técnico rápidamente desde la tarjeta
  const handleQuickAssign = async (jobId: string, technicianId: string) => {
    // Verificar que el técnico existe
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) {
      setMessageBoxContent({
        title: 'Error',
        message: `Técnico no encontrado. ID: ${technicianId}`
      });
      setShowMessageBox(true);
      return;
    }
    try {
      // Llamar a la función de sincronización
      await syncWithCalendar(jobId, technicianId);

      // Encontrar el trabajo para la notificación
      const job = jobs.find(j => j.id === jobId);

      if (job) {
        // Agregar notificación de asignación
        addJobNotification({
          jobId: job.id,
          jobTitle: job.title,
          clientName: job.client.name,
          technicianId: technician.id,
          technicianName: technician.name,
          type: 'assigned'
        });
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
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al asignar técnico",
        variant: "destructive",
      });
    }
  };

  // Componente de tarjeta de trabajo unificado - Optimizado para móvil
  const JobCard = React.memo(({ job }: { job: Job }) => {
    const statusConfig = getStatusConfig(job.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="dashboard-card-mobile-job mobile-optimized mobile-touch">
        {/* Header de la tarjeta */}
        <div className="dashboard-card-mobile-job-header">
          <div className="flex-1 min-w-0">
            <h3 className="dashboard-card-mobile-job-title">
              {job.title}
            </h3>
          </div>
          <div className="dashboard-card-mobile-job-status">
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

        {/* Información del trabajo */}
        <div className="dashboard-card-mobile-job-info">
          <div className="dashboard-card-mobile-job-info-item">
            <User className="h-4 w-4 text-blue-500" />
            <span className="truncate">{job.client.name}</span>
          </div>
          <div className="dashboard-card-mobile-job-info-item">
            <Phone className="h-4 w-4 text-green-500" />
            <span className="truncate">{job.client.phone}</span>
          </div>
          <div className="dashboard-card-mobile-job-info-item">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="truncate">
              {job.startTime && job.endTime
                ? `${job.startTime} - ${job.endTime}`
                : new Date(job.scheduledAt).toLocaleString("es-CL", {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'America/Santiago'
                })
              }
            </span>
          </div>
          <div className="dashboard-card-mobile-job-info-item">
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

        {/* Descripción */}
        {job.description && (
          <div className="dashboard-card-mobile-job-description">
            {job.description}
          </div>
        )}

        {/* Información de Pago */}
        <div className="dashboard-card-mobile-job-payment">
          <div className="dashboard-card-mobile-job-payment-header">
            <span className="dashboard-card-mobile-job-payment-status">Estado de Pago:</span>
            <div className="flex items-center gap-2">
              <Badge className={
                job.paymentInfo?.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }>
                {job.paymentInfo?.isPaid ? 'Pagado' : 'Pendiente'}
              </Badge>
              {!job.paymentInfo?.isPaid && (
                <Button
                  onClick={() => handleMarkAsPaid(job.id)}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                  size="sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar Pagado
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          <div className="dashboard-card-mobile-job-payment-info">
            <div className="dashboard-card-mobile-job-payment-item">
              <span className="dashboard-card-mobile-job-payment-item-label">Presupuesto:</span>
              <span className="dashboard-card-mobile-job-payment-item-value">${job.totalBudget?.toLocaleString() || '0'}</span>
            </div>
            <div className="dashboard-card-mobile-job-payment-item">
              <span className="dashboard-card-mobile-job-payment-item-label">Pagado:</span>
              <span className="dashboard-card-mobile-job-payment-item-value text-green-600">${job.paymentInfo?.paidAmount?.toLocaleString() || '0'}</span>
            </div>
            {job.paymentInfo?.isPaid && (
              <div className="dashboard-card-mobile-job-payment-item col-span-2">
                <span className="dashboard-card-mobile-job-payment-item-label">Método:</span>
                <span className="dashboard-card-mobile-job-payment-item-value">{job.paymentInfo?.paymentMethod || 'Efectivo'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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

        {/* Acciones */}
        <div className="dashboard-card-mobile-job-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditJob(job)}
            className="dashboard-button dashboard-button-secondary mobile-touch-target"
            title="Editar trabajo"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {!job.technician && technicians.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="dashboard-button dashboard-button-success mobile-touch-target"
              onClick={() => {
                // Modal simple para asignar técnico
                const modal = document.createElement('div');
                modal.className = 'agenda-modal-overlay';
                modal.innerHTML = `
                  <div class="agenda-modal">
                    <div class="agenda-modal-header">
                      <h3 class="agenda-modal-title">Asignar Técnico</h3>
                      <button class="agenda-modal-close" id="close-modal">
                        <X class="h-5 w-5" />
                      </button>
                    </div>
                    <div class="agenda-modal-content">
                      <p class="text-gray-600 mb-4">Selecciona un técnico para: <strong>${job.title}</strong></p>
                      <div class="space-y-2">
                        ${technicians.map((t) => `
                          <button 
                            class="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors technician-option mobile-touch-target" 
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
            className="dashboard-button dashboard-button-danger mobile-touch-target"
            title="Eliminar trabajo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
            {technicianFilter !== "all" || selectedDate
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
            {(technicianFilter !== "all" || selectedDate) && (
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

    // Función para agrupar trabajos por año y mes
    const groupJobsByYearMonth = (jobs: Job[]) => {
      const grouped = jobs.reduce((acc, job) => {
        const date = new Date(job.scheduledAt);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;

        if (!acc[key]) {
          acc[key] = {
            year,
            month,
            jobs: []
          };
        }
        acc[key].jobs.push(job);
        return acc;
      }, {} as Record<string, { year: number; month: number; jobs: Job[] }>);

      // Ordenar por año y mes (más reciente primero)
      return Object.values(grouped).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    };

    const groupedJobs = groupJobsByYearMonth(data);

    // Función para cambiar el estado de un trabajo
    const handleStatusChange = async (jobId: string, newStatus: string) => {
      try {
        const response = await fetch('/api/jobs', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: jobId,
            status: newStatus
          }),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el estado');
        }

        // Recargar datos
        await fetchJobs();

        // Mostrar notificación
        toast({
          title: "✅ Estado Actualizado",
          description: "El estado del trabajo ha sido actualizado correctamente",
        });
      } catch (error) {
        toast({
          title: "❌ Error",
          description: "No se pudo actualizar el estado del trabajo",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="space-y-8">
        {groupedJobs.map((group) => (
          <div key={`${group.year}-${group.month}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header del grupo */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {monthNames[group.month]} {group.year}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {group.jobs.length} trabajo{group.jobs.length !== 1 ? 's' : ''} programado{group.jobs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {group.jobs.length} trabajo{group.jobs.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tabla de trabajos del grupo */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Trabajo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Técnico
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {group.jobs
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map((job) => {
                      const statusConfig = getStatusConfig(job.status);

                      return (
                        <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-slate-900 truncate max-w-xs">
                                {job.title}
                              </div>
                              {job.description && (
                                <div className="text-xs text-slate-500 truncate max-w-xs">
                                  {job.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-slate-900">
                                {job.client.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {job.client.phone}
                              </div>
                              <div className="text-xs text-slate-400 truncate max-w-xs">
                                {job.client.address}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-slate-900">
                                {job.company?.name || 'Sin empresa'}
                              </div>
                              {job.company?.name && (
                                <div className="text-xs text-slate-500">
                                  Empresa
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {job.technician ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-medium text-slate-900">
                                    {job.technician.name}
                                  </div>
                                  <Badge className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                    <CalendarDays className="h-3 w-3 mr-1" />
                                    Asignado
                                  </Badge>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-medium text-slate-500">
                                    Sin asignar
                                  </div>
                                  <Badge className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 w-fit">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Sin Asignar
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-slate-900">
                                {new Date(job.scheduledAt).toLocaleDateString("es-CL", {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  timeZone: 'America/Santiago'
                                })}
                              </div>
                              <div className="text-xs text-slate-500">
                                {job.startTime && job.endTime
                                  ? `${job.startTime} - ${job.endTime}`
                                  : new Date(job.scheduledAt).toLocaleString("es-CL", {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                    timeZone: 'America/Santiago'
                                  })
                                }
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={job.status}
                              onChange={(e) => handleStatusChange(job.id, e.target.value)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${statusConfig.color}`}
                            >
                              <option value="PENDING">Pendiente</option>
                              <option value="IN_PROGRESS">En Progreso</option>
                              <option value="COMPLETED">Completado</option>
                              <option value="CANCELLED">Cancelado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditJob(job)}
                                className="h-8 w-8 p-0"
                                title="Editar trabajo"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              {!job.technician && technicians.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Modal simple para asignar técnico
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
                                    modal.innerHTML = `
                                <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                                  <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-bold text-slate-800">Asignar Técnico</h3>
                                    <button class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors" id="close-modal">
                                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <p class="text-slate-600 mb-4">Selecciona un técnico para: <strong>${job.title}</strong></p>
                                  <div class="space-y-2">
                                    ${technicians.map((t) => `
                                      <button 
                                        class="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 technician-option" 
                                        data-technician-id="${t.id}"
                                        data-technician-name="${t.name}"
                                      >
                                        <div class="font-medium text-slate-800">${t.name}</div>
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
                                  className="h-8 w-8 p-0 border-green-300 text-green-700 hover:bg-green-50"
                                  title="Asignar técnico"
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(job.id)}
                                className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                                title="Eliminar trabajo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="agenda-container mobile-optimized">
      <div className="agenda-content">
        {/* Header del Sistema de Gestión de Trabajos - Responsive */}
        <div className="agenda-header">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="agenda-header-icon">
                <Wrench className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="agenda-title">
                  Sistema de Gestión de Trabajos
                </h1>
                <p className="agenda-subtitle">
                  Gestión completa desde la creación hasta la finalización
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mt-2 md:mt-3">
                  <div className="flex items-center gap-1 md:gap-2 text-blue-100">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Control Total</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-blue-100">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Equipo Integrado</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-blue-100">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Eficiencia Máxima</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de error mejorada */}
        {error && (
          <div className="agenda-alert">
            <div className="agenda-alert-content">
              <div className="agenda-alert-icon">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="agenda-alert-text">
                <h3>Error en el Sistema</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vista condicional según el rol del usuario */}
        {userRole === 'admin' || userRole === 'administrador' || userRole === 'secretaria' ? (
          <>
            {/* Sistema Completo de Gestión de Trabajos - Responsive */}
            <div className="dashboard-card">
              {/* Header del Sistema */}
              <div className="dashboard-card-header">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="text-center lg:text-left">
                    <h2 className="dashboard-card-title">
                      Centro de Control de Trabajos
                    </h2>
                    <p className="dashboard-card-subtitle">
                      Gestión integral desde la creación hasta la finalización con seguimiento completo
                    </p>
                  </div>

                  {/* Botones de Acción Principales - Responsive */}
                  <div className="agenda-actions">
                    <Button
                      onClick={handleNewJob}
                      className="agenda-btn-primary mobile-touch-target"
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden sm:inline">Crear Trabajo</span>
                      <span className="sm:hidden">Crear</span>
                    </Button>

                    <Button
                      onClick={handleExport}
                      className="agenda-btn-primary mobile-touch-target"
                    >
                      <Download className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden sm:inline">Exportar Excel</span>
                      <span className="sm:hidden">Exportar</span>
                    </Button>

                    <Button
                      onClick={() => {
                        fetchJobs();
                      }}
                      className="agenda-btn-secondary mobile-touch-target"
                    >
                      <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden sm:inline">Recargar Datos</span>
                      <span className="sm:hidden">Recargar</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contenido Principal */}
              <div className="p-6">

                {/* Panel de Filtros Mejorado - Responsive */}
                <div className="agenda-filters">
                  <div className="agenda-filters-header">
                    <div className="agenda-filters-icon">
                      <Filter className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="agenda-filters-title">
                      Filtros de Búsqueda
                    </h3>
                    <p className="agenda-filters-subtitle">
                      Refina los resultados según tus necesidades
                    </p>
                  </div>

                  {/* Búsqueda por texto - Hidden on tablet and mobile */}
                  <div className="agenda-filter-group hidden lg:block">
                    <label className="agenda-filter-label">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Buscar por título, cliente, servicio, técnico, descripción..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="agenda-filter-input pl-10 w-full mobile-touch-target"
                      />
                    </div>
                  </div>

                  {/* Filtros en grid responsive */}
                  <div className="agenda-filters-grid">
                    <div className="agenda-filter-group">
                      <label className="agenda-filter-label">Técnico</label>
                      <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                        <SelectTrigger className="agenda-filter-select mobile-touch-target">
                          <SelectValue placeholder="Todos los técnicos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los técnicos</SelectItem>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="agenda-filter-group">
                      <label className="agenda-filter-label">Empresa</label>
                      <Select value={companyFilter} onValueChange={setCompanyFilter}>
                        <SelectTrigger className="agenda-filter-select mobile-touch-target">
                          <SelectValue placeholder="Todas las empresas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las empresas</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.name}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="agenda-filter-group">
                      <label className="agenda-filter-label">Fecha</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="agenda-filter-input mobile-touch-target"
                      />
                    </div>
                  </div>

                  {/* Botón para limpiar filtros */}
                  <div className="agenda-filter-clear">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchText("");
                        setTechnicianFilter("all");
                        setCompanyFilter("all");
                        setSelectedDate("");
                      }}
                      className="agenda-btn-clear mobile-touch-target"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>

                {/* Tabla de Gestión de Trabajos - Responsive */}
                <div className="agenda-table-container">
                  <div className="agenda-table-header">
                    <h3 className="agenda-table-title">
                      Lista de Trabajos - Gestión Completa
                    </h3>
                    <p className="agenda-table-subtitle">
                      Administra todos los aspectos de los trabajos desde esta interfaz centralizada
                    </p>
                  </div>

                  {/* Vista de cards para móvil, tabla para desktop */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto mobile-scroll">
                      <AgendaTable data={filteredJobs} />
                    </div>
                  </div>

                  {/* Vista de cards para móvil */}
                  <div className="md:hidden">
                    <div className="space-y-3">
                      {filteredJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                            <Calendar className="h-full w-full" />
                          </div>
                          <h3 className="text-lg font-medium text-slate-600 mb-2">No hay trabajos</h3>
                          <p className="text-slate-500">No se encontraron trabajos para los filtros seleccionados.</p>
                        </div>
                      ) : (
                        filteredJobs.map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </>
        ) : (
          <>
            {/* Vista para técnicos - Lista de trabajos - Responsive */}
            <div className="agenda-technician-view">
              <div className="agenda-technician-header">
                <div className="agenda-technician-icon">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h2 className="agenda-technician-title">Mis Trabajos</h2>
                <p className="agenda-technician-subtitle">
                  Bienvenido, {currentUser}. Aquí puedes ver tus trabajos programados.
                </p>
              </div>

              {/* Filtros para técnicos - Responsive */}
              <div className="agenda-filters">
                <div className="agenda-filter-group">
                  <label className="agenda-filter-label">Filtrar por fecha</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="agenda-filter-input mobile-touch-target"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de trabajos del técnico - Responsive */}
              <div className="space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                      <Calendar className="h-full w-full" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No hay trabajos programados</h3>
                    <p className="text-slate-500">No tienes trabajos asignados para los filtros seleccionados.</p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Cuadro de diálogo de confirmación de eliminación - Responsive */}
        {showDeleteConfirm && (
          <div className="agenda-modal-overlay">
            <div className="agenda-modal mobile-optimized">
              <div className="agenda-modal-header">
                <h3 className="agenda-modal-title">Confirmar Eliminación</h3>
                <button
                  onClick={cancelDelete}
                  className="agenda-modal-close mobile-touch-target"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="agenda-modal-content">
                <p className="mobile-readable">¿Estás seguro de que quieres eliminar el trabajo? Esta acción no se puede deshacer.</p>
              </div>
              <div className="agenda-modal-footer">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cancelDelete}
                    className="agenda-btn-secondary flex-1 mobile-touch-target"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteJob}
                    className="agenda-btn-primary flex-1 bg-red-600 hover:bg-red-700 mobile-touch-target"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cuadro de diálogo para mensajes del calendario - Responsive */}
        {showMessageBox && (
          <div className="agenda-modal-overlay">
            <div className="agenda-modal mobile-optimized">
              <div className="agenda-modal-header">
                <h3 className="agenda-modal-title">{messageBoxContent.title}</h3>
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="agenda-modal-close mobile-touch-target"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="agenda-modal-content mobile-scroll">
                <pre className="whitespace-pre-wrap font-sans text-gray-600 mobile-readable">{messageBoxContent.message}</pre>
              </div>
              <div className="agenda-modal-footer">
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="agenda-btn-primary w-full mobile-touch-target"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para el formulario de nuevo/editar trabajo - Responsive */}
        {showJobForm && (
          <div className="agenda-modal-overlay">
            <div className="agenda-modal notebook-modal mobile-optimized">
              <div className="agenda-modal-header flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="agenda-modal-title">
                      {isEditing ? 'Editar Trabajo' : 'Programar Nuevo Trabajo'}
                    </h2>
                    <p className="text-slate-600 text-xs md:text-sm">
                      {isEditing ? 'Modifica los detalles del trabajo existente' : 'Completa el formulario para programar un nuevo trabajo'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJobForm(false)}
                  className="agenda-modal-close mobile-touch-target"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="agenda-modal-content flex-1 overflow-y-auto mobile-scroll">
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

