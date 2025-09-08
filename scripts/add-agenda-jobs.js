const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addAgendaJobs() {
  try {
    console.log('📝 Agregando los 2 trabajos de la agenda...\n')
    
    // Verificar que no haya trabajos existentes
    const existingJobs = await prisma.job.findMany()
    if (existingJobs.length > 0) {
      console.log('⚠️ Ya existen trabajos en la base de datos. Eliminando primero...')
      await prisma.job.deleteMany({})
      console.log('✅ Trabajos existentes eliminados')
    }
    
    // Obtener clientes, servicios y técnicos existentes
    const clients = await prisma.client.findMany()
    const services = await prisma.service.findMany()
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          equals: 'tecnico'
        }
      }
    })
    
    console.log('📊 Datos disponibles:')
    console.log(`- Clientes: ${clients.length}`)
    console.log(`- Servicios: ${services.length}`)
    console.log(`- Técnicos: ${technicians.length}`)
    
    if (clients.length === 0 || services.length === 0 || technicians.length === 0) {
      console.log('❌ Faltan datos básicos (clientes, servicios o técnicos)')
      return
    }
    
    // Buscar los datos necesarios
    const anaMartinez = clients.find(c => c.name.includes('Ana') && c.name.includes('Martínez'))
    const juanPerez = clients.find(c => c.name.includes('Juan') && c.name.includes('Pérez'))
    const servifugas = services.find(s => s.name.includes('Servifugas'))
    const multifugas = services.find(s => s.name.includes('Multifugas'))
    const patriciaLopez = technicians.find(t => t.name.includes('Patricia') && t.name.includes('López'))
    
    if (!anaMartinez || !juanPerez || !servifugas || !multifugas || !patriciaLopez) {
      console.log('❌ No se encontraron todos los datos necesarios:')
      console.log(`- Ana Martínez: ${!!anaMartinez}`)
      console.log(`- Juan Pérez: ${!!juanPerez}`)
      console.log(`- Servifugas: ${!!servifugas}`)
      console.log(`- Multifugas: ${!!multifugas}`)
      console.log(`- Patricia López: ${!!patriciaLopez}`)
      return
    }
    
    // Crear los 2 trabajos de la agenda
    const jobs = [
      {
            title: "Servifugas",
    description: "Trabajo de servifugas",
        scheduledAt: new Date('2025-08-26T19:00:00.000Z'), // 7:00 PM
        status: "PENDING",
        priority: "MEDIUM",
        clientId: anaMartinez.id,
        serviceId: servifugas.id,
        technicianId: patriciaLopez.id
      },
      {
        title: "Multifugas",
        description: "Trabajo de multifugas", 
        scheduledAt: new Date('2025-08-26T17:30:00.000Z'), // 5:30 PM
        status: "PENDING",
        priority: "MEDIUM",
        clientId: juanPerez.id,
        serviceId: multifugas.id,
        technicianId: patriciaLopez.id
      }
    ]
    
    console.log('📋 Agregando trabajos:')
    jobs.forEach((job, index) => {
      const client = job.clientId === anaMartinez.id ? 'Ana Martínez' : 'Juan Pérez'
      const service = job.serviceId === servifugas.id ? 'Servifugas' : 'Multifugas'
      const time = new Date(job.scheduledAt).toLocaleString('es-CL', { 
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      console.log(`${index + 1}. ${client} - ${service} - Patricia López - ${time}`)
    })
    
    // Insertar los trabajos
    for (const job of jobs) {
      await prisma.job.create({
        data: job
      })
    }
    
    console.log('\n✅ Trabajos agregados exitosamente')
    console.log('🎯 Ahora el calendario solo mostrará estos 2 trabajos')
    
    // Verificar los trabajos agregados
    const addedJobs = await prisma.job.findMany({
      include: {
        client: true,
        service: true,
        technician: true
      }
    })
    
    console.log('\n📋 Trabajos en la base de datos:')
    addedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.client?.name} - ${job.service?.name} - ${job.technician?.name} - ${new Date(job.scheduledAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)
    })
    
  } catch (error) {
    console.error('❌ Error agregando trabajos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addAgendaJobs()
