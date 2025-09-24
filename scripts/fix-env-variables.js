const fs = require('fs');

console.log('🔧 Configurando variables de entorno...');

const envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="nueva-clave-secreta-super-segura-2024-renovada-12345"
NEXT_PUBLIC_SUPABASE_URL="https://rwsqkirgxsxrpjepjhtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c3FraXJneHN4cnBqZXBqaHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDc3ODIsImV4cCI6MjA3NDMyMzc4Mn0.BTCet2Yk379nwLu48QG8ummaRY3d8aHE0AJROPbUAGY"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"`;

try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado correctamente');

    // También crear .env.local
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Archivo .env.local creado correctamente');

    console.log('');
    console.log('🚀 Ahora ejecuta: npm run dev');
    console.log('🌐 Ve a: http://localhost:3001/login');

} catch (error) {
    console.error('❌ Error:', error.message);
}
