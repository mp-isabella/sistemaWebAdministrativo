const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTechnicians() {
  console.log('🔍 VERIFICANDO TÉCNICOS EN LA BASE DE DATOS')
  console.log('')

  try {
    // 1. Verificar todos los usuarios
    console.log('1. 📋 TODOS LOS USUARIOS:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`   Total usuarios: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Rol: ${user.role?.name} - Status: ${user.status}`)
    })
    console.log('')

    // 2. Verificar usuarios con rol técnico (minúsculas)
    console.log('2. 👨‍🔧 USUARIOS CON ROL "tecnico":')
    const techniciansLower = await prisma.user.findMany({
      where: {
        role: {
          name: "tecnico"
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })
    
    console.log(`   Técnicos encontrados: ${techniciansLower.length}`)
    techniciansLower.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.email}) - Status: ${tech.status}`)
    })
    console.log('')

    // 3. Verificar usuarios con rol técnico (mayúsculas)
    console.log('3. 👨‍🔧 USUARIOS CON ROL "TECNICO":')
    const techniciansUpper = await prisma.user.findMany({
      where: {
        role: {
          name: "TECNICO"
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })
    
    console.log(`   Técnicos encontrados: ${techniciansUpper.length}`)
    techniciansUpper.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.email}) - Status: ${tech.status}`)
    })
    console.log('')

    // 4. Verificar usuarios activos
    console.log('4. ✅ USUARIOS ACTIVOS:')
    const activeUsers = await prisma.user.findMany({
      where: {
        status: "active"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`   Usuarios activos: ${activeUsers.length}`)
    activeUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Rol: ${user.role?.name}`)
    })
    console.log('')

    // 5. Verificar roles disponibles
    console.log('5. 🏷️ ROLES DISPONIBLES:')
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true
      }
    })
    
    console.log(`   Roles totales: ${roles.length}`)
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (ID: ${role.id})`)
    })
    console.log('')

    // 6. Verificar técnicos activos
    console.log('6. 🔧 TÉCNICOS ACTIVOS:')
    const activeTechnicians = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ["tecnico", "TECNICO"]
          }
        },
        status: "active"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`   Técnicos activos: ${activeTechnicians.length}`)
    activeTechnicians.forEach((tech, index) => {
      console.log(`   ${index + 1}. ${tech.name} (${tech.email}) - Rol: ${tech.role.name}`)
    })
    console.log('')

    // 7. Resumen
    console.log('📊 RESUMEN:')
    console.log(`   - Total usuarios: ${allUsers.length}`)
    console.log(`   - Usuarios activos: ${activeUsers.length}`)
    console.log(`   - Técnicos (minúsculas): ${techniciansLower.length}`)
    console.log(`   - Técnicos (mayúsculas): ${techniciansUpper.length}`)
    console.log(`   - Técnicos activos: ${activeTechnicians.length}`)
    console.log(`   - Roles disponibles: ${roles.length}`)
    console.log('')

    if (activeTechnicians.length === 0) {
      console.log('⚠️  PROBLEMA DETECTADO:')
      console.log('   No hay técnicos activos en la base de datos')
      console.log('')
      console.log('🔧 SOLUCIONES:')
      console.log('   1. Crear usuarios con rol "tecnico" o "TECNICO"')
      console.log('   2. Asegurar que los usuarios tengan status "active"')
      console.log('   3. Verificar que el rol "tecnico" exista en la tabla roles')
      console.log('')
    } else {
      console.log('✅ TÉCNICOS ENCONTRADOS:')
      console.log('   El calendario debería funcionar correctamente')
      console.log('')
    }

  } catch (error) {
    console.log('💥 ERROR AL VERIFICAR LA BASE DE DATOS:')
    console.log('   - Mensaje:', error.message)
    console.log('   - Tipo:', error.name)
    console.log('')
    console.log('🔧 POSIBLES SOLUCIONES:')
    console.log('   1. Verificar que la base de datos esté corriendo')
    console.log('   2. Verificar la conexión a la base de datos')
    console.log('   3. Ejecutar migraciones: npx prisma migrate dev')
    console.log('   4. Generar cliente: npx prisma generate')
    console.log('')
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la verificación
checkTechnicians().catch(console.error);
