import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"
    const technicianId = searchParams.get("technicianId")

    // Calcular fechas según el período
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const where: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    }

    // Filtros por rol
    if (session.user.role === "operador") {
      where.assignedToId = session.user.id
    } else if (technicianId) {
      where.assignedToId = technicianId
    }

    // Estadísticas generales
    const [
      totalJobs,
      pendingJobs,
      inProgressJobs,
      completedJobs,
      totalClients,
      totalWorkers,
      totalServices
    ] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.count({ where: { ...where, status: "PENDING" } }),
      prisma.job.count({ where: { ...where, status: "IN_PROGRESS" } }),
      prisma.job.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.client.count(),
      prisma.user.count({ where: { role: { name: { not: "admin" } } } }),
      prisma.service.count()
    ])

    // Ingresos (basado en trabajos completados)
    const completedJobsWithServices = await prisma.job.findMany({
      where: { ...where, status: "COMPLETED" },
      include: { service: true }
    })

    const totalRevenue = completedJobsWithServices.reduce((sum, job) => sum + (job.service.price || 0), 0)

    // Trabajos por técnico
    const jobsByTechnician = await prisma.job.groupBy({
      by: ["assignedToId"],
      where: { ...where, assignedToId: { not: null } },
      _count: { id: true }
    })

    const techniciansWithJobs = await Promise.all(
      jobsByTechnician.map(async (item) => {
        const technician = await prisma.user.findUnique({
          where: { id: item.assignedToId! }
        })
        return {
          name: technician?.name || "Sin asignar",
          jobs: item._count.id
        }
      })
    )

    // Trabajos por servicio
    const jobsByService = await prisma.job.groupBy({
      by: ["serviceId"],
      where,
      _count: { id: true }
    })

    const servicesWithJobs = await Promise.all(
      jobsByService.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId }
        })
        return {
          name: service?.name || "Sin servicio",
          jobs: item._count.id
        }
      })
    )

    // Trabajos por día (últimos 7 días)
    const dailyJobs = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const count = await prisma.job.count({
        where: {
          ...where,
          createdAt: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      })

      dailyJobs.push({
        date: date.toLocaleDateString("es-CL"),
        jobs: count
      })
    }

    return NextResponse.json({
      general: {
        totalJobs,
        pendingJobs,
        inProgressJobs,
        completedJobs,
        totalClients,
        totalWorkers,
        totalServices,
        totalRevenue
      },
      charts: {
        jobsByTechnician: techniciansWithJobs,
        jobsByService: servicesWithJobs,
        dailyJobs
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
