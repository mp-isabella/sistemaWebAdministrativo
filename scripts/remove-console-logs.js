#!/usr/bin/env node

/**
 * Script para remover console.log statements manteniendo console.error
 * Solo remueve console.log, console.info, console.debug, console.trace
 * Mantiene console.error, console.warn para logging de errores
 */

const fs = require('fs');
const path = require('path');

// Directorios y archivos a procesar
const targetDirectories = [
    'app',
    'components',
    'lib',
    'hooks',
    'types'
];

// Patrones de console statements a remover (NO incluye console.error ni console.warn)
const consolePatterns = [
    // Console.log básico
    /^\s*console\.log\([^)]*\);\s*$/gm,
    // Console.log multilínea
    /^\s*console\.log\(\s*[\s\S]*?\);\s*$/gm,
    // Console.log sin punto y coma
    /^\s*console\.log\([^)]*\)\s*$/gm,
    // Console.info
    /^\s*console\.info\([^)]*\);\s*$/gm,
    // Console.debug
    /^\s*console\.debug\([^)]*\);\s*$/gm,
    // Console.trace
    /^\s*console\.trace\([^)]*\);\s*$/gm,
    // Console.log dentro de bloques
    /\s*console\.log\([^)]*\);\s*/g,
    // Console.log con comentarios
    /\s*console\.log\([^)]*\);\s*\/\/.*$/gm,
    // Console.log con template strings
    /console\.log\(`[\s\S]*?`\)/g,
    // Console.log con concatenación
    /console\.log\([^)]*\+[^)]*\)/g,
    // Console.log con objetos
    /console\.log\(\{[^}]*\}[^)]*\)/g,
    // Console.log con arrays
    /console\.log\(\[[^\]]*\][^)]*\)/g,
    // Console.log con funciones
    /console\.log\([^)]*=>[^)]*\)/g,
    // Console.log con operadores ternarios
    /console\.log\([^)]*\?[^)]*:[^)]*\)/g,
    // Console.log con múltiples parámetros
    /console\.log\([^)]*,\s*[^)]*\)/g,
    // Console.log con strings
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
    /console\.log\([^)]*\([^)]*\)[^)]*\)/g
];

/**
 * Verifica si un archivo debe ser procesado
 */
function shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];

    if (!validExtensions.includes(ext)) {
        return false;
    }

    // Excluir archivos de scripts y documentación
    if (filePath.includes('scripts/') ||
        filePath.includes('node_modules/') ||
        filePath.includes('.next/') ||
        filePath.includes('dist/') ||
        filePath.includes('build/') ||
        filePath.endsWith('.md') ||
        filePath.endsWith('.html')) {
        return false;
    }

    return true;
}

/**
 * Remueve console statements de un archivo (excepto console.error y console.warn)
 */
function removeConsoleStatements(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return { processed: false, changes: 0, error: 'Archivo no encontrado' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;

        // Aplicar todos los patrones
        consolePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                changes += matches.length;
                content = content.replace(pattern, '');
            }
        });

        // Limpiar líneas vacías múltiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Limpiar espacios al final de líneas
        content = content.replace(/[ \t]+$/gm, '');

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
 * Busca archivos recursivamente
 */
function findFiles(dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findFiles(fullPath));
        } else if (shouldProcessFile(fullPath)) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Función principal
 */
async function main() {
    console.log('🧹 Removiendo console.log statements (manteniendo console.error)...\n');

    const allFiles = [];

    // Agregar archivos de directorios específicos
    targetDirectories.forEach(dir => {
        if (fs.existsSync(dir)) {
            allFiles.push(...findFiles(dir));
        }
    });

    // Remover duplicados
    const uniqueFiles = [...new Set(allFiles)];

    console.log(`📋 Encontrados ${uniqueFiles.length} archivos para procesar:\n`);

    let totalProcessed = 0;
    let totalChanges = 0;
    const errors = [];

    // Procesar cada archivo
    uniqueFiles.forEach(file => {
        const result = removeConsoleStatements(file);

        if (result.processed) {
            totalProcessed++;
            totalChanges += result.changes;
            console.log(`✅ ${file} - ${result.changes} console.log removidos`);
        } else if (result.error) {
            errors.push(`${file}: ${result.error}`);
            console.log(`❌ ${file} - Error: ${result.error}`);
        } else {
            console.log(`⚪ ${file} - Sin console.log para remover`);
        }
    });

    // Resumen
    console.log('\n📊 RESUMEN:');
    console.log('===========');
    console.log(`📁 Archivos procesados: ${totalProcessed}`);
    console.log(`🔧 Total de console.log removidos: ${totalChanges}`);

    if (errors.length > 0) {
        console.log(`❌ Errores: ${errors.length}`);
        errors.forEach(error => console.log(`   • ${error}`));
    }

    console.log('\n✅ Limpieza de console.log completada!');
    console.log('💡 Se mantuvieron console.error y console.warn para logging de errores');

    return totalProcessed > 0;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main()
        .then(success => {
            if (success) {
                console.log('\n🎉 Se removieron console.log statements exitosamente');
                process.exit(0);
            } else {
                console.log('\n⚠️  No se encontraron console.log statements para remover');
                process.exit(0);
            }
        })
        .catch(error => {
            console.error('❌ Error durante la limpieza:', error);
            process.exit(1);
        });
}

module.exports = { removeConsoleStatements, findFiles, shouldProcessFile };
