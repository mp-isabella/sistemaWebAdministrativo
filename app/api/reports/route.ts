import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const companyId = searchParams.get('companyId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const status = searchParams.get('status')

    const where: any = {}

    // Filtros por rol
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para acceder a reportes' }, { status: 403 })
    }

    if (type) where.type = type
    if (companyId) where.companyId = companyId
    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)
    if (status) where.status = status

    const reports = await (prisma as any).report.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            primaryColor: true,
            secondaryColor: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        metrics: true,
        _count: {
          select: {
            metrics: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Estadísticas generales
    const stats = {
      total: reports.length,
      byType: {
        FINANCIAL: reports.filter((r: any) => r.type === 'FINANCIAL').length,
        OPERATIONAL: reports.filter((r: any) => r.type === 'OPERATIONAL').length,
        PERFORMANCE: reports.filter((r: any) => r.type === 'PERFORMANCE').length,
        QUALITY: reports.filter((r: any) => r.type === 'QUALITY').length
      },
      byStatus: {
        GENERATING: reports.filter((r: any) => r.status === 'GENERATING').length,
        COMPLETED: reports.filter((r: any) => r.status === 'COMPLETED').length,
        FAILED: reports.filter((r: any) => r.status === 'FAILED').length
      },
      byCompany: reports.reduce((acc: Record<string, number>, report: any) => {
        const companyName = report.company.name
        acc[companyName] = (acc[companyName] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({ reports, stats })

  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      type,
      period,
      year,
      month,
      startDate,
      endDate,
      companyId
    } = body

    // Validar permisos
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para generar reportes' }, { status: 403 })
    }

    // Crear el reporte
    const report = await (prisma as any).report.create({
      data: {
        title,
        type,
        period,
        year,
        month,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
        createdById: session.user.id,
        status: 'GENERATING'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            primaryColor: true,
            secondaryColor: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(report)

  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}