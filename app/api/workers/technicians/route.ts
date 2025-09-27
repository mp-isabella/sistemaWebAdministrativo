import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const technicians = await prisma.user.findMany({
      where: {
        OR: [
          { role: { name: 'TECNICO' } },
          { role: { name: 'tecnico' } }
        ],
        isActive: true
      },
      include: {
        role: true
      },
      orderBy: { name: 'asc' }
    })

    // Log para debugging
    console.log('🔧 API - Técnicos encontrados en BD:', technicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      role: tech.role?.name,
      isActive: tech.isActive
    })));

    return NextResponse.json(technicians)
  } catch (error) {
    console.error('Error fetching technicians:', error)
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

    const body = await request.json()
    const { name, email, phone, role, status, password } = body

    // Validar datos requeridos
    if (!name || !email || !phone || !role) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      )
    }

    // Buscar el rol
    const roleRecord = await prisma.role.findUnique({
      where: { name: role.toUpperCase() }
    })

    if (!roleRecord) {
      return NextResponse.json(
        { error: "Rol no válido" },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password || 'password123', 12)

    // Crear el trabajador
    const newWorker = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        roleId: roleRecord.id,
        isActive: status === 'active',
        password: hashedPassword
      },
      include: {
        role: true
      }
    })

    return NextResponse.json(newWorker, { status: 201 })
  } catch (error) {
    console.error('Error creating worker:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}