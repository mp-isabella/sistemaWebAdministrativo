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

import JobForm from "@/components/forms/job-form-fixed";
import TechnicianAssignmentModal from "@/components/modals/technician-assignment-modal";
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

  // Estado para el modal de asignación de técnicos
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [selectedJobForAssignment, setSelectedJobForAssignment] = useState<Job | null>(null);
  const [isAssigningTechnician, setIsAssigningTechnician] = useState(false);

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
      const response = await fetch(`/api/calendar/jobs?t=${timestamp}&nocache=${Math.random()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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

        // Debug: Mostrar orden de trabajos cargados
        // FORZAR LOGS DE DEBUG - MÁS AGRESIVO

        uniqueJobs.forEach((_job: any, _index: number) => {
          // Debug info available if needed
        });

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

        // Aplicar filtrado robusto para excluir roles incorrectos
        const filteredTechnicians = data.filter((tech: any) => {
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

        setTechnicians(filteredTechnicians);
      } else {
        console.error('Error fetching technicians:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
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

    // Ordenar por fecha de creación (más recientes primero) - con fallback a scheduledAt
    filtered.sort((a, b) => {
      // Usar createdAt si existe, sino usar scheduledAt como fallback
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.scheduledAt);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.scheduledAt);

      const timeA = dateA.getTime();
      const timeB = dateB.getTime();

      // Debug: Mostrar orden de trabajos - FORZADO

      // Ordenar por fecha descendente (más recientes primero)
      return timeB - timeA;
    });

    // Debug: Mostrar orden final - FORZADO

    filtered.forEach((_job, _index) => {
      // Debug info available if needed
    });

    // Forzar actualización del estado
    setFilteredJobs([...filtered]);
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
      const response = await fetch(`/api/jobs/${deletingJobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al eliminar el trabajo');
      }

      const result = await response.json();

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
        message: result.message || 'El trabajo ha sido eliminado correctamente.'
      });
      setShowMessageBox(true);

    } catch (error) {
      console.error('Error deleting job:', error);

      // Mostrar error
      setMessageBoxContent({
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar el trabajo. Inténtalo de nuevo.'
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
      // Log de datos para debugging

      let savedJob;

      if (isEditing && jobToEdit) {
        // Actualizar trabajo existente
        const response = await fetch(`/api/jobs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...jobData,
            id: jobToEdit.id // Asegurar que el ID esté incluido
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Error al actualizar el trabajo';

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // Si no se puede parsear como JSON, usar el texto tal como viene
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
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
          const errorText = await response.text();
          let errorMessage = 'Error al crear el trabajo';

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // Si no se puede parsear como JSON, usar el texto tal como viene
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
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
      console.error('❌ Error al guardar trabajo:', error);

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

  // Función para abrir el modal de asignación de técnicos
  const openTechnicianModal = (job: Job) => {
    setSelectedJobForAssignment(job);
    setShowTechnicianModal(true);
  };

  // Función para asignar técnico desde el modal
  const handleAssignTechnician = async (technicianId: string, technicianName: string) => {
    if (!selectedJobForAssignment) return;

    setIsAssigningTechnician(true);
    try {
      // Llamar a la función de sincronización
      await syncWithCalendar(selectedJobForAssignment.id, technicianId);

      // Agregar notificación de asignación
      addJobNotification({
        jobId: selectedJobForAssignment.id,
        jobTitle: selectedJobForAssignment.title,
        clientName: selectedJobForAssignment.client.name,
        technicianId: technicianId,
        technicianName: technicianName,
        type: 'assigned'
      });

      // Disparar evento personalizado para actualizar el calendario
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('calendarRefresh', {
          detail: { jobId: selectedJobForAssignment.id, technicianId, action: 'assigned' }
        }));
      }

      // Mostrar notificación de éxito
      toast({
        title: "✅ Técnico Asignado",
        description: `El trabajo "${selectedJobForAssignment.title}" ha sido asignado a ${technicianName}`,
      });

      // Cerrar el modal
      setShowTechnicianModal(false);
      setSelectedJobForAssignment(null);

    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al asignar técnico",
        variant: "destructive",
      });
    } finally {
      setIsAssigningTechnician(false);
    }
  };

  // Componente de tarjeta de trabajo completamente responsive
  const JobCard = React.memo(({ job }: { job: Job }) => {
    const statusConfig = getStatusConfig(job.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Header de la tarjeta - Responsive */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                {job.title}
              </h3>
              {job.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {job.description}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {job.technician ? (
                <Badge className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  En Calendario
                </Badge>
              ) : (
                <Badge className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Sin Asignar
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Información del trabajo - Responsive */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-blue-600 font-medium">Cliente</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{job.client.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-green-600 font-medium">Teléfono</p>
                <p className="text-sm font-semibold text-slate-800">{job.client.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <Clock className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-purple-600 font-medium">Horario</p>
                <p className="text-sm font-semibold text-slate-800">
                  {job.startTime && job.endTime
                    ? `${job.startTime} - ${job.endTime}`
                    : new Date(job.scheduledAt).toLocaleString("es-CL", {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'America/Santiago'
                    })
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <Calendar className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-orange-600 font-medium">Fecha</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(job.scheduledAt).toLocaleDateString("es-CL", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'America/Santiago'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {job.description && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700">{job.description}</p>
            </div>
          )}

          {/* Información de Pago - Responsive */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Estado de Pago:</span>
                <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${job.paymentInfo?.isPaid
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {job.paymentInfo?.isPaid ? 'Pagado' : 'Pendiente'}
                </Badge>
              </div>
              {!job.paymentInfo?.isPaid && (
                <Button
                  onClick={() => handleMarkAsPaid(job.id)}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2"
                  size="sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Marcar Pagado
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-xs text-slate-600 font-medium">Presupuesto</p>
                <p className="text-sm font-bold text-slate-800">${job.totalBudget?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-xs text-slate-600 font-medium">Pagado</p>
                <p className="text-sm font-bold text-green-600">${job.paymentInfo?.paidAmount?.toLocaleString() || '0'}</p>
              </div>
              {job.paymentInfo?.isPaid && (
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 font-medium">Método</p>
                  <p className="text-sm font-bold text-slate-800">{job.paymentInfo?.paymentMethod || 'Efectivo'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">{job.service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">{job.technician?.name || "Sin asignar"}</span>
              </div>
            </div>
            <span className="text-xs text-slate-400">ID: {job.id.slice(-8)}</span>
          </div>

          {/* Acciones - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditJob(job)}
              className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              title="Editar trabajo"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>

            {!job.technician && technicians.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => openTechnicianModal(job)}
                title="Asignar técnico"
              >
                <Users className="h-4 w-4" />
                <span>Asignar</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => confirmDelete(job.id)}
              className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              title="Eliminar trabajo"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </Button>
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
                                  onClick={() => openTechnicianModal(job)}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header del Sistema de Gestión de Trabajos - Completamente Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col space-y-4">
            {/* Icono y título principal */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex-shrink-0">
                <Wrench className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Sistema de Gestión de Trabajos
                </h1>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-4">
                  Gestión completa desde la creación hasta la finalización
                </p>
                {/* Características en pila para móviles */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-100">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Control Total</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-100">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Equipo Integrado</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-100">
                    <TrendingUp className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Eficiencia Máxima</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de error mejorada - Responsive */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Error en el Sistema</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vista condicional según el rol del usuario */}
        {userRole === 'admin' || userRole === 'administrador' || userRole === 'secretaria' ? (
          <>
            {/* Sistema Completo de Gestión de Trabajos - Completamente Responsive */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Header del Sistema - Responsive */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4 sm:p-6">
                <div className="flex flex-col space-y-4">
                  {/* Botones de Acción Principales - Responsive Stack */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleNewJob}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Crear Trabajo</span>
                    </Button>

                    <Button
                      onClick={handleExport}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Exportar Excel</span>
                    </Button>

                    <Button
                      onClick={() => fetchJobs()}
                      className="flex-1 sm:flex-none bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span>Recargar</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contenido Principal - Responsive */}
              <div className="p-4 sm:p-6">

                {/* Panel de Filtros Completamente Responsive */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <Filter className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Filtros de Búsqueda</h3>
                      <p className="text-sm text-slate-600">Refina los resultados según tus necesidades</p>
                    </div>
                  </div>

                  {/* Búsqueda por texto - Visible en todos los dispositivos */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Buscar por título, cliente, servicio, técnico..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filtros en pila vertical para móviles, grid para desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Técnico</label>
                      <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                        <SelectTrigger className="w-full py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Empresa</label>
                      <Select value={companyFilter} onValueChange={setCompanyFilter}>
                        <SelectTrigger className="w-full py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Botón para limpiar filtros */}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchText("");
                        setTechnicianFilter("all");
                        setCompanyFilter("all");
                        setSelectedDate("");
                      }}
                      className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>

                {/* Lista de Trabajos - Completamente Responsive */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                          Lista de Trabajos
                        </h3>
                        <p className="text-slate-600 text-sm sm:text-base">
                          Administra todos los aspectos de los trabajos desde esta interfaz centralizada
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {filteredJobs.length} trabajo{filteredJobs.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {/* Vista de cards para móvil, tabla para desktop */}
                    <div className="hidden lg:block">
                      <div className="overflow-x-auto">
                        <AgendaTable data={filteredJobs} />
                      </div>
                    </div>

                    {/* Vista de cards para móvil y tablet */}
                    <div className="lg:hidden">
                      <div className="space-y-4">
                        {filteredJobs.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-6 text-slate-300">
                              <Calendar className="h-full w-full" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-3">No hay trabajos</h3>
                            <p className="text-slate-500 mb-6">No se encontraron trabajos para los filtros seleccionados.</p>
                            <Button
                              onClick={handleNewJob}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                            >
                              <Plus className="h-5 w-5" />
                              Crear Primer Trabajo
                            </Button>
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
            </div>

          </>
        ) : (
          <>
            {/* Vista para técnicos - Completamente Responsive */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Mis Trabajos</h2>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Bienvenido, {currentUser}. Aquí puedes ver tus trabajos programados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Filtros para técnicos - Responsive */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Filtrar por Fecha</h3>
                      <p className="text-sm text-slate-600">Selecciona una fecha específica para ver tus trabajos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="flex-1 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Lista de trabajos del técnico - Responsive */}
                <div className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 text-slate-300">
                        <Calendar className="h-full w-full" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-3">No hay trabajos programados</h3>
                      <p className="text-slate-500 mb-6">No tienes trabajos asignados para los filtros seleccionados.</p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cuadro de diálogo de confirmación de eliminación - Completamente Responsive */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Confirmar Eliminación</h3>
                <button
                  onClick={cancelDelete}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-6">
                  <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                      ¿Estás seguro de que quieres eliminar este trabajo? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteJob}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cuadro de diálogo para mensajes - Completamente Responsive */}
        {showMessageBox && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">{messageBoxContent.title}</h3>
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-96">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {messageBoxContent.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-slate-200">
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para el formulario de nuevo/editar trabajo - Completamente Responsive */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <JobForm
                job={jobToEdit}
                onSubmit={(updatedJob: any) => handleSaveJob(updatedJob)}
                onCancel={() => setShowJobForm(false)}
              />
            </div>
          </div>
        )}

        {/* Modal para asignación de técnicos */}
        <TechnicianAssignmentModal
          isOpen={showTechnicianModal}
          onClose={() => {
            setShowTechnicianModal(false);
            setSelectedJobForAssignment(null);
          }}
          jobTitle={selectedJobForAssignment?.title || ''}
          technicians={technicians}
          onAssign={handleAssignTechnician}
          isAssigning={isAssigningTechnician}
        />
      </div>
    </div>
  );
}

