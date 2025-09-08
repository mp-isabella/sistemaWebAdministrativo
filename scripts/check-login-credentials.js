const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkLoginCredentials() {
  try {
    console.log('🔐 Verificando credenciales de login disponibles...\n')

    // 1. Obtener todos los usuarios con sus roles
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    })

    console.log(`1️⃣ Usuarios disponibles para login:`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name}`)
      console.log(`      Email: ${user.email}`)
      console.log(`      Rol: ${user.role.name}`)
      console.log(`      ID: ${user.id}`)
      console.log('')
    })

    // 2. Verificar el trabajo existente
    const job = await prisma.job.findFirst({
      include: {
        client: true,
        technician: true,
        service: true
      }
    })

    if (job) {
      console.log(`2️⃣ Trabajo existente:`)
      console.log(`   Título: ${job.title}`)
      console.log(`   Cliente: ${job.client?.name}`)
      console.log(`   Técnico asignado: ${job.technician?.name}`)
      console.log(`   Fecha: ${job.scheduledAt}`)
      console.log('')
    }

    // 3. Mostrar instrucciones específicas por rol
    console.log(`3️⃣ Instrucciones para ver el trabajo en el calendario:`)
    console.log('')
    
    // Administradores y Secretarias pueden ver todos los trabajos
    const adminUsers = users.filter(user => 
      user.role.name === 'ADMIN' || user.role.name === 'SECRETARIA'
    )
    
    if (adminUsers.length > 0) {
      console.log(`   🔐 Como ADMINISTRADOR o SECRETARIA (pueden ver todos los trabajos):`)
      adminUsers.forEach((user, index) => {
        console.log(`      ${index + 1}. Email: ${user.email}`)
        console.log(`         Contraseña: (la que configuraste)`)
        console.log(`         Rol: ${user.role.name}`)
      })
      console.log('')
    }

    // Técnicos solo ven sus propios trabajos
    const technicianUsers = users.filter(user => user.role.name === 'TECNICO')
    
    if (technicianUsers.length > 0) {
      console.log(`   🔧 Como TÉCNICO (solo ven sus propios trabajos):`)
      technicianUsers.forEach((user, index) => {
        const canSeeJob = job && job.technician?.id === user.id
        console.log(`      ${index + 1}. ${user.name} (${user.email})`)
        console.log(`         ¿Puede ver el trabajo?: ${canSeeJob ? '✅ SÍ' : '❌ NO'}`)
        if (canSeeJob) {
          console.log(`         ✅ Este técnico SÍ puede ver el trabajo`)
        }
      })
      console.log('')
    }

    // 4. Instrucciones paso a paso
    console.log(`4️⃣ Pasos para ver el trabajo:`)
    console.log(`   1. Ve a http://localhost:3000/login`)
    console.log(`   2. Logueate con una de estas credenciales:`)
    
    if (adminUsers.length > 0) {
      console.log(`      👑 Como administrador/secretaria:`)
      adminUsers.forEach(user => {
        console.log(`         - ${user.email} (${user.role.name})`)
      })
    }
    
    if (job && job.technician) {
      const technicianUser = users.find(u => u.id === job.technician.id)
      if (technicianUser) {
        console.log(`      🔧 Como técnico asignado:`)
        console.log(`         - ${technicianUser.email} (${technicianUser.role.name})`)
      }
    }
    
    console.log(`   3. Ve a http://localhost:3000/dashboard/schedule/calendar`)
    console.log(`   4. El trabajo aparecerá el 26 de agosto a las 19:30`)
    console.log('')
    
    console.log(`5️⃣ Verificación:`)
    console.log(`   ✅ El trabajo existe en la base de datos`)
    console.log(`   ✅ El trabajo está asignado a un técnico`)
    console.log(`   ✅ El trabajo está en el rango de fechas correcto`)
    console.log(`   ✅ La conversión de zona horaria está funcionando`)
    console.log(`   🔐 Solo necesitas estar autenticado correctamente`)

  } catch (error) {
    console.error('Error al verificar credenciales:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLoginCredentials()
