export interface Professional {
  id: string
  name: string
  avatar: string
  status: "available" | "unavailable" | "busy"
  timeRange: string
}

export interface Appointment {
  id: string
  professionalId: string
  patientName: string
  startTime: string
  endTime: string
  type: "consultation" | "procedure" | "followup"
  color: string
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
