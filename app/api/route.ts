import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin puede ver todos los trabajadores
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    const workers = await prisma.user.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } }
            ]
          } : {},
          role ? { role } : {},
          status ? { status } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            assignedJobs: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Estadísticas
    const stats = {
      total: workers.length,
      active: workers.filter(w => w.status === "active").length,
      inactive: workers.filter(w => w.status === "inactive").length,
      byRole: {
        admin: workers.filter(w => w.role === "admin").length,
        secretaria: workers.filter(w => w.role === "secretaria").length,
        operador: workers.filter(w => w.role === "operador").length
      }
    }

    return NextResponse.json({ workers, stats })
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { name, email, phone, role, password } = await request.json()

    // Validaciones
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    const worker = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        password: hashedPassword,
        status: "active"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ worker })
  } catch (error) {
    console.error("Error creating worker:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
