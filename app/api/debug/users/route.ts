import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Obtener todos los usuarios con sus roles
    const allUsers = await prisma.user.findMany({
      include: {
        role: true
      },
      orderBy: { name: 'asc' }
    })

    // Log detallado
    console.log('🔍 DEBUG - Todos los usuarios en la BD:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Rol: ${user.role?.name} - Activo: ${user.isActive}`);
    });

    return NextResponse.json({
      totalUsers: allUsers.length,
      users: allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        isActive: user.isActive
      }))
    })
  } catch (error) {
    console.error('Error fetching all users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
