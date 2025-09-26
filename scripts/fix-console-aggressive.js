#!/usr/bin/env node

/**
 * Script agresivo para limpiar declaraciones de consola restantes
 * Maneja casos complejos y patrones avanzados
 */

const fs = require('fs');
const path = require('path');

/**
 * Remueve declaraciones de consola de forma más agresiva
 */
function removeConsoleStatementsAggressive(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return { processed: false, changes: 0, error: 'Archivo no encontrado' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;

        // Patrones más agresivos para casos complejos
        const aggressivePatterns = [
            // Console.log con cualquier contenido entre paréntesis
            /^\s*console\.log\([^)]*\);\s*$/gm,
            // Console.log multilínea con cualquier contenido
            /^\s*console\.log\(\s*[\s\S]*?\);\s*$/gm,
            // Console.log sin punto y coma
            /^\s*console\.log\([^)]*\)\s*$/gm,
            // Console.info con cualquier contenido
            /^\s*console\.info\([^)]*\);\s*$/gm,
            // Console.debug con cualquier contenido
            /^\s*console\.debug\([^)]*\);\s*$/gm,
            // Console.trace con cualquier contenido
            /^\s*console\.trace\([^)]*\);\s*$/gm,
            // Console.log dentro de bloques de código
            /\s*console\.log\([^)]*\);\s*/g,
            // Console.log con comentarios
            /\s*console\.log\([^)]*\);\s*\/\/.*$/gm,
            // Console.log con template strings complejos
            /console\.log\(`[\s\S]*?`\)/g,
            // Console.log con concatenación compleja
            /console\.log\([^)]*\+[^)]*\)/g,
            // Console.log con objetos complejos
            /console\.log\(\{[^}]*\}[^)]*\)/g,
            // Console.log con arrays complejos
            /console\.log\(\[[^\]]*\][^)]*\)/g,
            // Console.log con funciones
            /console\.log\([^)]*=>[^)]*\)/g,
            // Console.log con operadores ternarios
            /console\.log\([^)]*\?[^)]*:[^)]*\)/g
        ];

        // Aplicar patrones agresivos
        aggressivePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                content = content.replace(pattern, '');
                changes += matches.length;
            }
        });

        // Limpiar líneas vacías múltiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Limpiar espacios en blanco al final de líneas
        content = content.replace(/[ \t]+$/gm, '');

        // Limpiar líneas que solo contienen espacios
        content = content.replace(/^\s*\n/gm, '');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            return { processed: true, changes, error: null };
        }

        return { processed: false, changes: 0, error: null };
    } catch (error) {
        return { processed: false, changes: 0, error: error.message };
    }
}

/**
 * Verifica si un archivo tiene declaraciones de consola problemáticas
 */
function hasProblematicConsole(filePath) {
    try {
        if (!fs.existsSync(filePath)) return false;

        const content = fs.readFileSync(filePath, 'utf8');
        const problematicPatterns = [
            /console\.log\(/g,
            /console\.info\(/g,
            /console\.debug\(/g,
            /console\.trace\(/g
        ];

        return problematicPatterns.some(pattern => pattern.test(content));
    } catch (error) {
        return false;
    }
}

/**
 * Obtiene archivos específicos que aún tienen problemas
 */
function getRemainingProblematicFiles() {
    const problematicFiles = [
        'app/api/calendar/jobs/route.ts',
        'app/api/jobs/route.ts',
        'app/dashboard/admin/page.tsx',
        'components/calendar/calendar-sidebar.tsx',
        'components/calendar/patient-sidebar.tsx',
        'components/forms/job-form.tsx',
        'components/forms/liquidation-form.tsx',
        'components/forms/quote-form-enhanced.tsx',
        'components/forms/worker-form.tsx',
        'components/quote/quote-preview.tsx',
        'components/quote/quote-template.tsx',
        'components/ui/hydration-debugger.tsx',
        'lib/database.ts'
    ];

    return problematicFiles.filter(file => fs.existsSync(file));
}

/**
 * Función principal
 */
async function main() {
    console.log('🔧 Iniciando limpieza agresiva de declaraciones de consola restantes...\n');

    const files = getRemainingProblematicFiles();

    if (files.length === 0) {
        console.log('✅ No se encontraron archivos con declaraciones de consola problemáticas');
        return;
    }

    console.log(`📁 Procesando ${files.length} archivos restantes\n`);

    let totalProcessed = 0;
    let totalChanges = 0;
    const errors = [];

    // Procesar cada archivo
    for (const file of files) {
        if (hasProblematicConsole(file)) {
            const result = removeConsoleStatementsAggressive(file);

            if (result.processed) {
                totalProcessed++;
                totalChanges += result.changes;
                console.log(`✅ ${file} - ${result.changes} declaraciones removidas`);
            } else if (result.error) {
                errors.push(`${file}: ${result.error}`);
                console.log(`❌ ${file} - Error: ${result.error}`);
            } else {
                console.log(`ℹ️  ${file} - Sin cambios necesarios`);
            }
        } else {
            console.log(`✅ ${file} - Ya está limpio`);
        }
    }

    // Resumen
    console.log('\n📊 Resumen de la limpieza agresiva:');
    console.log(`   • Archivos procesados: ${totalProcessed}`);
    console.log(`   • Declaraciones removidas: ${totalChanges}`);
    console.log(`   • Errores: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errores encontrados:');
        errors.forEach(error => console.log(`   • ${error}`));
    }

    // Verificación final
    console.log('\n🔍 Verificación final...');
    const stillProblematic = files.filter(hasProblematicConsole);

    if (stillProblematic.length > 0) {
        console.log(`⚠️  Aún quedan ${stillProblematic.length} archivos con declaraciones problemáticas:`);
        stillProblematic.forEach(file => console.log(`   • ${file}`));

        // Mostrar contenido problemático para debugging
        console.log('\n🔍 Contenido problemático restante:');
        stillProblematic.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (/console\.(log|info|debug|trace)\(/.test(line)) {
                        console.log(`   ${file}:${index + 1} - ${line.trim()}`);
                    }
                });
            } catch (error) {
                console.log(`   Error leyendo ${file}: ${error.message}`);
            }
        });
    } else {
        console.log('✅ Todos los archivos han sido limpiados correctamente');
    }

    console.log('\n🎉 Limpieza agresiva completada!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error durante la limpieza agresiva:', error);
        process.exit(1);
    });
}

module.exports = { removeConsoleStatementsAggressive, hasProblematicConsole };
