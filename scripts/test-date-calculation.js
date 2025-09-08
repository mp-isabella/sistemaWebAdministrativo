// Script para probar el cálculo de fechas
console.log('🧪 Probando cálculo de fechas...\n');

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD (zona horaria local)
function getTodayString() {
  const today = new Date();
  // Usar la zona horaria local de Chile
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función auxiliar para obtener la fecha local en formato YYYY-MM-DD (zona horaria local)
function getLocalDateString(dateString) {
  const date = new Date(dateString);
  // Usar la zona horaria local de Chile
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fecha actual
const today = new Date();
console.log('📅 Fecha actual del sistema:', today.toISOString());
console.log('🌍 Fecha en zona horaria Chile:', today.toLocaleString("es-CL", {timeZone: "America/Santiago"}));

// Fecha de hoy calculada
const todayString = getTodayString();
console.log('✅ Fecha de hoy (YYYY-MM-DD):', todayString);

// Probar con algunas fechas de ejemplo
const testDates = [
  '2025-08-28T10:00:00.000Z',
  '2025-08-27T15:30:00.000Z',
  '2025-08-29T09:00:00.000Z'
];

console.log('\n📋 Probando fechas de trabajos:');
testDates.forEach((dateString, index) => {
  const localDate = getLocalDateString(dateString);
  const isToday = localDate === todayString;
  
  console.log(`  ${index + 1}. ${dateString} → ${localDate} ${isToday ? '🎯 (HOY)' : ''}`);
});

console.log('\n✅ Prueba completada. El indicador "Hoy" debería aparecer en la fecha correcta.');
