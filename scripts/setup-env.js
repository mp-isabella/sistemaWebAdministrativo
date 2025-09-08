const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Configurando variables de entorno...');

// Generar un secret seguro para NextAuth
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const envContent = `# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="${generateSecret()}"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# Email Configuration (Gmail)
# Para usar Gmail, necesitas:
# 1. Habilitar autenticación de 2 factores
# 2. Generar una contraseña de aplicación
# 3. Usar esa contraseña aquí
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-app-password"

# Ejemplo de configuración:
# EMAIL_USER="admin@amestica.cl"
# EMAIL_PASS="abcd efgh ijkl mnop"
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente!');
  console.log('📝 Variables configuradas:');
  console.log('   - DATABASE_URL: file:./dev.db');
  console.log('   - NEXTAUTH_SECRET: [generado automáticamente]');
  console.log('   - NEXTAUTH_URL: http://localhost:3000');
  console.log('   - NODE_ENV: development');
  console.log('   - EMAIL_USER: [configurar con tu email]');
  console.log('   - EMAIL_PASS: [configurar con tu app password]');
  console.log('\n📧 Para configurar el envío de emails:');
  console.log('   1. Configura EMAIL_USER con tu email de Gmail');
  console.log('   2. Configura EMAIL_PASS con tu contraseña de aplicación');
  console.log('   3. Para generar app password:');
  console.log('      - Ve a tu cuenta de Google');
  console.log('      - Seguridad > Verificación en 2 pasos');
  console.log('      - Contraseñas de aplicación');
  console.log('\n🚀 Ahora puedes ejecutar: npm run dev');
} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
  console.log('\n📝 Crea manualmente un archivo .env en la raíz del proyecto con:');
  console.log(envContent);
}
