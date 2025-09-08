# Exportación HTML de Cotizaciones

## 📋 Resumen

Se ha implementado un sistema de exportación HTML para cotizaciones que permite generar reportes rápidos y fáciles de imprimir, similar al sistema de reportes existente. Los reportes se abren en el navegador y pueden ser impresos como PDF directamente.

## 🚀 Funcionalidades Implementadas

### 1. **API de Exportación HTML**
- **Endpoint**: `/api/quotes/export`
- **Método**: GET
- **Parámetros**:
  - `id`: ID de cotización específica (para exportar una sola)
  - `status`: Filtro por estado (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
  - `company`: Filtro por empresa
  - `startDate`: Fecha de inicio para filtro
  - `endDate`: Fecha de fin para filtro

### 2. **Tipos de Reporte**

#### **Reporte Individual**
- Exporta una cotización específica
- Incluye información completa del cliente
- Detalles del servicio y técnico
- Tabla de servicios con precios
- Totales y observaciones
- Diseño profesional con colores de la empresa

#### **Reporte Múltiple**
- Exporta múltiples cotizaciones con filtros
- Estadísticas por estado
- Estadísticas por empresa
- Tabla detallada de todas las cotizaciones
- Totales y promedios

### 3. **Interfaz de Usuario**

#### **Página de Cotizaciones**
- Botón "Exportar Reporte" para exportar todas las cotizaciones filtradas
- Botón de descarga individual en cada cotización
- Los reportes se abren en nueva ventana del navegador

#### **Formulario de Creación**
- Al crear una cotización, automáticamente se genera el reporte HTML
- Se abre en nueva ventana para impresión inmediata

## 🎨 Características del Diseño

### **Diseño Responsivo**
- Optimizado para impresión
- Estilos CSS específicos para PDF
- Botón de impresión integrado

### **Personalización por Empresa**
- Colores específicos de cada empresa
- Logos y información de contacto
- Condiciones específicas por empresa

### **Formato Profesional**
- Encabezado con información de la empresa
- Secciones bien organizadas
- Tablas con estilos profesionales
- Totales claramente destacados

## 📱 Uso

### **Exportar Cotización Individual**
1. Ir a la página de cotizaciones
2. Hacer clic en el botón de descarga (ícono) en la cotización deseada
3. Se abrirá el reporte HTML en nueva ventana
4. Usar Ctrl+P para imprimir como PDF

### **Exportar Reporte General**
1. Ir a la página de cotizaciones
2. Aplicar filtros si es necesario (estado, búsqueda)
3. Hacer clic en "Exportar Reporte"
4. Se abrirá el reporte con todas las cotizaciones filtradas

### **Crear y Exportar Nueva Cotización**
1. Crear una nueva cotización
2. Al guardar, automáticamente se abrirá el reporte HTML
3. Imprimir directamente desde el navegador

## 🔧 Configuración Técnica

### **API Endpoint**
```typescript
GET /api/quotes/export?id={quoteId}
GET /api/quotes/export?status={status}&company={companyId}
```

### **Permisos**
- Solo usuarios con rol "admin" o "secretaria" pueden exportar
- Verificación de sesión activa

### **Formato de Salida**
- Content-Type: text/html
- Headers para descarga automática
- Nombre de archivo con fecha

## 📊 Ventajas del Sistema HTML

### **Rapidez**
- Generación instantánea
- No requiere librerías externas de PDF
- Procesamiento del lado del servidor

### **Facilidad**
- Se abre directamente en el navegador
- Imprimir con Ctrl+P
- No requiere software adicional

### **Flexibilidad**
- Fácil personalización de estilos
- Múltiples formatos de reporte
- Filtros dinámicos

### **Compatibilidad**
- Funciona en todos los navegadores modernos
- Imprime correctamente en cualquier impresora
- Mantiene el formato en diferentes dispositivos

## 🎯 Beneficios

1. **Eficiencia**: Generación rápida de reportes
2. **Accesibilidad**: No requiere software especial
3. **Profesionalismo**: Diseño limpio y profesional
4. **Flexibilidad**: Múltiples opciones de exportación
5. **Consistencia**: Mismo formato que otros reportes del sistema

## 🔄 Integración

El sistema está completamente integrado con:
- Sistema de autenticación existente
- Base de datos de cotizaciones
- Interfaz de usuario actual
- Sistema de permisos por roles

## 📝 Notas de Implementación

- Se eliminó la generación HTML del lado del cliente
- Se centralizó la lógica en la API del servidor
- Se mantiene la consistencia con otros reportes del sistema
- Se optimizó para rendimiento y escalabilidad
