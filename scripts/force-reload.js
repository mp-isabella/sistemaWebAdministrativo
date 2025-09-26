#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔄 Forzando recarga completa del sistema...\n');

// Función para abrir el navegador con parámetros de no-caché
function openBrowser() {
    const url = 'http://localhost:3000/dashboard/schedule';
    const timestamp = Date.now();
    const noCacheUrl = `${url}?t=${timestamp}&nocache=true&reload=${Math.random()}`;

    console.log('🌐 Abriendo navegador con URL sin caché:');
    console.log(noCacheUrl);

    // Comando para Windows
    exec(`start chrome --incognito "${noCacheUrl}"`, (error, stdout, stderr) => {
        if (error) {
            console.log('⚠️ No se pudo abrir Chrome, intentando con navegador por defecto...');
            exec(`start "${noCacheUrl}"`, (error2, stdout2, stderr2) => {
                if (error2) {
                    console.log('❌ No se pudo abrir el navegador automáticamente');
                    console.log('💡 Abre manualmente: ' + noCacheUrl);
                } else {
                    console.log('✅ Navegador abierto');
                }
            });
        } else {
            console.log('✅ Chrome abierto en modo incógnito');
        }
    });
}

// Función para limpiar caché del sistema
function clearSystemCache() {
    console.log('🧹 Limpiando caché del sistema...');

    // Limpiar caché de Node.js
    exec('npm cache clean --force', (error, stdout, stderr) => {
        if (error) {
            console.log('⚠️ No se pudo limpiar caché de npm');
        } else {
            console.log('✅ Caché de npm limpiado');
        }
    });
}

// Ejecutar limpieza y abrir navegador
clearSystemCache();
setTimeout(openBrowser, 2000);

console.log('\n📋 Instrucciones adicionales:');
console.log('1. Si el navegador no se abre automáticamente, copia esta URL:');
console.log(`   http://localhost:3000/dashboard/schedule?t=${Date.now()}&nocache=true`);
console.log('2. Abre las herramientas de desarrollador (F12)');
console.log('3. Ve a la pestaña "Console" para ver los logs de orden de trabajos');
console.log('4. Si aún no funciona, presiona Ctrl+Shift+R para forzar recarga');
