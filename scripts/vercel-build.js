#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Vercel build process...');

try {
    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 2: Check if DATABASE_URL is available
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
        console.log('🗄️  DATABASE_URL found, running migrations...');
        try {
            execSync('npx prisma migrate deploy', { stdio: 'inherit' });
            console.log('✅ Migrations completed successfully');
        } catch (error) {
            console.log('⚠️  Migration failed, but continuing with build...');
            console.log('Error:', error.message);
        }
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
