#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing production setup locally...');

async function testProductionSetup() {
    const results = {
        config: false,
        dependencies: false,
        build: false,
        database: false
    };

    try {
        // Test 1: Configuration
        console.log('\n1️⃣  Testing configuration...');
        try {
            execSync('node scripts/verify-production-config.js', { stdio: 'pipe' });
            console.log('✅ Configuration test passed');
            results.config = true;
        } catch (error) {
            console.log('❌ Configuration test failed');
            console.log('💡 Run: npm run verify:production');
        }

        // Test 2: Dependencies
        console.log('\n2️⃣  Testing dependencies...');
        try {
            // Check if node_modules exists
            if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
                console.log('✅ node_modules found');

                // Check for heavy dependencies
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                const heavyDeps = ['puppeteer', 'chart.js', 'framer-motion', 'recharts'];
                const foundHeavy = Object.keys(packageJson.dependencies || {}).filter(dep => heavyDeps.includes(dep));

                if (foundHeavy.length > 0) {
                    console.log(`⚠️  Found ${foundHeavy.length} heavy dependencies: ${foundHeavy.join(', ')}`);
                    console.log('💡 Consider running: npm run optimize:deps');
                } else {
                    console.log('✅ No heavy dependencies found');
                }

                results.dependencies = true;
            } else {
                console.log('❌ node_modules not found');
                console.log('💡 Run: npm install');
            }
        } catch (error) {
            console.log('❌ Dependencies test failed');
        }

        // Test 3: Build
        console.log('\n3️⃣  Testing build process...');
        try {
            // Clean previous build
            try {
                execSync('rm -rf .next', { stdio: 'pipe' });
            } catch (error) {
                // Ignore if .next doesn't exist
            }

            // Test Prisma generation
            console.log('📦 Testing Prisma generation...');
            execSync('npx prisma generate', { stdio: 'pipe' });
            console.log('✅ Prisma generation successful');

            // Test build (with timeout)
            console.log('🏗️  Testing Next.js build...');
            execSync('npx next build', {
                stdio: 'pipe',
                timeout: 300000, // 5 minutes
                env: {
                    ...process.env,
                    NODE_OPTIONS: '--max-old-space-size=4096',
                    NEXT_TELEMETRY_DISABLED: '1'
                }
            });
            console.log('✅ Build test passed');
            results.build = true;

        } catch (error) {
            console.log('❌ Build test failed');
            console.log('Error:', error.message);

            if (error.message.includes('P3019')) {
                console.log('💡 P3019 error detected - run: npm run optimize:deps');
            }
        }

        // Test 4: Database (if DATABASE_URL is set)
        console.log('\n4️⃣  Testing database connection...');
        if (process.env.DATABASE_URL) {
            try {
                execSync('node scripts/vercel-database-test.js', { stdio: 'pipe' });
                console.log('✅ Database connection successful');
                results.database = true;
            } catch (error) {
                console.log('❌ Database connection failed');
                console.log('💡 Check your DATABASE_URL environment variable');
            }
        } else {
            console.log('⚠️  DATABASE_URL not set, skipping database test');
            console.log('💡 Set DATABASE_URL for database testing');
        }

        // Summary
        console.log('\n📊 Test Results Summary:');
        console.log(`   Configuration: ${results.config ? '✅' : '❌'}`);
        console.log(`   Dependencies: ${results.dependencies ? '✅' : '❌'}`);
        console.log(`   Build: ${results.build ? '✅' : '❌'}`);
        console.log(`   Database: ${results.database ? '✅' : '⚠️'}`);

        const allPassed = results.config && results.dependencies && results.build;

        if (allPassed) {
            console.log('\n🎉 Production setup test completed successfully!');
            console.log('🚀 Ready for Vercel deployment!');
            console.log('\n📋 Next steps:');
            console.log('1. Set DATABASE_URL in Vercel environment variables');
            console.log('2. Set NEXTAUTH_URL and NEXTAUTH_SECRET in Vercel');
            console.log('3. Deploy to Vercel: vercel --prod');
        } else {
            console.log('\n⚠️  Some tests failed. Please fix the issues before deploying.');
            console.log('\n🔧 Common fixes:');
            console.log('   - Run: npm run verify:production');
            console.log('   - Run: npm run optimize:deps');
            console.log('   - Run: npm install');
            console.log('   - Set DATABASE_URL environment variable');
        }

        return allPassed;

    } catch (error) {
        console.error('❌ Test setup failed:', error.message);
        return false;
    }
}

// Run the test
testProductionSetup()
    .then(success => {
        if (success) {
            console.log('\n✅ All tests passed! Ready for production.');
            process.exit(0);
        } else {
            console.log('\n❌ Some tests failed. Please fix issues before deploying.');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Test error:', error);
        process.exit(1);
    });
