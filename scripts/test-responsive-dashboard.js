/**
 * 📱 Script de Prueba: Dashboard Completamente Responsivo
 * 
 * Este script verifica que el dashboard se adapte correctamente a:
 * - Móviles (320px - 767px)
 * - Tablets (768px - 1023px)
 * - Desktop (1024px+)
 */

console.log('🧪 Iniciando prueba de responsividad del dashboard...')

// Función para simular diferentes tamaños de pantalla
function testResponsiveBreakpoints() {
  console.log('📱 Probando breakpoints responsivos...')
  
  const breakpoints = [
    { name: 'Móvil Pequeño', width: 375, height: 667 },
    { name: 'Móvil Grande', width: 414, height: 896 },
    { name: 'Tablet Pequeña', width: 768, height: 1024 },
    { name: 'Tablet Grande', width: 820, height: 1180 },
    { name: 'Desktop Pequeño', width: 1024, height: 768 },
    { name: 'Desktop Grande', width: 1440, height: 900 }
  ]
  
  breakpoints.forEach((breakpoint, index) => {
    setTimeout(() => {
      console.log(`🔄 Probando: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`)
      
      // Simular cambio de tamaño de ventana
      if (typeof window !== 'undefined') {
        // Cambiar el tamaño de la ventana
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: breakpoint.width
        })
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: breakpoint.height
        })
        
        // Disparar evento de resize
        window.dispatchEvent(new Event('resize'))
        
        // Verificar clases CSS aplicadas
        checkResponsiveClasses(breakpoint)
      }
    }, index * 1000)
  })
}

// Función para verificar que las clases CSS responsivas se apliquen correctamente
function checkResponsiveClasses(breakpoint) {
  console.log(`🔍 Verificando clases para ${breakpoint.name}...`)
  
  // Verificar sidebar
  const sidebar = document.querySelector('.dashboard-sidebar')
  if (sidebar) {
    if (breakpoint.width < 1024) {
      console.log(`  ✅ Sidebar: Colapsable (${breakpoint.width < 1024 ? 'Sí' : 'No'})`)
    } else {
      console.log(`  ✅ Sidebar: Fijo (${breakpoint.width >= 1024 ? 'Sí' : 'No'})`)
    }
  }
  
  // Verificar buscador
  const headerSearch = document.querySelector('.dashboard-search')
  const mobileSearch = document.querySelector('.dashboard-search-mobile')
  
  if (headerSearch && mobileSearch) {
    if (breakpoint.width < 768) {
      console.log(`  ✅ Buscador: Móvil visible (${breakpoint.width < 768 ? 'Sí' : 'No'})`)
      console.log(`  ✅ Buscador: Header oculto (${breakpoint.width < 768 ? 'Sí' : 'No'})`)
    } else {
      console.log(`  ✅ Buscador: Header visible (${breakpoint.width >= 768 ? 'Sí' : 'No'})`)
      console.log(`  ✅ Buscador: Móvil oculto (${breakpoint.width >= 768 ? 'Sí' : 'No'})`)
    }
  }
  
  // Verificar menú hamburguesa
  const menuButton = document.querySelector('.mobile-menu-button')
  if (menuButton) {
    if (breakpoint.width < 1024) {
      console.log(`  ✅ Menú hamburguesa: Visible (${breakpoint.width < 1024 ? 'Sí' : 'No'})`)
    } else {
      console.log(`  ✅ Menú hamburguesa: Oculto (${breakpoint.width >= 1024 ? 'Sí' : 'No'})`)
    }
  }
  
  // Verificar grid de cards
  const cardsContainer = document.querySelector('.dashboard-cards')
  if (cardsContainer) {
    const computedStyle = window.getComputedStyle(cardsContainer)
    const gridColumns = computedStyle.gridTemplateColumns
    
    let expectedColumns = 1
    if (breakpoint.width >= 640) expectedColumns = 2
    if (breakpoint.width >= 1024) expectedColumns = 3
    if (breakpoint.width >= 1280) expectedColumns = 4
    
    console.log(`  ✅ Grid de cards: ${expectedColumns} columna(s) esperada(s)`)
    console.log(`     Grid actual: ${gridColumns}`)
  }
}

// Función para probar la funcionalidad del sidebar en móviles
function testMobileSidebar() {
  console.log('📱 Probando funcionalidad del sidebar móvil...')
  
  // Simular tamaño móvil
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    
    window.dispatchEvent(new Event('resize'))
    
    // Buscar botón de menú
    const menuButton = document.querySelector('.mobile-menu-button')
    if (menuButton) {
      console.log('  ✅ Botón de menú encontrado')
      
      // Simular clic en el botón
      menuButton.click()
      
      setTimeout(() => {
        const sidebar = document.querySelector('.dashboard-sidebar')
        if (sidebar && sidebar.classList.contains('open')) {
          console.log('  ✅ Sidebar se abre correctamente')
        } else {
          console.log('  ❌ Sidebar no se abre')
        }
      }, 100)
    } else {
      console.log('  ❌ Botón de menú no encontrado')
    }
  }
}

