import { sendSimpleEmail } from './simple-email-service';

export interface QuoteEmailData {
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

// Función para obtener el número de teléfono según la región
const getPhoneNumberByRegion = (region: string): string => {
  const regionLower = region.toLowerCase();

  // Regiones que corresponden a Santiago
  if (regionLower.includes('metropolitana') || regionLower.includes('santiago') ||
    regionLower.includes('valparaíso') || regionLower.includes('valparaiso') ||
    regionLower.includes('ohiggins') || regionLower.includes('maule') ||
    regionLower.includes('biobío') || regionLower.includes('biobio') ||
    regionLower.includes('araucanía') || regionLower.includes('araucania') ||
    regionLower.includes('los ríos') || regionLower.includes('los lagos') ||
    regionLower.includes('aysén') || regionLower.includes('aysen') ||
    regionLower.includes('magallanes') || regionLower.includes('antofagasta') ||
    regionLower.includes('atacama') || regionLower.includes('coquimbo')) {
    return '+56 9 4200 8410';
  }

  // Regiones que corresponden a Ñuble
  if (regionLower.includes('ñuble') || regionLower.includes('nuble')) {
    return '+56 9 9670 6640';
  }

  // Por defecto, usar Santiago
  return '+56 9 4200 8410';
};

export const sendCustomQuoteEmail = async (data: QuoteEmailData): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Usar servicio simple en todos los entornos
    // Convertir QuoteEmailData a SimpleEmailData
    const simpleData = {
      ...data,
      mensaje: data.mensaje || ''
    };

    return await sendSimpleEmail(simpleData);

  } catch (error) {
    // Obtener el número de teléfono correcto según la región
    const phoneNumber = getPhoneNumberByRegion(data.region);

    // Manejo específico de errores de credenciales
    if (error instanceof Error) {
      if (error.message.includes('GMAIL_USER') || error.message.includes('GMAIL_APP_PASSWORD')) {
        return {
          success: false,
          message: 'Error de configuración del servidor. Por favor, contacta al administrador del sistema.'
        };
      }

      if (error.message.includes('EAUTH') || error.message.includes('Missing credentials')) {
        return {
          success: false,
          message: 'Error de autenticación del servidor de email. Por favor, contacta al administrador del sistema.'
        };
      }
    }

    return {
      success: false,
      message: `Lo sentimos, hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente o contáctanos directamente al ${phoneNumber}.`
    };
  }
};
