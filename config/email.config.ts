export const emailConfig = {
  // Configuración de Gmail
  gmail: {
    user: process.env.GMAIL_USER || 'tu-email@gmail.com',
    appPassword: process.env.GMAIL_APP_PASSWORD || 'tu-contraseña-de-aplicacion',
  },
  
  // URL de la aplicación
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Configuración del email de recuperación
  recovery: {
    subject: 'Recuperación de Contraseña - Sistema Administrativo',
    fromName: 'Sistema Administrativo',
    template: {
      title: 'Recuperación de Contraseña',
      description: 'Has solicitado restablecer tu contraseña para el Sistema Administrativo.',
      buttonText: 'Restablecer Contraseña',
      footer: 'Sistema Administrativo',
    }
  }
};

export const getEmailTransporter = () => {
  // Esta función se puede usar para crear el transportador de email
  // cuando se implemente nodemailer
  return null;
};
