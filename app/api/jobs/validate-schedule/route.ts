import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { technicianId, scheduledAt, startTime, endTime, excludeJobId } = await request.json()

    if (!technicianId || !scheduledAt || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Datos requeridos: technicianId, scheduledAt, startTime, endTime' },
        { status: 400 }
      )
    }

    // Convertir la fecha programada a formato de fecha
    const scheduledDate = new Date(scheduledAt)
    const startDateTime = new Date(scheduledDate)
    const endDateTime = new Date(scheduledDate)

    // Configurar las horas
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    startDateTime.setHours(startHour, startMinute, 0, 0)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    // Buscar trabajos existentes para el técnico en el mismo horario
    const existingJobs = await prisma.job.findMany({
      where: {
        technicianId: technicianId,
        scheduledAt: {
          gte: startDateTime,
          lt: endDateTime
        },
        ...(excludeJobId && { id: { not: excludeJobId } })
      },
      include: {
        client: true
      }
    })

    // Límite máximo de trabajos por técnico en el mismo horario
    const maxJobs = 8
    const totalJobs = existingJobs.length
    const hasConflict = totalJobs >= maxJobs

    return NextResponse.json({
      hasConflict,
      conflictingJobs: existingJobs,
      totalJobs,
      maxJobs,
      message: hasConflict
        ? `El técnico ya tiene ${totalJobs} trabajos en ese horario. Límite: ${maxJobs} trabajos.`
        : `Horario disponible. Trabajos actuales: ${totalJobs}/${maxJobs}`
    })

  } catch (error) {
    console.error('Error validating schedule:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al validar horarios' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}