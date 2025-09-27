#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildSimple() {
    console.log('🚀 Starting simple production build process...');

    try {
        // Step 1: Clean previous builds
        console.log('🧹 Cleaning previous builds...');
        if (fs.existsSync('.next')) {
            execSync('rm -rf .next', { stdio: 'inherit' });
        }

        // Step 2: Use production schema
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

        // Step 3: Generate Prisma Client
        console.log('📦 Generating Prisma Client...');
        execSync('npx prisma generate', {
            stdio: 'inherit',
            timeout: 30000
        });
        console.log('✅ Prisma Client generated successfully');

        // Step 4: Skip database migrations (handle at runtime)
        console.log('⚠️  Skipping database migrations - will be handled at runtime');
        console.log('💡 This avoids connection pooling issues during build');

        // Step 5: Use production Next.js config
        console.log('⚙️  Setting up production Next.js configuration...');
        const productionConfig = path.join(__dirname, '..', 'next.config.production.js');
        const defaultConfig = path.join(__dirname, '..', 'next.config.js');

        if (fs.existsSync(productionConfig)) {
            // Backup original config
            if (fs.existsSync(defaultConfig)) {
                fs.copyFileSync(defaultConfig, defaultConfig + '.backup');
            }
            // Use production config
            fs.copyFileSync(productionConfig, defaultConfig);
            console.log('✅ Using production Next.js configuration');
        }

        // Step 6: Build Next.js application
        console.log('🏗️  Building Next.js application...');
        execSync('npx next build', {
            stdio: 'inherit',
            timeout: 300000 // 5 minutes
        });
        console.log('✅ Next.js build completed successfully');

        // Step 7: Verify build output
        console.log('🔍 Verifying build output...');
        if (!fs.existsSync('.next')) {
            throw new Error('Build output directory not found');
        }
        console.log('✅ .next directory created successfully');

        // Step 8: Check bundle size
        console.log('📊 Checking bundle size...');
        const buildManifest = path.join('.next', 'build-manifest.json');
        if (fs.existsSync(buildManifest)) {
            const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
            const pageCount = Object.keys(manifest.pages || {}).length;
            console.log(`📦 Build manifest contains ${pageCount} pages`);
        }

        console.log('✅ Simple build completed successfully');
        console.log('🚀 Ready for Vercel deployment!');
        return true;

    } catch (error) {
        console.error('❌ Simple build failed:', error.message);
        return false;
    }
}

// Run the build
buildSimple()
    .then(success => {
        if (success) {
            console.log('✅ Simple production build completed successfully');
            process.exit(0);
        } else {
            console.log('❌ Simple production build failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Simple production build error:', error);
        process.exit(1);
    });
