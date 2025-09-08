import { useEffect, useCallback } from 'react'

interface UseCalendarSyncProps {
  onRefresh: () => void
  onJobUpdate?: (jobId: string, updatedJob: any) => void
}

export function useCalendarSync({ onRefresh, onJobUpdate }: UseCalendarSyncProps) {
  const handleRefreshCalendar = useCallback((event: CustomEvent) => {
    console.log('🔄 Hook: Evento refreshCalendar recibido:', event.detail)
    onRefresh()
  }, [onRefresh])

  const handleJobUpdated = useCallback((event: CustomEvent) => {
    console.log('🔄 Hook: Evento jobUpdated recibido:', event.detail)
    if (onJobUpdate && event.detail?.jobId) {
      onJobUpdate(event.detail.jobId, event.detail.updatedJob)
    } else {
      onRefresh()
    }
  }, [onRefresh, onJobUpdate])

  useEffect(() => {
    // Agregar listeners para eventos personalizados
    window.addEventListener('refreshCalendar', handleRefreshCalendar as EventListener)
    window.addEventListener('jobUpdated', handleJobUpdated as EventListener)

    return () => {
      window.removeEventListener('refreshCalendar', handleRefreshCalendar as EventListener)
      window.removeEventListener('jobUpdated', handleJobUpdated as EventListener)
    }
  }, [handleRefreshCalendar, handleJobUpdated])

  // Función para disparar eventos de actualización
  const triggerRefresh = useCallback((reason: string = 'manual', details?: any) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('refreshCalendar', {
        detail: {
          reason,
          timestamp: new Date().toISOString(),
          ...details
        }
      })
      window.dispatchEvent(event)
      console.log('🔄 Hook: Evento refreshCalendar disparado:', event.detail)
    }
  }, [])

  const triggerJobUpdate = useCallback((jobId: string, updatedJob: any, action: string = 'updated') => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('jobUpdated', {
        detail: {
          jobId,
          updatedJob,
          action,
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)
      console.log('🔄 Hook: Evento jobUpdated disparado:', event.detail)
    }
  }, [])

  return {
    triggerRefresh,
    triggerJobUpdate
  }
}
