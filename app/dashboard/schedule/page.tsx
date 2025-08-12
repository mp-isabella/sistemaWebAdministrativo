'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, MapPin, Phone, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Tipos de datos para el proyecto
type UserRole = 'admin' | 'secretary' | 'worker';
type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH';

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
  };
  service: {
    name: string;
  };
  assignedTo?: {
    name: string;
  };
}

// Datos de prueba para simular la carga desde la API
const mockData: Job[] = [
  {
    id: "JOB-001",
    title: "Detección de Fuga - Urgente",
    description: "Cliente reporta fuga en baño principal",
    status: "PENDING",
    priority: "HIGH",
    scheduledAt: new Date().toISOString(),
    client: {
      name: "María González",
      phone: "+56 9 1234 5678",
      address: "Av. Providencia 1234, Providencia"
    },
    service: {
      name: "Detección de Fugas"
    },
    assignedTo: {
      name: "Juan Pérez"
    }
  },
  {
    id: "JOB-002",
    title: "Video Inspección Programada",
    description: "Inspección rutinaria de cañerías",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    client: {
      name: "Empresa ABC",
      phone: "+56 2 2345 6789",
      address: "Las Condes 567, Las Condes"
    },
    service: {
      name: "Video Inspección"
    },
    assignedTo: {
      name: "Ana Silva"
    }
  },
  {
    id: "JOB-003",
    title: "Destape de Alcantarillado",
    description: "Problema de obstrucción en alcantarillado",
    status: "COMPLETED",
    priority: "HIGH",
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    client: {
      name: "Carlos Rodríguez",
      phone: "+56 9 8765 4321",
      address: "Ñuñoa 890, Ñuñoa"
    },
    service: {
      name: "Destape Alcantarillado"
    },
    assignedTo: {
      name: "Luis Torres"
    }
  }
];

