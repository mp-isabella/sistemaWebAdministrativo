#!/usr/bin/env node

/**
 * Script para mostrar un resumen completo del sistema
 */

const { PrismaClient } = require('@prisma/client');

async function showSystemSummary() {
    console.log('📊 RESUMEN COMPLETO DEL SISTEMA\n');

    const prisma = new PrismaClient();

    try {
        // Mostrar usuarios
        console.log('👥 USUARIOS DEL SISTEMA:');
        const users = await prisma.user.findMany({
            include: {
                role: true,
                company: true
            }
        });

        users.forEach(user => {
            console.log(`   📧 ${user.email}`);
            console.log(`      👤 Nombre: ${user.name}`);
            console.log(`      🎭 Rol: ${user.role.name}`);
            console.log(`      🏢 Empresa: ${user.company?.displayName || 'Sin empresa'}`);
            console.log(`      ✅ Activo: ${user.isActive ? 'Sí' : 'No'}`);
            console.log('');
        });

        // Mostrar empresas
        console.log('🏢 EMPRESAS DEL SISTEMA:');
        const companies = await prisma.company.findMany();
        companies.forEach(company => {
            console.log(`   🏢 ${company.displayName || company.name}`);
            console.log(`      📧 Email: ${company.email || 'No especificado'}`);
            console.log(`      📞 Teléfono: ${company.phone || 'No especificado'}`);
            console.log(`      🏠 Dirección: ${company.address || 'No especificada'}`);
            console.log(`      🆔 RUT: ${company.rut || 'No especificado'}`);
            console.log(`      🎨 Tipo: ${company.type || 'No especificado'}`);
            console.log(`      🔧 Servicio: ${company.service || 'No especificado'}`);
            console.log('');
        });

        // Mostrar servicios
        console.log('🔧 SERVICIOS DISPONIBLES:');
        const services = await prisma.service.findMany();
        services.forEach(service => {
            console.log(`   🔧 ${service.name}`);
            console.log(`      📝 Descripción: ${service.description || 'Sin descripción'}`);
            console.log(`      💰 Precio: $${service.price?.toLocaleString() || 'No especificado'}`);
            console.log(`      ✅ Activo: ${service.isActive ? 'Sí' : 'No'}`);
            console.log('');
        });

        // Mostrar roles
        console.log('🎭 ROLES DEL SISTEMA:');
        const roles = await prisma.role.findMany();
        roles.forEach(role => {
            console.log(`   🎭 ${role.name}`);
        });

        // Estadísticas generales
        console.log('\n📈 ESTADÍSTICAS:');
        const totalUsers = await prisma.user.count();
        const totalRoles = await prisma.role.count();
        const totalCompanies = await prisma.company.count();
        const totalServices = await prisma.service.count();

        console.log(`   👥 Total de usuarios: ${totalUsers}`);
        console.log(`   🎭 Total de roles: ${totalRoles}`);
        console.log(`   🏢 Total de empresas: ${totalCompanies}`);
        console.log(`   🔧 Total de servicios: ${totalServices}`);

        console.log('\n🎉 ¡Sistema completamente configurado y funcionando!');
        console.log('\n📋 Para acceder al sistema:');
        console.log('1. Ve a http://localhost:3000/login');
        console.log('2. Usa las credenciales mostradas arriba');
        console.log('3. Cada usuario tendrá acceso según su rol');

    } catch (error) {
        console.log('❌ Error al obtener el resumen:');
        console.log(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

showSystemSummary().catch(console.error);
