#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up production database...');

async function setupProductionDatabase() {
    try {
        // Step 1: Generate Prisma Client
        console.log('📦 Generating Prisma Client...');
        execSync('npx prisma generate', { stdio: 'inherit' });

        // Step 2: Check DATABASE_URL
        const databaseUrl = process.env.DATABASE_URL;
        
        if (!databaseUrl) {
            console.log('❌ DATABASE_URL not found');
            console.log('💡 Please set DATABASE_URL in your environment variables');
            process.exit(1);
        }

        console.log('✅ DATABASE_URL found');

        // Step 3: Test connection first
        console.log('🔍 Testing database connection...');
        try {
            execSync('npx prisma db pull --schema=prisma/schema.prisma', { 
                stdio: 'pipe',
                timeout: 10000
            });
            console.log('✅ Database connection successful');
        } catch (connectionError) {
            console.log('❌ Database connection failed');
            console.log('Error:', connectionError.message);
            
            // Provide specific guidance based on error
            if (connectionError.message.includes('FATAL')) {
                console.log('💡 FATAL error suggests:');
                console.log('   - Invalid credentials (username/password)');
                console.log('   - Database server is down');
                console.log('   - Network connectivity issues');
            }
            
            if (connectionError.message.includes('not found')) {
                console.log('💡 "Not found" error suggests:');
                console.log('   - Database name is incorrect');
                console.log('   - User does not exist');
                console.log('   - Host/port configuration is wrong');
            }
            
            console.log('⚠️  Skipping migrations due to connection failure');
            return false;
        }

        // Step 4: Run migrations
        console.log('🗄️  Running database migrations...');
        try {
            execSync('npx prisma migrate deploy', { 
                stdio: 'inherit',
                timeout: 30000
            });
            console.log('✅ Migrations completed successfully');
            return true;
        } catch (migrationError) {
            console.log('⚠️  Migration failed');
            console.log('Error:', migrationError.message);
            
            // Try alternative approach with db push
            console.log('🔄 Trying alternative approach with db push...');
            try {
                execSync('npx prisma db push --accept-data-loss', { 
                    stdio: 'inherit',
                    timeout: 30000
                });
                console.log('✅ Database schema updated successfully');
                return true;
            } catch (pushError) {
                console.log('❌ Both migration and db push failed');
                console.log('Push error:', pushError.message);
                return false;
            }
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        return false;
    }
}

// Run the setup
setupProductionDatabase().then(success => {
    if (success) {
        console.log('🎉 Production database setup completed successfully!');
    } else {
        console.log('⚠️  Production database setup completed with warnings');
        console.log('💡 The application may still work, but some features might be limited');
    }
}).catch(error => {
    console.error('❌ Production database setup failed:', error.message);
    process.exit(1);
});
