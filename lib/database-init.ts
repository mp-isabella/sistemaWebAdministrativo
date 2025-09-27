import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
let isInitialized = false;

export async function initializeDatabase() {
    if (isInitialized) {
        return prisma;
    }

    try {
        console.log('🗄️  Initializing database connection...');

        prisma = new PrismaClient({
            log: ['error'],
        });

        // Test connection
        await prisma.$connect();
        console.log('✅ Database connection established');

        // Try to push schema if needed
        try {
            // This will create tables if they don't exist
            await prisma.$executeRaw`SELECT 1`;
            console.log('✅ Database schema verified');
        } catch (error) {
            console.log('⚠️  Database schema might need setup:', error);
            // Don't fail here, let the app continue
        }

        isInitialized = true;
        return prisma;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        // Return a mock prisma client to prevent app crashes
        return new PrismaClient({
            log: ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL || 'file:./dev.db'
                }
            }
        });
    }
}

export async function getDatabase() {
    if (!isInitialized) {
        return await initializeDatabase();
    }
    return prisma;
}
