#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    const prisma = new PrismaClient({
        log: ['error'],
    });

    try {
        // Test basic connection
        await prisma.$connect();
        console.log('✅ Database connection successful');

        // Test if tables exist (PostgreSQL compatible)
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        console.log(`📊 Found ${tables.length} tables in database`);

        // Test if we can query a basic table
        if (tables.length > 0) {
            try {
                const userCount = await prisma.user.count();
                console.log(`👥 Users in database: ${userCount}`);
            } catch (error) {
                console.log('⚠️  Users table might not exist yet (this is normal for first deployment)');
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);

        // Provide specific error guidance
        if (error.message.includes('FATAL: password authentication failed')) {
            console.log('💡 Password authentication failed. Check your DATABASE_URL password.');
        } else if (error.message.includes('FATAL: database') && error.message.includes('does not exist')) {
            console.log('💡 Database does not exist. Check your DATABASE_URL database name.');
        } else if (error.message.includes('FATAL: Tenant or user not found')) {
            console.log('💡 Supabase authentication error. Check your DATABASE_URL credentials.');
        } else if (error.message.includes('P1001')) {
            console.log('💡 Cannot reach database server. Check your DATABASE_URL connection string.');
        }

        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testDatabaseConnection()
    .then(success => {
        if (success) {
            console.log('✅ Database test completed successfully');
            process.exit(0);
        } else {
            console.log('❌ Database test failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Database test error:', error);
        process.exit(1);
    });