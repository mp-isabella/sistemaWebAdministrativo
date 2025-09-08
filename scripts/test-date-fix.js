// Script para probar la corrección de fecha
console.log('🧪 Probando corrección de fecha...\n');

// Simular el problema original
const originalDate = new Date('2025-08-28T17:00:00.000Z');
console.log('📅 Fecha original:', originalDate.toLocaleString('es-CL'));
console.log('📅 Fecha ISO:', originalDate.toISOString());

// Método problemático (original)
const problematicDate = originalDate.toISOString().split('T')[0];
console.log('❌ Método problemático:', problematicDate);

// Método corregido
const correctedDate = originalDate.toLocaleDateString('en-CA');
console.log('✅ Método corregido:', correctedDate);

// Verificar que son diferentes
if (problematicDate !== correctedDate) {
  console.log('\n🎉 ¡La corrección funciona!');
  console.log('   - Método anterior:', problematicDate);
  console.log('   - Método corregido:', correctedDate);
} else {
  console.log('\n⚠️ Los métodos producen el mismo resultado');
}

// Probar con diferentes zonas horarias
console.log('\n🌍 Probando con diferentes zonas horarias:');
const testDate = new Date('2025-08-28T17:00:00.000Z');

console.log('   UTC:', testDate.toISOString().split('T')[0]);
console.log('   Local:', testDate.toLocaleDateString('en-CA'));
console.log('   Chile:', new Date(testDate.toLocaleString('en-US', { timeZone: 'America/Santiago' })).toLocaleDateString('en-CA'));
