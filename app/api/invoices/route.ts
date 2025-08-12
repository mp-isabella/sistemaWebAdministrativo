import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          client: {
            select: { name: true, email: true, phone: true }
          },
          items: true,
          createdBy: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.invoice.count({ where })
    ])

    // Calculate totals
    const totals = await prisma.invoice.aggregate({
      where,
      _sum: {
        total: true,
        subtotal: true,
        tax: true
      }
    })

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalAmount: totals._sum.total || 0,
        subtotalAmount: totals._sum.subtotal || 0,
        taxAmount: totals._sum.tax || 0
      }
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      clientId, 
      invoiceNumber, 
      date, 
      dueDate, 
      items, 
      subtotal, 
      tax, 
      total, 
      notes,
      taxRate 
    } = body

    // Validation
    if (!clientId || !invoiceNumber || !date || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Campos requeridos: clientId, invoiceNumber, date, items' 
      }, { status: 400 })
    }

    if (subtotal <= 0 || total <= 0) {
      return NextResponse.json({ error: 'Los montos deben ser mayores a 0' }, { status: 400 })
    }

    // Validate items
    for (const item of items) {
      if (!item.description || item.quantity <= 0 || item.unitPrice <= 0) {
        return NextResponse.json({ 
          error: 'Todos los items deben tener descripción, cantidad y precio válidos' 
        }, { status: 400 })
      }
    }

    // Check if invoice number already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber }
    })

    if (existingInvoice) {
      return NextResponse.json({ 
        error: 'Ya existe una factura con este número' 
      }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        total: parseFloat(total),
        taxRate: parseFloat(taxRate) || 19,
        notes: notes || null,
        status: 'PENDING',
        createdById: user.id,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.total)
          }))
        }
      },
      include: {
        client: {
          select: { name: true, email: true, phone: true }
        },
        items: true,
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ invoice }, { status: 201 })

  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
