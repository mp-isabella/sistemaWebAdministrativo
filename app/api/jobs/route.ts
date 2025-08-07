import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const technicianId = searchParams.get("technicianId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    // Filtros por rol
    if (session.user.role === "operador") {
      where.assignedToId = session.user.id
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (technicianId) {
      where.assignedToId = technicianId
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        client: true,
        service: true,
        assignedTo: true,
        createdBy: true,
        images: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria"].includes(session.user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { title, description, clientId, serviceId, assignedToId, scheduledAt, priority } = await request.json()

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        clientId,
        serviceId,
        assignedToId,
        createdById: session.user.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        priority: priority || "MEDIUM"
      },
      include: {
        client: true,
        service: true,
        assignedTo: true,
        createdBy: true
      }
    })

    return NextResponse.json(newJob, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
