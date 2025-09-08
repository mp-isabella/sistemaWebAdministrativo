import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { name, email, phone, password, roleId, status } = await request.json()
    const { id: workerId } = await params

    const updateData: any = {
      name,
      email,
      phone: phone || null,
      roleId,
      isActive: status === "active"
    }

    // Solo actualizar contraseña si se proporciona
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedWorker = await prisma.user.update({
      where: { id: workerId },
      data: updateData,
      include: {
        role: true
      }
    })

    return NextResponse.json(updatedWorker)
  } catch (error) {
    console.error("Error updating worker:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { id: workerId } = await params

    // Verificar que no sea el último admin
    const adminCount = await prisma.user.count({
      where: {
        role: {
          name: "admin"
        }
      }
    })

    const workerToDelete = await prisma.user.findUnique({
      where: { id: workerId },
      include: { 
        role: true,
        assignedJobs: {
          where: {
            status: {
              in: ["PENDING", "IN_PROGRESS"]
            }
          }
        }
      }
    })

    if (!workerToDelete) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
    }

    if (workerToDelete.role.name === "admin" && adminCount <= 1) {
      return NextResponse.json({ error: "No se puede eliminar el último administrador" }, { status: 400 })
    }

    // Verificar si tiene trabajos pendientes o en progreso
    if (workerToDelete.assignedJobs.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar el trabajador porque tiene trabajos pendientes o en progreso asignados" 
      }, { status: 400 })
    }

    // Desasignar todos los trabajos del técnico antes de eliminarlo
    await prisma.job.updateMany({
      where: { technicianId: workerId },
      data: { technicianId: null }
    })

    await prisma.user.delete({
      where: { id: workerId }
    })

    return NextResponse.json({ message: "Trabajador eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting worker:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
