import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canUserPerformAction } from '@/lib/role-utils'
import { validateServiceData } from '@/lib/validation'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      include: {
        jobs: true
      },
      orderBy: { name: "asc" }
    })

    const servicesWithStats = services.map(service => ({
      ...service,
      totalJobs: service.jobs.length,
      completedJobs: service.jobs.filter(job => job.status === "COMPLETED").length
    }))

    return NextResponse.json(servicesWithStats)
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

    // Verificar permisos
    const userRole = (session.user as any).role
    if (!canUserPerformAction(userRole, 'create', 'services')) {
      return NextResponse.json({ error: "Sin permisos para crear servicios" }, { status: 403 })
    }

    const { name, description, price } = await request.json()

    // Validar datos
    const validation = validateServiceData({ name, description, price })
    if (!validation.isValid) {
      return NextResponse.json({
        error: "Datos inválidos",
        details: validation.errors
      }, { status: 400 })
    }

    // Verificar si el servicio ya existe
    const existingService = await prisma.service.findFirst({
      where: { name }
    })

    if (existingService) {
      return NextResponse.json({ error: "Ya existe un servicio con este nombre" }, { status: 400 })
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description: description || null,
        price: price ? parseFloat(price) : null
      }
    })

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos - solo admin y secretaria pueden actualizar servicios
    const userRole = (session.user as any).role?.toLowerCase()
    if (!['admin', 'administrador', 'secretaria'].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos para actualizar servicios" }, { status: 403 })
    }

    const { id, name, description, price, isActive } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID del servicio es requerido" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "El nombre del servicio es requerido" }, { status: 400 })
    }

    // Verificar que el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id }
    })

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Verificar si el nombre ya existe en otro servicio
    const nameExists = await prisma.service.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (nameExists) {
      return NextResponse.json({ error: "Ya existe otro servicio con este nombre" }, { status: 400 })
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: price ? parseFloat(price) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos - solo admin puede eliminar servicios
    const userRole = (session.user as any).role?.toLowerCase()
    if (!['admin', 'administrador'].includes(userRole)) {
      return NextResponse.json({ error: "Solo administradores pueden eliminar servicios" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "ID del servicio es requerido" }, { status: 400 })
    }

    // Verificar que el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true
          }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Verificar si tiene trabajos asociados
    if (existingService._count.jobs > 0) {
      return NextResponse.json({
        error: "No se puede eliminar un servicio que tiene trabajos asociados"
      }, { status: 400 })
    }

    await prisma.service.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Servicio eliminado exitosamente" })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
