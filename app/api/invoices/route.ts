import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin puede ver facturas
    if (!session.user.role || session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {}

    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
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
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(invoices)

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin puede crear facturas
    if (!session.user.role || session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, dueDate, taxRate, notes, items } = body

    if (!clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Generar número de factura único
    const invoiceNumber = `FAC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    // Crear factura
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        tax,
        total,
        taxRate,
        notes,
        clientId,
        createdById: session.user.id,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
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

    return NextResponse.json(invoice, { status: 201 })

  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
