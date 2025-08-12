import { PrismaClient, JobStatus, JobPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear roles
  console.log("📝 Creando roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const secretariaRole = await prisma.role.upsert({
    where: { name: "SECRETARIA" },
    update: {},
    create: { name: "SECRETARIA" },
  });

  const operadorRole = await prisma.role.upsert({
    where: { name: "OPERADOR" },
    update: {},
    create: { name: "OPERADOR" },
  });

  // Crear servicios
  console.log("🔧 Creando servicios...");
  const services = [
    {
      name: "Detección de Fugas",
      description: "Detección de fugas con tecnología especializada sin romper pisos ni paredes",
      price: 50000,
    },
    {
      name: "Reparación de Cañerías",
      description: "Reparación completa de sistemas de cañerías con garantía extendida",
      price: 80000,
    },
    {
      name: "Mantención Preventiva",
      description: "Mantención preventiva de sistemas de agua para evitar fugas futuras",
      price: 35000,
    },
  ];

  // Crear usuario administrador
  console.log("👥 Creando usuarios...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@amestica.cl" },
    update: {},
    create: {
      email: "admin@amestica.cl",
      name: "Administrador Principal",
      password: hashedPassword,
      phone: "123456789",
      address: "Oficina principal",
      role: {
        connect: { id: adminRole.id },
      },
    },
  });

  const secretariaPassword = await bcrypt.hash("secretaria123", 12);
  const secretariaUser = await prisma.user.upsert({
    where: { email: "secretaria@amestica.cl" },
    update: {},
    create: {
      email: "secretaria@amestica.cl",
      name: "María Secretaria",
      password: secretariaPassword,
      phone: "987654321",
      address: "Oficina central",
      role: {
        connect: { id: secretariaRole.id },
      },
    },
  });

  const operadorPassword = await bcrypt.hash("operador123", 12);
  const operadorUser = await prisma.user.upsert({
    where: { email: "operador@amestica.cl" },
    update: {},
    create: {
      email: "operador@amestica.cl",
      name: "Juan Operador",
      password: operadorPassword,
      phone: "555123456",
      address: "Taller",
      role: {
        connect: { id: operadorRole.id },
      },
    },
  });

  // Crear servicios (usando admin como creador)
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: {
        ...service,
        createdBy: {
          connect: { id: adminUser.id },
        },
      },
    });
  }

  // Crear clientes
  console.log("🏠 Creando clientes...");
  const clients = [
    {
      name: "María González Pérez",
      email: "maria.gonzalez@email.com",
      phone: "+56912345678",
      address: "Av. Las Condes 1234, Las Condes, Santiago",
    },
    {
      name: "Carlos Rodríguez Silva",
      email: "carlos.rodriguez@email.com",
      phone: "+56987654321",
      address: "Calle Valparaíso 567, Viña del Mar, V Región",
    },
    {
      name: "Ana Martínez López",
      email: "ana.martinez@email.com",
      phone: "+56911111111",
      address: "Av. Libertador 890, Rancagua, VI Región",
    },
    {
      name: "Pedro Sánchez Torres",
      email: "pedro.sanchez@email.com",
      phone: "+56922222222",
      address: "Calle Providencia 456, Providencia, Santiago",
    },
    {
      name: "Lucía Torres Morales",
      email: "lucia.torres@email.com",
      phone: "+56933333333",
      address: "Av. Brasil 123, Valparaíso, V Región",
    },
  ];

  const createdClients = [];

  for (const client of clients) {
    const createdClient = await prisma.client.upsert({
      where: { email: client.email },
      update: {},
      create: {
        ...client,
        createdBy: {
          connect: { id: adminUser.id },
        },
      },
    });

    createdClients.push(createdClient);
  }

  // Crear trabajos de ejemplo
  console.log("💼 Creando trabajos...");
  const detectionService = await prisma.service.findFirst({ where: { name: "Detección de Fugas" } });
  const repairService = await prisma.service.findFirst({ where: { name: "Reparación de Cañerías" } });
  const maintenanceService = await prisma.service.findFirst({ where: { name: "Mantención Preventiva" } });

  if (detectionService && repairService && maintenanceService) {
    const jobs = [
      {
        title: "Fuga en jardín - Casa Las Condes",
        description: "Cliente reporta fuga de agua en el jardín trasero. Se requiere detección con equipo especializado.",
        status: JobStatus.IN_PROGRESS,
        priority: JobPriority.HIGH,
        client: { connect: { id: createdClients[0].id } },
        service: { connect: { id: detectionService.id } },
        technician: { connect: { id: operadorUser.id } },
        createdBy: { connect: { id: secretariaUser.id } },
        scheduledAt: new Date("2024-01-16T09:00:00Z"),
      },
      {
        title: "Reparación cañería principal - Viña del Mar",
        description: "Reparación de cañería principal dañada en condominio.",
        status: JobStatus.COMPLETED,
        priority: JobPriority.MEDIUM,
        client: { connect: { id: createdClients[1].id } },
        service: { connect: { id: repairService.id } },
        technician: { connect: { id: operadorUser.id } },
        createdBy: { connect: { id: secretariaUser.id } },
        scheduledAt: new Date("2024-01-14T10:00:00Z"),
        completedAt: new Date("2024-01-14T16:30:00Z"),
      },
      {
        title: "Mantención preventiva - Rancagua",
        description: "Mantención preventiva programada para sistema de agua potable.",
        status: JobStatus.PENDING,
        priority: JobPriority.LOW,
        client: { connect: { id: createdClients[2].id } },
        service: { connect: { id: maintenanceService.id } },
        createdBy: { connect: { id: secretariaUser.id } },
        scheduledAt: new Date("2024-01-18T14:00:00Z"),
      },
    ];

    for (const job of jobs) {
      await prisma.job.create({ data: job });
    }
  }

  console.log("✅ Seed completado exitosamente!");
  console.log("\n📋 Usuarios creados:");
  console.log("👨‍💼 Admin: admin@amestica.cl / admin123");
  console.log("👩‍💼 Secretaria: secretaria@amestica.cl / secretaria123");
   console.log("🔧 Operador: operador@amestica.cl / operador123")
}
main()
  .catch((e) => {
    console.error("❌ Error al ejecutar el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });