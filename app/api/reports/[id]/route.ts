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

    // Verificar permisos
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para acceder a reportes' }, { status: 403 })
    }

    const report = await (prisma as any).report.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            primaryColor: true,
            secondaryColor: true,
            accentColor: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        metrics: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }

    return NextResponse.json(report)

  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await _request.json()

    // Verificar permisos
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para editar reportes' }, { status: 403 })
    }

    const { title, description } = body

    const report = await (prisma as any).report.update({
      where: { id },
      data: {
        title,
        summary: description
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            primaryColor: true,
            secondaryColor: true,
            accentColor: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        metrics: true
      }
    })

    return NextResponse.json(report)

  } catch (error) {

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

    const { id } = await params

    // Verificar permisos - solo admin puede eliminar reportes
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole !== 'administrador') {
      return NextResponse.json({ error: 'Sin permisos para eliminar reportes' }, { status: 403 })
    }

    await (prisma as any).report.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}