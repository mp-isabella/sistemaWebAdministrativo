const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando base de datos para producción...');

// URL de Supabase correcta para producción
const envContent = `# Base de datos Supabase - Producción
DATABASE_URL="postgresql://postgres.rwsqkirgxsxrpjepjhtr:tu-password-aqui@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://rwsqkirgxsxrpjepjhtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c3FraXJneHN4cnBqZXBqaHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDc3ODIsImV4cCI6MjA3NDMyMzc4Mn0.BTCet2Yk379nwLu48QG8ummaRY3d8aHE0AJROPbUAGY"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="nueva-clave-secreta-super-segura-2024-renovada-12345"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="tu-email@gmail.com"`;

try {
    // Crear archivo .env.local
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Archivo .env.local creado');

    // Crear archivo .env para Vercel
    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado');

    console.log('');
    console.log('🔧 CONFIGURACIÓN NECESARIA:');
    console.log('1. Ve a tu panel de Supabase: https://supabase.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a Settings > Database');
    console.log('4. Copia la "Connection string"');
    console.log('5. Reemplaza "tu-password-aqui" en .env.local con la contraseña real');
    console.log('');
    console.log('📝 URL de ejemplo:');
    console.log('postgresql://postgres.rwsqkirgxsxrpjepjhtr:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
    console.log('');
    console.log('🚀 Para Vercel, necesitarás configurar estas variables:');
    console.log('- DATABASE_URL');
    console.log('- NEXTAUTH_SECRET');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');

} catch (error) {
    console.error('❌ Error:', error.message);
}
