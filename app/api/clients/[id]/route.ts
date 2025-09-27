import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            service: {
              select: {
                name: true,
                price: true
              }
            },
            technician: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const clientWithStats = {
      ...client,
      totalServices: client.jobs.length,
      totalSpent: client.jobs.reduce((sum: number, job: any) => sum + (job.service?.price || 0), 0),
      completedJobs: client.jobs.filter((job: any) => job.status === 'COMPLETED').length,
      pendingJobs: client.jobs.filter((job: any) => ['PENDING', 'IN_PROGRESS'].includes(job.status)).length,
      averageRating: 0 // No hay campo rating en el schema
    }

    return NextResponse.json(clientWithStats)

  } catch (error) {

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
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (admin o secretaria)
    const userRole = (session.user as any).role;
    if (!['admin', 'administrador', 'ADMINISTRADOR', 'secretaria', 'SECRETARIA'].includes(userRole)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      company,
      status,
      region,
      commune,
      rut
    } = body

    // Validaciones
    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, teléfono, dirección' },
        { status: 400 }
      )
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const { id } = await params
    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    // Verificar email único si se cambió
    if (email && email !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email,
          id: { not: id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este email' },
          { status: 400 }
        )
      }
    }
    // Manejar el email - si no se proporciona, mantener el existente
    const emailToUpdate = email || existingClient.email;
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        email: emailToUpdate,
        phone,
        address,
        company: company || null,
        status: status || "active",
        region: region || null,
        commune: commune || null,
        rut: rut || null
      } as any
    })
    return NextResponse.json(updatedClient)

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (admin o secretaria)
    const userRole = (session.user as any).role;
    if (!['admin', 'administrador', 'ADMINISTRADOR', 'secretaria', 'SECRETARIA'].includes(userRole)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = await params

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Actualizar solo los campos proporcionados
    const updatedClient = await prisma.client.update({
      where: { id },
      data: body
    })

    return NextResponse.json(updatedClient)

  } catch (error) {
    console.error('Error updating client:', error)
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
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos para eliminar (admin, administrador o secretaria)
    const userRole = (session.user as any).role;
    if (!['admin', 'administrador', 'ADMINISTRADOR', 'secretaria', 'SECRETARIA'].includes(userRole)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { id } = await params
    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true
          }
        }
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    // Verificar si tiene trabajos asociados
    if (existingClient._count.jobs > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente con trabajos asociados' },
        { status: 400 }
      )
    }
    await prisma.client.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Cliente eliminado correctamente' })

  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
