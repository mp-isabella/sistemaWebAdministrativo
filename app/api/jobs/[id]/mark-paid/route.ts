import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden marcar como pagado
    if (!['admin', 'secretaria'].includes((session.user as any).role?.toLowerCase() || '')) {
      return NextResponse.json({ error: "Sin permisos para marcar como pagado" }, { status: 403 })
    }

    const { paymentMethod = 'efectivo' } = await request.json()
    const { id: jobId } = await params

    // Verificar que el trabajo existe y está completado
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { 
        service: true, 
        client: true, 
        technician: true 
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    if (job.status !== "COMPLETED") {
      return NextResponse.json({ error: "Solo se pueden marcar como pagados trabajos completados" }, { status: 400 })
    }

    // Verificar si ya existe una transacción para este trabajo
    const existingTransaction = await prisma.cashTransaction.findFirst({
      where: {
        reference: `Trabajo #${jobId}`,
        type: 'INCOME'
      }
    })

    if (existingTransaction) {
      return NextResponse.json({ error: "Este trabajo ya ha sido marcado como pagado" }, { status: 400 })
    }

    // Obtener el usuario que está realizando la acción
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Crear transacción de ingreso
    const transaction = await prisma.cashTransaction.create({
      data: {
        amount: job.service.price || 0,
        type: 'INCOME',
        description: `Pago por servicio: ${job.service.name} - ${job.client.name}`,
        category: 'servicios',
        paymentMethod: paymentMethod,
        reference: `Trabajo #${jobId}`,
        date: new Date(),
        createdById: user.id
      },
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      transaction,
      message: "Trabajo marcado como pagado exitosamente"
    })

  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
