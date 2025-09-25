# Configuración de Login para Producción en Vercel

## 🎯 Objetivo
Asegurar que el sistema de login funcione correctamente en Vercel para permitir el acceso al portal administrativo.

## 🔧 Configuración Requerida

### 1. Variables de Entorno en Vercel

Configura estas variables en **Vercel Dashboard > Settings > Environment Variables**:

```bash
# Base de datos (REQUERIDA)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# NextAuth (REQUERIDA)
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"

# Entorno
NODE_ENV="production"
```

### 2. Generar NEXTAUTH_SECRET Seguro

```bash
# Opción 1: Usando OpenSSL
openssl rand -base64 32

# Opción 2: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Verificar Configuración

```bash
# Verificar configuración de login
npm run verify:login

# Probar configuración completa
npm run test:login
```

## 🚀 Pasos para Configurar

### Paso 1: Configurar Variables de Entorno

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings > Environment Variables**
3. Agrega las variables requeridas:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | URL de conexión a Supabase |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` | URL de tu aplicación en Vercel |
| `NEXTAUTH_SECRET` | `generated-secret` | Secret seguro generado |
| `NODE_ENV` | `production` | Entorno de producción |

### Paso 2: Verificar Base de Datos

```bash
# Verificar conexión a base de datos
npm run verify:db

# Configurar base de datos si es necesario
npm run setup:db
```

### Paso 3: Probar Login

```bash
# Verificar configuración de login
npm run verify:login

# Probar configuración completa
npm run test:login
```

### Paso 4: Desplegar

1. Haz commit de los cambios
2. Push a tu repositorio
3. Vercel detectará los cambios y redespelgará automáticamente

## 🔍 Verificación Post-Despliegue

### 1. Verificar URL de Login
- Ve a `https://tu-dominio.vercel.app/login`
- Deberías ver la página de login

### 2. Probar Login
- Usa credenciales de un usuario existente
- Verifica que redirija correctamente según el rol

### 3. Verificar Sesión
- Verifica que la sesión se mantenga
- Verifica que el logout funcione

## 🐛 Solución de Problemas

### Error: "NEXTAUTH_URL not found"
**Solución**: Configura `NEXTAUTH_URL` en Vercel con la URL completa de tu aplicación.

### Error: "Database connection failed"
**Solución**: 
1. Verifica que `DATABASE_URL` sea correcta
2. Verifica que la base de datos esté accesible
3. Ejecuta `npm run verify:db`

### Error: "Invalid credentials"
**Solución**:
1. Verifica que el usuario existe en la base de datos
2. Verifica que la contraseña sea correcta
3. Verifica que el usuario esté activo (`isActive: true`)

### Error: "Session not found"
**Solución**:
1. Verifica que `NEXTAUTH_SECRET` esté configurado
2. Verifica que las cookies estén funcionando
3. Verifica que `trustHost: true` esté en la configuración

## 📋 Checklist de Verificación

- [ ] `DATABASE_URL` configurada correctamente
- [ ] `NEXTAUTH_URL` configurada con HTTPS
- [ ] `NEXTAUTH_SECRET` generado y configurado
- [ ] Base de datos accesible
- [ ] Usuarios existentes en la base de datos
- [ ] Aplicación desplegada en Vercel
- [ ] Login funcional en producción
- [ ] Redirección por roles funcionando
- [ ] Sesión persistente
- [ ] Logout funcional

## 🎉 Resultado Esperado

Después de seguir estos pasos, deberías poder:

1. **Acceder al login**: `https://tu-dominio.vercel.app/login`
2. **Iniciar sesión**: Con credenciales válidas
3. **Ser redirigido**: Según el rol del usuario
4. **Mantener sesión**: Durante la navegación
5. **Cerrar sesión**: Funcionalmente

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Vercel
2. Ejecuta `npm run verify:login`
3. Verifica las variables de entorno
4. Revisa la configuración de la base de datos

## 🔄 Actualizaciones

Para futuras actualizaciones:

1. Mantén las variables de entorno actualizadas
2. Verifica que la base de datos esté sincronizada
3. Prueba el login después de cada despliegue
4. Monitorea los logs de Vercel para errores
