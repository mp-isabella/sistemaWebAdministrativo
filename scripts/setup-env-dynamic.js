const fs = require('fs');
const path = require('path');
const { findAvailablePort } = require('./start-any-port.js');

async function setupEnvDynamic() {
  try {
    console.log('🔧 Configurando variables de entorno dinámicamente...');
    
    // Encontrar puerto disponible
    const port = await findAvailablePort(3000);
    
    // Leer el archivo .env si existe
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Configurar NEXTAUTH_URL dinámicamente
    const nextAuthUrl = `NEXTAUTH_URL="http://localhost:${port}"`;
    
    // Buscar y reemplazar NEXTAUTH_URL existente o agregar nuevo
    if (envContent.includes('NEXTAUTH_URL=')) {
      envContent = envContent.replace(/NEXTAUTH_URL="[^"]*"/, nextAuthUrl);
    } else {
      envContent += `\n${nextAuthUrl}\n`;
    }
    
    // Asegurar que tenemos las variables básicas
    const requiredVars = [
      'DATABASE_URL="file:./dev.db"',
      'NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"',
      'NEXTAUTH_URL="http://localhost:3000"'
    ];
    
    requiredVars.forEach(requiredVar => {
      const [varName] = requiredVar.split('=');
      if (!envContent.includes(`${varName}=`)) {
        envContent += `\n${requiredVar}\n`;
      }
    });
    
    // Escribir el archivo .env
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    console.log(`✅ Variables de entorno configuradas para puerto ${port}`);
    console.log(`🔗 NEXTAUTH_URL: http://localhost:${port}`);
    console.log('');
    console.log('📋 Para iniciar la aplicación:');
    console.log(`   npm run dev:auto`);
    console.log(`   o`);
    console.log(`   npm run dev:${port}`);
    console.log('');
    
    return port;
    
  } catch (error) {
    console.error('❌ Error configurando variables de entorno:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupEnvDynamic().catch(process.exit);
}

module.exports = { setupEnvDynamic };
