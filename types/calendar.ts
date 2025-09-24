export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  role: string
  company: string
  fechaIngreso: string
  ultimaActividad: string
  isActive: boolean
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

export interface Appointment {
  id: string
  type: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  scheduledAt?: string
  date?: string
  startTime: string
  endTime: string
  startTimeDisplay?: string
  endTimeDisplay?: string
  totalBudget?: number
  paidAmount?: number
  paymentStatus?: 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED'
  client?: {
    name: string
    phone: string
    address: string
    email?: string
  }
  patientName?: string
  service?: {
    name: string
    price?: number
  }
  company?: {
    name: string
    type: string
  }
  technician?: {
    id: string
    name: string
  }
  quote?: {
    id: string
    quoteNumber?: string
    total: number
    status: string
    validUntil: string
    createdAt: string
    notes?: string
  }
  payments?: Array<{
    id: string
    amount: number
    status: string
    method?: string
    notes?: string
    createdAt: string
  }>
}
