# 👨‍🔧 Modal de Asignación y Modificación de Técnicos y Horarios

## 🎯 **Funcionalidad Implementada**

### **Asignación y Modificación Completa**
- ✅ **Botón de Asignar**: Para trabajos sin técnico asignado (solo admin/secretaria)
- ✅ **Botón de Cambiar**: Para trabajos con técnico asignado (solo admin/secretaria)
- ✅ **Modal Interactivo**: Formulario para seleccionar técnico, fecha y horario
- ✅ **Modificación de Fecha**: Cambiar la fecha del trabajo
- ✅ **Modificación de Horario**: Cambiar hora de inicio y fin
- ✅ **Validación de Conflictos**: Verifica disponibilidad del técnico
- ✅ **Actualización en Tiempo Real**: Refleja cambios inmediatamente
- ✅ **Control de Permisos**: Solo administradores y secretarias pueden cambiar técnicos
- ✅ **Restricción de Técnicos**: Los técnicos solo pueden cambiar estado de sus trabajos

## 🔧 **Archivos Modificados**

### **Frontend:**
- `components/calendar/job-details-modal.tsx` - Modal principal con nueva funcionalidad y control de permisos

### **Backend:**
- `app/api/jobs/route.ts` - Validación de permisos para cambios de técnico

### **Documentación:**
- `TECHNICIAN_ASSIGNMENT_MODAL.md` - Esta documentación

## 🚀 **Cómo Funciona**

### **1. Botón de Asignación**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={openTechnicianModal}
  className="h-7 px-2 text-xs gap-1"
>
  {job.technician?.id ? (
    <>
      <Edit className="h-3 w-3" />
      Cambiar
    </>
  ) : (
    <>
      <Users className="h-3 w-3" />
      Asignar
    </>
  )}
