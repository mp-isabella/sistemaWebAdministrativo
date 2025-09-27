import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {

    // Obtener solo técnicos activos
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(technicians)
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
