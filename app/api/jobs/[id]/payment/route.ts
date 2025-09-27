import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ error: "ID del trabajo requerido" }, { status: 400 })
    }

    // Buscar información de pago
    const payment = await prisma.payment.findFirst({
      where: { jobId }
    })

    if (payment) {
      return NextResponse.json({
        hasPayment: true,
        payment
      })
    } else {
      return NextResponse.json({
        hasPayment: false,
        payment: null
      })
    }

  } catch (error) {
    console.error('Error fetching payment info:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}