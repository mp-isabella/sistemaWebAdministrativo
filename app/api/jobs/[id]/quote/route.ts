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

    // Buscar el trabajo
    const job = await prisma.job.findUnique({
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
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    // Buscar cotización relacionada al trabajo usando quoteId
    const quote = (job as any).quoteId ? await prisma.quote.findUnique({
      where: { id: (job as any).quoteId },
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
    }) : null

    return NextResponse.json({
      job,
      hasQuote: !!quote,
      quote: quote
    })

  } catch (error) {
    console.error('Error fetching job quote:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos: solo admin y secretaria pueden crear cotizaciones
    if (!(session.user as any).role || !["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Buscar el trabajo
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        service: true,
        company: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    // Verificar si ya existe una cotización para este trabajo
    if ((job as any).quoteId) {
      return NextResponse.json({ error: 'Ya existe una cotización para este trabajo' }, { status: 400 })
    }

    // Generar número de cotización único
    const quoteNumber = `COT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calcular fecha de validez (30 días desde hoy)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    // Crear cotización basada en el servicio del trabajo
    const servicePrice = job.service.price || 0
    const subtotal = servicePrice
    const taxRate = 19
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        date: new Date(),
        validUntil,
        subtotal,
        tax,
        total,
        taxRate,
        notes: `Cotización generada automáticamente para el trabajo: ${job.title}`,
        status: 'DRAFT',
        clientId: job.clientId,
        companyId: job.companyId,
        createdById: session.user.id,
        items: {
          create: {
            description: job.service.name,
            quantity: 1,
            unitPrice: servicePrice,
            total: servicePrice
          }
        }
      },
      include: {
        items: true,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Actualizar el trabajo para vincularlo con la cotización
    await prisma.job.update({
      where: { id: params.id },
      data: { quoteId: quote.id } as any
    })

    return NextResponse.json({
      message: 'Cotización creada exitosamente',
      quote
    })

  } catch (error) {
    console.error('Error creating quote for job:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
