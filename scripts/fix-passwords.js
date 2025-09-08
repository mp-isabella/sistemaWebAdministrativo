const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswords() {
  console.log('🔧 ARREGLANDO CONTRASEÑAS EN LA BASE DE DATOS...');
  console.log('');

  try {
    // Contraseña que queremos usar para todos los usuarios
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('1. Actualizando contraseñas de usuarios...');

    // Actualizar admin
    const admin = await prisma.user.update({
      where: { email: 'admin@amestica.cl' },
      data: { password: hashedPassword }
    });
    console.log('   ✅ Admin actualizado');

    // Actualizar secretaria
    const secretaria = await prisma.user.update({
      where: { email: 'secretaria@amestica.cl' },
      data: { password: hashedPassword }
    });
    console.log('   ✅ Secretaria actualizada');

    // Actualizar técnico 1
    const tecnico1 = await prisma.user.update({
      where: { email: 'tecnico@amestica.cl' },
      data: { password: hashedPassword }
    });
    console.log('   ✅ Técnico 1 actualizado');

    // Actualizar técnico 2
    const tecnico2 = await prisma.user.update({
      where: { email: 'martin@amestica.cl' },
      data: { password: hashedPassword }
    });
    console.log('   ✅ Técnico 2 actualizado');

    console.log('');
    console.log('🎉 CONTRASEÑAS ACTUALIZADAS EXITOSAMENTE');
    console.log('');
    console.log('📋 CREDENCIALES DE ACCESO:');
    console.log('   - Email: admin@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('   - Email: secretaria@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('   - Email: tecnico@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('   - Email: martin@amestica.cl');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('🔐 Ahora puedes iniciar sesión con cualquiera de estas credenciales');

  } catch (error) {
    console.error('❌ Error actualizando contraseñas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixPasswords().catch(console.error);
