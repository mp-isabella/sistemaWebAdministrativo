// Script para crear un usuario administrador
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Verificar conexión
        await prisma.$connect();
        // Verificar si ya existe un administrador
        const existingAdmin = await prisma.user.findFirst({
            where: {
                role: {
                    name: 'administrador'
                },
                isActive: true
            }
        });

        if (existingAdmin) {
            return;
        }

        // Verificar si existe el rol de administrador
        let adminRole = await prisma.role.findFirst({
            where: { name: 'administrador' }
        });

        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: 'administrador'
                }
            });
        }

        // Crear usuario administrador
        const hashedPassword = await bcrypt.hash('admin123', 12);

        const adminUser = await prisma.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@amestica.cl',
                phone: '+56912345678',
                password: hashedPassword,
                roleId: adminRole.id,
                isActive: true
            }
        });
    } catch (error) {
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
