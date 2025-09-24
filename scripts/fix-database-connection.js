const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando conexión a la base de datos...');

// Crear archivo .env.local con configuración correcta
const envContent = `# Base de datos Supabase
DATABASE_URL="postgresql://postgres.rwsqkirgxsxrpjepjhtr:tu-password-aqui@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://rwsqkirgxsxrpjepjhtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c3FraXJneHN4cnBqZXBqaHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDc3ODIsImV4cCI6MjA3NDMyMzc4Mn0.BTCet2Yk379nwLu48QG8ummaRY3d8aHE0AJROPbUAGY"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="nueva-clave-secreta-super-segura-2024-renovada-12345"

# Email Configuration (opcional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="tu-email@gmail.com"`;

try {
    // Escribir archivo .env.local
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Archivo .env.local creado');

    // También crear .env
    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado');

    console.log('');
    console.log('⚠️  IMPORTANTE: Necesitas configurar la contraseña de la base de datos');
    console.log('1. Ve a tu panel de Supabase');
    console.log('2. Ve a Settings > Database');
    console.log('3. Copia la contraseña de la base de datos');
    console.log('4. Reemplaza "tu-password-aqui" en el archivo .env.local');
    console.log('');
    console.log('🔧 Alternativamente, usa esta URL completa:');
    console.log('DATABASE_URL="postgresql://postgres.rwsqkirgxsxrpjepjhtr:[TU_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"');

} catch (error) {
    console.error('❌ Error creando archivos de configuración:', error.message);
}
