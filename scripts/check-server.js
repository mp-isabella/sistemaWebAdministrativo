const http = require('http');

function checkServer() {
  console.log('🔍 Verificando si el servidor está corriendo...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/jobs',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Servidor respondiendo en puerto 3000`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jobs = JSON.parse(data);
        console.log(`   Trabajos encontrados: ${jobs.length || 0}`);
        console.log('\n🎉 El servidor está funcionando correctamente!');
        console.log('💡 Ahora puedes verificar el calendario en: http://localhost:3000/dashboard/schedule/calendar');
      } catch (error) {
        console.log('   Respuesta recibida (no es JSON válido)');
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Error conectando al servidor:');
    console.log(`   ${error.message}`);
    console.log('\n💡 Para iniciar el servidor:');
    console.log('   1. Abre una nueva terminal');
    console.log('   2. Navega al directorio del proyecto');
    console.log('   3. Ejecuta: npm run dev');
  });

  req.end();
}

checkServer();
