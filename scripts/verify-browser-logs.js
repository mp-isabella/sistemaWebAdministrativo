#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔍 Verificando logs en el navegador...\n');

const timestamp = Date.now();
const url = `http://localhost:3000/dashboard/schedule?t=${timestamp}&debug=true&nocache=${Math.random()}`;

console.log('🌐 Abriendo navegador con URL de debug:');
console.log(url);
console.log('\n📋 Instrucciones para verificar:');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la pestaña "Console"');
console.log('3. Busca estos logs:');
console.log('   - "📋 Trabajos cargados desde la API"');
console.log('   - "🔄 Ordenando: [trabajo1] vs [trabajo2]"');
console.log('   - "📋 Orden final de trabajos filtrados"');
console.log('\n4. El orden debería ser:');
console.log('   1. Destape de alcantarillado (26-09 15:57) - MÁS RECIENTE');
console.log('   2. Video inspección de ductos (26-09 12:48)');
console.log('   3. Destape de alcantarillado (25-09 23:16)');
console.log('   4. Detección de fugas de agua (25-09 23:09) - MÁS ANTIGUO');
console.log('\n5. Si los logs no aparecen, presiona Ctrl+F5 para forzar recarga');

// Abrir navegador
exec(`start chrome --incognito "${url}"`, (error, stdout, stderr) => {
    if (error) {
        console.log('⚠️ No se pudo abrir Chrome, intentando con navegador por defecto...');
        exec(`start "${url}"`, (error2, stdout2, stderr2) => {
            if (error2) {
                console.log('❌ No se pudo abrir el navegador automáticamente');
                console.log('💡 Abre manualmente: ' + url);
            } else {
                console.log('✅ Navegador abierto');
            }
        });
    } else {
        console.log('✅ Chrome abierto en modo incógnito');
    }
});
