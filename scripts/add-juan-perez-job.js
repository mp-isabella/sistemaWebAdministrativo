const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addJuanPerezJob() {
  try {
    console.log('🔧 Agregando trabajo de Juan Pérez a la base de datos...\n')

    // 1. Verificar si ya existe el trabajo
    const existingJob = await prisma.job.findFirst({
      where: {
        title: {
          contains: 'Juan Pérez'
        }
      }
    })

    if (existingJob) {
      console.log('⚠️  El trabajo de Juan Pérez ya existe en la base de datos')
      console.log(`   ID: ${existingJob.id}`)
      console.log(`   Título: ${existingJob.title}`)
      console.log(`   Fecha: ${existingJob.scheduledAt}`)
      return
    }

    // 2. Obtener o crear el cliente Juan Pérez
    let client = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Juan Pérez'
        }
      }
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+56912345678',
          address: 'Santiago, Región Metropolitana',
          type: 'INDIVIDUAL'
        }
      })
      console.log('✅ Cliente Juan Pérez creado')
    } else {
      console.log('✅ Cliente Juan Pérez encontrado')
    }

    // 3. Obtener o crear el servicio Multifugas
    let service = await prisma.service.findFirst({
      where: {
        name: {
          contains: 'Multifugas'
        }
      }
    })

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: 'Multifugas',
          description: 'Servicio de multifugas',
          price: 50000
        }
      })
      console.log('✅ Servicio Multifugas creado')
    } else {
      console.log('✅ Servicio Multifugas encontrado')
    }

    // 4. Obtener el técnico Ana Torres
    const technician = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Ana'
        }
      }
    })

    if (!technician) {
      console.log('❌ No se encontró el técnico Ana Torres')
      console.log('   Creando trabajo sin técnico asignado...')
    } else {
      console.log('✅ Técnico Ana Torres encontrado')
    }

    // 5. Obtener un usuario administrador para crear el trabajo
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          name: 'ADMIN'
        }
      }
    })

    if (!adminUser) {
      console.log('❌ No se encontró un usuario administrador')
      return
    }

    // 6. Crear el trabajo de Juan Pérez
    const job = await prisma.job.create({
      data: {
        title: 'Trabajo de Multifugas - Juan Pérez',
        description: 'Trabajo de multifugas programado para Juan Pérez',
        status: 'PENDING',
        priority: 'MEDIUM',
        scheduledAt: new Date('2025-08-26T20:00:00'),
        clientId: client.id,
        serviceId: service.id,
        technicianId: technician?.id || null,
        createdById: adminUser.id
      }
    })

    console.log('✅ Trabajo de Juan Pérez creado exitosamente')
    console.log(`   ID: ${job.id}`)
    console.log(`   Título: ${job.title}`)
    console.log(`   Cliente: ${client.name}`)
    console.log(`   Servicio: ${service.name}`)
    console.log(`   Técnico: ${technician?.name || 'Sin asignar'}`)
    console.log(`   Fecha: ${job.scheduledAt}`)
    console.log(`   Estado: ${job.status}`)

    // 6. Verificar que el trabajo se creó correctamente
    const createdJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        client: true,
        service: true,
        technician: true
      }
    })

    console.log('\n📋 Detalles del trabajo creado:')
    console.log(JSON.stringify(createdJob, null, 2))

  } catch (error) {
    console.error('❌ Error al agregar el trabajo de Juan Pérez:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addJuanPerezJob()
