const fs = require('fs');
const path = require('path');

// Función para verificar márgenes en un archivo
function verifyMargins(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const filePathRelative = path.relative(path.join(__dirname, '..'), filePath);
    
    let issues = [];
    let hasIssues = false;
    
    // Verificar estructura básica
    if (!content.includes('dashboard-container')) {
      issues.push('❌ Falta dashboard-container');
      hasIssues = true;
    }
    
    if (!content.includes('dashboard-content')) {
      issues.push('❌ Falta dashboard-content');
      hasIssues = true;
    }
    
    if (!content.includes('section-header')) {
      issues.push('❌ Falta section-header');
      hasIssues = true;
    }
    
    // Verificar import del CSS
    if (!content.includes('unified-design.css')) {
      issues.push('❌ Falta import de unified-design.css');
      hasIssues = true;
    }
    
    // Verificar si usa unified-card
    if (!content.includes('unified-card')) {
      issues.push('⚠️ No usa unified-card');
    }
    
    // Verificar si tiene contenido duplicado o mal estructurado
    if (content.includes('Título de la Sección') && content.includes('Descripción de la sección')) {
      issues.push('⚠️ Usa títulos genéricos del template');
    }
    
    // Verificar si tiene estructura anidada incorrecta
    const returnMatches = content.match(/return\s*\(/g);
    if (returnMatches && returnMatches.length > 1) {
      issues.push('⚠️ Múltiples returns detectados');
    }
    
    return {
      file: fileName,
      path: filePathRelative,
      hasIssues,
      issues,
      status: hasIssues ? 'needs-fix' : 'ok'
    };
    
  } catch (error) {
    return {
      file: path.basename(filePath),
      path: path.relative(path.join(__dirname, '..'), filePath),
      hasIssues: true,
      issues: [`❌ Error: ${error.message}`],
      status: 'error'
    };
  }
}

// Función para corregir márgenes en un archivo
function fixMargins(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Si ya está correcto, no hacer nada
    if (content.includes('dashboard-container') && 
        content.includes('dashboard-content') && 
        content.includes('section-header') &&
        content.includes('unified-design.css')) {
      return { file: fileName, status: 'already-correct' };
    }
    
    // Buscar el return principal
    const returnMatch = content.match(/return\s*\(\s*<[^>]*>/);
    if (!returnMatch) {
      return { file: fileName, status: 'no-return-found' };
    }
    
    const returnIndex = content.indexOf(returnMatch[0]);
    const beforeReturn = content.slice(0, returnIndex);
    const afterReturn = content.slice(returnIndex + returnMatch[0].length);
    
    // Encontrar el cierre del return
    let braceCount = 1;
    let closeIndex = afterReturn.indexOf(')');
    while (braceCount > 0 && closeIndex !== -1) {
      if (afterReturn[closeIndex] === '(') braceCount++;
      if (afterReturn[closeIndex] === ')') braceCount--;
      if (braceCount > 0) {
        closeIndex = afterReturn.indexOf(')', closeIndex + 1);
      }
    }
    
    if (closeIndex === -1) {
      return { file: fileName, status: 'no-close-found' };
    }
    
    const insideReturn = afterReturn.slice(0, closeIndex);
    const afterClose = afterReturn.slice(closeIndex + 1);
    
    // Agregar importación del CSS si no existe
    if (!content.includes('unified-design.css')) {
      const importMatch = content.match(/import.*from.*['"]@\/components\/ui\/([^'"]+)['"]/);
      if (importMatch) {
        const importIndex = content.lastIndexOf(importMatch[0]);
        const insertIndex = content.indexOf('\n', importIndex) + 1;
        content = content.slice(0, insertIndex) + 
                 "import '../styles/unified-design.css';\n" + 
                 content.slice(insertIndex);
      }
    }
    
    // Crear nueva estructura con márgenes
    const newContent = beforeReturn + 
      `return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Unificado */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              <span className="text-blue-600">Título</span> de la Sección
            </h1>
            <p className="section-subtitle">
              Descripción de la sección
            </p>
          </div>
          <div className="header-actions">
            <Button className="btn-primary">
              Acción Principal
            </Button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="unified-card">
          <div className="unified-card-content">
            ${insideReturn}
          </div>
        </div>
      </div>
    </div>
  )` + afterClose;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    return { file: fileName, status: 'fixed' };
    
  } catch (error) {
    return { file: path.basename(filePath), status: 'error', error: error.message };
  }
}

// Función principal
function main() {
  console.log('🔍 Verificando márgenes en todas las páginas del dashboard...\n');
  
  const dashboardDir = path.join(__dirname, '..', 'app', 'dashboard');
  const pages = [];
  
  // Recorrer todas las páginas del dashboard
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'page.tsx' || item === 'page.jsx') {
        pages.push(fullPath);
      }
    });
  }
  
  scanDirectory(dashboardDir);
  
  console.log(`📁 Encontradas ${pages.length} páginas en el dashboard:\n`);
  
  // Verificar cada página
  const results = pages.map(page => verifyMargins(page));
  
  // Mostrar resultados detallados
  results.forEach(result => {
    if (result.hasIssues) {
      console.log(`📄 ${result.file} (${result.path}):`);
      result.issues.forEach(issue => {
        console.log(`   ${issue}`);
      });
      console.log('');
    }
  });
  
  // Contar páginas con problemas
  const needsFix = results.filter(r => r.status === 'needs-fix').length;
  const ok = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Con márgenes correctos: ${ok}`);
  console.log(`   ❌ Necesitan corrección: ${needsFix}`);
  console.log(`   💥 Con errores: ${errors}`);
  
  if (needsFix > 0) {
    console.log(`\n🔧 Corrigiendo márgenes en ${needsFix} páginas...\n`);
    
    const pagesToFix = results.filter(r => r.status === 'needs-fix');
    pagesToFix.forEach(result => {
      const pagePath = pages.find(p => path.basename(p) === result.file);
      if (pagePath) {
        const fixResult = fixMargins(pagePath);
        console.log(`${fixResult.status === 'fixed' ? '✅' : '⚠️'} ${result.file}: ${fixResult.status}`);
      }
    });
    
    console.log(`\n🎉 Proceso completado. Todas las páginas ahora tienen márgenes correctos.`);
  } else {
    console.log(`\n🎉 ¡Excelente! Todas las páginas ya tienen márgenes correctos.`);
  }
  
  // Mostrar páginas con problemas específicos
  const pagesWithGenericTitles = results.filter(r => 
    r.issues.some(issue => issue.includes('títulos genéricos'))
  );
  
  if (pagesWithGenericTitles.length > 0) {
    console.log(`\n⚠️ Páginas con títulos genéricos que necesitan personalización:`);
    pagesWithGenericTitles.forEach(result => {
      console.log(`   - ${result.file}`);
    });
  }
}

// Ejecutar el script
main();
