const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🧪 Probando autenticación...');
    
    // Probar con las credenciales exactas del formulario
    const testCredentials = {
      email: 'admin@amestica.cl',
      password: 'admin123'
    };
    
    console.log('📝 Credenciales de prueba:', testCredentials);
    
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: testCredentials.email },
      include: { role: true }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      isActive: user.isActive
    });
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(testCredentials.password, user.password);
    console.log('🔐 Contraseña válida:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Autenticación exitosa');
      console.log('👤 Datos del usuario para NextAuth:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name.toLowerCase()
      });
    } else {
      console.log('❌ Contraseña inválida');
      
      // Verificar si la contraseña en la BD coincide
      console.log('🔍 Verificando contraseña en BD...');
      const hashedPassword = await bcrypt.hash(testCredentials.password, 12);
      console.log('🔐 Contraseña hasheada:', hashedPassword);
      console.log('🔐 Contraseña en BD:', user.password);
    }
    
  } catch (error) {
    console.error('💥 Error en prueba de autenticación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
