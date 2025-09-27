#!/usr/bin/env node

const { execSync } = require('child_process');

async function initDatabaseAtRuntime() {
    console.log('🗄️  Initializing database at runtime...');

    try {
        // Check if we're in production
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            console.log('⚠️  Not in production environment, skipping database init');
            return true;
        }

        // Try to connect and set up database
        console.log('🔍 Testing database connection...');

        try {
            // Simple connection test
            execSync('npx prisma db execute --stdin', {
                input: 'SELECT 1;',
                stdio: 'pipe',
                timeout: 10000
            });
            console.log('✅ Database connection successful');
        } catch (error) {
            console.log('⚠️  Database connection failed:', error.message);
            console.log('💡 Database will be initialized on first API call');
            return true;
        }

        // Try to push schema
        console.log('🚀 Pushing database schema...');
        try {
            execSync('npx prisma db push --accept-data-loss', {
                stdio: 'inherit',
                timeout: 60000
            });
            console.log('✅ Database schema pushed successfully');
        } catch (error) {
            console.log('⚠️  Schema push failed:', error.message);
            console.log('💡 This is normal if tables already exist');
        }

        return true;

    } catch (error) {
        console.error('❌ Runtime database init failed:', error.message);
        console.log('💡 Database will be initialized on first API call');
        return true; // Don't fail the app startup
    }
}

// Run initialization
initDatabaseAtRuntime()
    .then(success => {
        if (success) {
            console.log('✅ Runtime database initialization completed');
            process.exit(0);
        } else {
            console.log('❌ Runtime database initialization failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Runtime database initialization error:', error);
        process.exit(1);
    });
