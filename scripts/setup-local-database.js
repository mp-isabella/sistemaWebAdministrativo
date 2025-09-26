#!/usr/bin/env node

/**
 * Script para configurar la base de datos local
 * Este script ayuda a configurar PostgreSQL local para desarrollo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando base de datos local...\n');

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creando archivo .env.local...');

    // Leer el template
    const templatePath = path.join(process.cwd(), 'env.local.template');
    if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, 'utf8');
        fs.writeFileSync(envPath, template);
        console.log('✅ Archivo .env.local creado desde template');
    } else {
        console.log('❌ No se encontró el archivo env.local.template');
        process.exit(1);
    }
} else {
    console.log('✅ Archivo .env.local ya existe');
}

// Verificar si PostgreSQL está disponible
console.log('\n🔍 Verificando PostgreSQL...');
try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL está instalado');
} catch (error) {
    console.log('❌ PostgreSQL no está instalado o no está en el PATH');
    console.log('\n📋 Opciones para instalar PostgreSQL:');
    console.log('1. Descargar desde: https://www.postgresql.org/download/');
    console.log('2. Usar Docker: docker run --name postgres-local -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sistemaweb_local -p 5432:5432 -d postgres:15');
    console.log('3. Usar un servicio en la nube como Supabase');
    process.exit(1);
}

// Crear base de datos si no existe
console.log('\n🗄️ Configurando base de datos...');
try {
    // Intentar conectar a la base de datos
    execSync('psql -h localhost -U postgres -d sistemaweb_local -c "SELECT 1;"', { stdio: 'pipe' });
    console.log('✅ Base de datos sistemaweb_local ya existe');
} catch (error) {
    console.log('📝 Creando base de datos sistemaweb_local...');
    try {
        execSync('createdb -h localhost -U postgres sistemaweb_local', { stdio: 'pipe' });
        console.log('✅ Base de datos creada exitosamente');
    } catch (createError) {
        console.log('❌ Error al crear la base de datos');
        console.log('💡 Asegúrate de que PostgreSQL esté ejecutándose y que tengas permisos');
        console.log('💡 Comando manual: createdb -h localhost -U postgres sistemaweb_local');
    }
}

// Aplicar migraciones de Prisma
console.log('\n🔄 Aplicando migraciones de Prisma...');
try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Migraciones aplicadas exitosamente');
} catch (error) {
    console.log('❌ Error al aplicar migraciones');
    console.log('💡 Verifica que la conexión a la base de datos sea correcta');
    process.exit(1);
}

// Generar cliente Prisma
console.log('\n🔧 Generando cliente Prisma...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma generado');
} catch (error) {
    console.log('❌ Error al generar cliente Prisma');
    process.exit(1);
}

console.log('\n🎉 ¡Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecuta: npm run dev');
console.log('2. Abre: http://localhost:3000');
console.log('3. (Opcional) Ejecuta: npm run db:seed para datos de prueba');
