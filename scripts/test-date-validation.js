// Script para probar la validación de fecha y hora
console.log('🧪 Probando validación de fecha y hora...\n');

// Función que simula la validación del formulario
function validateScheduledDateTime(scheduledAt, startTime = null) {
  const now = new Date();
  const scheduledDate = new Date(scheduledAt);
  
  console.log(`📅 Fecha actual: ${now.toLocaleString()}`);
  console.log(`📅 Fecha programada: ${scheduledDate.toLocaleString()}`);
  console.log(`⏰ Hora de inicio: ${startTime || 'No especificada'}`);
  
  // Si es la misma fecha, validar la hora
  if (scheduledDate.toDateString() === now.toDateString()) {
    console.log('📋 Misma fecha detectada, validando hora...');
    
    if (startTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      console.log(`⏰ Hora programada: ${startHour}:${startMinute.toString().padStart(2, '0')}`);
      console.log(`⏰ Hora actual: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
      
      // Si la hora de inicio es anterior a la hora actual
      if (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute)) {
        console.log('❌ ERROR: La hora programada no puede ser en el pasado');
        return false;
      } else {
        console.log('✅ Hora válida (en el futuro)');
        return true;
      }
    } else {
      console.log('⚠️ No hay hora especificada, validando solo fecha');
    }
  } else if (scheduledDate < now) {
    console.log('❌ ERROR: La fecha programada no puede ser en el pasado');
    return false;
  } else {
    console.log('✅ Fecha válida (en el futuro)');
    return true;
  }
  
  return true;
}

// Casos de prueba
console.log('🔍 Caso 1: Fecha futura (válida)');
validateScheduledDateTime('2025-08-27T14:00:00', '14:00');

console.log('\n🔍 Caso 2: Fecha pasada (inválida)');
validateScheduledDateTime('2025-08-25T14:00:00', '14:00');

console.log('\n🔍 Caso 3: Misma fecha, hora futura (válida)');
const today = new Date();
const futureTime = new Date(today);
futureTime.setHours(today.getHours() + 1, today.getMinutes(), 0, 0);
validateScheduledDateTime(futureTime.toISOString(), `${(today.getHours() + 1).toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`);

console.log('\n🔍 Caso 4: Misma fecha, hora pasada (inválida)');
const pastTime = new Date(today);
pastTime.setHours(today.getHours() - 1, today.getMinutes(), 0, 0);
validateScheduledDateTime(pastTime.toISOString(), `${(today.getHours() - 1).toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`);

console.log('\n🔍 Caso 5: Misma fecha, hora actual (inválida)');
validateScheduledDateTime(today.toISOString(), `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`);

console.log('\n✅ Pruebas completadas');
console.log('\n📝 Instrucciones para probar en el formulario:');
console.log('   1. Abre el formulario de trabajo');
console.log('   2. Selecciona la fecha de hoy');
console.log('   3. Prueba con diferentes horas:');
console.log('      - Hora futura (ej: 18:00 si son las 17:10) → Debería ser válido');
console.log('      - Hora pasada (ej: 16:00 si son las 17:10) → Debería mostrar error');
console.log('      - Hora actual → Debería mostrar error');
