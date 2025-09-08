const fs = require('fs');
const path = require('path');

// Función para verificar y restaurar márgenes en un archivo
function fixMargins(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let changes = [];
    
    // Verificar si tiene dashboard-container
    if (!content.includes('dashboard-container')) {
      changes.push('❌ No tiene dashboard-container');
      return { file: fileName, changes, status: 'no-container' };
    }
    
    // Verificar si tiene dashboard-content
    if (!content.includes('dashboard-content')) {
      changes.push('❌ No tiene dashboard-content');
      return { file: fileName, changes, status: 'no-content' };
    }
    
    // Verificar si tiene section-header
    if (!content.includes('section-header')) {
      changes.push('❌ No tiene section-header');
      return { file: fileName, changes, status: 'no-header' };
    }
    
    // Verificar si tiene unified-card
    if (!content.includes('unified-card')) {
      changes.push('⚠️ No usa unified-card');
    }
    
    // Verificar si tiene el import del CSS unificado
    if (!content.includes('unified-design.css')) {
      // Agregar importación del CSS unificado
      const importMatch = content.match(/import.*from.*['"]@\/components\/ui\/([^'"]+)['"]/);
      if (importMatch) {
        const importIndex = content.lastIndexOf(importMatch[0]);
        const insertIndex = content.indexOf('\n', importIndex) + 1;
        content = content.slice(0, insertIndex) + 
                 "import '../styles/unified-design.css';\n" + 
                 content.slice(insertIndex);
        changes.push('✅ Agregado import de unified-design.css');
      }
    }
    
    // Verificar estructura de márgenes
    const hasProperStructure = content.includes('dashboard-container') && 
                              content.includes('dashboard-content') && 
                              content.includes('section-header');
    
    if (hasProperStructure) {
      changes.push('✅ Estructura de márgenes correcta');
      return { file: fileName, changes, status: 'ok' };
    } else {
      changes.push('❌ Estructura de márgenes incorrecta');
      return { file: fileName, changes, status: 'needs-fix' };
    }
    
  } catch (error) {
    return { file: path.basename(filePath), changes: [`❌ Error: ${error.message}`], status: 'error' };
  }
}

// Función para restaurar márgenes en un archivo
function restoreMargins(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Si ya tiene la estructura correcta, no hacer nada
    if (content.includes('dashboard-container') && 
        content.includes('dashboard-content') && 
        content.includes('section-header')) {
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
    return { file: fileName, status: 'restored' };
    
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
  const results = pages.map(page => fixMargins(page));
  
  // Mostrar resultados
  results.forEach(result => {
    console.log(`📄 ${result.file}:`);
    result.changes.forEach(change => {
      console.log(`   ${change}`);
    });
    console.log('');
  });
  
  // Contar páginas con problemas
  const needsFix = results.filter(r => r.status === 'needs-fix' || r.status === 'no-container' || r.status === 'no-content' || r.status === 'no-header').length;
  const ok = results.filter(r => r.status === 'ok').length;
  
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Con márgenes correctos: ${ok}`);
  console.log(`   ❌ Necesitan corrección: ${needsFix}`);
  
  if (needsFix > 0) {
    console.log(`\n🔧 Restaurando márgenes en ${needsFix} páginas...\n`);
    
    const pagesToFix = results.filter(r => r.status === 'needs-fix' || r.status === 'no-container' || r.status === 'no-content' || r.status === 'no-header');
    pagesToFix.forEach(result => {
      const pagePath = pages.find(p => path.basename(p) === result.file);
      if (pagePath) {
        const restoreResult = restoreMargins(pagePath);
        console.log(`${restoreResult.status === 'restored' ? '✅' : '⚠️'} ${result.file}: ${restoreResult.status}`);
      }
    });
    
    console.log(`\n🎉 Proceso completado. Todas las páginas ahora tienen márgenes correctos.`);
  } else {
    console.log(`\n🎉 ¡Excelente! Todas las páginas ya tienen márgenes correctos.`);
  }
  
  // Verificar CSS unificado
  console.log(`\n🎨 Verificando CSS unificado...`);
  const cssPath = path.join(__dirname, '..', 'app', 'dashboard', 'styles', 'unified-design.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const hasMargins = cssContent.includes('p-6') && cssContent.includes('space-y-6') && cssContent.includes('mb-8');
    console.log(`   ${hasMargins ? '✅' : '❌'} CSS unificado ${hasMargins ? 'tiene' : 'no tiene'} márgenes definidos`);
  } else {
    console.log(`   ❌ CSS unificado no encontrado`);
  }
}

// Ejecutar el script
main();
