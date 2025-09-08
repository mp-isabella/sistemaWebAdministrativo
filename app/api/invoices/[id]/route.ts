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

    // Verificar permisos: solo admin puede ver facturas
    const userRole = (session.user as any).role
    if (!userRole || userRole.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const invoice = await prisma.invoice.findUnique({
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

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    return NextResponse.json(invoice)

  } catch (error) {
    console.error('Error fetching invoice:', error)
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

    // Verificar permisos: solo admin puede editar facturas
    const userRole = (session.user as any).role;
    if (!userRole || userRole.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { dueDate, taxRate, notes, items, status } = body

    // Verificar que la factura existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
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

    // Actualizar factura
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json(updatedInvoice)

  } catch (error) {
    console.error('Error updating invoice:', error)
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

    // Verificar permisos: solo admin puede eliminar facturas
    const userRole = (session.user as any).role;
    if (!userRole || userRole.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Verificar que la factura existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // Eliminar factura (los items se eliminan automáticamente por CASCADE)
    await prisma.invoice.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Factura eliminada exitosamente' })

  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