</Button>
```

### **2. Carga de Técnicos**
```typescript
const loadTechnicians = async () => {
  setIsLoadingTechnicians(true)
  try {
    const response = await fetch("/api/workers")
    const data = await response.json()
    
    const activeTechnicians = data.workers?.filter((w: any) => 
      w.isActive && (w.role?.name === 'TECNICO' || w.role?.name === 'tecnico')
    ) || []
    setTechnicians(activeTechnicians)
  } catch (error) {
    // Manejo de errores
  }
}
```

### **3. Asignación y Modificación Completa**
```typescript
const handleAssignTechnician = async () => {
  const updateData: any = {
    technicianId: selectedTechnician
  }

  // Solo incluir fecha y horarios si han cambiado
  if (newDate !== job.date) {
    updateData.scheduledAt = newDate
  }
  if (newStartTime !== job.startTime) {
    updateData.startTime = newStartTime
  }
  if (newEndTime !== job.endTime) {
    updateData.endTime = newEndTime
  }

  const response = await fetch(`/api/jobs/${job.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData)
  })
  
  // Actualizar trabajo y mostrar notificación
}
```

## 🎨 **Interfaz de Usuario**

### **Botón Principal:**
- 🟢 **"Asignar"**: Para trabajos sin técnico (icono de usuarios) - **Solo Admin/Secretaria**
- 🔵 **"Cambiar"**: Para trabajos con técnico (icono de editar) - **Solo Admin/Secretaria**
- 📍 **Ubicación**: Al lado de la información del técnico
- 🔒 **Visibilidad**: Solo visible para usuarios con permisos

### **Modal de Asignación:**
- 📋 **Header**: Título dinámico según acción
- 👤 **Técnico Actual**: Muestra el técnico asignado (si existe)
- 📝 **Lista de Técnicos**: Selección visual con radio buttons
- 📅 **Campo de Fecha**: Input para modificar la fecha del trabajo
- ⏰ **Campos de Horario**: Inputs para hora de inicio y fin
- ✅ **Botones de Acción**: Cancelar y Asignar/Actualizar

### **Estados Visuales:**
- 🔄 **Cargando**: Spinner mientras carga técnicos
- ✅ **Seleccionado**: Técnico resaltado en azul
- 🚫 **Deshabilitado**: Botón deshabilitado si no hay selección
- ⏳ **Procesando**: Spinner durante asignación

## 📱 **Funcionalidades**

### **1. Asignación Inicial**
- ✅ Carga lista de técnicos activos
- ✅ Permite seleccionar cualquier técnico disponible
- ✅ Permite definir fecha y horario del trabajo
- ✅ Valida conflictos de horarios automáticamente
- ✅ Actualiza el trabajo en tiempo real

### **2. Cambio de Técnico y Horario**
- ✅ Muestra técnico actual
- ✅ Permite seleccionar nuevo técnico
- ✅ Permite modificar fecha del trabajo
- ✅ Permite modificar horarios (inicio y fin)
- ✅ Valida disponibilidad del nuevo técnico
- ✅ Actualiza información inmediatamente

### **3. Validaciones**
- ✅ Técnico debe estar activo
- ✅ Técnico debe tener rol "TECNICO"
- ✅ Fecha y horarios son requeridos
- ✅ Verifica conflictos de horarios
- ✅ Previene asignación duplicada
- ✅ Valida formato de fecha y hora
- ✅ **Permisos de Usuario**: Solo admin/secretaria pueden cambiar técnicos
- ✅ **Restricción de Técnicos**: Solo pueden cambiar estado de sus trabajos

## 🔄 **Flujo de Uso**

### **Para Asignar Técnico (Admin/Secretaria):**
1. **Usuario con permisos abre modal de detalles del trabajo**
2. **Ve "Sin técnico asignado"**
3. **Hace clic en "Asignar" (solo visible para admin/secretaria)**
4. **Modal se abre con lista de técnicos y campos de fecha/hora**
5. **Selecciona un técnico y define fecha/horario**
6. **Hace clic en "Asignar"**
7. **Técnico se asigna y modal se cierra**

### **Para Cambiar Técnico y Horario (Admin/Secretaria):**
1. **Usuario con permisos abre modal de detalles del trabajo**
2. **Ve técnico actual asignado**
3. **Hace clic en "Cambiar" (solo visible para admin/secretaria)**
4. **Modal se abre mostrando técnico actual y horarios actuales**
5. **Selecciona nuevo técnico y/o modifica fecha/horario**
6. **Hace clic en "Actualizar"**
7. **Técnico y horario se actualizan y modal se cierra**

### **Para Técnicos (Solo Cambio de Estado):**
1. **Técnico abre modal de detalles de su trabajo asignado**
2. **Ve información del trabajo (sin botones de asignar/cambiar)**
3. **Puede cambiar estado: Pendiente → En Progreso → Completado**
4. **No puede modificar técnico, fecha u horarios**
5. **Cambios se aplican inmediatamente**

## 🎯 **Características Técnicas**

### **Estados del Componente:**
```typescript
const [showTechnicianModal, setShowTechnicianModal] = useState(false)
const [technicians, setTechnicians] = useState<any[]>([])
const [selectedTechnician, setSelectedTechnician] = useState<string>("")
const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false)
const [isAssigningTechnician, setIsAssigningTechnician] = useState(false)
const [newDate, setNewDate] = useState<string>("")
const [newStartTime, setNewStartTime] = useState<string>("")
const [newEndTime, setNewEndTime] = useState<string>("")
```

### **Validaciones Implementadas:**
- ✅ Técnico seleccionado requerido
- ✅ Fecha y horarios requeridos
- ✅ Técnico debe estar activo
- ✅ Verificación de conflictos de horarios
- ✅ Manejo de errores de red
- ✅ Estados de carga apropiados
- ✅ Validación de formato de fecha y hora
- ✅ **Control de Permisos Frontend**: Botones solo visibles para admin/secretaria
- ✅ **Control de Permisos Backend**: Validación en API para cambios de técnico
- ✅ **Restricción de Técnicos**: Solo pueden modificar estado de sus trabajos

### **Integración con API:**
- ✅ **GET** `/api/workers` - Cargar técnicos
- ✅ **PUT** `/api/jobs/{id}` - Actualizar técnico con validación de permisos
- ✅ Validación de conflictos automática
- ✅ Actualización en tiempo real
- ✅ **Validación de Roles**: Solo admin/secretaria pueden cambiar técnicos
- ✅ **Restricción de Técnicos**: Solo pueden modificar estado de sus trabajos

## 🎨 **Diseño y UX**

### **Colores y Estilos:**
- 🔵 **Azul**: Selección activa y elementos principales
- ⚪ **Gris**: Estados inactivos y bordes
- 🟢 **Verde**: Estados de éxito
- 🔴 **Rojo**: Estados de error

### **Animaciones:**
- ✅ **Fade In**: Modal aparece suavemente
- ✅ **Hover Effects**: Interacciones visuales
- ✅ **Loading Spinners**: Indicadores de carga
- ✅ **Smooth Transitions**: Transiciones fluidas

### **Responsive Design:**
- ✅ **Desktop**: Modal centrado con ancho máximo
- ✅ **Mobile**: Modal adaptado a pantalla completa
- ✅ **Tablet**: Modal responsive intermedio

## 🔒 **Seguridad y Validaciones**

### **Validaciones de Frontend:**
- ✅ Técnico seleccionado requerido
- ✅ Lista de técnicos no vacía
- ✅ Estados de carga apropiados
- ✅ Prevención de múltiples envíos

### **Validaciones de Backend:**
- ✅ Técnico existe en base de datos
- ✅ Técnico está activo
- ✅ Técnico tiene rol correcto
- ✅ Verificación de conflictos de horarios
- ✅ Permisos de usuario
- ✅ **Control de Roles**: Solo admin/secretaria pueden cambiar técnicos
- ✅ **Restricción de Técnicos**: Solo pueden modificar estado de sus trabajos
- ✅ **Validación de Propiedad**: Técnicos solo pueden modificar sus trabajos asignados

## 🧪 **Casos de Prueba**

### **Escenarios Válidos:**
- ✅ Admin/Secretaria asigna técnico a trabajo sin técnico
- ✅ Admin/Secretaria cambia técnico en trabajo con técnico
- ✅ Técnico cambia estado de su trabajo asignado
- ✅ Técnico disponible sin conflictos
- ✅ Múltiples técnicos disponibles

### **Escenarios de Error:**
- ✅ Sin técnicos disponibles
- ✅ Técnico con conflictos de horarios
- ✅ Error de red al cargar técnicos
- ✅ Error de red al asignar técnico
- ✅ Usuario sin permisos
- ✅ Técnico intenta cambiar técnico asignado
- ✅ Técnico intenta modificar trabajo de otro técnico
- ✅ Usuario sin rol intenta acceder a funcionalidad

### **Escenarios de Edge Cases:**
- ✅ Técnico desactivado durante proceso
- ✅ Trabajo cancelado durante asignación
- ✅ Múltiples usuarios asignando simultáneamente
- ✅ Técnico eliminado de la base de datos

## 🎯 **Beneficios**

- ✅ **Flexibilidad**: Asignar o cambiar técnicos fácilmente
- ✅ **Eficiencia**: Proceso rápido y directo
- ✅ **Validación**: Previene conflictos automáticamente
- ✅ **UX**: Interfaz intuitiva y clara
- ✅ **Tiempo Real**: Actualizaciones inmediatas
- ✅ **Seguridad**: Validaciones robustas

## 🔄 **Integración con Sistema Existente**

### **Compatibilidad:**
- ✅ **Validación de Horarios**: Integra con sistema existente
- ✅ **Notificaciones**: Usa sistema de toast existente
- ✅ **Estados**: Mantiene consistencia con otros modales
- ✅ **API**: Usa endpoints existentes

### **Mejoras Futuras:**
- 🔮 **Filtros Avanzados**: Por especialidad, ubicación, etc.
- 🔮 **Asignación Masiva**: Múltiples trabajos a la vez
- 🔮 **Historial de Cambios**: Track de asignaciones previas
- 🔮 **Notificaciones Push**: Alertas en tiempo real
