const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 SOLUCIÓN DEFINITIVA PARA LOGIN...');

try {
    // 1. Limpiar completamente todo
    console.log('🗑️ Limpiando completamente...');
    if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
    }
    if (fs.existsSync('node_modules/.cache')) {
        fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    }

    // 2. Configurar variables de entorno con clave única
    const envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="clave-unica-definitiva-2024-12345"
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
        'secret: process.env.NEXTAUTH_SECRET || "clave-unica-definitiva-2024-12345"'
    );

    fs.writeFileSync(authPath, authContent);
    console.log('✅ Archivo auth.ts actualizado');

    // 4. Crear limpiador de cookies super agresivo
    const clearCookiesContent = `<!DOCTYPE html>
<html>
<head>
    <title>Limpieza Definitiva - Amestica</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
            max-width: 600px; 
            margin: 0 auto;
        }
        .success { color: #28a745; font-weight: bold; font-size: 18px; }
        .warning { color: #ffc107; font-weight: bold; }
        h1 { color: #333; margin-bottom: 30px; }
        .step { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpieza Definitiva de Cookies</h1>
        <p id="status" class="warning">Iniciando limpieza completa...</p>
        <div id="steps"></div>
    </div>
    <script>
        function clearEverything() {
            const status = document.getElementById('status');
            const steps = document.getElementById('steps');
            
            // Paso 1: Limpiar todas las cookies
            steps.innerHTML += '<div class="step">✅ Limpiando cookies...</div>';
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Limpiar cookies específicas de NextAuth
            document.cookie = "next-auth.session-token=;expires=" + new Date().toUTCString() + ";path=/";
            document.cookie = "__Secure-next-auth.session-token=;expires=" + new Date().toUTCString() + ";path=/";
            document.cookie = "next-auth.csrf-token=;expires=" + new Date().toUTCString() + ";path=/";
            document.cookie = "__Host-next-auth.csrf-token=;expires=" + new Date().toUTCString() + ";path=/";
            
            setTimeout(() => {
                // Paso 2: Limpiar localStorage
                steps.innerHTML += '<div class="step">✅ Limpiando localStorage...</div>';
                localStorage.clear();
                
                setTimeout(() => {
                    // Paso 3: Limpiar sessionStorage
                    steps.innerHTML += '<div class="step">✅ Limpiando sessionStorage...</div>';
                    sessionStorage.clear();
                    
                    setTimeout(() => {
                        // Paso 4: Limpiar IndexedDB
                        steps.innerHTML += '<div class="step">✅ Limpiando IndexedDB...</div>';
                        if ('indexedDB' in window) {
                            indexedDB.databases().then(databases => {
                                databases.forEach(db => {
                                    indexedDB.deleteDatabase(db.name);
                                });
                            });
                        }
                        
                        setTimeout(() => {
                            // Paso 5: Limpiar caché
                            steps.innerHTML += '<div class="step">✅ Limpiando caché...</div>';
                            if ('caches' in window) {
                                caches.keys().then(names => {
                                    names.forEach(name => {
                                        caches.delete(name);
                                    });
                                });
                            }
                            
                            setTimeout(() => {
                                steps.innerHTML += '<div class="step">✅ Limpieza completada</div>';
                                status.innerHTML = '<span class="success">🎉 ¡Limpieza completada! Redirigiendo...</span>';
                                
                                setTimeout(() => {
                                    window.location.href = '/login';
                                }, 2000);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }
        
        // Ejecutar limpieza automáticamente
        clearEverything();
    </script>
</body>
</html>`;

    fs.writeFileSync('clear-cookies.html', clearCookiesContent);
    console.log('✅ Limpiador de cookies creado');

    console.log('');
    console.log('✅ CONFIGURACIÓN DEFINITIVA COMPLETADA');
    console.log('');
    console.log('🚨 INSTRUCCIONES CRÍTICAS:');
    console.log('1. 🚨 CIERRA COMPLETAMENTE EL NAVEGADOR');
    console.log('2. 🚨 ABRE UNA NUEVA VENTANA');
    console.log('3. 🌐 Ve a: http://localhost:3000/clear-cookies.html');
    console.log('4. ⏳ Espera a que termine la limpieza automática');
    console.log('5. 🔐 Ve a: http://localhost:3000/login');
    console.log('6. 📧 Usa: admin@amestica.cl / admin123');
    console.log('');
    console.log('🚀 Iniciando servidor...');

    // 5. Iniciar servidor
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.error('❌ Error:', error.message);
}
