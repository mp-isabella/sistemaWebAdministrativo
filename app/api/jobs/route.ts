import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const technicianId = searchParams.get("technicianId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    // Filtros por rol
    if (session.user.role.toLowerCase() === "tecnico") {
      where.technicianId = session.user.id
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (technicianId) {
      where.technicianId = technicianId
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

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
      scheduledAt: true
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

  // Permitir hasta 8 trabajos en el mismo horario
  const maxJobsPerTimeSlot = 8
  const hasConflict = conflictingJobs.length >= maxJobsPerTimeSlot

  return { 
    hasConflict, 
    conflictingJobs, 
    totalJobs: conflictingJobs.length,
    maxJobs: maxJobsPerTimeSlot
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Permitir que admin, secretaria y técnicos creen trabajos
    if (!["admin", "secretaria", "tecnico"].includes(session.user.role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()

    const { title, description, clientId, serviceId, companyId, technicianId, scheduledAt, startTime, endTime, priority } = body

    // Validar datos requeridos
    if (!title || !clientId || !serviceId || !companyId || !scheduledAt) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Permitir crear trabajos sin asignar técnico (se irán a la columna "Técnico" del calendario)
    // if (!technicianId) {
    //   return NextResponse.json({ error: "Debe asignar un técnico al trabajo" }, { status: 400 })
    // }

    // Validar que se proporcionen horarios
    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Debe especificar horarios de inicio y fin" }, { status: 400 })
    }

    // Manejar la fecha correctamente para evitar problemas de zona horaria - SOLUCIÓN PREVENTIVA
    let processedScheduledAt = null
    if (scheduledAt) {
      const date = new Date(scheduledAt)
      // Verificar que la fecha es válida y no es la fecha epoch
      if (isNaN(date.getTime()) || date.getFullYear() === 1969) {
        return NextResponse.json({ error: "Fecha inválida proporcionada" }, { status: 400 })
      }
      // Asegurar que la fecha se mantenga en la zona horaria local
      processedScheduledAt = date
    } else {
      return NextResponse.json({ error: "Debe especificar una fecha válida" }, { status: 400 })
    }

    // Validar conflictos de horarios solo si hay técnico asignado
    if (technicianId) {
      const scheduleConflict = await validateTechnicianScheduleConflict(
        technicianId, 
        processedScheduledAt!, 
        startTime, 
        endTime
      )

      if (scheduleConflict.hasConflict) {
        return NextResponse.json({ 
          error: `El técnico ya tiene ${scheduleConflict.totalJobs} trabajos programados en ese horario. Límite máximo: ${scheduleConflict.maxJobs} trabajos por horario.`,
          conflictingJobs: scheduleConflict.conflictingJobs,
          totalJobs: scheduleConflict.totalJobs,
          maxJobs: scheduleConflict.maxJobs
        }, { status: 409 })
      }
    }

    const jobData = {
      title,
      description,
      clientId,
      serviceId,
      companyId,
      technicianId,
      createdById: session.user.id,
      scheduledAt: processedScheduledAt,
      priority: priority || "MEDIUM",
      status: "PENDING",
      startTime,
      endTime
    } as any

    const newJob = await prisma.job.create({
      data: jobData,
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      }
    })
    
    return NextResponse.json(newJob, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    
    // Verificar permisos específicos para cambios de técnico
    const userRole = session.user.role.toLowerCase()
    const isChangingTechnician = body.technicianId !== undefined
    
    // Solo admin y secretaria pueden cambiar técnicos
    if (isChangingTechnician && !["admin", "secretaria"].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores y secretarias pueden cambiar técnicos" }, { status: 403 })
    }
    
    // Permitir que admin, secretaria y técnicos actualicen otros campos
    if (!["admin", "secretaria", "tecnico"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }
    const { id, title, description, clientId, serviceId, companyId, technicianId, scheduledAt, startTime, endTime, priority, status } = body

    if (!id) {
      return NextResponse.json({ error: "ID del trabajo requerido" }, { status: 400 })
    }

    // Verificar que el trabajo existe
    const existingJob = await prisma.job.findUnique({
      where: { id }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (clientId !== undefined) updateData.clientId = clientId
    if (serviceId !== undefined) updateData.serviceId = serviceId
    if (companyId !== undefined) updateData.companyId = companyId
    if (technicianId !== undefined) updateData.technicianId = technicianId
    
    // Manejar la fecha correctamente para evitar problemas de zona horaria - SOLUCIÓN PREVENTIVA
    let processedScheduledAt = existingJob.scheduledAt
    if (scheduledAt !== undefined) {
      if (scheduledAt) {
        // Verificar que la fecha es válida y no es la fecha epoch
        const date = new Date(scheduledAt)
        if (isNaN(date.getTime()) || date.getFullYear() === 1969) {
          return NextResponse.json({ error: "Fecha inválida proporcionada" }, { status: 400 })
        }
        
        // Si la fecha viene en formato YYYY-MM-DD, mantener solo la fecha sin cambiar zona horaria
        if (typeof scheduledAt === 'string' && scheduledAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Es solo una fecha, no incluir hora para evitar problemas de zona horaria
          const [year, month, day] = scheduledAt.split('-').map(Number)
          const date = new Date(year, month - 1, day, 0, 0, 0, 0)
          processedScheduledAt = date
          updateData.scheduledAt = date
        } else {
          // Es una fecha con hora, usar directamente
          processedScheduledAt = date
          updateData.scheduledAt = date
        }
      } else {
        // NO permitir borrar la fecha si ya existe una válida
        if (existingJob.scheduledAt) {
          console.log('⚠️ Intento de borrar fecha válida:', existingJob.id, 'Fecha actual:', existingJob.scheduledAt)
          return NextResponse.json({ 
            error: "No se puede borrar la fecha de un trabajo ya programado. Si solo quieres cambiar el técnico, no modifiques la fecha." 
          }, { status: 400 })
        }
        processedScheduledAt = null
        updateData.scheduledAt = null
      }
    } else {
      // Si no se está enviando scheduledAt, mantener la fecha existente
      console.log('✅ Manteniendo fecha existente:', existingJob.scheduledAt)
    }
    
    let processedStartTime = existingJob.startTime
    let processedEndTime = existingJob.endTime
    
    if (startTime !== undefined) {
      processedStartTime = startTime
      updateData.startTime = startTime
    }
    if (endTime !== undefined) {
      processedEndTime = endTime
      updateData.endTime = endTime
    }
    
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status

    // Los técnicos solo pueden cambiar el estado de sus propios trabajos
    if (userRole === "tecnico" && existingJob.technicianId !== session.user.id) {
      // Permitir solo cambios de estado si es el técnico asignado
      const allowedFields = ["status"]
      const hasUnauthorizedChanges = Object.keys(updateData).some(key => !allowedFields.includes(key))
      
      if (hasUnauthorizedChanges) {
        return NextResponse.json({ error: "Solo puedes modificar el estado de tus trabajos asignados" }, { status: 403 })
      }
    }

    // Validar conflictos de horarios si se está cambiando técnico, fecha u horarios
    const isChangingSchedule = 
      technicianId !== undefined || 
      scheduledAt !== undefined || 
      startTime !== undefined || 
      endTime !== undefined

    if (isChangingSchedule && processedScheduledAt && processedStartTime && processedEndTime) {
      const finalTechnicianId = technicianId !== undefined ? technicianId : existingJob.technicianId
      
      if (finalTechnicianId) {
        const scheduleConflict = await validateTechnicianScheduleConflict(
          finalTechnicianId,
          processedScheduledAt,
          processedStartTime,
          processedEndTime,
          id // Excluir el trabajo actual de la validación
        )

        if (scheduleConflict.hasConflict) {
          return NextResponse.json({ 
            error: `El técnico ya tiene ${scheduleConflict.totalJobs} trabajos programados en ese horario. Límite máximo: ${scheduleConflict.maxJobs} trabajos por horario.`,
            conflictingJobs: scheduleConflict.conflictingJobs,
            totalJobs: scheduleConflict.totalJobs,
            maxJobs: scheduleConflict.maxJobs
          }, { status: 409 })
        }
      }
    }

    // Actualizar el trabajo
    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      }
    })

    return NextResponse.json(updatedJob)

  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden eliminar trabajos
    if (!["admin", "secretaria"].includes(session.user.role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos para eliminar trabajos" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("id")

    if (!jobId) {
      return NextResponse.json({ error: "ID del trabajo requerido" }, { status: 400 })
    }

    // Verificar que el trabajo existe
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Eliminar el trabajo
    await prisma.job.delete({
      where: { id: jobId }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Trabajo eliminado exitosamente",
      deletedJob: existingJob
    })

  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
