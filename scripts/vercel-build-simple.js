const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting simple Vercel build...');

try {
    // 1. Configurar variables de entorno
    console.log('⚙️ Setting up environment...');
    process.env.NODE_ENV = 'production';
    process.env.SKIP_ENV_VALIDATION = 'true';
    process.env.DATABASE_URL = 'postgresql://dummy:dummy@dummy.com:6543/dummy';

    // 2. Generar Prisma Client
    console.log('📦 Generating Prisma Client...');
    try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma Client generated');
    } catch (error) {
        console.log('⚠️ Prisma generate failed, continuing...');
    }

    // 3. Build de Next.js
    console.log('🏗️ Building Next.js...');
    execSync('npx next build', {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            SKIP_ENV_VALIDATION: 'true',
            DATABASE_URL: 'postgresql://dummy:dummy@dummy.com:6543/dummy'
        }
    });

    console.log('✅ Build completed successfully');

    // 4. Intentar configurar base de datos automáticamente
    console.log('🔧 Attempting database setup...');
    try {
        const { execSync } = require('child_process');
        execSync('node scripts/auto-setup-vercel.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('⚠️ Auto-setup failed, manual setup required');
    }

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}