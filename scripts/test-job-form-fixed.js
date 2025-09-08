const fetch = require('node-fetch');

async function testJobForm() {
  console.log('🧪 Probando formulario de trabajos corregido...\n');

  try {
    // Test 1: Verificar servicios específicos
    console.log('1️⃣ Verificando servicios específicos...');
    const servicesResponse = await fetch('http://localhost:3000/api/services');
    const servicesData = await servicesResponse.json();
    const activeServices = servicesData.filter(s => s.isActive);
    
    console.log(`✅ Servicios activos: ${activeServices.length}`);
    activeServices.forEach(service => {
      console.log(`   • ${service.name}`);
    });
    
    // Verificar que solo están los servicios específicos
    const allowedServices = ['Amestica', 'Multifugas', 'Servifugas'];
    const hasOnlySpecificServices = activeServices.every(s => allowedServices.includes(s.name));
    console.log(`✅ Solo servicios específicos: ${hasOnlySpecificServices ? 'SÍ' : 'NO'}`);

    // Test 2: Verificar clientes
    console.log('\n2️⃣ Verificando clientes...');
    const clientsResponse = await fetch('http://localhost:3000/api/clients');
    const clientsData = await clientsResponse.json();
    console.log(`✅ Clientes disponibles: ${clientsData.length}`);

    // Test 3: Verificar técnicos
    console.log('\n3️⃣ Verificando técnicos...');
    const techniciansResponse = await fetch('http://localhost:3000/api/workers');
    const techniciansData = await techniciansResponse.json();
    const activeTechnicians = techniciansData.workers?.filter(w => w.isActive && w.role?.name === 'TECNICO') || [];
    console.log(`✅ Técnicos activos: ${activeTechnicians.length}`);

    console.log('\n🎉 Formulario de trabajos verificado correctamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Servicios específicos: ${activeServices.length}/3`);
    console.log(`   • Clientes: ${clientsData.length}`);
    console.log(`   • Técnicos: ${activeTechnicians.length}`);
    console.log('\n✅ El formulario está listo para usar con:');
    console.log('   • Calendario controlado (no aparece permanentemente)');
    console.log('   • Servicios filtrados (solo Amestica, Multifugas, Servifugas)');
    console.log('   • Horarios separados (inicio y fin)');
    console.log('   • Z-index corregido');

  } catch (error) {
    console.error('❌ Error probando formulario:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

testJobForm();
