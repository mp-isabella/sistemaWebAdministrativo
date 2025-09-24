// Utilidades para manejar eventos del calendario
export const CalendarEvents = {
  // Disparar evento cuando se crea un nuevo trabajo
  notifyNewJob: (jobData?: any) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('newJobCreated', {
        detail: jobData
      })
      window.dispatchEvent(event)
      
    }
  },

  // Disparar evento cuando se actualiza un trabajo
  notifyJobUpdated: (jobData?: any) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('jobUpdated', {
        detail: jobData
      })
      window.dispatchEvent(event)
      
    }
  },

  // Disparar evento cuando se elimina un trabajo
  notifyJobDeleted: (jobId?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('jobDeleted', {
        detail: { jobId }
      })
      window.dispatchEvent(event)
      
    }
  },

  // Función para refrescar el calendario manualmente
  refreshCalendar: () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('refreshCalendar')
      window.dispatchEvent(event)
      
    }
  },

  // Disparar evento cuando se crea un nuevo trabajador/técnico
  notifyWorkerCreated: (workerData?: any) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('workerCreated', {
        detail: workerData
      })
      window.dispatchEvent(event)
      
    }
  },

  // Disparar evento cuando se actualiza un trabajador/técnico
  notifyWorkerUpdated: (workerData?: any) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('workerUpdated', {
        detail: workerData
      })
      window.dispatchEvent(event)
      
    }
  },

  // Disparar evento cuando se elimina un trabajador/técnico
  notifyWorkerDeleted: (workerId?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('workerDeleted', {
        detail: { workerId }
      })
      window.dispatchEvent(event)
      
    }
  }
}
