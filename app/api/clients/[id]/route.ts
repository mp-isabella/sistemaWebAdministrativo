/* import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        jobs: {
          include: {
            service: {
              select: {
                name: true,
                category: true
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
        },
        _count: {
          select: {
            jobs: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const clientWithStats = {
      ...client,
      totalServices: client._count.jobs,
      totalSpent: client.jobs.reduce((sum, job) => sum + (job.total || 0), 0),
      completedJobs: client.jobs.filter(job => job.status === 'completed').length,
      pendingJobs: client.jobs.filter(job => ['pending', 'in_progress'].includes(job.status)).length,
      averageRating: client.jobs.length > 0 
        ? client.jobs.reduce((sum, job) => sum + (job.rating || 0), 0) / client.jobs.length 
        : 0
    }

    return NextResponse.json(clientWithStats)

  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (admin o secretaria)
    if (!['admin', 'secretaria'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, address, type, rut, company, contactPerson, status } = body

    // Validaciones
    if (!name || !phone || !address || !type) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, teléfono, dirección, tipo' },
        { status: 400 }
      )
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar email único si se cambió
    if (email && email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este email' },
          { status: 400 }
        )
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone,
        address,
        type,
        rut: rut || null,
        company: company || null,
        contactPerson: contactPerson || null,
        status: status || 'active'
      }
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admin puede eliminar clientes
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
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
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Cliente eliminado correctamente' })

  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} */
