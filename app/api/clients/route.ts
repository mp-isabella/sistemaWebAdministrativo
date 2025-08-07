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
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } }
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        jobs: {
          include: {
            service: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const clientsWithStats = clients.map(client => ({
      ...client,
      totalServices: client.jobs.length,
      totalSpent: client.jobs.reduce((sum, job) => sum + (job.service.price || 0), 0),
      lastService: client.jobs.length > 0 ? client.jobs[0].createdAt : null,
      status: "active", // Por ahora todos activos
      type: client.address?.includes("Empresa") || client.address?.includes("Condominio") ? "commercial" : "residential"
    }))

    return NextResponse.json(clientsWithStats)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Admin y secretaria pueden crear clientes
    if (!["admin", "secretaria"].includes(session.user.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { name, email, phone, address } = await request.json()

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address
      }
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
