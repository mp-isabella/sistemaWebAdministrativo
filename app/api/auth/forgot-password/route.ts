import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Configurar el transportador de email (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Tu email de Gmail
        pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Gmail
      },
    });

    // Generar token único para recuperación
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // URL de recuperación (ajusta según tu dominio)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Configurar el email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña - Sistema Administrativo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5; text-align: center;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña para el Sistema Administrativo.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Sistema Administrativo
          </p>
        </div>
      `,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    // Aquí podrías guardar el token en la base de datos con timestamp de expiración
    // await saveResetToken(email, resetToken, Date.now() + 3600000); // 1 hora

    return NextResponse.json(
      { message: 'Email de recuperación enviado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
