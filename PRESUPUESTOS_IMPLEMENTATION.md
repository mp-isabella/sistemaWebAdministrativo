# Módulo de Presupuestos - Sistema Web Administrativo

## 📋 Descripción General

Se ha implementado un módulo completo de generación de presupuestos (cotizaciones) que permite crear presupuestos detallados por cliente o servicio, con funcionalidad de descarga en formato PDF con desglose de valores y totales.

## ✨ Características Implementadas

### 1. **Gestión Completa de Presupuestos**
- ✅ Creación de presupuestos con información detallada del cliente
- ✅ Múltiples items de servicios con cantidades y precios unitarios
- ✅ Cálculo automático de subtotales, IVA y totales
- ✅ Estados de presupuesto (Borrador, Enviado, Aceptado, Rechazado, Expirado)
- ✅ Fechas de validez configurables
- ✅ Observaciones y condiciones especiales

### 2. **Plantillas de Servicios Predefinidas**
- ✅ **Desatascos**: Servicio de desatasco de cañerías y alcantarillado ($45,000)
- ✅ **Videoinspección**: Inspección con cámara de tuberías ($35,000)
- ✅ **Reparación de Fugas**: Localización y reparación de fugas ($55,000)
- ✅ **Limpieza de Tuberías**: Limpieza profunda con equipos especializados ($40,000)
- ✅ **Instalación de Plomería**: Instalación y reparación de sistemas ($60,000)
- ✅ **Mantenimiento Preventivo**: Mantenimiento preventivo de sistemas ($30,000)

### 3. **Generación de PDF Profesional**
- ✅ Diseño corporativo con logo y branding de Amestica
- ✅ Información completa del cliente y presupuesto
- ✅ Tabla detallada de servicios con cantidades y precios
- ✅ Desglose de subtotales, IVA y totales
- ✅ Observaciones y condiciones
- ✅ Fecha de validez y datos de contacto
- ✅ Optimizado para impresión

### 4. **Interfaz de Usuario Mejorada**
- ✅ Formulario intuitivo con plantillas de servicios
- ✅ Cálculos automáticos en tiempo real
- ✅ Validación de campos requeridos
- ✅ Vista previa de totales
- ✅ Botones de acción rápida para descarga de PDF

## 🛠️ Componentes Técnicos

### API Endpoints

#### 1. **Gestión de Presupuestos**
```typescript
// Obtener todos los presupuestos
GET /api/quotes

// Crear nuevo presupuesto
POST /api/quotes

// Obtener presupuesto específico
GET /api/quotes/[id]

// Actualizar presupuesto
PUT /api/quotes/[id]

// Eliminar presupuesto
DELETE /api/quotes/[id]
```

#### 2. **Exportación a PDF**
```typescript
// Generar PDF del presupuesto
GET /api/quotes/[id]/export-pdf
```

### Componentes de React

#### 1. **QuoteFormEnhanced**
- Formulario mejorado con plantillas de servicios
- Cálculos automáticos
- Validación de datos
- Interfaz intuitiva

#### 2. **QuoteDetailPage**
- Vista detallada del presupuesto
- Acciones de estado (Enviar, Aceptar, Rechazar)
- Botón de descarga de PDF
- Información completa del cliente

#### 3. **QuotesPage**
- Lista de todos los presupuestos
- Filtros por estado y búsqueda
- Botones de acción rápida
- Descarga directa de PDF

## 📊 Estructura de Datos

### Modelo Quote (Prisma)
```prisma
model Quote {
  id            String      @id @default(cuid())
  quoteNumber   String      @unique
  date          DateTime    @default(now())
  validUntil    DateTime
  subtotal      Float
  tax           Float
  total         Float
  taxRate       Float       @default(19)
  notes         String?
  status        QuoteStatus @default(DRAFT)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  client      Client      @relation(fields: [clientId], references: [id])
  clientId    String
  items       QuoteItem[]
  createdBy   User        @relation("CreatedByUser", fields: [createdById], references: [id])
  createdById String
}
```

