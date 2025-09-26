# 🔧 Solución Inmediata - Error de Base de Datos

## 🚨 Problema Actual
- Error: "Can't reach database server"
- La URL de Supabase no es válida o el proyecto no está activo

## ✅ Solución Rápida

### Paso 1: Crear Nueva Base de Datos en Supabase

1. **Ve a [supabase.com](https://supabase.com)**
2. **Inicia sesión** con tu cuenta
3. **Haz clic en "New project"**
4. **Configura el proyecto:**
   - **Name**: `SistemaWeb-Local`
   - **Database Password**: `sistemaweb2024` (guarda esta contraseña)
   - **Region**: `South America (São Paulo)` o la más cercana
5. **Haz clic en "Create new project"**
6. **Espera 2-3 minutos** a que se cree

### Paso 2: Obtener URL de Conexión

1. **Una vez creado**, ve a **Settings → Database**
2. **Busca "Connection string"**
3. **Copia la URL** (debe verse así):
   ```
   postgresql://postgres.sistemaweb:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### Paso 3: Actualizar .env.local

1. **Abre tu archivo `.env.local`**
2. **Reemplaza la línea `DATABASE_URL`** con la nueva URL
3. **Guarda el archivo**

### Paso 4: Probar la Conexión

```bash
npm run check:db
```

### Paso 5: Aplicar Migraciones

```bash
npm run db:push
```

### Paso 6: Reiniciar la Aplicación

```bash
# Detener el servidor (Ctrl+C)
# Luego iniciar de nuevo
npm run dev
```

## 🎯 Configuración Alternativa (Si Supabase no funciona)

### Opción A: Vercel Postgres
1. Ve a tu dashboard de Vercel
2. Storage → Postgres → Create Database
3. Copia la URL de conexión

### Opción B: PostgreSQL Local con Docker
```bash
# Ejecutar en terminal
docker run --name postgres-local -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sistemaweb_local -p 5432:5432 -d postgres:15

# URL para .env.local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/sistemaweb_local"
```

## ✅ Verificación Final

Una vez configurado correctamente:
- ✅ `npm run check:db` debe mostrar "Conexión exitosa"
- ✅ `npm run db:push` debe aplicar las migraciones
- ✅ `npm run dev` debe iniciar sin errores
- ✅ El login debe funcionar en http://localhost:3000

## 🆘 Si Sigues Teniendo Problemas

1. **Verifica que el proyecto de Supabase esté activo**
2. **Espera unos minutos** si acabas de crear el proyecto
3. **Verifica que la URL no tenga espacios extra**
4. **Reinicia el servidor** después de cambiar la configuración
