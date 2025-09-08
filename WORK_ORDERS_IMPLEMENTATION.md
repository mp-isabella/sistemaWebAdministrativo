# Módulo de Órdenes de Trabajo y Facturación - Sistema Web Administrativo

## 📋 Descripción General

Se ha implementado un módulo completo de gestión de órdenes de trabajo con vinculación a servicios ejecutados, identidad visual diferenciada por empresa (Améstica, Multifugas, Servifugas) y generación de reportes contables en PDF para uso interno.

## ✨ Características Implementadas

### 1. **Gestión Completa de Órdenes de Trabajo**
- ✅ Creación y edición de órdenes de trabajo con información detallada
- ✅ Vinculación con servicios ejecutados y clientes
- ✅ Asignación de técnicos y programación de fechas
- ✅ Estados de orden (Borrador, En Progreso, Completado, Cancelado, Facturado)
- ✅ Prioridades configurables (Baja, Media, Alta, Urgente)
- ✅ Items detallados con cantidades, precios y totales
- ✅ Cálculo automático de subtotales, IVA y totales

### 2. **Identidad Visual Diferenciada por Empresa**
- ✅ **Améstica**: Colores azules (#1e40af, #3b82f6)
- ✅ **Multifugas**: Colores verdes (#059669, #10b981)
- ✅ **Servifugas**: Colores rojos (#dc2626, #ef4444)
- ✅ Logos y branding personalizados por empresa
- ✅ Formularios y PDFs con colores corporativos
- ✅ Indicadores visuales en listados y reportes

### 3. **Generación de PDF Profesional**
- ✅ Diseño corporativo con logo y branding específico por empresa
- ✅ Información completa del cliente y orden de trabajo
- ✅ Tabla detallada de items con cantidades y precios
- ✅ Desglose de subtotales, IVA y totales
- ✅ Observaciones y condiciones
- ✅ Marcado como "documento de uso interno, no tributario"
- ✅ Optimizado para impresión

### 4. **Interfaz de Usuario Avanzada**
- ✅ Formulario intuitivo con validaciones
- ✅ Cálculos automáticos en tiempo real
- ✅ Filtros por empresa, estado y búsqueda
- ✅ Vista previa de totales
- ✅ Botones de acción rápida para descarga de PDF
- ✅ Responsive design para móviles

## 🛠️ Componentes Técnicos

### API Endpoints

#### 1. **Gestión de Órdenes de Trabajo**
```typescript
// Obtener todas las órdenes de trabajo
GET /api/work-orders

// Crear nueva orden de trabajo
POST /api/work-orders

// Obtener orden específica
GET /api/work-orders/[id]

// Actualizar orden de trabajo
PUT /api/work-orders/[id]

// Eliminar orden de trabajo
DELETE /api/work-orders/[id]
```

#### 2. **Exportación a PDF**
```typescript
// Generar PDF de la orden de trabajo
GET /api/work-orders/[id]/export-pdf
```

#### 3. **Gestión de Empresas**
```typescript
// Obtener todas las empresas
GET /api/companies

// Crear nueva empresa
POST /api/companies
```

### Componentes de React

#### 1. **WorkOrderForm**
- Formulario completo con validaciones
- Selección de empresa con colores corporativos
- Gestión de items con cálculos automáticos
- Interfaz intuitiva y responsive

#### 2. **WorkOrdersPage**
- Lista de todas las órdenes de trabajo
- Filtros por empresa, estado y búsqueda
- Botones de acción rápida
- Descarga directa de PDF

#### 3. **PDF Generation**
- HTML optimizado para impresión
- Colores corporativos por empresa
- Información completa y profesional
- Auto-impresión al abrir

## 📊 Estructura de Datos

### Modelo WorkOrder (Prisma)
```prisma
model WorkOrder {
  id                String          @id @default(cuid())
  workOrderNumber   String          @unique
  title             String
  description       String?
  status            WorkOrderStatus @default(DRAFT)
  priority          JobPriority     @default(MEDIUM)
  scheduledAt       DateTime?
  startTime         String?
  endTime           String?
  startedAt         DateTime?
  completedAt       DateTime?
  address           String?
  notes             String?
  images            String?
  signature         String?
  subtotal          Float           @default(0)
  tax               Float           @default(0)
  total             Float           @default(0)
  taxRate           Float           @default(19)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  client            Client          @relation(fields: [clientId], references: [id])
  clientId          String
  company           Company         @relation(fields: [companyId], references: [id])
  companyId         String
  service           Service         @relation(fields: [serviceId], references: [id])
  serviceId         String
  technician        User?           @relation("AssignedTechnician", fields: [technicianId], references: [id])
  technicianId      String?
  createdBy         User            @relation("CreatedByUser", fields: [createdById], references: [id])
  createdById       String
  items             WorkOrderItem[]
  relatedJob        Job?            @relation(fields: [jobId], references: [id])
  jobId             String?         @unique
}
```

### Modelo Company
```prisma
model Company {
  id              String      @id @default(cuid())
  name            String      @unique
  type            CompanyType
  logo            String?
  primaryColor    String?
  secondaryColor  String?
  address         String?
  phone           String?
  email           String?
  website         String?
  taxId           String?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  workOrders      WorkOrder[]
  invoices        Invoice[]
  quotes          Quote[]
}
```

### Modelo WorkOrderItem
```prisma
model WorkOrderItem {
  id          String   @id @default(cuid())
  description String
  quantity    Int
  unitPrice   Float
  total       Float
  notes       String?
  createdAt   DateTime @default(now())

  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  workOrderId String
}
```

## 🎨 Características del PDF

### Diseño Profesional por Empresa
- **Encabezado**: Logo y título "ORDEN DE TRABAJO" con número único
- **Información del Cliente**: Datos completos incluyendo empresa, RUT, contacto
- **Detalles del Trabajo**: Fechas, estado, técnico asignado, prioridad
- **Tabla de Items**: Descripción, cantidad, precio unitario, total
- **Resumen de Totales**: Subtotal, IVA, Total con formato de moneda chilena
- **Observaciones**: Condiciones especiales y términos
- **Pie de Página**: Información de contacto y validez

### Colores Corporativos
- **Améstica**: Azul profesional (#1e40af, #3b82f6)
- **Multifugas**: Verde confiable (#059669, #10b981)
- **Servifugas**: Rojo dinámico (#dc2626, #ef4444)

### Formato de Moneda
- Formato chileno (CLP) con separadores de miles
- Ejemplo: $45,000 en lugar de $45000

## 🔄 Flujo de Trabajo

### 1. **Creación de Orden de Trabajo**
1. Usuario selecciona "Nueva Orden"
2. Completa información del cliente y empresa
3. Selecciona servicio y técnico
4. Programa fecha y horario
5. Agrega items con cantidades y precios
6. Revisa totales automáticos
7. Guarda como borrador

### 2. **Gestión de Estados**
- **Borrador**: Orden en creación
- **En Progreso**: Trabajo iniciado
- **Completado**: Trabajo finalizado
- **Cancelado**: Orden cancelada
- **Facturado**: Orden facturada

### 3. **Descarga de PDF**
1. Usuario hace clic en "Descargar PDF"
2. Sistema genera HTML con colores corporativos
3. Se abre nueva ventana con el contenido
4. Navegador imprime automáticamente
5. Usuario puede guardar como PDF

## 🚀 Funcionalidades Avanzadas

### 1. **Vinculación con Servicios**
- Categorización por tipo de servicio
- Precios base predefinidos
- Descripciones profesionales
- Agregado rápido a la orden

### 2. **Cálculos Automáticos**
- Total por item (cantidad × precio unitario)
- Subtotal de todos los items
- IVA configurable (por defecto 19%)
- Total final con IVA incluido

### 3. **Validaciones**
- Cliente requerido
- Empresa requerida
- Servicio requerido
- Fecha programada obligatoria
- Items con descripción y precios válidos

### 4. **Permisos de Usuario**
- Solo admin y secretaria pueden crear órdenes
- Solo admin y secretaria pueden exportar PDFs
- Técnicos pueden ver solo sus órdenes asignadas
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
    "@radix-ui/react-separator": "latest",
    "date-fns": "latest"
  }
}
```

### Seed de Empresas
```bash
# Ejecutar para crear las empresas con sus configuraciones
npx tsx prisma/seed-companies.ts
```

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Envío automático por email
- [ ] Plantillas personalizables de servicios
- [ ] Historial de cambios de estado
- [ ] Notificaciones automáticas
- [ ] Integración con facturación tributaria
- [ ] Reportes de órdenes por empresa
- [ ] Aprobación en múltiples niveles
- [ ] Firmas digitales
- [ ] Fotos de evidencia
- [ ] GPS tracking de técnicos

### Optimizaciones Técnicas
- [ ] Caché de plantillas de servicios
- [ ] Generación de PDF en background
- [ ] Compresión de archivos PDF
- [ ] Almacenamiento en la nube
- [ ] API rate limiting
- [ ] Logs de auditoría
- [ ] Backup automático

## 📞 Soporte

Para consultas sobre el módulo de órdenes de trabajo:
- **Email**: contacto@amestica.cl
- **Teléfono**: +56 9 XXXX XXXX
- **Documentación**: Este archivo y comentarios en el código

---

**Desarrollado para Amestica Ltda. - Sistema Web Administrativo**
*Última actualización: Diciembre 2024*
