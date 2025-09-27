import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const worker = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true
      }
    })

    if (!worker) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(worker)
  } catch (error) {
    console.error('Error fetching worker:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos de administrador
    const userRole = (session.user as any).role?.toLowerCase();
    if (!['admin', 'administrador', 'administrator'].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores pueden editar trabajadores" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, phone, role, status, password } = body

    // Validar datos requeridos
    if (!name || !email || !phone || !role) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: nombre, email, teléfono, rol" },
        { status: 400 }
      )
    }

    // Verificar que el trabajador existe
    const existingWorker = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingWorker) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
    }

    // Verificar si el email ya existe en otro usuario
    if (email !== existingWorker.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "El email ya está en uso por otro trabajador" },
          { status: 400 }
        )
      }
    }

    // Buscar el rol
    const roleRecord = await prisma.role.findFirst({
      where: {
        name: {
          in: [role.toUpperCase(), role.toLowerCase(), role]
        }
      }
    })

    if (!roleRecord) {
      return NextResponse.json(
        { error: "Rol no válido" },
        { status: 400 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {
      name,
      email,
      phone,
      roleId: roleRecord.id,
      isActive: status === 'active'
    }

    // Solo actualizar contraseña si se proporciona
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Actualizar el trabajador
    const updatedWorker = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true
      }
    })

    return NextResponse.json(updatedWorker)
  } catch (error) {
    console.error('Error updating worker:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos de administrador
    const userRole = (session.user as any).role?.toLowerCase();
    if (!['admin', 'administrador', 'administrator'].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores pueden eliminar trabajadores" }, { status: 403 })
    }

    const { id } = await params

    // Verificar que el trabajador existe
    const existingWorker = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingWorker) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
    }

    // Eliminar el trabajador
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Trabajador eliminado correctamente" })
  } catch (error) {
    console.error('Error deleting worker:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}