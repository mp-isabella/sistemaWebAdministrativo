# 🚀 Guía de Pruebas de Login

## ✅ Problema Solucionado

Se ha corregido el error de login que impedía el acceso al portal. Los usuarios ahora pueden iniciar sesión correctamente y ser redirigidos a sus dashboards correspondientes según su rol.

### 🔧 **Error Específico Solucionado:**
- **Error:** `error=Configuration` con código 500
- **Causa:** Faltaba el archivo `.env` con las variables de entorno de NextAuth
- **Solución:** Se creó automáticamente el archivo `.env` con `NEXTAUTH_SECRET` y otras variables necesarias

### 🆕 **Nuevas Funcionalidades Implementadas:**
- ✅ **"Recordarme"** - Mantiene la sesión activa por más tiempo
- ✅ **"¿Olvidaste tu contraseña?"** - Restablecimiento de contraseña por email

## 🔧 Cambios Realizados

1. **Creación del archivo `.env`** - Variables de entorno configuradas automáticamente
2. **Simplificación del flujo de login** - Eliminado el bucle de reintentos que causaba problemas
3. **Mejora del middleware** - Lógica de redirección más clara y eficiente
4. **Mejor manejo de sesiones** - Espera adecuada para que la sesión se establezca
5. **Logging mejorado** - Mejor debugging para identificar problemas
6. **Funcionalidad "Recordarme"** - Sesiones extendidas según preferencia del usuario
7. **Sistema de restablecimiento de contraseña** - Envío de emails con tokens seguros

## 👥 Usuarios de Prueba Disponibles

### 🔐 Credenciales de Acceso

| Rol | Email | Contraseña | Dashboard Destino |
|-----|-------|------------|-------------------|
| **Administrador** | `admin@amestica.cl` | `admin123` | `/dashboard` |
| **Secretaria** | `secretaria@amestica.cl` | `secretaria123` | `/dashboard/billing` |
| **Técnico** | `tecnico@amestica.cl` | `tecnico123` | `/dashboard/my-jobs` |

## 🧪 Cómo Probar

### Login Básico:
1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Ve a la página de login:**
   ```
   http://localhost:3000/login
   ```

3. **Prueba con cada usuario:**
   - Ingresa las credenciales
   - Verifica que seas redirigido al dashboard correcto
   - Confirma que el menú lateral muestre las opciones apropiadas para tu rol

### Funcionalidad "Recordarme":
1. **Marca la casilla "Recordarme"** antes de hacer login
2. **Cierra el navegador** completamente
3. **Abre el navegador nuevamente** y ve a `http://localhost:3000/dashboard`
4. **Verifica que sigues logueado** (sesión de 90 días vs 24 horas)

### Funcionalidad "¿Olvidaste tu contraseña?":
1. **Ve a:** `http://localhost:3000/forgot-password`
2. **Ingresa un email válido** (ej: `admin@amestica.cl`)
3. **Configura las variables de email** en el archivo `.env`:
   ```env
   EMAIL_USER="tu-email@gmail.com"
   EMAIL_PASS="tu-app-password"
   ```
4. **Verifica que recibes el email** de restablecimiento
5. **Haz clic en el enlace** del email para restablecer la contraseña

## 🔍 Verificación de Funcionamiento

### Para Administrador:
- ✅ Acceso a todas las secciones
- ✅ Menú completo disponible
- ✅ Dashboard principal con estadísticas
- ✅ Funcionalidad "Recordarme" (90 días)
- ✅ Restablecimiento de contraseña por email

### Para Secretaria:
- ✅ Redirección automática a `/dashboard/billing`
- ✅ Acceso a clientes, facturación, cajas
- ✅ Menú limitado a funciones de secretaria
- ✅ Funcionalidad "Recordarme" (90 días)
- ✅ Restablecimiento de contraseña por email

### Para Técnico:
- ✅ Redirección automática a `/dashboard/my-jobs`
- ✅ Acceso a trabajos y evidencias
- ✅ Menú específico para técnicos
- ✅ Funcionalidad "Recordarme" (90 días)
- ✅ Restablecimiento de contraseña por email

## 🛠️ Scripts de Prueba

### Configurar Variables de Entorno:
```bash
node scripts/setup-env.js
```

