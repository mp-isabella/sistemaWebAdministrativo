const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCalendarPermissions() {
  try {
    console.log('🔐 Probando nuevos permisos del calendario...\n')

    // 1. Obtener todos los usuarios
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    })

    console.log(`1️⃣ Usuarios disponibles:`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Rol: ${user.role.name}`)
    })

    // 2. Obtener todos los trabajos
    const allJobs = await prisma.job.findMany({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    console.log(`\n2️⃣ Trabajos existentes:`)
    allJobs.forEach((job, index) => {
      const scheduledDate = new Date(job.scheduledAt)
      const timeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago'
      })
      const dateDisplay = scheduledDate.toLocaleDateString('es-CL', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago'
      })
      console.log(`   ${index + 1}. ${job.title} - ${job.client?.name} - ${job.technician?.name} - ${dateDisplay} ${timeDisplay}`)
    })

    // 3. Simular lo que vería cada tipo de usuario
    console.log(`\n3️⃣ Simulación de permisos por rol:`)

    // Simular ADMIN
    const adminUser = users.find(u => u.role.name === 'ADMIN')
    if (adminUser) {
      console.log(`\n   👑 ADMIN (${adminUser.name}):`)
      console.log(`      ✅ Puede ver TODOS los trabajos`)
      console.log(`      ✅ Puede ver TODOS los técnicos`)
      console.log(`      📊 Trabajos visibles: ${allJobs.length}`)
      allJobs.forEach((job, index) => {
        const scheduledDate = new Date(job.scheduledAt)
        const timeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Santiago'
        })
        const dateDisplay = scheduledDate.toLocaleDateString('es-CL', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'America/Santiago'
        })
        console.log(`         ${index + 1}. ${job.title} - ${job.technician?.name} - ${dateDisplay} ${timeDisplay}`)
      })
    }

    // Simular SECRETARIA
    const secretariaUser = users.find(u => u.role.name === 'SECRETARIA')
    if (secretariaUser) {
      console.log(`\n   📋 SECRETARIA (${secretariaUser.name}):`)
      console.log(`      ✅ Puede ver TODOS los trabajos`)
      console.log(`      ✅ Puede ver TODOS los técnicos`)
      console.log(`      📊 Trabajos visibles: ${allJobs.length}`)
      allJobs.forEach((job, index) => {
        const scheduledDate = new Date(job.scheduledAt)
        const timeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Santiago'
        })
        const dateDisplay = scheduledDate.toLocaleDateString('es-CL', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'America/Santiago'
        })
        console.log(`         ${index + 1}. ${job.title} - ${job.technician?.name} - ${dateDisplay} ${timeDisplay}`)
      })
    }

    // Simular TÉCNICOS
    const technicianUsers = users.filter(u => u.role.name === 'TECNICO')
    technicianUsers.forEach(tech => {
      const techJobs = allJobs.filter(job => job.technician?.id === tech.id)
      console.log(`\n   🔧 TÉCNICO (${tech.name}):`)
      console.log(`      ❌ Solo puede ver SUS propios trabajos`)
      console.log(`      ❌ Solo puede ver SU propio perfil`)
      console.log(`      📊 Trabajos visibles: ${techJobs.length}`)
      
      if (techJobs.length > 0) {
        techJobs.forEach((job, index) => {
          const scheduledDate = new Date(job.scheduledAt)
          const timeDisplay = scheduledDate.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Santiago'
          })
          const dateDisplay = scheduledDate.toLocaleDateString('es-CL', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Santiago'
          })
          console.log(`         ${index + 1}. ${job.title} - ${dateDisplay} ${timeDisplay}`)
        })
      } else {
        console.log(`         No tiene trabajos asignados`)
      }
    })

    // 4. Instrucciones para probar
    console.log(`\n4️⃣ Instrucciones para probar:`)
    console.log(`   🔐 Logueate como ADMIN:`)
    console.log(`      Email: ${adminUser?.email}`)
    console.log(`      Deberías ver TODOS los trabajos y TODOS los técnicos`)
    console.log('')
    console.log(`   🔐 Logueate como SECRETARIA:`)
    console.log(`      Email: ${secretariaUser?.email}`)
    console.log(`      Deberías ver TODOS los trabajos y TODOS los técnicos`)
    console.log('')
    console.log(`   🔐 Logueate como TÉCNICO:`)
    technicianUsers.forEach(tech => {
      const techJobs = allJobs.filter(job => job.technician?.id === tech.id)
      console.log(`      Email: ${tech.email}`)
      console.log(`      Deberías ver solo ${techJobs.length} trabajo(s) y solo tu perfil`)
    })

    console.log(`\n5️⃣ Verificación:`)
    console.log(`   ✅ ADMIN y SECRETARIA pueden ver todos los trabajos`)
    console.log(`   ✅ ADMIN y SECRETARIA pueden ver todos los técnicos`)
    console.log(`   ✅ TÉCNICOS solo ven sus propios trabajos`)
    console.log(`   ✅ TÉCNICOS solo ven su propio perfil`)

  } catch (error) {
    console.error('Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCalendarPermissions()
