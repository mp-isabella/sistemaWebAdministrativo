// Servicio de email usando FormSubmit
export interface FormSubmitData {
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

const DESTINATION_EMAIL = 'mpriquelme.dev@gmail.com';

const serviceNames: Record<string, string> = {
  deteccion_fugas: 'Detección de fugas de agua',
  destape_alcantarillado: 'Destape de alcantarillado',
  videoinspeccion: 'Videoinspección de ductos',
};

// Función para enviar email usando FormSubmit
export const sendViaFormSubmit = async (data: FormSubmitData): Promise<boolean> => {
  try {
    const serviceName = serviceNames[data.servicio] || data.servicio;
    // Crear el contenido del email
    const emailContent = `
🔥 NUEVA COTIZACIÓN - AMÉSTICA LTDA.
=======================================

📝 Origen: ${data.formType === 'hero' ? 'Formulario Principal' : 'Formulario Contacto'}
⏰ Fecha: ${new Date().toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}

📋 INFORMACIÓN DEL CLIENTE
--------------------------
• Nombre: ${data.nombre}
• Email: ${data.email}
• Teléfono: ${data.telefono}

📍 UBICACIÓN DEL SERVICIO
-------------------------
• Región: ${data.region}
• Comuna: ${data.comuna}
• Dirección: ${data.direccion}

🔧 SERVICIO SOLICITADO
----------------------
• Tipo: ${serviceName}

${data.mensaje ? `💬 MENSAJE DEL CLIENTE
----------------------
${data.mensaje}` : ''}

=======================================
Améstica Ltda. - Servicios Profesionales
📧 amesticaltda@gmail.com
📱 Santiago: +56 9 4200 8410
📱 Ñuble: +56 9 9670 6640
=======================================
    `.trim();

    // Usar FormSubmit con configuración optimizada
    const formData = new FormData();
    formData.append('_to', DESTINATION_EMAIL);
    formData.append('_subject', `🔥 Nueva Cotización: ${serviceName} - ${data.nombre}`);
    formData.append('_replyto', data.email);
    formData.append('_captcha', 'false');
    formData.append('_template', 'table'); // Usar template de tabla para mejor formato
    formData.append('_next', 'https://amesticaltda.com/gracias'); // Página de confirmación

    // Enviar campos individuales para mejor procesamiento
    formData.append('nombre', data.nombre);
    formData.append('email', data.email);
    formData.append('telefono', data.telefono);
    formData.append('region', data.region);
    formData.append('comuna', data.comuna);
    formData.append('direccion', data.direccion);
    formData.append('servicio', serviceName);
    formData.append('mensaje', data.mensaje || '');
    formData.append('formType', data.formType);

    // También enviar el contenido completo como mensaje
    formData.append('message', emailContent);
    const response = await fetch('https://formsubmit.co/ajax/mpriquelme.dev@gmail.com', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    // FormSubmit puede devolver success: true o simplemente un status 200
    const success = result.success === true || response.ok;

    if (success) {
    } else {
    }

    return success;
  } catch (error) {
    return false;
  }
};

// Función principal que envía la cotización
export const sendFormSubmitQuote = async (data: FormSubmitData): Promise<{
  success: boolean;
  message: string;
  service?: string;
}> => {
  // Validación básica
  if (!data.nombre || !data.email || !data.telefono || !data.servicio) {
    return {
      success: false,
      message: 'Por favor, completa todos los campos obligatorios marcados con *'
    };
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: 'Por favor, ingresa un email válido'
    };
  }

  try {
    const success = await sendViaFormSubmit(data);

    if (success) {
      return {
        success: true,
        message: '¡Gracias por confiar en nosotros! Nos pondremos en contacto contigo a la brevedad.',
        service: 'FormSubmit'
      };
    } else {
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
