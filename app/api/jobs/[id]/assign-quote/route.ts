import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Obtener información del trabajo
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        service: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Obtener cotizaciones disponibles para el cliente
    const availableQuotes = await prisma.quote.findMany({
      where: {
        clientId: job.clientId,
        jobId: null // Cotizaciones que no están asignadas a ningún trabajo
      },
      include: {
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      job,
      availableQuotes
    })

  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden asignar cotizaciones
    const userRole = (session.user as any).role.toLowerCase()
    if (!["admin", "secretaria", "administrador"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id } = await params
    const { quoteId } = await request.json()

    if (!quoteId) {
      return NextResponse.json({ error: "ID de cotización requerido" }, { status: 400 })
    }

    // Verificar que el trabajo existe
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        service: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar que la cotización existe y no está asignada
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        job: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    if (quote.jobId) {
      return NextResponse.json({ error: "Esta cotización ya está asignada a otro trabajo" }, { status: 400 })
    }

    if (quote.clientId !== job.clientId) {
      return NextResponse.json({ error: "La cotización no pertenece al mismo cliente" }, { status: 400 })
    }

    // Verificar si el trabajo ya tiene una cotización
    const existingJobQuote = await prisma.quote.findFirst({
      where: { jobId: id }
    })

    if (existingJobQuote) {
      return NextResponse.json({
        error: "Este trabajo ya tiene una cotización asignada",
        existingQuote: existingJobQuote
      }, { status: 400 })
    }

    // Asignar la cotización al trabajo
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        jobId: id,
        notes: `${quote.notes || ''}\n\nAsignada al trabajo: ${job.title || job.service?.name || 'Sin título'}`
      },
      include: {
        job: {
          include: {
            client: true,
            service: true,
            technician: true
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

    return NextResponse.json({
      message: "Cotización asignada exitosamente",
      quote: updatedQuote
    }, { status: 200 })

  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
