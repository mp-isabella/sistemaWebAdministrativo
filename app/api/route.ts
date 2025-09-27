import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin puede ver todos los trabajadores
    if ((session.user as any).role !== "administrador") {
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
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } }
            ]
          } : {},
          role ? { roleId: role } : {},
          status ? { isActive: status === 'active' } : {}
        ]
      },
      include: {
        role: true,
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
      active: workers.filter(w => w.isActive === true).length,
      inactive: workers.filter(w => w.isActive === false).length,
      byRole: {
        administrador: workers.filter(w => w.role.name.toLowerCase() === "administrador").length,
        secretaria: workers.filter(w => w.role.name.toLowerCase() === "secretaria").length,
        tecnico: workers.filter(w => w.role.name.toLowerCase() === "tecnico").length
      }
    }

    return NextResponse.json({ workers, stats })
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMINISTRADOR" && userRole !== "administrador" && userRole !== "admin") {
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

    // Buscar el rol por nombre
    const roleRecord = await prisma.role.findFirst({
      where: { name: role }
    })

    if (!roleRecord) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 400 })
    }

    const worker = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        roleId: roleRecord.id,
        password: hashedPassword,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({ worker })
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
