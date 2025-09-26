import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const jobId = params.id
    const { isPaid, paymentMethod, amount } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: "ID del trabajo requerido" }, { status: 400 })
    }

    // Verificar que el trabajo existe
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Buscar o crear información de pago
    let payment = await prisma.payment.findFirst({
      where: { jobId }
    })

    if (payment) {
      // Actualizar pago existente
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isPaid ? 'PAID' : 'PENDING',
          method: paymentMethod || 'CASH',
          amount: amount || job.totalBudget || 0
        }
      })
    } else {
      // Crear nuevo pago
      payment = await prisma.payment.create({
        data: {
          jobId,
          amount: amount || job.totalBudget || 0,
          method: paymentMethod || 'CASH',
          status: isPaid ? 'PAID' : 'PENDING',
          createdById: (session.user as any).id
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: isPaid ? "Trabajo marcado como pagado" : "Estado de pago actualizado",
      payment
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}