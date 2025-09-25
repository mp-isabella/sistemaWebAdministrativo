#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        }
    });
}

console.log('🔍 Verifying database configuration...');

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Please set DATABASE_URL in your Vercel environment variables');
    console.log('   Format: postgresql://username:password@host:port/database');
    process.exit(1);
}

console.log('✅ DATABASE_URL is set');

// Validate DATABASE_URL format
if (!databaseUrl.startsWith('postgresql://')) {
    console.log('❌ DATABASE_URL format is incorrect');
    console.log('💡 Should start with postgresql://');
    console.log('   Current format:', databaseUrl.substring(0, 20) + '...');
    process.exit(1);
}

console.log('✅ DATABASE_URL format is correct');

// Test database connection
try {
    console.log('🔗 Testing database connection...');
    execSync('npx prisma db pull --schema=prisma/schema.prisma', {
        stdio: 'pipe',
        timeout: 15000
    });
    console.log('✅ Database connection successful');
} catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error.message);

    if (error.message.includes('FATAL')) {
        console.log('💡 This is likely a credentials or permissions issue');
        console.log('   Please verify:');
        console.log('   - Username and password are correct');
        console.log('   - Database exists and is accessible');
        console.log('   - User has proper permissions');
    }

    if (error.message.includes('not found')) {
        console.log('💡 This suggests the database or user does not exist');
        console.log('   Please verify:');
        console.log('   - Database name is correct');
        console.log('   - User exists in the database');
        console.log('   - Host and port are correct');
    }

    process.exit(1);
}

console.log('🎉 Database configuration is valid!');
