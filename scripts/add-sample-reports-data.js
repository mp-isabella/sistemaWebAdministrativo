const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleReportsData() {
  try {
    console.log('📊 Agregando datos de muestra para reportes...\n')

    // 1. Verificar que existen los servicios necesarios
    const services = await prisma.service.findMany({
      where: {
        name: {
          in: ['Amestica', 'Multifugas', 'Servifugas']
        }
      }
    })

    if (services.length === 0) {
      console.log('❌ No se encontraron los servicios necesarios. Ejecuta primero el script de servicios.')
      return
    }

    console.log('✅ Servicios encontrados:', services.map(s => s.name))

    // 2. Verificar que existen técnicos
    const technicians = await prisma.user.findMany({
      where: {
        role: { name: 'tecnico' },
        isActive: true
      }
    })

    if (technicians.length === 0) {
      console.log('❌ No se encontraron técnicos. Ejecuta primero el script de usuarios.')
      return
    }

    console.log('✅ Técnicos encontrados:', technicians.map(t => t.name))

    // 3. Verificar que existen clientes
    const clients = await prisma.client.findMany({
      take: 10
    })

    if (clients.length === 0) {
      console.log('❌ No se encontraron clientes. Ejecuta primero el script de clientes.')
      return
    }

    console.log('✅ Clientes encontrados:', clients.length)

    // 4. Crear trabajos de muestra para diferentes empresas y fechas
    const sampleJobs = []

    // Trabajos para Amestica
    for (let i = 0; i < 15; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)]
      const technician = technicians[Math.floor(Math.random() * technicians.length)]
      const amesticaService = services.find(s => s.name === 'Amestica')
      
      if (client && technician && amesticaService) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)) // Últimos 30 días
        
        sampleJobs.push({
          title: `Diagnóstico Amestica ${i + 1}`,
          description: `Diagnóstico de redes de agua para ${client.name}`,
          status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
          priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
          scheduledAt: date,
          clientId: client.id,
          serviceId: amesticaService.id,
          technicianId: technician.id,
          createdById: technician.id,
          createdAt: date
        })
      }
    }

    // Trabajos para Multifugas
    for (let i = 0; i < 12; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)]
      const technician = technicians[Math.floor(Math.random() * technicians.length)]
      const multifugasService = services.find(s => s.name === 'Multifugas')
      
      if (client && technician && multifugasService) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
        
        sampleJobs.push({
          title: `Detección Multifugas ${i + 1}`,
          description: `Detección de fugas con tecnología especializada para ${client.name}`,
          status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
          priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
          scheduledAt: date,
          clientId: client.id,
          serviceId: multifugasService.id,
          technicianId: technician.id,
          createdById: technician.id,
          createdAt: date
        })
      }
    }

    // Trabajos para Servifugas
    for (let i = 0; i < 8; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)]
      const technician = technicians[Math.floor(Math.random() * technicians.length)]
      const servifugasService = services.find(s => s.name === 'Servifugas')
      
      if (client && technician && servifugasService) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
        
        sampleJobs.push({
          title: `Revisión Servifugas ${i + 1}`,
          description: `Revisión de fugas domiciliarias para ${client.name}`,
          status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
          priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
          scheduledAt: date,
          clientId: client.id,
          serviceId: servifugasService.id,
          technicianId: technician.id,
          createdById: technician.id,
          createdAt: date
        })
      }
    }

    console.log(`📋 Creando ${sampleJobs.length} trabajos de muestra...`)

    // 5. Insertar los trabajos
    for (const jobData of sampleJobs) {
      await prisma.job.create({
        data: jobData
      })
    }

    console.log('\n✅ Datos de muestra agregados exitosamente!')
    console.log('\n📊 Ahora puedes probar los reportes:')
    console.log('   - Ve a http://localhost:3001/dashboard/reports')
    console.log('   - Prueba los filtros por empresa (Améstica, Multifugas, Servifugas)')
    console.log('   - Prueba los filtros por fecha y técnico')
    console.log('   - Exporta reportes en PDF')

  } catch (error) {
    console.error('❌ Error agregando datos de muestra:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleReportsData()
