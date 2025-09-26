#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos a limpiar (excluyendo scripts y documentación)
const filesToClean = [
    'app/dashboard/schedule/page.tsx',
    'app/dashboard/schedule/calendar/page.tsx',
    'components/forms/worker-form.tsx',
    'app/api/workers/available/route.ts',
    'app/api/workers/technicians/route.ts',
    'app/api/jobs/[id]/route.ts',
    'components/quote/quote-preview.tsx'
];

// Patrones de console.log a eliminar (desarrollo/debug)
const patternsToRemove = [
    /console\.log\([^)]*\);?\s*/g,
    /console\.debug\([^)]*\);?\s*/g,
    /console\.info\([^)]*\);?\s*/g,
    // Mantener console.error y console.warn
];

// Patrones de console.log a mantener (importantes)
const patternsToKeep = [
    /console\.error\([^)]*\);?\s*/g,
    /console\.warn\([^)]*\);?\s*/g,
];

function cleanFile(filePath) {
    try {
        const fullPath = path.join(process.cwd(), filePath);

        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  Archivo no encontrado: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        // Eliminar console.log de desarrollo
        patternsToRemove.forEach(pattern => {
            content = content.replace(pattern, '');
        });

        // Limpiar líneas vacías múltiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Limpiado: ${filePath}`);
        } else {
            console.log(`ℹ️  Sin cambios: ${filePath}`);
        }

    } catch (error) {
        console.error(`❌ Error limpiando ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🧹 Limpiando console.log de desarrollo...\n');

    filesToClean.forEach(cleanFile);

    console.log('\n✅ Limpieza completada');
    console.log('ℹ️  Se mantuvieron console.error y console.warn importantes');
}

main();