### Modelo QuoteItem
```prisma
model QuoteItem {
  id          String   @id @default(cuid())
  description String
  quantity    Int
  unitPrice   Float
  total       Float
  createdAt   DateTime @default(now())

  quote   Quote  @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  quoteId String
}
```

## 🎨 Características del PDF

### Diseño Profesional
- **Encabezado**: Logo y título "PRESUPUESTO" con número único
- **Información del Cliente**: Datos completos incluyendo empresa, RUT, contacto
- **Detalles del Presupuesto**: Fechas, estado, creado por
- **Tabla de Servicios**: Descripción, cantidad, precio unitario, total
- **Resumen de Totales**: Subtotal, IVA, Total con formato de moneda chilena
- **Observaciones**: Condiciones especiales y términos
- **Pie de Página**: Información de contacto y validez

### Formato de Moneda
- Formato chileno (CLP) con separadores de miles
- Ejemplo: $45,000 en lugar de $45000

## 🔄 Flujo de Trabajo

### 1. **Creación de Presupuesto**
1. Usuario selecciona "Nuevo Presupuesto"
2. Completa información del cliente y fechas
3. Agrega servicios desde plantillas o personalizados
4. Revisa totales automáticos
5. Guarda como borrador

### 2. **Gestión de Estados**
- **Borrador**: Presupuesto en creación
- **Enviado**: Presupuesto enviado al cliente
- **Aceptado**: Cliente aceptó el presupuesto
- **Rechazado**: Cliente rechazó el presupuesto
- **Expirado**: Presupuesto fuera de fecha de validez

### 3. **Descarga de PDF**
1. Usuario hace clic en "Descargar PDF"
2. Sistema genera HTML optimizado para impresión
3. Se abre nueva ventana con el contenido
4. Navegador imprime automáticamente
5. Usuario puede guardar como PDF

## 🚀 Funcionalidades Avanzadas

### 1. **Plantillas de Servicios**
- Categorización por tipo de servicio
- Precios base predefinidos
- Descripciones profesionales
- Agregado rápido al presupuesto

### 2. **Cálculos Automáticos**
- Total por item (cantidad × precio unitario)
- Subtotal de todos los items
- IVA configurable (por defecto 19%)
- Total final con IVA incluido

### 3. **Validaciones**
- Cliente requerido
- Fecha de validez obligatoria
- Items con descripción y precios válidos
- Cantidades mayores a cero

### 4. **Permisos de Usuario**
- Solo admin y secretaria pueden crear presupuestos
- Solo admin y secretaria pueden exportar PDFs
- Control de acceso por rol de usuario

## 📱 Responsive Design

- **Desktop**: Vista completa con todas las funcionalidades
- **Tablet**: Layout adaptado con columnas reorganizadas
- **Mobile**: Interfaz optimizada para pantallas pequeñas
- **PDF**: Optimizado para impresión en cualquier dispositivo

## 🔧 Configuración

### Variables de Entorno
```env
# Configuración de base de datos
DATABASE_URL="file:./dev.db"

# Configuración de autenticación
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Dependencias Requeridas
```json
{
  "dependencies": {
    "@prisma/client": "latest",
    "next-auth": "latest",
    "lucide-react": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest"
  }
}
```

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Envío automático por email
- [ ] Plantillas personalizables de servicios
- [ ] Historial de cambios de estado
- [ ] Notificaciones automáticas
- [ ] Integración con facturación
- [ ] Reportes de presupuestos
- [ ] Aprobación en múltiples niveles
- [ ] Firmas digitales

### Optimizaciones Técnicas
- [ ] Caché de plantillas de servicios
- [ ] Generación de PDF en background
- [ ] Compresión de archivos PDF
- [ ] Almacenamiento en la nube
- [ ] API rate limiting
- [ ] Logs de auditoría

## 📞 Soporte

Para consultas sobre el módulo de presupuestos:
- **Email**: contacto@amestica.cl
- **Teléfono**: +56 9 XXXX XXXX
- **Documentación**: Este archivo y comentarios en el código

---

**Desarrollado para Amestica Ltda. - Sistema Web Administrativo**
*Última actualización: Diciembre 2024*
