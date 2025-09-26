#!/usr/bin/env node

/**
 * Script final para limpiar declaraciones de consola restantes
 * Maneja casos específicos encontrados en el análisis
 */

const fs = require('fs');
const path = require('path');

/**
 * Remueve declaraciones de consola específicas encontradas
 */
function removeSpecificConsoleStatements(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return { processed: false, changes: 0, error: 'Archivo no encontrado' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;

        // Patrones específicos encontrados en el análisis
        const specificPatterns = [
            // Console.log con objetos complejos
            /console\.log\([^)]*\{[^}]*\}[^)]*\)/g,
            // Console.log con arrays
            /console\.log\([^)]*\[[^\]]*\][^)]*\)/g,
            // Console.log con template strings
            /console\.log\(`[^`]*`\)/g,
            // Console.log con concatenación
            /console\.log\([^)]*\+[^)]*\)/g,
            // Console.log con funciones
            /console\.log\([^)]*=>[^)]*\)/g,
            // Console.log con operadores ternarios
            /console\.log\([^)]*\?[^)]*:[^)]*\)/g,
            // Console.log con múltiples parámetros
            /console\.log\([^)]*,\s*[^)]*\)/g,
            // Console.log con strings largos
            /console\.log\([^)]*"[^"]*"[^)]*\)/g,
            // Console.log con variables
            /console\.log\([^)]*[a-zA-Z_$][a-zA-Z0-9_$]*[^)]*\)/g,
            // Console.log con números
            /console\.log\([^)]*\d+[^)]*\)/g,
            // Console.log con booleanos
            /console\.log\([^)]*(true|false)[^)]*\)/g,
            // Console.log con null/undefined
            /console\.log\([^)]*(null|undefined)[^)]*\)/g,
            // Console.log con operadores
            /console\.log\([^)]*[+\-*/=<>!&|][^)]*\)/g,
            // Console.log con paréntesis anidados
            /console\.log\([^)]*\([^)]*\)[^)]*\)/g,
            // Console.log con comillas simples
            /console\.log\([^)]*'[^']*'[^)]*\)/g,
            // Console.log con backticks
            /console\.log\([^)]*`[^`]*`[^)]*\)/g,
            // Console.log con puntos
            /console\.log\([^)]*\.[^)]*\)/g,
            // Console.log con dos puntos
            /console\.log\([^)]*:[^)]*\)/g,
            // Console.log con punto y coma
            /console\.log\([^)]*;[^)]*\)/g,
            // Console.log con comas
            /console\.log\([^)]*,[^)]*\)/g,
            // Console.log con llaves
            /console\.log\([^)]*\{[^}]*\}[^)]*\)/g,
            // Console.log con corchetes
            /console\.log\([^)]*\[[^\]]*\][^)]*\)/g,
            // Console.log con paréntesis
            /console\.log\([^)]*\([^)]*\)[^)]*\)/g,
            // Console.log con espacios
            /console\.log\([^)]*\s[^)]*\)/g,
            // Console.log con tabs
            /console\.log\([^)]*\t[^)]*\)/g,
            // Console.log con saltos de línea
            /console\.log\([^)]*\n[^)]*\)/g,
            // Console.log con retorno de carro
            /console\.log\([^)]*\r[^)]*\)/g,
            // Console.log con cualquier carácter especial
            /console\.log\([^)]*[^a-zA-Z0-9_$+\-*/=<>!&|()[\]{}'",;.\s][^)]*\)/g,
            // Console.log con cualquier contenido
            /console\.log\([^)]*\)/g
        ];

        // Aplicar patrones específicos
        specificPatterns.forEach(pattern => {
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
 * Función principal
 */
async function main() {
    console.log('🔧 Iniciando limpieza final de declaraciones de consola...\n');

    const files = [
        'app/api/calendar/jobs/route.ts',
        'app/api/jobs/route.ts',
        'app/dashboard/admin/page.tsx',
        'components/calendar/calendar-sidebar.tsx',
        'components/calendar/patient-sidebar.tsx',
        'components/forms/job-form.tsx',
        'components/forms/quote-form-enhanced.tsx',
        'components/forms/worker-form.tsx',
        'components/quote/quote-preview.tsx',
        'components/quote/quote-template.tsx',
        'components/ui/hydration-debugger.tsx',
        'lib/database.ts'
    ];

    let totalProcessed = 0;
    let totalChanges = 0;
    const errors = [];

    // Procesar cada archivo
    for (const file of files) {
        if (fs.existsSync(file)) {
            const result = removeSpecificConsoleStatements(file);

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
            console.log(`⚠️  ${file} - Archivo no encontrado`);
        }
    }

    // Resumen
    console.log('\n📊 Resumen de la limpieza final:');
    console.log(`   • Archivos procesados: ${totalProcessed}`);
    console.log(`   • Declaraciones removidas: ${totalChanges}`);
    console.log(`   • Errores: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errores encontrados:');
        errors.forEach(error => console.log(`   • ${error}`));
    }

    console.log('\n🎉 Limpieza final completada!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error durante la limpieza final:', error);
        process.exit(1);
    });
}

module.exports = { removeSpecificConsoleStatements };
