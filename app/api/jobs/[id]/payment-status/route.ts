import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden cambiar estado de pago
    const userRole = (session.user as any).role?.toLowerCase()
    if (!["admin", "secretaria", "administrador"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id } = await params
    const { isPaid, paymentMethod, amount } = await request.json()

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

    // Buscar o crear registro de pago
    let payment = await prisma.payment.findFirst({
      where: { jobId: id }
    })

    if (!payment) {
      // Crear nuevo registro de pago si no existe
      payment = await prisma.payment.create({
        data: {
          jobId: id,
          amount: amount || 0,
          status: isPaid ? "PAID" : "PENDING",
          method: paymentMethod || "CASH",
          notes: `Estado de pago actualizado desde calendario`,
          createdById: (session.user as any).id
        }
      })
    } else {
      // Actualizar registro existente
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          amount: amount || payment.amount,
          status: isPaid ? "PAID" : "PENDING",
          method: paymentMethod || payment.method,
          notes: payment.notes + `\nEstado actualizado desde calendario: ${new Date().toISOString()}`
        }
      })
    }

    // Si se marca como pagado, crear transacción de INGRESO en caja
    if (isPaid) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! }
        })

        if (user) {
          // Verificar si ya existe una transacción para este trabajo
          const existingTransaction = await prisma.cashTransaction.findFirst({
            where: {
              reference: `Trabajo #${id}`,
              type: 'INCOME'
            }
          })

          if (!existingTransaction) {
            // Usar la fecha del trabajo programado para organizar por año y mes
            const jobDate = job.scheduledAt || new Date()
            const transactionDate = new Date(jobDate)

            // Crear transacción de INGRESO (pago recibido)
            await prisma.cashTransaction.create({
              data: {
                amount: amount || job.totalBudget || 0,
                type: 'INCOME',
                description: `Pago recibido por trabajo: ${job.title || job.service?.name || 'Sin título'} - ${job.client.name}`,
                category: 'servicios',
                paymentMethod: paymentMethod || 'efectivo',
                reference: `Trabajo #${id}`,
                date: transactionDate,
                createdById: user.id
              }
            })
          } else {
            // No hay transacción que registrar
          }
        }
      } catch (error) {
        console.error('Error al registrar transacción:', error)
        // No fallamos la actualización del pago si hay error en la transacción
      }
    } else {
      // Si se marca como pendiente, eliminar transacción de caja si existe
      try {
        await prisma.cashTransaction.deleteMany({
          where: {
            reference: `Trabajo #${id}`,
            type: 'INCOME'
          }
        })

      } catch (error) {

      }
    }

    return NextResponse.json({
      success: true,
      payment,
      message: isPaid
        ? `Trabajo marcado como pagado. Se ha registrado un ingreso de $${amount?.toLocaleString() || '0'} en cajas.`
        : "Trabajo marcado como pendiente. Se ha eliminado el ingreso de cajas."
    })

  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
