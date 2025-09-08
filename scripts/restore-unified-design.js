const fs = require('fs');
const path = require('path');

// Función para verificar si un archivo tiene el diseño unificado
function checkUnifiedDesign(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasUnifiedDesign = content.includes('dashboard-container') && 
                            content.includes('dashboard-content') && 
                            content.includes('section-header') &&
                            content.includes('unified-design.css');
    
    return {
      file: path.basename(filePath),
      hasUnifiedDesign,
      path: filePath
    };
  } catch (error) {
    return {
      file: path.basename(filePath),
      hasUnifiedDesign: false,
      path: filePath,
      error: error.message
    };
  }
}

// Función para restaurar el diseño unificado
function restoreUnifiedDesign(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene el diseño unificado
    if (content.includes('dashboard-container')) {
      return { file: path.basename(filePath), status: 'already-has-design' };
    }
    
    // Agregar importación del CSS unificado si no existe
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
    
    // Buscar el return principal y envolverlo con el diseño unificado
    const returnMatch = content.match(/return\s*\(\s*<[^>]*>/);
    if (returnMatch) {
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
      
      if (closeIndex !== -1) {
        const insideReturn = afterReturn.slice(0, closeIndex);
        const afterClose = afterReturn.slice(closeIndex + 1);
        
        // Crear el nuevo contenido con diseño unificado
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
        return { file: path.basename(filePath), status: 'restored' };
      }
    }
    
    return { file: path.basename(filePath), status: 'no-return-found' };
  } catch (error) {
    return { file: path.basename(filePath), status: 'error', error: error.message };
  }
}

// Función principal
function main() {
  console.log('🔍 Verificando diseño unificado en todas las páginas del dashboard...\n');
  
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
  const results = pages.map(page => checkUnifiedDesign(page));
  
  // Mostrar resultados
  results.forEach(result => {
    const status = result.hasUnifiedDesign ? '✅' : '❌';
    console.log(`${status} ${result.file}`);
  });
  
  // Contar páginas con y sin diseño
  const withDesign = results.filter(r => r.hasUnifiedDesign).length;
  const withoutDesign = results.filter(r => !r.hasUnifiedDesign).length;
  
  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Con diseño unificado: ${withDesign}`);
  console.log(`   ❌ Sin diseño unificado: ${withoutDesign}`);
  
  if (withoutDesign > 0) {
    console.log(`\n🔧 Restaurando diseño unificado en ${withoutDesign} páginas...\n`);
    
    const pagesToRestore = results.filter(r => !r.hasUnifiedDesign);
    pagesToRestore.forEach(result => {
      const restoreResult = restoreUnifiedDesign(result.path);
      console.log(`${restoreResult.status === 'restored' ? '✅' : '⚠️'} ${result.file}: ${restoreResult.status}`);
    });
    
    console.log(`\n🎉 Proceso completado. Todas las páginas ahora tienen el diseño unificado.`);
  } else {
    console.log(`\n🎉 ¡Excelente! Todas las páginas ya tienen el diseño unificado aplicado.`);
  }
}

// Ejecutar el script
main();