// Componente para reemplazar el "confirm" de JavaScript.
const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, message }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, message: string }) => (
  <Dialog open={isOpen} onOpenChange={onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmación</DialogTitle>
        <DialogDescription>
          {message}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm}>Confirmar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Componente para reemplazar el "alert" de JavaScript.
const MessageBox = ({ isOpen, onDismiss, title, message }: { isOpen: boolean, onDismiss: () => void, title: string, message: string }) => (
  <Dialog open={isOpen} onOpenChange={onDismiss}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          <pre className="whitespace-pre-wrap">{message}</pre>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onDismiss}>Cerrar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/**
 * Componente principal para la página de la agenda.
 * Renderiza la vista adecuada según el rol del usuario.
 */
export default function AgendaPage() {
  // Simulación de rol de usuario y nombre de trabajador
  const [userRole, setUserRole] = useState<UserRole>('admin'); // 'admin', 'secretary', 'worker'
  const [currentUser, setCurrentUser] = useState<string>('Juan Pérez');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar la visibilidad del formulario de trabajo
  const [showJobForm, setShowJobForm] = useState(false);
  
  // Nuevo estado para la edición de trabajos
  const [isEditing, setIsEditing] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  
  // Estados para los nuevos cuadros de diálogo
  const [showConfirm, setShowConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedDate, statusFilter, searchTerm]);

  // Función para simular la carga de trabajos (aquí iría tu llamada a la API)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      setJobs(mockData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Error al cargar los trabajos");
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar los trabajos según los criterios de búsqueda y filtro
  const filterJobs = () => {
    let filtered = jobs.filter((job) => {
      // Filtrar por fecha
      if (selectedDate) {
        const jobDate = new Date(job.scheduledAt).toISOString().split('T')[0];
        if (jobDate !== selectedDate) return false;
      }
      
      // Filtrar por estado
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      
      // Filtrar por término de búsqueda
      if (searchTerm && 
          !job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !job.client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !job.service.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    setFilteredJobs(filtered);
  };

  // Funciones para obtener colores y etiquetas de estado/prioridad
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Completado";
      case "IN_PROGRESS": return "En Progreso";
      case "PENDING": return "Pendiente";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH": return "Alta";
      case "MEDIUM": return "Media";
      case "LOW": return "Baja";
      default: return priority;
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

  // Manejador para guardar o actualizar un trabajo (unificando ambas lógicas)
  const handleSaveJob = async (jobData: Job) => {
    try {
      if (isEditing && jobToEdit) {
        // Lógica para actualizar un trabajo existente
        setJobs(jobs.map(job => job.id === jobToEdit.id ? { ...job, ...jobData } : job));
      } else {
        // Lógica para crear un nuevo trabajo
        const newJobId = `JOB-${jobs.length + 1}`;
        setJobs([...jobs, { ...jobData, id: newJobId }]);
      }
      
      // Resetear estados y recargar datos
      setShowJobForm(false);
      setJobToEdit(null);
      setIsEditing(false);
      await fetchJobs();
      
    } catch (error) {
      console.error('Error saving job:', error);
      setError("Error al guardar el trabajo");
    }
  };

  // Manejador para eliminar un trabajo
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      await fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      setError("Error de conexión al eliminar");
    } finally {
      setShowConfirm(false);
      setJobToDelete(null);
    }
  };

  const confirmDelete = (jobId: string) => {
    setJobToDelete(jobId);
    setShowConfirm(true);
  };

  // Función para obtener los trabajos de un trabajador específico
  const getWorkerJobs = (workerName: string) => {
    return jobs.filter(job => job.assignedTo?.name === workerName);
  };

  // Componente de tabla para administradores y secretarias
  const AgendaTable: React.FC<{ data: Job[] }> = ({ data }) => (
    <div className="grid gap-4">
      {data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos programados</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" || selectedDate
                ? "No se encontraron trabajos para los filtros seleccionados."
                : "No hay trabajos programados para mostrar."}
            </p>
            <Button onClick={handleNewJob} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Programar Trabajo
            </Button>
          </CardContent>
        </Card>
      ) : (
        data.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusLabel(job.status)}
                    </Badge>
                    <Badge className={getPriorityColor(job.priority)}>
                      {getPriorityLabel(job.priority)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{job.client.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{job.client.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{job.client.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(job.scheduledAt).toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                  
                  {job.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{job.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Servicio: {job.service.name}</span>
                    <span>Técnico: {job.assignedTo?.name || "Sin asignar"}</span>
                    <span>ID: {job.id}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => confirmDelete(job.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

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
        const dayEvents = events.filter(e => new Date(e.scheduledAt).toISOString().split('T')[0] === dateString);
        const isToday = today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth() && today.getDate() === day;

        days.push(
          <div
            key={day}
            className={`p-2 border rounded-md text-center cursor-pointer transition-colors duration-200
                        ${isToday ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        ${dayEvents.length > 0 ? 'bg-green-300 dark:bg-green-600 text-green-900 dark:text-green-200 font-bold' : ''}`}
            onClick={() => {
              if (dayEvents.length > 0) {
                const message = dayEvents.map(e => `- ${new Date(e.scheduledAt).toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}: ${e.title}`).join('\n');
                setMessageBoxContent({
                  title: `Trabajos para el ${dateString}`,
                  message: message
                });
                setShowMessageBox(true);
              }
            }}
          >
            <span className="text-sm">{day}</span>
            {dayEvents.length > 0 && <span className="block mt-1 text-xs">({dayEvents.length})</span>}
          </div>
        );
      }

      return days;
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
      <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            &lt;
          </Button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            &gt;
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-gray-600 dark:text-gray-300 font-medium">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {renderDays()}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      {/* Encabezado y botones */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agenda de Trabajos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona y programa los servicios</p>
        </div>
        {(userRole === 'admin' || userRole === 'secretary') && (
            <Button onClick={handleNewJob} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Programar Trabajo
            </Button>
        )}
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Vista condicional según el rol del usuario */}
      {userRole === 'admin' || userRole === 'secretary' ? (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Trabajos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {jobs.filter(j => j.status === "PENDING").length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {jobs.filter(j => j.status === "IN_PROGRESS").length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Progreso</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {jobs.filter(j => j.status === "COMPLETED").length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles de filtro */}
          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar trabajo o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="COMPLETED">Completado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acciones</label>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setSelectedDate("");
                    setStatusFilter("all");
                    setSearchTerm("");
                  }}>
                    <Filter className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AgendaTable data={filteredJobs} />
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Mi Agenda ({currentUser})</h2>
          <WorkerCalendar events={getWorkerJobs(currentUser)} />
        </>
      )}

      {/* Cuadro de diálogo de confirmación de eliminación */}
      <ConfirmationDialog
        isOpen={showConfirm}
        onConfirm={handleDeleteJob}
        onCancel={() => setShowConfirm(false)}
        message="¿Estás seguro de que quieres eliminar este trabajo?"
      />

      {/* Cuadro de diálogo para mensajes del calendario */}
      <MessageBox
        isOpen={showMessageBox}
        onDismiss={() => setShowMessageBox(false)}
        title={messageBoxContent.title}
        message={messageBoxContent.message}
      />

      {/* Modal para el formulario de nuevo/editar trabajo */}
      <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Trabajo' : 'Programar Nuevo Trabajo'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los detalles del trabajo.' : 'Completa el formulario para programar un nuevo trabajo.'}
            </DialogDescription>
          </DialogHeader>
          {/* Aquí iría tu componente JobForm real. Para este ejemplo, lo simulamos. */}
          <JobForm 
            job={jobToEdit}
            onSave={(updatedJob) => handleSaveJob(updatedJob)}
            onCancel={() => setShowJobForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente simulado del formulario de trabajo. 
// En un proyecto real, esto debería estar en un archivo separado.
const JobForm = ({ job, onSave, onCancel }: { job: Job | null, onSave: (job: Job) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Job>({
    id: job?.id || '',
    title: job?.title || '',
    description: job?.description || '',
    status: job?.status || 'PENDING',
    priority: job?.priority || 'MEDIUM',
    scheduledAt: job?.scheduledAt || new Date().toISOString(),
    client: job?.client || { name: '', phone: '', address: '' },
    service: job?.service || { name: '' },
    assignedTo: job?.assignedTo || { name: '' },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Manejar campos anidados de forma segura
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Job] as object), // Se asegura de que se propague un objeto
          [child]: value,
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onSave(formData);
  };
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="title" className="text-right">Título</label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="description" className="text-right">Descripción</label>
        <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="client.name" className="text-right">Cliente</label>
        <Input id="client.name" name="client.name" value={formData.client.name} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="status" className="text-right">Estado</label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as JobStatus }))}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
            <SelectItem value="COMPLETED">Completado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="priority" className="text-right">Prioridad</label>
        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as JobPriority }))}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecciona una prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Baja</SelectItem>
            <SelectItem value="MEDIUM">Media</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar</Button>
      </DialogFooter>
    </div>
  );
};
