# Solución para Error de Migración de Base de Datos en Vercel

## Problema
Durante el despliegue en Vercel, se produce el error:
```
Error: Schema engine error:
FATAL: Tenant or user not found
```

## Causas Posibles

1. **Credenciales incorrectas**: El usuario o contraseña en `DATABASE_URL` no son válidos
2. **Base de datos no existe**: El nombre de la base de datos en la URL no existe
3. **Permisos insuficientes**: El usuario no tiene permisos para crear tablas
4. **Formato incorrecto de DATABASE_URL**: La URL no tiene el formato correcto
5. **Servidor de base de datos no accesible**: Problemas de conectividad

## Soluciones Implementadas

### 1. Script de Build Mejorado
- **Archivo**: `scripts/vercel-build.js`
- **Mejoras**:
  - Prueba de conexión antes de migrar
  - Mejor manejo de errores
  - Timeouts para evitar bloqueos
  - Mensajes de error más descriptivos

### 2. Script de Verificación de Base de Datos
- **Archivo**: `scripts/verify-database-config.js`
- **Uso**: `npm run verify:db`
- **Funciones**:
  - Valida formato de DATABASE_URL
  - Prueba conexión a la base de datos
  - Proporciona diagnósticos específicos

### 3. Script de Configuración de Producción
- **Archivo**: `scripts/setup-production-database.js`
- **Uso**: `npm run setup:db`
- **Funciones**:
  - Configuración completa de la base de datos
  - Migraciones con fallback a `db push`
  - Manejo robusto de errores

## Pasos para Solucionar

### Paso 1: Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Verifica que `DATABASE_URL` esté configurada correctamente

### Paso 2: Formato Correcto de DATABASE_URL

```bash
# Formato correcto para Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Formato correcto para PostgreSQL local
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Paso 3: Verificar Credenciales

1. **Para Supabase**:
   - Ve a tu proyecto en Supabase Dashboard
   - Ve a Settings > Database
   - Copia la Connection String correcta
   - Asegúrate de reemplazar `[YOUR-PASSWORD]` con tu contraseña real

2. **Para PostgreSQL local**:
   - Verifica que el usuario existe
   - Verifica que la base de datos existe
   - Verifica que el usuario tiene permisos

### Paso 4: Probar Localmente

```bash
# Verificar configuración
npm run verify:db

# Configurar base de datos
npm run setup:db
```

### Paso 5: Redesplegar en Vercel

1. Haz commit de los cambios
2. Push a tu repositorio
3. Vercel detectará los cambios y redespelgará automáticamente

## Scripts Disponibles

```bash
# Verificar configuración de base de datos
npm run verify:db

# Configurar base de datos de producción
npm run setup:db

# Build con manejo mejorado de errores
npm run vercel-build
```

## Monitoreo del Despliegue

Durante el próximo despliegue, verifica en los logs de Vercel:

1. ✅ **Conexión exitosa**: "Database connection successful"
2. ✅ **Migraciones exitosas**: "Migrations completed successfully"
3. ⚠️ **Advertencias**: El build continúa pero con limitaciones
4. ❌ **Errores**: El build falla y necesita corrección

## Solución de Problemas Específicos

### Error: "FATAL: password authentication failed"
- **Solución**: Verificar que la contraseña en DATABASE_URL es correcta

### Error: "FATAL: database does not exist"
- **Solución**: Verificar que el nombre de la base de datos es correcto

### Error: "FATAL: role does not exist"
- **Solución**: Verificar que el usuario existe en la base de datos

### Error: "connection timeout"
- **Solución**: Verificar conectividad de red y configuración de host/puerto

## Contacto

Si el problema persiste después de seguir estos pasos, revisa:
1. Los logs completos de Vercel
2. La configuración de tu proveedor de base de datos
3. Los permisos de red y firewall
