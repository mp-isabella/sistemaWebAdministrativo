import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener solo técnicos activos
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(technicians)
  } catch (error) {
    console.error("Error fetching technicians:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
