import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Admin, secretaria y técnicos pueden ver trabajadores
    const userRole = (session.user as any).role?.toLowerCase()

    if (!["administrador", "admin", "secretaria", "tecnico"].includes(userRole)) {

      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const where: any = {
      isActive: true
    }

    // Filtrar por rol si se especifica
    if (role) {
      const roleRecord = await prisma.role.findFirst({
        where: { name: { contains: role } }
      })
      if (roleRecord) {
        where.roleId = roleRecord.id
      }
    }

    const workers = await prisma.user.findMany({
      where,
      include: {
        role: true,
        assignedJobs: {
          where: {
            status: "COMPLETED"
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const workersWithStats = workers.map(worker => ({
      ...worker,
      completedJobs: worker.assignedJobs.length,
      rating: 4.5 + Math.random() * 0.5 // Simulado por ahora
    }))

    return NextResponse.json({ workers: workersWithStats })
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo administrador puede crear trabajadores
    const userRole = (session.user as any).role?.toLowerCase();
    if (!['admin', 'administrador'].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores pueden crear trabajadores" }, { status: 403 })
    }

    const { name, email, phone, password, role, status } = await request.json()

    // Validar datos requeridos
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Datos requeridos: name, email, password, role" }, { status: 400 })
    }

    // Validar formato de email
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Buscar el rol por nombre
    const roleRecord = await prisma.role.findFirst({
      where: { name: role }
    })

    if (!roleRecord) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    const newWorker = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        roleId: roleRecord.id,
        isActive: status === "active"
      },
      include: {
        role: true
      }
    })

    return NextResponse.json(newWorker, { status: 201 })
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin puede actualizar trabajadores
    const userRole = (session.user as any).role?.toLowerCase();
    if (!['admin', 'administrador'].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores pueden actualizar trabajadores" }, { status: 403 })
    }

    const { id, name, email, phone, password, role, status } = await request.json()

    // Validar datos requeridos
    if (!id || !name || !email || !role) {
      return NextResponse.json({ error: "Datos requeridos: id, name, email, role" }, { status: 400 })
    }

    // Validar formato de email
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Verificar que el trabajador existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      if (emailExists) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
      }
    }

    // Buscar el rol por nombre
    const roleRecord = await prisma.role.findFirst({
      where: { name: role }
    })

    if (!roleRecord) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 400 })
    }

    // Preparar datos de actualización
    const updateData: any = {
      name,
      email,
      phone: phone || null,
      roleId: roleRecord.id,
      isActive: status === "active"
    }

    // Solo actualizar contraseña si se proporciona
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedWorker = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true
      }
    })

    return NextResponse.json(updatedWorker)
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