### Verificar Base de Datos:
```bash
node scripts/test-auth.js
```

### Verificar Login Completo:
```bash
node scripts/test-login.js
```

### Verificar Restablecimiento de Contraseña:
```bash
node scripts/test-password-reset.js
```

### Verificar Usuarios:
```bash
npx prisma studio
```

## 📧 Configuración de Email

### Para Gmail:
1. **Habilita la verificación en 2 pasos** en tu cuenta de Google
2. **Genera una contraseña de aplicación:**
   - Ve a tu cuenta de Google
   - Seguridad > Verificación en 2 pasos
   - Contraseñas de aplicación
   - Genera una nueva contraseña
3. **Configura las variables en `.env`:**
   ```env
   EMAIL_USER="tu-email@gmail.com"
   EMAIL_PASS="abcd efgh ijkl mnop"
   ```

### Para otros proveedores:
Modifica la configuración en `app/api/auth/forgot-password/route.ts`

## 🐛 Solución de Problemas

### Si el login no funciona:

1. **Verifica que el archivo .env existe:**
   ```bash
   dir .env
   ```

2. **Si no existe, créalo:**
   ```bash
   node scripts/setup-env.js
   ```

3. **Verifica la base de datos:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Revisa los logs del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña Console
   - Busca mensajes de error o logs de autenticación

5. **Verifica las variables de entorno:**
   - Asegúrate de que `NEXTAUTH_SECRET` esté configurado
   - Verifica la conexión a la base de datos

### Si el restablecimiento de contraseña no funciona:

1. **Verifica las variables de email:**
   ```bash
   type .env
   ```

2. **Asegúrate de que EMAIL_USER y EMAIL_PASS estén configurados**

3. **Verifica que el email existe en la base de datos**

4. **Revisa los logs del servidor** para errores de envío de email

### Mensajes de Error Comunes:

- **"Credenciales inválidas"** → Verifica email y contraseña
- **"Usuario inactivo"** → El usuario está deshabilitado en la BD
- **"Tiempo de espera agotado"** → Problema de conexión o BD lenta
- **"error=Configuration"** → Falta el archivo `.env` o `NEXTAUTH_SECRET`
- **"Token de restablecimiento no válido"** → El enlace expiró o es inválido

## 📝 Notas Técnicas

- **Middleware:** Maneja redirecciones automáticas según rol
- **Sesiones:** JWT con información de rol incluida
- **Seguridad:** Contraseñas hasheadas con bcrypt
- **Roles:** ADMIN, SECRETARIA, TECNICO (case-insensitive)
- **Variables de Entorno:** Requeridas para NextAuth funcionamiento
- **"Recordarme":** Sesión de 90 días vs 24 horas estándar
- **Restablecimiento:** Tokens seguros con expiración de 1 hora
- **Email:** Configurado para Gmail con autenticación de 2 factores

## 🎯 Próximos Pasos

1. ✅ Login funcional
2. ✅ Redirección por roles
3. ✅ Dashboards específicos
4. ✅ Variables de entorno configuradas
5. ✅ Funcionalidad "Recordarme"
6. ✅ Restablecimiento de contraseña por email
7. 🔄 Pruebas de funcionalidad completa
8. 🔄 Implementación de características adicionales

## 🔧 Configuración Automática

El proyecto ahora incluye scripts automáticos para:
- ✅ Configurar variables de entorno (`setup-env.js`)
- ✅ Verificar autenticación (`test-auth.js`)
- ✅ Probar login completo (`test-login.js`)
- ✅ Probar restablecimiento de contraseña (`test-password-reset.js`)
- ✅ Generar `NEXTAUTH_SECRET` seguro automáticamente
- ✅ Configurar sistema de email para restablecimiento

## 📋 Páginas y Rutas Implementadas

### Páginas:
- `/login` - Página de inicio de sesión
- `/forgot-password` - Solicitar restablecimiento de contraseña
- `/reset-password` - Establecer nueva contraseña

### APIs:
- `/api/auth/forgot-password` - Enviar email de restablecimiento
- `/api/auth/validate-reset-token` - Validar token de restablecimiento
- `/api/auth/reset-password` - Actualizar contraseña
