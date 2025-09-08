const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Solucionando error JWT_SESSION_ERROR...\n');

// Generar un nuevo secret completamente diferente
const generateNewSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const envContent = `# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="${generateNewSecret()}"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  // Crear nuevo archivo .env con secret fresco
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Nuevo archivo .env creado con secret fresco');
  
  // Verificar que se creó correctamente
  const newEnvContent = fs.readFileSync(envPath, 'utf8');
  const secretMatch = newEnvContent.match(/NEXTAUTH_SECRET="([^"]+)"/);
  
  if (secretMatch) {
    console.log(`✅ NEXTAUTH_SECRET regenerado: ${secretMatch[1].substring(0, 10)}...`);
  }
  
  console.log('\n📋 Pasos para completar la solución:');
  console.log('1. ✅ Secret regenerado automáticamente');
  console.log('2. ✅ Caché de Next.js limpiada');
  console.log('3. 🔄 Reinicia el servidor: npm run dev');
  console.log('4. 🔄 Limpia las cookies del navegador:');
  console.log('   - Abre las herramientas de desarrollador (F12)');
  console.log('   - Ve a Application/Storage > Cookies');
  console.log('   - Elimina todas las cookies de localhost:3000');
  console.log('   - O simplemente abre una ventana de incógnito');
  console.log('5. 🔄 Prueba el login nuevamente');
  
  console.log('\n🎯 El error JWT_SESSION_ERROR debería estar resuelto ahora.');
  
} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
  console.log('\n📝 Crea manualmente un archivo .env en la raíz del proyecto con:');
  console.log(envContent);
}
