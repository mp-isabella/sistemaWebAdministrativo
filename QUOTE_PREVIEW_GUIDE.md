# Guía de Uso: Vista Previa y Crear Presupuesto

## 🎯 Funcionalidades Implementadas

### ✅ Vista Previa (Preview)
- **Botón**: "Vista Previa" con ícono de ojo
- **Ubicación**: En la parte inferior del formulario de presupuesto
- **Funcionalidad**: Muestra una vista previa completa del presupuesto antes de crearlo

### ✅ Crear Presupuesto (Create Quote)
- **Botón**: "Crear Presupuesto" con ícono de documento
- **Ubicación**: En la parte inferior del formulario de presupuesto
- **Funcionalidad**: Crea el presupuesto directamente sin vista previa

### ✅ Campo de Cliente Libre
- **Campo**: "Cliente" como campo de texto libre
- **Funcionalidad**: Permite escribir cualquier nombre de cliente sin restricciones
- **Dirección**: Campo requerido para completar la información del cliente

## 📋 Pasos para Usar Vista Previa

### 1. **Completar Campos Requeridos**
- ✅ **Cliente**: Escribir el nombre del cliente (campo de texto libre)
- ✅ **Empresa**: Seleccionar una empresa (Amestica, Multifugas, Servifugas)
- ✅ **Fecha de Validez**: Establecer fecha de vencimiento del presupuesto
- ✅ **Dirección**: Escribir la dirección del cliente (campo requerido)

### 2. **Completar Información del Cliente (Opcional)**
- ✅ **Email**: Email del cliente
- ✅ **Teléfono**: Teléfono del cliente
- ✅ **Región**: Seleccionar región
- ✅ **Comuna**: Seleccionar comuna (se habilita al seleccionar región)

### 3. **Agregar Servicios**
- ✅ **Descripción del Servicio**: Escribir descripción del servicio
- ✅ **Descripción Detallada**: Agregar detalles adicionales (opcional)
- ✅ **Cantidad**: Establecer cantidad (mínimo 1)
- ✅ **Precio Unitario**: Establecer precio por unidad
- ✅ **Materiales**: Especificar materiales (opcional)
- ✅ **Área Expuesta**: Especificar área (opcional)

### 4. **Hacer Clic en "Vista Previa"**
- El sistema validará todos los campos
- Si hay errores, mostrará notificaciones
- Si todo está correcto, mostrará la vista previa

## 🎨 Características de la Vista Previa

### **Diseño Profesional**
- Logo de la empresa seleccionada
- Colores corporativos específicos por empresa
- Información completa del cliente (nombre, dirección, contacto)
- Detalles del servicio y técnico
- Tabla de servicios con totales
- Condiciones específicas por empresa

### **Botones de Acción en Vista Previa**
- **👁️ Editar**: Volver al formulario para hacer cambios
- **🖨️ Imprimir Vista Previa**: Imprimir la vista previa
- **❌ Cancelar**: Cancelar la operación
- **✅ Confirmar y Crear Presupuesto**: Crear el presupuesto definitivo

## 🏢 Configuración por Empresa

### **AMESTICA LIMITADA**
- **Logo**: `/amestica.png`
- **Colores**: Azul profesional (#1e40af, #3b82f6)
- **Condiciones**: Pago 100% al inicio, garantía 3 meses

### **MULTIFUGAS**
- **Logo**: `/multifugas.png`
- **Colores**: Azul profesional (#1e40af, #3b82f6)
- **Condiciones**: Pago 50% inicio/50% final, garantía 3 meses

### **SERVIFUGAS SPA**
- **Logo**: `/servifugas.png`
- **Colores**: Verde confiable (#059669, #10b981)
- **Condiciones**: Pago en dos partes, garantía 3 meses

## ⚠️ Validaciones del Sistema

### **Campos Obligatorios**
- Nombre del cliente (texto libre)
- Empresa seleccionada
- Fecha de validez establecida
- Dirección del cliente
- Al menos un servicio agregado

### **Validación de Servicios**
- Descripción del servicio completada
- Cantidad mayor a 0
- Precio unitario mayor a 0
- Totales calculados automáticamente

### **Mensajes de Error**
- Campos requeridos incompletos
- Servicios sin completar
- Dirección del cliente faltante
- Errores de conexión

## 🔧 Solución de Problemas

### **"Vista Previa no funciona"**
1. Verificar que todos los campos requeridos estén completos
2. Asegurar que al menos un servicio esté agregado
3. Completar descripción, cantidad y precio de cada servicio
4. Verificar que la dirección del cliente esté completada
5. Verificar conexión a internet

### **"Crear Presupuesto no funciona"**
1. Seguir los mismos pasos de validación
2. Verificar que la empresa esté configurada
3. Comprobar que la dirección del cliente esté completada
4. Revisar la consola del navegador para errores

### **"Totales no se calculan"**
1. Los totales se calculan automáticamente
2. Verificar que cantidad y precio unitario sean números válidos
3. El sistema recalcula al cambiar valores

## 📱 Experiencia de Usuario

### **Formulario Intuitivo**
- Campo de cliente como texto libre (más flexible)
- Campos organizados lógicamente
- Validación en tiempo real
- Cálculos automáticos
- Notificaciones claras

### **Vista Previa Profesional**
- Diseño limpio y profesional
- Información completa y clara
- Acciones claras y accesibles
- Responsive design

### **Flujo de Trabajo Optimizado**
1. Completar formulario con cliente libre
2. Revisar vista previa
3. Hacer ajustes si es necesario
4. Confirmar y crear presupuesto
5. Redirigir a lista de presupuestos

## 🚀 Beneficios

- **Flexibilidad**: Cliente como texto libre (no requiere estar en base de datos)
- **Previsualización**: Ver el resultado antes de crear
- **Validación**: Errores detectados antes de enviar
- **Profesionalismo**: Diseño corporativo por empresa
- **Eficiencia**: Flujo de trabajo optimizado
- **Flexibilidad**: Editar desde la vista previa
- **Impresión**: Vista previa imprimible

## 🔄 Cambios Recientes

### **Campo de Cliente Libre**
- ✅ Cambiado de selector a campo de texto libre
- ✅ Permite escribir cualquier nombre de cliente
- ✅ No requiere que el cliente esté en la base de datos
- ✅ Mayor flexibilidad para crear presupuestos

### **Campo de Dirección Requerido**
- ✅ Dirección del cliente ahora es campo obligatorio
- ✅ Validación mejorada para asegurar información completa
- ✅ Mejor experiencia de usuario con validaciones claras
