import { PrismaClient } from '@prisma/client';
import { isDatabaseConfigured } from './database-config';

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
          url: 'postgresql://dummy:dummy@dummy.com:6543/dummy'
        }
      }
    });
  }

  // Verificar si la base de datos está configurada
  if (!isDatabaseConfigured()) {
    console.error('❌ Base de datos no configurada');
    throw new Error(`
      ❌ DATABASE_URL no configurada
      
      Para solucionarlo en Vercel:
      1. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables
      2. Agrega: DATABASE_URL = [tu-url-de-postgresql]
      3. Redeploya la aplicación
      
      Opciones de base de datos:
      - Vercel PostgreSQL (gratuito)
      - Supabase (gratuito) 
      - Railway (gratuito)
    `);
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
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

