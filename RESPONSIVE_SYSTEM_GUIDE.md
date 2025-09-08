# 📱 Guía del Sistema Responsivo - Améstica

## 🎯 Resumen

Se ha implementado un sistema responsivo completo que garantiza una experiencia óptima en todos los dispositivos: móviles, tablets y notebooks/desktop.

## 🛠️ Componentes Implementados

### 1. **Hook de Responsividad** (`hooks/use-responsive.ts`)
```typescript
const { isMobile, isTablet, isDesktop, screenWidth, breakpoint } = useResponsive();
```

**Características:**
- Detección automática del tipo de dispositivo
- Breakpoints: xs (374px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Actualización en tiempo real al cambiar orientación
- Hook adicional para clases responsivas predefinidas

### 2. **Contenedores Responsivos** (`components/ui/responsive-container.tsx`)

#### ResponsiveContainer
```typescript
<ResponsiveContainer padding={true} maxWidth={true} center={true}>
  {children}
</ResponsiveContainer>
```

#### ResponsiveGrid
```typescript
<ResponsiveGrid 
  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="md"
>
  {children}
</ResponsiveGrid>
```

#### ResponsiveFlex
```typescript
<ResponsiveFlex 
  direction="responsive" // col en móvil, row en desktop
  justify="between"
  align="center"
  gap="md"
>
  {children}
</ResponsiveFlex>
```

### 3. **Tablas Responsivas** (`components/ui/responsive-table.tsx`)

#### ResponsiveHybridTable
- **Móvil**: Vista de tarjetas con información organizada
- **Desktop**: Tabla tradicional con scroll horizontal
- **Características**: Filtros, ordenamiento, paginación

```typescript
<ResponsiveHybridTable
  data={data}
  columns={columns}
  onRowClick={handleRowClick}
  stickyHeader={true}
/>
```

### 4. **Modales Responsivos** (`components/ui/responsive-modal.tsx`)

#### Tipos de Modales:
- **ResponsiveModal**: Modal básico con tamaños adaptativos
- **ResponsiveConfirmModal**: Modal de confirmación
- **ResponsiveFormModal**: Modal con formulario
- **ResponsiveInfoModal**: Modal informativo

```typescript
<ResponsiveModal
  isOpen={isOpen}
  onClose={onClose}
  title="Título"
  size="md" // sm, md, lg, xl, full
  closeOnOverlayClick={true}
  closeOnEscape={true}
>
  {children}
</ResponsiveModal>
```

### 5. **Calendario Responsivo** (`components/calendar/responsive-calendar.tsx`)

**Vista Móvil:**
- Lista vertical de trabajos por horario
- Filtros colapsibles
- Navegación simplificada
- Modales de pantalla completa

**Vista Desktop:**
- Tabla de calendario tradicional
- Múltiples columnas de técnicos
- Filtros siempre visibles
- Modales de tamaño medio

## 📐 Breakpoints y Estrategias

### Breakpoints Definidos:
```css
xs: 374px    /* Móviles pequeños */
sm: 640px    /* Móviles grandes */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops pequeños */
xl: 1280px   /* Laptops grandes */
2xl: 1536px  /* Monitores grandes */
```

### Estrategias de Diseño:

#### 1. **Mobile First**
- Diseño base para móviles
- Mejoras progresivas para pantallas más grandes
- Uso de `min-width` en media queries

#### 2. **Contenido Adaptativo**
- **Móvil**: Una columna, navegación colapsible
- **Tablet**: Dos columnas, navegación parcial
- **Desktop**: Múltiples columnas, navegación completa

#### 3. **Interacciones Táctiles**
- Botones mínimo 44px de altura
- Espaciado adecuado entre elementos
- Gestos de swipe y touch optimizados

## 🎨 Clases CSS Responsivas

### Utilidades Predefinidas:
```css
/* Texto responsivo */
.responsive-text { @apply text-sm sm:text-base lg:text-lg; }
.responsive-heading { @apply text-lg sm:text-xl lg:text-2xl xl:text-3xl; }

/* Espaciado responsivo */
.responsive-padding { @apply p-3 sm:p-4 lg:p-6; }
.responsive-margin { @apply m-3 sm:m-4 lg:m-6; }
.responsive-gap { @apply gap-3 sm:gap-4 lg:gap-6; }

/* Grid responsivo */
.grid-mobile { @apply grid-cols-1; }
.grid-tablet { @apply grid-cols-2; }
.grid-desktop { @apply grid-cols-3; }

/* Flexbox responsivo */
.flex-mobile { @apply flex-col; }
.flex-desktop { @apply flex-row; }
```

## 📱 Optimizaciones por Dispositivo

### Móviles (≤ 640px):
- **Navegación**: Sidebar colapsible con overlay
- **Formularios**: Campos de ancho completo, botones apilados
- **Tablas**: Vista de tarjetas con información organizada
- **Modales**: Pantalla completa con navegación optimizada
- **Calendario**: Lista vertical con filtros colapsibles

### Tablets (641px - 1024px):
- **Navegación**: Sidebar parcialmente visible
- **Formularios**: Dos columnas cuando es posible
- **Tablas**: Scroll horizontal con columnas fijas
- **Modales**: Tamaño medio con mejor aprovechamiento del espacio
- **Calendario**: Vista híbrida con columnas adaptativas

### Desktop (≥ 1025px):
- **Navegación**: Sidebar siempre visible
- **Formularios**: Múltiples columnas optimizadas
- **Tablas**: Vista completa con todas las funcionalidades
- **Modales**: Tamaños variables según contenido
- **Calendario**: Vista completa con múltiples columnas

## 🔧 Implementación en Componentes

### Ejemplo de Formulario Responsivo:
```typescript
export default function ResponsiveForm() {
  const { isMobile, isTablet } = useResponsive();
  
  return (
    <ResponsiveContainer>
      <form className="space-y-3 sm:space-y-4">
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Campo 1</Label>
            <Input className="text-sm sm:text-base" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Campo 2</Label>
            <Input className="text-sm sm:text-base" />
          </div>
        </ResponsiveGrid>
        
        <ResponsiveFlex 
          direction="responsive"
          justify="end"
          gap="md"
        >
          <Button className="w-full sm:w-auto">Guardar</Button>
          <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
        </ResponsiveFlex>
      </form>
    </ResponsiveContainer>
  );
}
```

### Ejemplo de Tabla Responsiva:
```typescript
const columns = [
  { key: 'name', label: 'Nombre', render: (value) => value },
  { key: 'email', label: 'Email', render: (value) => value },
  { key: 'status', label: 'Estado', render: (value) => <Badge>{value}</Badge> }
];

<ResponsiveHybridTable
  data={users}
  columns={columns}
  onRowClick={(user) => handleUserClick(user)}
  stickyHeader={true}
/>
```

## 🚀 Mejores Prácticas

### 1. **Performance**
- Lazy loading de componentes pesados
- Optimización de imágenes responsivas
- Debounce en búsquedas y filtros
- Memoización de componentes costosos

### 2. **Accesibilidad**
- Contraste adecuado en todos los tamaños
- Navegación por teclado optimizada
- Texto legible sin zoom
- Indicadores de estado claros

### 3. **UX/UI**
- Transiciones suaves entre breakpoints
- Feedback visual inmediato
- Carga progresiva de contenido
- Estados de error y éxito claros

### 4. **Mantenimiento**
- Componentes reutilizables
- Clases CSS consistentes
- Documentación actualizada
- Testing en múltiples dispositivos

## 📊 Métricas de Rendimiento

### Objetivos de Performance:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimizaciones Implementadas:
- Compresión de imágenes
- Lazy loading de componentes
- Code splitting por rutas
- Optimización de fuentes
- Minificación de CSS/JS

## 🔍 Testing y Validación

### Herramientas de Testing:
- **Chrome DevTools**: Simulación de dispositivos
- **Lighthouse**: Auditoría de performance
- **Responsive Design Mode**: Testing visual
- **Real Device Testing**: Validación en dispositivos reales

### Checklist de Validación:
- [ ] Funcionalidad en móviles (iOS/Android)
- [ ] Funcionalidad en tablets (iPad/Android)
- [ ] Funcionalidad en desktop (Windows/Mac)
- [ ] Navegación por teclado
- [ ] Lectores de pantalla
- [ ] Performance en conexiones lentas
- [ ] Orientación landscape/portrait

## 📈 Próximas Mejoras

### Funcionalidades Futuras:
- [ ] PWA (Progressive Web App)
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Gestos avanzados
- [ ] Modo oscuro responsivo
- [ ] Internacionalización (i18n)

### Optimizaciones Técnicas:
- [ ] Service Workers
- [ ] Caching inteligente
- [ ] Preloading de rutas críticas
- [ ] Optimización de bundle size
- [ ] Tree shaking avanzado

---

## 📞 Soporte

Para consultas sobre el sistema responsivo o reportar problemas:
- **Documentación**: Este archivo
- **Componentes**: `/components/ui/responsive-*`
- **Hooks**: `/hooks/use-responsive.ts`
- **Estilos**: `/app/dashboard/styles/responsive-*`

El sistema está diseñado para ser escalable, mantenible y proporcionar una experiencia de usuario excepcional en todos los dispositivos.