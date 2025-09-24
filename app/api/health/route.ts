import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect()
    
    // Verificar que las tablas principales existan y tengan datos
    const [clientsCount, companiesCount, usersCount] = await Promise.all([
      prisma.client.count(),
      prisma.company.count(),
      prisma.user.count()
    ])
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        clients: clientsCount,
        companies: companiesCount,
        users: usersCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {

    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
