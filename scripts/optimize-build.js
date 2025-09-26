#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Optimizing build for Vercel deployment...');

// Dependencies to remove to reduce bundle size
const heavyDependencies = [
    'puppeteer',
    'chart.js',
    'react-chartjs-2',
    'recharts',
    'framer-motion',
    'embla-carousel-react',
    'react-resizable-panels',
    'pdfkit',
    'xlsx',
    'cloudinary',
    'critters',
    'vaul'
];

// Dependencies to keep but optimize
const optimizeDependencies = [
    '@radix-ui/react-accordion',
    '@radix-ui/react-aspect-ratio',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-slider',
    '@radix-ui/react-toggle-group'
];

function optimizePackageJson() {
    console.log('📦 Optimizing package.json...');

    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Remove heavy dependencies
    heavyDependencies.forEach(dep => {
        if (packageJson.dependencies[dep]) {
            delete packageJson.dependencies[dep];
            console.log(`   ❌ Removed heavy dependency: ${dep}`);
        }
    });

    // Remove optimize dependencies that might not be needed
    optimizeDependencies.forEach(dep => {
        if (packageJson.dependencies[dep]) {
            delete packageJson.dependencies[dep];
            console.log(`   ⚠️  Removed potentially unused dependency: ${dep}`);
        }
    });

    // Write optimized package.json
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('   ✅ package.json optimized');
}

function createOptimizedNextConfig() {
    console.log('⚙️  Creating optimized Next.js config...');

    const optimizedConfigPath = path.join(process.cwd(), 'next.config.optimized-build.js');
    const currentConfigPath = path.join(process.cwd(), 'next.config.js');

    // Copy optimized config to main config
    if (fs.existsSync(optimizedConfigPath)) {
        fs.copyFileSync(optimizedConfigPath, currentConfigPath);
        console.log('   ✅ Next.js config optimized');
    }
}

function createBuildOptimizationScript() {
    console.log('📝 Creating build optimization script...');

    const scriptContent = `#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting optimized Vercel build process...');

// Set memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

try {
    // Step 1: Clean node_modules and reinstall optimized dependencies
    console.log('🧹 Cleaning and reinstalling dependencies...');
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
    execSync('npm install', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

    // Step 2: Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    execSync('npx prisma generate', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

    // Step 3: Check database connection (skip if not available)
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        console.log('🗄️  DATABASE_URL found, testing connection...');
        try {
            execSync('npx prisma db pull --schema=prisma/schema.prisma', {
                stdio: 'pipe',
                timeout: 10000
            });
            console.log('✅ Database connection successful');
        } catch (error) {
            console.log('⚠️  Database connection failed, continuing with build...');
        }
    } else {
        console.log('⚠️  DATABASE_URL not found, skipping database operations...');
    }

    // Step 4: Build Next.js application with optimizations
    console.log('🏗️  Building Next.js application with optimizations...');
    execSync('npx next build', { 
        stdio: 'inherit',
        env: { 
            ...process.env, 
            NODE_OPTIONS: '--max-old-space-size=4096',
            NEXT_TELEMETRY_DISABLED: '1'
        }
    });

    console.log('✅ Optimized build completed successfully!');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    
    if (error.message.includes('P3019') || error.message.includes('memory') || error.message.includes('size')) {
        console.log('💡 P3019 Error - Build size/memory limit exceeded');
        console.log('   Additional solutions:');
        console.log('   1. Remove unused components and pages');
        console.log('   2. Use dynamic imports for large components');
        console.log('   3. Optimize images and assets');
        console.log('   4. Consider using Vercel Pro plan for higher limits');
    }
    
    process.exit(1);
}`;

    fs.writeFileSync(path.join(process.cwd(), 'scripts/vercel-build-optimized.mjs'), scriptContent);
    console.log('   ✅ Build optimization script created');
}

function updateVercelConfig() {
    console.log('🔧 Updating Vercel configuration...');

    const vercelConfig = {
        "buildCommand": "npm run vercel-build-optimized",
        "installCommand": "npm install",
        "framework": "nextjs",
        "regions": ["iad1"],
        "functions": {
            "app/api/**/*.ts": {
                "maxDuration": 30,
                "memory": 1024
            }
        },
        "build": {
            "env": {
                "NODE_OPTIONS": "--max-old-space-size=4096"
            }
        }
    };

    fs.writeFileSync(
        path.join(process.cwd(), 'vercel.json'),
        JSON.stringify(vercelConfig, null, 2)
    );

    console.log('   ✅ Vercel configuration updated');
}

function updatePackageScripts() {
    console.log('📝 Updating package.json scripts...');

    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Add optimized build script
    packageJson.scripts['vercel-build-optimized'] = 'node scripts/vercel-build-optimized.mjs';
    packageJson.scripts['build:optimized'] = 'npm run vercel-build-optimized';

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('   ✅ Package scripts updated');
}

// Run optimizations
try {
    optimizePackageJson();
    createOptimizedNextConfig();
    createBuildOptimizationScript();
    updateVercelConfig();
    updatePackageScripts();

    console.log('');
    console.log('🎉 Build optimization completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Test locally: npm run build:optimized');
    console.log('3. Deploy to Vercel with the optimized configuration');
    console.log('');
    console.log('💡 The P3019 error should be resolved with these optimizations.');

} catch (error) {
    console.error('❌ Optimization failed:', error.message);
    process.exit(1);
}
