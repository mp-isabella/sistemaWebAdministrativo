#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Función para verificar si un puerto está disponible
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Función para encontrar un puerto disponible
async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  
  while (port < startPort + 100) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    port++;
  }
  
  throw new Error('No se encontró un puerto disponible');
}

// Función para configurar variables de entorno
function setupEnvironment(port) {
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
  
  // Asegurar variables básicas
  const requiredVars = [
    'DATABASE_URL="file:./dev.db"',
    'NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"'
  ];
  
  requiredVars.forEach(requiredVar => {
    const [varName] = requiredVar.split('=');
    if (!envContent.includes(`${varName}=`)) {
      envContent += `\n${requiredVar}\n`;
    }
  });
  
  // Escribir el archivo .env
  fs.writeFileSync(envPath, envContent.trim() + '\n');
}

// Función para verificar si la base de datos existe
function checkDatabase() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return fs.existsSync(dbPath);
}

// Función para generar Prisma client
function generatePrismaClient() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Generando cliente Prisma...');
    
    const child = spawn('npx', ['prisma', 'generate'], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Cliente Prisma generado');
        resolve();
      } else {
        reject(new Error(`Error generando cliente Prisma: ${code}`));
      }
    });
  });
}

// Función para ejecutar migraciones
function runMigrations() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Ejecutando migraciones...');
    
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migraciones ejecutadas');
        resolve();
      } else {
        reject(new Error(`Error ejecutando migraciones: ${code}`));
      }
    });
  });
}

// Función principal
async function startUniversal() {
  try {
    console.log('🚀 Iniciando Sistema Web Administrativo...');
    console.log('');
    
    // 1. Encontrar puerto disponible
    console.log('🔍 Buscando puerto disponible...');
    const port = await findAvailablePort(3000);
    console.log(`✅ Puerto ${port} disponible`);
    
    // 2. Configurar variables de entorno
    console.log('🔧 Configurando variables de entorno...');
    setupEnvironment(port);
    console.log(`✅ NEXTAUTH_URL configurado: http://localhost:${port}`);
    
    // 3. Verificar base de datos
    if (!checkDatabase()) {
      console.log('⚠️  Base de datos no encontrada, ejecutando migraciones...');
      try {
        await runMigrations();
      } catch (error) {
        console.log('⚠️  Error en migraciones, continuando...');
      }
    }
    
    // 4. Generar cliente Prisma
    try {
      await generatePrismaClient();
    } catch (error) {
      console.log('⚠️  Error generando cliente Prisma, continuando...');
    }
    
    console.log('');
    console.log('🎉 Configuración completada');
    console.log(`🚀 Iniciando aplicación en http://localhost:${port}`);
    console.log('');
    console.log('📋 URLs importantes:');
    console.log(`   🏠 Inicio: http://localhost:${port}`);
    console.log(`   🔐 Login: http://localhost:${port}/login`);
    console.log(`   📊 Dashboard: http://localhost:${port}/dashboard`);
    console.log(`   📅 Calendario: http://localhost:${port}/dashboard/schedule/calendar`);
    console.log(`   📋 Agenda: http://localhost:${port}/dashboard/schedule`);
    console.log(`   👥 Clientes: http://localhost:${port}/dashboard/clients`);
    console.log(`   👨‍🔧 Trabajadores: http://localhost:${port}/dashboard/workers`);
    console.log('');
    console.log('💡 Credenciales de prueba:');
    console.log('   👨‍💼 Admin: admin@amestica.com / admin123');
    console.log('   👩‍💼 Secretaria: secretaria@amestica.com / secretaria123');
    console.log('   👨‍🔧 Técnico: tecnico@amestica.com / tecnico123');
    console.log('');
    
    // 5. Iniciar Next.js
    const child = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('error', (error) => {
      console.error('❌ Error al iniciar la aplicación:', error);
      process.exit(1);
    });
    
    child.on('close', (code) => {
      console.log(`\n👋 Aplicación cerrada con código: ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  startUniversal();
}

module.exports = { startUniversal };
