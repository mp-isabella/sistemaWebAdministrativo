# 🏢 Implementación de Sistema de Liquidaciones para Técnicos

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de liquidaciones para técnicos que permite a los administradores gestionar las liquidaciones de sueldo de los técnicos, incluyendo sueldo base, ganancias, deducciones, anticipos y generación de PDF.

## 🎯 Características Principales

### ✅ **Funcionalidades Implementadas:**

1. **Gestión Completa de Liquidaciones**
   - Crear, editar, ver y eliminar liquidaciones
   - Solo accesible para administradores
   - Números únicos de liquidación automáticos

2. **Información del Técnico y Empresa**
   - Selección de técnico desde lista de técnicos activos
   - Selección de empresa (Amestica, Multifugas, Servifugas)
   - Información completa del técnico y empresa

3. **Período de Liquidación**
   - Fecha de inicio y fin del período
   - Validación de fechas
   - Cálculo automático de totales

4. **Items de Liquidación Flexibles**
   - **Ganancias**: Bonos, comisiones, horas extras
   - **Deducciones**: Descuentos varios
   - **Materiales**: Costos de materiales utilizados
   - **Combustible**: Gastos de combustible
   - **Préstamos**: Descuentos por préstamos
   - **Anticipos**: Descuentos por anticipos

5. **Sistema de Anticipos**
   - Historial completo de anticipos
   - Fecha, descripción, monto y notas
   - Descuento automático del total final

6. **Cálculos Automáticos**
   - Sueldo base + ganancias - deducciones - anticipos
   - Total a pagar calculado automáticamente
   - IVA configurable

7. **Estados de Liquidación**
   - **Borrador**: Liquidación en edición
   - **Pendiente**: Liquidación enviada para revisión
   - **Aprobada**: Liquidación aprobada
   - **Pagada**: Liquidación pagada
   - **Cancelada**: Liquidación cancelada

8. **Generación de PDF**
   - Documento profesional con logo de empresa
   - Información completa del técnico y empresa
   - Detalle de todos los items y anticipos
   - Resumen de totales
   - Formato descargable

## 🗄️ Estructura de Base de Datos

### **Modelo Liquidation**
```prisma
model Liquidation {
  id              String            @id @default(cuid())
  liquidationNumber String          @unique
  date            DateTime          @default(now())
  periodStart     DateTime          // Inicio del período
  periodEnd       DateTime          // Fin del período
  baseSalary      Float             // Sueldo base
  totalEarnings   Float             // Total ganancias
  totalDeductions Float             // Total deducciones
  netSalary       Float             // Sueldo neto
  taxRate         Float             @default(19) // IVA
  notes           String?
  status          LiquidationStatus @default(DRAFT)
  
  // Relaciones
  technician      User              @relation("TechnicianLiquidation")
  technicianId    String
  company         Company           @relation(fields: [companyId])
  companyId       String
  createdBy       User              @relation("CreatedByUser")
  createdById     String
  
  items           LiquidationItem[]
  advances        LiquidationAdvance[]
}
```

### **Modelo LiquidationItem**
```prisma
model LiquidationItem {
  id              String   @id @default(cuid())
  description     String
  type            String   // EARNINGS, DEDUCTION, MATERIAL, FUEL, LOAN, ADVANCE
  quantity        Float?
  unitPrice       Float?
  total           Float
  notes           String?
  
  liquidation     Liquidation @relation(fields: [liquidationId])
  liquidationId   String
}
```

### **Modelo LiquidationAdvance**
```prisma
model LiquidationAdvance {
  id              String   @id @default(cuid())
  date            DateTime @default(now())
  amount          Float
  description     String
  notes           String?
  
  liquidation     Liquidation @relation(fields: [liquidationId])
  liquidationId   String
}
```

## 🔌 API Endpoints

### **Gestión de Liquidaciones**
```typescript
// Obtener todas las liquidaciones
GET /api/liquidations

// Crear nueva liquidación
POST /api/liquidations

// Obtener liquidación específica
GET /api/liquidations/[id]

// Actualizar liquidación
PUT /api/liquidations/[id]

// Eliminar liquidación
DELETE /api/liquidations/[id]
```

### **Exportación a PDF**
```typescript
// Generar PDF de liquidación
GET /api/liquidations/[id]/export-pdf
```

## 🎨 Interfaz de Usuario

### **Página Principal de Liquidaciones**
- Lista de todas las liquidaciones
- Filtros por estado, técnico y empresa
- Búsqueda por número, técnico o empresa
- Acciones rápidas: ver, editar, descargar PDF, eliminar

### **Formulario de Liquidación**
- **Información Básica**: Técnico, empresa, período, sueldo base, IVA
- **Items de Liquidación**: Lista dinámica con tipos flexibles
- **Anticipos**: Historial de anticipos con fechas
- **Resumen**: Cálculo automático de totales
- **Validación**: Validación completa de formulario

### **Vista de Detalle**
- Información completa del técnico y empresa
- Detalle de todos los items con tipos y montos
- Historial de anticipos
- Resumen de totales
- Botones de acción: editar, descargar PDF, eliminar

## 🔐 Control de Acceso

