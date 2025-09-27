# 🔐 Configuración de Credenciales y Empresas

## 🚀 Instrucciones de Configuración

### **1. Ejecutar el Script de Configuración**

```bash
npm run setup
```

Este comando creará automáticamente:
- ✅ Los 3 roles del sistema
- ✅ Las 3 empresas requeridas  
- ✅ Los 3 usuarios con credenciales
- ✅ Servicios básicos para cada empresa

### **2. Credenciales de Acceso**

Una vez ejecutado el script, tendrás acceso con estas credenciales:

#### **👑 Administrador**
- **Email:** `admin@amestica.cl`
- **Contraseña:** `admin123`
- **Rol:** Administrador completo
- **Empresa:** Amestica Ltda

#### **📝 Secretaria**
- **Email:** `secretaria@amestica.cl`
- **Contraseña:** `secretaria123`
- **Rol:** Secretaria
- **Empresa:** Amestica Ltda

#### **🔧 Técnico**
- **Email:** `tecnico@amestica.cl`
- **Contraseña:** `tecnico123`
- **Rol:** Técnico
- **Empresa:** Amestica Ltda

### **3. Empresas Creadas**

#### **🏢 Amestica Ltda**
- **Tipo:** AMESTICA
- **Email:** contacto@amestica.cl
- **Teléfono:** +56 9 1234 5678
- **RUT:** 12.345.678-9
- **Servicio:** Servicios de mantenimiento y reparación

#### **🏢 Multifugas**
- **Tipo:** MULTIFUGAS
- **Email:** contacto@multifugas.cl
- **Teléfono:** +56 9 2345 6789
- **RUT:** 23.456.789-0
- **Servicio:** Servicios múltiples especializados

#### **🏢 Servifugas**
- **Tipo:** SERVIFUGAS
- **Email:** contacto@servifugas.cl
- **Teléfono:** +56 9 3456 7890
- **RUT:** 34.567.890-1
- **Servicio:** Servicios especializados

### **4. Servicios Creados**

- **Servicio Amestica** - $50,000 CLP
- **Servicio Multifugas** - $45,000 CLP  
- **Servicio Servifugas** - $40,000 CLP

## 🔧 Comandos Útiles

```bash
# Configurar datos iniciales
npm run setup

# Generar cliente Prisma
npm run db:generate

# Sincronizar base de datos
npm run db:push

# Ejecutar en desarrollo
npm run dev
```

## ✅ Verificación

Después de ejecutar `npm run setup`, puedes:

1. **Iniciar sesión** con cualquiera de las credenciales
2. **Verificar empresas** en la sección de configuración
3. **Crear trabajos** asignando técnicos
4. **Usar el calendario** para programar citas
5. **Generar cotizaciones** para clientes

## 🎯 Notas Importantes

- ✅ **Dashboard vacío** - No hay errores 500, muestra datos en 0
- ✅ **CRUD funcional** - Todos los formularios funcionan correctamente
- ✅ **Base de datos** - Todas las operaciones persisten
- ✅ **Roles y permisos** - Sistema de seguridad activo
- ✅ **Empresas configuradas** - Listas para usar

¡El sistema está listo para usar! 🚀
