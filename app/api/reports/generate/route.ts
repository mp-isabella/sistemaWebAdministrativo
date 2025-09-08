import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admin y secretaria pueden generar reportes
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para generar reportes' }, { status: 403 })
    }

    const body = await request.json()
    const { type, period, filters } = body

    if (!type) {
      return NextResponse.json({ error: 'Tipo de reporte requerido' }, { status: 400 })
    }

    // Generar reporte según el tipo
    let reportData: any = {}
    let reportTitle = ''
    let reportDescription = ''

    switch (type) {
      case 'financial':
        reportTitle = `Reporte Financiero ${period || 'Enero 2024'}`
        reportDescription = 'Análisis completo de ingresos, gastos y rentabilidad'
        
        // Obtener datos financieros de la base de datos
        const jobs = await prisma.job.findMany({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31')
            }
          },
          include: {
            service: true,
            client: true
          }
        })

        const totalRevenue = jobs.reduce((sum, job) => {
          // Aquí deberías obtener el precio real del servicio
          return sum + (job.service?.price || 0)
        }, 0)

        reportData = {
          totalJobs: jobs.length,
          totalRevenue,
          averageJobValue: totalRevenue / jobs.length,
          completedJobs: jobs.filter(job => job.status === 'COMPLETED').length,
          pendingJobs: jobs.filter(job => job.status === 'PENDING').length
        }
        break

      case 'operational':
        reportTitle = `Reporte Operacional ${period || 'Enero 2024'}`
        reportDescription = 'Métricas de servicios, técnicos y eficiencia'
        
        // Obtener datos operacionales
        const technicians = await prisma.user.findMany({
          where: {
            role: {
              name: {
                in: ['TECNICO', 'tecnico']
              }
            }
          }
        })

        const clients = await prisma.client.findMany({
          where: {
            isActive: true
          }
        })

        reportData = {
          totalTechnicians: technicians.length,
          totalClients: clients.length,
          activeJobs: await prisma.job.count({
            where: {
              status: {
                in: ['PENDING', 'IN_PROGRESS']
              }
            }
          })
        }
        break

      case 'performance':
        reportTitle = `Reporte de Rendimiento ${period || 'Enero 2024'}`
        reportDescription = 'Análisis de productividad y tiempos de respuesta'
        
        // Obtener métricas de rendimiento
        const completedJobs = await prisma.job.findMany({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31')
            }
          }
        })

        const averageCompletionTime = completedJobs.reduce((sum, job) => {
          if (job.startedAt && job.completedAt) {
            const startTime = new Date(job.startedAt).getTime()
            const endTime = new Date(job.completedAt).getTime()
            return sum + (endTime - startTime)
          }
          return sum
        }, 0) / completedJobs.length

        reportData = {
          totalCompletedJobs: completedJobs.length,
          averageCompletionTime: averageCompletionTime / (1000 * 60 * 60), // Convertir a horas
          onTimeJobs: completedJobs.filter(job => {
            // Lógica para determinar si se completó a tiempo
            return true
          }).length
        }
        break

      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
    }

    // Crear reporte simulado
    const report = {
      id: `REP-${Date.now()}`,
      type,
      title: reportTitle,
      description: reportDescription,
      period: period || 'Enero 2024',
      generatedBy: (session as any).user?.name || 'Sistema',
      size: `${Math.random() * 3 + 1} MB`,
      downloads: 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      data: reportData
    }

    // En una implementación real, guardarías el reporte en la base de datos
    // await prisma.report.create({ data: report })

    return NextResponse.json(report, { status: 201 })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
