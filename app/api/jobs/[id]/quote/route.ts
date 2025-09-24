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

    // Verificar que el trabajo existe
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Buscar cotización existente
    const quote = await prisma.quote.findFirst({
      where: { jobId: id },
      include: {
        job: {
          include: {
            client: true,
            service: true,
            technician: true
          }
        },
        items: true
      }
    })

    return NextResponse.json({
      hasQuote: !!quote,
      quote: quote || null,
      job
    })
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden crear cotizaciones
    const userRole = (session.user as any).role.toLowerCase()
    if (!["admin", "secretaria", "administrador"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id } = await params

    // Verificar que el trabajo existe
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar si ya existe una cotización
    const existingQuote = await prisma.quote.findFirst({
      where: { jobId: id }
    })

    if (existingQuote) {
      return NextResponse.json({
        error: "Ya existe una cotización para este trabajo",
        quote: existingQuote
      }, { status: 400 })
    }

    // Crear nueva cotización
    const quote = await prisma.quote.create({
      data: {
        jobId: id,
        clientId: job.clientId,
        status: "DRAFT", // Estado inicial borrador
        total: 0, // Total inicial en 0
        notes: `Cotización creada para el trabajo: ${job.title || job.service?.name || 'Sin título'}`,
        createdById: session.user.id as string,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Válida por 30 días
      },
      include: {
        job: {
          include: {
            client: true,
            service: true,
            technician: true
          }
        },
        items: true
      }
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}