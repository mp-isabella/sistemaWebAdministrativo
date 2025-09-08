# Sistema de Cotizaciones Mejorado

## 🎯 Objetivo

Implementar un sistema de cotizaciones que permita generar documentos profesionales con diferentes diseños según la empresa seleccionada, basándose en las cotizaciones reales de las tres empresas del sistema.

## 🏢 Empresas Soportadas

### 1. **AMESTICA LIMITADA**
- **Servicio**: Detección y reparación de filtraciones de agua potable
- **RUT**: 76.508.960-3
- **Dirección**: Hamburgo 1398, Ñuñoa
- **Email**: amesticaltda@gmail.com
- **Teléfono**: 222660040
- **Colores**: Azul profesional (#1e40af, #3b82f6)
- **Logo**: Diseño circular con elementos anidados

### 2. **MULTIFUGAS**
- **Servicio**: Detección y reparación de filtraciones de agua potable
- **RUT**: 78.135.216-0
- **Dirección**: Av. Américo Vespucio 3121, Macul, Santiago
- **Email**: multifugas@gmail.com
- **Teléfono**: +569 78868002
- **Colores**: Azul profesional (#1e40af, #3b82f6)
- **Logo**: Diseño circular con elementos anidados

### 3. **SERVIFUGAS SPA**
- **Servicio**: Detección de filtraciones en agua potable y reparación de cañerías
- **RUT**: 78.135.232-2
- **Dirección**: Lo Barnechea 1559
- **Email**: Servifugas1@gmail.com
- **Teléfono**: +569 92492720
- **Colores**: Verde confiable (#059669, #10b981)
- **Logo**: Diseño circular con letra "S" en verde

## ✨ Nuevas Características

### 📋 Campos Adicionales en el Formulario

#### **Información del Servicio**
- **Técnico**: Selección del técnico asignado al trabajo
- **Tipo de Servicio**: 
  - Detección de Filtración
  - Reparación de Cañería
  - Detección y Reparación
  - Mantenimiento
  - Servicio de Emergencia
- **Diagnóstico**: Descripción del problema detectado

#### **Detalles de Items Mejorados**
- **Descripción**: Detalle del servicio a realizar
- **Materiales**: Lista de materiales utilizados
- **Área Expuesta**: Dimensiones del área trabajada
- **Cantidad**: Número de unidades
- **Precio Unitario**: Costo por unidad
- **Total**: Cálculo automático

### 🎨 Diseño de Cotizaciones

#### **Estructura del Documento**
1. **Encabezado**: Logo y información de la empresa
2. **Título**: Según el tipo de servicio
3. **Información del Cliente**: Datos completos
4. **Detalles del Servicio**: Fechas, técnico, tipo
5. **Diagnóstico**: Si aplica
6. **Tabla de Servicios**: Con materiales y área expuesta
7. **Totales**: Neto, IVA, Total (destacado en amarillo)
8. **Observaciones**: Condiciones especiales
9. **Condiciones Generales**: Específicas por empresa

#### **Títulos Dinámicos**
- **Detección**: "PRESUPUESTO POR DETECCIÓN DE FILTRACIÓN"
- **Reparación**: "PRESUPUESTO POR SERVICIO DE REPARACIÓN"
- **Otros**: "COTIZACIÓN"

### 📄 Condiciones por Empresa

#### **SERVIFUGAS**
- Pago en dos partes (50% inicio, 50% final)
- Exposición mínima de cañería
- Presupuesto de reparación post-detección
- Responsabilidad del cliente en retiro de muebles
- Sin trabajos de terminación
- Margen de error de 2 metros
- Garantía de 3 meses
- Validez de 30 días

#### **AMESTICA**
- Pago 100% al inicio
- Sin terminaciones
- Garantía de 3 meses
- Validez de 30 días

#### **MULTIFUGAS**
- Pago 50% inicio, 50% final
- Sin terminaciones de piso
- Sin retiro de escombros
- Revisión de medidor post-reparación
- Garantía de 3 meses
- Validez de 30 días

## 🔧 Implementación Técnica

### **Base de Datos**
```sql
-- Nuevos campos en tabla quotes
ALTER TABLE quotes ADD COLUMN technician TEXT;
ALTER TABLE quotes ADD COLUMN diagnosis TEXT;
ALTER TABLE quotes ADD COLUMN serviceType TEXT;

-- Nuevos campos en tabla quote_items
ALTER TABLE quote_items ADD COLUMN materials TEXT;
ALTER TABLE quote_items ADD COLUMN exposedArea TEXT;
```

### **Componentes Creados/Modificados**

#### **1. QuoteFormEnhanced** (`components/forms/quote-form-enhanced.tsx`)
- Formulario mejorado con nuevos campos
- Validación de técnico requerido
- Campos para materiales y área expuesta
- Configuración automática por empresa

#### **2. QuoteTemplate** (`components/quote/quote-template.tsx`)
- Template profesional para visualización
- Diseño específico por empresa
- Botones de impresión y descarga
- Vista previa antes de generar PDF

#### **3. API Endpoints**
- **POST /api/quotes**: Creación con nuevos campos
- **GET /api/quotes/[id]/export-pdf**: PDF con diseño mejorado

#### **4. Páginas Actualizadas**
- **Nueva cotización**: Formulario mejorado
- **Detalle de cotización**: Vista con template
- **Lista de cotizaciones**: Compatible con nuevos campos

### **Configuración de Empresas**
```typescript
const getCompanyConfig = (companyType: string) => {
  const configs = {
    AMESTICA: {
      name: 'AMESTICA LIMITADA',
      service: 'Servicio de detección y reparación de filtraciones de agua potable',
      rut: '76.508.960-3',
      address: 'Hamburgo 1398, Ñuñoa.',
      email: 'amesticaltda@gmail.com',
      phone: '222660040',
      colors: { primary: '#1e40af', secondary: '#3b82f6' }
    },
    // ... configuraciones para otras empresas
  }
}
```

## 📱 Funcionalidades del Usuario

### **Creación de Cotización**
1. Seleccionar cliente y empresa
2. Completar información del servicio
3. Agregar items con materiales y área expuesta
4. Revisar totales automáticos
5. Guardar cotización

### **Visualización**
1. **Vista Detallada**: Información completa en formato de tarjetas
2. **Vista de Presupuesto**: Template profesional para impresión
3. **Descarga PDF**: Archivo HTML optimizado para impresión

### **Gestión de Estados**
- **Borrador**: Edición permitida
- **Enviado**: Listo para cliente
- **Aceptado**: Convertir a factura
- **Rechazado**: Finalizado
- **Expirado**: Automático después de 30 días

## 🎨 Características de Diseño

### **Responsive Design**
- Adaptable a móviles y tablets
- Impresión optimizada
- Navegación intuitiva

### **Colores Corporativos**
- **Améstica**: Azul profesional
- **Multifugas**: Azul profesional
- **Servifugas**: Verde confiable

### **Tipografía y Espaciado**
- Fuentes legibles para impresión
- Espaciado profesional
- Jerarquía visual clara

## 🔄 Flujo de Trabajo

### **1. Creación**
```
Cliente → Empresa → Servicio → Items → Revisión → Guardar
```

### **2. Gestión**
```
Borrador → Enviado → Aceptado/Rechazado → Factura (si aceptado)
```

### **3. Impresión**
```
Vista Detallada → Vista de Presupuesto → Descargar PDF → Imprimir
```

## 📊 Beneficios Implementados

### **Para el Usuario**
- ✅ Formularios más completos y profesionales
- ✅ Diseños específicos por empresa
- ✅ Generación automática de PDFs
- ✅ Vista previa antes de imprimir
- ✅ Gestión completa de estados

### **Para el Cliente**
- ✅ Documentos profesionales y consistentes
- ✅ Información detallada de servicios
- ✅ Condiciones claras por empresa
- ✅ Fácil lectura e impresión

### **Para la Empresa**
- ✅ Branding consistente
- ✅ Información legal completa
- ✅ Trazabilidad de servicios
- ✅ Gestión eficiente de cotizaciones

## 🚀 Próximas Mejoras

### **Funcionalidades Adicionales**
- [ ] Plantillas personalizables por empresa
- [ ] Firma digital en cotizaciones
- [ ] Envío automático por email
- [ ] Historial de versiones
- [ ] Integración con calendario

### **Optimizaciones**
- [ ] Cache de templates
- [ ] Compresión de PDFs
- [ ] Validación avanzada
- [ ] Reportes automáticos

---

**Fecha de Implementación**: 28 de Agosto, 2025
**Versión**: 2.0.0
**Estado**: ✅ Completado
