const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar roles
    console.log('\n📋 Verificando roles...');
    const roles = await prisma.role.findMany();
    console.log('Roles encontrados:', roles.map(r => r.name));
    
    // Verificar usuarios
    console.log('\n👥 Verificando usuarios...');
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });
    
    console.log('Usuarios encontrados:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Rol: ${user.role.name} - Activo: ${user.isActive}`);
    });
    
    // Verificar credenciales de prueba
    console.log('\n🔐 Verificando credenciales de prueba...');
    
    const testUsers = [
      { email: 'admin@amestica.cl', password: 'admin123' },
      { email: 'secretaria@amestica.cl', password: 'secretaria123' },
      { email: 'tecnico@amestica.cl', password: 'tecnico123' }
    ];
    
    for (const testUser of testUsers) {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: { role: true }
      });
      
      if (user) {
        const isValid = await bcrypt.compare(testUser.password, user.password);
        console.log(`✅ ${testUser.email}: ${isValid ? 'Contraseña válida' : 'Contraseña inválida'} - Rol: ${user.role.name}`);
      } else {
        console.log(`❌ ${testUser.email}: Usuario no encontrado`);
      }
    }
    
    // Verificar servicios
    console.log('\n🔧 Verificando servicios...');
    const services = await prisma.service.findMany();
    console.log(`Servicios encontrados: ${services.length}`);
    
    // Verificar clientes
    console.log('\n🏠 Verificando clientes...');
    const clients = await prisma.client.findMany();
    console.log(`Clientes encontrados: ${clients.length}`);
    
    // Verificar trabajos
    console.log('\n💼 Verificando trabajos...');
    const jobs = await prisma.job.findMany();
    console.log(`Trabajos encontrados: ${jobs.length}`);
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