### **Permisos Implementados**
- **Solo Administradores**: Acceso completo a liquidaciones
- **Secretarias**: Sin acceso (no aparece en menú)
- **Técnicos**: Sin acceso (no aparece en menú)

### **Validaciones de Seguridad**
- Verificación de sesión en todos los endpoints
- Validación de rol de administrador
- Protección contra eliminación de liquidaciones pagadas

## 📊 Cálculos y Lógica de Negocio

### **Fórmula de Liquidación**
```
Sueldo Neto = Sueldo Base + Total Ganancias - Total Deducciones - Total Anticipos
```

### **Tipos de Items**
- **EARNINGS**: Se suman al sueldo base
- **DEDUCTION/MATERIAL/FUEL/LOAN/ADVANCE**: Se restan del total

### **Validaciones**
- Fecha de fin debe ser posterior a fecha de inicio
- Sueldo base no puede ser negativo
- IVA debe estar entre 0 y 100%
- Técnico y empresa son obligatorios

## 🎯 Casos de Uso

### **1. Crear Nueva Liquidación**
1. Administrador accede a "Liquidaciones"
2. Hace clic en "Nueva Liquidación"
3. Selecciona técnico y empresa
4. Define período de liquidación
5. Establece sueldo base e IVA
6. Agrega items (ganancias, deducciones, materiales, etc.)
7. Registra anticipos si los hay
8. Revisa resumen automático
9. Guarda liquidación

### **2. Editar Liquidación Existente**
1. Administrador accede a liquidación específica
2. Hace clic en "Editar"
3. Modifica información según necesidades
4. Agrega o elimina items
5. Actualiza anticipos
6. Guarda cambios

### **3. Generar PDF**
1. Administrador accede a liquidación
2. Hace clic en "Descargar PDF"
3. Se genera documento HTML con formato profesional
4. Se descarga automáticamente

### **4. Gestionar Estados**
1. Liquidación creada en estado "Borrador"
2. Administrador puede cambiar a "Pendiente"
3. Puede aprobar como "Aprobada"
4. Al pagar cambia a "Pagada"
5. Puede cancelar como "Cancelada"

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **Next.js 14**: Framework de React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Shadcn/ui**: Componentes de UI
- **Lucide React**: Iconos

### **Backend**
- **Next.js API Routes**: Endpoints de API
- **Prisma**: ORM para base de datos
- **SQLite**: Base de datos (desarrollo)

### **Autenticación**
- **NextAuth.js**: Autenticación y autorización
- **Control de roles**: Admin, Secretaria, Técnico

## 📁 Estructura de Archivos

```
app/
├── api/
│   └── liquidations/
│       ├── route.ts                    # GET, POST liquidaciones
│       ├── [id]/
│       │   ├── route.ts                # GET, PUT, DELETE específica
│       │   └── export-pdf/
│       │       └── route.ts            # Generar PDF
├── dashboard/
│   └── liquidations/
│       ├── page.tsx                    # Lista de liquidaciones
│       ├── new/
│       │   └── page.tsx                # Crear liquidación
│       └── [id]/
│           ├── page.tsx                # Ver liquidación
│           └── edit/
│               └── page.tsx            # Editar liquidación
components/
└── forms/
    └── liquidation-form.tsx            # Formulario de liquidación
```

## 🔧 Configuración y Despliegue

### **Requisitos**
- Node.js 18+
- Base de datos SQLite (o compatible con Prisma)
- NextAuth.js configurado

### **Instalación**
1. Ejecutar migración de base de datos:
   ```bash
   npx prisma migrate dev --name add_liquidation_models
   ```

2. Generar cliente de Prisma:
   ```bash
   npx prisma generate
   ```

3. Reiniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🎨 Personalización

### **Empresas Soportadas**
- **Amestica**: Logo y colores personalizados
- **Multifugas**: Logo y colores personalizados  
- **Servifugas**: Logo y colores personalizados

### **Tipos de Items Extensibles**
- Fácil agregar nuevos tipos de items
- Configuración flexible de cálculos
- Soporte para diferentes tipos de deducciones

## 🔮 Mejoras Futuras

### **Funcionalidades Planificadas**
1. **Integración con Trabajos**: Cálculo automático de ganancias basado en trabajos completados
2. **Plantillas de Liquidación**: Plantillas predefinidas para diferentes tipos de técnicos
3. **Notificaciones**: Notificaciones automáticas a técnicos cuando se crea su liquidación
4. **Firma Digital**: Sistema de firma digital para aprobación
5. **Historial de Cambios**: Auditoría de cambios en liquidaciones
6. **Reportes Avanzados**: Reportes de liquidaciones por período, técnico, empresa

### **Optimizaciones Técnicas**
1. **Generación de PDF Real**: Implementar Puppeteer para PDF real
2. **Caché**: Implementar caché para mejorar rendimiento
3. **Validación Avanzada**: Validaciones más complejas de negocio
4. **Backup Automático**: Sistema de backup de liquidaciones

## 📞 Soporte

Para soporte técnico o consultas sobre la implementación de liquidaciones, contactar al equipo de desarrollo.

---

**Fecha de Implementación**: Diciembre 2024  
**Versión**: 1.0.0  
**Estado**: ✅ Completado y Funcional
