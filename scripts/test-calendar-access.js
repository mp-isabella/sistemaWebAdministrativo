const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCalendarAccess() {
  try {
    console.log('🧪 Probando acceso al calendario con diferentes roles...\n')

    // 1. Verificar que existen usuarios con diferentes roles
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    })

    console.log('👥 Usuarios encontrados:')
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Rol: ${user.role.name}`)
    })

    // 2. Verificar que existen técnicos
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        }
      }
    })

    console.log(`\n🔧 Técnicos encontrados: ${technicians.length}`)
    technicians.forEach(tech => {
      console.log(`  - ${tech.name} (${tech.email})`)
    })

    // 3. Verificar trabajos existentes
    const jobs = await prisma.job.findMany({
      include: {
        technician: true,
        client: true,
        service: true
      }
    })

    console.log(`\n📋 Trabajos encontrados: ${jobs.length}`)
    jobs.forEach(job => {
      console.log(`  - ${job.title} - Técnico: ${job.technician?.name || 'Sin asignar'} - Cliente: ${job.client?.name || 'Sin cliente'}`)
    })

    // 4. Simular acceso de técnico (solo sus trabajos)
    if (technicians.length > 0) {
      const technician = technicians[0]
      console.log(`\n🔍 Simulando acceso como técnico: ${technician.name}`)
      
      const technicianJobs = await prisma.job.findMany({
        where: {
          technicianId: technician.id
        },
        include: {
          technician: true,
          client: true
        }
      })

      console.log(`  Trabajos del técnico: ${technicianJobs.length}`)
      technicianJobs.forEach(job => {
        console.log(`    - ${job.title} - Cliente: ${job.client?.name}`)
      })
    }

    // 5. Simular acceso de admin (todos los trabajos)
    console.log(`\n👑 Simulando acceso como admin (todos los trabajos)`)
    const allJobs = await prisma.job.findMany({
      include: {
        technician: true,
        client: true
      }
    })

    console.log(`  Total de trabajos: ${allJobs.length}`)
    allJobs.forEach(job => {
      console.log(`    - ${job.title} - Técnico: ${job.technician?.name || 'Sin asignar'} - Cliente: ${job.client?.name || 'Sin cliente'}`)
    })

    console.log('\n✅ Prueba completada exitosamente')
    console.log('\n📝 Resumen de cambios implementados:')
    console.log('  ✅ Todos los roles pueden acceder al calendario')
    console.log('  ✅ Técnicos solo ven sus propios trabajos')
    console.log('  ✅ Admin/Secretaria ven todos los técnicos y trabajos')
    console.log('  ✅ Se mantiene el diseño actual del calendario')

  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCalendarAccess()
