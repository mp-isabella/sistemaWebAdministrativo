#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function verifyDeploymentReadiness() {
    console.log('🔍 Verifying deployment readiness...');

    const issues = [];
    const warnings = [];

    try {
        // 1. Check if production schema exists
        const productionSchema = path.join(process.cwd(), 'prisma', 'schema.production.prisma');
        if (!fs.existsSync(productionSchema)) {
            issues.push('❌ Production schema not found: prisma/schema.production.prisma');
        } else {
            console.log('✅ Production schema exists');
        }

        // 2. Check if production build script exists
        const buildScript = path.join(process.cwd(), 'scripts', 'vercel-build-production.js');
        if (!fs.existsSync(buildScript)) {
            issues.push('❌ Production build script not found: scripts/vercel-build-production.js');
        } else {
            console.log('✅ Production build script exists');
        }

        // 3. Check if production migration script exists
        const migrateScript = path.join(process.cwd(), 'scripts', 'vercel-migrate-production.js');
        if (!fs.existsSync(migrateScript)) {
            issues.push('❌ Production migration script not found: scripts/vercel-migrate-production.js');
        } else {
            console.log('✅ Production migration script exists');
        }

        // 4. Check if production Next.js config exists
        const nextConfig = path.join(process.cwd(), 'next.config.production.js');
        if (!fs.existsSync(nextConfig)) {
            issues.push('❌ Production Next.js config not found: next.config.production.js');
        } else {
            console.log('✅ Production Next.js config exists');
        }

        // 5. Check vercel.json configuration
        const vercelConfig = path.join(process.cwd(), 'vercel.json');
        if (fs.existsSync(vercelConfig)) {
            const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
            if (config.buildCommand !== 'node scripts/vercel-build-production.js') {
                warnings.push('⚠️  Vercel build command might not be using production script');
            } else {
                console.log('✅ Vercel configuration is correct');
            }
        } else {
            issues.push('❌ vercel.json not found');
        }

        // 6. Check API routes for dynamic configuration
        const apiFiles = glob.sync('app/api/**/route.ts', { cwd: process.cwd() });
        let routesWithSession = 0;
        let routesWithDynamic = 0;

        for (const file of apiFiles) {
            const filePath = path.join(process.cwd(), file);
            const content = fs.readFileSync(filePath, 'utf8');

            if (content.includes('getServerSession')) {
                routesWithSession++;
                if (content.includes('export const dynamic')) {
                    routesWithDynamic++;
                }
            }
        }

        console.log(`📊 API Routes Analysis:`);
        console.log(`   - Total API routes: ${apiFiles.length}`);
        console.log(`   - Routes using getServerSession: ${routesWithSession}`);
        console.log(`   - Routes with dynamic export: ${routesWithDynamic}`);

        if (routesWithSession > routesWithDynamic) {
            warnings.push(`⚠️  ${routesWithSession - routesWithDynamic} API routes use getServerSession but don't have dynamic export`);
        } else {
            console.log('✅ All API routes with getServerSession have dynamic export');
        }

        // 7. Check environment variables template
        const envTemplate = path.join(process.cwd(), 'env.production.example');
        if (!fs.existsSync(envTemplate)) {
            issues.push('❌ Environment variables template not found: env.production.example');
        } else {
            console.log('✅ Environment variables template exists');
        }

        // 8. Check for potential issues in production schema
        if (fs.existsSync(productionSchema)) {
            const schemaContent = fs.readFileSync(productionSchema, 'utf8');
            if (schemaContent.includes('provider = "sqlite"')) {
                issues.push('❌ Production schema still uses SQLite instead of PostgreSQL');
            } else if (schemaContent.includes('provider = "postgresql"')) {
                console.log('✅ Production schema uses PostgreSQL');
            }
        }

        // 9. Check for console.log statements in production files
        const productionFiles = [
            'scripts/vercel-build-production.js',
            'scripts/vercel-migrate-production.js',
            'next.config.production.js'
        ];

        for (const file of productionFiles) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const consoleLogs = (content.match(/console\.log/g) || []).length;
                if (consoleLogs > 0) {
                    console.log(`✅ ${file} has ${consoleLogs} console.log statements (expected for build scripts)`);
                }
            }
        }

        // Summary
        console.log('\n📋 DEPLOYMENT READINESS SUMMARY:');
        console.log('================================');

        if (issues.length === 0) {
            console.log('🎉 All critical checks passed!');
            console.log('✅ Your deployment should work correctly.');
        } else {
            console.log('❌ Critical issues found:');
            issues.forEach(issue => console.log(`   ${issue}`));
        }

        if (warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            warnings.forEach(warning => console.log(`   ${warning}`));
        }

        // Additional recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('===================');
        console.log('1. Ensure DATABASE_URL is set in Vercel environment variables');
        console.log('2. Verify your PostgreSQL database is accessible from Vercel');
        console.log('3. Test the deployment in a staging environment first');
        console.log('4. Monitor the build logs for any remaining issues');
        console.log('5. Keep the original schema.prisma as backup for local development');

        return issues.length === 0;

    } catch (error) {
        console.error('❌ Error during verification:', error);
        return false;
    }
}

// Run verification
verifyDeploymentReadiness()
    .then(success => {
        if (success) {
            console.log('\n✅ Deployment readiness verification completed successfully');
            process.exit(0);
        } else {
            console.log('\n❌ Deployment readiness verification found issues');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Verification error:', error);
        process.exit(1);
    });
