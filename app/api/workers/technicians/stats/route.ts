import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener estadísticas de todos los trabajadores
    const totalTechnicians = await prisma.user.count({
      where: {
        role: {
          name: {
            in: ["TECNICO", "ADMINISTRADOR", "SECRETARIA"]
          }
        }
      }
    })

    const activeTechnicians = await prisma.user.count({
      where: {
        role: {
          name: {
            in: ["TECNICO", "ADMINISTRADOR", "SECRETARIA"]
          }
        },
        isActive: true
      }
    })

    const inactiveTechnicians = await prisma.user.count({
      where: {
        role: {
          name: {
            in: ["TECNICO", "ADMINISTRADOR", "SECRETARIA"]
          }
        },
        isActive: false
      }
    })

    const stats = {
      total: totalTechnicians,
      active: activeTechnicians,
      inactive: inactiveTechnicians
    }

    return NextResponse.json(stats)
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
