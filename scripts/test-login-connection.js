const { PrismaClient } = require('@prisma/client');

async function testLoginConnection() {
    console.log('🔍 Probando conexión para login...');
    
    const prisma = new PrismaClient();
    
    try {
        // Probar conexión
        await prisma.$connect();
        console.log('✅ Conexión a Prisma exitosa');
        
        // Probar consulta de usuario específico
        const user = await prisma.user.findUnique({
            where: { email: 'secretaria@amestica.cl' },
            include: { role: true }
        });
        
        if (user) {
            console.log('✅ Usuario encontrado:', {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                isActive: user.isActive
            });
            
            // Probar hash de contraseña
            const bcrypt = require('bcryptjs');
            const testPassword = 'secretaria123';
            const isPasswordValid = await bcrypt.compare(testPassword, user.password);
            
            if (isPasswordValid) {
                console.log('✅ Contraseña válida');
            } else {
                console.log('❌ Contraseña inválida');
            }
        } else {
            console.log('❌ Usuario no encontrado');
        }
        
        // Probar consulta de roles
        const roles = await prisma.role.findMany();
        console.log('📊 Roles disponibles:', roles.map(r => r.name));
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testLoginConnection();
