// Script simple para verificar el favicon
console.log('🔍 Verificando favicon de Amestica...');

// Verificar elementos del DOM
const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
console.log(`📋 Encontrados ${faviconLinks.length} enlaces de favicon:`);

faviconLinks.forEach((link, index) => {
  console.log(`  ${index + 1}. ${link.rel} -> ${link.href}`);
});

const manifestLink = document.querySelector('link[rel="manifest"]');
if (manifestLink) {
  console.log(`📋 Manifest encontrado: ${manifestLink.href}`);
} else {
  console.log(`❌ Manifest no encontrado`);
}

// Verificar archivos
const files = ['/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png'];
files.forEach(file => {
  fetch(file)
    .then(response => {
      if (response.ok) {
        console.log(`✅ ${file} - OK`);
      } else {
        console.log(`❌ ${file} - Error ${response.status}`);
      }
    })
    .catch(error => {
      console.log(`❌ ${file} - Error: ${error.message}`);
    });
});

console.log('✅ Verificación completada');
