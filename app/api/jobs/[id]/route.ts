import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

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

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true,
        company: true,
        payments: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Verificar permisos
    const userRole = (session.user as any).role.toLowerCase()

    // Los técnicos solo pueden ver sus propios trabajos
    if (userRole === "tecnico" && job.technicianId !== (session.user as any).id) {
      return NextResponse.json({ error: "No tienes permisos para ver este trabajo" }, { status: 403 })
    }

    return NextResponse.json(job)

  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id } = await params
    const { title, description, clientId, serviceId, technicianId, scheduledAt, startTime, endTime, priority, status } = await _request.json()

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

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const jobId = params.id
    const body = await _request.json()

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
    const userRole = (session.user as any).role.toLowerCase()

    // Los técnicos solo pueden actualizar sus propios trabajos
    if (userRole === "tecnico" && existingJob.technicianId !== (session.user as any).id) {
      return NextResponse.json({ error: "Solo puedes modificar tus trabajos asignados" }, { status: 403 })
    }

    // Preparar datos para actualizar
    const updateData: any = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.images !== undefined) updateData.images = body.images
    if (body.signature !== undefined) updateData.signature = body.signature
    if (body.completedAt !== undefined) updateData.completedAt = body.completedAt
    if (body.technicianId !== undefined) updateData.technicianId = body.technicianId
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    if (body.startTime !== undefined) updateData.startTime = body.startTime
    if (body.endTime !== undefined) updateData.endTime = body.endTime
    if (body.totalBudget !== undefined) {
      updateData.totalBudget = body.totalBudget ? Number(body.totalBudget) : null
    }

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

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userRole = (session.user as any).role?.toLowerCase();
    if (!["admin", "secretaria", "administrador", "administrator"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos para eliminar trabajos" }, { status: 403 })
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

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
