import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed simplificado de la base de datos...");

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

  const tecnicoRole = await prisma.role.upsert({
    where: { name: "TECNICO" },
    update: {},
    create: { name: "TECNICO" },
  });

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

  const tecnicoPassword = await bcrypt.hash("tecnico123", 12);
  const tecnicoUser = await prisma.user.upsert({
    where: { email: "tecnico@amestica.cl" },
    update: {},
    create: {
      email: "tecnico@amestica.cl",
      name: "Juan Técnico",
      password: tecnicoPassword,
      phone: "555123456",
      address: "Taller",
      role: {
        connect: { id: tecnicoRole.id },
      },
    },
  });

  console.log("✅ Seed simplificado completado exitosamente!");
  console.log("\n📋 Usuarios creados:");
  console.log("👨‍💼 Admin: admin@amestica.cl / admin123");
  console.log("👩‍💼 Secretaria: secretaria@amestica.cl / secretaria123");
  console.log("🔧 Técnico: tecnico@amestica.cl / tecnico123");
}

main()
  .catch((e) => {
    console.error("❌ Error al ejecutar el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
