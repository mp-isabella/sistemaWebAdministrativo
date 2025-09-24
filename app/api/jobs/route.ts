import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
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
    if ((session.user as any).role.toLowerCase() === "tecnico") {
      where.technicianId = (session.user as any).id
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
        company: true,
        createdBy: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(jobs)
  } catch (error) {

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
  _clientId?: string // Nuevo parámetro para validar clientes únicos
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

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Permitir que admin, secretaria y técnicos creen trabajos
    const userRole = (session.user as any).role;
    if (!["ADMINISTRADOR", "admin", "administrador", "SECRETARIA", "secretaria", "TECNICO", "tecnico"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()

    const { title, description, clientId, serviceId, serviceName, companyId, technicianId, scheduledAt, startTime, endTime, priority, totalBudget } = body

    // Validar datos requeridos
    if (!title || !clientId || (!serviceId && !serviceName) || !companyId || !scheduledAt) {

      return NextResponse.json({
        error: "Datos requeridos faltantes",
        details: {
          title: !!title,
          clientId: !!clientId,
          serviceId: !!serviceId,
          serviceName: !!serviceName,
          companyId: !!companyId,
          scheduledAt: !!scheduledAt
        }
      }, { status: 400 })
    }

    // Permitir crear trabajos sin asignar técnico (se irán a la columna "Técnico" del calendario)
    // if (!technicianId) {
    //   return NextResponse.json({ error: "Debe asignar un técnico al trabajo" }, { status: 400 })
    // }

    // Validar que se proporcionen horarios
    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Debe especificar horarios de inicio y fin" }, { status: 400 })
    }

    // Validar que los horarios estén dentro del rango permitido (8:00 - 19:00)
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])

    if (startHour < 8 || startHour > 19 || endHour < 8 || endHour > 19) {
      return NextResponse.json({
        error: "Los horarios deben estar entre 8:00 y 19:00",
        details: { startTime, endTime, startHour, endHour }
      }, { status: 400 })
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

    // Validar duplicados exactos antes de crear el trabajo
    const existingJob = await prisma.job.findFirst({
      where: {
        title: title,
        clientId: clientId,
        scheduledAt: processedScheduledAt,
        startTime: startTime,
        endTime: endTime,
        technicianId: technicianId || null,
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (existingJob) {

      return NextResponse.json({
        error: "Ya existe un trabajo idéntico programado para esta fecha y horario",
        duplicateJob: {
          id: existingJob.id,
          title: existingJob.title,
          scheduledAt: existingJob.scheduledAt
        }
      }, { status: 409 })
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

    // Manejar servicio: si se envía serviceName, buscar o crear el servicio
    let finalServiceId = serviceId

    if (serviceName && !serviceId) {
      // Buscar si ya existe un servicio con ese nombre
      let existingService = await prisma.service.findFirst({
        where: {
          name: serviceName,
          isActive: true
        }
      })

      // Si no existe, crear uno nuevo
      if (!existingService) {
        existingService = await prisma.service.create({
          data: {
            name: serviceName,
            description: `Servicio personalizado: ${serviceName}`,
            isActive: true,
            price: 0 // Precio por defecto
          }
        })

      }

      finalServiceId = existingService.id
    }

    const jobData = {
      title,
      description,
      clientId,
      serviceId: finalServiceId,
      companyId,
      technicianId,
      createdById: (session.user as any).id,
      scheduledAt: processedScheduledAt,
      priority: priority || "MEDIUM",
      status: "PENDING",
      startTime,
      endTime,
      totalBudget: totalBudget ? Number(totalBudget) : null
    } as any

    const newJob = await prisma.job.create({
      data: jobData,
      include: {
        client: true,
        service: true,
        technician: true,
        company: true,
        createdBy: true
      }
    })

    return NextResponse.json(newJob, { status: 201 })
  } catch (error) {

    return NextResponse.json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Verificar permisos específicos para cambios de técnico
    const userRole = (session.user as any).role;

    // Solo verificar cambio de técnico si realmente se está enviando un technicianId diferente
    // Primero necesitamos obtener el trabajo actual para comparar
    const jobId = body.id;
    if (!jobId) {
      return NextResponse.json({ error: "ID del trabajo requerido" }, { status: 400 })
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar si realmente se está cambiando el técnico
    const isChangingTechnician = body.technicianId !== undefined &&
      body.technicianId !== existingJob.technicianId

    console.log('Is changing technician:', isChangingTechnician)

    // Solo admin y secretaria pueden cambiar técnicos
    if (isChangingTechnician && !["ADMIN", "admin", "administrador", "SECRETARIA", "secretaria"].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores y secretarias pueden cambiar técnicos" }, { status: 403 })
    }

    // Permitir que admin, secretaria y técnicos actualicen otros campos
    if (!["ADMINISTRADOR", "admin", "administrador", "SECRETARIA", "secretaria", "TECNICO", "tecnico"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }
    const { title, description, clientId, serviceId, serviceName, companyId, technicianId, scheduledAt, startTime, endTime, priority, status, totalBudget } = body;

    // Validar que al menos un campo se esté actualizando
    const hasUpdates = title !== undefined || description !== undefined || clientId !== undefined ||
      serviceId !== undefined || serviceName !== undefined || companyId !== undefined ||
      technicianId !== undefined || scheduledAt !== undefined || startTime !== undefined ||
      endTime !== undefined || priority !== undefined || status !== undefined ||
      totalBudget !== undefined

    if (!hasUpdates) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    // Preparar datos para actualizar
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (clientId !== undefined) updateData.clientId = clientId
    if (companyId !== undefined) updateData.companyId = companyId
    if (technicianId !== undefined) updateData.technicianId = technicianId
    if (totalBudget !== undefined) {
      console.log({
        totalBudget,
        isNull: totalBudget === null,
        isUndefined: totalBudget === undefined
      })
      updateData.totalBudget = totalBudget ? Number(totalBudget) : null
    }

    // Manejar servicio: si se envía serviceName, buscar o crear el servicio
    if (serviceName && !serviceId) {
      // Buscar si ya existe un servicio con ese nombre
      let existingService = await prisma.service.findFirst({
        where: {
          name: serviceName,
          isActive: true
        }
      })

      // Si no existe, crear uno nuevo
      if (!existingService) {
        existingService = await prisma.service.create({
          data: {
            name: serviceName,
            description: `Servicio personalizado: ${serviceName}`,
            isActive: true,
            price: 0 // Precio por defecto
          }
        })

      }

      updateData.serviceId = existingService.id
    } else if (serviceId !== undefined) {
      updateData.serviceId = serviceId
    }

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
          const date = new Date(year || 0, (month || 1) - 1, day || 0, 0, 0, 0, 0)
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

          return NextResponse.json({
            error: "No se puede borrar la fecha de un trabajo ya programado. Si solo quieres cambiar el técnico, no modifiques la fecha."
          }, { status: 400 })
        }
        processedScheduledAt = null
        updateData.scheduledAt = null
      }
    } else {
      // Si no se está enviando scheduledAt, mantener la fecha existente

    }

    let processedStartTime = existingJob.startTime
    let processedEndTime = existingJob.endTime

    if (startTime !== undefined) {
      // Validar que el horario de inicio esté dentro del rango permitido (8:00 - 19:00)
      const startHour = parseInt(startTime.split(':')[0])
      if (startHour < 8 || startHour > 19) {
        return NextResponse.json({
          error: "El horario de inicio debe estar entre 8:00 y 19:00",
          details: { startTime, startHour }
        }, { status: 400 })
      }
      processedStartTime = startTime
      updateData.startTime = startTime
    }
    if (endTime !== undefined) {
      // Validar que el horario de fin esté dentro del rango permitido (8:00 - 19:00)
      const endHour = parseInt(endTime.split(':')[0])
      if (endHour < 8 || endHour > 19) {
        return NextResponse.json({
          error: "El horario de fin debe estar entre 8:00 y 19:00",
          details: { endTime, endHour }
        }, { status: 400 })
      }
      processedEndTime = endTime
      updateData.endTime = endTime
    }

    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status

    // Los técnicos solo pueden cambiar el estado de sus propios trabajos
    if (userRole === "tecnico" && existingJob.technicianId !== (session.user as any).id) {
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
          jobId // Excluir el trabajo actual de la validación
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
    let updatedJob;
    try {
      updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: updateData,
        include: {
          client: true,
          service: true,
          technician: true,
          company: true,
          createdBy: true
        }
      })
    } catch (prismaError) {

      throw new Error(`Error de base de datos: ${prismaError instanceof Error ? prismaError.message : 'Unknown error'}`)
    }

    return NextResponse.json(updatedJob)

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({
      error: "Error al actualizar el trabajo",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden eliminar trabajos
    if (!["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
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
        technician: true,
        company: true
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

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
