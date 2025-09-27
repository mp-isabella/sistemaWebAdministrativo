const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting safe Vercel build process...');

try {
  // 1. Limpiar builds anteriores
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // 2. Configurar variables de entorno para build
  console.log('⚙️ Setting up build environment...');
  process.env.NODE_ENV = 'production';
  process.env.SKIP_ENV_VALIDATION = 'true';
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy'; // URL dummy para build

  // 3. Generar Prisma Client sin conectar a BD
  console.log('📦 Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated successfully');
  } catch (error) {
    console.log('⚠️ Prisma generate failed, continuing with build...');
  }

  // 4. Usar configuración de producción
  console.log('⚙️ Using production Next.js configuration...');
  if (fs.existsSync('next.config.production.js')) {
    fs.copyFileSync('next.config.production.js', 'next.config.js');
    console.log('✅ Using production Next.js configuration');
  }

  // 5. Build de Next.js
  console.log('🏗️ Building Next.js application...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SKIP_ENV_VALIDATION: 'true',
      DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy'
    }
  });

  // 6. Verificar build
  console.log('🔍 Verifying build output...');
  if (fs.existsSync('.next')) {
    console.log('✅ .next directory created successfully');
  } else {
    throw new Error('Build failed - .next directory not found');
  }

  // 7. Verificar tamaño del bundle
  console.log('📊 Checking bundle size...');
  const buildManifest = path.join('.next', 'build-manifest.json');
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    const pageCount = Object.keys(manifest.pages).length;
    console.log(`📦 Build manifest contains ${pageCount} pages`);
  }

  console.log('✅ Safe build completed successfully');
  console.log('🚀 Ready for Vercel deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
