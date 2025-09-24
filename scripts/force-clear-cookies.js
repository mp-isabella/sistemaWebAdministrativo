const fs = require('fs');
const path = require('path');

console.log('🧹 FORZANDO LIMPIEZA COMPLETA DE COOKIES...');

// Crear un archivo HTML que fuerce la limpieza de todas las cookies
const forceClearContent = `<!DOCTYPE html>
<html>
<head>
    <title>Limpieza Forzada - Amestica</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
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
            animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .success { color: #28a745; font-weight: bold; font-size: 18px; }
        .warning { color: #ffc107; font-weight: bold; }
        .info { color: #17a2b8; font-weight: bold; }
        .step { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .progress { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); width: 0%; transition: width 0.3s ease; }
        h1 { color: #333; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏢 AMESTICA SERVICIOS PROFESIONALES</div>
        <h1>🧹 Limpieza Forzada de Cookies</h1>
        <p id="status" class="info">Iniciando limpieza completa...</p>
        <div class="progress">
            <div class="progress-bar" id="progressBar"></div>
        </div>
        <div id="steps"></div>
    </div>
    <script>
        let progress = 0;
        const steps = [
            'Limpiando cookies de sesión...',
            'Eliminando localStorage...',
            'Limpiando sessionStorage...',
            'Eliminando IndexedDB...',
            'Limpiando caché del navegador...',
            'Reiniciando configuración...',
            'Redirigiendo al login...'
        ];
        
        function updateProgress(step, message) {
            progress = ((step + 1) / steps.length) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('status').innerHTML = '<span class="info">' + message + '</span>';
            
            const stepsDiv = document.getElementById('steps');
            stepsDiv.innerHTML += '<div class="step">✅ ' + message + '</div>';
        }
        
        function clearAllData() {
            let step = 0;
            
            // Paso 1: Limpiar cookies
            updateProgress(step++, steps[0]);
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
                updateProgress(step++, steps[1]);
                localStorage.clear();
                
                setTimeout(() => {
                    // Paso 3: Limpiar sessionStorage
                    updateProgress(step++, steps[2]);
                    sessionStorage.clear();
                    
                    setTimeout(() => {
                        // Paso 4: Limpiar IndexedDB
                        updateProgress(step++, steps[3]);
                        if ('indexedDB' in window) {
                            indexedDB.databases().then(databases => {
                                databases.forEach(db => {
                                    indexedDB.deleteDatabase(db.name);
                                });
                            });
                        }
                        
                        setTimeout(() => {
                            // Paso 5: Limpiar caché
                            updateProgress(step++, steps[4]);
                            if ('caches' in window) {
                                caches.keys().then(names => {
                                    names.forEach(name => {
                                        caches.delete(name);
                                    });
                                });
                            }
                            
                            setTimeout(() => {
                                // Paso 6: Reiniciar
                                updateProgress(step++, steps[5]);
                                
                                setTimeout(() => {
                                    // Paso 7: Redirigir
                                    updateProgress(step++, steps[6]);
                                    
                                    setTimeout(() => {
                                        window.location.href = '/login';
                                    }, 1000);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }
        
        // Ejecutar limpieza automáticamente
        clearAllData();
    </script>
</body>
</html>`;

// Escribir el archivo
fs.writeFileSync(path.join(__dirname, '..', 'force-clear-cookies.html'), forceClearContent);

console.log('✅ Archivo de limpieza forzada creado: force-clear-cookies.html');
console.log('');
console.log('📝 INSTRUCCIONES CRÍTICAS:');
console.log('1. 🚨 CIERRA COMPLETAMENTE EL NAVEGADOR');
console.log('2. 🚨 ABRE UNA NUEVA VENTANA EN MODO INCÓGNITO');
console.log('3. 🌐 Ve a: http://localhost:3000/force-clear-cookies.html');
console.log('4. ⏳ Espera a que termine la limpieza automática');
console.log('5. 🔐 Ve a: http://localhost:3000/login');
console.log('6. 📧 Usa: secretaria@amestica.cl / secretaria123');
console.log('');
console.log('⚠️  IMPORTANTE: Debes usar modo incógnito para evitar cookies corruptas');
