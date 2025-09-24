import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Función para validar conflictos de horarios por técnico
async function validateTechnicianScheduleConflict(
  technicianId: string, 
  scheduledAt: Date, 
  startTime: string, 
  endTime: string, 
  excludeJobId?: string,
  clientId?: string // Nuevo parámetro para validar clientes únicos
) {
  if (!technicianId || !scheduledAt || !startTime || !endTime) {
    return { hasConflict: false, conflictingJobs: [], totalJobs: 0, maxJobs: 8, uniqueClients: 0 }
  }

  // Convertir la fecha programada a solo fecha (sin hora)
  const scheduledDate = new Date(scheduledAt)
  scheduledDate.setHours(0, 0, 0, 0)
  
  const nextDay = new Date(scheduledDate)
  nextDay.setDate(nextDay.getDate() + 1)

  // Buscar trabajos existentes para el mismo técnico en la misma fecha
  const existingJobs = await prisma.job.findMany({
    where: {
      technicianId,
      scheduledAt: {
        gte: scheduledDate,
        lt: nextDay
      },
      ...(excludeJobId && { id: { not: excludeJobId } })
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      scheduledAt: true,
      clientId: true, // Incluir clientId para validación
      client: {
        select: {
          name: true
        }
      }
    }
  })

  // Verificar conflictos de horarios
  const conflictingJobs = existingJobs.filter(existingJob => {
    if (!existingJob.startTime || !existingJob.endTime) return false
    
    const existingStart = existingJob.startTime
    const existingEnd = existingJob.endTime
    
    // Verificar si hay solapamiento de horarios
    return (
      (startTime < existingEnd && endTime > existingStart) ||
      (existingStart < endTime && existingEnd > startTime)
    )
  })

  // Contar clientes únicos en el horario conflictivo
  const uniqueClientIds = new Set(conflictingJobs.map(job => job.clientId).filter(Boolean))
  const totalUniqueClients = uniqueClientIds.size

  // Si hay un clientId en la nueva solicitud, verificar que no esté duplicado
  let hasClientConflict = false
  if (clientId && uniqueClientIds.has(clientId)) {
    hasClientConflict = true
  }

  // Permitir hasta 8 trabajos en el mismo horario para diferentes clientes
  const maxJobsPerTimeSlot = 8
  const hasConflict = conflictingJobs.length >= maxJobsPerTimeSlot || hasClientConflict

  return {
    hasConflict,
    conflictingJobs,
    totalJobs: conflictingJobs.length,
    maxJobs: maxJobsPerTimeSlot,
    uniqueClients: totalUniqueClients,
    hasClientConflict,
    message: hasClientConflict 
      ? `El cliente ya tiene un trabajo programado en ese horario.`
      : hasConflict 
        ? `El técnico ya tiene ${conflictingJobs.length} trabajos programados en ese horario. Límite máximo: ${maxJobsPerTimeSlot} trabajos para diferentes clientes.`
        : `Horario disponible. Trabajos actuales: ${conflictingJobs.length}/${maxJobsPerTimeSlot}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { technicianId, scheduledAt, startTime, endTime, excludeJobId, clientId } = body

    // Validar datos requeridos
    if (!technicianId || !scheduledAt || !startTime || !endTime) {
      return NextResponse.json({ 
        error: "Datos requeridos faltantes: technicianId, scheduledAt, startTime, endTime" 
      }, { status: 400 })
    }

    // clientId es opcional pero recomendado para validación de clientes únicos

    // Validar formato de horarios
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ 
        error: "Formato de horario inválido. Use formato HH:mm" 
      }, { status: 400 })
    }

    // Validar que endTime sea posterior a startTime
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (endMinutes <= startMinutes) {
      return NextResponse.json({ 
        error: "La hora de fin debe ser posterior a la hora de inicio" 
      }, { status: 400 })
    }

    // Procesar la fecha
    const processedScheduledAt = new Date(scheduledAt)

    // Validar conflictos de horarios
    const scheduleConflict = await validateTechnicianScheduleConflict(
      technicianId,
      processedScheduledAt,
      startTime,
      endTime,
      excludeJobId,
      clientId
    )

    return NextResponse.json({
      hasConflict: scheduleConflict.hasConflict,
      conflictingJobs: scheduleConflict.conflictingJobs,
      totalJobs: scheduleConflict.totalJobs,
      maxJobs: scheduleConflict.maxJobs,
      uniqueClients: scheduleConflict.uniqueClients,
      hasClientConflict: scheduleConflict.hasClientConflict,
      message: scheduleConflict.message
    })

  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
