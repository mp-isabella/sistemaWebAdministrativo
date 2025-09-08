const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testGenericTechnician() {
  try {
    console.log('🧪 Probando funcionalidad de columna "Técnico" genérica...\n')

    // 1. Crear trabajos sin técnico asignado
    console.log('1️⃣ Creando trabajos sin técnico asignado...')
    
    const jobsToCreate = [
      {
        title: "Mantenimiento Preventivo - Cliente A",
        description: "Mantenimiento preventivo de equipos",
        scheduledAt: new Date('2025-01-15T09:00:00Z'),
        startTime: "09:00",
        endTime: "11:00",
        status: "PENDING",
        priority: "MEDIUM"
      },
      {
        title: "Reparación Urgente - Cliente B", 
        description: "Reparación de fuga en sistema",
        scheduledAt: new Date('2025-01-15T10:00:00Z'),
        startTime: "10:00",
        endTime: "12:00",
        status: "PENDING",
        priority: "HIGH"
      },
      {
        title: "Instalación Nuevo Equipo - Cliente C",
        description: "Instalación de nuevo sistema",
        scheduledAt: new Date('2025-01-15T11:00:00Z'),
        startTime: "11:00",
        endTime: "13:00",
        status: "PENDING",
        priority: "MEDIUM"
      }
    ]

    // Obtener cliente, servicio y empresa existentes
    const client = await prisma.client.findFirst()
    const service = await prisma.service.findFirst()
    const company = await prisma.company.findFirst()

    if (!client || !service || !company) {
      console.log('❌ Necesitas tener al menos un cliente, servicio y empresa en la base de datos')
      return
    }

    const createdJobs = []
    for (const jobData of jobsToCreate) {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          clientId: client.id,
          serviceId: service.id,
          companyId: company.id,
          technicianId: null // Sin técnico asignado
        }
      })
      createdJobs.push(job)
      console.log(`   ✅ Creado: ${job.title}`)
    }

    // 2. Verificar que aparecen en la columna "Técnico" genérica
    console.log('\n2️⃣ Verificando trabajos en columna "Técnico" genérica...')
    
    const unassignedJobs = await prisma.job.findMany({
      where: {
        technicianId: null
      },
      include: {
        client: true,
        service: true,
        company: true
      }
    })

    console.log(`   📊 Trabajos sin asignar: ${unassignedJobs.length}`)
    unassignedJobs.forEach(job => {
      console.log(`   - ${job.title} (${job.startTime} - ${job.endTime})`)
    })

    // 3. Simular asignación de técnico
    console.log('\n3️⃣ Simulando asignación de técnico...')
    
    const technician = await prisma.user.findFirst({
      where: {
        role: {
          name: "TECNICO"
        },
        isActive: true
      }
    })

    if (technician && createdJobs.length > 0) {
      const jobToAssign = createdJobs[0]
      await prisma.job.update({
        where: { id: jobToAssign.id },
        data: { technicianId: technician.id }
      })
      console.log(`   ✅ Asignado "${jobToAssign.title}" a ${technician.name}`)
    }

    // 4. Verificar estado final
    console.log('\n4️⃣ Estado final:')
    
    const finalUnassignedJobs = await prisma.job.findMany({
      where: { technicianId: null }
    })
    
    const assignedJobs = await prisma.job.findMany({
      where: { 
        technicianId: { not: null }
      },
      include: {
        technician: true
      }
    })

    console.log(`   📊 Trabajos sin asignar: ${finalUnassignedJobs.length}`)
    console.log(`   📊 Trabajos asignados: ${assignedJobs.length}`)
    
    if (assignedJobs.length > 0) {
      console.log('   📋 Técnicos con trabajos asignados:')
      assignedJobs.forEach(job => {
        console.log(`   - ${job.technician.name}: ${job.title}`)
      })
    }

    console.log('\n🎯 Resultado esperado:')
    console.log('   ✅ Los trabajos sin técnico aparecen en la columna "Técnico" genérica')
    console.log('   ✅ Los trabajos se superponen en la columna genérica (no hay validación de conflictos)')
    console.log('   ✅ Los trabajos asignados aparecen en la columna del técnico específico')
    console.log('   ✅ Los trabajos asignados tienen validación de conflictos de horario')

    console.log('\n💡 Para ver los cambios:')
    console.log('   1. Ve a http://localhost:3000/dashboard/schedule/calendar')
    console.log('   2. Busca la columna "Técnico" (primera columna)')
    console.log('   3. Verifica que los trabajos sin asignar aparecen ahí')
    console.log('   4. Verifica que se pueden superponer sin problemas')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGenericTechnician()
