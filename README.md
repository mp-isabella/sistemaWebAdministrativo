# Sistema Web Administrativo - Améstica

Sistema completo de gestión administrativa para servicios técnicos, con calendario, agenda, clientes, trabajadores y más.

## 🚀 Inicio Rápido

### Opción 1: Inicio Universal (Recomendado)
```bash
npm run dev:universal
```
Este comando:
- ✅ Detecta automáticamente un puerto disponible
- ✅ Configura las variables de entorno
- ✅ Ejecuta migraciones si es necesario
- ✅ Genera el cliente Prisma
- ✅ Inicia la aplicación

### Opción 2: Puerto Específico
```bash
# Puerto 3000
npm run dev:3000

# Puerto 3001
npm run dev:3001

# Puerto 3002
npm run dev:3002

# Puerto personalizado
npm run dev:custom 3005
```

### Opción 3: Detección Automática de Puerto
```bash
npm run dev:auto
```

## 📋 URLs Importantes

Una vez iniciada la aplicación, podrás acceder a:

- 🏠 **Inicio**: `http://localhost:[PUERTO]`
- 🔐 **Login**: `http://localhost:[PUERTO]/login`
- 📊 **Dashboard**: `http://localhost:[PUERTO]/dashboard`
- 📅 **Calendario**: `http://localhost:[PUERTO]/dashboard/schedule/calendar`
- 📋 **Agenda**: `http://localhost:[PUERTO]/dashboard/schedule`
- 👥 **Clientes**: `http://localhost:[PUERTO]/dashboard/clients`
- 👨‍🔧 **Trabajadores**: `http://localhost:[PUERTO]/dashboard/workers`

## 🔑 Credenciales de Prueba

### Administrador
- **Email**: admin@amestica.com
- **Contraseña**: admin123
- **Acceso**: Completo a todas las funciones

### Secretaria
- **Email**: secretaria@amestica.com
- **Contraseña**: secretaria123
- **Acceso**: Gestión de agenda, clientes, cotizaciones

### Técnico
- **Email**: tecnico@amestica.com
- **Contraseña**: tecnico123
- **Acceso**: Ver trabajos asignados, evidencias

## 🛠️ Instalación Manual

Si prefieres configurar manualmente:

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp env-config.txt .env
```

3. **Generar cliente Prisma**:
```bash
npx prisma generate
```

4. **Ejecutar migraciones**:
```bash
npx prisma migrate deploy
```

5. **Iniciar en desarrollo**:
```bash
npm run dev
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` con:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### Base de Datos
La aplicación usa SQLite por defecto. Para cambiar a PostgreSQL o MySQL:

1. Modifica `DATABASE_URL` en `.env`
2. Ejecuta: `npx prisma migrate deploy`

## 📱 Características

### 🗓️ Calendario Inteligente
- Vista de calendario interactiva
- Asignación de técnicos
- Filtros por estado y técnico
- Sincronización en tiempo real

### 📋 Gestión de Agenda
- Crear y editar trabajos
- Asignar técnicos
- Estados de trabajo (Pendiente, En Progreso, Completado)
- Prioridades configurables

### 👥 Gestión de Clientes
- Registro completo de clientes
- Historial de servicios
- Información de contacto
- Direcciones múltiples

### 👨‍🔧 Gestión de Trabajadores
- Perfiles de técnicos
- Asignación de roles
- Historial de trabajos
- Disponibilidad

### 💰 Cotizaciones y Facturación
- Generación de cotizaciones
- Facturas automáticas
- Reportes financieros
- Exportación a Excel

## 🚨 Solución de Problemas

### Error de React Hooks
Si ves el error "Rendered more hooks than during the previous render":
- ✅ Ya está solucionado en la versión actual
- 🔄 Reinicia la aplicación si persiste

### Puerto Ocupado
Si el puerto está ocupado:
- ✅ Usa `npm run dev:universal` para detección automática
- 🔄 O especifica otro puerto: `npm run dev:custom 3005`

### Base de Datos
Si hay problemas con la base de datos:
```bash
npx prisma migrate reset
npx prisma db seed
```

### Variables de Entorno
Si hay problemas de autenticación:
```bash
node scripts/setup-env-dynamic.js
```

## 📊 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:universal` | Inicio completo automático |
| `npm run dev:auto` | Detección automática de puerto |
| `npm run dev:3000` | Puerto 3000 específico |
| `npm run dev:3001` | Puerto 3001 específico |
| `npm run dev:custom` | Puerto personalizado |
| `npm run build` | Construir para producción |
| `npm run start` | Iniciar en producción |

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. **Pull de cambios**:
```bash
git pull origin main
```

2. **Instalar nuevas dependencias**:
```bash
npm install
```

3. **Ejecutar migraciones**:
```bash
npx prisma migrate deploy
```

4. **Reiniciar**:
```bash
npm run dev:universal
```

## 📞 Soporte

Si encuentras problemas:

1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de que el archivo `.env` esté configurado
3. Ejecuta `npm run dev:universal` para configuración automática
4. Revisa los logs en la consola para errores específicos

## 🎯 Próximas Características

- [ ] Notificaciones push
- [ ] App móvil
- [ ] Integración con GPS
- [ ] Reportes avanzados
- [ ] Integración con WhatsApp

---

**Desarrollado para Améstica Ltda** - Sistema de Gestión Administrativa
