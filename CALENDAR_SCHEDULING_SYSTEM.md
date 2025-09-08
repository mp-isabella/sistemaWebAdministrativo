# Sistema de Agendamiento del Calendario

## Descripción General

El sistema de agendamiento del calendario permite a los usuarios (administradores, secretarias y técnicos) programar, visualizar y gestionar trabajos técnicos en un calendario interactivo.

## Componentes Principales

### 1. CalendarDashboard (`components/calendar/calendar-dashboard.tsx`)
- Componente principal que coordina todo el sistema del calendario
- Maneja la carga de datos, filtros y sincronización
- Integra todos los subcomponentes del calendario

### 2. CalendarGrid (`components/calendar/calendar-grid.tsx`)
- Muestra la vista de cuadrícula del calendario
- Renderiza las citas/trabajos en sus respectivos horarios
- Maneja el posicionamiento visual de las citas

### 3. JobDetailsModal (`components/calendar/job-details-modal.tsx`)
- Modal para ver y editar detalles de trabajos
- Permite asignar/reasignar técnicos
- Permite cambiar horarios y fechas

### 4. API del Calendario (`app/api/calendar/jobs/route.ts`)
- Endpoint para obtener trabajos del calendario
- Filtra por técnico, estado, fecha y búsqueda
- Mapea datos de la base de datos al formato del frontend

## Funcionalidades del Sistema

### Agendamiento de Trabajos
- **Creación**: Los trabajos se crean con fecha, hora de inicio y fin
- **Asignación**: Se pueden asignar técnicos específicos a cada trabajo
- **Validación**: Se valida que no haya conflictos de horarios
- **Flexibilidad**: Se pueden modificar fechas y horarios existentes

### Visualización en Calendario
- **Vista por Día**: Muestra trabajos organizados por día
- **Vista por Técnico**: Cada técnico tiene su columna en el calendario
- **Horarios**: Rango de 8:00 AM a 7:00 PM (12 horas)
- **Estados Visuales**: Diferentes colores según el estado del trabajo

### Sincronización en Tiempo Real
- **Eventos Personalizados**: Sistema de eventos para sincronizar cambios
- **Actualización Automática**: El calendario se refresca cuando se modifican trabajos
- **Hook Personalizado**: `useCalendarSync` para manejar la sincronización

## Estructura de Datos

### Modelo Job (Base de Datos)
```prisma
model Job {
  id          String      @id @default(cuid())
  title       String
  description String?
  status      JobStatus   @default(PENDING)
  priority    JobPriority @default(MEDIUM)
  scheduledAt DateTime?   // Fecha y hora programada
  startTime   String?     // Hora de inicio (HH:mm)
  endTime     String?     // Hora de fin (HH:mm)
  technicianId String?    // ID del técnico asignado
  // ... otros campos
}
```

### Interface Appointment (Frontend)
```typescript
interface Appointment {
  id: string
  patientName: string
  startTime: string
  endTime: string
  date: string
  scheduledAt: string
  professionalId: string
  status: string
  // ... otros campos
}
```

## Flujo de Agendamiento

### 1. Creación de Trabajo
1. Usuario crea un trabajo con fecha, hora y descripción
2. Sistema valida disponibilidad del técnico
3. Se guarda en la base de datos
4. Se actualiza el calendario automáticamente

### 2. Asignación de Técnico
1. Admin/Secretaria abre modal de asignación
2. Selecciona técnico disponible
3. Opcionalmente modifica fecha/horario
4. Sistema actualiza el trabajo
5. Calendario se refresca mostrando el cambio

### 3. Modificación de Horarios
1. Usuario modifica fecha u horario existente
2. Sistema valida conflictos
3. Se actualiza la base de datos
4. Calendario se refresca con nueva posición

## Validaciones del Sistema

### Conflictos de Horarios
- **Mismo Técnico**: No puede tener trabajos solapados
- **Límite de Trabajos**: Máximo 8 trabajos por horario
- **Formato de Horarios**: Debe ser HH:mm válido
- **Rango de Horas**: Solo entre 8:00 AM y 7:00 PM

### Permisos de Usuario
- **Admin/Secretaria**: Pueden asignar, modificar y cancelar trabajos
- **Técnico**: Solo pueden ver y actualizar estado de sus trabajos
- **Validación**: Se verifica rol en cada operación

## Eventos de Sincronización

### refreshCalendar
```typescript
// Disparar evento de refresco
const refreshEvent = new CustomEvent('refreshCalendar', {
  detail: {
    reason: 'technicianAssigned',
    jobId: job.id,
    newTechnicianId: selectedTechnician
  }
})
window.dispatchEvent(refreshEvent)
```

### jobUpdated
```typescript
// Disparar evento de actualización de trabajo
const jobUpdatedEvent = new CustomEvent('jobUpdated', {
  detail: {
    jobId: job.id,
    updatedJob: result,
    action: 'technicianAssigned'
  }
})
window.dispatchEvent(jobUpdatedEvent)
```

## Hook de Sincronización

### useCalendarSync
```typescript
const { triggerRefresh, triggerJobUpdate } = useCalendarSync({
  onRefresh: fetchCalendarData,
  onJobUpdate: (jobId, updatedJob) => {
    // Lógica de actualización específica
  }
})
```

## Manejo de Errores

### Fechas Inválidas
- Se detectan fechas con año 1969 (epoch)
- Se usan fechas por defecto cuando es necesario
- Se registran logs para debugging

### Horarios Inválidos
- Se valida formato HH:mm
- Se usan horarios por defecto (8:00-9:00)
- Se muestran warnings en consola

### Fallbacks del Sistema
- Fecha actual si no hay fecha válida
- Horario 8:00-9:00 si no hay horarios válidos
- Técnico genérico si no hay asignación

## Optimizaciones de Rendimiento

### Lazy Loading
- Los datos se cargan solo cuando es necesario
- Se implementa paginación para grandes volúmenes

### Debouncing
- Las búsquedas se debouncean para evitar llamadas excesivas
- Los filtros se aplican de manera eficiente

### Memoización
- Se usan useCallback y useMemo para evitar re-renders innecesarios
- Los datos se cachean localmente cuando es posible

## Troubleshooting

### Problemas Comunes

1. **Trabajos no aparecen en el calendario**
   - Verificar que tengan fecha válida
   - Verificar que estén en el rango de horarios (8:00-19:00)
   - Revisar logs de consola para errores

2. **Horarios no se posicionan correctamente**
   - Verificar formato de horarios (HH:mm)
   - Verificar que estén en el rango válido
   - Revisar función getAppointmentPosition

3. **Calendario no se actualiza**
   - Verificar eventos de sincronización
   - Verificar hook useCalendarSync
   - Revisar logs de eventos

### Logs de Debug
El sistema incluye logs detallados para debugging:
- 🌍 Debug de zona horaria
- 🕐 Debug de hora local
- 📏 Posiciones calculadas
- 🔄 Eventos de sincronización
- ⚠️ Warnings y errores

## Futuras Mejoras

1. **Notificaciones Push**: Alertas en tiempo real para cambios
2. **Drag & Drop**: Interfaz más intuitiva para mover citas
3. **Vista Semanal/Mensual**: Más opciones de visualización
4. **Integración con Calendarios**: Sincronización con Google Calendar, Outlook
5. **Reportes Avanzados**: Análisis de productividad y ocupación
