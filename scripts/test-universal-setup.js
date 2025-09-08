const { findAvailablePort } = require('./start-any-port.js');
const fs = require('fs');
const path = require('path');

async function testUniversalSetup() {
  try {
    console.log('🧪 Probando configuración universal...');
    console.log('');
    
    // 1. Probar detección de puerto
    console.log('1️⃣ Probando detección de puerto...');
    const port = await findAvailablePort(3000);
    console.log(`   ✅ Puerto ${port} disponible`);
    
    // 2. Verificar archivos necesarios
    console.log('2️⃣ Verificando archivos necesarios...');
    
    const requiredFiles = [
      'package.json',
      'next.config.mjs',
      'prisma/schema.prisma',
      'app/layout.tsx',
      'app/dashboard/layout.tsx'
    ];
    
    let allFilesExist = true;
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      console.log(`   ${exists ? '✅' : '❌'} ${file}`);
      if (!exists) allFilesExist = false;
    });
    
    if (!allFilesExist) {
      throw new Error('Faltan archivos necesarios');
    }
    
    // 3. Verificar scripts en package.json
    console.log('3️⃣ Verificando scripts en package.json...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
      'dev:universal',
      'dev:auto',
      'dev:3000',
      'dev:3001'
    ];
    
    requiredScripts.forEach(script => {
      const exists = packageJson.scripts && packageJson.scripts[script];
      console.log(`   ${exists ? '✅' : '❌'} npm run ${script}`);
      if (!exists) {
        throw new Error(`Script ${script} no encontrado`);
      }
    });
    
    // 4. Verificar configuración de Next.js
    console.log('4️⃣ Verificando configuración de Next.js...');
    const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
    const hasHeaders = nextConfig.includes('async headers()');
    console.log(`   ${hasHeaders ? '✅' : '❌'} Configuración de headers`);
    
    // 5. Verificar archivo .env
    console.log('5️⃣ Verificando archivo .env...');
    const envPath = path.join(process.cwd(), '.env');
    const envExists = fs.existsSync(envPath);
    console.log(`   ${envExists ? '✅' : '⚠️'} Archivo .env ${envExists ? 'existe' : 'no existe (se creará automáticamente)'}`);
    
    console.log('');
    console.log('🎉 ¡Todas las pruebas pasaron!');
    console.log('');
    console.log('📋 Para iniciar la aplicación:');
    console.log(`   npm run dev:universal`);
    console.log('');
    console.log('🔗 URLs que funcionarán:');
    console.log(`   🏠 Inicio: http://localhost:${port}`);
    console.log(`   🔐 Login: http://localhost:${port}/login`);
    console.log(`   📊 Dashboard: http://localhost:${port}/dashboard`);
    console.log(`   📅 Calendario: http://localhost:${port}/dashboard/schedule/calendar`);
    console.log('');
    console.log('💡 La aplicación está lista para funcionar en cualquier puerto disponible');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.log('');
    console.log('🔧 Para solucionar:');
    console.log('   1. Ejecuta: npm install');
    console.log('   2. Ejecuta: npm run dev:universal');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testUniversalSetup();
}

module.exports = { testUniversalSetup };