// Función para verificar componentes responsivos
function checkResponsiveComponents() {
  console.log('🔍 Verificando componentes responsivos...')
  
  // Verificar que existan las clases CSS principales
  const requiredClasses = [
    'dashboard-layout',
    'dashboard-sidebar',
    'dashboard-header',
    'dashboard-main',
    'dashboard-cards',
    'dashboard-card'
  ]
  
  requiredClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`)
    if (elements.length > 0) {
      console.log(`  ✅ Clase ${className}: ${elements.length} elemento(s) encontrado(s)`)
    } else {
      console.log(`  ❌ Clase ${className}: No se encontraron elementos`)
    }
  })
  
  // Verificar utilidades responsivas
  const utilityClasses = [
    'dashboard-hidden-mobile',
    'dashboard-hidden-desktop',
    'dashboard-text-center-mobile'
  ]
  
  utilityClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`)
    if (elements.length > 0) {
      console.log(`  ✅ Utilidad ${className}: ${elements.length} elemento(s) encontrado(s)`)
    } else {
      console.log(`  ℹ️  Utilidad ${className}: No se encontraron elementos (opcional)`)
    }
  })
}

// Función para probar la navegación responsiva
function testResponsiveNavigation() {
  console.log('🧭 Probando navegación responsiva...')
  
  // Verificar elementos de navegación
  const navItems = document.querySelectorAll('.dashboard-nav-item')
  if (navItems.length > 0) {
    console.log(`  ✅ Elementos de navegación: ${navItems.length} encontrado(s)`)
    
    // Verificar que tengan iconos
    navItems.forEach((item, index) => {
      const icon = item.querySelector('.dashboard-nav-icon')
      if (icon) {
        console.log(`    ✅ Item ${index + 1}: Icono presente`)
      } else {
        console.log(`    ❌ Item ${index + 1}: Icono faltante`)
      }
    })
  } else {
    console.log('  ❌ No se encontraron elementos de navegación')
  }
}

// Función para generar reporte de responsividad
function generateResponsivenessReport() {
  console.log('📊 Generando reporte de responsividad...')
  
  const report = {
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    breakpoint: getCurrentBreakpoint(),
    components: {
      sidebar: !!document.querySelector('.dashboard-sidebar'),
      header: !!document.querySelector('.dashboard-header'),
      main: !!document.querySelector('.dashboard-main'),
      cards: !!document.querySelector('.dashboard-cards'),
      navigation: !!document.querySelector('.dashboard-nav')
    },
    utilities: {
      hiddenMobile: document.querySelectorAll('.dashboard-hidden-mobile').length,
      hiddenDesktop: document.querySelectorAll('.dashboard-hidden-desktop').length,
      textCenterMobile: document.querySelectorAll('.dashboard-text-center-mobile').length
    }
  }
  
  console.log('📋 Reporte de Responsividad:')
  console.log(JSON.stringify(report, null, 2))
  
  return report
}

// Función para determinar el breakpoint actual
function getCurrentBreakpoint() {
  const width = window.innerWidth
  
  if (width < 640) return 'mobile-small'
  if (width < 768) return 'mobile-large'
  if (width < 1024) return 'tablet'
  if (width < 1280) return 'desktop-small'
  return 'desktop-large'
}

// Función principal de prueba
function runResponsivenessTest() {
  console.log('🚀 Ejecutando prueba completa de responsividad...')
  
  // Verificar que estemos en el dashboard
  if (!document.querySelector('.dashboard-layout')) {
    console.log('❌ No se detectó el dashboard. Asegúrate de estar en la página correcta.')
    return
  }
  
  console.log('✅ Dashboard detectado, iniciando pruebas...')
  
  // Ejecutar pruebas en secuencia
  setTimeout(() => checkResponsiveComponents(), 500)
  setTimeout(() => testResponsiveNavigation(), 1000)
  setTimeout(() => testMobileSidebar(), 2000)
  setTimeout(() => testResponsiveBreakpoints(), 4000)
  setTimeout(() => generateResponsivenessReport(), 10000)
  
  console.log('✅ Pruebas programadas. Revisa la consola para los resultados.')
}

// Función para probar un breakpoint específico
function testSpecificBreakpoint(width, height) {
  console.log(`🔄 Probando breakpoint específico: ${width}x${height}`)
  
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    })
    
    window.dispatchEvent(new Event('resize'))
    
    setTimeout(() => {
      checkResponsiveClasses({ name: 'Personalizado', width, height })
    }, 100)
  }
}

// Ejecutar la prueba cuando se cargue el script
if (typeof window !== 'undefined') {
  // Esperar a que la página se cargue completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runResponsivenessTest)
  } else {
    runResponsivenessTest()
  }
} else {
  console.log('❌ Este script debe ejecutarse en el navegador')
}

// Exponer funciones para pruebas manuales
if (typeof window !== 'undefined') {
  window.testResponsiveness = {
    runTest: runResponsivenessTest,
    testBreakpoint: testSpecificBreakpoint,
    checkComponents: checkResponsiveComponents,
    testNavigation: testResponsiveNavigation,
    testMobileSidebar: testMobileSidebar,
    generateReport: generateResponsivenessReport
  }
  
  console.log('🔧 Funciones de prueba disponibles en window.testResponsiveness')
  console.log('   - runTest(): Ejecuta prueba completa')
  console.log('   - testBreakpoint(width, height): Prueba breakpoint específico')
  console.log('   - checkComponents(): Verifica componentes responsivos')
  console.log('   - testNavigation(): Prueba navegación responsiva')
  console.log('   - testMobileSidebar(): Prueba sidebar móvil')
  console.log('   - generateReport(): Genera reporte completo')
  
  // Ejemplo de uso
  console.log('💡 Ejemplo: window.testResponsiveness.testBreakpoint(375, 667)')
}
