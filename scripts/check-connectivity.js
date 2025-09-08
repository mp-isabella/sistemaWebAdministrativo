const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');
const net = require('net');

const prisma = new PrismaClient();

async function checkConnectivity() {
  console.log('🔍 VERIFICANDO CONECTIVIDAD DEL SISTEMA');
  console.log('');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1. 🗄️ VERIFICANDO BASE DE DATOS:');
    try {
      await prisma.$connect();
      console.log('   ✅ Conexión a la base de datos exitosa');
      
      // Verificar que podemos hacer consultas
      const userCount = await prisma.user.count();
      console.log(`   ✅ Base de datos accesible - ${userCount} usuarios encontrados`);
    } catch (dbError) {
      console.log('   ❌ Error de conexión a la base de datos:');
      console.log('      - Mensaje:', dbError.message);
      console.log('      - Tipo:', dbError.name);
    }
    console.log('');

    // 2. Verificar servidor local
    console.log('2. 🌐 VERIFICANDO SERVIDOR LOCAL:');
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request('http://localhost:3000/api/health', {
          method: 'GET',
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              resolve({ status: res.statusCode, data: jsonData });
            } catch (e) {
              resolve({ status: res.statusCode, data: data });
            }
          });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
      });
      
      if (response.status === 200) {
        console.log('   ✅ Servidor local respondiendo correctamente');
        console.log('   📊 Estado:', response.data.status || 'OK');
      } else {
        console.log(`   ⚠️ Servidor respondió con estado: ${response.status}`);
      }
    } catch (serverError) {
      console.log('   ❌ Error de conexión al servidor:');
      console.log('      - Mensaje:', serverError.message);
      console.log('      - Tipo:', serverError.name);
    }
    console.log('');

    // 3. Verificar API del calendario
    console.log('3. 📅 VERIFICANDO API DEL CALENDARIO:');
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request('http://localhost:3000/api/calendar/jobs', {
          method: 'GET',
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              resolve({ status: res.statusCode, data: jsonData });
            } catch (e) {
              resolve({ status: res.statusCode, data: data });
            }
          });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
      });
      
      if (response.status === 200) {
        console.log('   ✅ API del calendario respondiendo');
        console.log('   📊 Datos recibidos:', response.data.success ? 'Sí' : 'No');
        console.log('   👥 Técnicos:', response.data.technicians?.length || 0);
      } else {
        console.log(`   ⚠️ API respondió con estado: ${response.status}`);
      }
    } catch (apiError) {
      console.log('   ❌ Error de conexión a la API:');
      console.log('      - Mensaje:', apiError.message);
      console.log('      - Tipo:', apiError.name);
    }
    console.log('');

    // 4. Verificar conectividad de internet
    console.log('4. 🌍 VERIFICANDO CONECTIVIDAD DE INTERNET:');
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request('https://httpbin.org/get', {
          method: 'GET',
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode }));
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
      });
      
      if (response.status === 200) {
        console.log('   ✅ Conectividad de internet funcionando');
      } else {
        console.log(`   ⚠️ Internet respondió con estado: ${response.status}`);
      }
    } catch (internetError) {
      console.log('   ❌ Error de conectividad de internet:');
      console.log('      - Mensaje:', internetError.message);
      console.log('      - Tipo:', internetError.name);
      console.log('   💡 Posibles causas:');
      console.log('      - Problema de VPN');
      console.log('      - Firewall bloqueando conexiones');
      console.log('      - Problema de DNS');
    }
    console.log('');

    // 5. Verificar puertos
    console.log('5. 🔌 VERIFICANDO PUERTOS:');
    
    function checkPort(port) {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
        
        socket.on('error', () => {
          socket.destroy();
          resolve(false);
        });
        
        socket.connect(port, 'localhost');
      });
    }
    
    const port3000 = await checkPort(3000);
    console.log(`   Puerto 3000: ${port3000 ? '✅ Abierto' : '❌ Cerrado'}`);
    
    const port5432 = await checkPort(5432);
    console.log(`   Puerto 5432 (PostgreSQL): ${port5432 ? '✅ Abierto' : '❌ Cerrado'}`);
    console.log('');

    // 6. Resumen y recomendaciones
    console.log('📊 RESUMEN:');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('   - Base de datos: ✅ OK');
    } catch (e) {
      console.log('   - Base de datos: ❌ Error');
    }
    
    console.log(`   - Servidor local: ${port3000 ? '✅ OK' : '❌ Error'}`);
    
    try {
      await new Promise((resolve, reject) => {
        const req = https.request('https://httpbin.org/get', { timeout: 5000 }, resolve);
        req.on('error', reject);
        req.on('timeout', reject);
        req.end();
      });
      console.log('   - Internet: ✅ OK');
    } catch (e) {
      console.log('   - Internet: ❌ Error');
    }
    console.log('');

    console.log('🔧 SOLUCIONES PARA ERRORES DE CONEXIÓN:');
    console.log('');
    console.log('1. Si hay problemas de VPN:');
    console.log('   - Desconectar y reconectar la VPN');
    console.log('   - Cambiar servidor VPN');
    console.log('   - Verificar configuración de firewall');
    console.log('');
    console.log('2. Si hay problemas de base de datos:');
    console.log('   - Reiniciar el servidor: npm run dev');
    console.log('   - Verificar archivo .env');
    console.log('   - Ejecutar: npx prisma generate');
    console.log('');
    console.log('3. Si hay problemas de puertos:');
    console.log('   - Verificar que no haya otros servicios usando el puerto 3000');
    console.log('   - Reiniciar el servidor');
    console.log('   - Verificar firewall de Windows');
    console.log('');

  } catch (error) {
    console.log('💥 ERROR GENERAL:');
    console.log('   - Mensaje:', error.message);
    console.log('   - Tipo:', error.name);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la verificación
checkConnectivity().catch(console.error);
