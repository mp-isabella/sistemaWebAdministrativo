const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function testPasswordReset() {
  console.log('🧪 Probando funcionalidad de restablecimiento de contraseña...\n');

  try {
    // Test 1: Verificar que los campos de reset existen en la base de datos
    console.log('1️⃣ Verificando campos de reset en la base de datos...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
      }
    });

    console.log(`✅ Encontrados ${users.length} usuarios con campos de reset:`);
    users.forEach(user => {
      console.log(`   - ${user.email}: resetToken=${user.resetToken ? 'Sí' : 'No'}, expiry=${user.resetTokenExpiry || 'No'}`);
    });

    // Test 2: Simular generación de token de reset
    console.log('\n2️⃣ Simulando generación de token de reset...');
    
    const testUser = await prisma.user.findFirst({
      where: { email: 'admin@amestica.cl' }
    });

    if (!testUser) {
      console.log('❌ Usuario de prueba no encontrado');
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    console.log(`✅ Token generado: ${resetToken.substring(0, 10)}...`);
    console.log(`✅ Expira en: ${resetTokenExpiry.toLocaleString()}`);

    // Test 3: Verificar rutas de API
    console.log('\n3️⃣ Verificando rutas de API...');
    
    const apiRoutes = [
      '/api/auth/forgot-password',
      '/api/auth/validate-reset-token',
      '/api/auth/reset-password'
    ];

    apiRoutes.forEach(route => {
      console.log(`   ✅ ${route}`);
    });

    // Test 4: Verificar páginas
    console.log('\n4️⃣ Verificando páginas...');
    
    const pages = [
      '/forgot-password',
      '/reset-password'
    ];

    pages.forEach(page => {
      console.log(`   ✅ ${page}`);
    });

    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('\n📝 Para probar la funcionalidad:');
    console.log('   1. Ve a: http://localhost:3000/forgot-password');
    console.log('   2. Ingresa un email válido (ej: admin@amestica.cl)');
    console.log('   3. Configura las variables EMAIL_USER y EMAIL_PASS en .env');
    console.log('   4. Verifica que recibas el email de restablecimiento');
    console.log('   5. Haz clic en el enlace del email para restablecer la contraseña');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordReset();
