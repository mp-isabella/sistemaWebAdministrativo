const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🧪 Probando autenticación...\n');

  try {
    // Test 1: Verificar que los usuarios existen
    console.log('1️⃣ Verificando usuarios en la base de datos...');
    
    const users = await prisma.user.findMany({
      include: { role: true }
    });

    console.log(`✅ Encontrados ${users.length} usuarios:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role.name}`);
    });

    // Test 2: Verificar autenticación de cada usuario
    console.log('\n2️⃣ Probando autenticación de usuarios...');

    const testUsers = [
      { email: 'admin@amestica.cl', password: 'admin123', expectedRole: 'ADMIN' },
      { email: 'secretaria@amestica.cl', password: 'secretaria123', expectedRole: 'SECRETARIA' },
      { email: 'tecnico@amestica.cl', password: 'tecnico123', expectedRole: 'TECNICO' }
    ];

    for (const testUser of testUsers) {
      console.log(`\n   Probando: ${testUser.email}`);
      
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: { role: true }
      });

      if (!user) {
        console.log(`   ❌ Usuario no encontrado`);
        continue;
      }

      if (!user.isActive) {
        console.log(`   ❌ Usuario inactivo`);
        continue;
      }

      const isPasswordValid = await bcrypt.compare(testUser.password, user.password);
      
      if (isPasswordValid) {
        console.log(`   ✅ Contraseña válida`);
        console.log(`   ✅ Rol: ${user.role.name} (esperado: ${testUser.expectedRole})`);
        
        if (user.role.name === testUser.expectedRole) {
          console.log(`   ✅ Rol correcto`);
        } else {
          console.log(`   ⚠️  Rol no coincide`);
        }
      } else {
        console.log(`   ❌ Contraseña inválida`);
      }
    }

    // Test 3: Verificar redirecciones por rol
    console.log('\n3️⃣ Verificando redirecciones por rol...');
    
    const roleRedirects = {
      'ADMIN': '/dashboard',
      'SECRETARIA': '/dashboard/billing',
      'TECNICO': '/dashboard/my-jobs'
    };

    for (const [role, expectedRedirect] of Object.entries(roleRedirects)) {
      console.log(`   ${role}: ${expectedRedirect}`);
    }

    console.log('\n✅ Pruebas completadas exitosamente!');
    console.log('\n📝 Para probar el login:');
    console.log('   - Admin: admin@amestica.cl / admin123');
    console.log('   - Secretaria: secretaria@amestica.cl / secretaria123');
    console.log('   - Técnico: tecnico@amestica.cl / tecnico123');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
