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

    const workers = await prisma.user.findMany({
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

    return NextResponse.json(workersWithStats)
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin puede crear trabajadores
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { name, email, password, roleId } = await request.json()

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    const newWorker = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId
      },
      include: {
        role: true
      }
    })

    return NextResponse.json(newWorker, { status: 201 })
  } catch (error) {
    console.error("Error creating worker:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
