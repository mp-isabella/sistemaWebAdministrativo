// Script para verificar usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        // Verificar conexión
        await prisma.$connect();
        // Obtener todos los usuarios
        const users = await prisma.user.findMany({
            include: {
                role: true
            }
        });
        if (users.length === 0) {
            return;
        }

        // Mostrar información de cada usuario
        users.forEach((user, index) => {
        });

        // Verificar si hay al menos un administrador activo
        const adminUsers = users.filter(user =>
            user.role.name.toLowerCase() === 'administrador' && user.isActive
        );

        if (adminUsers.length === 0) {
        } else {
        }

    } catch (error) {
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
