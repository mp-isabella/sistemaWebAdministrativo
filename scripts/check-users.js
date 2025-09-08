const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });
    
    console.log(`📊 Total de usuarios: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      users.forEach((user, index) => {
        console.log(`\n👤 Usuario ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.name || 'N/A'}`);
        console.log(`   Rol: ${user.role?.name || 'N/A'}`);
        console.log(`   Activo: ${user.isActive}`);
      });
    }
    
    console.log('\n🔍 Verificando roles en la base de datos...');
    
    const roles = await prisma.role.findMany();
    
    console.log(`📊 Total de roles: ${roles.length}`);
    
    if (roles.length === 0) {
      console.log('❌ No hay roles en la base de datos');
    } else {
      roles.forEach((role, index) => {
        console.log(`\n🏷️  Rol ${index + 1}:`);
        console.log(`   ID: ${role.id}`);
        console.log(`   Nombre: ${role.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
