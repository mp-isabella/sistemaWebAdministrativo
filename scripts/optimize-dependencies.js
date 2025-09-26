#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Optimizing dependencies for production...');

// Dependencies that are heavy and can be optimized
const heavyDependencies = [
    'puppeteer', // 24MB+ - only needed for PDF generation
    'chart.js', // 2MB+ - can be replaced with lighter alternatives
    'react-chartjs-2', // 500KB+ - depends on chart.js
    'framer-motion', // 1.5MB+ - only needed for animations
    'recharts', // 1MB+ - alternative to chart.js
    'embla-carousel-react', // 500KB+ - only needed for carousels
    'pdfkit', // 2MB+ - alternative to puppeteer
    'xlsx', // 1MB+ - only needed for Excel export
    'cloudinary', // 1MB+ - only needed for image upload
    'puppeteer-core' // 15MB+ - core of puppeteer
];

// Dependencies that should be kept
const essentialDependencies = [
    '@prisma/client',
    'next',
    'react',
    'react-dom',
    'next-auth',
    'bcryptjs',
    'tailwindcss',
    'lucide-react',
    'class-variance-authority',
    'clsx',
    'tailwind-merge'
];

function analyzePackageJson() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    console.log('📊 Analyzing package.json...');

    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    console.log(`📦 Total dependencies: ${dependencies.length}`);
    console.log(`🔧 Total dev dependencies: ${devDependencies.length}`);

    // Find heavy dependencies
    const foundHeavy = dependencies.filter(dep => heavyDependencies.includes(dep));
    const foundEssential = dependencies.filter(dep => essentialDependencies.includes(dep));

    console.log('\n🔍 Heavy dependencies found:');
    foundHeavy.forEach(dep => {
        console.log(`   ⚠️  ${dep} - Consider removing or replacing`);
    });

    console.log('\n✅ Essential dependencies found:');
    foundEssential.forEach(dep => {
        console.log(`   ✅ ${dep} - Keep`);
    });

    // Calculate potential savings
    const potentialSavings = foundHeavy.length;
    console.log(`\n💡 Potential optimization: Remove ${potentialSavings} heavy dependencies`);

    return {
        heavy: foundHeavy,
        essential: foundEssential,
        total: dependencies.length
    };
}

function generateOptimizedPackageJson() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    console.log('📝 Generating optimized package.json...');

    // Create a backup
    const backupPath = path.join(process.cwd(), 'package.json.backup');
    fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
    console.log(`💾 Backup created: ${backupPath}`);

    // Remove heavy dependencies
    const optimizedDependencies = { ...packageJson.dependencies };
    heavyDependencies.forEach(dep => {
        if (optimizedDependencies[dep]) {
            delete optimizedDependencies[dep];
            console.log(`🗑️  Removed: ${dep}`);
        }
    });

    // Create optimized package.json
    const optimizedPackageJson = {
        ...packageJson,
        dependencies: optimizedDependencies
    };

    // Save optimized version
    const optimizedPath = path.join(process.cwd(), 'package-optimized.json');
    fs.writeFileSync(optimizedPath, JSON.stringify(optimizedPackageJson, null, 2));
    console.log(`📝 Optimized package.json created: ${optimizedPath}`);

    return optimizedPath;
}

function generateMigrationGuide() {
    const guide = `
# Guía de Optimización de Dependencias

## Dependencias Removidas
${heavyDependencies.map(dep => `- ${dep}`).join('\n')}

## Alternativas Recomendadas

### Para PDFs (reemplazar puppeteer):
\`\`\`bash
npm install jspdf html2canvas
\`\`\`

### Para Gráficos (reemplazar chart.js):
\`\`\`bash
# Usar CSS puro o librerías más ligeras
npm install recharts
# O usar CSS Grid/Flexbox para gráficos simples
\`\`\`

### Para Animaciones (reemplazar framer-motion):
\`\`\`bash
# Usar CSS animations o librerías más ligeras
npm install @react-spring/web
# O usar CSS puro con Tailwind
\`\`\`

### Para Carousels (reemplazar embla-carousel):
\`\`\`bash
# Usar CSS puro o implementación simple
# O usar Swiper.js que es más ligero
npm install swiper
\`\`\`

## Implementación

1. **Backup**: Se creó package.json.backup
2. **Optimizado**: Se creó package-optimized.json
3. **Aplicar**: Copia package-optimized.json sobre package.json
4. **Instalar**: npm install
5. **Probar**: npm run build

## Verificación

\`\`\`bash
# Verificar tamaño del bundle
npm run build
npx @next/bundle-analyzer

# Verificar que no hay errores
npm run type-check
npm run lint
\`\`\`
`;

    const guidePath = path.join(process.cwd(), 'DEPENDENCY_OPTIMIZATION_GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    console.log(`📖 Migration guide created: ${guidePath}`);
}

// Main execution
try {
    console.log('🚀 Starting dependency optimization...');

    const analysis = analyzePackageJson();
    const optimizedPath = generateOptimizedPackageJson();
    generateMigrationGuide();

    console.log('\n✅ Dependency optimization completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the optimized package.json');
    console.log('2. Test the application locally');
    console.log('3. Apply optimizations if satisfied');
    console.log('4. Deploy to Vercel');

    console.log(`\n📁 Files created:`);
    console.log(`   - package.json.backup (backup)`);
    console.log(`   - package-optimized.json (optimized)`);
    console.log(`   - DEPENDENCY_OPTIMIZATION_GUIDE.md (guide)`);

} catch (error) {
    console.error('❌ Optimization failed:', error.message);
    process.exit(1);
}
