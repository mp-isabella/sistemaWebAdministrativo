// Script para limpiar caché del navegador y forzar recarga
console.log('🧹 Limpiando caché del navegador...\n');

console.log('📋 Instrucciones para limpiar el caché:');
console.log('');
console.log('1️⃣ **Hard Refresh (Recarga Forzada):**');
console.log('   - Windows: Ctrl + F5');
console.log('   - Mac: Cmd + Shift + R');
console.log('   - Linux: Ctrl + Shift + R');
console.log('');

console.log('2️⃣ **Limpiar Caché del Navegador:**');
console.log('   - Chrome: Ctrl + Shift + Delete');
console.log('   - Firefox: Ctrl + Shift + Delete');
console.log('   - Edge: Ctrl + Shift + Delete');
console.log('   - Safari: Cmd + Option + E');
console.log('');

console.log('3️⃣ **Limpiar LocalStorage:**');
console.log('   - Abrir herramientas de desarrollador (F12)');
console.log('   - Ir a la pestaña Console');
console.log('   - Ejecutar: localStorage.clear()');
console.log('   - Ejecutar: sessionStorage.clear()');
console.log('');

console.log('4️⃣ **Verificar la API directamente:**');
console.log('   - Abrir herramientas de desarrollador (F12)');
console.log('   - Ir a la pestaña Network');
console.log('   - Recargar la página');
console.log('   - Buscar la llamada a /api/calendar/jobs');
console.log('   - Verificar la respuesta de la API');
console.log('');

console.log('5️⃣ **Comandos para ejecutar en la consola del navegador:**');
console.log('   localStorage.clear();');
console.log('   sessionStorage.clear();');
console.log('   location.reload(true);');
console.log('');

console.log('🔍 **Para verificar si el problema persiste:**');
console.log('   1. Abrir herramientas de desarrollador (F12)');
console.log('   2. Ir a la pestaña Console');
console.log('   3. Buscar mensajes de error o logs');
console.log('   4. Verificar si aparece "31-12-1969" en algún lugar');
console.log('');

console.log('🎯 **Solución alternativa si el problema persiste:**');
console.log('   1. Abrir una ventana de incógnito/privada');
console.log('   2. Ir a http://localhost:3000/dashboard/schedule/calendar');
console.log('   3. Verificar si el problema persiste');
console.log('');

console.log('📞 **Si el problema persiste después de todo:**');
console.log('   - El problema puede estar en el componente del calendario');
console.log('   - Verificar si hay algún error en la consola del navegador');
console.log('   - Revisar si hay algún problema de zona horaria');
console.log('   - Verificar si hay algún problema con el formato de fecha');
