// Servicio de email simple y directo
export interface SimpleEmailData {
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje: string;
  formType: 'hero' | 'contact';
}

const serviceNames: Record<string, string> = {
  deteccion_fugas: 'Detección de fugas de agua',
  destape_alcantarillado: 'Destape de alcantarillado',
  videoinspeccion: 'Videoinspección de ductos',
};

// Función simple para enviar email directamente
export const sendSimpleEmail = async (data: SimpleEmailData): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const serviceName = serviceNames[data.servicio] || data.servicio;
    // Crear el contenido del email
    const emailContent = `
NUEVA COTIZACIÓN - AMÉSTICA LTDA.
================================

Origen: ${data.formType === 'hero' ? 'Formulario Principal' : 'Formulario Contacto'}
Fecha: ${new Date().toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}

INFORMACIÓN DEL CLIENTE
-----------------------
Nombre: ${data.nombre}
Email: ${data.email}
Teléfono: ${data.telefono}

UBICACIÓN DEL SERVICIO
----------------------
Región: ${data.region}
Comuna: ${data.comuna}
Dirección: ${data.direccion}

SERVICIO SOLICITADO
-------------------
Tipo: ${serviceName}

${data.mensaje ? `MENSAJE DEL CLIENTE
-------------------
${data.mensaje}` : ''}

================================
Améstica Ltda. - Servicios Profesionales
Email: amesticaltda@gmail.com
Santiago: +56 9 4200 8410
Ñuble: +56 9 9670 6640
================================
    `.trim();

    // Enviar usando FormSubmit de manera simple
    const formData = new FormData();
    formData.append('_to', 'mpriquelme.dev@gmail.com');
    formData.append('_subject', `Nueva Cotización: ${serviceName} - ${data.nombre}`);
    formData.append('_replyto', data.email);
    formData.append('_captcha', 'false');
    formData.append('message', emailContent);
    const response = await fetch('https://formsubmit.co/ajax/mpriquelme.dev@gmail.com', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    // Verificar si FormSubmit realmente fue exitoso
    if (result.success === true) {
      return {
        success: true,
        message: '¡Gracias por confiar en nosotros! Nos pondremos en contacto contigo a la brevedad.'
      };
    } else {
      // Si es el error de localhost, dar un mensaje específico
      if (result.message && result.message.includes('web server')) {
        return {
          success: false,
          message: 'FormSubmit no funciona desde localhost. Para probar completamente, despliega el sitio a producción o usa ngrok para exponer localhost como dominio público.'
        };
      }

      return {
        success: false,
        message: 'Lo sentimos, hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente o contáctanos directamente al +56 9 4200 8410.'
      };
    }

  } catch (error) {
    return {
      success: false,
      message: 'Lo sentimos, hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente o contáctanos directamente al +56 9 4200 8410.'
    };
  }
};
