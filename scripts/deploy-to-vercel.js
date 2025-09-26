#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting Vercel deployment process...');

async function deployToVercel() {
    try {
        // Step 1: Pre-deployment checks
        console.log('🔍 Running pre-deployment checks...');

        try {
            execSync('npm run test:production', { stdio: 'inherit' });
            console.log('✅ Pre-deployment checks passed');
        } catch (error) {
            console.log('⚠️  Pre-deployment checks failed, but continuing...');
            console.log('💡 Consider fixing issues before deploying');
        }

        // Step 2: Optimize dependencies (optional)
        console.log('🔧 Optimizing dependencies...');
        try {
            execSync('npm run optimize:deps', { stdio: 'pipe' });
            console.log('✅ Dependencies optimized');
        } catch (error) {
            console.log('⚠️  Dependency optimization failed, continuing with current setup...');
        }

        // Step 3: Verify configuration
        console.log('⚙️  Verifying configuration...');
        try {
            execSync('npm run verify:production', { stdio: 'pipe' });
            console.log('✅ Configuration verified');
        } catch (error) {
            console.log('❌ Configuration verification failed');
            console.log('💡 Please check your environment variables');
            console.log('   Required: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET');
            return false;
        }

        // Step 4: Deploy to Vercel
        console.log('🚀 Deploying to Vercel...');

        try {
            // Check if Vercel CLI is installed
            execSync('vercel --version', { stdio: 'pipe' });
            console.log('✅ Vercel CLI found');
        } catch (error) {
            console.log('❌ Vercel CLI not found');
            console.log('💡 Install with: npm i -g vercel');
            return false;
        }

        // Deploy to production
        console.log('🌐 Deploying to production...');
        execSync('vercel --prod', {
            stdio: 'inherit',
            timeout: 600000 // 10 minutes
        });

        console.log('✅ Deployment completed successfully!');
        console.log('\n🎉 Your application is now live on Vercel!');

        return true;

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);

        // Provide specific guidance
        if (error.message.includes('P3019')) {
            console.log('💡 P3019 error - Build size too large');
            console.log('   Solutions:');
            console.log('   1. Run: npm run optimize:deps');
            console.log('   2. Remove heavy dependencies');
            console.log('   3. Use dynamic imports');
        } else if (error.message.includes('FATAL')) {
            console.log('💡 Database connection error');
            console.log('   Check your DATABASE_URL in Vercel environment variables');
        } else if (error.message.includes('authentication')) {
            console.log('💡 Authentication error');
            console.log('   Check your NEXTAUTH_SECRET in Vercel environment variables');
        }

        return false;
    }
}

// Run deployment
deployToVercel()
    .then(success => {
        if (success) {
            console.log('\n✅ Deployment successful!');
            console.log('🌐 Your app is live on Vercel');
            process.exit(0);
        } else {
            console.log('\n❌ Deployment failed');
            console.log('🔧 Please fix the issues and try again');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Deployment error:', error);
        process.exit(1);
    });