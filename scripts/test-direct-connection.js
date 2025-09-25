#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Testing direct Supabase connection...');

// Set the correct DATABASE_URL directly
process.env.DATABASE_URL = 'postgresql://postgres:amesticaportal@db.rwsqkirgxsxrpjepjhtr.supabase.co:5432/postgres';

console.log('✅ DATABASE_URL set to:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Parse the DATABASE_URL to extract components
try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('📊 Connection details:');
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Username:', url.username);
    console.log('   Password:', url.password ? '***' + url.password.slice(-3) : 'Not set');
} catch (error) {
    console.log('❌ Invalid DATABASE_URL format');
    console.log('Error:', error.message);
    process.exit(1);
}

// Test database connection with detailed error handling
try {
    console.log('🔗 Testing database connection...');
    execSync('npx prisma db pull --schema=prisma/schema.prisma', {
        stdio: 'pipe',
        timeout: 15000
    });
    console.log('✅ Database connection successful');
    console.log('🎉 Your Supabase configuration is working correctly!');
} catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error message:', error.message);

    // Specific error handling for Supabase
    if (error.message.includes('FATAL: Tenant or user not found')) {
        console.log('💡 Supabase authentication error detected');
        console.log('   This usually means:');
        console.log('   1. The password is incorrect');
        console.log('   2. The project reference is wrong');
        console.log('   3. The database user does not exist');
        console.log('');
        console.log('🔧 Solutions:');
        console.log('   1. Verify your Supabase project password');
        console.log('   2. Check the project reference in the URL');
        console.log('   3. Ensure the database is active in Supabase');
    } else if (error.message.includes('FATAL: password authentication failed')) {
        console.log('💡 Password authentication failed');
        console.log('   The password "amesticaportal" might be incorrect');
        console.log('   Please verify the correct password in Supabase dashboard');
    } else if (error.message.includes('FATAL: database') && error.message.includes('does not exist')) {
        console.log('💡 Database does not exist');
        console.log('   The database name in the URL might be incorrect');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.log('💡 Network connection error');
        console.log('   The hostname or port might be incorrect');
        console.log('   Please verify the Supabase connection details');
    }

    console.log('');
    console.log('🔧 To fix this:');
    console.log('   1. Go to Supabase Dashboard → Settings → Database');
    console.log('   2. Copy the exact connection string');
    console.log('   3. Update DATABASE_URL in Vercel with the correct string');
    console.log('   4. Make sure the password is exactly as shown in Supabase');

    process.exit(1);
}
