// Script para probar el fix de hora en el formulario
console.log('🧪 Probando fix de hora en el formulario...\n');

// Simular los datos del formulario
const formData = {
  scheduledAt: new Date('2025-08-26'),
  startTime: '17:30',
  endTime: '18:30'
};

console.log('📋 Datos originales del formulario:');
console.log(`   Fecha: ${formData.scheduledAt.toLocaleDateString()}`);
console.log(`   Hora inicio: ${formData.startTime}`);
console.log(`   Hora fin: ${formData.endTime}`);

// Aplicar el fix que implementamos
function combineDateWithTime(date, timeString) {
  if (!date || !timeString) return null;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate.toISOString();
}

const combinedScheduledAt = combineDateWithTime(formData.scheduledAt, formData.startTime);

console.log('\n🔧 Aplicando fix de combinación de fecha y hora...');
console.log(`   scheduledAt combinado: ${combinedScheduledAt}`);

// Verificar que la hora es correcta
const parsedDate = new Date(combinedScheduledAt);
console.log(`   Fecha parseada: ${parsedDate.toLocaleString()}`);
console.log(`   Hora extraída: ${parsedDate.getHours()}:${parsedDate.getMinutes().toString().padStart(2, '0')}`);

// Verificar que coincide con la hora original
const [originalHours, originalMinutes] = formData.startTime.split(':').map(Number);
const hoursMatch = parsedDate.getHours() === originalHours;
const minutesMatch = parsedDate.getMinutes() === originalMinutes;

console.log('\n✅ Verificación:');
console.log(`   Hora original: ${originalHours}:${originalMinutes.toString().padStart(2, '0')}`);
console.log(`   Hora combinada: ${parsedDate.getHours()}:${parsedDate.getMinutes().toString().padStart(2, '0')}`);
console.log(`   ¿Coinciden las horas? ${hoursMatch ? '✅' : '❌'}`);
console.log(`   ¿Coinciden los minutos? ${minutesMatch ? '✅' : '❌'}`);

if (hoursMatch && minutesMatch) {
  console.log('\n🎉 ¡Fix exitoso! La hora se combina correctamente.');
} else {
  console.log('\n❌ Error en el fix. Las horas no coinciden.');
}

// Simular cómo se vería en la base de datos
console.log('\n📊 Simulación de guardado en base de datos:');
const jobData = {
  title: "Amestica",
  description: "Trabajo de prueba",
  clientId: "test-client",
  serviceId: "test-service",
  technicianId: "test-technician",
  scheduledAt: combinedScheduledAt,
  startTime: formData.startTime,
  endTime: formData.endTime,
  priority: "MEDIUM"
};

console.log('   Datos que se enviarían a la API:');
console.log(`   scheduledAt: ${jobData.scheduledAt}`);
console.log(`   startTime: ${jobData.startTime}`);
console.log(`   endTime: ${jobData.endTime}`);

// Simular cómo se mostraría en la interfaz
const displayDate = new Date(jobData.scheduledAt);
console.log('\n📱 Cómo se mostraría en la interfaz:');
console.log(`   Fecha completa: ${displayDate.toLocaleString()}`);
console.log(`   Solo fecha: ${displayDate.toLocaleDateString()}`);
console.log(`   Solo hora: ${displayDate.toLocaleTimeString()}`);

console.log('\n📝 Instrucciones para probar:');
console.log('   1. Crea un nuevo trabajo con hora específica (ej: 17:30)');
console.log('   2. Verifica que en la tarjeta del trabajo aparezca la hora correcta');
console.log('   3. Verifica que en el calendario aparezca en el horario correcto');
