import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUserPerformAction } from '@/lib/role-utils'
import { validateClientData } from '@/lib/validation'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      where: {
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos
    const userRole = (session.user as any).role
    if (!canUserPerformAction(userRole, 'create', 'clients')) {
      return NextResponse.json({ error: "Sin permisos para crear clientes" }, { status: 403 })
    }

    const body = await request.json()

    // Validar datos
    const validation = validateClientData(body)
    if (!validation.isValid) {
      console.log('❌ Validación falló:', validation.errors);
      return NextResponse.json({
        error: "Datos inválidos",
        details: validation.errors,
        message: validation.errors.join(', ')
      }, { status: 400 })
    }

    const { name, email, phone, address, rut, region, commune, company, status } = body

    // Verificar si el email ya existe (si se proporciona)
    if (email) {
      const existingClient = await prisma.client.findFirst({
        where: { email }
      })
      if (existingClient) {
        return NextResponse.json({ error: "Ya existe un cliente con este email" }, { status: 400 })
      }
    }

    // Crear cliente
    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone,
        address,
        rut: rut || null,
        region: region || null,
        commune: commune || null,
        company: company || null,
        status: status || 'active'
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}