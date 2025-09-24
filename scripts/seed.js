const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear roles si no existen
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMINISTRADOR' },
      update: {},
      create: {
        name: 'ADMINISTRADOR',
      },
    });

    const secretariaRole = await prisma.role.upsert({
      where: { name: 'SECRETARIA' },
      update: {},
      create: {
        name: 'SECRETARIA',
      },
    });

    const tecnicoRole = await prisma.role.upsert({
      where: { name: 'TECNICO' },
      update: {},
      create: {
        name: 'TECNICO',
      },
    });
    // Hashear las contraseñas específicas para cada rol
    const adminPassword = await bcrypt.hash('admin123', 10);
    const secretariaPassword = await bcrypt.hash('secretaria123', 10);
    const tecnicoPassword = await bcrypt.hash('tecnico123', 10);
    // Crear usuario admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@amestica.cl' },
      update: {
        password: adminPassword,
        isActive: true,
      },
      create: {
        email: 'admin@amestica.cl',
        name: 'Administrador Principal',
        password: adminPassword,
        isActive: true,
        roleId: adminRole.id,
      },
    });
    // Crear usuario secretaria
    const secretaria = await prisma.user.upsert({
      where: { email: 'secretaria@amestica.cl' },
      update: {
        password: secretariaPassword,
        isActive: true,
      },
      create: {
        email: 'secretaria@amestica.cl',
        name: 'Secretaria',
        password: secretariaPassword,
        isActive: true,
        roleId: secretariaRole.id,
      },
    });
    // Crear usuario técnico
    const tecnico = await prisma.user.upsert({
      where: { email: 'tecnico@amestica.cl' },
      update: {
        password: tecnicoPassword,
        isActive: true,
      },
      create: {
        email: 'tecnico@amestica.cl',
        name: 'Técnico',
        password: tecnicoPassword,
        isActive: true,
        roleId: tecnicoRole.id,
      },
    });
    // Crear las tres empresas
    const companies = [
      {
        name: 'Amestica Ltda.',
        displayName: 'Amestica Ltda.',
        email: 'contacto@amestica.cl',
        phone: '+56 9 1234 5678',
        address: 'Santiago, Chile',
        type: 'AMESTICA',
        service: 'Servicios de reparación y mantenimiento',
        isActive: true,
      },
      {
        name: 'Multifugas',
        displayName: 'Multifugas',
        email: 'contacto@multifugas.cl',
        phone: '+56 9 2345 6789',
        address: 'Santiago, Chile',
        type: 'MULTIFUGAS',
        service: 'Servicios especializados en multifugas',
        isActive: true,
      },
      {
        name: 'Servifugas',
        displayName: 'Servifugas',
        email: 'contacto@servifugas.cl',
        phone: '+56 9 3456 7890',
        address: 'Santiago, Chile',
        type: 'SERVIFUGAS',
        service: 'Servicios de reparación y mantenimiento',
        isActive: true,
      },
    ];

    for (const companyData of companies) {
      const company = await prisma.company.create({
        data: companyData,
      });
    }

    // No crear clientes de ejemplo - el sistema parte desde cero
  } catch (error) {
    throw error;
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
