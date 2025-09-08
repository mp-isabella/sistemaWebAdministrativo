const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testLiquidations() {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    
    // Verificar que la base de datos esté conectada
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos')
    
    // Verificar si existen liquidaciones
    const liquidations = await prisma.liquidation.findMany({
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`📋 Liquidaciones encontradas: ${liquidations.length}`)
    
    if (liquidations.length > 0) {
      console.log('📄 Primera liquidación:')
      console.log(JSON.stringify(liquidations[0], null, 2))
    } else {
      console.log('ℹ️ No hay liquidaciones en la base de datos')
      
      // Verificar si existen técnicos
      const technicians = await prisma.user.findMany({
        where: {
          role: {
            name: {
              in: ['TECNICO', 'tecnico']
            }
          },
          isActive: true
        },
        include: {
          role: true
        }
      })
      
      console.log(`👷 Técnicos encontrados: ${technicians.length}`)
      
      // Verificar si existen empresas
      const companies = await prisma.company.findMany({
        where: {
          isActive: true
        }
      })
      
      console.log(`🏢 Empresas encontradas: ${companies.length}`)
      
      if (technicians.length > 0 && companies.length > 0) {
        console.log('✅ Hay técnicos y empresas disponibles para crear liquidaciones')
      } else {
        console.log('❌ Faltan técnicos o empresas para crear liquidaciones')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLiquidations()
