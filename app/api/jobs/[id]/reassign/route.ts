import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const { technicianId } = await request.json()

    if (!technicianId) {
      return NextResponse.json({
        error: "ID del técnico es requerido"
      }, { status: 400 })
    }

    // Verificar que el trabajo existe
    const existingJob = await prisma.job.findUnique({
      where: { id },
      include: {
        technician: true,
        client: true,
        service: true
      }
    })

    if (!existingJob) {
      return NextResponse.json({
        error: "Trabajo no encontrado"
      }, { status: 404 })
    }

    // Verificar que el nuevo técnico existe
    const newTechnician = await prisma.user.findUnique({
      where: { id: technicianId },
      select: { id: true, name: true, role: { select: { name: true } } }
    })

    if (!newTechnician) {
      return NextResponse.json({
        error: "Técnico no encontrado"
      }, { status: 404 })
    }

    // Verificar que el usuario es un técnico
    if (newTechnician.role?.name !== 'TECNICO' && newTechnician.role?.name !== 'tecnico') {
      return NextResponse.json({
        error: "El usuario seleccionado no es un técnico"
      }, { status: 400 })
    }

    // Verificar conflictos de horario para el nuevo técnico
    const conflictingJobs = await prisma.job.findMany({
      where: {
        technicianId: technicianId,
        scheduledAt: existingJob.scheduledAt,
        id: { not: id }, // Excluir el trabajo actual
        status: {
          notIn: ['CANCELLED', 'COMPLETED']
        }
      }
    })

    // Verificar si hay conflictos de horario
    const hasConflict = conflictingJobs.some(job => {
      if (!job.startTime || !job.endTime || !existingJob.startTime || !existingJob.endTime) {
        return false
      }

      // Convertir horarios a minutos para comparación
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return (hours || 0) * 60 + (minutes || 0)
      }

      const existingStart = timeToMinutes(existingJob.startTime)
      const existingEnd = timeToMinutes(existingJob.endTime)
      const jobStart = timeToMinutes(job.startTime)
      const jobEnd = timeToMinutes(job.endTime)

      // Verificar solapamiento
      return (existingStart < jobEnd && existingEnd > jobStart)
    })

    if (hasConflict) {
      return NextResponse.json({
        error: "El técnico seleccionado tiene conflictos de horario en ese momento"
      }, { status: 409 })
    }

    // Actualizar el trabajo con el nuevo técnico
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        technicianId: technicianId,
        updatedAt: new Date()
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        client: true,
        service: true,
        company: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Trabajo reasignado exitosamente",
      data: updatedJob
    })

  } catch (error) {

    return NextResponse.json({
      success: false,
      error: "Error interno del servidor"
    }, { status: 500 })
  }
}
