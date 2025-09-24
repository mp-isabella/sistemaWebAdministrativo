import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener técnicos activos (usuarios con rol TECNICO)
    const technicians = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: {
            in: ['TECNICO', 'tecnico']
          }
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
      }
    })

    // Obtener trabajos con información completa
    const jobs = await prisma.job.findMany({
      where: {
        // Solo trabajos programados (con fecha)
        scheduledAt: {
          not: null
        }
      },
      include: {
        client: true,
        service: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true,
        quotes: {
          include: {
            items: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        payments: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Mapear técnicos al formato esperado
    const mappedTechnicians = technicians.map((tech: any) => ({
      id: tech.id,
      name: tech.name,
      avatar: null,
      email: tech.email || '',
      phone: tech.phone || '',
      role: tech.role?.name || 'tecnico',
      status: 'disponible' as const,
      timeRange: '08:00-18:00'
    }))

    // Mapear trabajos al formato esperado
    const mappedJobs = jobs.map((job: any) => {
      // Determinar el professionalId
      let professionalId = job.technicianId || null

      // Si no hay técnico asignado, usar null para indicar que está sin asignar
      if (!job.technicianId) {
        professionalId = null
      }

      // Formatear fecha y hora
      let scheduledDate: Date
      if (job.scheduledAt && job.scheduledAt !== null) {
        scheduledDate = new Date(job.scheduledAt)
        // Verificar que la fecha es válida y no es la fecha epoch
        if (isNaN(scheduledDate.getTime()) || scheduledDate.getFullYear() === 1969) {

          // Usar fecha actual como fallback
          scheduledDate = new Date()
        }
      } else {

        // Usar fecha actual como fallback
        scheduledDate = new Date()
      }
      const formattedDate = scheduledDate.toISOString().split('T')[0]

      // Formatear horarios
      const startTime = job.startTime || '08:00'
      const endTime = job.endTime || '09:00'

      return {
        id: job.id,
        professionalId: professionalId,
        patientName: job.client?.name || 'Sin nombre',
        startTime: startTime,
        endTime: endTime,
        startTimeDisplay: startTime,
        endTimeDisplay: endTime,
        type: job.service?.name || 'Sin tipo',
        color: getJobColor(job.status),
        date: formattedDate,
        status: job.status || 'PENDING',
        priority: job.priority || 'MEDIUM',
        description: job.description || '',
        client: job.client ? {
          id: job.client.id,
          name: job.client.name,
          phone: job.client.phone,
          email: job.client.email
        } : null,
        service: job.service ? {
          id: job.service.id,
          name: job.service.name
        } : null,
        technician: job.technician ? {
          id: job.technician.id,
          name: job.technician.name,
          email: job.technician.email
        } : null,
        company: job.company ? {
          id: job.company.id,
          name: job.company.name
        } : null,
        scheduledAt: job.scheduledAt?.toISOString(),
        createdAt: job.createdAt?.toISOString(),
        totalBudget: job.totalBudget,
        quote: job.quotes && job.quotes.length > 0 ? job.quotes[0] : null,
        payments: job.payments || []
      }
    })

    // Eliminar duplicados basándose en el ID del trabajo
    const uniqueJobs = mappedJobs.filter((job, index, self) =>
      index === self.findIndex(j => j.id === job.id)
    )

    // console.log('Total unique jobs:', uniqueJobs.length)

    // Log del ordenamiento para verificar

    uniqueJobs.slice(0, 3).forEach((job) => {
      console.log('Top job:', job.id);
    })

    // Mostrar warning si se detectaron duplicados
    if (mappedJobs.length !== uniqueJobs.length) {
    }

    return NextResponse.json({
      success: true,
      data: uniqueJobs,
      technicians: mappedTechnicians,
      user: {
        id: (session as any).user?.id,
        name: (session as any).user?.name
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {

    return NextResponse.json({
      success: false,
      error: "Error interno del servidor"
    }, { status: 500 })
  }
}

// Función para determinar el color del trabajo según el estado
function getJobColor(status: string | null): string {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-100 border-yellow-300 text-yellow-800"
    case "IN_PROGRESS":
      return "bg-blue-100 border-blue-300 text-blue-800"
    case "COMPLETED":
      return "bg-green-100 border-green-300 text-green-800"
    case "CANCELLED":
      return "bg-red-100 border-red-300 text-red-800"
    default:
      return "bg-gray-100 border-gray-300 text-gray-800"
  }
}
