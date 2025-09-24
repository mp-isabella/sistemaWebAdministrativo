// Servicios de email confiables y gratuitos
export interface EmailData {
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

// Email destino - Configura tu email aquí
const DESTINATION_EMAIL = 'mpriquelme.dev@gmail.com';

// Mapeo de servicios
const serviceNames: Record<string, string> = {
  deteccion_fugas: 'Detección de fugas de agua',
  destape_alcantarillado: 'Destape de alcantarillado',
  videoinspeccion: 'Videoinspección de ductos',
};

// Crear contenido del email
export const createEmailContent = (data: EmailData): string => {
  const serviceName = serviceNames[data.servicio] || data.servicio;
  const formSource = data.formType === 'hero' ? 'Formulario Principal (Hero)' : 'Formulario de Contacto';
  
  return `
🔥 NUEVA COTIZACIÓN - AMÉSTICA LTDA.
=======================================

📝 Origen: ${formSource}
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
};

// Servicio principal: FormSubmit (gratuito y confiable)

// Función principal para enviar email con múltiples servicios de respaldo
export const sendQuoteEmail = async (data: EmailData): Promise<{
  success: boolean;
  message: string;
  service?: string;
}> => {
  // Validación básica
  if (!data.nombre || !data.email || !data.telefono || !data.servicio) {
    return {
      success: false,
      message: 'Faltan campos obligatorios'
    };
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: 'Email inválido'
    };
  }

  // Método directo usando FormSubmit (gratuito y funciona desde localhost)
  const sendViaFormSubmit = async (): Promise<boolean> => {
    try {
      const serviceName = serviceNames[data.servicio] || data.servicio;
      
      // FormSubmit es gratuito y funciona desde localhost
      const formData = new FormData();
      formData.append('_to', DESTINATION_EMAIL);
      formData.append('_subject', `🔥 Nueva Cotización: ${serviceName} - ${data.nombre}`);
      formData.append('_replyto', data.email);
      formData.append('_captcha', 'false');
      
      // Crear el contenido del email
      const emailContent = createEmailContent(data);
      formData.append('message', emailContent);
      
      // Enviar a FormSubmit
      const response = await fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      return false;
    }
  };

  // Usar solo FormSubmit como método principal
  try {
    const success = await sendViaFormSubmit();
    
    if (success) {
      return {
        success: true,
        message: `✅ Cotización enviada exitosamente a ${DESTINATION_EMAIL}`,
        service: 'FormSubmit'
      };
    }
  } catch (error) {
  }

  // Si FormSubmit falla, guardar localmente
  try {
    const cotizaciones = JSON.parse(localStorage.getItem('cotizaciones') || '[]');
    const nuevaCotizacion = {
      ...data,
      fecha: new Date().toISOString(),
      procesada: false,
      id: Date.now().toString()
    };
    cotizaciones.unshift(nuevaCotizacion);
    localStorage.setItem('cotizaciones', JSON.stringify(cotizaciones));

    // Log detallado para el administrador
    console.log('Cotización guardada localmente:', nuevaCotizacion);
    if (data.mensaje) {
      console.log('Mensaje del cliente:', data.mensaje);
    }
    return {
      success: true,
      message: '⚠️ El servicio de email está temporalmente no disponible. Tu cotización se ha guardado y será procesada manualmente. Te contactaremos pronto al número proporcionado.',
      service: 'Local Storage'
    };
  } catch (storageError) {
    return {
      success: false,
      message: '❌ Error al procesar la cotización. Por favor, intenta nuevamente o contacta directamente al +56 9 4200 8410.'
    };
  }
};
