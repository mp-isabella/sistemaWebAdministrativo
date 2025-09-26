#!/usr/bin/env node

/**
 * Script para limpiar declaraciones de consola - Versión compatible con Windows
 * Mantiene solo console.error y console.warn para debugging crítico
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    // Directorios a procesar
    includeDirs: ['app', 'components', 'lib', 'hooks'],
    // Directorios a excluir
    excludeDirs: ['node_modules', '.next', 'dist', 'build', 'scripts'],
    // Extensiones de archivos a procesar
    includeExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    // Tipos de console a remover (mantener error y warn para debugging)
    removeTypes: ['log', 'info', 'debug', 'trace'],
    // Tipos de console a mantener
    keepTypes: ['error', 'warn']
};

/**
 * Verifica si un archivo debe ser procesado
 */
function shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    return CONFIG.includeExtensions.includes(ext);
}

/**
 * Verifica si un directorio debe ser excluido
 */
function shouldExcludeDir(dirPath) {
    return CONFIG.excludeDirs.some(excludeDir =>
        dirPath.includes(excludeDir) || path.basename(dirPath) === excludeDir
    );
}

/**
 * Obtiene todos los archivos recursivamente
 */
function getAllFiles(dirPath, files = []) {
    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                if (!shouldExcludeDir(fullPath)) {
                    getAllFiles(fullPath, files);
                }
            } else if (stat.isFile() && shouldProcessFile(fullPath)) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Ignorar errores de acceso
    }

    return files;
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
 * Remueve declaraciones de consola de un archivo
 */
function removeConsoleStatements(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return { processed: false, changes: 0, error: 'Archivo no encontrado' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;

        // Patrones para diferentes tipos de declaraciones de consola
        const patterns = [
            // console.log simple
            {
                regex: /^\s*console\.log\([^)]*\);\s*$/gm,
                type: 'log',
                description: 'console.log simple'
            },
            // console.log multilínea
            {
                regex: /^\s*console\.log\(\s*[\s\S]*?\);\s*$/gm,
                type: 'log',
                description: 'console.log multilínea'
            },
            // console.log con template literals
            {
                regex: /^\s*console\.log\(`[\s\S]*?`\);\s*$/gm,
                type: 'log',
                description: 'console.log con template literals'
            },
            // console.log con concatenación de strings
            {
                regex: /^\s*console\.log\([^)]*\+[^)]*\);\s*$/gm,
                type: 'log',
                description: 'console.log con concatenación'
            },
            // console.log con objetos
            {
                regex: /^\s*console\.log\(\{[^}]*\}[^)]*\);\s*$/gm,
                type: 'log',
                description: 'console.log con objetos'
            },
            // console.log con arrays
            {
                regex: /^\s*console\.log\(\[[^\]]*\][^)]*\);\s*$/gm,
                type: 'log',
                description: 'console.log con arrays'
            },
            // console.info
            {
                regex: /^\s*console\.info\([^)]*\);\s*$/gm,
                type: 'info',
                description: 'console.info'
            },
            // console.debug
            {
                regex: /^\s*console\.debug\([^)]*\);\s*$/gm,
                type: 'debug',
                description: 'console.debug'
            },
            // console.trace
            {
                regex: /^\s*console\.trace\([^)]*\);\s*$/gm,
                type: 'trace',
                description: 'console.trace'
            },
            // console.log con múltiples parámetros
            {
                regex: /^\s*console\.log\([^)]*,\s*[^)]*\);\s*$/gm,
                type: 'log',
                description: 'console.log con múltiples parámetros'
            },
            // console.log sin punto y coma
            {
                regex: /^\s*console\.log\([^)]*\)\s*$/gm,
                type: 'log',
                description: 'console.log sin punto y coma'
            }
        ];

        // Aplicar patrones
        patterns.forEach(pattern => {
            if (CONFIG.removeTypes.includes(pattern.type)) {
                const matches = content.match(pattern.regex);
                if (matches) {
                    content = content.replace(pattern.regex, '');
                    changes += matches.length;
                }
            }
        });

        // Limpiar líneas vacías múltiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Limpiar espacios en blanco al final de líneas
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
 * Función principal
 */
async function main() {
    console.log('🧹 Iniciando limpieza comprehensiva de declaraciones de consola...\n');

    // Obtener todos los archivos
    let allFiles = [];
    for (const dir of CONFIG.includeDirs) {
        if (fs.existsSync(dir)) {
            const files = getAllFiles(dir);
            allFiles = allFiles.concat(files);
        }
    }

    // Filtrar archivos con declaraciones problemáticas
    const problematicFiles = allFiles.filter(hasProblematicConsole);

    if (problematicFiles.length === 0) {
        console.log('✅ No se encontraron archivos con declaraciones de consola problemáticas');
        return;
    }

    console.log(`📁 Encontrados ${problematicFiles.length} archivos con declaraciones de consola\n`);

    let totalProcessed = 0;
    let totalChanges = 0;
    const errors = [];

    // Procesar cada archivo
    for (const file of problematicFiles) {
        const result = removeConsoleStatements(file);

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
    }

    // Resumen
    console.log('\n📊 Resumen de la limpieza:');
    console.log(`   • Archivos procesados: ${totalProcessed}`);
    console.log(`   • Declaraciones removidas: ${totalChanges}`);
    console.log(`   • Errores: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errores encontrados:');
        errors.forEach(error => console.log(`   • ${error}`));
    }

    // Verificación final
    console.log('\n🔍 Verificando archivos restantes...');
    const stillProblematic = allFiles.filter(hasProblematicConsole);

    if (stillProblematic.length > 0) {
        console.log(`⚠️  Aún quedan ${stillProblematic.length} archivos con declaraciones problemáticas:`);
        stillProblematic.forEach(file => console.log(`   • ${file}`));
    } else {
        console.log('✅ Todos los archivos han sido limpiados correctamente');
    }

    console.log('\n🎉 Limpieza de consola completada!');
    console.log('\n💡 Recomendaciones:');
    console.log('   • Usa console.error solo para errores críticos');
    console.log('   • Usa console.warn para advertencias importantes');
    console.log('   • Considera usar un sistema de logging más robusto para producción');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error durante la limpieza:', error);
        process.exit(1);
    });
}

module.exports = { removeConsoleStatements, hasProblematicConsole, getAllFiles };
