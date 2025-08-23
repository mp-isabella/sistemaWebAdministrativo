// Script para verificar el favicon sin Service Worker
console.log('🔍 Verificando favicon de Amestica...');

// Verificar si los archivos de favicon existen
const faviconFiles = [
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

faviconFiles.forEach(file => {
  fetch(file)
    .then(response => {
      if (response.ok) {
        console.log(`✅ ${file} - OK (${response.status})`);
      } else {
        console.log(`❌ ${file} - Error (${response.status})`);
      }
    })
    .catch(error => {
      console.log(`❌ ${file} - Error: ${error.message}`);
    });
});

// Verificar elementos del DOM
setTimeout(() => {
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
}, 1000);
