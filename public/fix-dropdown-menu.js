// Script para forzar la aplicación de estilos del menú de tres puntos
(function () {
    'use strict';

    function applyDropdownStyles() {
        // Crear o actualizar el estilo
        let style = document.getElementById('dropdown-menu-fix');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dropdown-menu-fix';
            document.head.appendChild(style);
        }

        style.textContent = `
      .clients-page [data-radix-dropdown-menu-content] {
        position: absolute !important;
        z-index: 1000 !important;
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        min-width: 8rem !important;
        max-width: 12rem !important;
        width: auto !important;
        margin-top: 4px !important;
        transform: none !important;
      }
      .clients-page .bg-white {
        position: relative !important;
        overflow: visible !important;
      }
      .clients-page .space-y-6 {
        overflow: visible !important;
      }
      .clients-page .grid {
        overflow: visible !important;
      }
      .clients-page [data-radix-dropdown-menu-trigger] {
        position: relative !important;
        z-index: 1 !important;
      }
    `;
    }

    // Aplicar estilos cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyDropdownStyles);
    } else {
        applyDropdownStyles();
    }

    // Aplicar estilos cuando se navega (para SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
        originalPushState.apply(history, arguments);
        setTimeout(applyDropdownStyles, 100);
    };

    history.replaceState = function () {
        originalReplaceState.apply(history, arguments);
        setTimeout(applyDropdownStyles, 100);
    };

    window.addEventListener('popstate', function () {
        setTimeout(applyDropdownStyles, 100);
    });

    // Aplicar estilos cuando se detecten cambios en el DOM
    const observer = new MutationObserver(function (mutations) {
        let shouldApply = false;
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1 && (
                        node.classList.contains('clients-page') ||
                        node.querySelector('.clients-page') ||
                        node.querySelector('[data-radix-dropdown-menu-content]')
                    )) {
                        shouldApply = true;
                    }
                });
            }
        });

        if (shouldApply) {
            setTimeout(applyDropdownStyles, 50);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
