const { spawn } = require('child_process');
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

// Función principal
async function startApp() {
  try {
    console.log('🔍 Buscando puerto disponible...');
    
    const port = await findAvailablePort(3000);
    
    console.log(`✅ Puerto ${port} disponible`);
    console.log(`🚀 Iniciando aplicación en http://localhost:${port}`);
    console.log('');
    console.log('📋 URLs importantes:');
    console.log(`   🏠 Inicio: http://localhost:${port}`);
    console.log(`   🔐 Login: http://localhost:${port}/login`);
    console.log(`   📊 Dashboard: http://localhost:${port}/dashboard`);
    console.log(`   📅 Calendario: http://localhost:${port}/dashboard/schedule/calendar`);
    console.log(`   📋 Agenda: http://localhost:${port}/dashboard/schedule`);
    console.log('');
    
    // Iniciar Next.js en el puerto encontrado
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
  startApp();
}

module.exports = { findAvailablePort, startApp };
