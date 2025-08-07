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

    const services = await prisma.service.findMany({
      include: {
        jobs: true
      },
      orderBy: { name: "asc" }
    })

    const servicesWithStats = services.map(service => ({
      ...service,
      totalJobs: service.jobs.length,
      completedJobs: service.jobs.filter(job => job.status === "COMPLETED").length
    }))

    return NextResponse.json(servicesWithStats)
  } catch (error) {
    console.error("Error fetching services:", error)
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

    const { name, description, price } = await request.json()

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price)
      }
    })

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
