const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testMultipleJobsSameTime() {
  try {
    console.log('🧪 Probando funcionalidad de múltiples trabajos en el mismo horario...\n')

    // 1. Obtener datos necesarios
    const technician = await prisma.user.findFirst({
      where: { role: { name: 'TECNICO' } }
    })

    const client = await prisma.client.findFirst()
    const service = await prisma.service.findFirst()
    const company = await prisma.company.findFirst()

    if (!technician || !client || !service || !company) {
      console.log('❌ No se encontraron todos los datos necesarios:')
      console.log(`- Técnico: ${!!technician}`)
      console.log(`- Cliente: ${!!client}`)
      console.log(`- Servicio: ${!!service}`)
      console.log(`- Empresa: ${!!company}`)
      return
    }

    // 2. Crear múltiples trabajos en el mismo horario (10:00 - 11:00)
    const sameTimeJobs = [
      {
        title: "Trabajo Múltiple 1",
        description: "Primer trabajo del horario 10:00-11:00",
        scheduledAt: new Date('2025-08-30T10:00:00.000Z'),
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "MEDIUM",
        clientId: client.id,
        serviceId: service.id,
        companyId: company.id,
        technicianId: technician.id,
        createdById: technician.id
      },
      {
        title: "Trabajo Múltiple 2",
        description: "Segundo trabajo del horario 10:00-11:00",
        scheduledAt: new Date('2025-08-30T10:00:00.000Z'),
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "HIGH",
        clientId: client.id,
        serviceId: service.id,
        companyId: company.id,
        technicianId: technician.id,
        createdById: technician.id
      },
      {
        title: "Trabajo Múltiple 3",
        description: "Tercer trabajo del horario 10:00-11:00",
        scheduledAt: new Date('2025-08-30T10:00:00.000Z'),
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "LOW",
        clientId: client.id,
        serviceId: service.id,
        companyId: company.id,
        technicianId: technician.id,
        createdById: technician.id
      },
      {
        title: "Trabajo Múltiple 4",
        description: "Cuarto trabajo del horario 10:00-11:00",
        scheduledAt: new Date('2025-08-30T10:00:00.000Z'),
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "MEDIUM",
        clientId: client.id,
        serviceId: service.id,
        companyId: company.id,
        technicianId: technician.id,
        createdById: technician.id
      },
      {
        title: "Trabajo Múltiple 5",
        description: "Quinto trabajo del horario 10:00-11:00",
        scheduledAt: new Date('2025-08-30T10:00:00.000Z'),
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "HIGH",
        clientId: client.id,
        serviceId: service.id,
        companyId: company.id,
        technicianId: technician.id,
        createdById: technician.id
      }
    ]

    console.log('📋 Creando 5 trabajos en el mismo horario (10:00-11:00)...')
    
    // Crear los trabajos
    for (const jobData of sameTimeJobs) {
      const job = await prisma.job.create({
        data: jobData,
        include: {
          client: true,
          service: true,
          technician: true,
          company: true
        }
      })
      
      console.log(`✅ Creado: ${job.title} - Cliente: ${job.client.name} - Prioridad: ${job.priority}`)
    }

    // 3. Verificar que se crearon correctamente
    const createdJobs = await prisma.job.findMany({
      where: {
        technicianId: technician.id,
        scheduledAt: {
          gte: new Date('2025-08-30T00:00:00.000Z'),
          lt: new Date('2025-08-31T00:00:00.000Z')
        },
        startTime: "10:00",
        endTime: "11:00"
      },
      include: {
        client: true,
        service: true
      }
    })

    console.log(`\n📊 Verificación: ${createdJobs.length} trabajos encontrados en el horario 10:00-11:00`)
    
    createdJobs.forEach((job, index) => {
      console.log(`  ${index + 1}. ${job.title} - ${job.client.name} - ${job.priority}`)
    })

    // 4. Probar crear un trabajo más (debería fallar por límite)
    console.log('\n🧪 Probando crear un sexto trabajo (debería fallar por límite)...')
    
    try {
      const extraJob = await prisma.job.create({
        data: {
          title: "Trabajo Múltiple 6 (EXTRA)",
          description: "Sexto trabajo del horario 10:00-11:00",
          scheduledAt: new Date('2025-08-30T10:00:00.000Z'),
          startTime: "10:00",
          endTime: "11:00",
          status: "PENDING",
          priority: "MEDIUM",
          clientId: client.id,
          serviceId: service.id,
          companyId: company.id,
          technicianId: technician.id,
          createdById: technician.id
        }
      })
      
      console.log('❌ ERROR: Se creó un trabajo extra cuando no debería')
    } catch (error) {
      console.log('✅ CORRECTO: No se pudo crear el trabajo extra (límite alcanzado)')
      console.log(`   Error: ${error.message}`)
    }

    console.log('\n🎉 Prueba completada exitosamente!')
    console.log('💡 Ahora puedes ver en el calendario cómo se muestran múltiples trabajos en el mismo horario')

  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMultipleJobsSameTime()
