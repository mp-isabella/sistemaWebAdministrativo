#!/usr/bin/env node

console.log('🔍 Verifying production configuration...');

// Check required environment variables
const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
];

const missingVars = [];
const invalidVars = [];

console.log('📋 Checking required environment variables...');

requiredVars.forEach(varName => {
    const value = process.env[varName];

    if (!value) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: Missing`);
    } else {
        console.log(`✅ ${varName}: Set`);

        // Validate specific formats
        if (varName === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
            invalidVars.push(`${varName}: Should start with 'postgresql://'`);
        }

        if (varName === 'NEXTAUTH_URL' && !value.startsWith('https://')) {
            invalidVars.push(`${varName}: Should start with 'https://'`);
        }

        if (varName === 'NEXTAUTH_SECRET' && value.length < 32) {
            invalidVars.push(`${varName}: Should be at least 32 characters long`);
        }
    }
});

// Check optional variables
const optionalVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FORMSUBMIT_ENDPOINT',
    'WEB3FORMS_ACCESS_KEY'
];

console.log('\n📋 Checking optional environment variables...');

optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: Set`);
    } else {
        console.log(`⚠️  ${varName}: Not set (optional)`);
    }
});

// Check Node.js configuration
console.log('\n📋 Checking Node.js configuration...');

const nodeOptions = process.env.NODE_OPTIONS;
if (nodeOptions && nodeOptions.includes('--max-old-space-size=4096')) {
    console.log('✅ NODE_OPTIONS: Optimized for Vercel');
} else {
    console.log('⚠️  NODE_OPTIONS: Not optimized (should include --max-old-space-size=4096)');
}

const telemetryDisabled = process.env.NEXT_TELEMETRY_DISABLED;
if (telemetryDisabled === '1') {
    console.log('✅ NEXT_TELEMETRY_DISABLED: Disabled (good for production)');
} else {
    console.log('⚠️  NEXT_TELEMETRY_DISABLED: Not set (should be 1 for production)');
}

// Summary
console.log('\n📊 Configuration Summary:');

if (missingVars.length === 0 && invalidVars.length === 0) {
    console.log('✅ All required variables are properly configured!');
    console.log('\n🚀 Ready for production deployment!');
    process.exit(0);
} else {
    console.log('❌ Configuration issues found:');

    if (missingVars.length > 0) {
        console.log('\n🔴 Missing required variables:');
        missingVars.forEach(varName => {
            console.log(`   - ${varName}`);
        });
    }

    if (invalidVars.length > 0) {
        console.log('\n🔴 Invalid variable formats:');
        invalidVars.forEach(error => {
            console.log(`   - ${error}`);
        });
    }

    console.log('\n💡 Please fix these issues before deploying to production.');
    console.log('\n📖 See env.production.example for reference.');
    process.exit(1);
}
