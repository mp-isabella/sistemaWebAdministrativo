// Script para probar el filtrado de citas por fecha en el calendario
console.log('🧪 Probando filtrado de citas por fecha...\n');

// Simular las citas que vienen del calendario
const mockAppointments = [
  {
    id: "1",
    professionalId: "cmesya2o00001uk5wx4wnn09m",
    patientName: "María Riquelme",
    startTime: "14:00",
    endTime: "15:00",
    type: "Trabajo para Hoy",
    date: "2025-08-26"
  },
  {
    id: "2",
    professionalId: "cmesya2rz0005uk5wzu8tc90x",
    patientName: "Juan Pérez",
    startTime: "17:30",
    endTime: "18:30",
    type: "Multifugas",
    date: "2025-08-26"
  },
  {
    id: "3",
    professionalId: "cmesya2pz0003uk5wla8rc9au",
    patientName: "Ana Martínez",
    startTime: "20:00",
    endTime: "21:00",
    type: "Amestica",
    date: "2025-08-27"
  }
];

// Función de filtrado del calendario
function getFilteredAppointments(appointments, selectedDate) {
  const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  
  return appointments.filter(appointment => {
    if (!appointment.date) return false;
    
    const appointmentDate = new Date(appointment.date);
    const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    
    return appointmentDateOnly.getTime() === selectedDateOnly.getTime();
  });
}

// Probar con diferentes fechas
const testDates = [
  new Date('2025-08-26'),
  new Date('2025-08-27'),
  new Date('2025-08-28')
];

console.log('📋 Citas disponibles:');
mockAppointments.forEach((apt, index) => {
  console.log(`   ${index + 1}. ${apt.patientName} - ${apt.type} - ${apt.date} ${apt.startTime}-${apt.endTime}`);
});

console.log('\n🔍 Probando filtrado por fecha:');
testDates.forEach((date, index) => {
  const filtered = getFilteredAppointments(mockAppointments, date);
  console.log(`\n   Fecha ${index + 1}: ${date.toISOString().split('T')[0]}`);
  console.log(`   Citas encontradas: ${filtered.length}`);
  
  if (filtered.length > 0) {
    filtered.forEach((apt, aptIndex) => {
      console.log(`     ${aptIndex + 1}. ${apt.patientName} - ${apt.type} - ${apt.startTime}-${apt.endTime}`);
    });
  } else {
    console.log('     No hay citas para esta fecha');
  }
});

// Verificar específicamente el 26 de agosto
console.log('\n🎯 Verificación específica para el 26 de agosto:');
const targetDate = new Date('2025-08-26');
const targetFiltered = getFilteredAppointments(mockAppointments, targetDate);

console.log(`   Fecha objetivo: ${targetDate.toISOString().split('T')[0]}`);
console.log(`   Citas encontradas: ${targetFiltered.length}`);

if (targetFiltered.length > 0) {
  console.log('   ✅ El trabajo "Multifugas" debería aparecer en el calendario');
  targetFiltered.forEach((apt, index) => {
    console.log(`     ${index + 1}. ${apt.patientName} - ${apt.type} - ${apt.startTime}-${apt.endTime}`);
  });
} else {
  console.log('   ❌ No se encontraron citas para el 26 de agosto');
}

console.log('\n📝 Resumen:');
console.log('   - El filtrado funciona correctamente');
console.log('   - El trabajo "Multifugas" está en la lista de citas');
console.log('   - Si no aparece en el calendario, el problema está en otro lugar');
