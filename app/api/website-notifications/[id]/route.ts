import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT - Marcar notificación como leída
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin y secretaria pueden marcar notificaciones como leídas
    if (session.user.role !== 'admin' && session.user.role !== 'secretaria') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { isRead, status } = body;

    const notification = await prisma.websiteNotification.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? isRead : true,
        status: status || 'read',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating website notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar notificación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin puede eliminar notificaciones
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = params;

    await prisma.websiteNotification.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error deleting website notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
