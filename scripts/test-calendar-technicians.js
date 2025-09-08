const fetch = require('node-fetch');

async function testCalendarAPI() {
  console.log('🔍 PRUEBA DE API DEL CALENDARIO - TÉCNICOS')
  console.log('')

  try {
    // Simular una llamada a la API del calendario
    console.log('📡 Probando API del calendario...')
    
    const response = await fetch('http://localhost:3000/api/calendar/jobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📊 Estado de la respuesta:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Respuesta exitosa')
      console.log('📋 Datos recibidos:')
      console.log('  - Success:', data.success)
      console.log('  - Trabajos:', data.data?.length || 0)
      console.log('  - Técnicos:', data.technicians?.length || 0)
      console.log('  - Usuario:', data.user ? 'Sí' : 'No')
      
      if (data.technicians && data.technicians.length > 0) {
        console.log('👨‍🔧 Técnicos encontrados:')
        data.technicians.forEach((tech, index) => {
          console.log(`  ${index + 1}. ${tech.name} (${tech.email})`)
        })
      } else {
        console.log('⚠️  No se encontraron técnicos en la respuesta')
      }
      
      if (data.data && data.data.length > 0) {
        console.log('📅 Trabajos encontrados:')
        data.data.forEach((job, index) => {
          console.log(`  ${index + 1}. ${job.title} - ${job.technician?.name || 'Sin técnico'}`)
        })
      } else {
        console.log('⚠️  No se encontraron trabajos en la respuesta')
      }
      
    } else {
      console.log('❌ Error en la respuesta')
      const errorData = await response.text()
      console.log('📄 Error:', errorData)
    }

  } catch (error) {
    console.log('💥 Error al conectar con la API:')
    console.log('  - Mensaje:', error.message)
    console.log('  - Tipo:', error.name)
  }

  console.log('')
  console.log('🔧 SOLUCIONES POSIBLES:')
  console.log('')
  console.log('1. Verificar que el servidor esté corriendo:')
  console.log('   npm run dev')
  console.log('')
  console.log('2. Verificar la base de datos:')
  console.log('   - Hay usuarios con rol "tecnico"?')
  console.log('   - Los usuarios tienen status "active"?')
  console.log('')
  console.log('3. Verificar la estructura de la base de datos:')
  console.log('   - Tabla users existe?')
  console.log('   - Campo role.name existe?')
  console.log('   - Campo status existe?')
  console.log('')
  console.log('4. Verificar logs del servidor:')
  console.log('   - Buscar mensajes de error en la consola')
  console.log('   - Verificar logs de Prisma')
  console.log('')
  console.log('5. Probar consulta directa a la base de datos:')
  console.log('   - SELECT * FROM users WHERE role.name = "tecnico"')
  console.log('   - SELECT * FROM users WHERE status = "active"')
  console.log('')
}

// Ejecutar la prueba
testCalendarAPI().catch(console.error);
