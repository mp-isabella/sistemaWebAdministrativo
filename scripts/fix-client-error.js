const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Solucionando error CLIENT_FETCH_ERROR de NextAuth...\n');

// Limpiar caché de Next.js
const nextPath = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextPath)) {
  try {
    fs.rmSync(nextPath, { recursive: true, force: true });
    console.log('✅ Caché de Next.js limpiada');
  } catch (error) {
    console.log('⚠️ Error al limpiar caché:', error.message);
  }
}

// Regenerar NEXTAUTH_SECRET
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Generar nuevo secret
  const crypto = require('crypto');
  const newSecret = crypto.randomBytes(32).toString('base64');
  
  // Reemplazar NEXTAUTH_SECRET
  if (envContent.includes('NEXTAUTH_SECRET=')) {
    envContent = envContent.replace(
      /NEXTAUTH_SECRET=.*/,
      `NEXTAUTH_SECRET="${newSecret}"`
    );
  } else {
    envContent += `\nNEXTAUTH_SECRET="${newSecret}"`;
  }
  
  // Asegurar que NEXTAUTH_URL esté configurado
  if (!envContent.includes('NEXTAUTH_URL=')) {
    envContent += '\nNEXTAUTH_URL="http://localhost:3000"';
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ NEXTAUTH_SECRET regenerado');
} else {
  console.log('❌ Archivo .env no encontrado');
}

// Regenerar cliente de Prisma
console.log('\n🗄️ Regenerando cliente de Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'pipe' });
  console.log('✅ Cliente de Prisma regenerado');
} catch (error) {
  console.log('❌ Error al regenerar cliente de Prisma:', error.message);
}

// Verificar configuración de NextAuth
const authPath = path.join(__dirname, '..', 'lib', 'auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  // Verificar que los callbacks manejen valores undefined
  if (authContent.includes('|| ""') && authContent.includes('|| "user"')) {
    console.log('✅ Callbacks de NextAuth configurados correctamente');
  } else {
    console.log('⚠️ Callbacks de NextAuth necesitan configuración');
  }
  
  // Verificar que debug esté deshabilitado
  if (authContent.includes('debug: false')) {
    console.log('✅ Debug de NextAuth deshabilitado');
  } else {
    console.log('⚠️ Debug de NextAuth aún habilitado');
  }
} else {
  console.log('❌ Archivo auth.ts no encontrado');
}

console.log('\n🎯 Solución aplicada');
console.log('📋 Próximos pasos:');
console.log('1. Ejecuta: npm run dev');
console.log('2. Limpia las cookies del navegador');
console.log('3. Abre una ventana de incógnito');
console.log('4. El error CLIENT_FETCH_ERROR debería desaparecer');
