import { useState, useCallback } from 'react'

interface ScheduleValidationResult {
  hasConflict: boolean
  conflictingJobs: any[]
  totalJobs: number
  maxJobs: number
  message: string
}

export function useScheduleValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ScheduleValidationResult | null>(null)

  const validateSchedule = useCallback(async (
    technicianId: string,
    scheduledAt: Date,
    startTime: string,
    endTime: string,
    excludeJobId?: string
  ): Promise<ScheduleValidationResult> => {
    if (!technicianId || technicianId === "sin-asignar" || !scheduledAt || !startTime || !endTime) {
      return {
        hasConflict: false,
        conflictingJobs: [],
        totalJobs: 0,
        maxJobs: 8,
        message: "Datos insuficientes para validar"
      }
    }

    setIsValidating(true)
    
    try {
      const response = await fetch('/api/jobs/validate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          technicianId,
          scheduledAt: scheduledAt.toISOString(),
          startTime,
          endTime,
          excludeJobId
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        const validationResult = {
          hasConflict: result.hasConflict,
          conflictingJobs: result.conflictingJobs || [],
          totalJobs: result.totalJobs || 0,
          maxJobs: result.maxJobs || 8,
          message: result.hasConflict 
            ? `El técnico ya tiene ${result.totalJobs} trabajos en ese horario. Límite: ${result.maxJobs} trabajos.`
            : `Horario disponible. Trabajos actuales: ${result.totalJobs}/${result.maxJobs}`
        }
        setValidationResult(validationResult)
        return validationResult
      } else {
        const errorResult = {
          hasConflict: false,
          conflictingJobs: [],
          totalJobs: 0,
          maxJobs: 8,
          message: result.error || "Error al validar horarios"
        }
        setValidationResult(errorResult)
        return errorResult
      }
    } catch (error) {
      console.error('Error validating schedule:', error)
      const errorResult = {
        hasConflict: false,
        conflictingJobs: [],
        totalJobs: 0,
        maxJobs: 8,
        message: "Error de conexión al validar horarios"
      }
      setValidationResult(errorResult)
      return errorResult
    } finally {
      setIsValidating(false)
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  return {
    validateSchedule,
    clearValidation,
    isValidating,
    validationResult
  }
}
