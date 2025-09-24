// Script para crear todos los usuarios del sistema
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
    {
        name: 'Administrador',
        email: 'admin@amestica.cl',
        password: 'admin123',
        role: 'administrador',
        phone: '+56912345678'
    },
    {
        name: 'Secretaria',
        email: 'secretaria@amestica.cl',
        password: 'secretaria123',
        role: 'secretaria',
        phone: '+56912345679'
    },
    {
        name: 'Técnico',
        email: 'tecnico@amestica.cl',
        password: 'tecnico123',
        role: 'tecnico',
        phone: '+56912345680'
    }
];

async function createAllUsers() {
    try {
        // Verificar conexión
        await prisma.$connect();
        // Crear roles si no existen
        const roles = ['administrador', 'secretaria', 'tecnico'];
        const createdRoles = {};

        for (const roleName of roles) {
            let role = await prisma.role.findFirst({
                where: { name: roleName }
            });

            if (!role) {
                role = await prisma.role.create({
                    data: { name: roleName }
                });
            } else {
            }

            createdRoles[roleName] = role;
        }
        // Crear usuarios
        for (const userData of users) {
            try {
                // Verificar si el usuario ya existe
                const existingUser = await prisma.user.findUnique({
                    where: { email: userData.email }
                });

                if (existingUser) {
                    // Actualizar usuario existente
                    const hashedPassword = await bcrypt.hash(userData.password, 12);
                    await prisma.user.update({
                        where: { email: userData.email },
                        data: {
                            name: userData.name,
                            password: hashedPassword,
                            roleId: createdRoles[userData.role].id,
                            isActive: true,
                            phone: userData.phone
                        }
                    });
                } else {
                    // Crear nuevo usuario
                    const hashedPassword = await bcrypt.hash(userData.password, 12);

                    const user = await prisma.user.create({
                        data: {
                            name: userData.name,
                            email: userData.email,
                            password: hashedPassword,
                            roleId: createdRoles[userData.role].id,
                            isActive: true,
                            phone: userData.phone
                        }
                    });
                }
            } catch (error) {
            }
        }
    } catch (error) {
    } finally {
        await prisma.$disconnect();
    }
}

createAllUsers();
