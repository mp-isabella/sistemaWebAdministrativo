import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden ver cotizaciones
    if (!(session.user as any).role || !["administrador", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    const quote = await prisma.quote.findUnique({
      where: { id },
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

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden editar cotizaciones
    if (!(session.user as any).role || !["administrador", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    const body = await _request.json()
    const {
      clientName,
      clientAddress,
      clientPhone,
      clientRegion,
      clientCommune,
      companyId,
      validUntil,
      taxRate,
      discount,
      notes,
      items,
      technician,
      diagnosis,
      serviceType,
      warranty,
      status
    } = body

    // Verificar que la cotización existe
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
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

    if (!existingQuote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Calcular totales si hay items
    let subtotal = 0
    let tax = 0
    let total = 0

    if (items && items.length > 0) {
      subtotal = items.reduce((sum: number, item: any) => {
        const quantity = item.quantity || 0
        const unitPrice = item.unitPrice || 0
        return sum + (quantity * unitPrice)
      }, 0)

      // Aplicar descuento si existe
      const discountAmount = discount || 0
      const subtotalAfterDiscount = subtotal - discountAmount

      tax = subtotalAfterDiscount * ((taxRate || 19) / 100)
      total = subtotalAfterDiscount + tax
    }

    // Actualizar cotización
    const updateData: any = {
      clientName: clientName || (existingQuote as any).clientName,
      clientAddress: clientAddress || (existingQuote as any).clientAddress,
      clientPhone: clientPhone || (existingQuote as any).clientPhone,
      clientRegion: clientRegion || (existingQuote as any).clientRegion,
      clientCommune: clientCommune || (existingQuote as any).clientCommune,
      companyId: companyId || (existingQuote as any).companyId,
      validUntil: validUntil ? new Date(validUntil) : existingQuote.validUntil,
      taxRate: taxRate !== undefined ? taxRate : existingQuote.taxRate,
      discount: discount !== undefined ? discount : existingQuote.discount,
      notes: notes || existingQuote.notes,
      technician: technician || (existingQuote as any).technician,
      diagnosis: diagnosis || (existingQuote as any).diagnosis,
      serviceType: serviceType || (existingQuote as any).serviceType,
      warranty: warranty || (existingQuote as any).warranty,
      status: status || existingQuote.status,
      subtotal,
      tax,
      total,
      items: {
        deleteMany: {},
        create: items ? items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          total: (item.quantity || 0) * (item.unitPrice || 0),
          materials: item.materials,
          exposedArea: item.exposedArea
        })) : []
      }
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: quoteId } = await params

    // Eliminar en una sola transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar items primero
      await tx.quoteItem.deleteMany({
        where: { quoteId: quoteId }
      })

      // Eliminar la cotización
      await tx.quote.delete({
        where: { id: quoteId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Cotización eliminada correctamente'
    })

  } catch (error) {

    return NextResponse.json({
      error: 'Error al eliminar la cotización',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
