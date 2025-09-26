#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🚨 FORZANDO DEBUG - VERIFICACIÓN AGRESIVA 🚨\n');

const timestamp = Date.now();
const url = `http://localhost:3000/dashboard/schedule?t=${timestamp}&debug=true&nocache=${Math.random()}&force=${Math.random()}`;

console.log('🌐 URL de debug:');
console.log(url);
console.log('\n📋 INSTRUCCIONES CRÍTICAS:');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la pestaña "Console"');
console.log('3. Busca estos logs OBLIGATORIOS:');
console.log('   🚨🚨🚨 DEBUG FORZADO - TRABAJOS CARGADOS 🚨🚨🚨');
console.log('   🚨🔄 ORDENANDO: [trabajo1] vs [trabajo2]');
console.log('   🚨🚨🚨 ORDEN FINAL FORZADO 🚨🚨🚨');
console.log('\n4. Si NO ves estos logs, el problema es el caché del navegador');
console.log('\n5. SOLUCIÓN INMEDIATA:');
console.log('   - Presiona Ctrl + Shift + R (recarga forzada)');
console.log('   - O abre en modo incógnito');
console.log('   - O limpia el caché manualmente');

// Abrir navegador con parámetros de debug
exec(`start chrome --incognito --disable-web-security --disable-features=VizDisplayCompositor "${url}"`, (error, stdout, stderr) => {
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
        console.log('✅ Chrome abierto en modo incógnito con debug forzado');
    }
});

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('Los trabajos deberían aparecer en este orden:');
console.log('1. Destape de alcantarillado (26-09 15:57) - MÁS RECIENTE');
console.log('2. Video inspección de ductos (26-09 12:48)');
console.log('3. Destape de alcantarillado (25-09 23:16)');
console.log('4. Detección de fugas de agua (25-09 23:09) - MÁS ANTIGUO');
