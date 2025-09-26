#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkRoles() {
    console.log('🔍 Verificando roles en la base de datos...\n');

    const prisma = new PrismaClient();

    try {
        // Obtener todos los roles
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });

        console.log('📋 Roles encontrados:');
        roles.forEach(role => {
            console.log(`- ${role.name} (ID: ${role.id})`);
        });

        // Obtener todos los usuarios con sus roles
        const users = await prisma.user.findMany({
            include: {
                role: true
            },
            orderBy: { name: 'asc' }
        });

        console.log('\n👥 Usuarios y sus roles:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email})`);
            console.log(`  Rol: ${user.role?.name || 'Sin rol'} | Activo: ${user.isActive}`);
        });

        // Verificar específicamente usuarios con rol técnico
        const technicians = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: 'TECNICO' } },
                    { role: { name: 'tecnico' } }
                ]
            },
            include: {
                role: true
            }
        });

        console.log('\n🔧 Usuarios con rol técnico:');
        if (technicians.length === 0) {
            console.log('❌ No se encontraron usuarios con rol técnico');
        } else {
            technicians.forEach(tech => {
                console.log(`- ${tech.name} (${tech.email}) - Rol: ${tech.role?.name} - Activo: ${tech.isActive}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRoles();
