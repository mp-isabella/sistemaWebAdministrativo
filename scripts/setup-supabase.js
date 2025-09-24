#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuración de Supabase para SistemaWeb');
console.log('==========================================\n');

console.log('📋 Pasos para configurar Supabase:');
console.log('1. Ve a https://supabase.com y crea una cuenta');
console.log('2. Crea un nuevo proyecto');
console.log('3. Ve a Settings → Database');
console.log('4. Copia la Connection string');
console.log('5. Reemplaza [password] con tu contraseña de la base de datos\n');

console.log('📝 Variables que necesitas configurar:');
console.log('- DATABASE_URL: La URI de conexión de Supabase');
console.log('- NEXTAUTH_SECRET: Una clave secreta para autenticación\n');

console.log('🔧 Comandos para ejecutar después de configurar:');
console.log('1. npm run db:push  # Sincronizar esquema con Supabase');
console.log('2. npm run db:seed  # Poblar la base de datos (opcional)');
console.log('3. npm run dev      # Iniciar el servidor de desarrollo\n');

console.log('📁 Archivos importantes:');
console.log('- .env.local: Variables de entorno (crear manualmente)');
console.log('- prisma/schema.prisma: Esquema de la base de datos');
console.log('- scripts/seed.js: Datos iniciales\n');

console.log('✅ Una vez configurado, tu aplicación estará lista para producción!');
