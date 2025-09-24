export interface Web3FormsData {
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje?: string;
  formType: 'hero' | 'contact';
}

const serviceNames: Record<string, string> = {
  deteccion_fugas: 'Detección de fugas de agua',
  destape_alcantarillado: 'Destape de alcantarillado',
  videoinspeccion: 'Videoinspección de ductos',
};

export const sendViaWeb3Forms = async (data: Web3FormsData): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const serviceName = serviceNames[data.servicio] || data.servicio;
    
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

    const formData = new FormData();
    formData.append('access_key', process.env.WEB3FORMS_ACCESS_KEY || '8c5a7e4f-4b2a-4e8d-9c3f-1a2b3c4d5e6f');
    formData.append('to', 'mpriquelme.dev@gmail.com');
    formData.append('from_name', 'Sistema de Cotizaciones - Améstica Ltda.');
    formData.append('subject', `🔥 Nueva Cotización: ${serviceName} - ${data.nombre}`);
    formData.append('message', emailContent);
    formData.append('replyto', data.email);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        message: '¡Gracias por confiar en nosotros! Nos pondremos en contacto contigo a la brevedad.'
      };
    } else {
      return {
        success: false,
        message: 'Lo sentimos, hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente.'
      };
    }

  } catch (error) {
    return {
      success: false,
      message: 'Lo sentimos, hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente.'
    };
  }
};
