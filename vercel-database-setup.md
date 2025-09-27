# 🗄️ Configuración de Base de Datos en Vercel

## 🚨 Problema Actual
El error `Can't reach database server at 'localhost:'` indica que la aplicación está intentando conectarse a una base de datos local en lugar de usar la base de datos de Vercel.

## ✅ Solución Paso a Paso

### 1. **Crear Base de Datos en Vercel**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `sistema-web-administrativo-demo`
3. Ve a la pestaña **"Storage"**
4. Haz clic en **"Create Database"**
5. Selecciona **"PostgreSQL"**
6. Nombra tu base de datos: `sistema-web-db`
7. Haz clic en **"Create"**

### 2. **Configurar Variables de Entorno**

1. En tu proyecto de Vercel, ve a **"Settings"**
2. Selecciona **"Environment Variables"**
3. Agrega las siguientes variables:

```
DATABASE_URL = [URL que te proporciona Vercel]
NEXTAUTH_URL = https://sistema-web-administrativo-demo.vercel.app
NEXTAUTH_SECRET = tu-secret-key-aqui
```

### 3. **Configurar la Base de Datos**

Una vez que tengas la `DATABASE_URL` configurada:

1. Ve a: `https://sistema-web-administrativo-demo.vercel.app/api/setup-database`
2. Haz una petición POST (puedes usar Postman o curl)
3. Esto creará las tablas y datos iniciales

### 4. **Comando cURL para Configurar**

```bash
curl -X POST https://sistema-web-administrativo-demo.vercel.app/api/setup-database
```

## 🔧 Alternativa: Usar Base de Datos Externa

Si prefieres usar una base de datos externa:

### **Opción A: Supabase (Recomendado)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia la URL de conexión
5. Agrégala como `DATABASE_URL` en Vercel

### **Opción B: Railway**
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta
3. Crea un nuevo proyecto PostgreSQL
4. Copia la URL de conexión
5. Agrégala como `DATABASE_URL` en Vercel

## 📋 Credenciales que se Crearán

Una vez configurada la base de datos, tendrás acceso con:

- **👑 Administrador:** `admin@amestica.cl` / `admin123`
- **📝 Secretaria:** `secretaria@amestica.cl` / `secretaria123`
- **🔧 Técnico:** `tecnico@amestica.cl` / `tecnico123`

## 🚀 Verificación

Después de configurar todo:

1. Ve a `https://sistema-web-administrativo-demo.vercel.app/login`
2. Usa las credenciales de administrador
3. Deberías poder acceder al dashboard

## ❗ Notas Importantes

- La base de datos de Vercel es gratuita pero tiene límites
- Para producción, considera usar Supabase o Railway
- Asegúrate de que la `DATABASE_URL` esté configurada en todas las variables de entorno
