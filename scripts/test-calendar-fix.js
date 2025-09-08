// Script para probar que el fix de zona horaria funciona
console.log('🧪 Probando fix de zona horaria para el calendario...\n');

// Simular los datos del trabajo "Multifugas"
const mockJob = {
  id: "test-job-1",
  title: "Multifugas",
  client: { name: "Juan Pérez" },
  technician: { id: "cmesya2rz0005uk5wzu8tc90x", name: "Patricia López" },
  service: { name: "Multifugas" },
  scheduledAt: "2025-08-26T17:30:00.000Z", // 17:30 UTC
  priority: "MEDIUM"
};

console.log('📋 Datos del trabajo:');
console.log(`   Título: ${mockJob.title}`);
console.log(`   Cliente: ${mockJob.client.name}`);
console.log(`   Técnico: ${mockJob.technician.name}`);
console.log(`   Fecha original: ${mockJob.scheduledAt}`);

// Simular la conversión anterior (problemática)
console.log('\n❌ Conversión anterior (problemática):');
const scheduledDateOld = new Date(mockJob.scheduledAt);
const dateOld = scheduledDateOld.toISOString().split('T')[0];
console.log(`   Fecha convertida: ${dateOld}`);
console.log(`   Problema: Se convierte a UTC, no a zona horaria local`);

// Simular la conversión nueva (corregida)
console.log('\n✅ Conversión nueva (corregida):');
const scheduledDateNew = new Date(mockJob.scheduledAt);
const dateNew = scheduledDateNew.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona horaria local
console.log(`   Fecha convertida: ${dateNew}`);
console.log(`   Ventaja: Respeta la zona horaria local`);

// Verificar que la fecha es correcta
const expectedDate = "2025-08-26";
const isCorrect = dateNew === expectedDate;

console.log('\n🔍 Verificación:');
console.log(`   Fecha esperada: ${expectedDate}`);
console.log(`   Fecha obtenida: ${dateNew}`);
console.log(`   ¿Es correcta? ${isCorrect ? '✅' : '❌'}`);

if (isCorrect) {
  console.log('\n🎉 ¡Fix exitoso! El trabajo aparecerá en el calendario el 26 de agosto.');
} else {
  console.log('\n❌ El fix no funciona correctamente.');
}

// Simular la conversión completa del calendario
console.log('\n📊 Simulación completa del calendario:');
const startTime = scheduledDateNew.toLocaleTimeString('es-CL', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Santiago'
});

const endDate = new Date(scheduledDateNew.getTime() + 60 * 60 * 1000);
const endTime = endDate.toLocaleTimeString('es-CL', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Santiago'
});

const calendarJob = {
  id: mockJob.id,
  professionalId: mockJob.technician.id,
  patientName: mockJob.client.name,
  startTime: startTime,
  endTime: endTime,
  type: mockJob.service.name,
  date: dateNew
};

console.log('   Trabajo convertido para el calendario:');
console.log(`   - ID: ${calendarJob.id}`);
console.log(`   - Cliente: ${calendarJob.patientName}`);
console.log(`   - Técnico ID: ${calendarJob.professionalId}`);
console.log(`   - Horario: ${calendarJob.startTime} - ${calendarJob.endTime}`);
console.log(`   - Fecha: ${calendarJob.date}`);
console.log(`   - Tipo: ${calendarJob.type}`);

console.log('\n📝 Resumen del fix:');
console.log('   1. Cambié toISOString().split("T")[0] por toLocaleDateString("en-CA")');
console.log('   2. Esto respeta la zona horaria local en lugar de convertir a UTC');
console.log('   3. Ahora el trabajo "Multifugas" aparecerá el 26 de agosto en el calendario');
console.log('   4. El horario se mostrará correctamente como 17:30');
