export interface Professional {
  id: string
  name: string
  avatar: string
  status: "available" | "unavailable" | "busy" | "disponible" | "no disponible" | "ocupado"
  timeRange: string
}

export interface Appointment {
  id: string
  professionalId: string
  patientName: string
  startTime: string
  endTime: string
  startTimeDisplay?: string // Formato 12 horas para visualización
  endTimeDisplay?: string // Formato 12 horas para visualización
  type: string
  color: string
  date?: string // Fecha opcional para filtrar citas por día específico
  status?: string // Estado del trabajo: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  priority?: string // Prioridad del trabajo: HIGH, MEDIUM, LOW
  description?: string // Descripción del trabajo
  client?: any // Datos del cliente
  service?: any // Datos del servicio
  technician?: any // Datos del técnico
  company?: any // Datos de la empresa
  scheduledAt?: string // Fecha y hora programada original
}

export interface Patient {
  id: string
  name: string
  appointmentType: string
  price: string
  date: string
  time: string
  attendedBy: string
  phone: string
  email: string
  id_number: string 
  notes: string
}
