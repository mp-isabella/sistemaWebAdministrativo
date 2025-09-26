#!/usr/bin/env node

/**
 * Script para crear las tablas manualmente en Supabase
 */

const { PrismaClient } = require('@prisma/client');

async function createTables() {
  console.log('🔧 Creando tablas manualmente...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Crear tabla Role
    console.log('📝 Creando tabla Role...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Role" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    console.log('✅ Tabla Role creada');

    // Crear tabla Company
    console.log('📝 Creando tabla Company...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Company" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "displayName" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "rut" TEXT,
        "logo" TEXT,
        "type" TEXT,
        "service" TEXT,
        "primaryColor" TEXT,
        "secondaryColor" TEXT,
        "accentColor" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    console.log('✅ Tabla Company creada');

    // Crear tabla User
    console.log('📝 Creando tabla User...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "password" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "roleId" TEXT NOT NULL,
        "companyId" TEXT,
        "resetToken" TEXT,
        "resetTokenExpiry" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `;
    console.log('✅ Tabla User creada');

    // Crear tabla Client
    console.log('📝 Creando tabla Client...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Client" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "region" TEXT,
        "commune" TEXT,
        "status" TEXT NOT NULL DEFAULT 'active',
        "company" TEXT,
        "rut" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    console.log('✅ Tabla Client creada');

    // Crear tabla Service
    console.log('📝 Creando tabla Service...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DOUBLE PRECISION,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    console.log('✅ Tabla Service creada');

    // Crear tabla Job
    console.log('📝 Creando tabla Job...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Job" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "scheduledAt" TIMESTAMP(3),
        "startTime" TEXT,
        "endTime" TEXT,
        "completedAt" TIMESTAMP(3),
        "totalBudget" DOUBLE PRECISION,
        "observations" TEXT,
        "images" TEXT,
        "signature" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "clientId" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "technicianId" TEXT,
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;
    console.log('✅ Tabla Job creada');

    console.log('\n🎉 ¡Todas las tablas creadas exitosamente!');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Prueba el login en http://localhost:3000');

  } catch (error) {
    console.log('❌ Error al crear tablas:');
    console.log(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTables().catch(console.error);
