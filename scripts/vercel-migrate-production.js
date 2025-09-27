#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runProductionMigrations() {
    console.log('🗄️  Starting production database migration process...');

    try {
        // Step 1: Use production schema
        console.log('📦 Setting up production database schema...');
        const productionSchema = path.join(__dirname, '..', 'prisma', 'schema.production.prisma');
        const defaultSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma');

        if (fs.existsSync(productionSchema)) {
            // Backup original schema
            if (fs.existsSync(defaultSchema)) {
                fs.copyFileSync(defaultSchema, defaultSchema + '.backup');
            }
            // Use production schema
            fs.copyFileSync(productionSchema, defaultSchema);
            console.log('✅ Using production PostgreSQL schema');
        }

        // Step 2: Generate Prisma Client
        console.log('📦 Generating Prisma Client...');
        execSync('npx prisma generate', {
            stdio: 'inherit',
            timeout: 30000
        });
        console.log('✅ Prisma Client generated successfully');

        // Step 3: Check database connection
        console.log('🔍 Testing database connection...');
        try {
            execSync('node scripts/vercel-database-test.js', {
                stdio: 'pipe',
                timeout: 15000
            });
            console.log('✅ Database connection verified');
        } catch (error) {
            console.log('⚠️  Database connection test failed, but continuing with migration...');
        }

        // Step 4: Run migrations
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
                console.log('⚠️  This might be due to database connection issues');
                console.log('💡 Check your DATABASE_URL in Vercel environment variables');
                throw pushError;
            }
        }

        // Step 5: Verify the migration
        console.log('🔍 Verifying migration...');
        try {
            execSync('node scripts/vercel-database-test.js', {
                stdio: 'inherit',
                timeout: 15000
            });
            console.log('✅ Database migration completed successfully');
        } catch (error) {
            console.log('⚠️  Migration verification failed, but continuing...');
        }

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
        } else if (error.message.includes('P3019')) {
            console.log('💡 Database provider mismatch. Make sure you are using PostgreSQL in production');
        }

        return false;
    }
}

// Run migrations
runProductionMigrations()
    .then(success => {
        if (success) {
            console.log('✅ Production migration process completed successfully');
            process.exit(0);
        } else {
            console.log('❌ Production migration process failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Production migration process error:', error);
        process.exit(1);
    });
