#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Vercel Production...');

async function deployToProduction() {
    try {
        // Step 1: Verificar que estamos en el directorio correcto
        console.log('📁 Verifying project structure...');
        if (!fs.existsSync('package.json')) {
            throw new Error('No package.json found. Are you in the correct directory?');
        }

        // Step 2: Verificar que Vercel CLI está instalado
        console.log('🔧 Checking Vercel CLI...');
        try {
            execSync('vercel --version', { stdio: 'pipe' });
            console.log('✅ Vercel CLI found');
        } catch (error) {
            console.log('❌ Vercel CLI not found');
            console.log('💡 Install with: npm i -g vercel');
            return false;
        }

        // Step 3: Verificar variables de entorno
        console.log('🔍 Checking environment variables...');
        const requiredVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
        const missingVars = [];

        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        }

        if (missingVars.length > 0) {
            console.log('❌ Missing required environment variables:');
            missingVars.forEach(varName => {
                console.log(`   - ${varName}`);
            });
            console.log('\n💡 Please set these variables in Vercel Dashboard:');
            console.log('   1. Go to your project in Vercel Dashboard');
            console.log('   2. Settings → Environment Variables');
            console.log('   3. Add the missing variables');
            return false;
        }

        console.log('✅ All required environment variables are set');

        // Step 4: Build local test
        console.log('🏗️  Testing local build...');
        try {
            execSync('npm run build:local', { stdio: 'inherit' });
            console.log('✅ Local build successful');
        } catch (error) {
            console.log('❌ Local build failed');
            console.log('💡 Fix build errors before deploying');
            return false;
        }

        // Step 5: Deploy to Vercel
        console.log('🌐 Deploying to Vercel...');
        try {
            execSync('vercel --prod', {
                stdio: 'inherit',
                timeout: 600000 // 10 minutes
            });
            console.log('✅ Deploy successful!');
        } catch (error) {
            console.log('❌ Deploy failed');
            console.log('Error:', error.message);
            return false;
        }

        // Step 6: Verificar deploy
        console.log('🔍 Verifying deployment...');
        console.log('✅ Deployment completed successfully!');
        console.log('\n🎉 Your application is now live on Vercel!');
        console.log('\n📋 Next steps:');
        console.log('1. Test the login functionality');
        console.log('2. Verify all CRUD operations work');
        console.log('3. Check that database operations work');
        console.log('4. Test PDF generation');
        console.log('5. Verify all dashboard features');

        return true;

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        return false;
    }
}

// Ejecutar deploy
deployToProduction()
    .then(success => {
        if (success) {
            console.log('\n✅ Production deployment completed!');
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
