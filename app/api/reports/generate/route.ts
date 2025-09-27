import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      reportId,
      type,
      companyId,
      startDate,
      endDate
    } = body

    // Validar permisos
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para generar reportes' }, { status: 403 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    let reportData: any = {}

    switch (type) {
      case 'FINANCIAL':
        reportData = await generateFinancialReport(companyId, start, end)
        break
      case 'OPERATIONAL':
        reportData = await generateOperationalReport(companyId, start, end)
        break
      case 'PERFORMANCE':
        reportData = await generatePerformanceReport(companyId, start, end)
        break
      case 'QUALITY':
        reportData = await generateQualityReport(companyId, start, end)
        break
      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
    }

    // Guardar los datos del reporte
    await (prisma as any).report.update({
      where: { id: reportId },
      data: {
        data: JSON.stringify(reportData),
        status: 'COMPLETED',
        summary: generateReportSummary(type, reportData)
      }
    })

    // Guardar métricas
    if (reportData.metrics) {
      await Promise.all(
        reportData.metrics.map((metric: any) =>
          (prisma as any).reportMetric.create({
            data: {
              reportId,
              name: metric.name,
              value: metric.value,
              unit: metric.unit,
              category: metric.category,
              description: metric.description
            }
          })
        )
      )
    }

    return NextResponse.json({ success: true, data: reportData })

  } catch (error) {

    // Marcar el reporte como fallido
    try {
      const body = await request.json()
      if (body.reportId) {
        await (prisma as any).report.update({
          where: { id: body.reportId },
          data: { status: 'FAILED' }
        })
      }
    } catch (parseError) {

    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function generateFinancialReport(companyId: string, startDate: Date, endDate: Date) {
  // Obtener datos financieros
  const jobs = await prisma.job.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      payments: true,
      quotes: {
        include: {
          items: true
        }
      },
      service: true,
      client: true
    }
  })

  const cashTransactions = await prisma.cashTransaction.findMany({
    where: {
      createdBy: {
        companyId
      },
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // Calcular métricas financieras
  const totalRevenue = jobs.reduce((sum, job) => {
    return sum + job.payments.reduce((paymentSum, payment) =>
      paymentSum + (payment.status === 'COMPLETED' ? payment.amount : 0), 0)
  }, 0)

  const totalQuotes = jobs.reduce((sum, job) => {
    return sum + job.quotes.reduce((quoteSum, quote) =>
      quoteSum + (quote.status === 'APPROVED' ? quote.total : 0), 0)
  }, 0)

  const totalExpenses = cashTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = cashTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const profit = totalRevenue + totalIncome - totalExpenses

  // Métricas por mes
  const monthlyData = generateMonthlyData(jobs, cashTransactions, startDate, endDate)

  return {
    summary: {
      totalRevenue,
      totalQuotes,
      totalExpenses,
      totalIncome,
      profit,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
    },
    monthlyData,
    metrics: [
      { name: 'Ingresos Totales', value: totalRevenue, unit: 'CLP', category: 'Revenue' },
      { name: 'Cotizaciones Totales', value: totalQuotes, unit: 'CLP', category: 'Quotes' },
      { name: 'Gastos Totales', value: totalExpenses, unit: 'CLP', category: 'Expenses' },
      { name: 'Utilidad', value: profit, unit: 'CLP', category: 'Profit' },
      { name: 'Margen de Utilidad', value: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0, unit: '%', category: 'Profit' }
    ],
    jobs: jobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      totalBudget: job.totalBudget,
      payments: job.payments,
      quotes: job.quotes
    }))
  }
}

async function generateOperationalReport(companyId: string, startDate: Date, endDate: Date) {
  const jobs = await prisma.job.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      technician: true,
      service: true,
      client: true
    }
  })

  const technicians = await prisma.user.findMany({
    where: {
      companyId,
      role: {
        name: 'tecnico'
      }
    }
  })

  // Calcular métricas operacionales
  const totalJobs = jobs.length
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED').length
  const pendingJobs = jobs.filter(job => job.status === 'PENDING').length
  const inProgressJobs = jobs.filter(job => job.status === 'IN_PROGRESS').length

  const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0

  // Métricas por técnico
  const technicianMetrics = technicians.map(tech => {
    const techJobs = jobs.filter(job => job.technicianId === tech.id)
    return {
      id: tech.id,
      name: tech.name,
      totalJobs: techJobs.length,
      completedJobs: techJobs.filter(job => job.status === 'COMPLETED').length,
      completionRate: techJobs.length > 0 ? (techJobs.filter(job => job.status === 'COMPLETED').length / techJobs.length) * 100 : 0
    }
  })

  // Métricas por servicio
  const serviceMetrics = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      jobs: {
        where: {
          companyId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  })

  return {
    summary: {
      totalJobs,
      completedJobs,
      pendingJobs,
      inProgressJobs,
      completionRate,
      totalTechnicians: technicians.length
    },
    technicianMetrics,
    serviceMetrics: serviceMetrics.map(service => ({
      id: service.id,
      name: service.name,
      totalJobs: service.jobs.length,
      averagePrice: service.price || 0
    })),
    metrics: [
      { name: 'Total Trabajos', value: totalJobs, unit: 'trabajos', category: 'Jobs' },
      { name: 'Trabajos Completados', value: completedJobs, unit: 'trabajos', category: 'Jobs' },
      { name: 'Tasa de Completación', value: completionRate, unit: '%', category: 'Performance' },
      { name: 'Técnicos Activos', value: technicians.length, unit: 'técnicos', category: 'Staff' }
    ]
  }
}

