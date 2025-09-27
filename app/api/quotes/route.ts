import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: permitir todos los roles por ahora para testing

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

    const quotes = await prisma.quote.findMany({
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
        },
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            scheduledAt: true,
            startTime: true,
            endTime: true,
            technician: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(quotes)

  } catch (error) {

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = { id: (session.user as any).id, role: (session.user as any).role }

    // Verificar permisos: permitir todos los roles por ahora para testing

    const body = await request.json()

    const {
      clientName,
      clientId,
      companyId,
      validUntil,
      taxRate,
      discount,
      notes,
      items,
      technician,
      diagnosis,
      serviceType,
      clientAddress,
      clientEmail,
      clientPhone,
      clientRegion,
      clientCommune
    } = body

    // Validación simplificada
    if (!clientName) {

      return NextResponse.json({ error: 'Nombre del cliente es requerido' }, { status: 400 })
    }

    if (!validUntil) {

      return NextResponse.json({ error: 'Fecha de validez es requerida' }, { status: 400 })
    }

    // Verificar que la empresa existe si se proporciona companyId
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })

      if (!company) {

        return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 400 })
      }
    }

    // Verificar que el cliente existe si se proporciona clientId
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      })

      if (!client) {

        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })
      }
    }

    // Generar número de cotización único con nombre del cliente
    const clientNameForQuote = clientName ? clientName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20).trim() : 'Cliente'
    const quoteNumber = `Cotización para ${clientNameForQuote}`

    // Calcular totales de forma segura
    const subtotal = items ? items.reduce((sum: number, item: any) => {
      const quantity = item.quantity || 0
      const unitPrice = item.unitPrice || 0
      return sum + (quantity * unitPrice)
    }, 0) : 0

    const discountAmount = discount || 0
    const subtotalAfterDiscount = subtotal - discountAmount
    const tax = subtotalAfterDiscount * ((taxRate || 19) / 100)
    const total = subtotalAfterDiscount + tax

    // Crear cotización de forma simplificada
    const quoteData = {
      quoteNumber,
      validUntil: new Date(validUntil),
      subtotal,
      discount: discountAmount,
      tax,
      total,
      taxRate,
      notes: notes || '',
      technician: technician || '',
      diagnosis: diagnosis || '',
      serviceType: serviceType || '',
      // Campos del cliente (texto libre)
      clientName: clientName,
      clientAddress: clientAddress || null,
      clientEmail: clientEmail || null,
      clientPhone: clientPhone || null,
      clientRegion: clientRegion || null,
      clientCommune: clientCommune || null,
      // Relación con cliente (opcional)
      clientId: clientId || null,
      companyId: companyId || null,
      createdById: user.id,
    }

    const quote = await prisma.quote.create({
      data: quoteData,
      include: {
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

    // Crear items por separado
    if (items && items.length > 0) {
      const itemsData = items.map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        total: (item.quantity || 0) * (item.unitPrice || 0),
        materials: item.materials || null,
        exposedArea: item.exposedArea || null,
        quoteId: quote.id
      }))

      await prisma.quoteItem.createMany({
        data: itemsData
      })
    }

    return NextResponse.json(quote, { status: 201 })

  } catch (error: any) {

    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
