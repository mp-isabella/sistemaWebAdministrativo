const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIONANDO PROBLEMAS DE LOGIN DEFINITIVAMENTE...');

try {
    // 1. Limpiar completamente el caché de Next.js
    console.log('🗑️ Limpiando caché de Next.js...');
    const nextCacheDir = path.join(__dirname, '..', '.next');
    if (fs.existsSync(nextCacheDir)) {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
    }

    // 2. Limpiar caché de Prisma
    console.log('🗑️ Limpiando caché de Prisma...');
    const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');
    if (fs.existsSync(prismaDir)) {
        fs.rmSync(prismaDir, { recursive: true, force: true });
    }

    // 3. Limpiar node_modules/.cache
    console.log('🗑️ Limpiando caché de node_modules...');
    const nodeCacheDir = path.join(__dirname, '..', 'node_modules', '.cache');
    if (fs.existsSync(nodeCacheDir)) {
        fs.rmSync(nodeCacheDir, { recursive: true, force: true });
    }

    // 4. Regenerar Prisma Client
    console.log('🔄 Regenerando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 5. Verificar base de datos
    console.log('🔍 Verificando base de datos...');
    execSync('node scripts/check-database.js', { stdio: 'inherit' });

    // 6. Crear archivo de limpieza de cookies mejorado
    console.log('📝 Creando limpiador de cookies mejorado...');
    const clearCookiesContent = `<!DOCTYPE html>
<html>
<head>
    <title>Limpiar Cookies - Amestica</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .success { color: #28a745; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpiando Cookies y Sesiones</h1>
        <p id="status">Limpiando cookies...</p>
        <div id="progress"></div>
    </div>
    <script>
        function clearAllData() {
            const status = document.getElementById('status');
            const progress = document.getElementById('progress');
            
            // Limpiar todas las cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Limpiar localStorage
            localStorage.clear();
            
            // Limpiar sessionStorage
            sessionStorage.clear();
            
            // Limpiar IndexedDB
            if ('indexedDB' in window) {
                indexedDB.databases().then(databases => {
                    databases.forEach(db => {
                        indexedDB.deleteDatabase(db.name);
                    });
                });
            }
            
            status.innerHTML = '<span class="success">✅ Cookies limpiadas correctamente</span>';
            progress.innerHTML = '<p>🔄 Redirigiendo al login...</p>';
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
        
        // Ejecutar limpieza automáticamente
        clearAllData();
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(__dirname, '..', 'clear-cookies.html'), clearCookiesContent);

    console.log('✅ Configuración completada');
    console.log('');
    console.log('📝 INSTRUCCIONES IMPORTANTES:');
    console.log('1. 🚨 CIERRA TODAS LAS PESTAÑAS DEL NAVEGADOR');
    console.log('2. 🚨 ABRE UNA NUEVA PESTAÑA EN MODO INCÓGNITO');
    console.log('3. 🌐 Ve a: http://localhost:3000/clear-cookies.html');
    console.log('4. 🔄 Espera a que se redirija automáticamente');
    console.log('5. 🔐 Intenta hacer login con:');
    console.log('   📧 Email: secretaria@amestica.cl');
    console.log('   🔑 Password: secretaria123');
    console.log('');
    console.log('🚀 Iniciando servidor...');
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}