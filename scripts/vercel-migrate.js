#!/usr/bin/env node

const { execSync } = require('child_process');

async function runMigrations() {
    console.log('🗄️  Starting database migration process...');

    try {
        // Step 1: Generate Prisma Client
        console.log('📦 Generating Prisma Client...');
        execSync('npx prisma generate', {
            stdio: 'inherit',
            timeout: 30000
        });
        console.log('✅ Prisma Client generated successfully');

        // Step 2: Check if we need to create the database
        console.log('🔍 Checking database status...');

        try {
            // Try to connect and check if tables exist
            execSync('node scripts/vercel-database-test.js', {
                stdio: 'pipe',
                timeout: 15000
            });
            console.log('✅ Database connection verified');
        } catch (error) {
            console.log('⚠️  Database connection test failed, but continuing with migration...');
        }

        // Step 3: Run migrations
        console.log('🚀 Running database migrations...');

        try {
            // Try migrate deploy first (for production)
            execSync('npx prisma migrate deploy', {
                stdio: 'inherit',
                timeout: 60000
            });
            console.log('✅ Migrations deployed successfully');
        } catch (migrateError) {
            console.log('⚠️  migrate deploy failed, trying db push...');

            try {
                // Fallback to db push
                execSync('npx prisma db push --accept-data-loss', {
                    stdio: 'inherit',
                    timeout: 60000
                });
                console.log('✅ Database schema pushed successfully');
            } catch (pushError) {
                console.log('❌ Both migration methods failed');
                throw pushError;
            }
        }

        // Step 4: Verify the migration
        console.log('🔍 Verifying migration...');
        execSync('node scripts/vercel-database-test.js', {
            stdio: 'inherit',
            timeout: 15000
        });

        console.log('✅ Database migration completed successfully');
        return true;

    } catch (error) {
        console.error('❌ Migration failed:', error.message);

        // Provide specific guidance
        if (error.message.includes('FATAL: password authentication failed')) {
            console.log('💡 Check your DATABASE_URL password in Vercel environment variables');
        } else if (error.message.includes('FATAL: database') && error.message.includes('does not exist')) {
            console.log('💡 Check your DATABASE_URL database name in Vercel environment variables');
        } else if (error.message.includes('P1001')) {
            console.log('💡 Cannot reach database server. Check your DATABASE_URL connection string');
        }

        return false;
    }
}

// Run migrations
runMigrations()
    .then(success => {
        if (success) {
            console.log('✅ Migration process completed successfully');
            process.exit(0);
        } else {
            console.log('❌ Migration process failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Migration process error:', error);
        process.exit(1);
    });
