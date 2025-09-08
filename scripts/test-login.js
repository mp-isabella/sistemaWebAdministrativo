const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  console.log('🧪 Probando login con nuevas variables de entorno...\n');

  try {
    // Verificar que las variables de entorno estén configuradas
    console.log('1️⃣ Verificando variables de entorno...');
    
    if (!process.env.NEXTAUTH_SECRET) {
      console.log('❌ NEXTAUTH_SECRET no está configurado');
      return;
    }
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL no está configurado');
      return;
    }
    
    console.log('✅ Variables de entorno configuradas correctamente');
    console.log(`   - NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET.substring(0, 10)}...`);
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL}`);
    console.log(`   - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'No configurado'}`);

    // Verificar conexión a la base de datos
    console.log('\n2️⃣ Verificando conexión a la base de datos...');
    
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos exitosa');

    // Verificar usuarios
    console.log('\n3️⃣ Verificando usuarios...');
    
    const users = await prisma.user.findMany({
      include: { role: true }
    });

    console.log(`✅ Encontrados ${users.length} usuarios:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role.name} - Activo: ${user.isActive}`);
    });

    // Probar autenticación
    console.log('\n4️⃣ Probando autenticación...');
    
    const testUser = {
      email: 'admin@amestica.cl',
      password: 'admin123'
    };

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
      include: { role: true }
    });

    if (!user) {
      console.log('❌ Usuario de prueba no encontrado');
      return;
    }

    const isPasswordValid = await bcrypt.compare(testUser.password, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Autenticación exitosa');
      console.log(`   - Usuario: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Rol: ${user.role.name}`);
      console.log(`   - Activo: ${user.isActive}`);
    } else {
      console.log('❌ Contraseña inválida');
    }

    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('\n📝 Para probar el login en el navegador:');
    console.log('   1. Ve a: http://localhost:3000/login');
    console.log('   2. Usa las credenciales:');
    console.log('      - Admin: admin@amestica.cl / admin123');
    console.log('      - Secretaria: secretaria@amestica.cl / secretaria123');
    console.log('      - Técnico: tecnico@amestica.cl / tecnico123');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
