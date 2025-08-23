import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
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
    if (session.user.role !== "admin" && job.technicianId !== session.user.id) {
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
    })

    return NextResponse.json({ success: true, job: updatedJob })
  } catch (error) {
    console.error("Error updating job status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
