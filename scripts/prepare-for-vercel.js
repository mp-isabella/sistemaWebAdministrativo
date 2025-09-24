const fs = require('fs');
const path = require('path');

console.log('🚀 PREPARANDO PROYECTO PARA VERCEL...');

try {
    // 1. Revertir schema a PostgreSQL
    console.log('🔄 Configurando PostgreSQL para producción...');
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');

    schemaContent = schemaContent.replace(
        'provider = "sqlite"',
        'provider = "postgresql"'
    );

    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Schema actualizado para PostgreSQL');

    // 2. Crear archivo .env.production
    const envProduction = `# Variables para Vercel - PRODUCCIÓN
DATABASE_URL="postgresql://postgres.rwsqkirgxsxrpjepjhtr:[TU_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="https://tu-proyecto.vercel.app"
NEXTAUTH_SECRET="clave-secreta-consistente-2024-final"
NEXT_PUBLIC_SUPABASE_URL="https://rwsqkirgxsxrpjepjhtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c3FraXJneHN4cnBqZXBqaHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDc3ODIsImV4cCI6MjA3NDMyMzc4Mn0.BTCet2Yk379nwLu48QG8ummaRY3d8aHE0AJROPbUAGY"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"`;

    fs.writeFileSync('.env.production', envProduction);
    console.log('✅ Archivo .env.production creado');

    // 3. Crear vercel.json optimizado
    const vercelConfig = {
        "buildCommand": "prisma generate && prisma db push && next build",
        "outputDirectory": ".next",
        "framework": "nextjs",
        "installCommand": "npm install",
        "devCommand": "npm run dev",
        "env": {
            "DATABASE_URL": "@database_url",
            "NEXTAUTH_SECRET": "@nextauth_secret",
            "NEXTAUTH_URL": "@nextauth_url",
            "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
        }
    };

    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json creado');

    // 4. Crear package.json scripts para Vercel
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    packageContent.scripts = {
        ...packageContent.scripts,
        "vercel-build": "prisma generate && prisma db push && next build",
        "postinstall": "prisma generate"
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
    console.log('✅ package.json actualizado');

    console.log('');
    console.log('✅ PROYECTO PREPARADO PARA VERCEL');
    console.log('');
    console.log('📝 PASOS PARA DEPLOY:');
    console.log('1. 🔧 Configura tu base de datos Supabase:');
    console.log('   - Ve a https://supabase.com/dashboard');
    console.log('   - Copia la "Connection string"');
    console.log('   - Reemplaza [TU_PASSWORD] en .env.production');
    console.log('');
    console.log('2. 🚀 Deploy en Vercel:');
    console.log('   - npm install -g vercel');
    console.log('   - vercel login');
    console.log('   - vercel --prod');
    console.log('');
    console.log('3. 🔑 Configura variables en Vercel:');
    console.log('   - DATABASE_URL');
    console.log('   - NEXTAUTH_SECRET');
    console.log('   - NEXTAUTH_URL (https://tu-proyecto.vercel.app)');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('');
    console.log('🎯 El proyecto está listo para producción!');

} catch (error) {
    console.error('❌ Error:', error.message);
}
