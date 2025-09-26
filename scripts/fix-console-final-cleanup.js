#!/usr/bin/env node

/**
 * Script final para limpiar cualquier declaración de consola restante
 * Enfocado en archivos de respaldo y casos específicos
 */

const fs = require('fs');
const path = require('path');

// Archivos específicos que pueden tener declaraciones de consola
const specificFiles = [
    'app/dashboard/schedule/calendar/page.tsx.backup',
    'app/dashboard/schedule/calendar/page.tsx',
    'app/dashboard/clients/page.tsx',
    'app/dashboard/schedule/page.tsx',
    'app/login/page.tsx',
    'app/dashboard/admin/page.tsx'
];

// Patrones de declaraciones de consola a remover
const consolePatterns = [
    // console.log simple
    /^\s*console\.log\([^)]*\);\s*$/gm,
    // console.log multilínea
    /^\s*console\.log\(\s*[\s\S]*?\);\s*$/gm,
    // console.log con template literals
    /^\s*console\.log\(`[\s\S]*?`\);\s*$/gm,
    // console.log con concatenación
    /^\s*console\.log\([^)]*\+[^)]*\);\s*$/gm,
    // console.info
    /^\s*console\.info\([^)]*\);\s*$/gm,
    // console.debug
    /^\s*console\.debug\([^)]*\);\s*$/gm,
    // console.trace
    /^\s*console\.trace\([^)]*\);\s*$/gm,
    // console.log con múltiples parámetros
    /^\s*console\.log\([^)]*,\s*[^)]*\);\s*$/gm,
    // console.log con objetos
    /^\s*console\.log\(\{[^}]*\}\);\s*$/gm,
    // console.log con arrays
    /^\s*console\.log\(\[[^\]]*\]\);\s*$/gm
];

/**
 * Limpia declaraciones de consola de un archivo
 */
function cleanConsoleStatements(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Archivo no encontrado: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let removedCount = 0;

        // Aplicar cada patrón
        consolePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                removedCount += matches.length;
            }
            content = content.replace(pattern, '');
        });

        // Limpiar líneas vacías múltiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Limpiado ${filePath}: ${removedCount} declaraciones removidas`);
            return true;
        } else {
            console.log(`✅ ${filePath}: Ya está limpio`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error procesando ${filePath}: ${error.message}`);
        return false;
    }
}

/**
 * Busca archivos con declaraciones de consola problemáticas
 */
function findProblematicFiles() {
    const problematicFiles = [];

    specificFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const hasConsole = /console\.(log|info|debug|trace)/.test(content);
            if (hasConsole) {
                problematicFiles.push(file);
            }
        }
    });

    return problematicFiles;
}

/**
 * Función principal
 */
async function main() {
    console.log('🧹 Iniciando limpieza final de declaraciones de consola...\n');

    // Buscar archivos problemáticos
    const problematicFiles = findProblematicFiles();

    if (problematicFiles.length === 0) {
        console.log('✅ No se encontraron archivos con declaraciones de consola problemáticas');
        return;
    }

    console.log(`📋 Encontrados ${problematicFiles.length} archivos con declaraciones de consola:`);
    problematicFiles.forEach(file => console.log(`   • ${file}`));
    console.log('');

    // Limpiar cada archivo
    let cleanedCount = 0;
    problematicFiles.forEach(file => {
        if (cleanConsoleStatements(file)) {
            cleanedCount++;
        }
    });

    console.log(`\n🎉 Limpieza completada! ${cleanedCount} archivos procesados`);

    // Verificación final
    console.log('\n🔍 Verificando estado final...');
    const finalCheck = findProblematicFiles();

    if (finalCheck.length === 0) {
        console.log('✅ Todos los archivos han sido limpiados correctamente');
    } else {
        console.log(`⚠️  Aún quedan ${finalCheck.length} archivos con declaraciones problemáticas:`);
        finalCheck.forEach(file => console.log(`   • ${file}`));
    }

    console.log('\n💡 Recomendaciones:');
    console.log('   • Usa console.error solo para errores críticos');
    console.log('   • Usa console.warn para advertencias importantes');
    console.log('   • Considera usar un sistema de logging más robusto para producción');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { cleanConsoleStatements, findProblematicFiles };
