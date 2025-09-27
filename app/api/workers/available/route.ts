import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden asignar trabajadores
    if (!["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")
    const excludeJobId = searchParams.get("excludeJobId")

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "Fecha, hora de inicio y fin son requeridas" }, { status: 400 })
    }

    // Convertir fecha y horarios a objetos Date para comparación
    const jobDate = new Date(date)
    new Date(`${date}T${startTime}`)
    new Date(`${date}T${endTime}`)

    // Obtener todos los técnicos activos
    const allTechnicians = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: 'TECNICO'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Obtener trabajos que se superponen con el horario solicitado
    const conflictingJobs = await prisma.job.findMany({
      where: {
        AND: [
          {
            scheduledAt: {
              gte: new Date(jobDate.setHours(0, 0, 0, 0)),
              lt: new Date(jobDate.setHours(23, 59, 59, 999))
            }
          },
          {
            OR: [
              // Trabajo que empieza antes y termina durante nuestro horario
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              // Trabajo que empieza durante nuestro horario
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { startTime: { lt: endTime } }
                ]
              },
              // Trabajo que contiene completamente nuestro horario
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gte: endTime } }
                ]
              }
            ]
          },
          // Excluir el trabajo actual si se está editando
          ...(excludeJobId ? [{ id: { not: excludeJobId } }] : [])
        ]
      },
      select: {
        technicianId: true,
        startTime: true,
        endTime: true,
        status: true
      }
    })

    // Obtener IDs de técnicos que tienen conflictos
    const busyTechnicianIds = conflictingJobs
      .filter(job => job.technicianId && job.status !== 'CANCELLED')
      .map(job => job.technicianId)

    // Filtrar técnicos disponibles
    const availableTechnicians = allTechnicians
      .filter(tech => !busyTechnicianIds.includes(tech.id))
      .map(tech => ({
        id: tech.id,
        name: tech.name,
        email: tech.email,
        phone: tech.phone,
        role: tech.role.name,
        status: 'disponible' as const,
        conflictReason: null
      }))

    // Técnicos ocupados con información del conflicto
    const busyTechnicians = allTechnicians
      .filter(tech => busyTechnicianIds.includes(tech.id))
      .map(tech => {
        const conflictingJob = conflictingJobs.find(job => job.technicianId === tech.id)
        return {
          id: tech.id,
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          role: tech.role.name,
          status: 'ocupado' as const,
          conflictReason: conflictingJob ?
            `Ocupado de ${conflictingJob.startTime} a ${conflictingJob.endTime}` :
            'Tiene trabajos programados en este horario'
        }
      })

    // Combinar todos los técnicos
    const allTechniciansWithStatus = [...availableTechnicians, ...busyTechnicians]

    return NextResponse.json({
      available: availableTechnicians,
      busy: busyTechnicians,
      all: allTechniciansWithStatus,
      total: allTechnicians.length,
      availableCount: availableTechnicians.length,
      busyCount: busyTechnicians.length
    })

  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
