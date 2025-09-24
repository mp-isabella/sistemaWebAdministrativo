const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando problemas de login...');

try {
    // 1. Limpiar caché de Next.js
    console.log('🗑️ Limpiando caché de Next.js...');
    const nextCacheDir = path.join(__dirname, '..', '.next');
    if (fs.existsSync(nextCacheDir)) {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
    }

    // 2. Limpiar caché de Prisma
    console.log('🗑️ Limpiando caché de Prisma...');
    const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');
    if (fs.existsSync(prismaDir)) {
        fs.rmSync(prismaDir, { recursive: true, force: true });
    }

    // 3. Regenerar Prisma Client
    console.log('🔄 Regenerando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 4. Verificar base de datos
    console.log('🔍 Verificando base de datos...');
    execSync('node scripts/check-database.js', { stdio: 'inherit' });

    console.log('✅ Configuración completada');
    console.log('');
    console.log('📝 Pasos siguientes:');
    console.log('1. Abre el navegador en modo incógnito');
    console.log('2. Ve a http://localhost:3000/clear-cookies.html');
    console.log('3. Luego ve a http://localhost:3000/login');
    console.log('4. Intenta hacer login con:');
    console.log('   Email: secretaria@amestica.cl');
    console.log('   Password: secretaria123');
    console.log('');
    console.log('🚀 Iniciando servidor...');
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
