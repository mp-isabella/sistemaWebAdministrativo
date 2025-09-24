import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener todas las empresas activas
    const companies = await prisma.company.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        phone: true,
        address: true,
        rut: true,
        logo: true,
        type: true,
        service: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(companies)
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}