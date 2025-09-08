// Script para probar el formato de 24 horas
console.log('🧪 Probando formato de 24 horas...\n');

// Simular diferentes horarios
const testTimes = [
  '2025-08-26T09:30:00.000Z', // 09:30
  '2025-08-26T14:15:00.000Z', // 14:15
  '2025-08-26T17:45:00.000Z', // 17:45
  '2025-08-26T22:00:00.000Z', // 22:00
  '2025-08-26T00:30:00.000Z'  // 00:30
];

console.log('📋 Probando diferentes horarios:');
testTimes.forEach((timeString, index) => {
  const date = new Date(timeString);
  
  // Formato anterior (12 horas)
  const oldFormat = date.toLocaleString("es-CL");
  
  // Formato nuevo (24 horas)
  const newFormat = date.toLocaleString("es-CL", { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  console.log(`   ${index + 1}. ${timeString}`);
  console.log(`      Formato 12h: ${oldFormat}`);
  console.log(`      Formato 24h: ${newFormat}`);
  console.log('');
});

// Simular un trabajo real (17:30 en Chile = 20:30 UTC)
const mockJob = {
  scheduledAt: '2025-08-26T20:30:00.000Z', // 17:30 en Chile
  title: 'Trabajo de Prueba',
  client: { name: 'Cliente Test' },
  service: { name: 'Servicio Test' },
  technician: { name: 'Técnico Test' }
};

console.log('📊 Simulando tarjeta de trabajo:');
console.log(`   Trabajo: ${mockJob.title}`);
console.log(`   Cliente: ${mockJob.client.name}`);
console.log(`   Servicio: ${mockJob.service.name}`);
console.log(`   Técnico: ${mockJob.technician.name}`);

// Formato anterior
const oldTimeDisplay = new Date(mockJob.scheduledAt).toLocaleString("es-CL");
console.log(`   Horario (12h): ${oldTimeDisplay}`);

// Formato nuevo
const newTimeDisplay = new Date(mockJob.scheduledAt).toLocaleString("es-CL", { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Santiago'
});
console.log(`   Horario (24h): ${newTimeDisplay}`);

console.log('\n✅ Verificación:');
console.log(`   Antes: ${oldTimeDisplay} (formato 12 horas)`);
console.log(`   Ahora: ${newTimeDisplay} (formato 24 horas)`);

if (newTimeDisplay.includes('17:30')) {
  console.log('🎉 ¡Formato de 24 horas funcionando correctamente!');
} else {
  console.log(`❌ Error en el formato de 24 horas. Esperado: 17:30, Obtenido: ${newTimeDisplay}`);
}

console.log('\n📝 Lugares donde se aplicó el cambio:');
console.log('   1. Tarjetas de trabajo en la agenda');
console.log('   2. Tarjetas de trabajo en "Mis Trabajos"');
console.log('   3. Popup del calendario en la agenda');
console.log('   4. Calendario principal (ya tenía formato 24h)');
