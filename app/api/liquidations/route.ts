import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden ver liquidaciones
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para acceder a liquidaciones' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const technicianId = searchParams.get('technicianId')
    const companyId = searchParams.get('companyId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {}

    if (status) where.status = status
    if (technicianId) where.technicianId = technicianId
    if (companyId) where.companyId = companyId
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const liquidations = await (prisma as any).liquidation.findMany({
      where,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        },
        items: true,
        advances: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Mapear liquidaciones al formato esperado
    const mappedLiquidations = liquidations.map((liquidation: any) => {
      // Calcular totales
      const totalHours = liquidation.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
      const totalServices = liquidation.items?.filter((item: any) => item.type === 'EARNINGS').length || 0
      const totalBonuses = liquidation.items?.filter((item: any) => item.type === 'EARNINGS').reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
      const totalDeductions = liquidation.items?.filter((item: any) => item.type === 'DEDUCTION').reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
      const finalAmount = liquidation.netSalary || (liquidation.baseSalary + totalBonuses - totalDeductions)

      return {
        id: liquidation.id,
        liquidationNumber: liquidation.liquidationNumber || `LIQ-${liquidation.id.slice(-6)}`,
        technician: liquidation.technician,
        company: liquidation.company,
        periodStart: liquidation.periodStart?.toISOString(),
        periodEnd: liquidation.periodEnd?.toISOString(),
        baseSalary: liquidation.baseSalary,
        totalHours,
        totalServices,
        bonuses: totalBonuses,
        deductions: totalDeductions,
        finalAmount,
        status: liquidation.status,
        createdAt: liquidation.createdAt.toISOString(),
        notes: liquidation.notes
      }
    })

    return NextResponse.json(mappedLiquidations)

  } catch (error) {

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden crear liquidaciones
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para crear liquidaciones' }, { status: 403 })
    }

    const body = await request.json()

    const {
      technicianId,
      companyId,
      periodStart,
      periodEnd,
      baseSalary,
      taxRate,
      notes,
      items,
      advances
    } = body

    // Validaciones básicas
    if (!technicianId || !companyId || !periodStart || !periodEnd || !baseSalary) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Generar número de liquidación único
    const liquidationNumber = `LIQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Calcular totales
    const totalEarnings = items?.filter((item: any) => item.type === 'EARNINGS')
      .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0

    const totalDeductions = items?.filter((item: any) => item.type !== 'EARNINGS')
      .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0

    const totalAdvances = advances?.reduce((sum: number, advance: any) => sum + (advance.amount || 0), 0) || 0

    const netSalary = parseFloat(baseSalary) + totalEarnings - totalDeductions - totalAdvances

    const liquidation = await (prisma as any).liquidation.create({
      data: {
        liquidationNumber,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        baseSalary: parseFloat(baseSalary),
        totalEarnings,
        totalDeductions,
        totalAdvances,
        netSalary,
        taxRate: parseFloat(taxRate || 19),
        notes,
        status: 'DRAFT',
        technicianId,
        companyId,
        createdById: (session as any).user?.id,
        items: {
          create: items?.map((item: any) => ({
            description: item.description,
            type: item.type || 'EARNINGS',
            quantity: parseFloat(item.quantity || 0),
            unitPrice: parseFloat(item.unitPrice || 0),
            total: parseFloat(item.total || 0),
            notes: item.notes
          })) || []
        },
        advances: {
          create: advances?.map((advance: any) => ({
            description: advance.description,
            amount: parseFloat(advance.amount || 0),
            date: new Date(advance.date),
            notes: advance.notes
          })) || []
        }
      },
      include: {
        technician: true,
        company: true,
        items: true,
        advances: true
      }
    })

    return NextResponse.json(liquidation, { status: 201 })

  } catch (error) {

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
