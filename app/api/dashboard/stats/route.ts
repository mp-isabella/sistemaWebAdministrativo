import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener estadísticas generales
    const [
      totalJobs,
      activeJobs,
      completedJobs,
      totalClients,
      totalWorkers,
      totalQuotes,
      totalReports,
      todayJobs,
      pendingJobs,
      inProgressJobs,
      cancelledJobs
    ] = await Promise.all([
      // Total de trabajos
      prisma.job.count(),

      // Trabajos activos (pendientes + en progreso)
      prisma.job.count({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        }
      }),

      // Trabajos completados
      prisma.job.count({
        where: {
          status: 'COMPLETED'
        }
      }),

      // Total de clientes
      prisma.client.count(),

      // Total de trabajadores
      prisma.user.count(),

      // Total de cotizaciones
      prisma.quote.count(),

      // Total de reportes (liquidaciones)
      prisma.liquidation.count(),

      // Trabajos de hoy
      prisma.job.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),

      // Trabajos pendientes
      prisma.job.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Trabajos en progreso
      prisma.job.count({
        where: {
          status: 'IN_PROGRESS'
        }
      }),

      // Trabajos cancelados
      prisma.job.count({
        where: {
          status: 'CANCELLED'
        }
      })
    ]);

    // Calcular ingresos totales (suma de precios de trabajos completados)
    const completedJobsWithPrices = await prisma.job.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        service: true
      }
    });

    const totalRevenue = completedJobsWithPrices.reduce((sum, job) => {
      return sum + (job.service?.price || 0);
    }, 0);

    // Obtener trabajos de hoy con detalles
    const todayJobsDetails = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      },
      include: {
        client: true,
        service: true,
        technician: true,
        company: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Obtener actividad reciente (últimos 10 trabajos)
    const recentActivity = await prisma.job.findMany({
      take: 10,
      include: {
        client: true,
        service: true,
        technician: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular tendencias (comparar con el mes anterior)
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

    const [currentMonthJobs, lastMonthJobs] = await Promise.all([
      prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      }),
      prisma.job.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      })
    ]);

    const jobsTrend = lastMonthJobs > 0
      ? ((currentMonthJobs - lastMonthJobs) / lastMonthJobs * 100).toFixed(1)
      : 0;

    const stats = {
      overview: {
        totalJobs,
        activeJobs,
        completedJobs,
        totalClients,
        totalWorkers,
        totalQuotes,
        totalReports,
        totalRevenue: totalRevenue.toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP'
        })
      },
      today: {
        count: todayJobs,
        jobs: todayJobsDetails
      },
      status: {
        pending: pendingJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
        cancelled: cancelledJobs
      },
      trends: {
        jobsTrend: parseFloat(String(jobsTrend)),
        isPositive: parseFloat(String(jobsTrend)) > 0
      },
      recentActivity,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
