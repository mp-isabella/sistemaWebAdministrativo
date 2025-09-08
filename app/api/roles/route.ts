import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" }
    })

    // Asegurar que no hay duplicados (por si acaso)
    const uniqueRoles = roles.filter((role, index, self) => 
      index === self.findIndex(r => r.name.toUpperCase() === role.name.toUpperCase())
    )

    return NextResponse.json(uniqueRoles)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
