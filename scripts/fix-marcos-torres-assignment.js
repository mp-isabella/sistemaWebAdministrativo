const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixMarcosTorresAssignment() {
  try {
    console.log('🔧 Verificando asignación del trabajo de Marcos Torres...\n')

    // 1. Buscar el trabajo de Marcos Torres
    const job = await prisma.job.findFirst({
      where: {
        title: {
          contains: 'Marcos Torres'
        }
      },
      include: {
        client: true,
        technician: true,
        service: true,
        company: true
      }
    })

    if (!job) {
      console.log('❌ No se encontró el trabajo de Marcos Torres')
      console.log('   Buscando trabajos similares...')
      
      // Buscar trabajos que contengan "Marcos" o "Torres"
      const similarJobs = await prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: 'Marcos' } },
            { title: { contains: 'Torres' } },
            { client: { name: { contains: 'Marcos' } } },
            { client: { name: { contains: 'Torres' } } }
          ]
        },
        include: {
          client: true,
          technician: true,
          service: true
        }
      })

      if (similarJobs.length > 0) {
        console.log('\n📋 Trabajos similares encontrados:')
        similarJobs.forEach((j, index) => {
          console.log(`   ${index + 1}. ${j.title}`)
          console.log(`      Cliente: ${j.client?.name}`)
          console.log(`      Técnico: ${j.technician?.name || 'Sin asignar'}`)
          console.log(`      Fecha: ${j.scheduledAt}`)
        })
      } else {
        console.log('❌ No se encontraron trabajos similares')
      }
      return
    }

    console.log(`1️⃣ Trabajo encontrado: ${job.title}`)
    console.log(`   Cliente: ${job.client?.name}`)
    console.log(`   Técnico actual: ${job.technician?.name || 'Sin asignar'}`)
    console.log(`   Técnico ID: ${job.technicianId || 'null'}`)
    console.log(`   Fecha: ${job.scheduledAt}`)
    console.log(`   Estado: ${job.status}`)

    // 2. Obtener todos los técnicos disponibles
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        },
        isActive: true
      }
    })

    console.log(`\n2️⃣ Técnicos disponibles:`)
    technicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.email}) - ID: ${tech.id}`)
    })

    // 3. Buscar específicamente a Marcos Torres
    const marcosTorres = technicians.find(tech => 
      tech.name.toLowerCase().includes('marcos') || 
      tech.name.toLowerCase().includes('torres')
    )

    if (marcosTorres) {
      console.log(`\n3️⃣ Técnico Marcos Torres encontrado: ${marcosTorres.name} (ID: ${marcosTorres.id})`)
      
      // 4. Verificar si el trabajo ya está asignado a Marcos Torres
      if (job.technicianId === marcosTorres.id) {
        console.log('✅ El trabajo ya está asignado correctamente a Marcos Torres')
      } else {
        console.log('⚠️ El trabajo NO está asignado a Marcos Torres')
        console.log(`   Asignando trabajo a ${marcosTorres.name}...`)
        
        // Asignar el trabajo a Marcos Torres
        await prisma.job.update({
          where: { id: job.id },
          data: { technicianId: marcosTorres.id }
        })
        
        console.log('✅ Trabajo asignado exitosamente a Marcos Torres')
      }
    } else {
      console.log('\n❌ No se encontró un técnico llamado Marcos Torres')
      console.log('   Técnicos disponibles:')
      technicians.forEach((tech, index) => {
        console.log(`   ${index + 1}. ${tech.name}`)
      })
      
      // 5. Si no hay Marcos Torres, asignar al primer técnico disponible
      if (technicians.length > 0) {
        const firstTechnician = technicians[0]
        console.log(`\n4️⃣ Asignando trabajo al primer técnico disponible: ${firstTechnician.name}`)
        
        await prisma.job.update({
          where: { id: job.id },
          data: { technicianId: firstTechnician.id }
        })
        
        console.log('✅ Trabajo asignado exitosamente')
      } else {
        console.log('\n❌ No hay técnicos disponibles para asignar el trabajo')
      }
    }

    // 6. Verificar el trabajo actualizado
    const updatedJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log('\n📋 Estado final del trabajo:')
    console.log(`   Título: ${updatedJob.title}`)
    console.log(`   Cliente: ${updatedJob.client?.name}`)
    console.log(`   Técnico: ${updatedJob.technician?.name || 'Sin asignar'}`)
    console.log(`   Técnico ID: ${updatedJob.technicianId || 'null'}`)
    console.log(`   Fecha: ${updatedJob.scheduledAt}`)
    console.log(`   Estado: ${updatedJob.status}`)

    // 7. Información para verificar en el calendario
    console.log('\n🔍 Para verificar en el calendario:')
    console.log('   1. Ve a /dashboard/schedule/calendar')
    console.log('   2. Busca el trabajo en la fecha:', updatedJob.scheduledAt)
    console.log('   3. Verifica que aparezca en la columna del técnico correcto')
    
    if (updatedJob.technician) {
      console.log(`   4. El trabajo debería aparecer en la columna de: ${updatedJob.technician.name}`)
    } else {
      console.log('   4. El trabajo debería aparecer en la columna "Técnico" (genérica)')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixMarcosTorresAssignment()