async function generatePerformanceReport(companyId: string, startDate: Date, endDate: Date) {
  const jobs = await prisma.job.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      technician: true,
      service: true
    }
  })

  // Calcular tiempos promedio
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED' && job.completedAt)
  const averageCompletionTime = completedJobs.length > 0
    ? completedJobs.reduce((sum, job) => {
        const start = new Date(job.createdAt)
        const end = new Date(job.completedAt!)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) // días
      }, 0) / completedJobs.length
    : 0

  // Métricas de productividad
  const productivityMetrics = {
    averageJobsPerDay: jobs.length / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
    averageCompletionTime,
    efficiency: completedJobs.length / Math.max(1, jobs.length) * 100
  }

  return {
    summary: productivityMetrics,
    metrics: [
      { name: 'Trabajos por Día', value: productivityMetrics.averageJobsPerDay, unit: 'trabajos/día', category: 'Productivity' },
      { name: 'Tiempo Promedio de Completación', value: averageCompletionTime, unit: 'días', category: 'Time' },
      { name: 'Eficiencia', value: productivityMetrics.efficiency, unit: '%', category: 'Performance' }
    ]
  }
}

async function generateQualityReport(companyId: string, startDate: Date, endDate: Date) {
  const jobs = await prisma.job.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      client: true,
      technician: true
    }
  })

  // Métricas de calidad (basadas en estados y tiempos)
  const qualityMetrics = {
    completionRate: jobs.length > 0 ? (jobs.filter(job => job.status === 'COMPLETED').length / jobs.length) * 100 : 0,
    onTimeCompletion: 0, // Se puede calcular basado en scheduledAt vs completedAt
    clientSatisfaction: 0 // Se puede implementar un sistema de calificaciones
  }

  return {
    summary: qualityMetrics,
    metrics: [
      { name: 'Tasa de Completación', value: qualityMetrics.completionRate, unit: '%', category: 'Quality' },
      { name: 'Cumplimiento de Tiempo', value: qualityMetrics.onTimeCompletion, unit: '%', category: 'Quality' },
      { name: 'Satisfacción del Cliente', value: qualityMetrics.clientSatisfaction, unit: '%', category: 'Quality' }
    ]
  }
}

function generateMonthlyData(jobs: any[], cashTransactions: any[], startDate: Date, endDate: Date) {
  const monthlyData = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

    const monthJobs = jobs.filter(job =>
      job.createdAt >= monthStart && job.createdAt <= monthEnd
    )

    const monthTransactions = cashTransactions.filter(transaction =>
      transaction.date >= monthStart && transaction.date <= monthEnd
    )

    const monthRevenue = monthJobs.reduce((sum, job) => {
      return sum + job.payments.reduce((paymentSum: number, payment: any) =>
        paymentSum + (payment.status === 'COMPLETED' ? payment.amount : 0), 0)
    }, 0)

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    monthlyData.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses,
      jobsCount: monthJobs.length
    })

    current.setMonth(current.getMonth() + 1)
  }

  return monthlyData
}

function generateReportSummary(type: string, data: any): string {
  switch (type) {
    case 'FINANCIAL':
      return `Reporte financiero con ingresos de $${data.summary.totalRevenue.toLocaleString()} y utilidad de $${data.summary.profit.toLocaleString()}`
    case 'OPERATIONAL':
      return `Reporte operacional con ${data.summary.totalJobs} trabajos, ${data.summary.completionRate.toFixed(1)}% de completación`
    case 'PERFORMANCE':
      return `Reporte de rendimiento con ${data.summary.averageJobsPerDay.toFixed(1)} trabajos por día y ${data.summary.efficiency.toFixed(1)}% de eficiencia`
    case 'QUALITY':
      return `Reporte de calidad con ${data.summary.completionRate.toFixed(1)}% de completación`
    default:
      return 'Reporte generado exitosamente'
  }
}