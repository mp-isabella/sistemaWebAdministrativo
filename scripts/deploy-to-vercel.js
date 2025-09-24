const fs = require('fs');
const path = require('path');

console.log('🚀 CONFIGURACIÓN PARA DEPLOY EN VERCEL...');

// 1. Actualizar package.json para Vercel
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.scripts = {
    ...packageJson.scripts,
    "vercel-build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json actualizado para Vercel');

// 2. Crear vercel.json optimizado
const vercelConfig = {
    "buildCommand": "npm run vercel-build",
    "installCommand": "npm install",
    "framework": "nextjs",
    "regions": ["iad1"],
    "functions": {
        "app/api/**/*.ts": {
            "maxDuration": 30
        }
    },
    "env": {
        "NEXTAUTH_URL": "https://tu-dominio.vercel.app"
    }
};

fs.writeFileSync(path.join(__dirname, '..', 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json creado');

// 3. Actualizar schema.prisma para PostgreSQL
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(
    'provider = "sqlite"',
    'provider = "postgresql"'
);

fs.writeFileSync(schemaPath, schema);
console.log('✅ Schema actualizado para PostgreSQL');

console.log('\n🎯 INSTRUCCIONES PARA DEPLOY:');
console.log('1. 📝 Ve a tu panel de Supabase y copia la DATABASE_URL');
console.log('2. 🔧 En Vercel, configura estas variables de entorno:');
console.log('   - DATABASE_URL: postgresql://...');
console.log('   - NEXTAUTH_SECRET: nueva-clave-secreta-super-segura-2024-renovada-12345');
console.log('   - NEXTAUTH_URL: https://tu-dominio.vercel.app');
console.log('3. 🚀 Haz push a GitHub y conecta con Vercel');
console.log('4. ✅ El deploy se ejecutará automáticamente');

console.log('\n✅ CONFIGURACIÓN COMPLETADA PARA VERCEL');