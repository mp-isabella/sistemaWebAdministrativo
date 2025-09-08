// Script para probar la solución rápida del problema de asignación de técnicos
console.log('🚀 Probando solución rápida para asignación de técnicos...\n');

// Simular datos del trabajo
const job = {
  id: "test-job-123",
  date: "2025-08-28",
  startTime: "17:00",
  endTime: "19:00",
  startTimeDisplay: "17:00",
  endTimeDisplay: "19:00",
  technician: { id: "old-tech", name: "Juan Perez" }
};

// Simular datos del modal
const newDate = "2025-08-28"; // Misma fecha
const newStartTime = "17:00"; // Mismo horario
const newEndTime = "19:00"; // Mismo horario
const selectedTechnician = "new-tech-456";

console.log('📅 Datos originales del trabajo:');
console.log(`   Fecha: ${job.date}`);
console.log(`   Horario: ${job.startTime} - ${job.endTime}`);
console.log(`   Técnico: ${job.technician.name}`);

console.log('\n🔄 Datos del modal:');
console.log(`   Nueva fecha: ${newDate}`);
console.log(`   Nuevo horario: ${newStartTime} - ${newEndTime}`);
console.log(`   Nuevo técnico: ${selectedTechnician}`);

// Simular la lógica corregida
const updateData = {
  technicianId: selectedTechnician
};

// SOLO incluir fecha y horarios si el usuario los modificó EXPLÍCITAMENTE
if (newDate && newDate !== job.date) {
  updateData.scheduledAt = newDate;
  console.log('   ✅ Fecha modificada, se incluye en updateData');
} else {
  console.log('   ❌ Fecha no modificada, NO se incluye en updateData');
}

if (newStartTime && newStartTime !== job.startTime) {
  updateData.startTime = newStartTime;
  console.log('   ✅ Hora de inicio modificada, se incluye en updateData');
} else {
  console.log('   ❌ Hora de inicio no modificada, NO se incluye en updateData');
}

if (newEndTime && newEndTime !== job.endTime) {
  updateData.endTime = newEndTime;
  console.log('   ✅ Hora de fin modificada, se incluye en updateData');
} else {
  console.log('   ❌ Hora de fin no modificada, NO se incluye en updateData');
}

console.log('\n📋 Datos que se enviarán al servidor:');
console.log(JSON.stringify(updateData, null, 2));

// Simular respuesta del servidor
const result = {
  technician: { id: "new-tech-456", name: "Marta Duran" }
};

// Actualizar el trabajo en el modal
const updatedJob = {
  ...job,
  technician: result.technician,
  // MANTENER fecha y hora originales a menos que se hayan modificado explícitamente
  date: (newDate && newDate !== job.date) ? newDate : job.date,
  startTime: (newStartTime && newStartTime !== job.startTime) ? newStartTime : job.startTime,
  endTime: (newEndTime && newEndTime !== job.endTime) ? newEndTime : job.endTime,
  startTimeDisplay: (newStartTime && newStartTime !== job.startTime) ? newStartTime : job.startTimeDisplay,
  endTimeDisplay: (newEndTime && newEndTime !== job.endTime) ? newEndTime : job.endTimeDisplay
};

console.log('\n✅ Trabajo actualizado:');
console.log(`   Fecha: ${updatedJob.date}`);
console.log(`   Horario: ${updatedJob.startTime} - ${updatedJob.endTime}`);
console.log(`   Técnico: ${updatedJob.technician.name}`);

// Verificar que la fecha y hora se mantuvieron
const dateUnchanged = updatedJob.date === job.date;
const timeUnchanged = updatedJob.startTime === job.startTime && updatedJob.endTime === job.endTime;
const technicianChanged = updatedJob.technician.id !== job.technician.id;

console.log('\n🔍 Verificación:');
console.log(`   ✅ Fecha sin cambios: ${dateUnchanged ? 'SÍ' : 'NO'}`);
console.log(`   ✅ Horario sin cambios: ${timeUnchanged ? 'SÍ' : 'NO'}`);
console.log(`   ✅ Técnico cambiado: ${technicianChanged ? 'SÍ' : 'NO'}`);

if (dateUnchanged && timeUnchanged && technicianChanged) {
  console.log('\n🎉 ¡SOLUCIÓN EXITOSA!');
  console.log('   - Solo se cambió el técnico');
  console.log('   - Fecha y hora se mantuvieron originales');
} else {
  console.log('\n❌ PROBLEMA PERSISTE');
  if (!dateUnchanged) console.log('   - La fecha cambió cuando no debería');
  if (!timeUnchanged) console.log('   - El horario cambió cuando no debería');
  if (!technicianChanged) console.log('   - El técnico no cambió');
}
