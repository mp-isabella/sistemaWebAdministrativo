import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuración optimizada para evitar conflictos de prepared statements
const createPrismaClient = () => {
  // Verificar si estamos en build time
  const isBuildTime = process.env.NODE_ENV === 'production' &&
    process.env.SKIP_ENV_VALIDATION === 'true';

  if (isBuildTime) {
    console.log('⚠️ Build time detected - using dummy Prisma client');
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://dummy:dummy@localhost:5432/dummy'
        }
      }
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL!
      }
    }
  })
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // En producción, crear una nueva instancia
  prisma = createPrismaClient()
} else {
  // En desarrollo, usar singleton para evitar múltiples instancias
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

// Función para cerrar conexiones correctamente
export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
}

// Función para reconectar si es necesario
export const reconnectPrisma = async () => {
  try {
    await prisma.$connect()
  } catch (error) {
    console.error('Error reconnecting to database:', error)
  }
}

export { prisma };

