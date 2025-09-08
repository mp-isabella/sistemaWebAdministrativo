import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden ver cotizaciones
    if (!(session.user as any).role || !["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            company: true,
            rut: true
          }
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json(quote)

  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden editar cotizaciones
    if (!(session.user as any).role || !["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { validUntil, taxRate, notes, items, status } = body

    // Verificar que la cotización existe
    const existingQuote = await prisma.quote.findUnique({
      where: { id: params.id }
    })

    if (!existingQuote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Calcular totales si hay items
    let subtotal = 0
    let tax = 0
    let total = 0

    if (items && items.length > 0) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      tax = subtotal * (taxRate / 100)
      total = subtotal + tax
    }

    // Actualizar cotización
    const updatedQuote = await prisma.quote.update({
      where: { id: params.id },
      data: {
        validUntil: validUntil ? new Date(validUntil) : undefined,
        taxRate,
        notes,
        status,
        subtotal,
        tax,
        total,
        items: {
          deleteMany: {},
          create: items ? items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          })) : []
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            company: true,
            rut: true
          }
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedQuote)

  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const quoteId = params.id
    console.log('Intentando eliminar cotización:', quoteId)

    // Eliminar en una sola transacción
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar items primero
      await tx.quoteItem.deleteMany({
        where: { quoteId: quoteId }
      })

      // Eliminar la cotización
      const deletedQuote = await tx.quote.delete({
        where: { id: quoteId }
      })

      return deletedQuote
    })

    console.log('Cotización eliminada exitosamente:', result)
    return NextResponse.json({ 
      success: true,
      message: 'Cotización eliminada correctamente'
    })

  } catch (error) {
    console.error('Error eliminando cotización:', error)
    return NextResponse.json({ 
      error: 'Error al eliminar la cotización',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
