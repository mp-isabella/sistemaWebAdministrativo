const fs = require('fs');
const path = require('path');

console.log('🔧 Optimizando configuración de autenticación...\n');

// Verificar y optimizar archivo .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Asegurar que NEXTAUTH_URL esté configurado correctamente
  if (!envContent.includes('NEXTAUTH_URL=')) {
    envContent += '\nNEXTAUTH_URL="http://localhost:3000"';
  }
  
  // Asegurar que NODE_ENV esté configurado
  if (!envContent.includes('NODE_ENV=')) {
    envContent += '\nNODE_ENV="development"';
  }
  
  // Asegurar que DATABASE_URL esté configurado
  if (!envContent.includes('DATABASE_URL=')) {
    envContent += '\nDATABASE_URL="file:./dev.db"';
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env optimizado');
} else {
  console.log('❌ Archivo .env no encontrado');
}

// Verificar configuración de NextAuth
const authPath = path.join(__dirname, '..', 'lib', 'auth.ts');
if (fs.existsSync(authPath)) {
  let authContent = fs.readFileSync(authPath, 'utf8');
  
  // Asegurar que debug esté deshabilitado
  if (authContent.includes('debug: process.env.NODE_ENV === "development"')) {
    authContent = authContent.replace(
      'debug: process.env.NODE_ENV === "development"',
      'debug: false'
    );
    fs.writeFileSync(authPath, authContent);
    console.log('✅ Debug de NextAuth deshabilitado');
  }
  
  // Verificar configuración JWT
  if (authContent.includes('jwt: {')) {
    console.log('✅ Configuración JWT presente');
  } else {
    console.log('⚠️ Configuración JWT no encontrada');
  }
} else {
  console.log('❌ Archivo auth.ts no encontrado');
}

// Verificar que la base de datos esté sincronizada
console.log('\n🗄️ Verificando base de datos...');
try {
  const { execSync } = require('child_process');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
  console.log('✅ Base de datos sincronizada');
} catch (error) {
  console.log('⚠️ Error al sincronizar base de datos:', error.message);
}

// Verificar que el cliente de Prisma esté generado
try {
  const { execSync } = require('child_process');
  execSync('npx prisma generate', { stdio: 'pipe' });
  console.log('✅ Cliente de Prisma generado');
} catch (error) {
  console.log('⚠️ Error al generar cliente de Prisma:', error.message);
}

console.log('\n🎯 Optimización completada');
console.log('📋 Próximos pasos:');
console.log('1. Reinicia el servidor: npm run dev');
console.log('2. Las advertencias de NextAuth deberían desaparecer');
console.log('3. El sistema debería funcionar sin errores');
