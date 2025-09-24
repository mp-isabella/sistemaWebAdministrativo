const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIÓN FINAL PARA LOGIN...');

try {
    // 1. Limpiar archivos de entorno
    console.log('🗑️ Limpiando archivos de entorno...');
    if (fs.existsSync('.env')) fs.unlinkSync('.env');
    if (fs.existsSync('.env.local')) fs.unlinkSync('.env.local');

    // 2. Crear .env con SQLite
    const envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="nueva-clave-secreta-super-segura-2024-renovada-12345"`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado con SQLite');

    // 3. Configurar schema para SQLite
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');

    schemaContent = schemaContent.replace(
        'provider = "postgresql"',
        'provider = "sqlite"'
    );

    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Schema configurado para SQLite');

    // 4. Ejecutar comandos de Prisma
    const { execSync } = require('child_process');

    console.log('🔄 Generando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('🔄 Creando base de datos...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('🔄 Poblando base de datos...');
    execSync('npx prisma db seed', { stdio: 'inherit' });

    console.log('');
    console.log('✅ CONFIGURACIÓN COMPLETADA');
    console.log('');
    console.log('🚀 Ahora ejecuta: npm run dev');
    console.log('');
    console.log('🔑 Credenciales de prueba:');
    console.log('- secretaria@amestica.cl / secretaria123 (Rol: secretaria)');
    console.log('- admin@amestica.cl / admin123 (Rol: administrador)');
    console.log('- tecnico@amestica.cl / tecnico123 (Rol: tecnico)');
    console.log('');
    console.log('🌐 Ve a: http://localhost:3001/login');

} catch (error) {
    console.error('❌ Error:', error.message);
}
