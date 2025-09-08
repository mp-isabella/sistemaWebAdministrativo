#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Actualizando base de datos para formularios del sitio web...\n');

try {
  // Generar cliente Prisma
  console.log('📦 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma generado exitosamente\n');

  // Ejecutar migraciones
  console.log('🔄 Ejecutando migraciones...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Base de datos actualizada exitosamente\n');

  // Verificar estado
  console.log('🔍 Verificando estado de la base de datos...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Base de datos verificada y sembrada exitosamente\n');

  console.log('🎉 ¡Base de datos actualizada completamente!');
  console.log('\n📋 Nuevas funcionalidades disponibles:');
  console.log('   ✅ Modelo de notificaciones del sitio web');
  console.log('   ✅ API para crear y gestionar notificaciones');
  console.log('   ✅ API para envío de correos electrónicos');
  console.log('   ✅ Formularios con validación completa');
  console.log('   ✅ Campo de servicio como input de texto');
  console.log('   ✅ Notificaciones en tiempo real en el panel');
  console.log('\n🌐 Puedes probar los formularios en:');
  console.log('   - Sitio web: http://localhost:3000');
  console.log('   - Panel administrativo: http://localhost:3000/dashboard/website-notifications');

} catch (error) {
  console.error('❌ Error durante la actualización:', error.message);
  console.log('\n🔧 Solución de problemas:');
  console.log('   1. Verifica que Prisma esté instalado: npm install @prisma/client');
  console.log('   2. Verifica que la base de datos esté accesible');
  console.log('   3. Ejecuta manualmente: npx prisma db push');
  process.exit(1);
}
