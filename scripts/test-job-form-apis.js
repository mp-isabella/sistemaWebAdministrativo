const fetch = require('node-fetch');

async function testAPIs() {
  console.log('🧪 Probando APIs del formulario de trabajos...\n');

  try {
    // Test 1: Clientes
    console.log('1️⃣ Probando API de clientes...');
    const clientsResponse = await fetch('http://localhost:3000/api/clients');
    const clientsData = await clientsResponse.json();
    console.log(`✅ Clientes: ${clientsData.length} encontrados`);
    if (clientsData.length > 0) {
      console.log(`   📋 Primer cliente: ${clientsData[0].name}`);
    }

    // Test 2: Servicios
    console.log('\n2️⃣ Probando API de servicios...');
    const servicesResponse = await fetch('http://localhost:3000/api/services');
    const servicesData = await servicesResponse.json();
    console.log(`✅ Servicios: ${servicesData.length} encontrados`);
    if (servicesData.length > 0) {
      console.log(`   🔧 Primer servicio: ${servicesData[0].name} - $${servicesData[0].price}`);
    }

    // Test 3: Técnicos
    console.log('\n3️⃣ Probando API de técnicos...');
    const techniciansResponse = await fetch('http://localhost:3000/api/workers');
    const techniciansData = await techniciansResponse.json();
    const activeTechnicians = techniciansData.workers?.filter(w => w.isActive && w.role?.name === 'TECNICO') || [];
    console.log(`✅ Técnicos: ${activeTechnicians.length} encontrados`);
    if (activeTechnicians.length > 0) {
      console.log(`   👨‍🔧 Primer técnico: ${activeTechnicians[0].name}`);
    }

    console.log('\n🎉 Todas las APIs están funcionando correctamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Clientes: ${clientsData.length}`);
    console.log(`   • Servicios: ${servicesData.length}`);
    console.log(`   • Técnicos: ${activeTechnicians.length}`);

  } catch (error) {
    console.error('❌ Error probando APIs:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

testAPIs();
