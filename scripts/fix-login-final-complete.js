const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 SOLUCIÓN FINAL COMPLETA PARA LOGIN...');

try {
    // 1. Limpiar completamente el caché
    console.log('🗑️ Limpiando caché...');
    if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
    }

    // 2. Configurar variables de entorno con clave consistente
    const envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="clave-secreta-consistente-2024-final"
NEXT_PUBLIC_SUPABASE_URL="https://rwsqkirgxsxrpjepjhtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c3FraXJneHN4cnBqZXBqaHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDc3ODIsImV4cCI6MjA3NDMyMzc4Mn0.BTCet2Yk379nwLu48QG8ummaRY3d8aHE0AJROPbUAGY"`;

    fs.writeFileSync('.env', envContent);
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Variables de entorno configuradas');

    // 3. Actualizar auth.ts con la misma clave
    const authPath = path.join(__dirname, '..', 'lib', 'auth.ts');
    let authContent = fs.readFileSync(authPath, 'utf8');

    authContent = authContent.replace(
        /secret: process\.env\.NEXTAUTH_SECRET \|\| "[^"]*"/,
        'secret: process.env.NEXTAUTH_SECRET || "clave-secreta-consistente-2024-final"'
    );

    fs.writeFileSync(authPath, authContent);
    console.log('✅ Archivo auth.ts actualizado');

    // 4. Crear limpiador de cookies mejorado
    const clearCookiesContent = `<!DOCTYPE html>
<html>
<head>
    <title>Limpieza Completa - Amestica</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .success { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpieza Completa</h1>
        <p id="status">Limpiando cookies y datos...</p>
    </div>
    <script>
        function clearAll() {
            // Limpiar todas las cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Limpiar localStorage y sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpiar IndexedDB
            if ('indexedDB' in window) {
                indexedDB.databases().then(databases => {
                    databases.forEach(db => {
                        indexedDB.deleteDatabase(db.name);
                    });
                });
            }
            
            document.getElementById('status').innerHTML = '<span class="success">✅ Limpieza completada</span>';
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
        
        clearAll();
    </script>
</body>
</html>`;

    fs.writeFileSync('clear-cookies.html', clearCookiesContent);
    console.log('✅ Limpiador de cookies creado');

    console.log('');
    console.log('✅ CONFIGURACIÓN COMPLETADA');
    console.log('');
    console.log('📝 INSTRUCCIONES CRÍTICAS:');
    console.log('1. 🚨 CIERRA COMPLETAMENTE EL NAVEGADOR');
    console.log('2. 🚨 ABRE UNA NUEVA VENTANA');
    console.log('3. 🌐 Ve a: http://localhost:3000/clear-cookies.html');
    console.log('4. ⏳ Espera a que se redirija automáticamente');
    console.log('5. 🔐 Intenta hacer login con:');
    console.log('   - admin@amestica.cl / admin123');
    console.log('   - secretaria@amestica.cl / secretaria123');
    console.log('   - tecnico@amestica.cl / tecnico123');
    console.log('');
    console.log('🚀 Iniciando servidor...');

    // 5. Iniciar servidor
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.error('❌ Error:', error.message);
}
