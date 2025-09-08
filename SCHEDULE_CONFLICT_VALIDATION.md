# 🔒 Validación de Conflictos de Horarios por Técnico

## 🎯 **Problema Resuelto**
Implementación de validación para evitar que se agenden trabajos en el mismo horario para el mismo técnico, permitiendo que diferentes técnicos puedan tener trabajos en el mismo horario.

## ✅ **Funcionalidades Implementadas**

### 1. **Validación en Backend (API)**
- ✅ Endpoint `/api/jobs/validate-schedule` para validar conflictos
- ✅ Función `validateTechnicianScheduleConflict` en la API de trabajos
- ✅ Validación en creación de trabajos (POST `/api/jobs`)
- ✅ Validación en actualización de trabajos (PUT `/api/jobs`)

### 2. **Validación en Frontend**
- ✅ Hook personalizado `useScheduleValidation` para manejo de estado
- ✅ Validación en tiempo real con debounce de 1 segundo
- ✅ Alertas visuales para conflictos detectados
- ✅ Indicadores de validación en progreso
- ✅ Confirmación de horario disponible

### 3. **Características de la Validación**
- ✅ Verifica solapamiento de horarios por técnico
- ✅ Permite múltiples técnicos en el mismo horario
- ✅ Excluye el trabajo actual al editar
- ✅ Validación de formato de horarios (HH:mm)
- ✅ Validación de que hora de fin sea posterior a hora de inicio

## 🔧 **Archivos Modificados/Creados**

### **Backend:**
- `app/api/jobs/route.ts` - Validación en creación y actualización
- `app/api/jobs/validate-schedule/route.ts` - Endpoint de validación

### **Frontend:**
- `components/forms/job-form.tsx` - Integración de validación
- `hooks/use-schedule-validation.ts` - Hook personalizado

### **Documentación:**
- `SCHEDULE_CONFLICT_VALIDATION.md` - Esta documentación

## 🚀 **Cómo Funciona**

### **1. Validación en Tiempo Real**
```typescript
// El hook se ejecuta automáticamente cuando cambian:
// - Técnico asignado
// - Fecha programada
// - Hora de inicio
// - Hora de fin
```

### **2. Validación al Enviar**
```typescript
// Antes de crear/actualizar un trabajo:
const isScheduleValid = await validateScheduleConflict()
if (!isScheduleValid) {
  // Mostrar error y no permitir envío
  return
}
```

### **3. Lógica de Validación**
```typescript
// Convierte horarios a minutos para comparación
const newStartMinutes = newStartHour * 60 + newStartMin
const newEndMinutes = newEndHour * 60 + newEndMin

// Verifica solapamiento
return (
  (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) ||
  (existingStartMinutes < newEndMinutes && existingEndMinutes > newStartMinutes)
)
```

## 🎨 **Interfaz de Usuario**

### **Estados Visuales:**
- 🔄 **Validando**: Spinner azul con mensaje "Validando disponibilidad..."
- ❌ **Conflicto**: Alerta roja con detalles del trabajo conflictivo
- ✅ **Disponible**: Alerta verde confirmando horario disponible

### **Mensajes de Error:**
- "El técnico ya tiene un trabajo programado en ese horario: [Título] ([Hora inicio] - [Hora fin])"
- "Debe asignar un técnico"
- "La hora de fin debe ser posterior a la hora de inicio"

## 🔒 **Validaciones Implementadas**

### **En Frontend:**
- ✅ Técnico asignado requerido
- ✅ Fecha programada requerida
- ✅ Horarios de inicio y fin requeridos
- ✅ Hora de fin posterior a hora de inicio
- ✅ Fecha no en el pasado

### **En Backend:**
- ✅ Formato de horarios válido (HH:mm)
- ✅ Técnico existe en la base de datos
- ✅ Conflictos de horarios por técnico
- ✅ Exclusión del trabajo actual al editar

## 🧪 **Casos de Prueba**

### **Escenarios Válidos:**
- ✅ Técnico A: 09:00-11:00, Técnico B: 09:00-11:00 (mismo horario, técnicos diferentes)
- ✅ Técnico A: 09:00-11:00, Técnico A: 14:00-16:00 (mismo técnico, horarios diferentes)
- ✅ Editar trabajo existente sin cambiar horarios

### **Escenarios Inválidos:**
- ❌ Técnico A: 09:00-11:00, Técnico A: 10:00-12:00 (solapamiento)
- ❌ Técnico A: 09:00-11:00, Técnico A: 08:00-10:00 (solapamiento)
- ❌ Técnico A: 09:00-11:00, Técnico A: 10:30-11:30 (solapamiento parcial)

## 🔄 **Flujo de Validación**

1. **Usuario selecciona técnico y horarios**
2. **Validación en tiempo real** (después de 1 segundo de inactividad)
3. **Mostrar estado de validación** (validando/disponible/conflicto)
4. **Al enviar formulario**, validación final
5. **Si hay conflicto**, mostrar error y no permitir envío
6. **Si no hay conflicto**, proceder con creación/actualización

## 🎯 **Beneficios**

- ✅ **Prevención de conflictos**: Evita doble agendamiento
- ✅ **Experiencia de usuario**: Feedback inmediato
- ✅ **Flexibilidad**: Permite múltiples técnicos en mismo horario
- ✅ **Robustez**: Validación tanto en frontend como backend
- ✅ **Mantenibilidad**: Código modular y reutilizable
