import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Obtener todas las notificaciones del sitio web
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin y secretaria pueden ver las notificaciones
    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'secretaria') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const notifications = await prisma.websiteNotification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching website notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva notificación del sitio web
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, formData, email, phone, name, service, region, commune, address } = body;

    // Validar campos requeridos
    if (!type || !title || !message || !email || !name) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    // Crear la notificación
    const notification = await prisma.websiteNotification.create({
      data: {
        type,
        title,
        message,
        formData: JSON.stringify(formData),
        email,
        phone,
        name,
        service,
        region,
        commune,
        address,
        status: 'unread',
        isRead: false
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating website notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
