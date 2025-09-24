import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const requestBody = await request.json()

    const { status, observations, images, signature } = requestBody
    const { id: jobId } = await params

    // Validar que el estado sea válido
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {

      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    // Verificar que el usuario puede actualizar este trabajo

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        technician: true,
        client: true,
        service: true
      },
    })

    if (!job) {

      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar permisos según el rol del usuario
    const userRole = (session.user as any).role?.toLowerCase()

    const canUpdate =
      userRole === 'administrador' ||
      userRole === 'secretaria' ||
      (userRole === 'tecnico' && job.technicianId === (session.user as any).id)

    if (!canUpdate) {

      return NextResponse.json({ error: "Sin permisos para actualizar este trabajo" }, { status: 403 })
    }

    // Preparar datos para actualizar
    const updateData: any = {
      status,
    }

    // Solo actualizar completedAt si el estado cambia a COMPLETED
    if (status === "COMPLETED" && job.status !== "COMPLETED") {
      updateData.completedAt = new Date()
    }

    // Actualizar campos adicionales si se proporcionan
    if (observations) updateData.observations = observations
    if (images && images.length > 0) updateData.images = JSON.stringify(images)
    if (signature) updateData.signature = signature

    // Actualizar el trabajo

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: {
        service: true,
        client: true,
        technician: true
      }
    })

    // Nota: La funcionalidad de transacción automática se puede implementar
    // cuando se agregue el modelo CashTransaction al esquema de Prisma

    const responseMessage = `Estado actualizado a ${status === 'PENDING' ? 'Pendiente' :
      status === 'IN_PROGRESS' ? 'En Progreso' :
        status === 'COMPLETED' ? 'Completado' : 'Cancelado'}`

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: responseMessage
    })
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
