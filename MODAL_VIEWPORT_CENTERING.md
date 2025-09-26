# Centrado de Modales en Viewport

## Descripción

Se ha implementado una solución completa para que todos los modales y ventanas emergentes se mantengan centrados en el viewport visible, independientemente del scroll del usuario.

## Características Implementadas

### 1. Modal Portal (`components/ui/modal-portal.tsx`)
- **Posicionamiento fijo**: Usa `position: fixed` con `top: 0, left: 0, right: 0, bottom: 0`
- **Centrado dinámico**: Se centra automáticamente en el viewport visible
- **Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Backdrop**: Fondo semitransparente con blur

### 2. Modal Select (`components/ui/modal-select.tsx`)
- **Centrado inteligente**: Se posiciona en el centro del viewport visible
- **Detección de espacio**: Detecta si debe abrir hacia arriba o abajo
- **Scroll tracking**: Se mantiene centrado durante el scroll
- **Responsive**: Se adapta a móviles y escritorio

### 3. Hook Personalizado (`hooks/use-viewport-centering.ts`)
- **Cálculo automático**: Calcula la posición óptima en el viewport
- **Event listeners**: Escucha scroll y resize para reajustar posición
- **Performance**: Usa `passive: true` para mejor rendimiento
- **Reutilizable**: Puede usarse en otros componentes

### 4. CSS Optimizado (`app/dashboard/styles/modal-select-fix.css`)
- **Media queries**: Responsive design para móviles y escritorio
- **Z-index management**: Asegura que los modales estén por encima
- **Transform centering**: Usa `translate(-50%, -50%)` para centrado perfecto

## Beneficios

### ✅ Centrado Perfecto
- Los modales siempre aparecen en el centro de la pantalla visible
- No importa dónde esté el scroll del usuario

### ✅ Responsivo
- Funciona perfectamente en móviles, tablets y escritorio
- Se adapta automáticamente al tamaño de pantalla

### ✅ Performance
- Usa event listeners optimizados con `passive: true`
- Cálculos eficientes de posición
- No causa re-renders innecesarios

### ✅ Accesibilidad
- Mantiene el foco en el modal
- Permite cerrar con clic fuera
- Compatible con navegación por teclado

## Uso

### Modal Portal
```tsx
<ModalPortal isOpen={isModalOpen}>
  <div>Contenido del modal</div>
</ModalPortal>
```

### Modal Select
```tsx
<ModalSelect
  value={selectedValue}
  onValueChange={setSelectedValue}
  options={options}
  placeholder="Seleccionar..."
/>
```

### Hook Personalizado
```tsx
const position = useViewportCentering({
  elementRef: myRef,
  isOpen: isOpen,
  offsetY: 50,
  offsetX: 0
});
```

## Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Móviles (iOS Safari, Chrome Mobile)
- ✅ Tablets

## Notas Técnicas

1. **Viewport vs Document**: Los modales se posicionan respecto al viewport, no al documento completo
2. **Scroll Handling**: Se recalculan las posiciones automáticamente durante el scroll
3. **Memory Management**: Los event listeners se limpian correctamente
4. **Z-index**: Se usa z-index alto (10010) para asegurar que estén por encima
5. **Transform**: Se usa `transform: translate(-50%, -50%)` para centrado perfecto

## Próximas Mejoras

- [ ] Animaciones de entrada/salida
- [ ] Soporte para múltiples modales
- [ ] Gestión de foco avanzada
- [ ] Soporte para modales anidados
