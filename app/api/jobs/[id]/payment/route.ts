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

    // Buscar información de pago existente
    const payment = await prisma.payment.findFirst({
      where: { jobId: id },
      include: {
        job: {
          include: {
            client: true,
            service: true,
            technician: true
          }
        }
      }
    })

    return NextResponse.json({
      hasPayment: !!payment,
      payment: payment || null,
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

    // Solo admin y secretaria pueden crear registros de pago
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

    // Verificar si ya existe un registro de pago
    const existingPayment = await prisma.payment.findFirst({
      where: { jobId: id }
    })

    if (existingPayment) {
      return NextResponse.json({
        error: "Ya existe un registro de pago para este trabajo",
        payment: existingPayment
      }, { status: 400 })
    }

    // Crear nuevo registro de pago
    const payment = await prisma.payment.create({
      data: {
        jobId: id,
        amount: 0, // Monto inicial en 0
        status: "PENDING", // Estado inicial pendiente
        method: "CASH", // Método por defecto
        notes: `Registro de pago creado para el trabajo: ${job.title || job.service?.name || 'Sin título'}`,
        createdById: session.user.id
      },
      include: {
        job: {
          include: {
            client: true,
            service: true,
            technician: true
          }
        }
      }
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
