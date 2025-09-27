import { NextRequest, NextResponse } from 'next/server';
import { sendCustomQuoteEmail, QuoteEmailData } from '@/lib/email-service-custom';

export async function POST(request: NextRequest) {
  try {
    const data: QuoteEmailData = await request.json();

    // Validación básica de datos
    if (!data.nombre || !data.email || !data.telefono || !data.servicio) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Enviar email usando servicio personalizado
    const result = await sendCustomQuoteEmail(data);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message
        },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
