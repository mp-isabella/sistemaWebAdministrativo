import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin puede ver liquidaciones
    if (!session.user.role || session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const liquidation = await prisma.liquidation.findUnique({
      where: { id: params.id },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
            address: true,
            phone: true,
            email: true,
            taxId: true
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
      }
    })

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    return NextResponse.json(liquidation)

  } catch (error) {
    console.error('Error fetching liquidation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin puede editar liquidaciones
    if (!session.user.role || session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      periodStart, 
      periodEnd, 
      baseSalary, 
      taxRate, 
      notes, 
      items, 
      advances, 
      status 
    } = body

    // Verificar que la liquidación existe
    const existingLiquidation = await prisma.liquidation.findUnique({
      where: { id: params.id }
    })

    if (!existingLiquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    // Calcular totales si hay items
    let totalEarnings = 0
    let totalDeductions = 0
    let netSalary = 0

    if (items && items.length > 0) {
      totalEarnings = items.filter((item: any) => item.type === 'EARNINGS')
        .reduce((sum: number, item: any) => sum + (item.total || 0), 0)
      
      totalDeductions = items.filter((item: any) => item.type !== 'EARNINGS')
        .reduce((sum: number, item: any) => sum + (item.total || 0), 0)
      
      netSalary = (baseSalary || existingLiquidation.baseSalary) + totalEarnings - totalDeductions
    }

    // Actualizar liquidación
    const updatedLiquidation = await prisma.liquidation.update({
      where: { id: params.id },
      data: {
        periodStart: periodStart ? new Date(periodStart) : undefined,
        periodEnd: periodEnd ? new Date(periodEnd) : undefined,
        baseSalary: baseSalary !== undefined ? baseSalary : undefined,
        totalEarnings: items ? totalEarnings : undefined,
        totalDeductions: items ? totalDeductions : undefined,
        netSalary: items ? netSalary : undefined,
        taxRate: taxRate !== undefined ? taxRate : undefined,
        notes,
        status: status || undefined,
        // Actualizar items si se proporcionan
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: any) => ({
              description: item.description,
              type: item.type,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              notes: item.notes
            }))
          }
        }),
        // Actualizar anticipos si se proporcionan
        ...(advances && {
          advances: {
            deleteMany: {},
            create: advances.map((advance: any) => ({
              date: new Date(advance.date),
              amount: advance.amount,
              description: advance.description,
              notes: advance.notes
            }))
          }
        })
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
            address: true,
            phone: true,
            email: true,
            taxId: true
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
      }
    })

    return NextResponse.json(updatedLiquidation)

  } catch (error) {
    console.error('Error updating liquidation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin puede eliminar liquidaciones
    if (!session.user.role || session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Verificar que la liquidación existe
    const existingLiquidation = await prisma.liquidation.findUnique({
      where: { id: params.id }
    })

    if (!existingLiquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    // Verificar que no esté pagada
    if (existingLiquidation.status === 'PAID') {
      return NextResponse.json({ 
        error: 'No se puede eliminar una liquidación que ya ha sido pagada' 
      }, { status: 400 })
    }

    // Eliminar liquidación (los items y anticipos se eliminan automáticamente por CASCADE)
    await prisma.liquidation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Liquidación eliminada exitosamente' })

  } catch (error) {
    console.error('Error deleting liquidation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
