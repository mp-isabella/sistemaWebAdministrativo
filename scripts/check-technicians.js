const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTechnicians() {
  try {
    console.log('🔍 Verificando técnicos disponibles...\n')

    // 1. Verificar roles disponibles
    console.log('1️⃣ Roles disponibles:')
    const roles = await prisma.role.findMany()
    roles.forEach(role => {
      console.log(`   - ${role.name} (ID: ${role.id})`)
    })

    // 2. Verificar usuarios técnicos
    console.log('\n2️⃣ Usuarios con rol TECNICO:')
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        },
        isActive: true
      },
      include: {
        role: true
      }
    })

    if (technicians.length === 0) {
      console.log('   ❌ No hay técnicos con rol "TECNICO"')
      
      // Verificar con "tecnico" (minúsculas)
      console.log('\n3️⃣ Verificando con rol "tecnico" (minúsculas):')
      const techniciansLower = await prisma.user.findMany({
        where: {
          role: {
            name: 'tecnico'
          },
          isActive: true
        },
        include: {
          role: true
        }
      })

      if (techniciansLower.length === 0) {
        console.log('   ❌ No hay técnicos con rol "tecnico"')
      } else {
        console.log(`   ✅ Encontrados ${techniciansLower.length} técnicos:`)
        techniciansLower.forEach(tech => {
          console.log(`      - ${tech.name} (${tech.email}) - Rol: ${tech.role.name}`)
        })
      }
    } else {
      console.log(`   ✅ Encontrados ${technicians.length} técnicos:`)
      technicians.forEach(tech => {
        console.log(`      - ${tech.name} (${tech.email}) - Rol: ${tech.role.name}`)
      })
    }

    // 4. Verificar todos los usuarios activos
    console.log('\n4️⃣ Todos los usuarios activos:')
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true
      },
      include: {
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role?.name || 'Sin rol'} - Activo: ${user.isActive}`)
    })

    // 5. Verificar la API de workers
    console.log('\n5️⃣ Simulando llamada a la API de workers:')
    try {
      const response = await fetch('http://localhost:3000/api/workers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('   ✅ API responde correctamente')
        console.log(`   📊 Técnicos en API: ${data.workers?.filter(w => w.role?.name === 'TECNICO' || w.role?.name === 'tecnico').length || 0}`)
        
        const apiTechnicians = data.workers?.filter(w => w.role?.name === 'TECNICO' || w.role?.name === 'tecnico') || []
        apiTechnicians.forEach(tech => {
          console.log(`      - ${tech.name} (${tech.email}) - Rol: ${tech.role.name}`)
        })
      } else {
        console.log(`   ❌ API responde con error: ${response.status}`)
        const errorData = await response.json()
        console.log(`   📝 Error: ${errorData.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error al llamar API: ${error.message}`)
    }

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTechnicians()
