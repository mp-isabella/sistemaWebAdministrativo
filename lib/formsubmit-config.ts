// Configuración y función principal para FormSubmit
export interface FormSubmitData {
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje: string;
}

const DESTINATION_EMAIL = 'mpriquelme.dev@gmail.com';

const serviceNames: Record<string, string> = {
  deteccion_fugas: 'Detección de fugas de agua',
  destape_alcantarillado: 'Destape de alcantarillado',
  videoinspeccion: 'Videoinspección de ductos',
};

// Función principal para enviar formulario a FormSubmit
export const submitToFormSubmit = async (
  data: FormSubmitData,
  formType: 'hero' | 'contact' = 'contact',
  currentUrl?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const serviceName = serviceNames[data.servicio] || data.servicio;
    // Crear el contenido del email
    const emailContent = `
🔥 NUEVA COTIZACIÓN - AMÉSTICA LTDA.
=======================================

📝 Origen: ${formType === 'hero' ? 'Formulario Principal' : 'Formulario Contacto'}
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
    formData.append('_next', currentUrl || 'https://amesticaltda.com/gracias'); // Página de confirmación

    // Enviar campos individuales para mejor procesamiento
    formData.append('nombre', data.nombre);
    formData.append('email', data.email);
    formData.append('telefono', data.telefono);
    formData.append('region', data.region);
    formData.append('comuna', data.comuna);
    formData.append('direccion', data.direccion);
    formData.append('servicio', serviceName);
    formData.append('mensaje', data.mensaje || '');
    formData.append('formType', formType);

    // También enviar el contenido completo como mensaje
    formData.append('message', emailContent);
    const response = await fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    // FormSubmit puede devolver success: true o simplemente un status 200
    const success = result.success === true || response.ok;

    if (success) {
      return {
        success: true,
        message: '¡Gracias por confiar en nosotros! Nos pondremos en contacto contigo a la brevedad.'
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
