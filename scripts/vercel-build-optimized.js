#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized Vercel build process...');

// Set memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.NEXT_TELEMETRY_DISABLED = '1';

async function optimizeBuild() {
    try {
        // Step 1: Clean previous builds
        console.log('🧹 Cleaning previous builds...');
        try {
            execSync('rm -rf .next', { stdio: 'pipe' });
        } catch (error) {
            // Ignore if .next doesn't exist
        }

        // Step 2: Generate Prisma Client with memory optimization
        console.log('📦 Generating Prisma Client...');
        execSync('npx prisma generate', {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: '--max-old-space-size=4096',
                NEXT_TELEMETRY_DISABLED: '1'
            }
        });

        // Step 3: Database migration (if DATABASE_URL is available)
        const databaseUrl = process.env.DATABASE_URL;
        if (databaseUrl) {
            console.log('🗄️  Running database migration...');
            try {
                execSync('node scripts/vercel-migrate.js', {
                    stdio: 'inherit',
                    timeout: 120000,
                    env: {
                        ...process.env,
                        NODE_OPTIONS: '--max-old-space-size=4096'
                    }
                });
            } catch (error) {
                console.log('⚠️  Database migration failed, but continuing with build...');
                console.log('Error:', error.message);
            }
        } else {
            console.log('⚠️  DATABASE_URL not found, skipping database migration...');
        }

        // Step 4: Build Next.js with optimizations
        console.log('🏗️  Building Next.js application...');

        // Set build environment variables
        const buildEnv = {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=4096',
            NEXT_TELEMETRY_DISABLED: '1',
            NODE_ENV: 'production',
            // Disable source maps to reduce bundle size
            GENERATE_SOURCEMAP: 'false',
            // Optimize for production
            NEXT_PUBLIC_VERCEL_ENV: 'production'
        };

        execSync('npx next build', {
            stdio: 'inherit',
            env: buildEnv,
            timeout: 600000 // 10 minutes timeout
        });

        console.log('✅ Build completed successfully!');

        // Step 5: Verify build output
        console.log('🔍 Verifying build output...');
        const nextDir = path.join(process.cwd(), '.next');
        if (fs.existsSync(nextDir)) {
            console.log('✅ .next directory created successfully');
        } else {
            throw new Error('Build output not found');
        }

        // Step 6: Check bundle size
        console.log('📊 Checking bundle size...');
        try {
            const buildInfo = fs.readFileSync(path.join(nextDir, 'build-manifest.json'), 'utf8');
            const manifest = JSON.parse(buildInfo);
            console.log(`📦 Build manifest contains ${Object.keys(manifest.pages).length} pages`);
        } catch (error) {
            console.log('⚠️  Could not read build manifest');
        }

        return true;

    } catch (error) {
        console.error('❌ Build failed:', error.message);

        // Provide specific guidance for P3019 error
        if (error.message.includes('P3019') || error.message.includes('memory') || error.message.includes('size')) {
            console.log('💡 P3019 Error - Build size/memory limit exceeded');
            console.log('   Solutions:');
            console.log('   1. Check for large dependencies in package.json');
            console.log('   2. Use dynamic imports for heavy components');
            console.log('   3. Optimize images and assets');
            console.log('   4. Remove unused dependencies');
        }

        return false;
    }
}

// Run the optimized build
optimizeBuild()
    .then(success => {
        if (success) {
            console.log('✅ Optimized build completed successfully!');
            console.log('🚀 Ready for Vercel deployment!');
            process.exit(0);
        } else {
            console.log('❌ Optimized build failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Build process error:', error);
        process.exit(1);
    });
