# Implementación de Asignación de Cotizaciones Existentes

## Descripción
Se ha implementado la funcionalidad para asignar cotizaciones ya creadas a trabajos específicos, permitiendo mantener un historial de cotizaciones y reutilizar cotizaciones existentes.

## Funcionalidades Implementadas

### 1. Endpoint API para Asignación de Cotizaciones
**Archivo:** `app/api/jobs/[id]/assign-quote/route.ts`

#### GET - Obtener Cotizaciones Disponibles
- Obtiene todas las cotizaciones del cliente que no están asignadas a ningún trabajo
- Incluye información completa de la cotización (items, creador, etc.)
- Filtra por cliente del trabajo

#### POST - Asignar Cotización
- Asigna una cotización existente a un trabajo específico
- Valida que la cotización pertenezca al mismo cliente
- Verifica que la cotización no esté ya asignada
- Actualiza las notas de la cotización con información del trabajo

### 2. Modal de Detalles del Trabajo Mejorado
**Archivo:** `components/calendar/job-details-modal.tsx`

#### Nuevos Estados
- `showQuoteAssignment`: Controla la visibilidad del modal de asignación
- `availableQuotes`: Lista de cotizaciones disponibles para asignar
- `isLoadingQuotes`: Estado de carga al obtener cotizaciones
- `isAssigningQuote`: Estado de carga al asignar cotización

#### Nuevas Funciones
- `handleAssignQuote()`: Carga cotizaciones disponibles y abre el modal
- `handleSelectQuote(quoteId)`: Asigna la cotización seleccionada al trabajo

#### Nuevo Botón
- "Asignar Cotización Existente" - Solo visible para admin y secretaria
- Se muestra debajo de los botones de "Ver pago" y "Ver Cotización"

### 3. Modal de Selección de Cotizaciones
- Interfaz intuitiva para seleccionar cotizaciones disponibles
- Muestra información relevante: número, total, fechas, estado
- Validación de permisos (solo admin y secretaria)
- Manejo de estados de carga y errores

## Flujo de Trabajo

1. **Usuario abre detalles del trabajo**
   - Se muestra el botón "Asignar Cotización Existente"

2. **Usuario hace clic en "Asignar Cotización Existente"**
   - Se cargan las cotizaciones disponibles del cliente
   - Se abre el modal de selección

3. **Usuario selecciona una cotización**
   - Se valida que la cotización sea del mismo cliente
   - Se verifica que no esté ya asignada
   - Se asigna la cotización al trabajo

4. **Confirmación**
   - Se muestra mensaje de éxito
   - Se cierra el modal
   - Se actualiza la información del trabajo

## Validaciones Implementadas

### En el Backend
- Verificación de permisos (solo admin y secretaria)
- Validación de existencia del trabajo
- Validación de existencia de la cotización
- Verificación de que la cotización pertenezca al mismo cliente
- Verificación de que la cotización no esté ya asignada
- Verificación de que el trabajo no tenga ya una cotización

### En el Frontend
- Estados de carga durante las operaciones
- Manejo de errores con mensajes informativos
- Validación de permisos de usuario
- Interfaz responsiva y accesible

## Beneficios

1. **Historial de Cotizaciones**: Permite mantener un registro de todas las cotizaciones creadas
2. **Reutilización**: Evita duplicar cotizaciones similares
3. **Trazabilidad**: Vincula cotizaciones con trabajos específicos
4. **Eficiencia**: Reduce el tiempo de creación de nuevas cotizaciones
5. **Organización**: Mejora la gestión de cotizaciones y trabajos

## Consideraciones Técnicas

- **Base de Datos**: Utiliza la relación existente entre `Quote` y `Job` en el schema de Prisma
- **Permisos**: Solo usuarios con rol "admin" o "secretaria" pueden asignar cotizaciones
- **Validaciones**: Múltiples capas de validación para evitar inconsistencias
- **UX**: Interfaz intuitiva con estados de carga y mensajes informativos
- **Performance**: Consultas optimizadas para obtener solo cotizaciones relevantes

## Archivos Modificados

1. `app/api/jobs/[id]/assign-quote/route.ts` - Nuevo endpoint
2. `components/calendar/job-details-modal.tsx` - Modal mejorado
3. `QUOTE_ASSIGNMENT_IMPLEMENTATION.md` - Esta documentación

## Próximos Pasos Sugeridos

1. **Reportes**: Crear reportes de cotizaciones asignadas por período
2. **Notificaciones**: Enviar notificaciones cuando se asigne una cotización
3. **Auditoría**: Registrar quién asignó qué cotización y cuándo
4. **Búsqueda**: Implementar búsqueda avanzada de cotizaciones disponibles
5. **Plantillas**: Permitir crear plantillas de cotizaciones reutilizables
