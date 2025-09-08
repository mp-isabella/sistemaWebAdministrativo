const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Limpiando caché y reiniciando sistema...\n');

// Limpiar caché de Next.js
const nextPath = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextPath)) {
  try {
    fs.rmSync(nextPath, { recursive: true, force: true });
    console.log('✅ Caché de Next.js limpiada');
  } catch (error) {
    console.log('⚠️ Error al limpiar caché de Next.js:', error.message);
  }
}

// Limpiar node_modules (opcional, solo si hay problemas)
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('📦 Verificando node_modules...');
  try {
    // Solo verificar que las dependencias estén instaladas
    execSync('npm list --depth=0', { stdio: 'pipe' });
    console.log('✅ Dependencias verificadas');
  } catch (error) {
    console.log('⚠️ Problemas con dependencias, reinstalando...');
    try {
      execSync('npm install', { stdio: 'pipe' });
      console.log('✅ Dependencias reinstaladas');
    } catch (installError) {
      console.log('❌ Error al reinstalar dependencias:', installError.message);
    }
  }
}

// Regenerar cliente de Prisma
console.log('\n🗄️ Regenerando cliente de Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'pipe' });
  console.log('✅ Cliente de Prisma regenerado');
} catch (error) {
  console.log('❌ Error al regenerar cliente de Prisma:', error.message);
}

// Sincronizar base de datos
console.log('\n🗄️ Sincronizando base de datos...');
try {
  execSync('npx prisma db push', { stdio: 'pipe' });
  console.log('✅ Base de datos sincronizada');
} catch (error) {
  console.log('❌ Error al sincronizar base de datos:', error.message);
}

// Verificar archivo .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXTAUTH_SECRET') && envContent.includes('NEXTAUTH_URL')) {
    console.log('✅ Archivo .env configurado correctamente');
  } else {
    console.log('⚠️ Archivo .env incompleto');
  }
} else {
  console.log('❌ Archivo .env no encontrado');
}

console.log('\n🎯 Limpieza completada');
console.log('📋 Próximos pasos:');
console.log('1. Ejecuta: npm run dev');
console.log('2. El sistema debería iniciar sin errores');
console.log('3. Las advertencias de NextAuth deberían desaparecer');
console.log('4. Todas las imágenes deberían cargar correctamente');
