import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from 'next/server';

// GET - Obtener liquidación por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const liquidationId = params.id
    // Verificar que la liquidación existe primero
    const liquidationExists = await prisma.liquidation.findUnique({
      where: { id: liquidationId },
      select: { id: true }
    });

    if (!liquidationExists) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }
    const liquidation = await prisma.liquidation.findUnique({
      where: { id: liquidationId },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            phone: true
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

    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// PUT - Actualizar liquidación
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden editar liquidaciones
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para editar liquidaciones' }, { status: 403 })
    }

    const liquidationId = params.id
    const body = await _request.json()

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

    // Verificar que la liquidación existe
    const existingLiquidation = await (prisma as any).liquidation.findUnique({
      where: { id: liquidationId }
    })

    if (!existingLiquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    // Calcular totales
    const totalEarnings = items?.filter((item: any) => item.type === 'EARNINGS')
      .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0

    const totalDeductions = items?.filter((item: any) => item.type !== 'EARNINGS')
      .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0

    const totalAdvances = advances?.reduce((sum: number, advance: any) => sum + (advance.amount || 0), 0) || 0

    const netSalary = parseFloat(baseSalary) + totalEarnings - totalDeductions - totalAdvances

    // Actualizar liquidación usando transacción
    await prisma.$transaction(async (tx) => {
      // _updatedLiquidation is intentionally unused as we only need to execute the transaction
      // Eliminar items y advances existentes
      await (tx as any).liquidationItem.deleteMany({
        where: { liquidationId }
      })

      await (tx as any).liquidationAdvance.deleteMany({
        where: { liquidationId }
      })

      // Actualizar liquidación
      const liquidation = await (tx as any).liquidation.update({
        where: { id: liquidationId },
        data: {
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          baseSalary: parseFloat(baseSalary),
          totalEarnings,
          totalDeductions,
          totalAdvances,
          netSalary,
          taxRate: parseFloat(taxRate || 19),
          notes,
          technicianId,
          companyId,
          updatedAt: new Date()
        }
      })

      // Crear nuevos items
      if (items && items.length > 0) {
        await (tx as any).liquidationItem.createMany({
          data: items.map((item: any) => ({
            liquidationId,
            description: item.description,
            type: item.type || 'EARNINGS',
            quantity: parseFloat(item.quantity || 0),
            unitPrice: parseFloat(item.unitPrice || 0),
            total: parseFloat(item.total || 0),
            notes: item.notes
          }))
        })
      }

      // Crear nuevos advances
      if (advances && advances.length > 0) {
        await (tx as any).liquidationAdvance.createMany({
          data: advances.map((advance: any) => ({
            liquidationId,
            description: advance.description,
            amount: parseFloat(advance.amount || 0),
            date: new Date(advance.date),
            notes: advance.notes
          }))
        })
      }

      return liquidation
    })

    // Obtener liquidación actualizada con relaciones
    const liquidationWithRelations = await (prisma as any).liquidation.findUnique({
      where: { id: liquidationId },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            phone: true
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

    return NextResponse.json(liquidationWithRelations, { status: 200 })

  } catch (error) {

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar liquidación
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin puede eliminar liquidaciones
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole !== 'administrador' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos para eliminar liquidaciones' }, { status: 403 })
    }

    const liquidationId = params.id

    // Verificar que la liquidación existe
    const existingLiquidation = await (prisma as any).liquidation.findUnique({
      where: { id: liquidationId }
    })

    if (!existingLiquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    // Eliminar liquidación (los items y advances se eliminan automáticamente por CASCADE)
    await (prisma as any).liquidation.delete({
      where: { id: liquidationId }
    })

    return NextResponse.json({ message: 'Liquidación eliminada correctamente' }, { status: 200 })

  } catch (error) {

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}