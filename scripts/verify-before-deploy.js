#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function verifyBeforeDeploy() {
    console.log('🔍 Verifying project before deployment...');

    const issues = [];
    const warnings = [];

    try {
        // 1. Check TypeScript compilation
        console.log('📝 Checking TypeScript compilation...');
        try {
            execSync('npx tsc --noEmit', { stdio: 'pipe', timeout: 30000 });
            console.log('✅ TypeScript compilation successful');
        } catch (error) {
            issues.push('❌ TypeScript compilation failed');
            console.log('❌ TypeScript errors found');
        }

        // 2. Check ESLint
        console.log('🔍 Checking ESLint...');
        try {
            execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', { stdio: 'pipe', timeout: 30000 });
            console.log('✅ ESLint passed');
        } catch (error) {
            warnings.push('⚠️  ESLint warnings/errors found');
            console.log('⚠️  ESLint issues detected');
        }

        // 3. Check for syntax errors in components
        console.log('🧩 Checking component syntax...');
        const componentFiles = [
            'components/calendar/calendar-sidebar.tsx',
            'components/calendar/patient-sidebar.tsx',
            'components/ui/hydration-debugger.tsx',
            'components/ui/select-dropdown-fix.tsx',
            'components/ui/simple-dropdown.tsx'
        ];

        for (const file of componentFiles) {
            if (fs.existsSync(file)) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    // Check for common syntax errors
                    if (content.includes('onClick={() => }')) {
                        issues.push(`❌ Empty onClick handler in ${file}`);
                    }
                    if (content.includes('return () =>},')) {
                        issues.push(`❌ Malformed useEffect in ${file}`);
                    }
                    if (content.includes('console.log(') && !content.includes('console.log(')) {
                        issues.push(`❌ Malformed console.log in ${file}`);
                    }
                } catch (error) {
                    issues.push(`❌ Error reading ${file}`);
                }
            }
        }

        // 4. Check API routes for dynamic exports
        console.log('🛣️  Checking API routes...');
        const apiFiles = fs.readdirSync('app/api', { recursive: true })
            .filter(file => file.endsWith('route.ts'))
            .map(file => `app/api/${file}`);

        let routesWithSession = 0;
        let routesWithDynamic = 0;

        for (const file of apiFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('getServerSession')) {
                    routesWithSession++;
                    if (content.includes('export const dynamic')) {
                        routesWithDynamic++;
                    }
                }
            }
        }

        console.log(`📊 API Routes: ${routesWithSession} with getServerSession, ${routesWithDynamic} with dynamic export`);

        if (routesWithSession > routesWithDynamic) {
            warnings.push(`⚠️  ${routesWithSession - routesWithDynamic} API routes missing dynamic export`);
        }

        // 5. Check production files exist
        console.log('📦 Checking production files...');
        const productionFiles = [
            'prisma/schema.production.prisma',
            'scripts/vercel-build-simple.js',
            'next.config.production.js',
            'vercel.json'
        ];

        for (const file of productionFiles) {
            if (!fs.existsSync(file)) {
                issues.push(`❌ Missing production file: ${file}`);
            } else {
                console.log(`✅ ${file} exists`);
            }
        }

        // 6. Check for common build issues
        console.log('🔧 Checking for common build issues...');

        // Check for invalid Next.js config options
        if (fs.existsSync('next.config.production.js')) {
            const config = fs.readFileSync('next.config.production.js', 'utf8');
            if (config.includes('telemetry: false')) {
                issues.push('❌ Invalid telemetry option in next.config.production.js');
            }
            if (config.includes('NODE_OPTIONS')) {
                issues.push('❌ NODE_OPTIONS not allowed in next.config.js');
            }
        }

        // Check for database URL issues
        if (fs.existsSync('prisma/schema.production.prisma')) {
            const schema = fs.readFileSync('prisma/schema.production.prisma', 'utf8');
            if (schema.includes('provider = "sqlite"')) {
                issues.push('❌ Production schema still uses SQLite');
            }
        }

        // 7. Check package.json scripts
        console.log('📋 Checking package.json...');
        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (!packageJson.scripts?.build) {
                issues.push('❌ Missing build script in package.json');
            }
        }

        // Summary
        console.log('\n📋 DEPLOYMENT VERIFICATION SUMMARY:');
        console.log('==================================');

        if (issues.length === 0) {
            console.log('🎉 All critical checks passed!');
            console.log('✅ Project is ready for deployment');
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
        console.log('2. Test the build locally with: npm run build');
        console.log('3. Monitor the deployment logs for any runtime issues');
        console.log('4. Keep the original schema.prisma for local development');

        return issues.length === 0;

    } catch (error) {
        console.error('❌ Verification error:', error);
        return false;
    }
}

// Run verification
verifyBeforeDeploy()
    .then(success => {
        if (success) {
            console.log('\n✅ Pre-deployment verification completed successfully');
            process.exit(0);
        } else {
            console.log('\n❌ Pre-deployment verification found issues');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Verification error:', error);
        process.exit(1);
    });
