#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting deployment with database verification...');

async function deployWithDatabaseCheck() {
    try {
        // Step 1: Verify database configuration
        console.log('🔍 Step 1: Verifying database configuration...');
        try {
            execSync('node scripts/verify-database-config.js', { stdio: 'inherit' });
            console.log('✅ Database configuration is valid');
        } catch (error) {
            console.log('⚠️  Database configuration has issues, but continuing...');
            console.log('Error:', error.message);
        }

        // Step 2: Generate Prisma Client
        console.log('📦 Step 2: Generating Prisma Client...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma Client generated');

        // Step 3: Setup production database
        console.log('🗄️  Step 3: Setting up production database...');
        try {
            execSync('node scripts/setup-production-database.js', { stdio: 'inherit' });
            console.log('✅ Database setup completed');
        } catch (error) {
            console.log('⚠️  Database setup had issues, but continuing...');
            console.log('Error:', error.message);
        }

        // Step 4: Build Next.js application
        console.log('🏗️  Step 4: Building Next.js application...');
        execSync('npx next build', { stdio: 'inherit' });
        console.log('✅ Next.js build completed');

        console.log('🎉 Deployment preparation completed successfully!');

    } catch (error) {
        console.error('❌ Deployment preparation failed:', error.message);
        process.exit(1);
    }
}

// Run the deployment preparation
deployWithDatabaseCheck();
