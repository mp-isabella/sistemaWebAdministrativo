import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      name, 
      email, 
      phone, 
      service, 
      region, 
      commune, 
      address, 
      message 
    } = body;

    // Validar campos requeridos
    if (!name || !email || !phone || !service) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    // Determinar el asunto según el tipo de formulario
    let subject = '';
    let emailContent = '';

    if (type === 'contact_form') {
      subject = 'Nueva Solicitud de Contacto - Sitio Web Améstica';
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #002D71; text-align: center;">Nueva Solicitud de Contacto</h2>
          <p>Se ha recibido una nueva solicitud de contacto desde el sitio web de Améstica.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #014C90; margin-top: 0;">Información del Cliente:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Servicio Solicitado:</strong> ${service}</p>
            ${region ? `<p><strong>Región:</strong> ${region}</p>` : ''}
            ${commune ? `<p><strong>Comuna:</strong> ${commune}</p>` : ''}
            ${address ? `<p><strong>Dirección:</strong> ${address}</p>` : ''}
            ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Este email fue enviado automáticamente desde el formulario de contacto del sitio web.
          </p>
        </div>
      `;
    } else if (type === 'quote_request') {
      subject = 'Nueva Solicitud de Cotización - Sitio Web Améstica';
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #002D71; text-align: center;">Nueva Solicitud de Cotización</h2>
          <p>Se ha recibido una nueva solicitud de cotización desde el sitio web de Améstica.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #014C90; margin-top: 0;">Detalles de la Solicitud:</h3>
            <p><strong>Nombre del Cliente:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Servicio Solicitado:</strong> ${service}</p>
            ${region ? `<p><strong>Región:</strong> ${region}</p>` : ''}
            ${commune ? `<p><strong>Comuna:</strong> ${commune}</p>` : ''}
            ${address ? `<p><strong>Dirección:</strong> ${address}</p>` : ''}
            ${message ? `<p><strong>Mensaje Adicional:</strong> ${message}</p>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Este email fue enviado automáticamente desde el formulario de cotización del sitio web.
          </p>
        </div>
      `;
    } else {
      subject = 'Nueva Solicitud - Sitio Web Améstica';
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #002D71; text-align: center;">Nueva Solicitud Recibida</h2>
          <p>Se ha recibido una nueva solicitud desde el sitio web de Améstica.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #014C90; margin-top: 0;">Información de la Solicitud:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Servicio:</strong> ${service}</p>
            ${region ? `<p><strong>Región:</strong> ${region}</p>` : ''}
            ${commune ? `<p><strong>Comuna:</strong> ${commune}</p>` : ''}
            ${address ? `<p><strong>Dirección:</strong> ${address}</p>` : ''}
            ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Este email fue enviado automáticamente desde el sitio web.
          </p>
        </div>
      `;
    }

    // Configurar el email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'mpriquelme.dev@gmail.com', // Email de destino especificado
      subject: subject,
      html: emailContent,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email enviado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el email' },
      { status: 500 }
    );
  }
}
