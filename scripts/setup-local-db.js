const fs = require('fs');
const path = require('path');

// Configuración para SQLite local
const envContent = `# Database Configuration (SQLite para desarrollo local)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
`;

// Crear archivo .env
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Archivo .env creado con configuración SQLite local');
console.log('📝 DATABASE_URL configurado para usar SQLite');
console.log('🔐 NEXTAUTH_SECRET configurado para desarrollo');

// Actualizar schema.prisma para usar SQLite
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Cambiar provider de postgresql a sqlite
schemaContent = schemaContent.replace(
  'provider = "postgresql"',
  'provider = "sqlite"'
);

// Cambiar la URL
schemaContent = schemaContent.replace(
  'url      = env("DATABASE_URL")',
  'url      = "file:./dev.db"'
);

fs.writeFileSync(schemaPath, schemaContent);

console.log('✅ Schema de Prisma actualizado para SQLite');
console.log('');
console.log('🚀 Ahora ejecuta los siguientes comandos:');
console.log('1. npx prisma generate');
console.log('2. npx prisma migrate dev --name init');
console.log('3. npm run seed');
console.log('4. npm run dev');
