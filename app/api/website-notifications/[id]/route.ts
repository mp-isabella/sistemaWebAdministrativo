import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// PUT - Marcar notificación como leída
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin y secretaria pueden marcar notificaciones como leídas
    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'secretaria') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id: _id } = params;
    // const body = await request.json();
    // const { isRead, status } = body;

    // TODO: Implementar modelo WebsiteNotification en el esquema
    const notification = null; // await prisma.websiteNotification.update({
    //   where: { id },
    //   data: {
    //     isRead: isRead !== undefined ? isRead : true,
    //     status: status || 'read',
    //     updatedAt: new Date()
    //   }
    // });

    return NextResponse.json(notification);
  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar notificación
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin puede eliminar notificaciones
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id: _id } = params;

    // TODO: Implementar modelo WebsiteNotification en el esquema
    // await prisma.websiteNotification.delete({
    //   where: { id }
    // });

    return NextResponse.json({ message: 'Notificación eliminada' });
  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
