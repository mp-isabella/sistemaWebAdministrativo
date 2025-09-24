import { PrismaClient } from '@prisma/client'

// Cliente de Prisma para operaciones de base de datos
export const prisma = new PrismaClient()

// Función para probar la conexión
export async function testDatabaseConnection() {
    try {
        // Probar conexión con Prisma
        await prisma.$connect()
        console.log('✅ Conexión a base de datos exitosa (Prisma)')
        return true
    } catch (error) {
        console.error('❌ Error de conexión a base de datos:', error)
        return false
    }
}

// Función para cerrar conexiones
export async function closeDatabaseConnections() {
    await prisma.$disconnect()
}
