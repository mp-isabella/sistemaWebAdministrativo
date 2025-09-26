#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building for local development...');

try {
    // Step 1: Use local schema for development
    console.log('📝 Using local SQLite schema...');

    // Copy local schema to main schema
    const localSchemaPath = path.join(process.cwd(), 'prisma/schema.local.prisma');
    const mainSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');

    if (fs.existsSync(localSchemaPath)) {
        fs.copyFileSync(localSchemaPath, mainSchemaPath);
        console.log('✅ Local schema applied');
    } else {
        console.log('⚠️  Local schema not found, using main schema');
    }

    // Step 2: Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

    // Step 3: Push database schema
    console.log('🗄️  Pushing database schema...');
    execSync('npx prisma db push', {
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

    // Step 4: Build Next.js
    console.log('🏗️  Building Next.js application...');
    execSync('npx next build', {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=4096',
            NEXT_TELEMETRY_DISABLED: '1'
        }
    });

    console.log('✅ Local build completed successfully!');

} catch (error) {
    console.error('❌ Local build failed:', error.message);

    // Restore original schema
    const originalSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const backupSchemaPath = path.join(process.cwd(), 'prisma/schema.backup');

    if (fs.existsSync(backupSchemaPath)) {
        fs.copyFileSync(backupSchemaPath, originalSchemaPath);
        console.log('🔄 Restored original schema');
    }

    process.exit(1);
}
