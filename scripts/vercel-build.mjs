#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting Vercel build process...');

// Helper function to test database connection
async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');

        // First, try to run the verification script
        try {
            execSync('node scripts/vercel-database-test.js', {
                stdio: 'pipe',
                timeout: 15000 // 15 seconds timeout
            });
            console.log('✅ Database connection verified successfully');
            return true;
        } catch (scriptError) {
            console.log('⚠️  Verification script failed, trying direct connection...');
        }

        // Fallback to direct connection test
        execSync('npx prisma db pull --schema=prisma/schema.prisma', {
            stdio: 'pipe',
            timeout: 10000 // 10 seconds timeout
        });
        return true;
    } catch (error) {
        console.log('❌ Database connection test failed:', error.message);

        // Check for specific error types
        if (error.message.includes('FATAL: Tenant or user not found')) {
            console.log('💡 This is a Supabase authentication error.');
            console.log('   Please verify your DATABASE_URL in Vercel environment variables.');
            console.log('   Make sure the password in the connection string is correct.');
        } else if (error.message.includes('FATAL: password authentication failed')) {
            console.log('💡 Database password is incorrect.');
            console.log('   Please check your DATABASE_URL password in Vercel.');
        } else if (error.message.includes('FATAL: database') && error.message.includes('does not exist')) {
            console.log('💡 Database does not exist.');
            console.log('   Please check your DATABASE_URL database name.');
        } else if (error.message.includes('P1001')) {
            console.log('💡 P1001: Cannot reach database server.');
            console.log('   This usually means:');
            console.log('   1. The database server is not accessible');
            console.log('   2. The connection string is incorrect');
            console.log('   3. The Supabase project is paused or inactive');
            console.log('   4. There are connection limits reached');
        }

        return false;
    }
}

// Helper function to run migrations with better error handling
async function runMigrations() {
    try {
        console.log('🗄️  Running database migrations...');

        // First, try to test the connection
        const connectionOk = await testDatabaseConnection();

        if (!connectionOk) {
            console.log('⚠️  Database connection failed, skipping migrations...');
            console.log('💡 This might be due to:');
            console.log('   - Incorrect DATABASE_URL format');
            console.log('   - Database server not accessible');
            console.log('   - Invalid credentials');
            return false;
        }

        // If connection is OK, run migrations
        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            timeout: 30000 // 30 seconds timeout for migrations
        });
        console.log('✅ Migrations completed successfully');
        return true;

    } catch (error) {
        console.log('⚠️  Migration failed, but continuing with build...');
        console.log('Error details:', error.message);

        // Check if it's a connection error
        if (error.message.includes('FATAL') || error.message.includes('not found')) {
            console.log('💡 This appears to be a database connection issue.');
            console.log('   Please verify your DATABASE_URL in Vercel environment variables.');
        }

        return false;
    }
}

try {
    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 2: Check if DATABASE_URL is available and run migrations
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
        console.log('🗄️  DATABASE_URL found');

        // Validate DATABASE_URL format
        if (!databaseUrl.startsWith('postgresql://')) {
            console.log('⚠️  DATABASE_URL format appears incorrect (should start with postgresql://)');
        }

        await runMigrations();
    } else {
        console.log('⚠️  DATABASE_URL not found, skipping migrations...');
        console.log('💡 Make sure to set DATABASE_URL in Vercel environment variables');
    }

    // Step 3: Build Next.js application
    console.log('🏗️  Building Next.js application...');
    execSync('npx next build', { stdio: 'inherit' });

    console.log('✅ Build completed successfully!');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
