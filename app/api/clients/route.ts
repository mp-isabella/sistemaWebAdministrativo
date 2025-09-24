import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } }
      ]
    }

    if (status) {
      where.status = status
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

    return NextResponse.json(clients)
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Admin y secretaria pueden crear clientes
    const userRole = (session.user as any).role;
    if (!["ADMINISTRADOR", "admin", "administrador", "SECRETARIA", "secretaria"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const {
      name,
      email,
      phone,
      address,
      company,
      region,
      commune,
      status,
      rut
    } = await request.json()

    if (!session.user.id) {
      return NextResponse.json({ error: "ID de usuario no válido" }, { status: 400 })
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        company,
        region,
        commune,
        status: status || "active",
        rut
      }
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
