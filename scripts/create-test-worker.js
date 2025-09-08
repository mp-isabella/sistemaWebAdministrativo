const bcrypt = require('bcryptjs')

async function testCreateWorker() {
  try {
    console.log('🧪 Probando creación de trabajador...\n')

    // Datos de prueba
    const testWorker = {
      name: "Martin Test",
      email: "martin.test@amestica.cl",
      phone: "+56 9 1234 5678",
      password: "martin123",
      roleId: "e9e765ca-937a-4100-b21d-68b57f35c0e5" // ID del rol TECNICO
    }

    console.log('📝 Datos a enviar:')
    Object.entries(testWorker).forEach(([key, value]) => {
      if (key === 'password') {
        console.log(`  ${key}: [HASHED]`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    })

    // Simular hash de contraseña
    const hashedPassword = await bcrypt.hash(testWorker.password, 12)
    console.log(`\n🔐 Contraseña hasheada: ${hashedPassword.substring(0, 20)}...`)

    // Simular datos que se enviarían a la API
    const apiData = {
      ...testWorker,
      password: hashedPassword
    }

    console.log('\n📤 Datos que se enviarían a la API:')
    console.log(`  - name: ${apiData.name}`)
    console.log(`  - email: ${apiData.email}`)
    console.log(`  - phone: ${apiData.phone}`)
    console.log(`  - password: [HASHED]`)
    console.log(`  - roleId: ${apiData.roleId}`)

    console.log('\n✅ Simulación completada')
    console.log('\n📝 Para probar en el navegador:')
    console.log('  1. Ir a /dashboard/workers')
    console.log('  2. Hacer clic en "Nuevo Trabajador"')
    console.log('  3. Llenar el formulario con los datos de prueba')
    console.log('  4. Verificar que el selector de rol funcione')
    console.log('  5. Verificar que los botones cancelar y crear funcionen')

  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  }
}

testCreateWorker()
