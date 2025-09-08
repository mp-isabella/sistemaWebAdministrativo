import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { status, observations, images, signature } = await request.json()
    const { id: jobId } = await params

    // Verificar que el usuario puede actualizar este trabajo
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { technician: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Solo el técnico asignado o admin puede actualizar
    if ((session.user as any).role !== "admin" && job.technicianId !== session.user.id) {
      return NextResponse.json({ error: "Sin permisos para actualizar este trabajo" }, { status: 403 })
    }

    // Actualizar el trabajo
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status,
        ...(status === "COMPLETED" && { completedAt: new Date() }),
        ...(observations && { description: observations }),
        ...(images && images.length > 0 && { images }),
        ...(signature && { signature }),
      },
      include: {
        service: true,
        client: true,
        technician: true
      }
    })

    // Si el trabajo se completó, crear automáticamente una transacción de ingreso
    if (status === "COMPLETED") {
      try {
        // Obtener el usuario que está realizando la acción
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! }
        })

        if (user) {
          // Crear transacción de ingreso automática
          await prisma.cashTransaction.create({
            data: {
              amount: updatedJob.service.price || 0,
              type: 'INCOME',
              description: `Pago por servicio: ${updatedJob.service.name} - ${updatedJob.client.name}`,
              category: 'servicios',
              paymentMethod: 'efectivo', // Por defecto, se puede cambiar después
              reference: `Trabajo #${updatedJob.id}`,
              date: new Date(),
              createdById: user.id
            }
          })
        }
      } catch (error) {
        console.error('Error creating automatic income transaction:', error)
        // No fallamos la actualización del trabajo si hay error en la transacción
      }
    }

    return NextResponse.json({ success: true, job: updatedJob })
  } catch (error) {
    console.error("Error updating job status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
