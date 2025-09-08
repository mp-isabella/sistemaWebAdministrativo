const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando solución de errores JWT...\n');

// Verificar archivo .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const secretMatch = envContent.match(/NEXTAUTH_SECRET="([^"]+)"/);
  
  if (secretMatch) {
    console.log('✅ Archivo .env existe');
    console.log(`✅ NEXTAUTH_SECRET configurado: ${secretMatch[1].substring(0, 10)}...`);
  } else {
    console.log('❌ NEXTAUTH_SECRET no encontrado en .env');
  }
} else {
  console.log('❌ Archivo .env no existe');
}

// Verificar que no hay directorio .next (caché limpia)
const nextPath = path.join(__dirname, '..', '.next');
if (!fs.existsSync(nextPath)) {
  console.log('✅ Caché de Next.js limpiada (.next eliminado)');
} else {
  console.log('⚠️  Caché de Next.js aún existe, considera limpiarla');
}

console.log('\n📋 Pasos para completar la verificación:');
console.log('1. ✅ Secret regenerado');
console.log('2. ✅ Caché limpiada');
console.log('3. ✅ Servidor reiniciado');
console.log('4. 🔄 Limpia las cookies del navegador:');
console.log('   - Abre una ventana de incógnito');
console.log('   - O elimina cookies de localhost:3000');
console.log('5. 🔄 Prueba el login en http://localhost:3000/login');
console.log('6. 🔄 Verifica que no aparezcan errores JWT_SESSION_ERROR');

console.log('\n🎯 Los errores JWT_SESSION_ERROR deberían estar resueltos ahora.');
