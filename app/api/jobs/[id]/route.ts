import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const jobId = params.id

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar permisos
    const userRole = session.user.role.toLowerCase()
    
    // Los técnicos solo pueden ver sus propios trabajos
    if (userRole === "tecnico" && job.technicianId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permisos para ver este trabajo" }, { status: 403 })
    }

    return NextResponse.json(job)

  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria"].includes(session.user.role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id } = await params
    const { title, description, clientId, serviceId, technicianId, scheduledAt, startTime, endTime, priority, status } = await request.json()

    // Verificar que el trabajo existe
    const existingJob = await prisma.job.findUnique({
      where: { id }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        clientId,
        serviceId,
        technicianId: technicianId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        startTime,
        endTime,
        priority: priority || "MEDIUM",
        status: status || existingJob.status
      },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const jobId = params.id
    const body = await request.json()

    // Verificar que el trabajo existe
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar permisos
    const userRole = session.user.role.toLowerCase()
    
    // Los técnicos solo pueden actualizar sus propios trabajos
    if (userRole === "tecnico" && existingJob.technicianId !== session.user.id) {
      return NextResponse.json({ error: "Solo puedes modificar tus trabajos asignados" }, { status: 403 })
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.images !== undefined) updateData.images = body.images
    if (body.signature !== undefined) updateData.signature = body.signature
    if (body.completedAt !== undefined) updateData.completedAt = body.completedAt

    // Actualizar el trabajo
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    return NextResponse.json(updatedJob)

  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria"].includes(session.user.role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id } = await params

    // Verificar que el trabajo existe
    const existingJob = await prisma.job.findUnique({
      where: { id }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    await prisma.job.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
