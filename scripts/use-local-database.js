const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando base de datos local SQLite...');

// Crear archivo .env.local con SQLite
const envContent = `# Base de datos local SQLite
DATABASE_URL="file:./dev.db"

# Supabase Configuration (opcional)
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
    console.log('✅ Configuración de SQLite creada');

    // Actualizar schema.prisma para usar SQLite
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Cambiar de PostgreSQL a SQLite
    schemaContent = schemaContent.replace(
        'provider = "postgresql"',
        'provider = "sqlite"'
    );

    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Schema actualizado para SQLite');

    console.log('');
    console.log('📝 Pasos siguientes:');
    console.log('1. Ejecuta: npx prisma db push');
    console.log('2. Ejecuta: npx prisma db seed');
    console.log('3. Reinicia el servidor: npm run dev');
    console.log('4. Ve a: http://localhost:3001/login');
    console.log('5. Usa: secretaria@amestica.cl / secretaria123');

} catch (error) {
    console.error('❌ Error:', error.message);
}
