const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkSecretaryPasswords() {
  try {
    // Buscar todas las secretarias
    const secretaries = await prisma.user.findMany({
      where: {
        role: {
          name: 'SECRETARIA'
        }
      },
      include: {
        role: true
      }
    });
    for (const secretary of secretaries) {
      }...`);
      // Probar contraseña común
      const testPasswords = ['admin123', 'temp123', 'password', '123456'];
      let passwordFound = false;
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, secretary.password);
        if (isValid) {
          passwordFound = true;
          break;
        }
      }
      
      if (!passwordFound) {
      }
    }

    // Verificar si las secretarias específicas existen
    const marcela = await prisma.user.findUnique({
      where: { email: 'marcela.lagos@amestica.cl' },
      include: { role: true }
    });
    
    const sofia = await prisma.user.findUnique({
      where: { email: 'sofia.ro@amestica.cl' },
      include: { role: true }
    });

    if (marcela) {
      }...`);
      // Probar contraseña
      const isValid = await bcrypt.compare('admin123', marcela.password);
    } else {
    }

    if (sofia) {
      }...`);
      // Probar contraseña
      const isValid = await bcrypt.compare('admin123', sofia.password);
    } else {
    }

  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

checkSecretaryPasswords();

